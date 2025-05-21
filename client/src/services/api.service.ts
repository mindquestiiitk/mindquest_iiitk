/**
 * API Service
 *
 * Production-ready API client with:
 * - Automatic token refresh
 * - Request/response interceptors
 * - Error handling
 * - CSRF protection
 * - Request timeout
 * - Request cancellation
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from "axios";
import { firebaseAuthService } from "./firebase-auth.service";
import { isNetworkOnline, queueOperation } from "../utils/offline-manager";
import { handleApiErrorWithRedirect } from "../utils/error-redirect";

// API base URL from environment with fallback
const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

// Log API URL in development to help with debugging
if (import.meta.env.DEV) {
  console.log(`🔌 API Service initialized with base URL: ${API_URL}`);
}

// Default request timeout (5 seconds)
const DEFAULT_TIMEOUT = 5000;

class ApiService {
  private api: AxiosInstance;
  private cancelTokens: Map<string, CancelTokenSource>;

  constructor() {
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: API_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: true, // Enable cookies for Firebase Auth
    });

    // Initialize cancel tokens map
    this.cancelTokens = new Map();

    // Set up request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Add request ID for tracing
        const requestId = `req-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        config.headers["X-Request-ID"] = requestId;

        // Add authentication token if available
        const token = await firebaseAuthService.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Firebase Authentication already provides protection against CSRF
        // Just ensure credentials are included for cookies
        config.withCredentials = true;

        // Add a timestamp for request tracking
        config.headers["X-Request-Timestamp"] = Date.now().toString();

        // Create cancel token
        const source = axios.CancelToken.source();
        config.cancelToken = source.token;

        // Store cancel token with request ID
        if (config.url) {
          this.cancelTokens.set(config.url, source);
        }

        // Log request in development
        if (import.meta.env.DEV) {
          console.log(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
            {
              headers: config.headers,
              data: config.data,
              params: config.params,
            }
          );
        }

        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Set up response interceptor
    this.api.interceptors.response.use(
      (response) => {
        // Clean up cancel token
        if (response.config.url) {
          this.cancelTokens.delete(response.config.url);
        }

        // Log response in development
        if (import.meta.env.DEV) {
          console.log(
            `✅ API Response: ${response.config.method?.toUpperCase()} ${
              response.config.url
            }`,
            {
              status: response.status,
              data: response.data,
            }
          );
        }

        return response;
      },
      async (error) => {
        // Clean up cancel token
        if (error.config?.url) {
          this.cancelTokens.delete(error.config.url);
        }

        // Handle canceled requests
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
          return Promise.reject(error);
        }

        // Log error in development
        if (import.meta.env.DEV) {
          console.error(
            `❌ API Error: ${error.config?.method?.toUpperCase()} ${
              error.config?.url
            }`,
            {
              status: error.response?.status,
              data: error.response?.data,
              message: error.message,
            }
          );
        }

        // Handle token expiration (401 errors)
        if (
          error.response?.status === 401 &&
          error.config &&
          !error.config._retry &&
          error.response?.data?.error?.code !== "invalid_credentials" // Don't retry for invalid credentials
        ) {
          error.config._retry = true;
          console.log("Received 401 error, attempting to refresh token");

          try {
            // Force refresh the token with multiple retries
            let retries = 3;
            let newToken = null;

            while (retries > 0 && !newToken) {
              try {
                console.log(
                  `Attempting to refresh token (retries left: ${retries})`
                );
                newToken = await firebaseAuthService.getIdToken(true);

                if (newToken) {
                  console.log("Successfully refreshed token");
                  break;
                }

                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, 1000));
              } catch (innerError) {
                console.warn(
                  `Token refresh attempt failed (retries left: ${retries})`,
                  innerError
                );
                retries--;

                // Wait longer before retrying
                await new Promise((resolve) => setTimeout(resolve, 1500));
              }
            }

            if (newToken) {
              // Update the token in the request and retry
              console.log("Retrying request with new token");
              error.config.headers.Authorization = `Bearer ${newToken}`;

              // Also store the token in a cookie as fallback for the backend
              document.cookie = `token=${newToken}; path=/; max-age=3600; SameSite=Strict`;

              return this.api(error.config);
            } else {
              console.error("Failed to refresh token after multiple attempts");
              throw new Error("Failed to refresh authentication token");
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);

            // If refresh fails, sign out and redirect to login
            try {
              await firebaseAuthService.signOut();
            } catch (signOutError) {
              console.error("Error during sign out:", signOutError);
            }

            // Add a more descriptive error message
            window.location.href =
              "/login?error=session_expired&message=Your session has expired. Please log in again.";

            return Promise.reject(error);
          }
        }

        // CSRF protection is handled by Firebase Authentication

        // Handle permission errors (403)
        if (error.response?.status === 403) {
          // Check if user is trying to access admin resources
          const isAdminRoute =
            error.config?.url?.includes("/admin") ||
            error.config?.url?.includes("/superadmin");

          if (isAdminRoute) {
            // Enhance error with more descriptive message
            error.response.data = error.response.data || {};
            error.response.data.error = error.response.data.error || {};
            error.response.data.error.message =
              "You don't have permission to access this administrative feature.";
            error.response.data.error.code = "admin_required";
          }
        }

        // Handle not found errors (404)
        if (error.response?.status === 404) {
          error.response.data = error.response.data || {};
          error.response.data.error = error.response.data.error || {};

          // If no specific message, provide a more helpful one
          if (!error.response.data.error.message) {
            error.response.data.error.message =
              "The requested resource could not be found.";
            error.response.data.error.code = "not_found";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   * Supports offline queueing for write operations
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { queueOffline?: boolean }
  ): Promise<T> {
    // Default to queueing offline for write operations
    const shouldQueue = config?.queueOffline !== false;

    // If offline and should queue, add to offline queue
    if (!isNetworkOnline() && shouldQueue) {
      return queueOperation(
        () => this.post(url, data, { ...config, queueOffline: false }),
        { id: `post_${url}_${Date.now()}` }
      ) as Promise<T>;
    }

    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   * Supports offline queueing for write operations
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { queueOffline?: boolean }
  ): Promise<T> {
    // Default to queueing offline for write operations
    const shouldQueue = config?.queueOffline !== false;

    // If offline and should queue, add to offline queue
    if (!isNetworkOnline() && shouldQueue) {
      return queueOperation(
        () => this.put(url, data, { ...config, queueOffline: false }),
        { id: `put_${url}_${Date.now()}` }
      ) as Promise<T>;
    }

    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   * Supports offline queueing for write operations
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig & { queueOffline?: boolean }
  ): Promise<T> {
    // Default to queueing offline for write operations
    const shouldQueue = config?.queueOffline !== false;

    // If offline and should queue, add to offline queue
    if (!isNetworkOnline() && shouldQueue) {
      return queueOperation(
        () => this.delete(url, { ...config, queueOffline: false }),
        { id: `delete_${url}_${Date.now()}` }
      ) as Promise<T>;
    }

    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  /**
   * Cancel a request
   */
  cancelRequest(url: string): void {
    const source = this.cancelTokens.get(url);
    if (source) {
      source.cancel(`Request to ${url} canceled`);
      this.cancelTokens.delete(url);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.cancelTokens.forEach((source, url) => {
      source.cancel(`Request to ${url} canceled`);
    });
    this.cancelTokens.clear();
  }

  /**
   * Create a request handler that redirects to error pages on failure
   * This is useful for critical API calls where we want to show a full error page
   * rather than just an error message
   *
   * @param navigate - React Router's navigate function
   * @param apiCall - The API call function to execute
   * @returns A function that executes the API call and handles errors with redirects
   */
  withErrorRedirect<T, Args extends any[]>(
    navigate: any,
    apiCall: (...args: Args) => Promise<T>
  ): (...args: Args) => Promise<T | null> {
    return async (...args: Args): Promise<T | null> => {
      try {
        return await apiCall(...args);
      } catch (error) {
        // Handle the error with redirect
        handleApiErrorWithRedirect(navigate, error);
        return null;
      }
    };
  }
}

export const apiService = new ApiService();

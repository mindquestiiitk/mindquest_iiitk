import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Loading state management
let activeRequests = 0;
export const loadingState = {
  increment: () => {
    activeRequests++;
    document.body.classList.add("loading");
  },
  decrement: () => {
    activeRequests--;
    if (activeRequests === 0) {
      document.body.classList.remove("loading");
    }
  },
};

// Request interceptor
export const requestInterceptor = async (config: any) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor
export const responseInterceptor = async (response: any) => {
  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }
  return response;
};

// Create axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(requestInterceptor);
axiosInstance.interceptors.response.use(responseInterceptor);

// Fetch wrapper with interceptors
export const fetchWithInterceptors = async (
  url: string,
  options: RequestInit = {}
) => {
  try {
    loadingState.increment();

    // Get token from localStorage
    const token = localStorage.getItem("auth_token");

    // Add Authorization header if token exists
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
      throw new Error("Session expired. Please login again.");
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  } finally {
    loadingState.decrement();
  }
};

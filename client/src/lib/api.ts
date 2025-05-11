// Define types for API responses
export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    uid: string;
    email: string;
    role: string;
    name?: string;
    picture?: string;
  };
  message?: string;
  error?: string;
}

export interface UserResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

import { fetchWithInterceptors } from "./apiInterceptors.ts";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "An error occurred");
  }
  return response.json();
};

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const response = await fetchWithInterceptors(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await handleResponse<AuthResponse>(response);
      if (data.success && data.data.token) {
        localStorage.setItem("auth_token", data.data.token);
      }
      return data;
    },

    register: async (
      email: string,
      password: string
    ): Promise<AuthResponse> => {
      const response = await fetchWithInterceptors(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await handleResponse<AuthResponse>(response);
      if (data.success && data.data.token) {
        localStorage.setItem("auth_token", data.data.token);
      }
      return data;
    },

    getCurrentUser: async (): Promise<UserResponse> => {
      const response = await fetchWithInterceptors(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      return handleResponse<UserResponse>(response);
    },

    validateToken: async (token: string): Promise<AuthResponse> => {
      const response = await fetchWithInterceptors(
        `${API_BASE_URL}/auth/validate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      return handleResponse<AuthResponse>(response);
    },

    googleLogin: async (token: string): Promise<AuthResponse> => {
      const response = await fetchWithInterceptors(
        `${API_BASE_URL}/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ idToken: token }),
        }
      );
      const data = await handleResponse<AuthResponse>(response);
      if (data.success && data.data.token) {
        localStorage.setItem("auth_token", data.data.token);
      }
      return data;
    },

    logout: async (): Promise<void> => {
      localStorage.removeItem("auth_token");
      await fetchWithInterceptors(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    },
  },

  health: {
    check: async () => {
      const response = await fetchWithInterceptors(`${API_BASE_URL}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return handleResponse<{
        message: string;
        status: string;
        timestamp: string;
        version?: string;
        environment?: string;
        services?: {
          database: string;
          authentication: string;
        };
      }>(response);
    },
  },
};

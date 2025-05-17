/**
 * API Types
 *
 * This file exports types for API responses and a reference to the apiService
 * from services/api.service.ts, which is the production-ready implementation.
 */

import { apiService } from "../services/api.service";

// Define common API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Re-export the apiService as api for backward compatibility
export const api = {
  health: {
    check: async () => {
      return apiService.get("/health");
    },
  },
};

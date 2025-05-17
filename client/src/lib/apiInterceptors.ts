/**
 * API Interceptors - DEPRECATED
 *
 * This file is deprecated and should not be used.
 * Use the apiService from services/api.service.ts instead,
 * which provides a production-ready implementation with proper
 * interceptors, error handling, and token management.
 */

import { apiService } from "../services/api.service";

// Re-export loading state for backward compatibility
export const loadingState = {
  increment: () => {
    document.body.classList.add("loading");
  },
  decrement: () => {
    document.body.classList.remove("loading");
  },
};

// Deprecated - use apiService instead
export const fetchWithInterceptors = async (
  url: string,
  options: RequestInit = {}
) => {
  console.warn(
    "fetchWithInterceptors is deprecated. Use apiService from services/api.service.ts instead."
  );

  try {
    loadingState.increment();

    // Extract the path from the URL
    const path = url.replace(/^(https?:\/\/[^/]+)?\/?/, "/");

    // Determine the method
    const method = options.method?.toLowerCase() || "get";

    // Extract the body if it exists
    let body = undefined;
    if (options.body && typeof options.body === "string") {
      try {
        body = JSON.parse(options.body);
      } catch (e) {
        console.error("Could not parse request body as JSON");
      }
    }

    // Call the appropriate method on apiService
    let response;
    switch (method) {
      case "get":
        response = await apiService.get(path);
        break;
      case "post":
        response = await apiService.post(path, body);
        break;
      case "put":
        response = await apiService.put(path, body);
        break;
      case "delete":
        response = await apiService.delete(path);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    // Convert the response to a fetch-like Response object
    return {
      ok: true,
      status: 200,
      json: async () => response,
      headers: {
        get: () => null,
      },
    } as unknown as Response;
  } catch (error) {
    console.error("API error:", error);
    throw error;
  } finally {
    loadingState.decrement();
  }
};

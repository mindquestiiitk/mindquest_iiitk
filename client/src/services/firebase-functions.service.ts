/**
 * Firebase Functions Service
 *
 *  Firebase Functions client with:
 * - Type-safe function calls
 * - Error handling
 * - Retry logic
 * - Logging
 * - Analytics integration
 */

import {
  getFunctions,
  httpsCallable,
  HttpsCallableResult,
} from "firebase/functions";
import { functions } from "../config/firebase";
import { logAnalyticsEvent } from "../config/firebase";

// Default timeout for function calls (30 seconds)
const DEFAULT_TIMEOUT = 30000;

// Maximum number of retries
const MAX_RETRIES = 3;

// Base delay for exponential backoff (in milliseconds)
const BASE_DELAY = 1000;

/**
 * Generic type for function parameters
 */
type FunctionParams<T = any> = T;

/**
 * Generic type for function result
 */
type FunctionResult<T = any> = T;

/**
 * Options for function calls
 */
interface FunctionOptions {
  timeout?: number;
  maxRetries?: number;
  baseDelay?: number;
  analyticsEvent?: string;
  analyticsParams?: Record<string, any>;
}

/**
 * Firebase Functions Service
 */
class FirebaseFunctionsService {
  /**
   * Call a Firebase Function with type safety and error handling
   * @param functionName Name of the Firebase Function to call
   * @param params Parameters to pass to the function
   * @param options Options for the function call
   * @returns Result of the function call
   */
  async callFunction<TParams = any, TResult = any>(
    functionName: string,
    params?: FunctionParams<TParams>,
    options?: FunctionOptions
  ): Promise<FunctionResult<TResult>> {
    const timeout = options?.timeout || DEFAULT_TIMEOUT;
    const maxRetries = options?.maxRetries || MAX_RETRIES;
    const baseDelay = options?.baseDelay || BASE_DELAY;

    // Log analytics event if specified
    if (options?.analyticsEvent) {
      logAnalyticsEvent(options.analyticsEvent, {
        functionName,
        ...options.analyticsParams,
      });
    }

    // Create a function reference
    const functionRef = httpsCallable<TParams, TResult>(
      functions,
      functionName,
      { timeout }
    );

    // Call the function with retry logic
    return this.callWithRetry(
      () => functionRef(params || ({} as TParams)),
      maxRetries,
      baseDelay,
      functionName
    );
  }

  /**
   * Call a function with retry logic
   * @param fn Function to call
   * @param maxRetries Maximum number of retries
   * @param baseDelay Base delay for exponential backoff
   * @param functionName Name of the function (for logging)
   * @returns Result of the function call
   */
  private async callWithRetry<T>(
    fn: () => Promise<HttpsCallableResult<T>>,
    maxRetries: number,
    baseDelay: number,
    functionName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Call the function
        const result = await fn();

        // Log success
        if (attempt > 0) {
          console.log(
            `Function ${functionName} succeeded after ${attempt} retries`
          );
        }

        // Return the result data
        return result.data;
      } catch (error) {
        lastError = error as Error;

        // Log the error
        console.error(
          `Error calling function ${functionName} (attempt ${attempt + 1}/${
            maxRetries + 1
          }):`,
          error
        );

        // Check if we should retry
        if (attempt < maxRetries && this.isRetryableError(error)) {
          // Calculate delay with exponential backoff and jitter
          const delay = Math.min(
            baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
            30000 // Max 30 seconds
          );

          console.log(
            `Retrying function ${functionName} in ${Math.round(delay)}ms...`
          );

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // No more retries or non-retryable error
          break;
        }
      }
    }

    // If we get here, all retries failed
    throw (
      lastError ||
      new Error(`Function ${functionName} failed after ${maxRetries} retries`)
    );
  }

  /**
   * Check if an error is retryable
   * @param error Error to check
   * @returns Whether the error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error.name === "FirebaseError") {
      // Firebase error codes that are retryable
      const retryableCodes = [
        "deadline-exceeded",
        "unavailable",
        "internal",
        "resource-exhausted",
      ];

      return retryableCodes.includes(error.code);
    }

    // Other network errors
    return (
      error.message?.includes("network") ||
      error.message?.includes("timeout") ||
      error.message?.includes("connection")
    );
  }
}

export const firebaseFunctionsService = new FirebaseFunctionsService();

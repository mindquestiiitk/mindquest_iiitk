/**
 * Arcjet Client for Frontend Protection
 *
 * In a production environment, Arcjet protection is primarily handled by the backend.
 * This client-side service provides an additional layer of protection and
 * communicates with the backend Arcjet implementation.
 *
 * Production-ready implementation with:
 * - Enhanced device fingerprinting
 * - Proper error handling with fallbacks
 * - Analytics integration for monitoring
 * - Retry mechanisms for resilience
 * - Caching for performance
 */
import { logAnalyticsEvent } from "../config/firebase";
import { firebaseFunctionsService } from "./firebase-functions.service";

interface ArcjetProtectionOptions {
  email?: string;
  ip?: string;
  rules?: string[];
  action?: string;
  formId?: string;
}

interface ArcjetProtectionResult {
  allowed: boolean;
  type: string;
  reason: string;
  isDenied: () => boolean;
  ruleId?: string;
}

// Simple in-memory cache for rate limiting on the client side
// This helps prevent excessive API calls
interface CacheEntry {
  result: ArcjetProtectionResult;
  timestamp: number;
  expiresAt: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 10000; // 10 seconds cache TTL
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// For production, we use the backend API to handle Arcjet protection
// This provides a secure way to implement protection without exposing API keys
const arcjetClient = {
  /**
   * Get enhanced device fingerprint for better security
   */
  getDeviceFingerprint: () => {
    try {
      // Collect as much device information as possible for better fingerprinting
      return {
        // Basic device info
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: Array.from(navigator.languages || []),
        platform: navigator.platform,

        // Screen properties
        screenSize: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio,

        // Time and locale information
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),

        // Browser capabilities
        cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,

        // Connection information (if available)
        connectionType: (navigator as any).connection?.type,
        effectiveType: (navigator as any).connection?.effectiveType,

        // Canvas fingerprint (hash only, not the actual data)
        canvasHash: getCanvasFingerprint(),

        // Session information
        sessionStart:
          sessionStorage.getItem("sessionStart") ||
          (() => {
            const now = Date.now().toString();
            sessionStorage.setItem("sessionStart", now);
            return now;
          })(),
      };
    } catch (error) {
      console.warn("Error generating device fingerprint:", error);
      // Return basic fingerprint if advanced fingerprinting fails
      return {
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      };
    }
  },

  /**
   * Create a cache key from protection options
   */
  createCacheKey: (options: ArcjetProtectionOptions): string => {
    return `${options.action}-${options.email || ""}-${options.formId || ""}`;
  },

  /**
   * Check if a cached result exists and is still valid
   */
  getCachedResult: (
    options: ArcjetProtectionOptions
  ): ArcjetProtectionResult | null => {
    const key = arcjetClient.createCacheKey(options);
    const entry = cache[key];

    if (entry && Date.now() < entry.expiresAt) {
      return entry.result;
    }

    return null;
  },

  /**
   * Cache a protection result
   */
  cacheResult: (
    options: ArcjetProtectionOptions,
    result: ArcjetProtectionResult
  ): void => {
    const key = arcjetClient.createCacheKey(options);
    const now = Date.now();

    cache[key] = {
      result,
      timestamp: now,
      expiresAt: now + CACHE_TTL,
    };

    // Clean up expired cache entries
    Object.keys(cache).forEach((k) => {
      if (cache[k].expiresAt < now) {
        delete cache[k];
      }
    });
  },

  /**
   * Main protection method with retries and caching
   */
  protect: async (
    options: ArcjetProtectionOptions
  ): Promise<ArcjetProtectionResult> => {
    try {
      // Check cache first to avoid unnecessary API calls
      const cachedResult = arcjetClient.getCachedResult(options);
      if (cachedResult) {
        return cachedResult;
      }

      // Get enhanced device fingerprint
      const fingerprint = arcjetClient.getDeviceFingerprint();

      // Log the protection attempt for analytics
      logAnalyticsEvent("arcjet_protection_attempt", {
        action: options.action,
        timestamp: new Date().toISOString(),
      });

      // Implement retry logic for resilience
      let lastError: any = null;
      let retryCount = 0;

      while (retryCount <= MAX_RETRIES) {
        try {
          // First try the backend proxy
          const apiUrl =
            import.meta.env.VITE_BACKEND_URL ||
            import.meta.env.VITE_API_URL ||
            "http://localhost:3000";
          const response = await fetch(`${apiUrl}/api/arcjet-protect`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Client-Version": import.meta.env.VITE_APP_VERSION || "unknown",
              "X-Request-ID": generateRequestId(),
            },
            body: JSON.stringify({
              options,
              fingerprint,
              timestamp: new Date().toISOString(),
              retryCount,
            }),
            credentials: "include",
            mode: "cors",
            // Reduce timeout to prevent hanging requests
            signal: AbortSignal.timeout(5000), // 5 second timeout
          });

          if (response.ok) {
            const responseData = await response.json();

            // Create a proper result object with the isDenied method
            const result: ArcjetProtectionResult = {
              allowed: responseData.allowed ?? true,
              type: responseData.type || "api",
              reason: responseData.reason || "Success",
              ruleId: responseData.ruleId,
              isDenied: () => responseData.isDenied === true,
            };

            // Cache the result
            arcjetClient.cacheResult(options, result);

            return result;
          } else {
            // Handle non-200 responses
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              `API error: ${response.status} - ${
                errorData.error || response.statusText
              }`
            );
          }
        } catch (error) {
          lastError = error;
          retryCount++;

          if (retryCount <= MAX_RETRIES) {
            // Wait before retrying (with exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAY * retryCount)
            );
            console.warn(
              `Arcjet protection retry ${retryCount}/${MAX_RETRIES}`
            );
          }
        }
      }

      // All retries failed, use fallback
      console.warn(
        "All Arcjet protection retries failed, using fallback",
        lastError
      );

      // Create a fallback result
      const fallbackResult: ArcjetProtectionResult = {
        allowed: true, // Fail open to avoid blocking legitimate users
        type: "fallback",
        reason: "Using fallback implementation after retries",
        isDenied: () => false,
      };

      // Cache the fallback result (with shorter TTL)
      arcjetClient.cacheResult(options, fallbackResult);

      // Log the fallback for monitoring
      logAnalyticsEvent("arcjet_protection_fallback", {
        action: options.action,
        error:
          lastError instanceof Error ? lastError.message : String(lastError),
        timestamp: new Date().toISOString(),
      });

      return fallbackResult;
    } catch (error) {
      console.error("Arcjet client error:", error);

      // In production, we fail open to avoid blocking legitimate users
      logAnalyticsEvent("arcjet_protection_error", {
        action: options.action,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });

      return {
        allowed: true,
        type: "error",
        reason: "Error in client-side protection",
        isDenied: () => false,
      };
    }
  },
};

/**
 * Generate a canvas fingerprint hash
 * This provides an additional signal for device fingerprinting
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Set canvas size
    canvas.width = 200;
    canvas.height = 50;

    // Draw background
    ctx.fillStyle = "#f60";
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = "#069";
    ctx.font = "15px Arial";
    ctx.fillText("Fingerprint", 10, 25);

    // Add some shapes for more entropy
    ctx.strokeStyle = "#0f0";
    ctx.beginPath();
    ctx.arc(100, 25, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Get the data URL and hash it
    const dataUrl = canvas.toDataURL();

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < dataUrl.length; i++) {
      hash = (hash << 5) - hash + dataUrl.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return hash.toString(16);
  } catch (error) {
    console.warn("Canvas fingerprinting not supported:", error);
    return "";
  }
}

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return (
    "req-" +
    Date.now().toString() +
    "-" +
    Math.random().toString(36).substring(2, 10)
  );
}

/**
 * Arcjet service for frontend protection
 *
 * Production-ready implementation with:
 * - Comprehensive protection for all authentication flows
 * - Proper error handling with user-friendly messages
 * - Analytics integration for security monitoring
 * - Consistent protection patterns across all methods
 */
class ArcjetService {
  /**
   * Protect authentication attempts
   * @param email The email being used for authentication
   * @param ip The IP address of the client (if available)
   */
  async protectAuth(email: string, ip?: string) {
    try {
      // Track authentication attempt for analytics
      logAnalyticsEvent("auth_attempt", {
        timestamp: new Date().toISOString(),
      });

      // Validate email domain first
      if (!email.toLowerCase().endsWith("@iiitkottayam.ac.in")) {
        throw new Error(
          "Authentication blocked: Only email addresses from iiitkottayam.ac.in domain are allowed."
        );
      }

      const result = await arcjetClient.protect({
        email,
        ip,
        rules: ["rate-limit", "bot-detection", "email-validation"],
        action: "authentication",
      });

      // Check if protection denied the request
      if (typeof result.isDenied === "function" && result.isDenied()) {
        // Log blocked authentication for security monitoring
        logAnalyticsEvent("auth_blocked", {
          reason: result.reason,
          ruleId: result.ruleId,
          timestamp: new Date().toISOString(),
        });

        throw new Error(`Authentication blocked: ${result.reason}`);
      } else if (result.allowed === false) {
        // Fallback check if isDenied is not a function
        logAnalyticsEvent("auth_blocked", {
          reason: result.reason,
          ruleId: result.ruleId,
          timestamp: new Date().toISOString(),
        });

        throw new Error(`Authentication blocked: ${result.reason}`);
      }

      return result;
    } catch (error) {
      // Only log errors that aren't already handled blocked requests
      if (!error.message?.includes("blocked")) {
        console.error("Arcjet authentication protection error:", error);

        // Log error for monitoring
        logAnalyticsEvent("arcjet_auth_error", {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }

      // In production, we need to rethrow authentication blocks
      // but allow technical errors to proceed
      if (error.message?.includes("blocked")) {
        throw error;
      }

      // For technical errors, fail open to avoid blocking legitimate users
      return {
        allowed: true,
        type: "error",
        reason: "Arcjet protection error",
        isDenied: () => false,
      };
    }
  }

  /**
   * Protect registration attempts
   * @param email The email being used for registration
   * @param ip The IP address of the client (if available)
   */
  async protectRegistration(email: string, ip?: string) {
    try {
      // Track registration attempt for analytics
      logAnalyticsEvent("registration_attempt", {
        timestamp: new Date().toISOString(),
      });

      const result = await arcjetClient.protect({
        email,
        ip,
        rules: ["rate-limit", "bot-detection", "email-validation"],
        action: "registration",
      });

      if (result.isDenied()) {
        // Log blocked registration for security monitoring
        logAnalyticsEvent("registration_blocked", {
          reason: result.reason,
          ruleId: result.ruleId,
          timestamp: new Date().toISOString(),
        });

        // Check for specific email domain validation failures
        if (
          result.reason?.includes("email") ||
          result.ruleId?.includes("email")
        ) {
          throw new Error(
            `Registration blocked: Only email addresses from iiitkottayam.ac.in domain are allowed.`
          );
        }

        throw new Error(`Registration blocked: ${result.reason}`);
      }

      return result;
    } catch (error) {
      // Only log errors that aren't already handled blocked requests
      if (!error.message?.includes("blocked")) {
        console.error("Arcjet registration protection error:", error);

        // Log error for monitoring
        logAnalyticsEvent("arcjet_registration_error", {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }

      // In production, we need to rethrow registration blocks
      // but allow technical errors to proceed
      if (error.message?.includes("blocked")) {
        throw error;
      }

      // For technical errors, fail open to avoid blocking legitimate users
      return {
        allowed: true,
        type: "error",
        reason: "Arcjet protection error",
        isDenied: () => false,
      };
    }
  }

  /**
   * Protect password reset attempts
   * @param email The email being used for password reset
   * @param ip The IP address of the client (if available)
   */
  async protectPasswordReset(email: string, ip?: string) {
    try {
      // Track password reset attempt for analytics
      logAnalyticsEvent("password_reset_attempt", {
        timestamp: new Date().toISOString(),
      });

      // Validate email domain first
      if (!email.toLowerCase().endsWith("@iiitkottayam.ac.in")) {
        throw new Error(
          "Password reset blocked: Only email addresses from iiitkottayam.ac.in domain are allowed."
        );
      }

      const result = await arcjetClient.protect({
        email,
        ip,
        rules: ["rate-limit", "bot-detection", "email-validation"],
        action: "password-reset",
      });

      if (result.isDenied()) {
        // Log blocked password reset for security monitoring
        logAnalyticsEvent("password_reset_blocked", {
          reason: result.reason,
          ruleId: result.ruleId,
          timestamp: new Date().toISOString(),
        });

        throw new Error(`Password reset blocked: ${result.reason}`);
      }

      return result;
    } catch (error) {
      // Only log errors that aren't already handled blocked requests
      if (!error.message?.includes("blocked")) {
        console.error("Arcjet password reset protection error:", error);

        // Log error for monitoring
        logAnalyticsEvent("arcjet_password_reset_error", {
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }

      // In production, we need to rethrow password reset blocks
      // but allow technical errors to proceed
      if (error.message?.includes("blocked")) {
        throw error;
      }

      // For technical errors, fail open to avoid blocking legitimate users
      return {
        allowed: true,
        type: "error",
        reason: "Arcjet protection error",
        isDenied: () => false,
      };
    }
  }

  /**
   * Protect form submissions
   * @param formId Identifier for the form being submitted
   * @param ip The IP address of the client (if available)
   */
  async protectFormSubmission(formId: string, ip?: string) {
    try {
      // Track form submission attempt for analytics
      logAnalyticsEvent("form_submission_attempt", {
        formId,
        timestamp: new Date().toISOString(),
      });

      const result = await arcjetClient.protect({
        formId,
        ip,
        rules: ["rate-limit", "bot-detection"],
        action: "form-submission",
      });

      if (result.isDenied()) {
        // Log blocked form submission for security monitoring
        logAnalyticsEvent("form_submission_blocked", {
          formId,
          reason: result.reason,
          ruleId: result.ruleId,
          timestamp: new Date().toISOString(),
        });

        throw new Error(`Form submission blocked: ${result.reason}`);
      }

      return result;
    } catch (error) {
      // Only log errors that aren't already handled blocked requests
      if (!error.message?.includes("blocked")) {
        console.error("Arcjet form submission protection error:", error);

        // Log error for monitoring
        logAnalyticsEvent("arcjet_form_submission_error", {
          formId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }

      // In production, we need to rethrow form submission blocks
      // but allow technical errors to proceed
      if (error.message?.includes("blocked")) {
        throw error;
      }

      // For technical errors, fail open to avoid blocking legitimate users
      return {
        allowed: true,
        type: "error",
        reason: "Arcjet protection error",
        isDenied: () => false,
      };
    }
  }

  /**
   * Protect social authentication attempts
   * @param provider The social provider being used (e.g., 'google', 'facebook')
   * @param ip The IP address of the client (if available)
   */
  async protectSocialAuth(provider: string, ip?: string) {
    try {
      // Track social authentication attempt for analytics
      logAnalyticsEvent("social_auth_attempt", {
        provider,
        timestamp: new Date().toISOString(),
      });

      // Note: For social auth, we can't validate the email domain before the auth flow
      // The domain will be validated after the user authenticates with the provider
      // in the FirebaseAuthContext.tsx loginWithGoogle method

      const result = await arcjetClient.protect({
        ip,
        rules: ["rate-limit", "bot-detection", "email-validation"],
        action: `social-auth-${provider}`,
      });

      // Check if protection denied the request
      if (typeof result.isDenied === "function" && result.isDenied()) {
        // Log blocked social authentication for security monitoring
        logAnalyticsEvent("social_auth_blocked", {
          provider,
          reason: result.reason,
          ruleId: result.ruleId,
          timestamp: new Date().toISOString(),
        });

        throw new Error(`Social authentication blocked: ${result.reason}`);
      } else if (result.allowed === false) {
        // Fallback check if isDenied is not a function
        logAnalyticsEvent("social_auth_blocked", {
          provider,
          reason: result.reason,
          ruleId: result.ruleId,
          timestamp: new Date().toISOString(),
        });

        throw new Error(`Social authentication blocked: ${result.reason}`);
      }

      return result;
    } catch (error) {
      // Only log errors that aren't already handled blocked requests
      if (!error.message?.includes("blocked")) {
        console.error("Arcjet social auth protection error:", error);

        // Log error for monitoring
        logAnalyticsEvent("arcjet_social_auth_error", {
          provider,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }

      // In production, we need to rethrow social authentication blocks
      // but allow technical errors to proceed
      if (error.message?.includes("blocked")) {
        throw error;
      }

      // For technical errors, fail open to avoid blocking legitimate users
      return {
        allowed: true,
        type: "error",
        reason: "Arcjet protection error",
        isDenied: () => false,
      };
    }
  }

  /**
   * Get client IP address (if available)
   * Note: In a browser environment, we can't reliably get the client IP
   * This will be determined by the server
   */
  getClientIP(): string | undefined {
    return undefined;
  }

  /**
   * Check if the current environment is development
   */
  isDevelopment(): boolean {
    return import.meta.env.DEV === true;
  }

  /**
   * Get the current Arcjet configuration
   */
  getConfig() {
    return {
      enabled: true,
      mode: this.isDevelopment() ? "development" : "production",
      apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
      version: import.meta.env.VITE_APP_VERSION || "unknown",
    };
  }
}

export const arcjetService = new ArcjetService();

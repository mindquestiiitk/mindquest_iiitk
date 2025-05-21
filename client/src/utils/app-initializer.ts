/**
 * App Initializer
 *
 * Handles initialization tasks for the application:
 * - Setting up global error handlers
 * - Initializing monitoring and analytics
 * - Setting up performance tracking
 * - Configuring error reporting
 * - Initializing Firebase authentication
 *
 * Note: Firebase authentication already provides CSRF protection
 */

import { performance, logAnalyticsEvent, auth } from "../config/firebase";
import { initOfflineManager } from "./offline-manager";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Initialize the application
 */
export const initializeApp = async (): Promise<void> => {
  try {
    // Set up global error handler
    setupGlobalErrorHandler();

    // Initialize offline manager
    initOfflineManager();

    // Initialize Firebase authentication
    await initializeAuth();

    // Initialize performance monitoring
    if (performance) {
      // Log performance metrics
      logPerformanceMetrics();
    }

    // Log app start event
    logAnalyticsEvent("app_initialized", {
      timestamp: new Date().toISOString(),
      screen_resolution: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      // Use a more modern approach than the deprecated navigator.platform
      user_agent: navigator.userAgent,
      is_online: navigator.onLine,
    });

    // Log initialization success
    console.log("App initialized successfully");
  } catch (error) {
    console.error("Error initializing app:", error);

    // Log initialization error
    logAnalyticsEvent("app_initialization_error", {
      error_message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Log performance metrics for monitoring
 */
const logPerformanceMetrics = (): void => {
  // Use Web Vitals API if available
  if (
    typeof window !== "undefined" &&
    window.performance &&
    "getEntriesByType" in window.performance
  ) {
    try {
      // Log navigation timing metrics
      const entries = window.performance.getEntriesByType("navigation");
      if (entries && entries.length > 0) {
        const navEntry = entries[0] as PerformanceNavigationTiming;

        logAnalyticsEvent("performance_metrics", {
          dns_time: Math.round(
            navEntry.domainLookupEnd - navEntry.domainLookupStart
          ),
          connection_time: Math.round(
            navEntry.connectEnd - navEntry.connectStart
          ),
          ttfb: Math.round(navEntry.responseStart - navEntry.requestStart),
          dom_load: Math.round(navEntry.domComplete - navEntry.domInteractive),
          load_time: Math.round(
            navEntry.loadEventEnd - navEntry.loadEventStart
          ),
          total_page_load: Math.round(
            navEntry.loadEventEnd - navEntry.startTime
          ),
        });
      }
    } catch (error) {
      console.error("Error logging performance metrics:", error);
    }
  }
};

/**
 * Initialize Firebase authentication
 * @returns Promise that resolves when authentication is initialized
 */
const initializeAuth = (): Promise<void> => {
  return new Promise((resolve) => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in");

        // Log sign-in to analytics
        logAnalyticsEvent("user_signed_in", {
          method: user.providerData[0]?.providerId || "unknown",
          timestamp: new Date().toISOString(),
        });
      } else {
        console.log("No user is signed in");
      }

      // Unsubscribe from the listener
      unsubscribe();

      // Resolve the promise
      resolve();
    });

    // Set a timeout to resolve the promise if auth takes too long
    setTimeout(() => {
      console.warn("Auth initialization timed out");
      unsubscribe();
      resolve();
    }, 5000);
  });
};

/**
 * Set up global error handler
 */
const setupGlobalErrorHandler = (): void => {
  const originalOnError = window.onerror;

  window.onerror = (message, source, lineno, colno, error) => {
    // Log error to console
    console.error("Global error:", { message, source, lineno, colno, error });

    // Call original handler if exists
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }

    // Return false to allow default browser error handling
    return false;
  };

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);

    // Log to analytics
    logAnalyticsEvent("unhandled_promise_rejection", {
      error:
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason),
      timestamp: new Date().toISOString(),
    });
  });
};

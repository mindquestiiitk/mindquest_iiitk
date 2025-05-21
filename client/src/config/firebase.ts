import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getPerformance } from "firebase/performance";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Performance monitoring
const PERF_MARKERS = new Map();

/**
 * Simple performance monitoring for Firebase operations
 */
const perf = {
  start: (name: string): void => {
    PERF_MARKERS.set(name, Date.now());
  },
  end: (name: string): number => {
    const startTime = PERF_MARKERS.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      console.debug(`⏱️ Firebase timing: ${name} - ${duration}ms`);
      PERF_MARKERS.delete(name);
      return duration;
    }
    return 0;
  },
};

// Check if all required environment variables are set
const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error("Missing Firebase environment variables:", missingEnvVars);
  // In development, we can continue with a warning
  if (import.meta.env.DEV) {
    console.warn(
      "Running in development mode with missing Firebase config. Some features may not work."
    );
  } else {
    // In production, we should throw an error
    throw new Error(
      `Missing required Firebase environment variables: ${missingEnvVars.join(
        ", "
      )}`
    );
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only if it hasn't been initialized
perf.start("firebase-init");
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
perf.end("firebase-init");

// Initialize Firebase services with performance monitoring
perf.start("auth-init");
export const auth = getAuth(app);
perf.end("auth-init");

perf.start("firestore-init");
export const db = getFirestore(app);

// Configure Firestore for better performance
try {
  // Enable offline persistence for better user experience
  // But don't enable it on login/register pages to improve performance
  if (
    import.meta.env.PROD &&
    !window.location.pathname.includes("login") &&
    !window.location.pathname.includes("register")
  ) {
    perf.start("firestore-persistence");
    enableIndexedDbPersistence(db)
      .then(() => {
        console.log("Firestore persistence enabled");
        perf.end("firestore-persistence");
      })
      .catch((err) => {
        console.warn("Firestore persistence could not be enabled:", err.code);
      });

    // Set cache size to unlimited for better offline experience
    db.settings({
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    });
  } else {
    // For login/register pages, use a smaller cache size for better performance
    db.settings({
      cacheSizeBytes: 1048576 * 10, // 10MB cache
    });
    console.log("Using reduced Firestore cache for login/register page");
  }
} catch (err) {
  console.warn("Error configuring Firestore:", err);
}
perf.end("firestore-init");

perf.start("storage-init");
export const storage = getStorage(app);
perf.end("storage-init");

perf.start("functions-init");
export const functions = getFunctions(
  app,
  import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || "us-central1"
);
perf.end("functions-init");

// Initialize Performance Monitoring and Analytics based on feature flags
const enableAnalytics =
  import.meta.env.VITE_ENABLE_ANALYTICS === "true" && import.meta.env.PROD;
const enablePerformance =
  import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === "true" &&
  import.meta.env.PROD;

// Lazy load performance monitoring and analytics to improve initial load time
let _performance: any = null;
let _analytics: any = null;

// Getter functions with lazy initialization
export const getFirebasePerformance = () => {
  if (enablePerformance && !_performance) {
    try {
      perf.start("performance-init");
      _performance = getPerformance(app);
      perf.end("performance-init");
      console.debug("Firebase Performance Monitoring initialized");
    } catch (err) {
      console.warn(
        "Failed to initialize Firebase Performance Monitoring:",
        err
      );
    }
  }
  return _performance;
};

export const getFirebaseAnalytics = () => {
  if (enableAnalytics && !_analytics) {
    try {
      perf.start("analytics-init");
      _analytics = getAnalytics(app);
      perf.end("analytics-init");
      console.debug("Firebase Analytics initialized");
    } catch (err) {
      console.warn("Failed to initialize Firebase Analytics:", err);
    }
  }
  return _analytics;
};

// For backward compatibility
export const performance = enablePerformance ? getFirebasePerformance() : null;
export const analytics = enableAnalytics ? getFirebaseAnalytics() : null;

// Helper function to log analytics events safely with batching
const eventQueue: Array<[string, Record<string, any> | undefined]> = [];
let isProcessingQueue = false;

const processEventQueue = async () => {
  if (isProcessingQueue || eventQueue.length === 0) return;

  isProcessingQueue = true;
  const analyticsInstance = getFirebaseAnalytics();

  if (analyticsInstance) {
    const batchSize = 10;
    while (eventQueue.length > 0) {
      const batch = eventQueue.splice(0, batchSize);

      for (const [eventName, eventParams] of batch) {
        try {
          logEvent(analyticsInstance, eventName, eventParams);
        } catch (err) {
          console.warn(`Failed to log analytics event ${eventName}:`, err);
        }
      }

      // Small delay to prevent blocking the main thread
      if (eventQueue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
  }

  isProcessingQueue = false;
};

export const logAnalyticsEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (enableAnalytics) {
    eventQueue.push([eventName, eventParams]);

    // Process queue on next tick
    setTimeout(processEventQueue, 0);
  }
};

// Connect to emulators in development mode
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true"
) {
  perf.start("emulator-connect");

  // Get emulator host and ports from environment variables or use defaults
  const emulatorHost =
    import.meta.env.VITE_FIREBASE_EMULATOR_HOST || "localhost";
  const authPort = parseInt(
    import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || "9099"
  );
  const firestorePort = parseInt(
    import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || "8080"
  );
  const storagePort = parseInt(
    import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || "9199"
  );
  const functionsPort = parseInt(
    import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001"
  );

  try {
    // Connect to Auth emulator
    try {
      connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, {
        disableWarnings: true,
      });
      console.log(`Connected to Auth emulator at ${emulatorHost}:${authPort}`);
    } catch (authError) {
      console.error("Failed to connect to Auth emulator:", authError);
    }

    // Connect to Firestore emulator
    try {
      connectFirestoreEmulator(db, emulatorHost, firestorePort);
      console.log(
        `Connected to Firestore emulator at ${emulatorHost}:${firestorePort}`
      );
    } catch (firestoreError) {
      console.error("Failed to connect to Firestore emulator:", firestoreError);
    }

    // Connect to Storage emulator
    try {
      connectStorageEmulator(storage, emulatorHost, storagePort);
      console.log(
        `Connected to Storage emulator at ${emulatorHost}:${storagePort}`
      );
    } catch (storageError) {
      console.error("Failed to connect to Storage emulator:", storageError);
    }

    // Connect to Functions emulator
    try {
      connectFunctionsEmulator(functions, emulatorHost, functionsPort);
      console.log(
        `Connected to Functions emulator at ${emulatorHost}:${functionsPort}`
      );
    } catch (functionsError) {
      console.error("Failed to connect to Functions emulator:", functionsError);
    }

    console.log("Firebase emulator connections complete");
  } catch (error) {
    console.error("Failed to connect to Firebase emulators:", error);
  }

  perf.end("emulator-connect");
}

export default app;

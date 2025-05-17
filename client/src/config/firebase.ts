import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getPerformance } from "firebase/performance";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

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
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(
  app,
  import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || "us-central1"
);

// Initialize Performance Monitoring and Analytics based on feature flags
const enableAnalytics =
  import.meta.env.VITE_ENABLE_ANALYTICS === "true" && import.meta.env.PROD;
const enablePerformance =
  import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === "true" &&
  import.meta.env.PROD;

export const performance = enablePerformance ? getPerformance(app) : null;
export const analytics = enableAnalytics ? getAnalytics(app) : null;

// Helper function to log analytics events safely
export const logAnalyticsEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

// Connect to emulators in development mode
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true"
) {
  try {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    connectFunctionsEmulator(functions, "localhost", 5001);
    console.log("Connected to Firebase emulators");
  } catch (error) {
    console.error("Failed to connect to Firebase emulators:", error);
  }
}

export default app;

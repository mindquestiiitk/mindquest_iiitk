import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  updateEmail,
  User as FirebaseUser,
  UserCredential,
  onAuthStateChanged,
  sendEmailVerification,
  verifyPasswordResetCode,
  AuthError,
  deleteUser,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  multiFactor,
  getIdToken,
} from "firebase/auth";
import { auth, perf } from "../config/firebase";
import { secureStorage } from "../utils/secure-storage-simplified";

// Constants
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds (for 15 min tokens)
const TOKEN_KEY = "firebase_auth_token";
const TOKEN_EXPIRY_KEY = "firebase_auth_token_expiry";
const REMEMBER_ME_KEY = "firebase_auth_remember_me";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface AuthError {
  code: string;
  message: string;
}

export interface LoginOptions {
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface DeviceInfo {
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
}

class FirebaseAuthService {
  private googleProvider: GoogleAuthProvider;
  private currentUser: FirebaseUser | null = null;
  private refreshTokenInterval: number | null = null;
  private inactivityTimeout: number | null = null;
  private lastActivityTime: number = Date.now();

  // Token cache for better performance
  private tokenCache: { token: string; expiry: number } | null = null;
  private readonly TOKEN_CACHE_BUFFER = 5 * 60 * 1000; // 5 minute buffer before expiry

  constructor() {
    // Initialize Google provider
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope("profile");
    this.googleProvider.addScope("email");

    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;

      if (user) {
        // User is signed in
        console.log("Auth state changed: User logged in");

        // Start token refresh interval
        this.startTokenRefresh();

        // Start inactivity tracking
        this.startInactivityTracking();

        // Store token in secure storage
        this.storeToken();
      } else {
        // User is signed out
        console.log("Auth state changed: User logged out");

        // Clear token refresh interval
        this.stopTokenRefresh();

        // Clear inactivity tracking
        this.stopInactivityTracking();

        // Clear stored token
        this.clearToken();
      }
    });

    // Set up activity tracking
    this.setupActivityTracking();
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(
    email: string,
    password: string,
    options: LoginOptions = {}
  ): Promise<UserCredential> {
    try {
      // Validate email domain first
      this.validateEmailDomain(email);

      // Set persistence based on remember me option
      const persistenceType = options.rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;

      await setPersistence(auth, persistenceType);

      // Store remember me preference
      secureStorage.setItem(
        REMEMBER_ME_KEY,
        options.rememberMe ? "true" : "false"
      );

      // Sign in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Handle MFA if needed
      if (
        multiFactor(userCredential.user).enrolledFactors.length > 0 &&
        options.mfaCode
      ) {
        // This would be implemented for MFA verification
        // Not fully implemented here as it requires more complex flow
      }

      return userCredential;
    } catch (error) {
      // Handle MFA required error
      if ((error as AuthError).code === "auth/multi-factor-auth-required") {
        // This would handle MFA challenge
        // Not fully implemented here
        throw new Error(
          "Multi-factor authentication required. Please use the code sent to your phone."
        );
      }

      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(options: LoginOptions = {}): Promise<UserCredential> {
    try {
      // Set persistence based on remember me option
      const persistenceType = options.rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;

      await setPersistence(auth, persistenceType);

      // Store remember me preference
      secureStorage.setItem(
        REMEMBER_ME_KEY,
        options.rememberMe ? "true" : "false"
      );

      // Configure Google provider to only allow iiitkottayam.ac.in domain
      const customGoogleProvider = new GoogleAuthProvider();
      customGoogleProvider.setCustomParameters({
        hd: "iiitkottayam.ac.in", // Hosted domain parameter restricts to specific domain
      });

      // Sign in with popup
      const userCredential = await signInWithPopup(auth, customGoogleProvider);

      // Double-check the email domain after sign-in
      // This is a safety measure in case the hd parameter is ignored
      const email = userCredential.user.email;
      if (email && !email.toLowerCase().endsWith("@iiitkottayam.ac.in")) {
        // Sign out the user immediately
        await signOut(auth);
        throw new Error(
          "Only email addresses from iiitkottayam.ac.in domain are allowed"
        );
      }

      return userCredential;
    } catch (error) {
      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Create a new user with email and password
   */
  async createUser(
    email: string,
    password: string,
    name: string
  ): Promise<UserCredential> {
    try {
      // Validate password strength
      this.validatePasswordStrength(password);

      // Validate email domain
      this.validateEmailDomain(email);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: name,
        });

        // Send email verification
        await sendEmailVerification(userCredential.user);
      }

      return userCredential;
    } catch (error) {
      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      // Clear any stored tokens first
      this.clearToken();

      // Clear session ID from localStorage
      localStorage.removeItem("sessionId");
      console.log("Session ID removed during logout");

      // Call backend logout endpoint to invalidate session and refresh token
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include", // Important to include cookies
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (backendError) {
        console.error("Error logging out from backend:", backendError);
        // Continue with local logout even if backend logout fails
      }

      // Sign out from Firebase
      await signOut(auth);

      // Clear any application state
      this.stopTokenRefresh();
      this.stopInactivityTracking();
    } catch (error) {
      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Validate email domain first
      this.validateEmailDomain(email);

      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      // Validate password strength
      this.validatePasswordStrength(newPassword);

      await confirmPasswordReset(auth, code, newPassword);
    } catch (error) {
      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Verify password reset code
   */
  async verifyPasswordResetCode(code: string): Promise<string> {
    try {
      return await verifyPasswordResetCode(auth, code);
    } catch (error) {
      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Change password for current user
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("No authenticated user found");
      }

      // Validate password strength
      this.validatePasswordStrength(newPassword);

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Change password
      await updatePassword(user, newPassword);
    } catch (error) {
      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    displayName?: string,
    photoURL?: string
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const updateData: { displayName?: string; photoURL?: string } = {};
      if (displayName) updateData.displayName = displayName;
      if (photoURL) updateData.photoURL = photoURL;

      await updateProfile(user, updateData);
    } catch (error) {
      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Update user email
   */
  async updateUserEmail(newEmail: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user found");
      }

      // Validate email domain first
      this.validateEmailDomain(newEmail);

      await updateEmail(user, newEmail);
      await sendEmailVerification(user);
    } catch (error) {
      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("No authenticated user found");
      }

      // Re-authenticate user before deleting
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete user
      await deleteUser(user);
    } catch (error) {
      this.handleFirebaseAuthError(error as AuthError);
      throw error;
    }
  }

  /**
   * Get device information for fingerprinting
   */
  getDeviceInfo(): DeviceInfo {
    return {
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
    };
  }

  /**
   * Refresh access token directly from Firebase
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return false;
      }

      // Force refresh the token directly from Firebase
      await user.getIdToken(true);

      // Get the refreshed token
      const newToken = await user.getIdToken();

      if (newToken) {
        // Store the new token
        this.storeToken(newToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false;
    }
  }

  /**
   * Get ID token for current user with enhanced reliability and caching
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh && this.tokenCache) {
        const now = Date.now();
        // Use cached token if it's not expired (with buffer time)
        if (now < this.tokenCache.expiry - this.TOKEN_CACHE_BUFFER) {
          console.debug("Using cached Firebase ID token");
          return this.tokenCache.token;
        }
      }

      const user = auth.currentUser;
      if (!user) {
        console.warn("No current user found when getting ID token");

        // For login page, return null immediately instead of waiting
        // This prevents hanging on the login page
        if (window.location.pathname.includes("login")) {
          return null;
        }

        // Try to reload auth state before giving up
        try {
          await auth.authStateReady();
          const reloadedUser = auth.currentUser;
          if (reloadedUser) {
            console.log("User found after waiting for auth state");
          } else {
            console.warn("Still no user after waiting for auth state");
            return null;
          }
        } catch (authStateError) {
          console.error("Error waiting for auth state:", authStateError);
          return null;
        }
      }

      // Get the current user again after potential reload
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return null;
      }

      // Add enhanced retry logic for token retrieval
      let retries = 3; // Reduce retries for faster response
      let lastError = null;
      let backoffTime = 300; // Start with 300ms, will increase exponentially

      while (retries > 0) {
        try {
          // Try to reload the user before getting the token
          if (retries < 4) {
            // Only on later retries to avoid unnecessary reloads
            try {
              await currentUser.reload();
              console.log("User reloaded before token retrieval");
            } catch (reloadError) {
              console.warn("Failed to reload user:", reloadError);
              // Continue anyway
            }
          }

          // Get the token with performance monitoring
          const startTime = Date.now();
          const token = await getIdToken(currentUser, forceRefresh);
          const endTime = Date.now();
          console.debug(
            `⏱️ Token retrieval completed in ${endTime - startTime}ms`
          );

          if (token) {
            // Store token in secure storage
            this.storeToken(token);

            // Also store in cookie as fallback for the backend
            document.cookie = `token=${token}; path=/; max-age=3600; SameSite=Strict`;

            // Store the user's UID as the session ID for collection-based security
            if (currentUser.uid) {
              localStorage.setItem("sessionId", currentUser.uid);
              console.log(
                "Session ID stored for collection ID-based security:",
                currentUser.uid
              );
            }

            // Parse token to get expiry time for caching
            try {
              const tokenParts = token.split(".");
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                if (payload.exp) {
                  // Set token cache with expiry time
                  this.tokenCache = {
                    token,
                    expiry: payload.exp * 1000, // Convert seconds to milliseconds
                  };
                  console.debug(
                    `Token cached until ${new Date(
                      this.tokenCache.expiry
                    ).toISOString()}`
                  );
                }
              }
            } catch (parseError) {
              console.warn("Error parsing token for caching:", parseError);
            }

            return token;
          }

          // If we get a null token but no error, wait briefly and retry
          console.warn("Received null token without error, retrying...");
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        } catch (tokenError: any) {
          console.warn(
            `Error getting ID token (retries left: ${retries}):`,
            tokenError
          );
          lastError = tokenError;

          // If the error is related to token expiration, force refresh on next attempt
          if (
            tokenError.code === "auth/id-token-expired" ||
            tokenError.code === "auth/requires-recent-login" ||
            tokenError.code === "auth/network-request-failed"
          ) {
            forceRefresh = true;

            // For network errors, wait longer
            if (tokenError.code === "auth/network-request-failed") {
              backoffTime = Math.min(backoffTime * 2, 5000); // Exponential backoff, max 5 seconds
            }
          }

          // Wait before retrying with exponential backoff
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
          backoffTime = Math.min(backoffTime * 1.5, 5000); // Increase backoff time
        }
        retries--;
      }

      if (lastError) {
        console.error("All token retrieval attempts failed:", lastError);
        throw lastError;
      }

      console.warn("Failed to get token after multiple retries");
      return null;
    } catch (error) {
      console.error("Error getting ID token:", error);

      // Clear stored token on error
      this.clearToken();

      return null;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Validate password strength
   */
  private validatePasswordStrength(password: string): void {
    // Use the same regex pattern as the backend for consistency
    // This matches: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

    if (passwordRegex.test(password)) {
      // Password meets all requirements
      return;
    }

    // If regex fails, check individual requirements to provide specific feedback
    const requirements = [];

    // Password must be at least 8 characters
    if (password.length < 8) {
      requirements.push("be at least 8 characters long");
    }

    // Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      requirements.push("contain at least one uppercase letter");
    }

    // Password must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      requirements.push("contain at least one lowercase letter");
    }

    // Password must contain at least one number
    if (!/[0-9]/.test(password)) {
      requirements.push("contain at least one number");
    }

    // Password must contain at least one special character
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(password)) {
      requirements.push(
        "contain at least one special character (!@#$%^&*()_+-=[]{}|;:'\",.<>/?)"
      );
    }

    // If any requirements are not met, throw an error with all missing requirements
    if (requirements.length > 0) {
      throw new Error(
        `Password validation failed: Password must ${requirements.join(", ")}`
      );
    }
  }

  /**
   * Validate email domain
   */
  private validateEmailDomain(email: string): void {
    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    // Extract domain from email
    const domain = email.split("@")[1].toLowerCase();

    // Check if domain is allowed
    const allowedDomains = ["iiitkottayam.ac.in"];
    if (!allowedDomains.includes(domain)) {
      throw new Error(
        `Please use an iiitkottayam.ac.in email address. Other email domains are not allowed.`
      );
    }
  }

  /**
   * Check if current user has allowed email domain
   * If not, sign them out and throw an error
   */
  async validateCurrentUserEmailDomain(): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return; // No user to validate
    }

    try {
      // Validate the email domain
      const email = user.email.toLowerCase();
      if (!email.endsWith("@iiitkottayam.ac.in")) {
        console.warn(`User with non-allowed email domain detected: ${email}`);

        // Sign out the user
        await signOut(auth);

        throw new Error(
          "Only email addresses from iiitkottayam.ac.in domain are allowed"
        );
      }
    } catch (error) {
      console.error("Error validating current user email domain:", error);
      throw error;
    }
  }

  /**
   * Store token in secure storage and update cache
   */
  private storeToken(token?: string): void {
    if (!token && auth.currentUser) {
      // Get token if not provided
      auth.currentUser.getIdToken().then((newToken) => {
        // Parse token to get actual expiry time
        try {
          const tokenParts = newToken.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.exp) {
              const expiryTime = payload.exp * 1000; // Convert seconds to milliseconds

              // Update cache
              this.tokenCache = {
                token: newToken,
                expiry: expiryTime,
              };

              // Store token and expiry time
              secureStorage.setItem(TOKEN_KEY, newToken);
              secureStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

              return;
            }
          }
        } catch (parseError) {
          console.warn("Error parsing token for storage:", parseError);
        }

        // Fallback if parsing fails
        const expiryTime = Date.now() + 60 * 60 * 1000;
        secureStorage.setItem(TOKEN_KEY, newToken);
        secureStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      });
    } else if (token) {
      // Parse token to get actual expiry time
      try {
        const tokenParts = token.split(".");
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload.exp) {
            const expiryTime = payload.exp * 1000; // Convert seconds to milliseconds

            // Update cache
            this.tokenCache = {
              token,
              expiry: expiryTime,
            };

            // Store token and expiry time
            secureStorage.setItem(TOKEN_KEY, token);
            secureStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

            return;
          }
        }
      } catch (parseError) {
        console.warn("Error parsing token for storage:", parseError);
      }

      // Fallback if parsing fails
      const expiryTime = Date.now() + 60 * 60 * 1000;
      secureStorage.setItem(TOKEN_KEY, token);
      secureStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    }
  }

  /**
   * Clear stored token and cache
   */
  private clearToken(): void {
    // Clear from secure storage
    secureStorage.removeItem(TOKEN_KEY);
    secureStorage.removeItem(TOKEN_EXPIRY_KEY);

    // Clear from memory cache
    this.tokenCache = null;

    // Clear from cookies
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

    // Clear session ID
    localStorage.removeItem("sessionId");
  }

  /**
   * Start token refresh interval with adaptive refresh timing
   */
  private startTokenRefresh(): void {
    // Clear any existing interval
    this.stopTokenRefresh();

    // Set up new interval with adaptive timing
    const refreshToken = async () => {
      try {
        // Check if we need to refresh based on token expiry
        if (this.tokenCache) {
          const now = Date.now();
          const timeToExpiry = this.tokenCache.expiry - now;

          // If token is not close to expiring, skip refresh
          if (timeToExpiry > this.TOKEN_CACHE_BUFFER) {
            console.debug(
              `Token still valid for ${Math.floor(
                timeToExpiry / 1000
              )}s, skipping refresh`
            );
            return;
          }
        }

        // Refresh token directly from Firebase
        if (auth.currentUser) {
          const startTime = Date.now();
          const token = await auth.currentUser.getIdToken(true);
          const endTime = Date.now();

          this.storeToken(token);
          console.log(
            `Token refreshed successfully in ${endTime - startTime}ms`
          );

          // Parse token to update cache
          try {
            const tokenParts = token.split(".");
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              if (payload.exp) {
                // Update token cache with new expiry time
                this.tokenCache = {
                  token,
                  expiry: payload.exp * 1000, // Convert seconds to milliseconds
                };
                console.debug(
                  `Token cached until ${new Date(
                    this.tokenCache.expiry
                  ).toISOString()}`
                );
              }
            }
          } catch (parseError) {
            console.warn("Error parsing refreshed token:", parseError);
          }
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    };

    // Initial refresh
    refreshToken();

    // Set up interval
    this.refreshTokenInterval = window.setInterval(
      refreshToken,
      TOKEN_REFRESH_INTERVAL
    );
  }

  /**
   * Stop token refresh interval
   */
  private stopTokenRefresh(): void {
    if (this.refreshTokenInterval) {
      window.clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = null;
    }
  }

  /**
   * Set up activity tracking
   */
  private setupActivityTracking(): void {
    // Track user activity
    const activityEvents = ["mousedown", "keydown", "touchstart", "scroll"];

    const updateActivity = () => {
      this.lastActivityTime = Date.now();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });
  }

  /**
   * Start inactivity tracking
   */
  private startInactivityTracking(): void {
    // Clear any existing timeout
    this.stopInactivityTracking();

    // Only start tracking if not using "remember me"
    const rememberMe = secureStorage.getItem(REMEMBER_ME_KEY) === "true";
    if (rememberMe) {
      return;
    }

    // Set up new timeout
    this.inactivityTimeout = window.setInterval(() => {
      const inactiveTime = Date.now() - this.lastActivityTime;

      if (inactiveTime > SESSION_TIMEOUT) {
        console.log("User inactive, signing out");
        this.signOut();
      }
    }, 60000); // Check every minute
  }

  /**
   * Stop inactivity tracking
   */
  private stopInactivityTracking(): void {
    if (this.inactivityTimeout) {
      window.clearInterval(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
  }

  /**
   * Handle Firebase auth errors with user-friendly messages
   */
  private handleFirebaseAuthError(error: AuthError): never {
    let message = "An authentication error occurred. Please try again.";

    // Check if this is our custom domain validation error
    if (error.message && error.message.includes("iiitkottayam.ac.in")) {
      // This is our custom domain validation error, pass it through
      message = error.message;
    } else {
      // Handle standard Firebase errors
      switch (error.code) {
        case "auth/email-already-in-use":
          message =
            "This email is already in use. Please use a different email or sign in.";
          break;
        case "auth/invalid-email":
          message = "The email address is not valid.";
          break;
        case "auth/user-disabled":
          message = "This account has been disabled. Please contact support.";
          break;
        case "auth/user-not-found":
          message =
            "No account found with this email address. Please check your email or register.";
          break;
        case "auth/wrong-password":
          message =
            "Incorrect password. Please try again or reset your password.";
          break;
        case "auth/weak-password":
          message =
            "Password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.";
          break;
        case "auth/invalid-credential":
          message =
            "Invalid credentials. Please check your email and password.";
          break;
        case "auth/account-exists-with-different-credential":
          message =
            "An account already exists with the same email but different sign-in credentials.";
          break;
        case "auth/operation-not-allowed":
          message = "This operation is not allowed. Please contact support.";
          break;
        case "auth/requires-recent-login":
          message =
            "This operation requires recent authentication. Please sign in again.";
          break;
        case "auth/too-many-requests":
          message =
            "Too many unsuccessful login attempts. Please try again later or reset your password.";
          break;
        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection and try again.";
          break;
        case "auth/popup-closed-by-user":
          message =
            "Sign-in popup was closed before completing the sign-in process. Please try again.";
          break;
        case "auth/unauthorized-domain":
          message =
            "This domain is not authorized for OAuth operations. Please contact support.";
          break;
        case "auth/expired-action-code":
          message = "This action code has expired. Please request a new one.";
          break;
        case "auth/invalid-action-code":
          message = "The action code is invalid. Please request a new one.";
          break;
      }
    }

    const enhancedError = new Error(message) as Error & { code?: string };
    enhancedError.code = error.code;
    throw enhancedError;
  }
}

export const firebaseAuthService = new FirebaseAuthService();

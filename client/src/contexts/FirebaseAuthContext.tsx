import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { firebaseAuthService } from "../services/firebase-auth.service";
import { userService, User } from "../services/user.service";

// Performance monitoring
const PERF_MARKERS = new Map();

/**
 * Simple performance monitoring for auth operations
 */
const perf = {
  start: (name: string): void => {
    PERF_MARKERS.set(name, Date.now());
  },
  end: (name: string, userId?: string | null): number => {
    const startTime = PERF_MARKERS.get(name);
    if (startTime) {
      const duration = Date.now() - startTime;
      const logData: Record<string, any> = {
        duration: `${duration}ms`,
        operation: name,
      };

      if (userId) {
        logData.userId = userId;
      }

      console.debug(`⏱️ Auth context timing: ${name}`, logData);
      PERF_MARKERS.delete(name);
      return duration;
    }
    return 0;
  },
};

// User data cache to improve performance
const USER_CACHE = new Map<
  string,
  {
    user: User;
    timestamp: number;
  }
>();

// Cache TTL in milliseconds (15 minutes)
const CACHE_TTL = 15 * 60 * 1000;

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateProfile: (data: { name?: string; avatarId?: string }) => Promise<User>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (code: string, password: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  verifyPasswordResetCode: (code: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for Firebase auth state changes
  useEffect(() => {
    let authTimeoutId: number | null = null;
    const authStartTime = Date.now();
    console.debug("⏱️ Starting Firebase auth state change listener");

    // Clean up expired cache entries
    const cleanupCache = () => {
      const now = Date.now();
      for (const [key, value] of USER_CACHE.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          USER_CACHE.delete(key);
        }
      }
    };

    // Run cache cleanup
    cleanupCache();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const authEndTime = Date.now();
      console.debug(
        `⏱️ Firebase auth state changed in ${authEndTime - authStartTime}ms`
      );

      setFirebaseUser(firebaseUser);

      // Clear any existing timeout
      if (authTimeoutId) {
        window.clearTimeout(authTimeoutId);
        authTimeoutId = null;
      }

      if (firebaseUser) {
        // Validate email domain first
        try {
          // Check if the email domain is allowed
          const email = firebaseUser.email;
          if (email && !email.toLowerCase().endsWith("@iiitkottayam.ac.in")) {
            console.warn(
              `User with non-allowed email domain detected: ${email}`
            );

            // Sign out the user
            await firebaseAuthService.signOut();
            setUser(null);
            setError(
              "Only email addresses from iiitkottayam.ac.in domain are allowed"
            );
            setLoading(false);
            return;
          }
        } catch (domainError) {
          console.error("Email domain validation failed:", domainError);
          // Continue with authentication process
        }

        // Check cache first for better performance
        const cachedUserData = USER_CACHE.get(firebaseUser.uid);
        const now = Date.now();

        if (cachedUserData && now - cachedUserData.timestamp < CACHE_TTL) {
          console.debug("Using cached user data", {
            userId: firebaseUser.uid,
            cacheAge: `${(now - cachedUserData.timestamp) / 1000}s`,
          });
          setUser(cachedUserData.user);
          setLoading(false);

          // Refresh token and sync with backend in the background
          // This ensures we have fresh data without blocking the UI
          (async () => {
            try {
              await firebaseAuthService.refreshAccessToken();
              const userData = await userService.syncWithBackend();

              // Update cache and state if user is still logged in
              if (auth.currentUser?.uid === firebaseUser.uid) {
                USER_CACHE.set(firebaseUser.uid, {
                  user: userData,
                  timestamp: Date.now(),
                });
                setUser(userData);
              }
            } catch (error) {
              console.error("Background sync error:", error);
            }
          })();

          return;
        }

        // Set a timeout to prevent hanging in authentication state
        authTimeoutId = window.setTimeout(() => {
          console.error("Authentication timed out after 10 seconds");
          setUser(null);
          setError("Authentication timed out. Please try again.");
          setLoading(false);
        }, 10000);

        try {
          const tokenStartTime = Date.now();
          // Force token refresh before syncing with backend
          await firebaseAuthService.refreshAccessToken();
          const tokenEndTime = Date.now();
          console.debug(
            `⏱️ Token refresh completed in ${tokenEndTime - tokenStartTime}ms`
          );

          const syncStartTime = Date.now();
          // Sync with backend to get user data
          // This will now work even if the user doesn't exist in the database yet
          // because we've updated the backend to create users on the fly
          const userData = await userService.syncWithBackend();
          const syncEndTime = Date.now();
          console.debug(
            `⏱️ Backend sync completed in ${syncEndTime - syncStartTime}ms`
          );

          // Clear the timeout since authentication succeeded
          if (authTimeoutId) {
            window.clearTimeout(authTimeoutId);
            authTimeoutId = null;
          }

          // Cache the user data for better performance
          USER_CACHE.set(firebaseUser.uid, {
            user: userData,
            timestamp: Date.now(),
          });

          setUser(userData);
        } catch (error) {
          console.error("Error syncing user with backend:", error);

          // Clear the timeout since we got a response (even if it's an error)
          if (authTimeoutId) {
            window.clearTimeout(authTimeoutId);
            authTimeoutId = null;
          }

          // If the error is related to user not found, try to register the user with the backend
          if (
            error instanceof Error &&
            (error.message.includes("user_not_found") ||
              error.message.includes("User profile not found") ||
              error.message.includes("User not found"))
          ) {
            console.log("User not found in backend, attempting to register...");

            try {
              const regStartTime = Date.now();
              // Try to register the user with the backend
              if (firebaseUser) {
                await userService.registerWithBackend(firebaseUser);
                const regEndTime = Date.now();
                console.debug(
                  `⏱️ Backend registration completed in ${
                    regEndTime - regStartTime
                  }ms`
                );

                // Try syncing again after registration
                const userData = await userService.syncWithBackend();

                // Cache the user data
                USER_CACHE.set(firebaseUser.uid, {
                  user: userData,
                  timestamp: Date.now(),
                });

                setUser(userData);
                console.log(
                  "Successfully registered and synced user with backend"
                );
                return;
              }
            } catch (registerError) {
              console.error(
                "Error registering user with backend:",
                registerError
              );
            }
          }

          // If we can't sync with backend, we can't proceed with authentication
          setUser(null);

          // Provide a more specific error message if possible
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError("Failed to authenticate with backend. Please try again.");
          }

          // Sign out the user to clear any invalid state
          try {
            await firebaseAuthService.signOut();
          } catch (signOutError) {
            console.error(
              "Error signing out after failed authentication:",
              signOutError
            );
          }
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      // Clean up timeout if component unmounts
      if (authTimeoutId) {
        window.clearTimeout(authTimeoutId);
      }
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    perf.start("login");
    try {
      setError(null);
      setLoading(true);

      // Sign in with Firebase
      const userCredential = await firebaseAuthService.signInWithEmail(
        email,
        password
      );

      // If we have the user credential, we can optimize by pre-fetching user data
      // instead of waiting for the auth state listener
      if (userCredential.user) {
        try {
          // Force token refresh
          await firebaseAuthService.refreshAccessToken();

          // Sync with backend
          const userData = await userService.syncWithBackend();

          // Cache the user data
          USER_CACHE.set(userCredential.user.uid, {
            user: userData,
            timestamp: Date.now(),
          });

          // Set user data immediately for better UX
          setUser(userData);
        } catch (syncError) {
          console.error("Error syncing after login:", syncError);
          // Auth state listener will handle this case
        }
      }

      perf.end("login", userCredential.user?.uid);
    } catch (error) {
      perf.end("login");

      // Provide user-friendly error messages
      if (error instanceof Error) {
        const errorCode = (error as any).code;
        if (
          errorCode === "auth/wrong-password" ||
          errorCode === "auth/user-not-found"
        ) {
          setError("Invalid email or password");
        } else if (errorCode === "auth/too-many-requests") {
          setError(
            "Too many login attempts. Please try again later or reset your password."
          );
        } else {
          setError(error.message);
        }
      } else {
        setError("Login failed");
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      perf.start("register");
      try {
        setError(null);
        setLoading(true);

        // Validate email domain if required
        if (email && !email.endsWith("@iiitkottayam.ac.in")) {
          setError(
            "Only email addresses from iiitkottayam.ac.in domain are allowed"
          );
          throw new Error(
            "Only email addresses from iiitkottayam.ac.in domain are allowed"
          );
        }

        // Create user with Firebase
        const userCredential = await firebaseAuthService.createUser(
          email,
          password,
          name
        );

        // Register with backend
        const userData = await userService.registerWithBackend(
          userCredential.user
        );

        // Cache the user data
        if (userCredential.user && userData) {
          USER_CACHE.set(userCredential.user.uid, {
            user: userData,
            timestamp: Date.now(),
          });

          // Set user data immediately for better UX
          setUser(userData);
        }

        perf.end("register", userCredential.user?.uid);
      } catch (error) {
        perf.end("register");

        // Provide user-friendly error messages
        if (error instanceof Error) {
          const errorCode = (error as any).code;
          if (errorCode === "auth/email-already-in-use") {
            setError(
              "This email address is already in use. Please login instead."
            );
          } else if (errorCode === "auth/weak-password") {
            setError(
              "Password must contain at least 8 characters including uppercase, lowercase, number, and special character."
            );
          } else if (errorCode === "auth/invalid-email") {
            setError("Please enter a valid email address.");
          } else {
            setError(error.message);
          }
        } else {
          setError("Registration failed");
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    perf.start("logout");
    try {
      setError(null);
      setLoading(true);

      // Get current user ID before signing out
      const currentUserId = auth.currentUser?.uid;

      // Clear user from cache if exists
      if (currentUserId) {
        USER_CACHE.delete(currentUserId);
      }

      // Clear user state immediately for better UX
      setUser(null);

      // Sign out from Firebase
      await firebaseAuthService.signOut();

      perf.end("logout");
    } catch (error) {
      perf.end("logout");
      setError(error instanceof Error ? error.message : "Logout failed");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    perf.start("loginWithGoogle");
    try {
      setError(null);
      setLoading(true);

      // Sign in with Google - domain validation is now handled in the service
      const userCredential = await firebaseAuthService.signInWithGoogle();

      // Double-check the email domain is allowed (redundant but for safety)
      const email = userCredential.user.email;
      if (email && !email.toLowerCase().endsWith("@iiitkottayam.ac.in")) {
        // Sign out the user
        await firebaseAuthService.signOut();
        setError(
          "Only email addresses from iiitkottayam.ac.in domain are allowed"
        );
        throw new Error(
          "Only email addresses from iiitkottayam.ac.in domain are allowed"
        );
      }

      // If this is a new user, register with backend
      const isNewUser =
        userCredential.user.metadata.creationTime ===
        userCredential.user.metadata.lastSignInTime;

      if (isNewUser) {
        try {
          // Register with backend
          const userData = await userService.registerWithBackend(
            userCredential.user
          );

          // Cache the user data
          if (userData) {
            USER_CACHE.set(userCredential.user.uid, {
              user: userData,
              timestamp: Date.now(),
            });

            // Set user data immediately for better UX
            setUser(userData);
          }
        } catch (registerError) {
          console.error(
            "Error registering Google user with backend:",
            registerError
          );
          // Auth state listener will handle this case
        }
      } else {
        // For existing users, pre-fetch user data
        try {
          // Force token refresh
          await firebaseAuthService.refreshAccessToken();

          // Sync with backend
          const userData = await userService.syncWithBackend();

          // Cache the user data
          USER_CACHE.set(userCredential.user.uid, {
            user: userData,
            timestamp: Date.now(),
          });

          // Set user data immediately for better UX
          setUser(userData);
        } catch (syncError) {
          console.error("Error syncing Google user with backend:", syncError);
          // Auth state listener will handle this case
        }
      }

      perf.end("loginWithGoogle", userCredential.user.uid);
    } catch (error) {
      perf.end("loginWithGoogle");

      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes("domain")) {
          // Already set above
        } else if ((error as any).code === "auth/popup-closed-by-user") {
          setError("Google sign-in was cancelled. Please try again.");
        } else if ((error as any).code === "auth/cancelled-popup-request") {
          setError("Multiple popup requests detected. Please try again.");
        } else {
          setError(error.message);
        }
      } else {
        setError("Google login failed");
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: { name?: string; avatarId?: string }) => {
      perf.start("updateProfile");
      try {
        setError(null);
        setLoading(true);

        // Update Firebase profile if name is provided
        if (data.name) {
          await firebaseAuthService.updateUserProfile(data.name);
        }

        // Update backend profile
        const updatedUser = await userService.updateProfile(data);

        // Update user in state
        setUser(updatedUser);

        // Update user in cache
        const currentUserId = auth.currentUser?.uid;
        if (currentUserId) {
          USER_CACHE.set(currentUserId, {
            user: updatedUser,
            timestamp: Date.now(),
          });
        }

        perf.end("updateProfile", auth.currentUser?.uid);
        return updatedUser;
      } catch (error) {
        perf.end("updateProfile");

        // Provide user-friendly error messages
        if (error instanceof Error) {
          if ((error as any).code === "auth/requires-recent-login") {
            setError(
              "For security reasons, please log out and log back in to update your profile."
            );
          } else {
            setError(error.message);
          }
        } else {
          setError("Profile update failed");
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const forgotPassword = useCallback(async (email: string) => {
    perf.start("forgotPassword");
    try {
      setError(null);
      setLoading(true);

      // Validate email domain if required
      if (email && !email.endsWith("@iiitkottayam.ac.in")) {
        setError(
          "Only email addresses from iiitkottayam.ac.in domain are allowed"
        );
        throw new Error(
          "Only email addresses from iiitkottayam.ac.in domain are allowed"
        );
      }

      await firebaseAuthService.sendPasswordResetEmail(email);
      perf.end("forgotPassword");
    } catch (error) {
      perf.end("forgotPassword");

      // Provide user-friendly error messages
      if (error instanceof Error) {
        if ((error as any).code === "auth/user-not-found") {
          // Don't reveal if email exists for security reasons
          // Instead, show a generic success message
          return;
        } else if (error.message.includes("domain")) {
          // Already set above
        } else {
          setError(error.message);
        }
      } else {
        setError("Password reset failed");
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (code: string, password: string) => {
    perf.start("resetPassword");
    try {
      setError(null);
      setLoading(true);

      // Validate password strength
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        throw new Error("Password must be at least 8 characters long");
      }

      // Check for uppercase, lowercase, number, and special character
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);

      if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        setError(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
        throw new Error(
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }

      await firebaseAuthService.confirmPasswordReset(code, password);
      perf.end("resetPassword");
    } catch (error) {
      perf.end("resetPassword");

      // Provide user-friendly error messages
      if (error instanceof Error) {
        if ((error as any).code === "auth/invalid-action-code") {
          setError(
            "The reset link has expired or is invalid. Please request a new password reset link."
          );
        } else if ((error as any).code === "auth/weak-password") {
          setError(
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
          );
        } else if (!error.message.includes("Password must")) {
          // Don't override our custom validation messages
          setError(error.message);
        }
      } else {
        setError("Password reset failed");
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPasswordResetCode = useCallback(async (code: string) => {
    perf.start("verifyPasswordResetCode");
    try {
      setError(null);
      setLoading(true);

      const email = await firebaseAuthService.verifyPasswordResetCode(code);
      perf.end("verifyPasswordResetCode");
      return email;
    } catch (error) {
      perf.end("verifyPasswordResetCode");

      // Provide user-friendly error messages
      if (error instanceof Error) {
        if ((error as any).code === "auth/invalid-action-code") {
          setError(
            "The reset link has expired or is invalid. Please request a new password reset link."
          );
        } else {
          setError(error.message);
        }
      } else {
        setError("Code verification failed");
      }

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      perf.start("changePassword");
      try {
        setError(null);
        setLoading(true);

        // Validate password strength
        if (newPassword.length < 8) {
          setError("New password must be at least 8 characters long");
          throw new Error("New password must be at least 8 characters long");
        }

        // Check for uppercase, lowercase, number, and special character
        const hasUppercase = /[A-Z]/.test(newPassword);
        const hasLowercase = /[a-z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);
        const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
          setError(
            "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
          );
          throw new Error(
            "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
          );
        }

        await firebaseAuthService.changePassword(currentPassword, newPassword);
        perf.end("changePassword");
      } catch (error) {
        perf.end("changePassword");

        // Provide user-friendly error messages
        if (error instanceof Error) {
          if ((error as any).code === "auth/wrong-password") {
            setError("Current password is incorrect");
          } else if ((error as any).code === "auth/weak-password") {
            setError(
              "New password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            );
          } else if ((error as any).code === "auth/requires-recent-login") {
            setError(
              "For security reasons, please log out and log back in to change your password."
            );
          } else if (!error.message.includes("password must")) {
            // Don't override our custom validation messages
            setError(error.message);
          }
        } else {
          setError("Password change failed");
        }

        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      firebaseUser,
      user,
      loading,
      error,
      login,
      register,
      logout,
      loginWithGoogle,
      updateProfile,
      forgotPassword,
      resetPassword,
      verifyPasswordResetCode,
      changePassword,
    }),
    [
      firebaseUser,
      user,
      loading,
      error,
      login,
      register,
      logout,
      loginWithGoogle,
      updateProfile,
      forgotPassword,
      resetPassword,
      verifyPasswordResetCode,
      changePassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useFirebaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useFirebaseAuth must be used within a FirebaseAuthProvider"
    );
  }
  return context;
};

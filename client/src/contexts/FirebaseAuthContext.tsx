import React, { createContext, useContext, useState, useEffect } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { firebaseAuthService } from "../services/firebase-auth.service";
import { userService, User } from "../services/user.service";

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

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      // Clear any existing timeout
      if (authTimeoutId) {
        window.clearTimeout(authTimeoutId);
        authTimeoutId = null;
      }

      if (firebaseUser) {
        // Set a timeout to prevent hanging in authentication state
        authTimeoutId = window.setTimeout(() => {
          console.error("Authentication timed out after 10 seconds");
          setUser(null);
          setError("Authentication timed out. Please try again.");
          setLoading(false);
        }, 10000);

        try {
          // Force token refresh before syncing with backend
          await firebaseAuthService.refreshAccessToken();

          // Sync with backend to get user data
          // This will now work even if the user doesn't exist in the database yet
          // because we've updated the backend to create users on the fly
          const userData = await userService.syncWithBackend();

          // Clear the timeout since authentication succeeded
          if (authTimeoutId) {
            window.clearTimeout(authTimeoutId);
            authTimeoutId = null;
          }

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
              // Try to register the user with the backend
              if (firebaseUser) {
                await userService.registerWithBackend(firebaseUser);

                // Try syncing again after registration
                const userData = await userService.syncWithBackend();
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

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      // Sign in with Firebase
      await firebaseAuthService.signInWithEmail(email, password);

      // Auth state listener will handle setting the user
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      // Create user with Firebase
      const userCredential = await firebaseAuthService.createUser(
        email,
        password,
        name
      );

      // Register with backend
      await userService.registerWithBackend(userCredential.user);

      // Auth state listener will handle setting the user
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);

      await firebaseAuthService.signOut();

      // Auth state listener will handle clearing the user
    } catch (error) {
      setError(error instanceof Error ? error.message : "Logout failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);

      // Sign in with Google
      const userCredential = await firebaseAuthService.signInWithGoogle();

      // If this is a new user, register with backend
      if (
        userCredential.user.metadata.creationTime ===
        userCredential.user.metadata.lastSignInTime
      ) {
        await userService.registerWithBackend(userCredential.user);
      }

      // Auth state listener will handle setting the user
    } catch (error) {
      setError(error instanceof Error ? error.message : "Google login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string; avatarId?: string }) => {
    try {
      setError(null);
      setLoading(true);

      // Update Firebase profile if name is provided
      if (data.name) {
        await firebaseAuthService.updateUserProfile(data.name);
      }

      // Update backend profile
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Profile update failed"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);

      await firebaseAuthService.sendPasswordResetEmail(email);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Password reset failed"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (code: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      await firebaseAuthService.confirmPasswordReset(code, password);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Password reset failed"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPasswordResetCode = async (code: string) => {
    try {
      setError(null);
      setLoading(true);

      return await firebaseAuthService.verifyPasswordResetCode(code);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Code verification failed"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      setError(null);
      setLoading(true);

      await firebaseAuthService.changePassword(currentPassword, newPassword);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Password change failed"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
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
  };

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

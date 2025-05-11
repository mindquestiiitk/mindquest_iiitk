import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, User } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateUserProfile: (user: User) => void; // Direct update without API call
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  handleAuthCallback: (token: string) => void;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          setUser(user);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError(
          error instanceof Error ? error.message : "Failed to initialize auth"
        );
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const user = await authService.login({ email, password });
      setUser(user);
    } catch (error) {
      // Extract the error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";

      setError(errorMessage);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const user = await authService.register({ name, email, password });
      setUser(user);
    } catch (error) {
      // Extract the error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";

      setError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Logout failed");
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setError(null);
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Profile update failed"
      );
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      await authService.forgotPassword(email);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send password reset email"
      );
      throw error;
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      setError(null);
      await authService.resetPassword(token, password);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to reset password"
      );
      throw error;
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      setError(null);
      await authService.changePassword(currentPassword, newPassword);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to change password"
      );
      throw error;
    }
  };

  const handleAuthCallback = (token: string) => {
    authService.token = token;
    localStorage.setItem("token", token);
    authService.setupAxiosInterceptors();
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const user = await authService.loginWithGoogle();
      setUser(user);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to login with Google"
      );
      throw error;
    }
  };

  // Direct update of user profile without API call
  const updateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    handleAuthCallback,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

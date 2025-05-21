import { apiService } from "./api.service";
import { firebaseAuthService } from "./firebase-auth.service";
import { User as FirebaseUser } from "firebase/auth";

export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  role: string;
  avatarId?: string;
  provider?: string;
  emailVerified?: boolean;
  isAdmin?: boolean;
  photoURL?: string | null;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  name?: string;
  avatarId?: string;
  email?: string;
}

class UserService {
  /**
   * Get current user profile from backend
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiService.get("/auth/me");
      return response.data.user;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UserProfile): Promise<User> {
    try {
      const response = await apiService.put("/auth/me", data);
      return response.data.user;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Register user with backend after Firebase authentication
   */
  async registerWithBackend(user: FirebaseUser): Promise<User> {
    try {
      // Get Firebase ID token
      let idToken = await user.getIdToken(true); // Force refresh to ensure token is valid

      // Prepare user data (will be updated if token is refreshed)
      let userData = {
        email: user.email,
        name:
          user.displayName || (user.email ? user.email.split("@")[0] : "User"),
        idToken,
        provider: user.providerData[0]?.providerId || "password",
        emailVerified: user.emailVerified,
        // Include device info for better security
        deviceInfo: {
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          userAgent: navigator.userAgent,
        },
      };

      console.log("Registering user with backend:", {
        uid: user.uid,
        email: user.email,
        provider: userData.provider,
      });

      // First, try to verify the token to ensure it's valid
      try {
        await apiService.post(
          "/auth/verify-token",
          {}, // Empty body
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            timeout: 5000, // Shorter timeout for token verification
          }
        );
        console.log("Token verified successfully before registration");
      } catch (tokenError: any) {
        console.warn(
          "Token verification failed before registration:",
          tokenError?.response?.status
        );
        // If token verification fails, try to get a new token
        try {
          const newToken = await user.getIdToken(true);
          idToken = newToken;
          // Update the userData object with the new token
          userData = {
            ...userData,
            idToken: newToken,
          };
          console.log("Got new token for registration");
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          // Continue with the original token
        }
      }

      // Register with backend
      // Log the full URL being used for registration to help with debugging
      let registerUrl = "/auth/register";
      console.log(`📡 Sending registration request to: ${registerUrl}`);

      // Store original URL for potential fallback
      const originalRegisterUrl = registerUrl;

      try {
        const response = await apiService.post(registerUrl, userData, {
          headers: {
            Authorization: `Bearer ${idToken}`, // Include token in header for better security
          },
          timeout: 15000, // Longer timeout for registration
        });

        console.log("✅ Registration response received:", {
          status: "success",
          hasUser: !!response?.data?.user,
          hasData: !!response?.data?.data,
        });

        // Verify the response contains user data
        let userDataFromResponse = null;

        // Check for user data in the standardized format: response.data.data.user
        if (response?.data?.data?.user) {
          console.log(
            "User data found in response.data.data.user (standard format)"
          );
          userDataFromResponse = response.data.data.user;
        }
        // Fallback for legacy format: response.data.user
        else if (response?.data?.user) {
          console.log("User data found in response.data.user (legacy format)");
          userDataFromResponse = response.data.user;
        }
        // Last fallback for other formats
        else if (response?.data?.data) {
          console.log("User data found in response.data.data");
          userDataFromResponse = response.data.data;
        }

        if (!userDataFromResponse) {
          console.error(
            "Invalid response format from server during registration:",
            response
          );
          throw new Error("Invalid response format from server");
        }

        // Store the user's UID as the session ID for collection-based security
        // In collection ID-based security, the session ID is always the user's UID
        localStorage.setItem("sessionId", user.uid);
        console.log(
          "Using user UID as session ID for collection-based security:",
          user.uid
        );

        console.log("User registered successfully with backend");
        return userDataFromResponse;
      } catch (requestError: any) {
        // Log detailed error information for debugging
        console.error(
          "❌ Registration request failed:",
          requestError?.response?.data || requestError
        );

        // Check for validation errors
        if (requestError?.response?.status === 400) {
          const errorData = requestError?.response?.data;

          // Handle password validation errors specifically
          if (errorData?.error?.details?.password) {
            const passwordError = errorData.error.details.password;
            console.error("Registration error: " + passwordError);
            throw new Error(passwordError);
          }

          // Handle other validation errors
          if (errorData?.error?.message) {
            console.error("Registration error: " + errorData.error.message);
            throw new Error(errorData.error.message);
          }
        }

        // If this is a 404 error, try the direct endpoint as a fallback
        if (requestError?.response?.status === 404) {
          console.warn(
            "🔍 Auth route not found, trying direct endpoint as fallback"
          );

          // Try the direct endpoint without the /auth prefix
          registerUrl = "/register";
          console.log(`📡 Retrying with direct endpoint: ${registerUrl}`);

          try {
            const fallbackResponse = await apiService.post(
              registerUrl,
              userData,
              {
                headers: {
                  Authorization: `Bearer ${idToken}`, // Include token in header for better security
                },
                timeout: 15000, // Longer timeout for registration
              }
            );

            console.log("✅ Fallback registration successful:", {
              status: "success",
              hasUser: !!fallbackResponse?.data?.user,
              hasData: !!fallbackResponse?.data?.data,
            });

            // Extract user data from fallback response
            let fallbackUserData = null;

            // Check for user data in the standardized format: response.data.data.user
            if (fallbackResponse?.data?.data?.user) {
              console.log(
                "User data found in fallback response.data.data.user"
              );
              fallbackUserData = fallbackResponse.data.data.user;
            }
            // Fallback for legacy format: response.data.user
            else if (fallbackResponse?.data?.user) {
              console.log("User data found in fallback response.data.user");
              fallbackUserData = fallbackResponse.data.user;
            }
            // Last fallback for other formats
            else if (fallbackResponse?.data?.data) {
              console.log("User data found in fallback response.data.data");
              fallbackUserData = fallbackResponse.data.data;
            }

            if (!fallbackUserData) {
              console.error(
                "Invalid fallback response format:",
                fallbackResponse
              );
              throw new Error("Invalid response format from server");
            }

            return fallbackUserData;
          } catch (fallbackError: any) {
            console.error(
              "❌ Fallback registration also failed:",
              fallbackError?.response?.data || fallbackError
            );

            // Handle validation errors in fallback response
            if (fallbackError?.response?.status === 400) {
              const errorData = fallbackError?.response?.data;

              if (errorData?.error?.details?.password) {
                throw new Error(errorData.error.details.password);
              }

              if (errorData?.error?.message) {
                throw new Error(errorData.error.message);
              }
            }

            // If both attempts failed, throw a more helpful error
            throw new Error(
              `Registration failed with both ${originalRegisterUrl} and ${registerUrl}. Check API configuration.`
            );
          }
        }

        // Rethrow the error to be handled by the caller
        throw requestError;
      }
    } catch (err) {
      const error = err as any; // Type assertion for better error handling

      // Check if this is a 409 Conflict error (user already exists)
      if (error?.response?.status === 409) {
        console.log(
          "User already exists in backend, continuing with authentication"
        );

        // Store the user's UID as the session ID for collection-based security
        localStorage.setItem("sessionId", user.uid);
        console.log(
          "Using user UID as session ID for collection-based security:",
          user.uid
        );

        // Return a minimal user object to continue the flow
        return {
          id: user.uid,
          email: user.email || "",
          name:
            user.displayName ||
            (user.email ? user.email.split("@")[0] : "User"),
          displayName:
            user.displayName ||
            (user.email ? user.email.split("@")[0] : "User"),
          role: "user", // Default role
          isAdmin: false,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
        };
      }

      // For 400 Bad Request errors, try to extract the specific error message
      if (
        error?.response?.status === 400 &&
        error?.response?.data?.error?.message
      ) {
        const errorMessage = error.response.data.error.message;

        // Check if this is a password validation error during token-based registration
        if (
          errorMessage.includes("Password") &&
          errorMessage.includes("validation") &&
          user.uid // If we have a user ID, this is token-based auth
        ) {
          console.error(
            "Password validation error during token-based registration:",
            errorMessage
          );

          // This is a bug - token-based registration shouldn't require password validation
          // Try again with a more explicit request that this is token-based auth
          try {
            console.log("Retrying registration with explicit token-based flag");

            // Get a fresh token
            const freshToken = await user.getIdToken(true);

            // Add an explicit flag to indicate this is token-based auth
            const retryResponse = await apiService.post(
              "/auth/register",
              {
                email: user.email,
                name:
                  user.displayName ||
                  (user.email ? user.email.split("@")[0] : "User"),
                idToken: freshToken,
                provider: user.providerData[0]?.providerId || "password",
                emailVerified: user.emailVerified,
                tokenBased: true, // Add explicit flag
                deviceInfo: {
                  screenResolution: `${window.screen.width}x${window.screen.height}`,
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  language: navigator.language,
                  userAgent: navigator.userAgent,
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${freshToken}`, // Include token in header for better security
                },
                timeout: 15000,
              }
            );

            // Extract user data from retry response
            let retryUserData = null;

            // Check for user data in the standardized format: response.data.data.user
            if (retryResponse?.data?.data?.user) {
              console.log("User data found in retry response.data.data.user");
              retryUserData = retryResponse.data.data.user;
            }
            // Fallback for legacy format: response.data.user
            else if (retryResponse?.data?.user) {
              console.log("User data found in retry response.data.user");
              retryUserData = retryResponse.data.user;
            }
            // Last fallback for other formats
            else if (retryResponse?.data?.data) {
              console.log("User data found in retry response.data.data");
              retryUserData = retryResponse.data.data;
            }

            if (retryUserData) {
              console.log("Retry successful with explicit token-based flag");
              return retryUserData;
            }
          } catch (retryError) {
            console.error(
              "Retry with explicit token-based flag failed:",
              retryError
            );
            // Fall through to original error
          }
        }

        console.error("Registration error:", errorMessage);
        throw new Error(errorMessage);
      }

      // For 401 Unauthorized errors, try to extract the specific error message
      if (error?.response?.status === 401) {
        console.error(
          "Authentication error during registration:",
          error?.response?.data?.error?.message || "Unauthorized"
        );
        throw new Error("Authentication failed. Please try again.");
      }

      console.error("Error registering with backend:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Sync user data with backend after login
   */
  async syncWithBackend(): Promise<User> {
    try {
      // Get current Firebase user
      const currentUser = firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("No authenticated user");
      }

      // Get Firebase ID token with force refresh to ensure it's valid
      let idToken = await firebaseAuthService.getIdToken(true);
      if (!idToken) {
        throw new Error("No authentication token available");
      }

      console.log("Syncing with backend using token:", {
        tokenLength: idToken.length,
        tokenPrefix: idToken.substring(0, 10) + "...",
        uid: currentUser.uid,
      });

      // First, try to register the user if they don't exist in the backend
      try {
        // Check if this is a new user by trying to register them
        // This will create the necessary collections in Firestore
        await this.registerWithBackend(currentUser);
        console.log("User registered or already exists in backend");
      } catch (registerError) {
        // If the error is not a "user already exists" error, log it but continue
        if (
          !(
            registerError instanceof Error &&
            registerError.message.includes("already exists")
          )
        ) {
          console.warn(
            "Registration attempt failed, continuing with token verification",
            registerError
          );
        }
      }

      // Try to refresh the token again after registration attempt
      try {
        const newToken = await firebaseAuthService.getIdToken(true);
        if (newToken) {
          idToken = newToken;
          console.log("Token refreshed after registration attempt");
        }
      } catch (refreshError) {
        console.warn(
          "Failed to refresh token after registration:",
          refreshError
        );
        // Continue with the original token
      }

      // Validate token with backend using Authorization header (production-ready approach)
      // Also include device information for better security
      const deviceInfo = {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
      };

      // Set token in cookie as fallback for the backend
      document.cookie = `token=${idToken}; path=/; max-age=3600; SameSite=Strict`;

      // Try both endpoints - first the direct endpoint, then fallback to the auth route
      let response;
      try {
        // First try the direct endpoint
        response = await apiService.post(
          "/verify-token", // Direct endpoint
          deviceInfo, // Include device info in the body
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            // Add timeout to prevent hanging requests
            timeout: 15000,
          }
        );
        console.log("Direct verify-token endpoint succeeded");
      } catch (directEndpointError) {
        console.warn(
          "Direct verify-token endpoint failed, trying auth route",
          directEndpointError
        );

        // Fallback to the auth route
        response = await apiService.post(
          "/auth/verify-token", // Auth route
          deviceInfo, // Include device info in the body
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            // Add timeout to prevent hanging requests
            timeout: 15000,
          }
        );
        console.log("Auth route verify-token endpoint succeeded");
      }

      console.log("Backend response:", {
        status: response?.success,
        hasUserData: !!response?.data?.data?.user,
      });

      // Extract user data from response
      if (response?.data?.data?.user) {
        const userData = response.data.data.user;

        // Store the user's UID as the session ID for collection-based security
        // In collection ID-based security, the session ID is always the user's UID
        localStorage.setItem("sessionId", currentUser.uid);
        console.log(
          "Using user UID as session ID for collection-based security:",
          currentUser.uid
        );

        // Ensure we have all required fields
        if (!userData.id) {
          userData.id = currentUser.uid;
        }

        if (!userData.email && currentUser.email) {
          userData.email = currentUser.email;
        }

        // Ensure we have both name and displayName for compatibility
        if (!userData.name && userData.displayName) {
          userData.name = userData.displayName;
        } else if (!userData.name && currentUser.displayName) {
          userData.name = currentUser.displayName;
        } else if (!userData.name && currentUser.email) {
          userData.name = currentUser.email.split("@")[0];
        }

        if (!userData.displayName && userData.name) {
          userData.displayName = userData.name;
        } else if (!userData.displayName && currentUser.displayName) {
          userData.displayName = currentUser.displayName;
        } else if (!userData.displayName && currentUser.email) {
          userData.displayName = currentUser.email.split("@")[0];
        }

        // Ensure we have emailVerified status
        if (userData.emailVerified === undefined) {
          userData.emailVerified = currentUser.emailVerified;
        }

        return userData;
      } else if (response?.data?.user) {
        return response.data.user;
      } else if (response?.data?.data) {
        // If user data is embedded in the data object
        const userData = response.data.data;
        return {
          id: userData.uid || userData.id || currentUser.uid,
          email: userData.email || currentUser.email || "",
          name:
            userData.name ||
            userData.displayName ||
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "User",
          displayName:
            userData.displayName ||
            userData.name ||
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "User",
          role: userData.role || "user",
          isAdmin:
            userData.isAdmin ||
            userData.role === "admin" ||
            userData.role === "superadmin",
          emailVerified: userData.emailVerified || currentUser.emailVerified,
          photoURL: userData.photoURL || currentUser.photoURL,
        };
      }

      // If we couldn't extract user data from the response but have a successful response,
      // create a minimal user object from Firebase user data
      if (response?.success === true) {
        console.log(
          "Creating user from Firebase data due to missing user data in response"
        );
        return {
          id: currentUser.uid,
          email: currentUser.email || "",
          name:
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "User",
          displayName:
            currentUser.displayName ||
            currentUser.email?.split("@")[0] ||
            "User",
          role: "user",
          isAdmin: false,
          emailVerified: currentUser.emailVerified,
          photoURL: currentUser.photoURL,
        };
      }

      // If we couldn't extract user data from the response, throw an error
      throw new Error("Invalid response format from server");
    } catch (err) {
      const error = err as any; // Type assertion for better error handling

      // If we get a 401 Unauthorized error, try to refresh the token and try again
      if (error?.response?.status === 401) {
        console.warn(
          "Token verification failed with 401, attempting to refresh token"
        );

        try {
          // Force refresh the token with multiple retries
          let retries = 3;
          let newToken = null;

          while (retries > 0 && !newToken) {
            try {
              console.log(
                `Attempting to refresh token (retries left: ${retries})`
              );
              newToken = await firebaseAuthService.getIdToken(true);

              if (newToken) {
                console.log("Successfully refreshed token");
                break;
              }

              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (innerError) {
              console.warn(
                `Token refresh attempt failed (retries left: ${retries})`,
                innerError
              );
              retries--;

              // Wait longer before retrying
              await new Promise((resolve) => setTimeout(resolve, 1500));
            }
          }

          if (!newToken) {
            throw new Error(
              "Failed to refresh authentication token after multiple attempts"
            );
          }

          // Set token in cookie as fallback for the backend
          document.cookie = `token=${newToken}; path=/; max-age=3600; SameSite=Strict`;

          // Get device info for better security
          const deviceInfo = {
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
          };

          // Try both endpoints again with the new token
          let retryResponse;
          try {
            // First try the direct endpoint
            retryResponse = await apiService.post(
              "/verify-token", // Direct endpoint
              deviceInfo, // Include device info
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
                timeout: 15000, // Increased timeout
              }
            );
            console.log("Retry with direct verify-token endpoint succeeded");
          } catch (directEndpointError) {
            console.warn(
              "Retry with direct endpoint failed, trying auth route",
              directEndpointError
            );

            // Fallback to the auth route
            retryResponse = await apiService.post(
              "/auth/verify-token", // Auth route
              deviceInfo, // Include device info
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
                timeout: 15000, // Increased timeout
              }
            );
            console.log(
              "Retry with auth route verify-token endpoint succeeded"
            );
          }

          console.log("Retry successful after token refresh:", {
            status: retryResponse?.success,
            hasUserData: !!retryResponse?.data?.data?.user,
          });

          // Extract user data from retry response
          if (retryResponse?.data?.data?.user) {
            return retryResponse.data.data.user;
          }
        } catch (retryError) {
          console.error("Retry after token refresh failed:", retryError);
          // Fall through to the original error handling
        }
      }

      console.error("Error syncing with backend:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if current user is admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user.isAdmin === true || user.role === "admin";
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      await firebaseAuthService.changePassword(currentPassword, newPassword);
    } catch (error) {
      console.error("Error updating password:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      // Re-authenticate user first
      const user = firebaseAuthService.getCurrentUser();
      if (!user || !user.email) {
        throw new Error("No authenticated user found");
      }

      // Delete account on backend first
      await apiService.delete("/auth/me");

      // Then delete Firebase account
      await firebaseAuthService.deleteAccount(password);
    } catch (error) {
      console.error("Error deleting account:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    // Check for specific error types
    if (error.response?.status === 401) {
      return new Error("Authentication failed. Please sign in again.");
    }

    if (error.response?.status === 403) {
      return new Error("You don't have permission to perform this action.");
    }

    if (error.response?.status === 404) {
      return new Error("User profile not found");
    }

    // Extract error message from response
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "An unknown error occurred";

    return new Error(errorMessage);
  }
}

export const userService = new UserService();

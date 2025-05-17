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
        // Explicitly set tokenBased to true for third-party providers (OAuth)
        tokenBased: user.providerData[0]?.providerId !== "password",
        isOAuthLogin: user.providerData[0]?.providerId !== "password",
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
          status: response?.data?.success,
          message: response?.data?.message,
          hasUser: !!response?.data?.user,
          hasData: !!response?.data?.data,
        });
        
        // Debug: Log full response structure to understand format
        console.log("📦 Full response structure:", JSON.stringify(response?.data, null, 2));

        // Verify the response contains user data
        if (response?.data?.user) {
          console.log("User data found in response.data.user");
          // Store the user's UID as the session ID for collection-based security
          localStorage.setItem("sessionId", user.uid);
          console.log(
            "Using user UID as session ID for collection-based security:",
            user.uid
          );
          console.log("User registered successfully with backend");
          return response.data.user;
        } else if (response?.data?.data) {
          console.log("User data found in response.data.data");
          // Store the user's UID as the session ID
          localStorage.setItem("sessionId", user.uid);
          return response.data.data;
        } else if (response?.data?.success === true && response?.data?.message?.includes("already registered")) {
          // Special case for "User already registered" response format
          console.log("User already registered in backend, continuing with authentication");
          localStorage.setItem("sessionId", user.uid);
          
          // If the response includes a user object, use it
          if (response?.data?.user) {
            console.log("Using user object from 'already registered' response");
            return response.data.user;
          }
          
          // Otherwise create a basic user object
          return {
            id: user.uid,
            email: user.email || "",
            name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
            displayName: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
            role: "user",
            isAdmin: false,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
          };
        } else if (response?.data?.success === true) {
          // If success is true but we don't have user data in the expected format
          console.log("Response indicates success but no user data in expected location");
          localStorage.setItem("sessionId", user.uid);
          
          // Return a basic user object derived from Firebase
          return {
            id: user.uid,
            email: user.email || "",
            name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
            displayName: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
            role: "user",
            isAdmin: false,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
          };
        }
        
        // If we get here, we don't have user data in the expected format
        console.error(
          "Invalid response format from server during registration:",
          response
        );
        throw new Error("Invalid response format from server");
      } catch (requestError: any) {
        // Log detailed error information for debugging
        console.error("❌ Registration request failed:", {
          status: requestError?.response?.status,
          statusText: requestError?.response?.statusText,
          url: registerUrl,
          errorMessage: requestError?.message,
          responseData: requestError?.response?.data,
        });

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
              status: fallbackResponse?.data?.success,
              message: fallbackResponse?.data?.message,
              hasUser: !!fallbackResponse?.data?.user,
              hasData: !!fallbackResponse?.data?.data,
            });

            // Handle different response formats
            if (fallbackResponse?.data?.user) {
              // Store user's UID as session ID
              localStorage.setItem("sessionId", user.uid);
              return fallbackResponse.data.user;
            } else if (fallbackResponse?.data?.data) {
              // Store user's UID as session ID
              localStorage.setItem("sessionId", user.uid);
              return fallbackResponse.data.data;
            } else if (fallbackResponse?.data?.success === true && fallbackResponse?.data?.message?.includes("already registered")) {
              // Special case for "User already registered" response format
              console.log("User already registered in backend, continuing with authentication");
              localStorage.setItem("sessionId", user.uid);
              return {
                id: user.uid,
                email: user.email || "",
                name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
                displayName: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
                role: "user",
                isAdmin: false,
                emailVerified: user.emailVerified,
                photoURL: user.photoURL,
              };
            }
            
            // If we get here, we don't have user data in the expected format
            console.error(
              "Invalid response format from server during fallback registration:",
              fallbackResponse?.data
            );
            
            return fallbackResponse.data;
          } catch (fallbackError: any) {
            console.error("❌ Fallback registration also failed:", {
              status: fallbackError?.response?.status,
              statusText: fallbackError?.response?.statusText,
              url: registerUrl,
              errorMessage: fallbackError?.message,
            });

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
        const errorMessage = error.response.data.error.message;          // Check if this is a password validation error during token-based registration
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
            // Check if this is an OAuth login and use the OAuth-specific method
            if (user.providerData[0]?.providerId !== "password") {
              try {
                return await this.registerOAuthUser(user);
              } catch (oauthError) {
                console.error("OAuth registration also failed:", oauthError);
              }
            }

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
                isOAuthLogin: user.providerData[0]?.providerId !== "password",
                skipPasswordValidation: true, // Explicitly request to skip password validation
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

            if (retryResponse?.data?.user) {
              console.log("Retry successful with explicit token-based flag");
              return retryResponse.data.user;
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
   * Handle OAuth registration specifically
   * This method is used when registering users who have signed in with OAuth providers
   */
  async registerOAuthUser(user: FirebaseUser): Promise<User> {
    try {
      // Get Firebase ID token
      let idToken = await user.getIdToken(true);

      // Prepare user data with explicit OAuth flags
      const userData = {
        email: user.email,
        name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
        idToken,
        provider: user.providerData[0]?.providerId || "oauth",
        emailVerified: user.emailVerified,
        tokenBased: true, 
        isOAuthLogin: true,
        skipPasswordValidation: true,
        deviceInfo: {
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          userAgent: navigator.userAgent,
        },
      };

      console.log("Registering OAuth user with backend:", {
        uid: user.uid,
        email: user.email,
        provider: userData.provider,
      });

      try {
        // First try the OAuth-specific endpoint
        let oauthResponse;
        try {
          oauthResponse = await apiService.post("/auth/oauth-register", userData, {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
            timeout: 15000,
          });
          console.log("OAuth-specific endpoint successful");
        } catch (endpointError: any) {
          // If we get a 404, the endpoint doesn't exist
          if (endpointError?.response?.status === 404) {
            console.log("OAuth-specific endpoint not found, using standard register endpoint");
            // Try the standard register endpoint
            oauthResponse = await apiService.post("/auth/register", userData, {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
              timeout: 15000,
            });
          } else {
            throw endpointError; // Rethrow other errors
          }
        }

        // Log the full response for debugging
        console.log("📦 OAuth registration full response:", JSON.stringify(oauthResponse?.data, null, 2));

        // Log the response format
        console.log("OAuth registration response:", {
          success: oauthResponse?.data?.success,
          message: oauthResponse?.data?.message,
          hasUser: !!oauthResponse?.data?.user
        });

        // Store the user's UID as the session ID
        localStorage.setItem("sessionId", user.uid);
        
        // Prioritize checking for "already registered" message first
        if (oauthResponse?.data?.success === true && oauthResponse?.data?.message?.includes("already registered")) {
          console.log("OAuth user already registered in backend");
          
          // If the response includes a user object, use it
          if (oauthResponse?.data?.user) {
            console.log("Using user object from 'already registered' response");
            return oauthResponse.data.user;
          }
          
          // Otherwise create a basic user object
          return {
            id: user.uid,
            email: user.email || "",
            name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
            displayName: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
            role: "user",
            isAdmin: false,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
            provider: user.providerData[0]?.providerId || "oauth"
          };
        } 
        // Then check for user object directly in the response
        else if (oauthResponse?.data?.user) {
          console.log("OAuth user registered successfully with backend");
          return oauthResponse.data.user;
        }
        // Check for success flag with no specific format
        else if (oauthResponse?.data?.success === true) {
          console.log("OAuth registration successful but no user object found");
          // Create a user object from the Firebase user
          return {
            id: user.uid,
            email: user.email || "",
            name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
            displayName: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
            role: "user",
            isAdmin: false,
            emailVerified: user.emailVerified,
            photoURL: user.photoURL,
            provider: user.providerData[0]?.providerId || "oauth"
          };
        } 
        // Finally, try to extract user data from any part of the response
        else {
          console.log("Response format unexpected, trying to extract user data");
          if (oauthResponse?.data?.data?.user) {
            return oauthResponse.data.data.user;
          } else if (oauthResponse?.data?.data) {
            return oauthResponse.data.data;
          } else {
            console.warn("Could not extract user data from response, using Firebase user");
            return {
              id: user.uid,
              email: user.email || "",
              name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
              displayName: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
              role: "user",
              isAdmin: false,
              emailVerified: user.emailVerified,
              photoURL: user.photoURL,
              provider: user.providerData[0]?.providerId || "oauth"
            };
          }
        }
      } catch (error: any) {
        console.warn("OAuth registration error:", error?.message || error);
        
        // If the error is about password validation, we're using a token-based auth
        // so we should skip password validation
        if (error?.response?.data?.error?.message?.includes("Password")) {
          console.warn("Password validation error during OAuth registration, retrying with explicit skip validation");
          
          try {
            // Retry with even more explicit settings
            const retryResponse = await apiService.post("/auth/register", {
              ...userData,
              skipPasswordValidation: true,
              password: null, // Explicitly set password to null for OAuth flow
              tokenBased: true,
              isOAuthLogin: true,
              isOAuth: true
            }, {
              headers: {
                Authorization: `Bearer ${idToken}`,
                "X-OAuth-Login": "true" // Additional header to indicate OAuth flow
              },
              timeout: 15000,
            });
            
            console.log("Retry successful with explicit skip validation");
            
            if (retryResponse?.data?.user) {
              return retryResponse.data.user;
            } else if (retryResponse?.data?.success) {
              // Success but no user object, use Firebase user data
              return {
                id: user.uid,
                email: user.email || "",
                name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
                displayName: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
                role: "user",
                isAdmin: false,
                emailVerified: user.emailVerified,
                photoURL: user.photoURL,
                provider: user.providerData[0]?.providerId || "oauth"
              };
            }
          } catch (retryError) {
            console.error("Retry also failed:", retryError);
            // Continue to fallback
          }
        }
        
        // Fall back to regular registration as a last resort
        console.warn("OAuth-specific registration failed, falling back to regular registration");
        return this.registerWithBackend(user);
      }
    } catch (error) {
      console.error("Error in OAuth registration:", error);
      // If the OAuth-specific registration fails, we continue with login anyway
      // This ensures users can still sign in even if backend registration has an issue
      return {
        id: user.uid,
        email: user.email || "",
        name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
        displayName: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
        role: "user",
        isAdmin: false, 
        emailVerified: user.emailVerified,
        photoURL: user.photoURL,
        provider: user.providerData[0]?.providerId || "oauth"
      };
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

      // Log the token we're using (safely)
      console.log("Using token for verification:", {
        length: idToken?.length,
        prefix: idToken?.substring(0, 10) + "..." || "undefined"
      });

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

      // Extract response structure data for logging
      const responseData = {
        success: response?.data?.success,
        message: response?.data?.message,
        hasUser: !!response?.data?.user,
        hasDataUser: !!response?.data?.data?.user,
        hasData: !!response?.data?.data,
      };
      console.log("Backend response format:", responseData);
      
      // Log the full response structure for debugging
      console.log("📦 Full response structure:", JSON.stringify(response?.data, null, 2));

      // First check for direct successful responses with user data from "User already registered" response
      if (response?.data?.success === true && response?.data?.message?.includes("already registered") && response?.data?.user) {
        console.log("Found user data in 'already registered' response");
        localStorage.setItem("sessionId", currentUser.uid);
        return response.data.user;
      }
      
      // Then check other response formats
      if (response?.data?.user) {
        // Direct user object in response
        const userData = response.data.user;
        localStorage.setItem("sessionId", currentUser.uid);
        console.log("User data found directly in response.data.user");
        
        if (!userData.id) userData.id = currentUser.uid;
        
        return userData;
      } else if (response?.data?.data?.user) {
        const userData = response.data.data.user;

        // Store the user's UID as the session ID for collection-based security
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

      if (response?.data?.success === true) {
        console.log(
          "Success response but missing user data, creating user from Firebase data"
        );
        
        // If success is true but no user object, check if there's a message about registration
        if (response?.data?.message?.includes("already registered")) {
          console.log("Found 'already registered' message");
          
          // If the response has a user object, use it
          if (response?.data?.user) {
            console.log("Found user object in 'already registered' response");
            localStorage.setItem("sessionId", currentUser.uid);
            return response.data.user;
          }
        }
        
        // Fallback to constructing a user from Firebase data
        localStorage.setItem("sessionId", currentUser.uid);
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
   * A simplified test method to debug response format issues
   */
  async testBackendResponseFormat(user: FirebaseUser): Promise<any> {
    try {
      // Get a fresh token
      const idToken = await user.getIdToken(true);
      
      console.log("Testing backend response format with token:", {
        tokenLength: idToken.length,
        prefix: idToken.substring(0, 10) + "..."
      });

      // Prepare user data with explicit OAuth flags
      const userData = {
        email: user.email,
        name: user.displayName || (user.email ? user.email.split("@")[0] : "User"),
        idToken,
        provider: user.providerData[0]?.providerId || "password",
        emailVerified: user.emailVerified,
        tokenBased: true,
        isOAuthLogin: user.providerData[0]?.providerId !== "password",
        skipPasswordValidation: true,
        deviceInfo: {
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          userAgent: navigator.userAgent,
        },
      };
      
      // Try both OAuth and regular registration endpoints
      // Define a proper type for the responses object
      interface ResponseData {
        [key: string]: any;
      }
      
      const responses: ResponseData = {
        oauth: null,
        register: null,
        register_format: null,
        verify: null
      };
      
      // Try OAuth registration endpoint
      try {
        const oauthResponse = await apiService.post('/auth/oauth-register', userData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "X-OAuth-Login": "true"
          },
          timeout: 15000
        });
        
        console.log("OAUTH REGISTER ENDPOINT RESPONSE:", JSON.stringify(oauthResponse.data, null, 2));
        responses.oauth = oauthResponse.data;
      } catch (oauthError: any) {
        console.log("OAUTH REGISTER ENDPOINT ERROR:", {
          status: oauthError?.response?.status,
          message: oauthError?.message,
          data: oauthError?.response?.data
        });
        responses.oauth = { error: true, status: oauthError?.response?.status, message: oauthError?.message };
      }
      
      // Try regular register endpoint
      try {
        const registerResponse = await apiService.post('/auth/register', userData, {
          headers: {
            Authorization: `Bearer ${idToken}`
          },
          timeout: 15000
        });
        
        console.log("REGISTER ENDPOINT RESPONSE:", JSON.stringify(registerResponse.data, null, 2));
        responses.register = registerResponse.data;
        
        // Check if the data has the format we expect
        if (registerResponse.data && registerResponse.data.success === true) {
          if (registerResponse.data.user) {
            console.log("✓ User object found directly in response.data.user");
            responses.register_format = {
              foundIn: "response.data.user",
              userData: registerResponse.data.user
            };
          } else if (registerResponse.data.message && registerResponse.data.message.includes("already registered")) {
            console.log("✓ Found 'already registered' message");
            responses.register_format = {
              foundIn: "already registered message",
              userData: registerResponse.data.user || null,
              hasUserObject: !!registerResponse.data.user
            };
          }
        }
      } catch (registerError: any) {
        console.log("REGISTER ENDPOINT ERROR:", {
          status: registerError?.response?.status,
          message: registerError?.message,
          data: registerError?.response?.data
        });
        responses.register = { error: true, status: registerError?.response?.status, message: registerError?.message };
      }
      
      // Try verify-token endpoint
      try {
        const verifyResponse = await apiService.post('/auth/verify-token', {}, {
          headers: {
            Authorization: `Bearer ${idToken}`
          },
          timeout: 15000
        });
        
        console.log("VERIFY TOKEN ENDPOINT RESPONSE:", JSON.stringify(verifyResponse.data, null, 2));
        responses.verify = verifyResponse.data;
      } catch (verifyError: any) {
        console.log("VERIFY TOKEN ENDPOINT ERROR:", {
          status: verifyError?.response?.status,
          message: verifyError?.message,
          data: verifyError?.response?.data
        });
        responses.verify = { error: true, status: verifyError?.response?.status, message: verifyError?.message };
      }
      
      return {
        diagnostic: "complete",
        uid: user.uid,
        provider: user.providerData[0]?.providerId || "unknown",
        emailVerified: user.emailVerified,
        responses
      };
    } catch (error: any) {
      console.error("Test failed:", error);
      return {
        error: true,
        message: error.message,
        response: error.response?.data || null
      };
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    // Log the full error for debugging
    console.error("Error details for debugging:", {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : 'No response object',
      request: error.request ? 'Request present' : 'No request object',
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers
      } : 'No config object'
    });

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

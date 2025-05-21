import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { arcjetService } from "../services/arcjet.service";
import { login_hero } from "../assets";
import NavbarLogin from "../components/Navbar/navbar_login";
import { motion } from "framer-motion";
import Loading from "../components/ui/loading";

export default function FirebaseLogin() {
  const {
    login,
    loginWithGoogle,
    error: authError,
    user,
    loading,
  } = useFirebaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      console.log("User is already authenticated, redirecting from login page");
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  // Handle loading state separately to avoid getting stuck
  useEffect(() => {
    // Only show loading state for a maximum of 5 seconds
    if (loading) {
      setIsSubmitting(true);

      // Set a timeout to clear the loading state after 5 seconds
      const timeout = setTimeout(() => {
        setIsSubmitting(false);
      }, 5000);

      return () => clearTimeout(timeout);
    } else {
      setIsSubmitting(false);
    }
  }, [loading]);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");

    // Check Firebase configuration in development mode
    if (import.meta.env.DEV) {
      checkFirebaseConfig();
    }

    // Parse error from URL if present
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");

    if (errorParam) {
      let errorMessage = "An error occurred during authentication.";

      switch (errorParam) {
        case "auth_failed":
          errorMessage = "Authentication failed. Please try again.";
          break;
        case "session_expired":
          errorMessage = "Your session has expired. Please sign in again.";
          break;
        case "no_token":
          errorMessage = "No authentication token was provided.";
          break;
        case "google_auth_failed":
          errorMessage = "Google authentication failed. Please try again.";
          break;
      }

      setError(errorMessage);
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [location.search]);

  // Set error from auth context
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Debounce function to prevent multiple rapid submissions
  const debounce = (func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Optimized submit handler with debouncing
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    // Set a timeout to prevent getting stuck in loading state
    const loadingTimeout = setTimeout(() => {
      setIsSubmitting(false);
      setError("Login request timed out. Please try again.");
    }, 10000);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsSubmitting(false);
      clearTimeout(loadingTimeout);
      return;
    }

    // Validate email domain
    if (!email.toLowerCase().endsWith("@iiitkottayam.ac.in")) {
      setError(
        "Please use an IIIT Kottayam email address (@iiitkottayam.ac.in)"
      );
      setIsSubmitting(false);
      clearTimeout(loadingTimeout);
      return;
    }

    try {
      // Apply Arcjet protection for authentication with a timeout
      const arcjetPromise = arcjetService.protectAuth(email);
      const arcjetTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Arcjet protection timed out")), 3000)
      );

      try {
        // Race the Arcjet protection against a timeout
        await Promise.race([arcjetPromise, arcjetTimeout]);
      } catch (arcjetError) {
        console.warn("Arcjet protection skipped:", arcjetError);
        // Continue with login even if Arcjet times out
      }

      console.log("Attempting to login with email:", email);
      await login(email, password);
      console.log("Login successful, navigating to home page");
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Login error in component:", error);

      // Check if it's an Arcjet error
      if (
        error.message?.includes("blocked") ||
        error.message?.includes("rate limit")
      ) {
        setError("Too many login attempts. Please try again later.");
      } else {
        // Error message is already handled by the Firebase auth service
        setError(error.message || "Invalid email or password");
      }
    } finally {
      clearTimeout(loadingTimeout);
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Prevent multiple submissions
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Set a timeout to prevent getting stuck in loading state
      const loadingTimeout = setTimeout(() => {
        setIsSubmitting(false);
        setError("Google login request timed out. Please try again.");
      }, 10000);

      // Apply Arcjet protection for Google login with a timeout
      const arcjetPromise = arcjetService.protectSocialAuth("google");
      const arcjetTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Arcjet protection timed out")), 3000)
      );

      try {
        // Race the Arcjet protection against a timeout
        await Promise.race([arcjetPromise, arcjetTimeout]);
      } catch (arcjetError) {
        console.warn(
          "Arcjet protection skipped for Google login:",
          arcjetError
        );
        // Continue with login even if Arcjet times out
      }

      await loginWithGoogle();
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Google login error:", error);

      // Check if it's an Arcjet error
      if (
        error.message?.includes("blocked") ||
        error.message?.includes("rate limit")
      ) {
        setError("Too many login attempts. Please try again later.");
      } else {
        setError(error.message || "Google login failed. Please try again.");
      }
    } finally {
      clearTimeout(loadingTimeout);
      setIsSubmitting(false);
    }
  };

  // Function to check Firebase configuration
  const checkFirebaseConfig = () => {
    try {
      // Check if Firebase config values are set
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

      if (!apiKey || !authDomain || !projectId) {
        console.error("Firebase configuration is incomplete:", {
          apiKey: apiKey ? "Set" : "Missing",
          authDomain: authDomain ? "Set" : "Missing",
          projectId: projectId ? "Set" : "Missing",
        });
        setError(
          "Firebase configuration is incomplete. Please contact support."
        );
      } else {
        console.log("Firebase configuration is complete");
      }
    } catch (error) {
      console.error("Error checking Firebase configuration:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#9FE196]">
      <NavbarLogin />
      {/* Global loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
            <Loading />
            <p className="mt-2 text-gray-700">Connecting to server...</p>
          </div>
        </div>
      )}
      <div className="flex flex-grow">
        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="basis-2/5 bg-[#9FE196] flex flex-col justify-center items-center p-8"
        >
          <header className="text-center text-[#006833] font-acme text-3xl lg:text-4xl xl:text-5xl pt-12">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Unlock Your Mind
            </motion.h1>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Begin Your Quest
            </motion.h1>
          </header>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <img
              src={login_hero}
              alt="Mind Quest Illustration"
              className="w-full max-w-2xl"
              style={{ transform: "translateX(22.5%) translateY(-16%)" }}
            />
          </motion.div>
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="basis-3/5 bg-white flex justify-center items-center p-8 mt-[-20px]"
        >
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="text-center text-3xl font-bold text-gray-900">
                Welcome Back
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Sign in to continue your journey
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    autoFocus
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006833] focus:border-[#006833] transition-colors"
                    placeholder="Enter your iiitkottayam.ac.in email"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Only iiitkottayam.ac.in email addresses are allowed
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-[#006833] hover:text-[#005229] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      maxLength={40}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006833] focus:border-[#006833] transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md relative"
                  role="alert"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </motion.div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isSubmitting
                      ? "bg-[#88c288] cursor-not-allowed"
                      : "bg-[#006833] hover:bg-[#005229]"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006833] transition-colors`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006833] transition-colors"
              >
                <img
                  className="h-5 w-5 mr-2"
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                />
                Google
              </button>
              <p className="mt-1 text-xs text-center text-gray-500">
                Only iiitkottayam.ac.in Google accounts are allowed
              </p>

              <p className="mt-2 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-[#006833] hover:text-[#005229] transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

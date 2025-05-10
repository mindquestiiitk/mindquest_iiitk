import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { login_hero } from "../assets";
import NavbarLogin from "../components/Navbar/navbar_login";
import { motion } from "framer-motion";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("overflow-hidden");

    // Check Firebase configuration in development mode
    if (import.meta.env.NODE_ENV) {
      checkFirebaseConfig();
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Attempting to login with email:", email);
      await login(email, password);
      console.log("Login successful, navigating to home page");
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Login error in component:", error);

      // Provide a more user-friendly error message
      if (error.message && error.message.includes("auth/invalid-credential")) {
        setError(
          "Invalid login credentials. Please check your email and password."
        );
      } else if (
        error.message &&
        error.message.includes("auth/user-not-found")
      ) {
        setError(
          "No account found with this email. Please check your email or register."
        );
      } else if (
        error.message &&
        error.message.includes("auth/wrong-password")
      ) {
        setError("Incorrect password. Please try again.");
      } else if (
        error.message &&
        error.message.includes("auth/too-many-requests")
      ) {
        setError(
          "Too many unsuccessful login attempts. Please try again later or reset your password."
        );
      } else if (
        error.message &&
        error.message.includes("auth/network-request-failed")
      ) {
        setError(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        setError(error.message || "Invalid email or password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // const from = location.state?.from?.pathname || "/";
      // navigate(from, { replace: true });
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message || "Google login failed. Please try again.");
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#006833] focus:border-[#006833] transition-colors"
                    placeholder="Enter your email"
                  />
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
                  <p className="mt-1 text-xs text-gray-500">
                    Using Google Sign-In?{" "}
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#006833] hover:text-[#005229]"
                    >
                      Manage your Google account
                    </a>
                  </p>
                  <div className="relative">
                    <input
                      maxLength={40}
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
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
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#006833] hover:bg-[#005229] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006833] transition-colors ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
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

              <p className="mt-2 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-[#006833] hover:text-[#005229] transition-colors"
                >
                  Sign up
                </Link>
              </p>

              {/* Hidden in production, only for debugging */}
              {import.meta.env.NODE_ENV && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={checkFirebaseConfig}
                    className="w-full text-xs text-gray-500 hover:text-gray-700"
                  >
                    Check Firebase Configuration
                  </button>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

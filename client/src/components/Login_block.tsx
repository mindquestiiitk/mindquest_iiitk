import { useState } from "react";
import { toast } from "../components/ui/use-toast";
import ErrorDisplay from "./ErrorDisplay";
import { handleError } from "../utils/error-handler";
import { Loader2 } from "lucide-react";

const Login_block = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(
    null
  );

  const handleLogin = async () => {
    // Clear previous errors
    setError(null);

    // Validate inputs
    if (!email.trim()) {
      setError({
        message: "Please enter your email address",
        code: "missing_fields",
      });
      return;
    }

    if (!password) {
      setError({
        message: "Please enter your password",
        code: "missing_fields",
      });
      return;
    }

    try {
      setLoading(true);

      // Simulate login for demo - replace with actual login API call
      // const response = await apiService.post('/auth/login', { email, password });

      // For demo purposes, show error for invalid credentials
      if (email !== "admin@example.com" || password !== "password123") {
        throw new Error("Invalid email or password");
      }

      // Show success toast
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      // Redirect to dashboard or home page
      // navigate('/dashboard');
    } catch (error) {
      // Handle error with our utility
      const errorDetails = handleError(error, {
        title: "Login failed",
        defaultMessage: "Invalid email or password. Please try again.",
        showToast: false, // We'll show our own error display instead of a toast
      });

      // Set error state to display in the UI
      setError(errorDetails);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md bg-[#d4f5d4] rounded-3xl shadow-lg p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-medium text-primary-green mb-8 font-acme">
          Login
        </h1>

        {/* Error display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay
              message={error.message}
              code={error.code}
              severity="error"
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        <div className="space-y-6">
          <div className="relative">
            <label
              htmlFor="email"
              className="text-sm text-primary-green/80 mb-1 block"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pb-2 border-b-2 border-gray-300 bg-transparent text-primary-green focus:outline-none focus:border-[#006833]"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className="text-sm text-primary-green/80 mb-1 block"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pb-2 border-b-2 border-gray-300 bg-transparent text-primary-green focus:outline-none focus:border-[#006833]"
              placeholder="Enter your password"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
          </div>

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-sm text-primary-green hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary-green text-secondary-green font-medium rounded-2xl mt-4 flex items-center justify-center"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-center mt-4 text-sm text-primary-green/80">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-primary-green font-medium hover:underline"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login_block;

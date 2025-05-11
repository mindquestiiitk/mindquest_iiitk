import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.tsx";
import { authService } from "../services/auth.service.js";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleAuthCallback } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        navigate("/login?error=" + error);
        return;
      }

      if (token) {
        try {
          const response = await authService.handleCallback(token);
          if (response.success) {
            handleAuthCallback(token);
            navigate("/dashboard");
          } else if (response.needsRegistration) {
            // Store the user data and token in localStorage for registration
            localStorage.setItem(
              "pending_registration",
              JSON.stringify({
                token,
                userData: response.userData,
              })
            );
            navigate("/register");
          } else {
            navigate("/login?error=auth_failed");
          }
        } catch (error) {
          console.error("Auth callback error:", error);
          navigate("/login?error=auth_failed");
        }
      } else {
        navigate("/login?error=no_token");
      }
      setIsLoading(false);
    };

    handleCallback();
  }, [searchParams, navigate, handleAuthCallback]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

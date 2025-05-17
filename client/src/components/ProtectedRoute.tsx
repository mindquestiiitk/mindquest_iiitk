import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useEffect } from "react";
import Loading from "./ui/loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  // Use only Firebase authentication
  const { user, loading } = useFirebaseAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  // If route requires auth and user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route is auth-only (login/register) and user is authenticated
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Component to prevent logged-in users from accessing login and register pages
export const PublicRoute = ({ children }: ProtectedRouteProps) => {
  // Use only Firebase authentication
  const { user, loading } = useFirebaseAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if the user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      console.log("User is already authenticated, redirecting from auth page");
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, loading, location.state, navigate]);

  if (loading) {
    return <Loading message="Checking authentication..." />;
  }

  if (user) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

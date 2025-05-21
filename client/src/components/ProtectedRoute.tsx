import { Navigate, useLocation } from "react-router-dom";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import Loading from "./ui/loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * ProtectedRoute component handles authentication-based routing:
 * - When requireAuth=true: Redirects to login if user is not authenticated
 * - When requireAuth=false: Redirects to home if user is already authenticated (for login/register pages)
 *
 * Performance optimization: Only checks authentication when requireAuth is true
 */
export default function ProtectedRoute({
  children,
  requireAuth = true,
}: ProtectedRouteProps) {
  const location = useLocation();

  // Only use authentication when required
  const { user, loading } = requireAuth
    ? useFirebaseAuth()
    : { user: null, loading: false };

  // Show loading state only when authentication check is in progress and required
  if (requireAuth && loading) {
    return <Loading message="Checking authentication..." />;
  }

  // If route requires auth and user is not authenticated, redirect to login
  if (requireAuth && !user && !loading) {
    console.log("Authentication required, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route is auth-only (login/register) and user is authenticated, redirect to home or original location
  if (!requireAuth && user) {
    const from = location.state?.from?.pathname || "/";
    console.log(
      "User already authenticated, redirecting from auth page to",
      from
    );
    return <Navigate to={from} replace />;
  }

  // If authentication requirements are met, render the children
  return <>{children}</>;
}

/**
 * PublicRoute is for routes that don't require authentication checks
 * This is optimized to not perform any authentication checks at all
 * for better performance
 */
export const PublicRoute = ({ children }: ProtectedRouteProps) => {
  // Simply render children without any authentication checks
  return <>{children}</>;
};

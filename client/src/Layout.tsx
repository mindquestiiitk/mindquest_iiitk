import { Outlet, useLocation } from "react-router-dom";
import Navbar_Home from "./components/Navbar/Navbar_Home";
// Import removed - using lazy loading instead
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useFirebaseAuth } from "./contexts/FirebaseAuthContext";
import { lazy, Suspense, useEffect, useState } from "react";

// Lazy load the authenticated navbar to improve performance
const LazyNavbarAuth = lazy(
  () => import("./components/Navbar/Navbar_Home_Auth")
);

const Layout = () => {
  const location = useLocation();
  const [showAuthNav, setShowAuthNav] = useState(false);

  // Don't show the authenticated navbar on login and register pages
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Only check authentication for pages that need the auth navbar
  const { user } = !isAuthPage ? useFirebaseAuth() : { user: null };

  // Determine if we should show the auth navbar
  useEffect(() => {
    if (user && !isAuthPage) {
      setShowAuthNav(true);
    } else {
      setShowAuthNav(false);
    }
  }, [user, isAuthPage]);

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <div className="relative flex flex-col min-h-screen">
        <div className="z-30 w-full pb-2">
          {showAuthNav ? (
            <Suspense fallback={<Navbar_Home />}>
              <LazyNavbarAuth />
            </Suspense>
          ) : (
            <Navbar_Home />
          )}
        </div>
        <Outlet />
        <Footer />
      </div>
    </>
  );
};

export default Layout;

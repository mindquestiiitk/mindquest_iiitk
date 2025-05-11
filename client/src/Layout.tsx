import { Outlet, useLocation } from "react-router-dom";
import Navbar_Home from "./components/Navbar/Navbar_Home";
import Navbar_Home_Auth from "./components/Navbar/Navbar_Home_Auth";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useAuth } from "./contexts/AuthContext";

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Don't show the authenticated navbar on login and register pages
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <div className="relative flex flex-col min-h-screen">
        <div className="z-30 w-full pb-2">
          {user && !isAuthPage ? <Navbar_Home_Auth /> : <Navbar_Home />}
        </div>
        <Outlet />
        <Footer />
      </div>
    </>
  );
};

export default Layout;

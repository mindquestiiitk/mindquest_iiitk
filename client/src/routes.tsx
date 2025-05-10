import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import { EventDetail } from "./Pages/EventDetails";
import { Events } from "./Pages/Events";
import { Teams } from "./Pages/Teams";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import { Merch } from "./Pages/Merch";
import MerchCheckout from "./Pages/Merch/MerchCheckout";
import ThemePage from "./Pages/Themepage";
import Profile from "./Pages/Profile";
import ProtectedRoute, { PublicRoute } from "./components/ProtectedRoute";
import ConnectionStatus from "./components/ConnectionStatus";
import AuthCallback from "./Pages/AuthCallback";
import NotFound from "./Pages/NotFound";

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/team" element={<Teams />} />{" "}
          {/* Redirect old route to new component */}
          <Route path="/theme" element={<ThemePage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/merch/checkout" element={<MerchCheckout />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ConnectionStatus />
    </>
  );
};

export default AppRoutes;

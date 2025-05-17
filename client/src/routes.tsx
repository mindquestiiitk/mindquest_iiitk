import { Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import { EventDetail } from "./Pages/EventDetails";
import { Events } from "./Pages/Events";
import { Teams } from "./Pages/Teams";
import Home from "./Pages/Home";
import FirebaseLogin from "./Pages/FirebaseLogin";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import { Merch } from "./Pages/Merch";
import MerchCheckout from "./Pages/Merch/MerchCheckout";
import ThemePage from "./Pages/Themepage";
import Profile from "./Pages/Profile";
import ProtectedRoute, { PublicRoute } from "./components/ProtectedRoute";
import ConnectionStatus from "./components/ConnectionStatus";
import NotFound from "./Pages/NotFound";
import ServerError from "./Pages/ServerError";
import ErrorDemo from "./Pages/ErrorDemo";

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/forgot-password"
          element={
            <ProtectedRoute>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <PublicRoute>
              <Layout />
            </PublicRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/team" element={<Teams />} />
          {/* Redirect old route to new component */}
          <Route path="/theme" element={<ThemePage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/merch/checkout" element={<MerchCheckout />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/error-demo" element={<ErrorDemo />} />
        </Route>
        <Route path="/error" element={<ServerError />} />
        <Route path="/error/:statusCode" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <FirebaseLogin />
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
      </Routes>
      <ConnectionStatus />
    </>
  );
};

export default AppRoutes;

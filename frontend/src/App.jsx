import React from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/useAuthStore";
import LoginScreen from "./pages/LoginScreen";
import LandingPage from "./pages/LandingPage";
import FarmerDashboard from "./pages/FarmerDashboard";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import LabsDashboard from "./pages/LabsDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SignupForm from "./components/auth/SignupForm";
import { PublicQRTracker } from "./components/QRComponents";

// --- Helper Components ---

const ProtectedRoute = () => {
  const isLoading = useAuthStore((state) => state.isLoading);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const isLoading = useAuthStore((state) => state.isLoading);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLoading) return;

    if (accessToken && user) {
      const role = user.role.toLowerCase();
      if (role === "admin") navigate("/admin");
      else if (role === "farmer") navigate("/farmer");
      else if (role === "manufacturer") navigate("/manufacturer");
      else if (role === "lab" || role === "laboratory") navigate("/labs");
    }
  }, [accessToken, user, isLoading, navigate]);

  return children;
};

// --- Main App Component ---

const App = () => {
  // Initialize session restoration on app mount
  const restoreSession = useAuthStore((state) => state.restoreSession);

  React.useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e293b",
            color: "#fff",
            border: "1px solid #334155",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10b981",
              color: "#fff",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#ef4444",
              color: "#fff",
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: "#1e293b",
              color: "#fff",
              border: "1px solid #334155",
            },
          },
        }}
      />
      <div className="min-h-screen bg-slate-950">
        <Routes>
          {/* Public/Guest routes */}
          <Route
            path="/"
            element={
              <GuestRoute>
                <LandingPage />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginScreen />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignupForm />
              </GuestRoute>
            }
          />

          {/* QR Tracking routes - PUBLIC ACCESS (no authentication required) */}
          <Route path="/track/:qrCode" element={<PublicQRTracker />} />

          {/* Protected dashboard routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/manufacturer" element={<ManufacturerDashboard />} />
            <Route path="/labs" element={<LabsDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
};

export default App;

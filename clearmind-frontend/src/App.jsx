import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast";

import Login from "./Login";
import Registration from "./Registration";

import DoctorDashboard from "./DoctorPages/DoctorDashboard";
import DoctorAppointment from "./DoctorPages/DoctorAppointment";
import DoctorPatient from "./DoctorPages/DoctorPatient";
import DoctorProfile from "./DoctorPages/DoctorProfile";

import CreateAccounts from "./AdminPages/CreateAccounts";
import AdminDashboard from "./AdminPages/AdminDashboard";
import ManageAccounts from "./AdminPages/ManageAccounts";
import AdminProfile from "./AdminPages/AdminProfile";
import AdminMessages from "./AdminPages/AdminMessages";
import AdminClinic from "./AdminPages/AdminClinic";
import AdminPatient from "./AdminPages/AdminPatient";
import AdminAppointment from "./AdminPages/AdminAppointment";
import AdminBilling from "./AdminPages/AdminBilling";

// ─────────────────────────────────────────────────────────────────────────────
// Helper: plain reads from localStorage — no useState, no re-renders
// ─────────────────────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("token");
const getRole  = () => localStorage.getItem("role");

// ─────────────────────────────────────────────────────────────────────────────
// GuestRoute — uses <Outlet /> to avoid wrapping children (fixes infinite loop)
// If already logged in → redirect to dashboard, otherwise render the page
// ─────────────────────────────────────────────────────────────────────────────
function GuestRoute() {
  const token = getToken();
  const role  = getRole();

  if (!token) return <Outlet />;  // not logged in → show page normally

  switch (role) {
    case "Admin":  return <Navigate to="/admin/dashboard"  replace />;
    case "Doctor": return <Navigate to="/doctor/dashboard" replace />;
    case "Client": return <Navigate to="/client/home"      replace />;
    default:       return <Navigate to="/"                 replace />;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute — uses <Outlet /> layout pattern
// allowedRoles: e.g. ["Admin"] or ["Admin","Doctor"]
// ─────────────────────────────────────────────────────────────────────────────
function ProtectedRoute({ allowedRoles }) {
  const token = getToken();
  const role  = getRole();

  if (!token) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Unauthorized Page
// ─────────────────────────────────────────────────────────────────────────────
function Unauthorized() {
  const role = getRole();
  const getDashboard = () => {
    switch (role) {
      case "Admin":  return "/admin/dashboard";
      case "Doctor": return "/doctor/dashboard";
      case "Client": return "/client/home";
      default:       return "/";
    }
  };
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "100vh", fontFamily: "Arial, sans-serif",
    }}>
      <h1 style={{ fontSize: "4rem", color: "#a276d0" }}>403</h1>
      <h2>Access Denied</h2>
      <p style={{ color: "#666" }}>You don't have permission to view this page.</p>
      <a href={getDashboard()} style={{
        marginTop: "1rem", padding: "0.6rem 1.5rem",
        background: "#a276d0", color: "white",
        borderRadius: "8px", textDecoration: "none",
      }}>
        Go to My Dashboard
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Router>
        <Routes>

          {/* ── Guest-only (redirect if already logged in) ─────────── */}
          <Route element={<GuestRoute />}>
            <Route path="/"         element={<Login />} />
            <Route path="/register" element={<Registration />} />
          </Route>

          {/* ── Misc ──────────────────────────────────────────────── */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── Admin routes ──────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/admin/profile"     element={<AdminProfile />} />
            <Route path="/admin/messages"    element={<AdminMessages />} />
            <Route path="/admin/clinic"      element={<AdminClinic />} />
            <Route path="/admin/patients"    element={<AdminPatient />} />
            <Route path="/admin/appointment" element={<AdminAppointment />} />
            <Route path="/admin/billing"     element={<AdminBilling />} />
            <Route path="/manage/account"    element={<ManageAccounts />} />
            <Route path="/create/accounts"   element={<CreateAccounts />} />
          </Route>

          {/* ── Doctor routes ─────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={["Doctor"]} />}>
            <Route path="/doctor/dashboard"   element={<DoctorDashboard />} />
            <Route path="/doctor/appointment" element={<DoctorAppointment />} />
            <Route path="/doctor/patient"     element={<DoctorPatient />} />
            <Route path="/doctor/profile"     element={<DoctorProfile />} />
          </Route>

          {/* ── Catch-all → Login ─────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
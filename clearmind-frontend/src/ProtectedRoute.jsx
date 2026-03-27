import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute
 * Usage: <ProtectedRoute role="Admin"> <AdminDashboard /> </ProtectedRoute>
 * If not logged in → redirects to /
 * If wrong role    → redirects to their own dashboard
 */
function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Wrong role
  if (role && userRole !== role) {
    switch (userRole) {
      case "Admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "Doctor":
        return <Navigate to="/doctor/dashboard" replace />;
      case "Client":
        return <Navigate to="/client/home" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
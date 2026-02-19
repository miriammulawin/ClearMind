import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ allowedRole, children }) {
  // Get token and role from localStorage
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If no token or role doesn't match, redirect to login
  if (!token || role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, allow access
  return children;
}

export default ProtectedRoute;

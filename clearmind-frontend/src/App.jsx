import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast";

import Login from "./Login";
import Registration from "./Registration";
import CreateAccounts from "./AdminPages/CreateAccounts";
import AdminDashboard from "./AdminPages/AdminDashboard";

import DoctorAppointment from "./DoctorPages/DoctorAppointment";
import DoctorPatient from "./DoctorPages/DoctorPatient";
import DoctorBilling from "./DoctorPages/DoctorBilling";
import DoctorProfile from "./DoctorPages/DoctorProfile";

import ProtectedRoute from "../ProtectedRoute";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Router>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRole="Admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create/accounts"
            element={
              <ProtectedRoute allowedRole="Admin">
                <CreateAccounts />
              </ProtectedRoute>
            }
          />

          {/* DOCTOR ROUTES */}
          <Route
            path="/doctor/appointment"
            element={
              <ProtectedRoute allowedRole="Doctor">
                <DoctorAppointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/patient"
            element={
              <ProtectedRoute allowedRole="Doctor">
                <DoctorPatient />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/billing"
            element={
              <ProtectedRoute allowedRole="Doctor">
                <DoctorBilling />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRole="Doctor">
                <DoctorProfile />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Router>
    </>
  );
}

export default App;

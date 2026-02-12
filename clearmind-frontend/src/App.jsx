import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast"; 

import Login from "./Login";
import Registration from "./Registration";

import DoctorAppointment from "./DoctorPages/DoctorAppointment";
import DoctorPatient from "./DoctorPages/DoctorPatient";
import DoctorBilling from "./DoctorPages/DoctorBilling";
import DoctorProfile from "./DoctorPages/DoctorProfile"

import CreateAccounts from "./AdminPages/CreateAccounts";
import AdminDashboard from "./AdminPages/AdminDashboard";
import ManageAccounts from "./AdminPages/ManageAccounts";
import AdminProfile from "./AdminPages/AdminProfile";
import AdminMessages from "./AdminPages/AdminMessages";
import AdminClinic from "./AdminPages/AdminClinic";
import AdminPatient from "./AdminPages/AdminPatient";
import AdminAppointment from "./AdminPages/AdminAppointment";
import AdminBilling from "./AdminPages/AdminBilling";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/create/accounts" element={<CreateAccounts />} />
          
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/manage/account" element={<ManageAccounts />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/clinic" element={<AdminClinic />} />
          <Route path="/admin/patients" element={<AdminPatient />} />
          <Route path="/admin/appointment" element={<AdminAppointment />} />
          <Route path="/admin/billing" element={<AdminBilling />} />

          <Route path="/doctor/appointment" element={<DoctorAppointment />} />
          <Route path="/doctor/patient" element={<DoctorPatient />} />
          <Route path="/doctor/billing" element={<DoctorBilling />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
        </Routes>
      </Router>
    </>
  );
}
export default App;

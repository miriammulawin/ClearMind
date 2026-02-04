import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast"; 
import Login from "./Login";
import CreateAccounts from "./AdminPages/CreateAccounts"
import Registration from "./Registration";
import AdminDashboard from "./AdminPages/AdminDashboard";

import DoctorAppointment from "./DoctorPages/DoctorAppointment";
import DoctorPatient from "./DoctorPages/DoctorPatient";
import DoctorBilling from "./DoctorPages/DoctorBilling";
import DoctorProfile from "./DoctorPages/DoctorProfile"


function App() {
  return (
    <>
    <Toaster position="top-center" /> 
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/create/accounts"element={<CreateAccounts/>} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        

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

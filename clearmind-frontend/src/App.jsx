import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login";
import CreateAccounts from "./AdminPages/CreateAccounts";
import Registration from "./ClientPages/Registration";
import AdminDashboard from "./AdminPages/AdminDashboard";
import AdminAppointment from "./AdminPages/AdminAppointment";
import AdminPatient from "./AdminPages/AdminPatient";
import DoctorAccount from "./AdminPages/DoctorAccount";
import AdminClinic from "./AdminPages/AdminClinic";


import DoctorAppointment from "./DoctorPages/DoctorAppointment";
import DoctorPatient from "./DoctorPages/DoctorPatient";
import DoctorBilling from "./DoctorPages/DoctorBilling";
import DoctorProfile from "./DoctorPages/DoctorProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/patients" element={<AdminPatient />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/create-accounts" element={<CreateAccounts />} />
        <Route path="/create-accounts" element={<CreateAccounts />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/create-doctors" element={<DoctorAccount />} />
        <Route path="/admin-appointment" element={<AdminAppointment />} />
        <Route path="/admin-clinic" element={<AdminClinic />} />

         <Route path="/doctor/appointment" element={<DoctorAppointment />} />
         <Route path="/doctor/patient" element={<DoctorPatient />} />
        <Route path="/doctor/billing" element={<DoctorBilling />} />
         <Route path="/doctor/profile" element={<DoctorProfile />} />
      </Routes>
    </Router>
  );
}
export default App;

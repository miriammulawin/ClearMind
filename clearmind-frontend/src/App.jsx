import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast"; 
import Login from "./Login";
import CreateAccounts from "./AdminPages/CreateAccounts"
import Registration from "./Registration";
import AdminDashboard from "./AdminPages/AdminDashboard";
import ClientHome from "./ClientPages/ClientHome";
import ClientAppointment from "./ClientPages/ClientAppointment";
import ServicesTab from "./ClientPages/ClientComponents/AppointmentComponents/ServicesTab";
import PendingTab from "./ClientPages/ClientComponents/AppointmentComponents/PendingTab";
import UpcomingTab from "./ClientPages/ClientComponents/AppointmentComponents/ScheduleTab";
import HistoryTab from "./ClientPages/ClientComponents/AppointmentComponents/HistoryTab";
import ClientMessages from "./ClientPages/ClientMessages";
import ClientProfile from "./ClientPages/ClientProfile";
import Help from "./ClientPages/ClientComponents/Help";
import TermsAndConditions from "./ClientPages/ClientComponents/TermsAndConditions";
import PrivacyPolicy from "./ClientPages/ClientComponents/PrivacyPolicy";
import About from "./ClientPages/ClientComponents/About";
import AppointmentDetails from "./ClientPages/ClientComponents/AppointmentComponents/AppointmentDetails";
import PACAppointment from "./ClientPages/ClientComponents/AppointmentComponents/PACAppointment";
import PACSetAppointmentForm from './ClientPages/ClientComponents/AppointmentComponents/AppointmentForm/PACSetAppointmentForm';
import PAEAppointment from "./ClientPages/ClientComponents/AppointmentComponents/PAEAppointment";


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
        <Route path="/client/home" element={<ClientHome />} />

        <Route path="/client/appointment" element={<ClientAppointment />}>
          <Route index element={<Navigate to="services" replace />} />
          <Route path="services" element={<ServicesTab />} />
          
          <Route path="psychotherapy-and-counseling" element={<PACAppointment />}>
            <Route path="set-appointment-form" element={<PACSetAppointmentForm />} />
          </Route>
          
          <Route path="psychological-assessment" element={<PAEAppointment />}>
            {/* <Route path="set-appointment-form" element={<SetAppointmentForm />} /> */}
          </Route>
          
          <Route path="pending" element={<PendingTab />} />
          <Route path="upcoming" element={<UpcomingTab />} />
          <Route path="history" element={<HistoryTab />} />
          <Route path="upcoming/:id" element={<AppointmentDetails />} />
        </Route>
        <Route path="/client/messages" element={<ClientMessages />} />
        <Route path="/client/profile" element={<ClientProfile />} />
        
        {/* New Routes for Profile Menu Items */}
        <Route path="/client/help" element={<Help />} />
        <Route path="/client/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/client/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/client/about" element={<About />} />

      </Routes>
    </Router>
    </>
    
  );
}
export default App;
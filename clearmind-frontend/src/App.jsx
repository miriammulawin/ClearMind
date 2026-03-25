import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast";

import Login from "./Login";
import Registration from "./Registration";

import DoctorDashboard from "./DoctorPages/DoctorDashboard";
import DoctorAppointment from "./DoctorPages/DoctorAppointment";
import DoctorPatient from "./DoctorPages/DoctorPatient";
import DoctorProfile from "./DoctorPages/DoctorProfile";
import DoctorMessages from "./DoctorPages/DoctorMessages";
import DoctorPatientProfile from "./DoctorPages/DoctorPatientProfile";
import DoctorSchedule from "./DoctorPages/DoctorSchedule";

import CreateAccounts from "./AdminPages/CreateAccounts";
import AdminDashboard from "./AdminPages/AdminDashboard";
import ManageAccounts from "./AdminPages/ManageAccounts";
import AdminProfile from "./AdminPages/AdminProfile";
import AdminMessages from "./AdminPages/AdminMessages";
import AdminClinic from "./AdminPages/AdminClinic";
import AdminPatient from "./AdminPages/AdminPatient";
import AdminAppointment from "./AdminPages/AdminAppointment";
import AdminBilling from "./AdminPages/AdminBilling";
import AdminPatientProfile from "./AdminPages/AdminPatientProfile";

import ClientHome from "./ClientPages/ClientHome";
import ClientAppointment from "./ClientPages/ClientAppointment";
import ServicesTab from "./ClientPages/AppointmentNavPages/ServicesTab";
import PendingTab from "./ClientPages/AppointmentNavPages/PendingTab";
import ScheduleTab from "./ClientPages/AppointmentNavPages/ScheduleTab";
import HistoryTab from "./ClientPages/AppointmentNavPages/HistoryTab";
import ClientMessages from "./ClientPages/ClientMessages";
import ClientProfile from "./ClientPages/ClientProfile";
import Help from "./ClientPages/ClientComponents/Help";
import TermsAndConditions from "./ClientPages/ClientComponents/TermsAndConditions";
import PrivacyPolicy from "./ClientPages/ClientComponents/PrivacyPolicy";
import About from "./ClientPages/ClientComponents/About";
import AppointmentDetails from "./ClientPages/AppointmentNavPages/AppointmentComponents/AppointmentDetails";
import PACAppointment from "./ClientPages/AppointmentNavPages/PaCAssesmentPages/PACAppointment";
import PACSetAppointmentForm from "./ClientPages/AppointmentNavPages/PaCAssesmentPages/AppointmentForm/PACSetAppointmentForm";
import PAEAppointment from "./ClientPages/AppointmentNavPages/PAaEAssesmentPages/PAaEAppointment";
import PAaESetAppointmentForm from "./ClientPages/AppointmentNavPages/PAaEAssesmentPages/AppointmentForm/PAaESetAppoitnmentForm";

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
          <Route
            path="/admin/patient-profile/:id"
            element={<AdminPatientProfile />}
          />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointment" element={<DoctorAppointment />} />
          <Route path="/doctor/patient" element={<DoctorPatient />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/messages" element={<DoctorMessages />} />
          <Route
            path="/doctor/patient-profile/:id"
            element={<DoctorPatientProfile />}
          />
          <Route path="/doctor/schedule" element={<DoctorSchedule />} />

          <Route path="/client/home" element={<ClientHome />} />

          <Route path="/client/appointment" element={<ClientAppointment />}>
            <Route index element={<Navigate to="services" replace />} />
            <Route path="services" element={<ServicesTab />} />

            <Route
              path="psychotherapy-and-counseling"
              element={<PACAppointment />}
            >
              <Route
                path="set-appointment-form"
                element={<PACSetAppointmentForm />}
              />
            </Route>

            <Route path="psychological-assessment" element={<PAEAppointment />}>
              <Route
                path="set-appointment-form"
                element={<PAaESetAppointmentForm />}
              />
            </Route>

            <Route path="pending" element={<PendingTab />} />
            <Route path="upcoming" element={<ScheduleTab />} />
            <Route path="history" element={<HistoryTab />} />
            <Route path="upcoming/:id" element={<AppointmentDetails />} />
            <Route path="details/:id" element={<AppointmentDetails />} />
          </Route>
          <Route path="/client/messages" element={<ClientMessages />} />
          <Route path="/client/profile" element={<ClientProfile />} />

          {/* New Routes for Profile Menu Items */}
          <Route path="/client/help" element={<Help />} />
          <Route
            path="/client/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/client/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/client/about" element={<About />} />
        </Routes>
      </Router>
    </>
  );
}
export default App;

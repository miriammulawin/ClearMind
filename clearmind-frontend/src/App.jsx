import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast";
import Login from "./Login";
import CreateAccounts from "./AdminPages/CreateAccounts";
import Registration from "./Registration";
import AdminDashboard from "./AdminPages/AdminDashboard";
import ClientHome from "./ClientPages/ClientHome";
import ClientAppointment from "./ClientPages/ClientAppointment";
import ServicesTab from "./ClientPages/AppointmentNavPages/ServicesTab";
import PendingTab from "./ClientPages/AppointmentNavPages/PendingTab";
import ScheduleTab from "./ClientPages/AppointmentNavPages/ScheduleTab";
import SessionsTab from "./ClientPages/AppointmentNavPages/SessionsTab";
import HistoryTab from "./ClientPages/AppointmentNavPages/HistoryTab";
import ClientMessages from "./ClientPages/ClientMessages";
import ClientAccount from "./ClientPages/ClientAccount";
import ProfilePage from "./ClientPages/ClientComponents/ProfilePage";
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/create/accounts" element={<CreateAccounts />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
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
            <Route path="sessions" element={<SessionsTab />} />
            <Route path="history" element={<HistoryTab />} />
          </Route>

          {/* ── Appointment Details — outside ClientAppointment so the tab nav is hidden ── */}
          <Route
            path="/client/appointment/upcoming/:id"
            element={<AppointmentDetails />}
          />
          <Route
            path="/client/appointment/history/:id"
            element={<AppointmentDetails />}
          />
          <Route
            path="/client/appointment/details/:id"
            element={<AppointmentDetails />}
          />

          <Route path="/client/messages" element={<ClientMessages />} />
          <Route path="/client/account" element={<ClientAccount />}>
            <Route path="profile-page" element={<ProfilePage />}></Route>
          </Route>

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

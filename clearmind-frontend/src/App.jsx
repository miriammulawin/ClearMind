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
import ForgotPassword from "./ForgotPassword";
import ProtectedRoute from "./ProtectedRoute";

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

import { AppointmentProvider } from "./context/AppointmentContext";

import ClientLayout from "./ClientPages/ClientLayout";
import ClientHome from "./ClientPages/ClientHome";
import ClientAppointment from "./ClientPages/ClientAppointment";
import ServicesTab from "./ClientPages/AppointmentNavPages/ServicesTab";
import PendingTab from "./ClientPages/AppointmentNavPages/PendingTab";
import ScheduleTab from "./ClientPages/AppointmentNavPages/ScheduleTab";
import SessionsTab from "./ClientPages/AppointmentNavPages/SessionsTab";
import BookNextSession from "./ClientPages/AppointmentNavPages/AppointmentComponents/BookNextSession";
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
import VerifyOtp from "./VerifyOtp";

function App() {
  return (
    <>
      <AppointmentProvider>
        <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
        <Router>
          <Routes>
            {/* ── Public ─────────────────────────────────────── */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* ── Admin Routes ────────────────────────────────── */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="Admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create/accounts"
              element={
                <ProtectedRoute role="Admin">
                  <CreateAccounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage/account"
              element={
                <ProtectedRoute role="Admin">
                  <ManageAccounts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute role="Admin">
                  <AdminProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute role="Admin">
                  <AdminMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/clinic"
              element={
                <ProtectedRoute role="Admin">
                  <AdminClinic />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/patients"
              element={
                <ProtectedRoute role="Admin">
                  <AdminPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointment"
              element={
                <ProtectedRoute role="Admin">
                  <AdminAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/billing"
              element={
                <ProtectedRoute role="Admin">
                  <AdminBilling />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/patient-profile/:id"
              element={
                <ProtectedRoute role="Admin">
                  <AdminPatientProfile />
                </ProtectedRoute>
              }
            />

            {/* ── Doctor Routes ────────────────────────────────── */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute role="Doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/appointment"
              element={
                <ProtectedRoute role="Doctor">
                  <DoctorAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patient"
              element={
                <ProtectedRoute role="Doctor">
                  <DoctorPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/profile"
              element={
                <ProtectedRoute role="Doctor">
                  <DoctorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/messages"
              element={
                <ProtectedRoute role="Doctor">
                  <DoctorMessages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patient-profile/:id"
              element={
                <ProtectedRoute role="Doctor">
                  <DoctorPatientProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/schedule"
              element={
                <ProtectedRoute role="Doctor">
                  <DoctorSchedule />
                </ProtectedRoute>
              }
            />

            {/* ── Client Routes (all wrapped in ClientLayout) ── */}
            <Route element={<ClientLayout />}>
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

                <Route
                  path="psychological-assessment"
                  element={<PAEAppointment />}
                >
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

              <Route path="/client/messages" element={<ClientMessages />} />
              <Route path="/client/account" element={<ClientAccount />}>
                <Route path="profile-page" element={<ProfilePage />}></Route>
              </Route>

              <Route path="/client/help" element={<Help />} />
              <Route
                path="/client/terms-and-conditions"
                element={<TermsAndConditions />}
              />
              <Route
                path="/client/privacy-policy"
                element={<PrivacyPolicy />}
              />
              <Route path="/client/about" element={<About />} />

              <Route
                path="/client/appointment/sessions/book-next"
                element={<BookNextSession />}
              />
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

            {/* ── Catch-all ───────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppointmentProvider>
    </>
  );
}

export default App;

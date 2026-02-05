import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast"; 
import Login from "./Login";
import CreateAccounts from "./AdminPages/CreateAccounts"
import Registration from "./Registration";
import AdminDashboard from "./AdminPages/AdminDashboard";
import ClientHome from "./ClientPages/ClientHome";
import ClientAppointment from "./ClientPages/ClientAppointment";
import ServicesTab from "./ClientPages/ClientComponents/ServicesTab";
import UpcomingTab from "./ClientPages/ClientComponents/UpcomingTab";
import HistoryTab from "./ClientPages/ClientComponents/HistoryTab";
import ClientMessages from "./ClientPages/ClientMessages";
import ClientProfile from "./ClientPages/ClientProfile";


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
          <Route path="upcoming" element={<UpcomingTab />} />
          <Route path="history" element={<HistoryTab />} />
        </Route>
        
        <Route path="/client/messages" element={<ClientMessages />} />
        <Route path="/client/profile" element={<ClientProfile />} />

      </Routes>
    </Router>
    </>
    
  );
}
export default App;

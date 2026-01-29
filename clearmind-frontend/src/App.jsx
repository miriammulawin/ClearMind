import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login";
import CreateAccounts from "./AdminPages/CreateAccounts"
import Registration from "./Registration";
import AdminDashboard from "./AdminPages/AdminDashboard";
import ClientHome from "./ClientPages/ClientHome";
import ClientAppointment from "./ClientPages/ClientAppointment";
import ClientMessages from "./ClientPages/ClientMessages";
import ClientAccount from "./ClientPages/ClientAccount";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/create-accounts"element={<CreateAccounts/>} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/client-home" element={<ClientHome />} />
        <Route path="/client-appointment" element={<ClientAppointment />} />
        <Route path="/client-messages" element={<ClientMessages />} />
        <Route path="/client-account" element={<ClientAccount />} />

      </Routes>
    </Router>
  );
}
export default App;

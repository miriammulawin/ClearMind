import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login";
import CreateAccounts from "./AdminPages/CreateAccounts"
import Registration from "./Registration";
import AdminDashboard from "./AdminPages/AdminDashboard";
import AdminAppointment from "./AdminPages/AdminAppointment";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Registration />} />
        <Route path="/create-accounts"element={<CreateAccounts/>} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-appointment" element={<AdminAppointment />} />

      </Routes>
    </Router>
  );
}
export default App;

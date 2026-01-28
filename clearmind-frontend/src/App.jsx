import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login";
import CreateAccounts from "./AdminPages/CreateAccounts"
import Registration from "./Registration";
import AdminDashboard from "./AdminPages/AdminDashboard";
import ClientHome from "./ClientPages/ClientHome";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* for testing lang yung client */}
        <Route path="/client-home" element={<ClientHome />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/create-accounts"element={<CreateAccounts/>} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
      </Routes>
    </Router>
  );
}
export default App;

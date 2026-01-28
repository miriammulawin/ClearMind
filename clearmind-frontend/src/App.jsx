import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login";
import AdminDashboard from "./AdminPages/AdminDashboard";
import ClientHome from "./ClientPages/ClientHome";


function App() {
  return (
    <Router>
      <Routes>
      
       
        <Route path="/" element={<Login />} />
        {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}
        {/* <Route path="/" element={<ClientHome />} /> */}
      </Routes>
    </Router>
  );
}
export default App;

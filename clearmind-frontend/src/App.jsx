import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}
export default App;

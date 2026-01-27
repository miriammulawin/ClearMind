import { useState } from "react";
import Sidebar from "./AdminSideBar";
import TopNavbar from "./AdminTopNavbar";

function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="admin-main">
        <TopNavbar activeMenu={activeMenu} />
        
        <div className="admin-content">
          <h2>jajsja</h2>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

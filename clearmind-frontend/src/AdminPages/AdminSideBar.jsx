import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiMenu } from "react-icons/fi";
import { RiDashboardFill } from "react-icons/ri";
import { FaUserPlus, FaCalendarDays } from "react-icons/fa6";
import { FaClinicMedical, FaMoneyCheck } from "react-icons/fa";
import { BsPersonLinesFill } from "react-icons/bs";
import { MdManageAccounts } from "react-icons/md";
import { BiSolidUserCircle } from "react-icons/bi";

import logo from "../assets/CMPS_Logo.png";

function AdminSideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [tooltip, setTooltip] = useState({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });
  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", icon: <RiDashboardFill />, path: "/admin-dashboard" },
    { name: "Create Accounts", icon: <FaUserPlus />, path: "/create-accounts" },
    { name: "Appointment", icon: <FaCalendarDays />, path: "/appointment" },
    { name: "Patients", icon: <BsPersonLinesFill />, path: "/patients" },
    { name: "Clinic", icon: <FaClinicMedical />, path: "/clinic" },
    { name: "Billing", icon: <FaMoneyCheck />, path: "/billing" },
    {
      name: "Manage Account",
      icon: <MdManageAccounts />,
      path: "/manage-account",
    },
    { name: "My Profile", icon: <BiSolidUserCircle />, path: "/my-profile" },
  ];

  const handleMenuClick = (item) => {
    setActiveMenu(item.name);
    navigate(item.path);
  };

  return (
    <>
      <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <FiMenu
              className="menu-icon"
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>

          <div className="profile-section">
            <div className="profile-pic"></div>
            <div className="profile-info">
              <h5 className="profile-name">Admin101</h5>
              <p className="profile-contact">admin@gmail.com · 09123456767</p>
              <FiEdit className="edit-icon" />
            </div>
          </div>

          <div className="sidebar-menu">
            {menus.map((item) => (
              <div
                key={item.name}
                className={`menu-item ${activeMenu === item.name ? "active" : ""}`}
                onClick={() => handleMenuClick(item)}
                onMouseEnter={(e) => {
                  if (!collapsed) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    text: item.name,
                    x: rect.right + 10, // 10px gap to the right
                    y: rect.top + rect.height / 2,
                    visible: true,
                  });
                }}
                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
              >
                <span className="menu-icon-left">{item.icon}</span>
                <span className="menu-text">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip rendered outside sidebar */}
      {tooltip.visible && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translateY(-50%)",
            background: "#4e237c",
            color: "white",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            whiteSpace: "nowrap",
            zIndex: 9999,
            boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
            pointerEvents: "none",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
}

export default AdminSideBar;

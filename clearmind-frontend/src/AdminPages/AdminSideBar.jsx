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

function AdminSideBar({ activeMenu: initialActiveMenu = "Dashboard" }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState(initialActiveMenu);
  const navigate = useNavigate();

  const menus = [
    { name: "Dashboard", icon: <RiDashboardFill />, path: "/admin-dashboard" },
    { name: "Create Accounts", icon: <FaUserPlus />, path: "/create-accounts" },
    { name: "Appointment", icon: <FaCalendarDays />, path: "/appointment" },
    { name: "Patients", icon: <BsPersonLinesFill />, path: "/patients" },
    { name: "Clinic", icon: <FaClinicMedical />, path: "/clinic" },
    { name: "Billing", icon: <FaMoneyCheck />, path: "/billing" },
    { name: "Manage Account", icon: <MdManageAccounts />, path: "/manage-account" },
    { name: "My Profile", icon: <BiSolidUserCircle />, path: "/my-profile" },
  ];

  const handleMenuClick = (item) => {
    setActiveMenu(item.name);
    navigate(item.path);
  };

  return (
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
            >
              <span className="menu-icon-left">{item.icon}</span>
              <span className="menu-text">{item.name}</span>
              <span className="menu-tooltip">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminSideBar;
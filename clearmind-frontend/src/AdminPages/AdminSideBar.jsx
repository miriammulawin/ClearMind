import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiEdit, FiMenu } from "react-icons/fi";
import { RiDashboardFill } from "react-icons/ri";
import { FaUserPlus, FaCalendarDays } from "react-icons/fa6";
import { FaClinicMedical, FaMoneyCheck } from "react-icons/fa";
import { BsPersonLinesFill } from "react-icons/bs";
import { MdManageAccounts } from "react-icons/md";
import { BiSolidUserCircle } from "react-icons/bi";

import "../index.css";
import logo from "../assets/CMPS_Logo.png";

function AdminSideBar({ activeMenu: initialActiveMenu = "Dashboard" }) {
  const [collapsed, setCollapsed] = useState(false);
  const [tooltip, setTooltip] = useState({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });

  const [profile, setProfile] = useState({
    name: "User",
    email: "user@example.com",
    contact: "0000000000",
    profile_picture:
      "http://localhost/ClearMind/clearmind-backend/default-profile-pic.png",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: "Dashboard", icon: <RiDashboardFill />, path: "/admin/dashboard" },
    { name: "Create Accounts", icon: <FaUserPlus />, path: "/create/accounts" },
    { name: "Appointment", icon: <FaCalendarDays />, path: "/admin-appointment" },
    { name: "Patients", icon: <BsPersonLinesFill />, path: "/patients" },
    { name: "Clinic", icon: <FaClinicMedical />, path: "/admin-clinic" },
    { name: "Billing", icon: <FaMoneyCheck />, path: "/billing" },
    { name: "Manage Account", icon: <MdManageAccounts />, path: "/manage-account" },
    { name: "My Profile", icon: <BiSolidUserCircle />, path: "/my-profile" },
  ];

  const handleMenuClick = (item) => {
    navigate(item.path);
  };

  // =======================
  // Fetch current logged-in user from PHP backend
  // =======================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://localhost/ClearMind/clearmind-backend/get_current_user.php",
          { withCredentials: true }
        );
        const user = res.data;

        const profilePic =
          user.profile_picture && user.profile_picture !== ""
            ? user.profile_picture
            : "http://localhost/ClearMind/clearmind-backend/default-profile-pic.png";

        setProfile({
          name: user.name || "User",
          email: user.email || "user@example.com",
          contact: user.contact || "0000000000",
          profile_picture: profilePic,
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
      <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <FiMenu className="menu-icon" onClick={() => setCollapsed(!collapsed)} />
          </div>

          {/* Profile Section */}
          <div className="profile-section" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px" }}>
            <div
              className="profile-pic-container"
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                border: "3px solid #6e23b7", // violet border
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src={profile.profile_picture}
                alt="Profile"
                onError={(e) => {
                  e.target.src =
                    "http://localhost/ClearMind/clearmind-backend/default-profile-pic.png";
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="profile-info mb-3">
              <h5 className="profile-name" style={{ margin: 0 }}>{profile.name}</h5>
              <p className="profile-contact" style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>
                {profile.email} · {profile.contact}
              </p>
              <FiEdit className="edit-icon" style={{ cursor: "pointer", color: "#6e23b7", marginTop: "4px" }} />
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="sidebar-menu">
            {menus.map((item) => (
              <div
                key={item.name}
                className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => handleMenuClick(item)}
                onMouseEnter={(e) => {
                  if (!collapsed) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    text: item.name,
                    x: rect.right + 10,
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

      {/* Tooltip */}
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

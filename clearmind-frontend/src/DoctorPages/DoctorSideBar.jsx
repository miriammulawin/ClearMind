import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEdit, FiMenu } from "react-icons/fi";
import { FaCalendarDays } from "react-icons/fa6";
import { BsPersonLinesFill } from "react-icons/bs";
import { BiSolidUserCircle } from "react-icons/bi";
import { RiDashboardFill } from "react-icons/ri";
import "../index.css";
import logo from "../assets/CMPS_Logo.png";

function DoctorSideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [tooltip, setTooltip] = useState({
    text: "", x: 0, y: 0, visible: false,
  });

  const navigate  = useNavigate();
  const location  = useLocation();

  // ── Helpers ─────────────────────────────────────────────────────
  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const getProfileImageUrl = () => {
    const img = localStorage.getItem("profile_image");
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `http://127.0.0.1:8000/storage/${img}`;
  };

  // ── State ────────────────────────────────────────────────────────
  const [userState, setUserState]   = useState(getUser);
  const [profileImage, setProfileImage] = useState(getProfileImageUrl);

  // ── Listen for profile updates (from modal save OR modal fetch) ──
  useEffect(() => {
    const handleProfileUpdated = () => {
      setUserState(getUser());
      setProfileImage(getProfileImageUrl());
    };
    window.addEventListener("profileUpdated", handleProfileUpdated);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdated);
  }, []);

  // ── Derived display values ───────────────────────────────────────
  // Support both camelCase (from setup response) and snake_case (from profile fetch)
  const firstName = userState?.firstName  || userState?.first_name  || "";
  const lastName  = userState?.lastName   || userState?.last_name   || "";
  const fullName  = userState?.fullName   ||
    `${firstName} ${lastName}`.trim()     ||
    "Doctor";

  const prcNumber =
    userState?.prc_number       ||
    userState?.prcNumber        ||
    userState?.license_number   ||
    userState?.licenseNumber    ||
    "Not set";

  const initials = (
    (firstName?.[0] ?? "") + (lastName?.[0] ?? "")
  ).toUpperCase() || "DR";

  const menus = [
    { name: "Dashboard",   icon: <RiDashboardFill />,    path: "/doctor/dashboard" },
    { name: "Appointment", icon: <FaCalendarDays />,      path: "/doctor/appointment" },
    { name: "Patients",    icon: <BsPersonLinesFill />,   path: "/doctor/patient" },
    { name: "My Profile",  icon: <BiSolidUserCircle />,   path: "/doctor/profile" },
  ];

  return (
    <>
      <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar">

          {/* Header */}
          <div className="sidebar-header">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <FiMenu className="menu-icon" onClick={() => setCollapsed(!collapsed)} />
          </div>

          {/* Profile Section */}
          <div className="profile-section">
            <div
              className="profile-pic"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#e9d8f5",
                borderRadius: "50%",
                fontWeight: "700",
                fontSize: "1.1rem",
                color: "#4D227C",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  onError={() => setProfileImage(null)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>

            {!collapsed && (
              <div className="profile-info" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h5
                    className="profile-name"
                    style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {fullName}
                  </h5>
                  <FiEdit
                    className="edit-icon"
                    style={{ cursor: "pointer", flexShrink: 0, marginLeft: "6px" }}
                    onClick={() => navigate("/doctor/profile")}
                  />
                </div>
                <p className="profile-contact" style={{ margin: "2px 0 0 0" }}>
                  PRC License No.: {prcNumber}
                </p>
              </div>
            )}
          </div>

          {/* Menu */}
          <div className="sidebar-menu">
            {menus.map((item) => (
              <div
                key={item.name}
                className={`menu-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => {
                  if (!collapsed) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ text: item.name, x: rect.right + 10, y: rect.top + rect.height / 2, visible: true });
                }}
                onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
              >
                <span className="menu-icon-left">{item.icon}</span>
                <span className="menu-text">{item.name}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

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

export default DoctorSideBar;
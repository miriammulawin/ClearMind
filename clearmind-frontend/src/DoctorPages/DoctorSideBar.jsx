import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEdit, FiMenu } from "react-icons/fi";
import { FaCalendarDays } from "react-icons/fa6";
import { BsPersonLinesFill } from "react-icons/bs";
import { BiSolidUserCircle } from "react-icons/bi";
import { RiDashboardFill } from "react-icons/ri";
import "../index.css";
import logo from "../assets/CMPS_Logo.png";

// ── Helper: read user safely ────────────────────────────────────────
const getUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

function DoctorSideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [tooltip, setTooltip]     = useState({ text: "", x: 0, y: 0, visible: false });

  // ── Dynamic profile state ─────────────────────────────────────────
  const [profile, setProfile] = useState(() => {
    const u = getUser();
    return {
      fullName:     u?.fullName || `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || "Doctor",
      prcNumber:    u?.prcNumber || "Not set",
      initials:     ((u?.firstName?.[0] ?? "") + (u?.lastName?.[0] ?? "")).toUpperCase() || "DR",
      profileImage: localStorage.getItem("profile_image") || null,
      specialty:    u?.specialty || "",
    };
  });

  // ── Listen for localStorage changes (cross-tab + same-tab via custom event) ──
  useEffect(() => {
    const syncProfile = () => {
      const u = getUser();
      setProfile({
        fullName:     u?.fullName || `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim() || "Doctor",
        prcNumber:    u?.prcNumber || "Not set",
        initials:     ((u?.firstName?.[0] ?? "") + (u?.lastName?.[0] ?? "")).toUpperCase() || "DR",
        profileImage: localStorage.getItem("profile_image") || null,
        specialty:    u?.specialty || "",
      });
    };

    // Native storage event (cross-tab)
    window.addEventListener("storage", syncProfile);
    // Custom event fired by DoctorProfile after save
    window.addEventListener("profileUpdated", syncProfile);

    return () => {
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener("profileUpdated", syncProfile);
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: "Dashboard",   icon: <RiDashboardFill />,   path: "/doctor/dashboard"   },
    { name: "Appointment", icon: <FaCalendarDays />,     path: "/doctor/appointment" },
    { name: "Patients",    icon: <BsPersonLinesFill />,  path: "/doctor/patient"     },
    { name: "My Profile",  icon: <BiSolidUserCircle />,  path: "/doctor/profile"     },
  ];

  const handleMenuClick = (item) => navigate(item.path);

  return (
    <>
      <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar">

          {/* ── Header ── */}
          <div className="sidebar-header">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <FiMenu
              className="menu-icon"
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>

          {/* ── Profile Section ── */}
          <div className="profile-section">
            {/* Avatar: photo if available, else initials */}
            <div
              className="profile-pic"
              style={{
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                backgroundColor: profile.profileImage ? "transparent" : "#e9d8f5",
                borderRadius:    "50%",
                fontWeight:      "700",
                fontSize:        "1.1rem",
                color:           "#4D227C",
                flexShrink:      0,
                overflow:        "hidden",
              }}
            >
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                profile.initials
              )}
            </div>

            {/* Info — hidden when collapsed */}
            {!collapsed && (
              <div className="profile-info">
                <h5 className="profile-name">{profile.fullName}</h5>
                {profile.specialty && (
                  <p className="profile-contact" style={{ color: "#7c4dab", fontWeight: "600", marginBottom: "2px" }}>
                    {profile.specialty}
                  </p>
                )}
                <p className="profile-contact">
                  PRC License No.: {profile.prcNumber}
                </p>
                <FiEdit
                  className="edit-icon"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/doctor/profile")}
                />
              </div>
            )}
          </div>

          {/* ── Menu ── */}
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
                    text:    item.name,
                    x:       rect.right + 10,
                    y:       rect.top + rect.height / 2,
                    visible: true,
                  });
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

      {/* ── Tooltip (collapsed mode) ── */}
      {tooltip.visible && (
        <div
          style={{
            position:      "fixed",
            left:          tooltip.x,
            top:           tooltip.y,
            transform:     "translateY(-50%)",
            background:    "#4e237c",
            color:         "white",
            padding:       "6px 12px",
            borderRadius:  "6px",
            fontSize:      "0.85rem",
            whiteSpace:    "nowrap",
            zIndex:        9999,
            boxShadow:     "0 6px 15px rgba(0,0,0,0.15)",
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
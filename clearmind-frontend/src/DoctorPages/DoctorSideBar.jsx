import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiEdit, FiMenu } from "react-icons/fi";
import { FaCalendarDays } from "react-icons/fa6";
import { FaMoneyCheck } from "react-icons/fa";
import { BsPersonLinesFill } from "react-icons/bs";
import { BiSolidUserCircle } from "react-icons/bi";

import "../index.css";
import logo from "../assets/CMPS_Logo.png";

function DoctorSideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [tooltip, setTooltip] = useState({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });

  const [profile, setProfile] = useState({
    name: "Loading...",
    license: "",
    profile_picture: "http://localhost/Clearmind/clearmind-backend/default-profile-pic.png",
  });

  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    {
      name: "Appointment",
      icon: <FaCalendarDays />,
      path: "/doctor/appointment",
    },
    {
      name: "Patients",
      icon: <BsPersonLinesFill />,
      path: "/doctor/patient",
    },
    {
      name: "Billing",
      icon: <FaMoneyCheck />,
      path: "/doctor/billing",
    },
    {
      name: "My Profile",
      icon: <BiSolidUserCircle />,
      path: "/doctor/profile",
    },
  ];

  const handleMenuClick = (item) => {
    navigate(item.path);
  };

  // =======================
  // Fetch current logged-in doctor from PHP backend
  // =======================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        const res = await axios.get(
          "http://localhost/Clearmind/clearmind-backend/get_current_user.php",
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log("Backend response:", res.data);
        
        // Check if response has error
        if (res.data.error) {
          console.error("Backend error:", res.data.error);
          setProfile({
            name: "Error loading profile",
            license: "",
            profile_picture: "http://localhost/Clearmind/clearmind-backend/default-profile-pic.png",
          });
          return;
        }

        const user = res.data;

        // For doctors, display license number and ensure "Doc." prefix
        let displayName = user.name || "User";
        
        // Add "Doc." prefix if not already present (double-check)
        if (user.display_type === "license" && !displayName.startsWith("Doc.")) {
          displayName = "Doc. " + displayName;
        }

        // Validate and set profile data
        const profileData = {
          name: displayName,
          license: user.license || "",
          profile_picture: user.profile_picture || "http://localhost/Clearmind/clearmind-backend/default-profile-pic.png",
        };

        console.log("Setting profile data:", profileData);
        setProfile(profileData);
        
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        // Set error state
        setProfile({
          name: "Error loading profile",
          license: "",
          profile_picture: "http://localhost/Clearmind/clearmind-backend/default-profile-pic.png",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageError = (e) => {
    console.error("Image failed to load:", e.target.src);
    e.target.src = "http://localhost/Clearmind/clearmind-backend/default-profile-pic.png";
  };

  return (
    <>
      <div className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar">
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <FiMenu
              className="menu-icon"
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>

          {/* Profile Section */}
          <div 
            className="profile-section" 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "20px 10px",
              borderBottom: "1px solid #e0e0e0",
              marginBottom: "10px"
            }}
          >
            <div
              className="profile-pic-container"
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                border: "3px solid #6e23b7",
                overflow: "hidden",
                flexShrink: 0,
                backgroundColor: "#f0f0f0",
              }}
            >
              <img
                src={profile.profile_picture}
                alt="Profile"
                onError={handleImageError}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            
            {!collapsed && (
              <div className="profile-info" style={{ flex: 1, minWidth: 0 }}>
                <h5 
                  className="profile-name" 
                  style={{ 
                    margin: 0, 
                    fontSize: "1rem",
                    fontWeight: "600",
                    color: "#333",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {isLoading ? "Loading..." : profile.name}
                </h5>
                {profile.license && (
                  <p 
                    className="profile-license" 
                    style={{ 
                      margin: "4px 0 0 0", 
                      fontSize: "0.75rem", 
                      color: "#666",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    PRC License No.: {profile.license}
                  </p>
                )}
  <FiEdit className="edit-icon" style={{ cursor: "pointer", color: "#6e23b7", marginTop: "4px" }} />
              </div>
            )}
          </div>

          {/* Sidebar Menu */}
          <div className="sidebar-menu">
            {menus.map((item) => (
              <div
                key={item.name}
                className={`menu-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
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

export default DoctorSideBar;
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    {
      name: "Appointment",
      icon: <FaCalendarDays />,
      path: "/doctor-appointment",
    },
    {
      name: "Patients",
      icon: <BsPersonLinesFill />,
      path: "/doctor-patients",
    },
    {
      name: "Billing",
      icon: <FaMoneyCheck />,
      path: "/doctor-billing",
    },
    {
      name: "My Profile",
      icon: <BiSolidUserCircle />,
      path: "/doctor-profile",
    },
  ];

  const handleMenuClick = (item) => {
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
              <h5 className="profile-name">Jinky C. Malabanan</h5>
              <p className="profile-contact">PRC License No.: PSY-0123456</p>
              <FiEdit className="edit-icon" />
            </div>
          </div>

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

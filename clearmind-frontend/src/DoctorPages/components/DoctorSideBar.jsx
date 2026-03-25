import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEdit, FiMenu } from "react-icons/fi";
import { FaCalendarDays } from "react-icons/fa6";
import { FaMoneyCheck } from "react-icons/fa";
import { BsPersonLinesFill, BsCalendarCheckFill } from "react-icons/bs";
import { BiSolidUserCircle } from "react-icons/bi";
import { RiDashboardFill } from "react-icons/ri";
import styles from "../../AdminPages/AdminStyle/AdminSideBar.module.css";
import logo from "../../assets/CMPS_Logo.png";

function DoctorSideBar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("doctorSidebarCollapsed") === "true";
  });

  const [tooltip, setTooltip] = useState({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // ── Auto-collapse on small screens ──
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 965) {
        setCollapsed(true);
        localStorage.setItem("doctorSidebarCollapsed", "true");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menus = [
    { name: "Dashboard", icon: <RiDashboardFill />, path: "/doctor/dashboard" },
    {
      name: "Appointment",
      icon: <FaCalendarDays />,
      path: "/doctor/appointment",
    },
    {
      name: "Schedule",
      icon: <BsCalendarCheckFill />,
      path: "/doctor/schedule",
    },
    { name: "Patients", icon: <BsPersonLinesFill />, path: "/doctor/patient" },
    {
      name: "My Profile",
      icon: <BiSolidUserCircle />,
      path: "/doctor/profile",
    },
  ];

  const toggleCollapsed = (e) => {
    e.stopPropagation();
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("doctorSidebarCollapsed", String(next));
      return next;
    });
  };

  const handleMenuClick = (item) => {
    navigate(item.path);
  };

  return (
    <>
      <div
        className={`${styles.sidebarContainer} ${collapsed ? styles.collapsed : ""}`}
      >
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <img src={logo} alt="Logo" className={styles.sidebarLogo} />
            <FiMenu className={styles.menuIcon} onClick={toggleCollapsed} />
          </div>

          <div className={styles.profileSection}>
            <div className={styles.profilePic}></div>
            <div className={styles.profileInfo}>
              <h5 className={styles.profileName}>Jinky C. Malabanan</h5>
              <p className={styles.profileContact}>
                PRC License No.: PSY-0123456
              </p>
              <FiEdit
                className={styles.editIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/doctor/profile");
                }}
              />
            </div>
          </div>

          <div className={styles.sidebarMenu}>
            {menus.map((item) => (
              <div
                key={item.name}
                className={`${styles.menuItem} ${location.pathname === item.path ? styles.menuItemActive : ""}`}
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
                onMouseLeave={() =>
                  setTooltip((prev) => ({ ...prev, visible: false }))
                }
              >
                <span className={styles.menuIconLeft}>{item.icon}</span>
                <span className={styles.menuText}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tooltip.visible && (
        <div
          className={styles.tooltipOverlay}
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
}

export default DoctorSideBar;

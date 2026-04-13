import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEdit, FiMenu } from "react-icons/fi";
import { RiDashboardFill } from "react-icons/ri";
import { FaCalendarDays } from "react-icons/fa6";
import { FaClinicMedical, FaMoneyCheck } from "react-icons/fa";
import { BsPersonLinesFill } from "react-icons/bs";
import { MdManageAccounts } from "react-icons/md";
import { BiSolidUserCircle } from "react-icons/bi";
import styles from "./AdminStyle/AdminSideBar.module.css";
import logo from "../assets/CMPS_Logo.png";

function AdminSideBar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  const [tooltip, setTooltip] = useState({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });

  const [adminProfile, setAdminProfile] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    contactNo: "",
    email: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
  const cached = localStorage.getItem("adminProfile");

  if (cached) {
    setAdminProfile(JSON.parse(cached));
    setLoadingProfile(false);
    return; // ✅ stop fetching again
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const json = await response.json();
      const data = json.data;

      const profileData = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        middleInitial: data.middleInitial || "",
        contactNo: data.contactNo || "",
        email: data.email || "",
      };

      setAdminProfile(profileData);

      // ✅ SAVE to localStorage
      localStorage.setItem("adminProfile", JSON.stringify(profileData));
    } catch (error) {
      console.error("Error fetching admin profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  fetchProfile();
}, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 965) {
        setCollapsed(true);
        localStorage.setItem("sidebarCollapsed", "true");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menus = [
    { name: "Dashboard", icon: <RiDashboardFill />, path: "/admin/dashboard" },
    {
      name: "Appointment",
      icon: <FaCalendarDays />,
      path: "/admin/appointment",
    },
    { name: "Patients", icon: <BsPersonLinesFill />, path: "/admin/patients" },
    {
      name: "Clinic & Services",
      icon: <FaClinicMedical />,
      path: "/admin/clinic",
    },
    { name: "Billing", icon: <FaMoneyCheck />, path: "/admin/billing" },
    {
      name: "Manage Account",
      icon: <MdManageAccounts />,
      path: "/manage/account",
    },
    { name: "My Profile", icon: <BiSolidUserCircle />, path: "/admin/profile" },
  ];

  const toggleCollapsed = (e) => {
    e.stopPropagation();
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

  const handleMenuClick = (item) => navigate(item.path);
const getDisplayName = () => {
  const { firstName, lastName, middleInitial } = adminProfile;
  if (!firstName && !lastName) return "Loading...";
  const mi = middleInitial ? `${middleInitial.charAt(0).toUpperCase()}.` : "";
  const li = lastName ? `${lastName.charAt(0).toUpperCase()}.` : "";
  return [firstName, mi + li].filter(Boolean).join(" ");
};

  // First letter of firstName + first letter of lastName
  const getInitials = () => {
    const { firstName, lastName } = adminProfile;
    const f = firstName?.charAt(0).toUpperCase() || "";
    const l = lastName?.charAt(0).toUpperCase() || "";
    return f + l || "?";
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
            {/* Avatar circle with initials */}
            <div className={styles.profilePic}>
              {!loadingProfile && (
                <span className={styles.profileInitials}>{getInitials()}</span>
              )}
            </div>

            <div className={styles.profileInfo}>
              {/* "John M. Doe" format */}
              <h5 className={styles.profileName}>
                {loadingProfile ? "Loading..." : getDisplayName()}
              </h5>

              {/* Email · Contact */}
              <p className={styles.profileContact}>
                {loadingProfile
                  ? "..."
                  : `${adminProfile.email} · ${adminProfile.contactNo}`}
              </p>

              <FiEdit
                className={styles.editIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/profile");
                }}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>

          <div className={styles.sidebarMenu}>
            {menus.map((item) => (
              <div
                key={item.name}
                className={`${styles.menuItem} ${
                  location.pathname === item.path ? styles.menuItemActive : ""
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
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
}

export default AdminSideBar;

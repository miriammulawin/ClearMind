import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEdit, FiMenu } from "react-icons/fi";
import { FaCalendarDays } from "react-icons/fa6";
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

  const [doctorProfile, setDoctorProfile] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    prcLicenseNo: "",
    profilePicture: null,
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // ── Fetch doctor profile ──
  useEffect(() => {
    const cached = localStorage.getItem("doctorProfile");

    if (cached) {
      setDoctorProfile(JSON.parse(cached));
      setLoadingProfile(false);
      return;
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
          prcLicenseNo: data.prcLicenseNo || "",
          profilePicture: data.profilePicture || null, // already a full URL from Laravel asset()
        };

        setDoctorProfile(profileData);
        localStorage.setItem("doctorProfile", JSON.stringify(profileData));
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

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

  const handleMenuClick = (item) => navigate(item.path);

  const getDisplayName = () => {
    const { firstName, lastName, middleInitial } = doctorProfile;
    if (!firstName && !lastName) return "Loading...";
    const mi = middleInitial ? `${middleInitial.charAt(0).toUpperCase()}.` : "";
    return [firstName, mi, lastName].filter(Boolean).join(" ");
  };

  const getInitials = () => {
    const { firstName, lastName } = doctorProfile;
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
            {/* Profile picture or initials fallback */}
            <div className={styles.profilePic}>
              {!loadingProfile &&
                (doctorProfile.profilePicture ? (
                  <img
                    src={doctorProfile.profilePicture}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <span className={styles.profileInitials}>
                    {getInitials()}
                  </span>
                ))}
            </div>

            <div className={styles.profileInfo}>
              <h5 className={styles.profileName}>
                {loadingProfile ? "Loading..." : getDisplayName()}
              </h5>
              <p className={styles.profileContact}>
                {loadingProfile
                  ? "..."
                  : `PRC License No.: ${doctorProfile.prcLicenseNo || "N/A"}`}
              </p>
              <FiEdit
                className={styles.editIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/doctor/profile");
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

export default DoctorSideBar;

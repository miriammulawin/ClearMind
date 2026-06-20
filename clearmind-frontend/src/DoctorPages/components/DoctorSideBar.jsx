import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiEdit, FiMenu } from "react-icons/fi";
import { FaCalendarDays } from "react-icons/fa6";
import { BsPersonLinesFill, BsCalendarCheckFill } from "react-icons/bs";
import { BiSolidUserCircle } from "react-icons/bi";
import { RiDashboardFill } from "react-icons/ri";
import styles from "../../AdminPages/AdminStyle/AdminSideBar.module.css";
import logo from "../../assets/CMPS_Logo.png";

const STORAGE_BASE = "http://127.0.0.1:8000/storage/";

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return STORAGE_BASE + path;
};

function DoctorSideBar() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("doctorSidebarCollapsed") === "true",
  );

  const [tooltip, setTooltip] = useState({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });

  const [doctorProfile, setDoctorProfile] = useState({
<<<<<<< HEAD
    firstName: "",
    lastName: "",
    middleInitial: "",
    licenseNumbers: [], // ← was prcLicenseNo: ""
=======
    firstName:      "",
    lastName:       "",
    middleInitial:  "",
    licenseNumbers: [],
>>>>>>> e516e8dcc07c814c9ec4c1ab5a93a321d5ca02e0
    profilePicture: null,
  });

  const [loadingProfile, setLoadingProfile] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

<<<<<<< HEAD
=======
  // ── Fetch from /api/me (userPayload now includes license_numbers) ──
>>>>>>> e516e8dcc07c814c9ec4c1ab5a93a321d5ca02e0
  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/doctor/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch profile");

      const json = await response.json();
      const data = json.data;

      setDoctorProfile({
        firstName:      data.firstName      || "",
        lastName:       data.lastName       || "",
        middleInitial:  data.middleInitial  || "",
        licenseNumbers: Array.isArray(data.license_numbers) ? data.license_numbers : [],
        profilePicture: resolveImageUrl(data.profilePicture),
      });
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // ── On mount: clear stale cache then fetch ──
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (currentUser?.id) {
      localStorage.removeItem(`doctorProfile_${currentUser.id}`);
      localStorage.removeItem("doctorProfile");
    }
    fetchProfile();
  }, [fetchProfile]);

  // ── Real-time listener: fired by AccountSetupModal after save ──
  useEffect(() => {
    const handleProfileUpdated = (e) => {
      if (e.detail) {
        setDoctorProfile({
          firstName:      e.detail.firstName      || "",
          lastName:       e.detail.lastName       || "",
          middleInitial:  e.detail.middleInitial  || "",
          licenseNumbers: Array.isArray(e.detail.licenseNumbers) ? e.detail.licenseNumbers : [],
          profilePicture: resolveImageUrl(e.detail.profilePicture),
        });
        setLoadingProfile(false);
      } else {
        fetchProfile();
      }
    };

    window.addEventListener("doctorProfileUpdated", handleProfileUpdated);
    return () =>
      window.removeEventListener("doctorProfileUpdated", handleProfileUpdated);
  }, [fetchProfile]);

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
    { name: "Dashboard",   icon: <RiDashboardFill />,    path: "/doctor/dashboard"   },
    { name: "Appointment", icon: <FaCalendarDays />,      path: "/doctor/appointment" },
    { name: "Schedule",    icon: <BsCalendarCheckFill />, path: "/doctor/schedule"    },
    { name: "Patients",    icon: <BsPersonLinesFill />,   path: "/doctor/patient"     },
    { name: "My Profile",  icon: <BiSolidUserCircle />,   path: "/doctor/profile"     },
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
    if (!firstName && !lastName) return "...";
    const mi = middleInitial ? `${middleInitial.charAt(0).toUpperCase()}.` : "";
    return [firstName, mi, lastName].filter(Boolean).join(" ");
  };

  const getInitials = () => {
    const f = doctorProfile.firstName?.charAt(0).toUpperCase() || "";
    const l = doctorProfile.lastName?.charAt(0).toUpperCase() || "";
    return f + l || "?";
  };

  const Shimmer = ({ width = "100%", height = "12px", borderRadius = "6px" }) => (
    <span
      style={{
        display: "block",
        width,
        height,
        borderRadius,
        background:      "linear-gradient(90deg,#e8dff5 0%,#d4c3ee 50%,#e8dff5 100%)",
        backgroundSize:  "200% 100%",
        animation:       "sidebarShimmer 1.4s infinite",
      }}
    />
  );

  // ── Render license numbers ──
  const renderLicenseNumbers = () => {
    if (loadingProfile) return <Shimmer width="65%" height="10px" />;

    const { licenseNumbers } = doctorProfile;

    if (licenseNumbers.length === 0) {
      return "PRC License No.: N/A";
    }

    if (licenseNumbers.length === 1) {
      return `PRC License No.: ${licenseNumbers[0]}`;
    }

    // more than 1 — stack them
    return (
      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontWeight: 600, fontSize: "10px", opacity: 0.75 }}>
          PRC License No.:
        </span>
        {licenseNumbers.map((num, i) => (
          <span key={i} style={{ fontSize: "11px" }}>
            {num}
          </span>
        ))}
      </span>
    );
  };

  return (
    <>
      <div
        className={`${styles.sidebarContainer} ${
          collapsed ? styles.collapsed : ""
        }`}
      >
        <div className={styles.sidebar}>
          {/* ── Header ── */}
          <div className={styles.sidebarHeader}>
            <img src={logo} alt="Logo" className={styles.sidebarLogo} />
            <FiMenu className={styles.menuIcon} onClick={toggleCollapsed} />
          </div>

          {/* ── Profile Section ── */}
          <div className={styles.profileSection}>
            {/* Avatar */}
            <div className={styles.profilePic}>
              {loadingProfile ? (
                <Shimmer width="100%" height="100%" borderRadius="50%" />
              ) : doctorProfile.profilePicture ? (
                <img
                  key={doctorProfile.profilePicture}
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
                <span className={styles.profileInitials}>{getInitials()}</span>
              )}
            </div>

            {/* Name + License Numbers */}
            <div className={styles.profileInfo}>
              <h5 className={styles.profileName}>
                {loadingProfile ? (
                  <Shimmer width="80%" height="12px" />
                ) : (
                  getDisplayName()
                )}
              </h5>

              <p className={styles.profileContact}>
                {renderLicenseNumbers()}
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

          {/* ── Menu ── */}
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

      {/* ── Collapsed tooltip ── */}
      {tooltip.visible && (
        <div
          className={styles.tooltipOverlay}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}

      <style>{`
        @keyframes sidebarShimmer {
          0%   { background-position:  200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

export default DoctorSideBar;

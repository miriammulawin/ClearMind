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
    firstName:      "",
    lastName:       "",
    middleInitial:  "",
    licenseNumbers: [],
    profilePicture: null,
  });

  const [loadingProfile, setLoadingProfile] = useState(true);

  const navigate  = useNavigate();
  const location  = useLocation();

  // ── Fetch from /api/doctor/profile ──────────────────────────────────────
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

      // Normalize license_numbers — always produce a clean string array
      const rawLicenses = data.license_numbers;
      const licenseNumbers = Array.isArray(rawLicenses)
        ? rawLicenses.filter((n) => n !== null && n !== undefined && String(n).trim() !== "")
        : rawLicenses && String(rawLicenses).trim() !== ""
          ? [String(rawLicenses).trim()]   // legacy single-string fallback
          : [];

      setDoctorProfile({
        // API returns camelCase from the User model fields
        firstName:      data.firstName     || "",
        lastName:       data.lastName      || "",
        middleInitial:  data.middleInitial || "",
        licenseNumbers,
        // API returns snake_case for the doctor table column
        profilePicture: resolveImageUrl(data.profile_picture || data.profilePicture),
      });
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // ── On mount: clear stale cache then fetch ───────────────────────────────
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (currentUser?.id) {
      localStorage.removeItem(`doctorProfile_${currentUser.id}`);
      localStorage.removeItem("doctorProfile");
    }
    fetchProfile();
  }, [fetchProfile]);

  // ── Real-time listener: fired by AccountSetupModal after save ────────────
  useEffect(() => {
    const handleProfileUpdated = (e) => {
      if (e.detail) {
        const rawLicenses = e.detail.licenseNumbers ?? e.detail.license_numbers;
        const licenseNumbers = Array.isArray(rawLicenses)
          ? rawLicenses.filter((n) => n !== null && n !== undefined && String(n).trim() !== "")
          : rawLicenses && String(rawLicenses).trim() !== ""
            ? [String(rawLicenses).trim()]
            : [];

        setDoctorProfile({
          firstName:      e.detail.firstName     || "",
          lastName:       e.detail.lastName      || "",
          middleInitial:  e.detail.middleInitial || "",
          licenseNumbers,
          profilePicture: resolveImageUrl(
            e.detail.profile_picture || e.detail.profilePicture
          ),
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

  // ── Auto-collapse on small screens ──────────────────────────────────────
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

  // ── Build display name ───────────────────────────────────────────────────
  const getDisplayName = () => {
    const { firstName, lastName, middleInitial } = doctorProfile;
    if (!firstName && !lastName) return "...";

    // If firstName already contains the full name (has comma = "LastName, First MI")
    // return it directly to avoid duplication
    if (firstName.includes(",") || firstName === lastName) {
      return firstName.trim();
    }

    const rawMI = (middleInitial || "").trim();
    const mi = rawMI ? `${rawMI.charAt(0).toUpperCase()}.` : "";

    return [firstName.trim(), mi, lastName.trim()]
      .filter(Boolean)
      .join(" ");
  };

  const getInitials = () => {
    const f = doctorProfile.firstName?.trim().charAt(0).toUpperCase() || "";
    const l = doctorProfile.lastName?.trim().charAt(0).toUpperCase()  || "";
    return f + l || "?";
  };

  const Shimmer = ({ width = "100%", height = "12px", borderRadius = "6px" }) => (
    <span
      style={{
        display:         "block",
        width,
        height,
        borderRadius,
        background:      "linear-gradient(90deg,#e8dff5 0%,#d4c3ee 50%,#e8dff5 100%)",
        backgroundSize:  "200% 100%",
        animation:       "sidebarShimmer 1.4s infinite",
      }}
    />
  );

  // ── Render license numbers ───────────────────────────────────────────────
  const renderLicenseNumbers = () => {
    if (loadingProfile) return <Shimmer width="65%" height="10px" />;

    const { licenseNumbers } = doctorProfile;

    if (!licenseNumbers || licenseNumbers.length === 0) {
      return <span>PRC License No.: N/A</span>;
    }

    // Single or multiple — always join with ", "
    return (
      <span>PRC License No.: {licenseNumbers.join(", ")}</span>
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
                    width:        "100%",
                    height:       "100%",
                    objectFit:    "cover",
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
                    text:    item.name,
                    x:       rect.right + 10,
                    y:       rect.top + rect.height / 2,
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
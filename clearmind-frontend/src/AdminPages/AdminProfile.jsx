import { useState } from "react";
import {
  FiEdit,
  FiLock,
  FiFileText,
  FiLogOut,
  FiSave,
  FiShield,
  FiUser,
} from "react-icons/fi";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminProfile.module.css";

function AdminProfile() {
  const [activeMenu, setActiveMenu] = useState("My Profile");
  const [activeTab, setActiveTab] = useState("edit");

  const [profileData, setProfileData] = useState({
    firstName: "Admin",
    lastName: "User",
    birthday: "1990-01-01",
    name: "Admin101",
    email: "admin101@gmail.com",
    contact: "09123456789",
    address: "123 Main Street, City, Country",
    profilePic: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((p) => ({ ...p, [name]: value }));
  };

  const handleSaveProfile = () => alert("Profile updated successfully!");

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setProfileData((p) => ({ ...p, profilePic: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleLogout = () => alert("Logging out...");

  /* Initials avatar fallback */
  const initials =
    `${profileData.firstName[0] || ""}${profileData.lastName[0] || ""}`.toUpperCase();

  const navItems = [
    {
      key: "edit",
      label: "Edit Profile",
      icon: <FiEdit />,
      subtitle: "Update your personal info",
    },
    {
      key: "password",
      label: "Change Password",
      icon: <FiLock />,
      subtitle: "Update your credentials",
    },
    {
      key: "terms",
      label: "Terms & Conditions",
      icon: <FiFileText />,
      subtitle: "Read our usage policy",
    },
  ];

  const currentNav = navItems.find((n) => n.key === activeTab) || navItems[0];

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className={styles.profilePage}>
          <div className={styles.profileCard}>
            {/* ════════ LEFT PANEL ════════ */}
            <div className={styles.profileLeft}>
              {/* Avatar */}
              <div className={styles.avatarWrapper}>
                {profileData.profilePic ? (
                  <img
                    src={profileData.profilePic}
                    alt="Profile"
                    className={styles.avatarImg}
                  />
                ) : (
                  <div
                    className={styles.avatarImg}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #7341A8, #4D227C)",
                      fontSize: "32px",
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: 1,
                    }}
                  >
                    {initials}
                  </div>
                )}
                <label className={styles.editPicOverlay} title="Change photo">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    style={{ display: "none" }}
                  />
                  ✎
                </label>
              </div>

              {/* Name + email */}
              <h3 className={styles.leftName}>{profileData.name}</h3>
              <p className={styles.leftEmail}>{profileData.email}</p>

              {/* Info chips */}
              <div className={styles.leftChips}>
                <span className={styles.leftChip}>Admin</span>
                <span className={styles.leftChip}>{profileData.contact}</span>
              </div>

              {/* Navigation */}
              <div className={styles.sideNav}>
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    className={`${styles.sideNavBtn} ${activeTab === item.key ? styles.sideNavActive : ""}`}
                    onClick={() => setActiveTab(item.key)}
                  >
                    <span className={styles.sideNavIcon}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <hr className={styles.navDivider} />
                <button
                  className={`${styles.sideNavBtn} ${styles.logoutBtn}`}
                  onClick={handleLogout}
                >
                  <span className={styles.sideNavIcon}>
                    <FiLogOut />
                  </span>
                  Logout
                </button>
              </div>
            </div>

            {/* ════════ RIGHT PANEL ════════ */}
            <div className={styles.profileRight}>
              {/* Purple header */}
              <div className={styles.tabHeader}>
                <div className={styles.tabHeaderIcon}>{currentNav.icon}</div>
                <div>
                  <h4 className={styles.tabTitle}>{currentNav.label}</h4>
                  <p className={styles.tabSubtitle}>{currentNav.subtitle}</p>
                </div>
              </div>

              {/* ── Edit Profile ── */}
              {activeTab === "edit" && (
                <div className={styles.tabBody}>
                  <p className={styles.sectionLabel}>Personal Information</p>
                  <div className={styles.formGrid}>
                    <label className={styles.formLabel}>
                      First Name
                      <input
                        className={styles.formInput}
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                      />
                    </label>
                    <label className={styles.formLabel}>
                      Last Name
                      <input
                        className={styles.formInput}
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                      />
                    </label>
                    <label className={styles.formLabel}>
                      Birthday
                      <input
                        className={styles.formInput}
                        type="date"
                        name="birthday"
                        value={profileData.birthday}
                        onChange={handleInputChange}
                      />
                    </label>
                    <label className={styles.formLabel}>
                      Username
                      <input
                        className={styles.formInput}
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        placeholder="Enter username"
                      />
                    </label>
                  </div>

                  <hr className={styles.sectionDivider} />

                  <p className={styles.sectionLabel}>Contact Information</p>
                  <div className={styles.formGrid}>
                    <label className={styles.formLabel}>
                      Email Address
                      <input
                        className={styles.formInput}
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                      />
                    </label>
                    <label className={styles.formLabel}>
                      Contact Number
                      <input
                        className={styles.formInput}
                        type="text"
                        name="contact"
                        value={profileData.contact}
                        onChange={handleInputChange}
                        placeholder="e.g. 09XX XXX XXXX"
                      />
                    </label>
                    <label
                      className={`${styles.formLabel} ${styles.fullWidth}`}
                    >
                      Address
                      <input
                        className={styles.formInput}
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        placeholder="Enter full address"
                      />
                    </label>
                  </div>

                  <button
                    className={styles.btnSave}
                    onClick={handleSaveProfile}
                  >
                    <FiSave size={15} /> Save Changes
                  </button>
                </div>
              )}

              {/* ── Change Password ── */}
              {activeTab === "password" && (
                <div className={styles.tabBody}>
                  <p className={styles.sectionLabel}>Update Credentials</p>
                  <div className={styles.formGrid}>
                    <label
                      className={`${styles.formLabel} ${styles.fullWidth}`}
                    >
                      Current Password
                      <input
                        className={styles.formInput}
                        type="password"
                        placeholder="Enter current password"
                      />
                    </label>
                    <label className={styles.formLabel}>
                      New Password
                      <input
                        className={styles.formInput}
                        type="password"
                        placeholder="Enter new password"
                      />
                      <span className={styles.passwordHint}>
                        At least 8 characters
                      </span>
                    </label>
                    <label className={styles.formLabel}>
                      Confirm Password
                      <input
                        className={styles.formInput}
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </label>
                  </div>

                  <button className={styles.btnSave}>
                    <FiShield size={15} /> Update Password
                  </button>
                </div>
              )}

              {/* ── Terms & Conditions ── */}
              {activeTab === "terms" && (
                <div className={styles.tabBody}>
                  <p className={styles.sectionLabel}>Usage Policy</p>
                  <p className={styles.termsText}>
                    By accessing the ClearMind Psychological Services admin
                    panel, you agree to maintain the confidentiality of all
                    patient records, session data, and clinical notes stored
                    within this system. Unauthorized access, disclosure, or use
                    of protected health information is strictly prohibited and
                    may result in legal action under applicable data privacy
                    laws.
                  </p>
                  <p className={styles.termsText}>
                    All administrative actions performed within this system are
                    logged and audited. You are responsible for all activities
                    conducted under your account credentials. If you suspect
                    unauthorized access to your account, you must immediately
                    notify your system administrator and change your password.
                  </p>
                  <p className={styles.termsText}>
                    ClearMind Psychological Services reserves the right to
                    modify these terms at any time. Continued use of the system
                    following any changes constitutes acceptance of the updated
                    terms. For questions or concerns regarding these terms,
                    please contact your system administrator.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;

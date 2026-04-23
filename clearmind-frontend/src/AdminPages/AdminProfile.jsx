import { useState, useEffect, useRef } from "react";
import {
  FiEdit,
  FiLock,
  FiFileText,
  FiLogOut,
  FiSave,
  FiShield,
  FiCamera,
} from "react-icons/fi";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminProfile.module.css";
import axiosClient from "../axiosClient";

function AdminProfile() {
  const [activeMenu, setActiveMenu] = useState("My Profile");
  const [activeTab, setActiveTab] = useState("edit");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const picInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    birthday: "",
    sex: "",
    genderIdentity: "",
    preferredPronoun: "",
    email: "",
    contact: "",
    address: "",
    role: "Admin",
    profilePic: null, // will hold URL string or base64 preview
  });

  // Separate state: the actual File object chosen by the user (if any)
  const [newPicFile, setNewPicFile] = useState(null);

  const [passwordData, setPasswordData] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  // ── Fetch live profile ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: json } = await axiosClient.get("/me");
        const u = json.data;

        setProfileData({
          firstName: u.firstName ?? "",
          lastName: u.lastName ?? "",
          middleInitial: u.middleInitial ?? "",
          birthday: u.dob ?? "",
          sex: u.sex ?? "",
          genderIdentity: u.genderIdentity ?? "",
          preferredPronoun: u.preferredPronoun ?? "",
          email: u.email ?? "",
          contact: u.contactNo ?? "",
          address: u.address ?? "",
          role: u.role ?? "Admin",
          profilePic: u.profilePicture ?? null,
        });

        syncSidebarCache(u);
      } catch (err) {
        console.error(err);
        setError("Could not load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const syncSidebarCache = (u) => {
    localStorage.setItem(
      "adminProfile",
      JSON.stringify({
        firstName: u.firstName ?? "",
        lastName: u.lastName ?? "",
        middleInitial: u.middleInitial ?? "",
        contactNo: u.contactNo ?? "",
        email: u.email ?? "",
        profilePicture: u.profilePicture ?? null,
      }),
    );
    window.dispatchEvent(new Event("adminProfileUpdated"));
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((p) => ({ ...p, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
  };

  /**
   * When user picks a new picture:
   * 1. Store the File object so we can upload it on save.
   * 2. Generate a local base64 preview so the avatar updates immediately.
   */
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewPicFile(file); // keep the File for FormData upload

    const reader = new FileReader();
    reader.onload = () =>
      setProfileData((p) => ({ ...p, profilePic: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      // Laravel method spoofing: POST + _method=PUT so it matches
      // Route::match(['put','post'], '/me', ...) and accepts file uploads
      formData.append("_method", "PUT");

      formData.append("firstName", profileData.firstName);
      formData.append("lastName", profileData.lastName);
      formData.append("middleInitial", profileData.middleInitial);
      formData.append("dob", profileData.birthday);
      formData.append("sex", profileData.sex);
      formData.append("genderIdentity", profileData.genderIdentity);
      formData.append("preferredPronoun", profileData.preferredPronoun);
      formData.append("contactNo", profileData.contact);
      formData.append("email", profileData.email);
      formData.append("address", profileData.address);

      // Only attach picture when the user actually chose a new one
      if (newPicFile) {
        formData.append("profilePicture", newPicFile);
      }

      // Route::match(['put','post'], '/me', [AuthController::class, 'update'])
      const { data: json } = await axiosClient.post("/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const u = json.data;

      setProfileData((p) => ({
        ...p,
        firstName: u.firstName ?? p.firstName,
        lastName: u.lastName ?? p.lastName,
        middleInitial: u.middleInitial ?? p.middleInitial,
        birthday: u.dob ?? p.birthday,
        sex: u.sex ?? p.sex,
        genderIdentity: u.genderIdentity ?? p.genderIdentity,
        preferredPronoun: u.preferredPronoun ?? p.preferredPronoun,
        contact: u.contactNo ?? p.contact,
        email: u.email ?? p.email,
        address: u.address ?? p.address,
        // Use the server-returned URL (full path); fall back to current preview
        profilePic: u.profilePicture ?? p.profilePic,
      }));

      setNewPicFile(null); // clear staged file after successful save
      syncSidebarCache(u);

      alert("Profile updated successfully!");
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? "Update failed";
      setError(msg);
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    const { current, newPass, confirm } = passwordData;

    if (!current) {
      alert("Please enter your current password.");
      return;
    }
    if (newPass.length < 8) {
      alert("New password must be at least 8 characters.");
      return;
    }
    if (newPass !== confirm) {
      alert("New password and confirmation do not match.");
      return;
    }

    try {
      await axiosClient.put("/me", {
        // Required fields your backend validation needs
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        dob: profileData.birthday,
        contactNo: profileData.contact,
        email: profileData.email,

        // Password fields
        current_password: current, // ← was missing before
        password: newPass,
        password_confirmation: confirm,
      });

      setPasswordData({ current: "", newPass: "", confirm: "" });
      alert("Password updated successfully!");
    } catch (err) {
      const msg =
        err.response?.data?.message ?? err.message ?? "Password update failed";
      alert(msg);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("adminProfile");
      window.location.href = "/";
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const initials =
    `${profileData.firstName?.[0] ?? ""}${profileData.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";

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

  const currentNav = navItems.find((n) => n.key === activeTab) ?? navItems[0];

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="admin-layout">
        <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="admin-main">
          <AdminTopNavbar activeMenu={activeMenu} />
          <div style={{ padding: 40, textAlign: "center", color: "#7341A8" }}>
            Loading profile…
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className={styles.profilePage}>
          <div className={styles.profileCard}>
            {/* ════════ LEFT PANEL ════════ */}
            <div className={styles.profileLeft}>
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

                {/* Camera overlay — clicking opens the hidden file input */}
                <button
                  className={styles.editPicOverlay}
                  title="Change photo"
                  onClick={() => picInputRef.current?.click()}
                  type="button"
                >
                  <FiCamera size={16} />
                </button>

                {/* Hidden file input — ref-controlled */}
                <input
                  ref={picInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  style={{ display: "none" }}
                />

                {/* Small badge when a new pic is staged but not yet saved */}
                {newPicFile && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#7341A8",
                      color: "#fff",
                      fontSize: 10,
                      borderRadius: 4,
                      padding: "2px 6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Unsaved
                  </span>
                )}
              </div>

              <h3 className={styles.leftName}>
                {profileData.firstName}
                {profileData.middleInitial
                  ? ` ${profileData.middleInitial}.`
                  : ""}{" "}
                {profileData.lastName}
              </h3>
              <p className={styles.leftEmail}>{profileData.email}</p>

              <div className={styles.leftChips}>
                <span className={styles.leftChip}>{profileData.role}</span>
                {profileData.contact && (
                  <span className={styles.leftChip}>{profileData.contact}</span>
                )}
              </div>

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
                  {error && (
                    <p style={{ color: "red", marginBottom: 12 }}>{error}</p>
                  )}

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
                      Middle Initial
                      <input
                        className={styles.formInput}
                        type="text"
                        name="middleInitial"
                        value={profileData.middleInitial}
                        onChange={handleInputChange}
                        placeholder="e.g. A"
                        maxLength={3}
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
                      Sex
                      <select
                        className={styles.formInput}
                        name="sex"
                        value={profileData.sex}
                        onChange={handleInputChange}
                      >
                        <option value="">Select sex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    <label className={styles.formLabel}>
                      Gender Identity
                      <input
                        className={styles.formInput}
                        type="text"
                        name="genderIdentity"
                        value={profileData.genderIdentity}
                        onChange={handleInputChange}
                        placeholder="e.g. male, non-binary"
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
                    disabled={saving}
                  >
                    <FiSave size={15} /> {saving ? "Saving…" : "Save Changes"}
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
                        name="current"
                        value={passwordData.current}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                      />
                    </label>
                    <label className={styles.formLabel}>
                      New Password
                      <input
                        className={styles.formInput}
                        type="password"
                        name="newPass"
                        value={passwordData.newPass}
                        onChange={handlePasswordChange}
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
                        name="confirm"
                        value={passwordData.confirm}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                      />
                    </label>
                  </div>
                  <button
                    className={styles.btnSave}
                    onClick={handleUpdatePassword}
                  >
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
                    terms.
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

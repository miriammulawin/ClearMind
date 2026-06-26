import React, { useState, useEffect, useCallback } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/ManageAccounts.module.css";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosClient from "../axiosClient";

const STORAGE_BASE = "http://127.0.0.1:8000/storage/";

const resolveStorageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return STORAGE_BASE + path;
};

function ManageAccounts() {
  const [activeMenu, setActiveMenu] = useState("Manage Accounts");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    sex: "",
    dob: "",
    email: "",
    contactNo: "",
    address: "",
  });

  const allRoles = [
    "Add Clinic",
    "Edit Appointment",
    "View Patients",
    "View Billing",
    "Manage Accounts",
  ];

  // ── Helper: format array fields for display ────────────────────────
  const formatArray = (value) => {
    if (!value) return "—";
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
    return value || "—";
  };

  // ── Calculate age from DOB ─────────────────────────────────────────
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // ── Map a raw API user record to our local shape ───────────────────
  const mapDoctor = (user) => {
    const doctor = user.doctor ?? {};
    const dob = user.dob ?? null;

    // license_numbers is now a JSON array in the DB
    const rawLicenses = doctor.license_numbers ?? [];
    const licenseNumbers = Array.isArray(rawLicenses)
      ? rawLicenses.filter(Boolean)
      : rawLicenses
        ? [String(rawLicenses)]
        : [];

    return {
      // ── IDs ──────────────────────────────────────────────────────
      doctors_id: doctor.doctor_id ?? user.id,
      user_id: user.id,

      // ── User fields ───────────────────────────────────────────────
      first_name: user.firstName ?? "",
      last_name: user.lastName ?? "",
      middle_initial: user.middleInitial ?? "",
      sex: user.sex ?? null,
      date_of_birth: dob,
      age: user.age ?? calculateAge(dob),
      email_address: user.email ?? "",
      phone: user.contactNo ?? "",
      address: user.address ?? "",
      created_at: user.created_at ?? "",
      roles: user.roles ?? [],

      // ── Doctor fields ─────────────────────────────────────────────
      professional_title: doctor.professional_title ?? null,
      license_numbers: licenseNumbers, // ✅ array
      years_of_experience: doctor.years_of_experience ?? null,
      practicing_since: doctor.practicing_since ?? null,
      description: doctor.description ?? null,
      profile_completed: doctor.profile_completed ?? false,

      // ── JSON array fields ─────────────────────────────────────────
      specialization: doctor.specializations ?? [],
      sub_specialization: doctor.sub_specializations ?? [],
      board_certification: doctor.board_cert_names ?? [],
      service: doctor.services ?? [],

      // ── Images ───────────────────────────────────────────────────
      profile_pic: resolveStorageUrl(
        doctor.profile_picture ?? user.profilePicture,
      ),

      cert_images: (doctor.board_cert_images ?? []).map(resolveStorageUrl),
      id_pictures: (doctor.id_pictures ?? []).map(resolveStorageUrl),
    };
  };

  // ── Fetch doctors ──────────────────────────────────────────────────
  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get("/admin/doctors");
      const result = response.data;
      setUsers(result.data.map(mapDoctor));
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // ── Keep selectedUser in sync when list refreshes ─────────────────
  useEffect(() => {
    if (!selectedUser) return;
    const updated = users.find((u) => u.user_id === selectedUser.user_id);
    if (updated) setSelectedUser(updated);
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listen for profile updates ─────────────────────────────────────
  useEffect(() => {
    const handler = () => fetchDoctors();
    window.addEventListener("doctorProfileUpdated", handler);
    return () => window.removeEventListener("doctorProfileUpdated", handler);
  }, [fetchDoctors]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleRoleChange = (userId, role) => {
    setUsers(
      users.map((user) => {
        if (user.doctors_id !== userId) return user;
        const hasRole = user.roles.includes(role);
        return {
          ...user,
          roles: hasRole
            ? user.roles.filter((r) => r !== role)
            : [...user.roles, role],
        };
      }),
    );
  };

  const handleViewAccount = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleOpenCreateModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      middleInitial: "",
      sex: "",
      dob: "",
      email: "",
      contactNo: "",
      address: "",
    });
    setFormErrors([]);
    setShowCreateModal(true);
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.firstName.trim())
      errors.push({ field: "firstName", message: "First name is required." });
    if (!formData.lastName.trim())
      errors.push({ field: "lastName", message: "Last name is required." });
    if (!formData.sex)
      errors.push({ field: "sex", message: "Sex is required." });
    if (!formData.dob)
      errors.push({ field: "dob", message: "Date of birth is required." });
    if (!formData.email.trim()) {
      errors.push({ field: "email", message: "Email address is required." });
    } else if (
      !formData.email.includes("@") ||
      !formData.email.endsWith(".com")
    ) {
      errors.push({
        field: "email",
        message: "Email must contain '@' and end with '.com'.",
      });
    }
    if (!formData.contactNo.trim()) {
      errors.push({
        field: "contactNo",
        message: "Contact number is required.",
      });
    } else if (!/^09\d{9}$/.test(formData.contactNo)) {
      errors.push({
        field: "contactNo",
        message:
          "Contact number must start with '09' and be exactly 11 digits.",
      });
    }
    if (!formData.address.trim())
      errors.push({ field: "address", message: "Address is required." });
    return errors;
  };

  const handleCreateAccount = async () => {
    setIsSubmitting(true);
    const errors = validateForm();
    const hasEmptyFields = errors.some((e) =>
      e.message.toLowerCase().includes("required"),
    );
    const hasFormatErrors = errors.some(
      (e) => !e.message.toLowerCase().includes("required"),
    );

    if (errors.length > 0) {
      if (hasEmptyFields) {
        setFormErrors([{ field: "all", message: "All fields are required." }]);
        setTimeout(() => setFormErrors([]), 2400);
      } else if (hasFormatErrors) {
        setFormErrors(errors);
        setTimeout(() => setFormErrors([]), errors.length * 400 + 2000);
      }
      setIsSubmitting(false);
      return;
    }

    setFormErrors([]);
    try {
      const response = await fetch("http://localhost:8000/api/admin/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) {
        const serverErrors = Object.entries(result.errors || {}).flatMap(
          ([field, messages]) =>
            messages.map((message) => ({ field, message })),
        );
        setFormErrors(serverErrors);
        setTimeout(() => setFormErrors([]), serverErrors.length * 400 + 2000);
        return;
      }

      if (result.is_existing) {
        toast.error(
          `Account already exists. Credentials email has been resent to ${formData.email}.`,
          {
            duration: 1500,
            style: {
              background: "#FDECEA",
              border: "1px solid #F5C6CB",
              color: "#C62828",
              fontWeight: 600,
              fontSize: "0.9rem",
              textAlign: "center",
              maxWidth: "320px",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
            },
            iconTheme: { primary: "#C62828", secondary: "#FDECEA" },
          },
        );
        setShowCreateModal(false);
        return;
      }

      setUsers((prev) => [
        ...prev,
        mapDoctor({ ...result.data, doctor: result.data.doctor ?? {} }),
      ]);
      toast.success(`Account created! Credentials sent to ${formData.email}.`, {
        duration: 1500,
        style: {
          background: "#E2F7E3",
          border: "1px solid #91C793",
          color: "#2E7D32",
          fontWeight: 600,
          fontSize: "0.95rem",
          textAlign: "center",
          maxWidth: "320px",
          borderRadius: "10px",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        },
        iconTheme: { primary: "#2E7D32", secondary: "#E2F7E3" },
      });
      setShowCreateModal(false);
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className={`admin-content ${styles.page}`}>
          <div className={styles.header}>
            <h3 className={styles.title}>Manage Accounts</h3>
            <button
              className={styles.btnCreate}
              onClick={handleOpenCreateModal}
            >
              + Create Account
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  {allRoles.map((role) => (
                    <th key={role}>{role}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={allRoles.length + 2}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      Loading doctors...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={allRoles.length + 2}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No doctor accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={`${user.user_id}-${user.doctors_id}`}>
                      <td>{user.email_address}</td>
                      {allRoles.map((role) => (
                        <td key={role}>
                          <input
                            type="checkbox"
                            checked={user.roles.includes(role)}
                            onChange={() =>
                              handleRoleChange(user.doctors_id, role)
                            }
                          />
                        </td>
                      ))}
                      <td>
                        <button
                          className={styles.btnView}
                          onClick={() => handleViewAccount(user)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ════ CREATE MODAL ════ */}
      {showCreateModal && (
        <div
          className={styles.overlay}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className={styles.createModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.createHeader}>
              <h2>Create Doctor Account</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowCreateModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.createBody}>
              <div className={styles.formCard}>
                <div className={styles.formGrid}>
                  <label
                    className={styles.formLabel}
                    style={{ gridColumn: "1" }}
                  >
                    First Name
                    <input
                      type="text"
                      className={`${styles.formInput} ${formErrors.some((e) => e.field === "firstName" || e.field === "all") ? styles.inputError : ""}`}
                      placeholder="e.g. Maria"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </label>
                  <label className={styles.formLabel}>
                    Last Name
                    <input
                      type="text"
                      className={`${styles.formInput} ${formErrors.some((e) => e.field === "lastName" || e.field === "all") ? styles.inputError : ""}`}
                      placeholder="e.g. Santos"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </label>
                  <label className={styles.formLabel}>
                    M.I.
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. B"
                      maxLength={1}
                      value={formData.middleInitial}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          middleInitial: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label className={styles.formLabel}>
                    Sex
                    <select
                      className={`${styles.formInput} ${formErrors.some((e) => e.field === "sex" || e.field === "all") ? styles.inputError : ""}`}
                      value={formData.sex}
                      onChange={(e) =>
                        setFormData({ ...formData, sex: e.target.value })
                      }
                    >
                      <option value="">Select Sex</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </label>
                  <label className={styles.formLabel}>
                    Date of Birth
                    <input
                      type="date"
                      className={`${styles.formInput} ${formErrors.some((e) => e.field === "dob" || e.field === "all") ? styles.inputError : ""}`}
                      value={formData.dob}
                      onChange={(e) =>
                        setFormData({ ...formData, dob: e.target.value })
                      }
                    />
                  </label>
                  <label className={styles.formLabel}>
                    Email Address
                    <input
                      type="email"
                      className={`${styles.formInput} ${formErrors.some((e) => e.field === "email" || e.field === "all") ? styles.inputError : ""}`}
                      placeholder="doctor@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </label>
                  <label className={`${styles.formLabel} ${styles.col2}`}>
                    Contact Number
                    <input
                      type="tel"
                      className={`${styles.formInput} ${formErrors.some((e) => e.field === "contactNo" || e.field === "all") ? styles.inputError : ""}`}
                      placeholder="e.g. 09123456789"
                      value={formData.contactNo}
                      onChange={(e) =>
                        setFormData({ ...formData, contactNo: e.target.value })
                      }
                    />
                  </label>
                  <label className={styles.formLabel}>
                    Address
                    <input
                      type="text"
                      className={`${styles.formInput} ${formErrors.some((e) => e.field === "address" || e.field === "all") ? styles.inputError : ""}`}
                      placeholder="e.g. Quezon City"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className={styles.errorContainer}>
                  {formErrors.map((err, index) => (
                    <div
                      key={`${err.field}-${index}`}
                      className={styles.errorText}
                      style={{ animationDelay: `${index * 0.35}s` }}
                    >
                      {err.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.createFooter}>
              <button
                className={styles.btnCancel}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.btnSubmit}
                onClick={handleCreateAccount}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ VIEW MODAL ════ */}
      {showViewModal && selectedUser && (
        <div className={styles.overlay} onClick={() => setShowViewModal(false)}>
          <div
            className={styles.viewModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.viewHeader}>
              <div className={styles.viewHeaderLeft}>
                <img
                  src={
                    selectedUser.profile_pic
                      ? `${selectedUser.profile_pic}?t=${Date.now()}`
                      : "https://via.placeholder.com/150/6a49a9/ffffff?text=Dr."
                  }
                  alt="Profile"
                  className={styles.viewAvatar}
                />
                <div className={styles.viewHeaderInfo}>
                  <h2>
                    Dr. {selectedUser.first_name}{" "}
                    {selectedUser.middle_initial
                      ? `${selectedUser.middle_initial}.`
                      : ""}{" "}
                    {selectedUser.last_name}
                  </h2>
                  <p className={styles.viewSubtitle}>
                    {selectedUser.professional_title || "No title yet"}{" "}
                    &nbsp;•&nbsp; {formatArray(selectedUser.specialization)}
                  </p>
                </div>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setShowViewModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.viewBody}>
              {/* Personal Information */}
              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>Personal Information</p>
                <div className={styles.viewInfoGrid}>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Doctor ID</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.doctors_id || "—"}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Sex</span>
                    <span className={styles.viewInfoValue}>
                      {/* ✅ Capitalize first letter */}
                      {selectedUser.sex
                        ? selectedUser.sex.charAt(0).toUpperCase() +
                          selectedUser.sex.slice(1)
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Age</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.age != null
                        ? `${selectedUser.age} years old`
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Date of Birth</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.date_of_birth
                        ? new Date(
                            selectedUser.date_of_birth,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Email</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.email_address || "—"}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Phone</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.phone || "—"}
                    </span>
                  </div>
                  <div
                    className={`${styles.viewInfoItem} ${styles.viewInfoFull}`}
                  >
                    <span className={styles.viewInfoLabel}>Address</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.address || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>
                  Professional Information
                </p>
                <div className={styles.viewInfoGrid}>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>
                      PRC License No.
                    </span>
                    <span className={styles.viewInfoValue}>
                      {/* ✅ Show all license numbers joined, not single string */}
                      {selectedUser.license_numbers?.length > 0
                        ? selectedUser.license_numbers.join(", ")
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>
                      Practicing Since
                    </span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.practicing_since || "—"}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Experience</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.years_of_experience
                        ? `${selectedUser.years_of_experience} years`
                        : "—"}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Specialization</span>
                    <span className={styles.viewInfoValue}>
                      {formatArray(selectedUser.specialization)}
                    </span>
                  </div>
                  <div
                    className={`${styles.viewInfoItem} ${styles.viewInfoFull}`}
                  >
                    <span className={styles.viewInfoLabel}>
                      Sub-Specialization
                    </span>
                    <span className={styles.viewInfoValue}>
                      {formatArray(selectedUser.sub_specialization)}
                    </span>
                  </div>
                  <div
                    className={`${styles.viewInfoItem} ${styles.viewInfoFull}`}
                  >
                    <span className={styles.viewInfoLabel}>
                      Board Certification
                    </span>
                    <span className={styles.viewInfoValue}>
                      {formatArray(selectedUser.board_certification)}
                    </span>
                  </div>
                  <div
                    className={`${styles.viewInfoItem} ${styles.viewInfoFull}`}
                  >
                    <span className={styles.viewInfoLabel}>
                      Services Offered
                    </span>
                    <span className={styles.viewInfoValue}>
                      {formatArray(selectedUser.service)}
                    </span>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>About</p>
                <p className={styles.viewDescription}>
                  {selectedUser.description || "No description yet."}
                </p>
              </div>

              {/* Roles */}
              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>
                  Assigned Roles & Permissions
                </p>
                <div className={styles.viewRolesList}>
                  {selectedUser.roles.length > 0 ? (
                    selectedUser.roles.map((role, i) => (
                      <span key={i} className={styles.viewRoleBadge}>
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className={styles.viewEmpty}>No roles assigned</span>
                  )}
                </div>
              </div>

              {/* Certification Documents */}
              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>
                  Certification Documents
                </p>
                <div className={styles.viewCertContainer}>
                  {selectedUser.cert_images?.length > 0 ? (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                    >
                      {selectedUser.cert_images.map((src, i) => (
                        <img
                          key={i}
                          src={`${src}?t=${Date.now()}`}
                          alt={`Certificate ${i + 1}`}
                          onClick={() => setPreviewImage(src)}
                          style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1.5px solid #e2d5f5",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: "#999", fontSize: "14px" }}>
                      No certificate uploaded yet.
                    </span>
                  )}
                </div>
              </div>

              {/* ID Pictures */}
              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>ID Pictures</p>
                <div className={styles.viewCertContainer}>
                  {selectedUser.id_pictures?.length > 0 ? (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                    >
                      {selectedUser.id_pictures.map((src, i) => (
                        <img
                          key={i}
                          src={`${src}?t=${Date.now()}`}
                          alt={`ID ${i + 1}`}
                          onClick={() => setPreviewImage(src)}
                          style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1.5px solid #e2d5f5",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: "#999", fontSize: "14px" }}>
                      No ID pictures uploaded yet.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.viewFooter}>
              <button
                className={styles.btnCloseView}
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ IMAGE PREVIEW ════ */}
      {previewImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setPreviewImage(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "25px",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "32px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            <FiX />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "10px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default ManageAccounts;

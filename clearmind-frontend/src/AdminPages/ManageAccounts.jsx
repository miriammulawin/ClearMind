import React, { useState, useEffect, useCallback } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/ManageAccounts.module.css";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import axiosClient from "../axiosClient";

function ManageAccounts() {
  const [activeMenu, setActiveMenu] = useState("Manage Accounts");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    return value;
  };

  // ── Fetch doctors ──────────────────────────────────────────────────
  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get("/admin/doctors");
      const result = response.data;

      const mapped = result.data.map((user) => ({
        doctors_id: user.doctor?.doctor_id ?? user.id,
        user_id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        middle_initial: user.middleInitial,
        sex: user.sex,
        date_of_birth: user.dob,
        email_address: user.email,
        phone: user.contactNo,
        address: user.address,
        age: user.age ?? null,
        roles: user.roles ?? [],
        created_at: user.created_at,
        professional_title: user.doctor?.professional_title ?? null,
        license_number: user.doctor?.license_number ?? null,
        years_of_experience: user.doctor?.years_of_experience ?? null,
        // Keep as arrays — format only at render time
        specialization: user.doctor?.specializations ?? [],
        sub_specialization: user.doctor?.sub_specializations ?? [],
        board_certification: user.doctor?.board_cert_names ?? [],
        service: user.doctor?.services ?? [],
        description: user.doctor?.description ?? null,
        profile_pic: user.doctor?.profile_picture
          ? `http://127.0.0.1:8000/storage/${user.doctor.profile_picture}`
          : null,
        cert_image: user.doctor?.board_cert_images?.[0]
          ? `http://127.0.0.1:8000/storage/${user.doctor.board_cert_images[0]}`
          : null,
        // All cert images for gallery
        cert_images: (user.doctor?.board_cert_images ?? []).map(
          (p) => `http://127.0.0.1:8000/storage/${p}`,
        ),
        id_pictures: (user.doctor?.id_pictures ?? []).map(
          (p) => `http://127.0.0.1:8000/storage/${p}`,
        ),
        profile_completed: user.doctor?.profile_completed ?? false,
      }));

      setUsers(mapped);
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // ── Listen for doctor profile updates dispatched by AccountSetupModal ──
  useEffect(() => {
    const handleProfileUpdated = () => {
      // Refetch all doctors so admin view stays in sync
      fetchDoctors().then(() => {
        // If the view modal is open, refresh selectedUser from updated list
        setSelectedUser((prev) => {
          if (!prev) return prev;
          // Will be synced below in a separate effect
          return prev;
        });
      });
    };

    window.addEventListener("doctorProfileUpdated", handleProfileUpdated);
    return () =>
      window.removeEventListener("doctorProfileUpdated", handleProfileUpdated);
  }, [fetchDoctors]);

  // ── When users list re-fetches, keep selectedUser in sync ─────────
  useEffect(() => {
    if (!selectedUser) return;
    const updated = users.find((u) => u.user_id === selectedUser.user_id);
    if (updated) setSelectedUser(updated);
  }, [users]); // eslint-disable-line react-hooks/exhaustive-deps

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
              boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
            },
            iconTheme: { primary: "#C62828", secondary: "#FDECEA" },
          },
        );
        setShowCreateModal(false);
        return;
      }

      setUsers((prev) => [
        ...prev,
        {
          doctors_id: result.data.doctor?.doctor_id,
          user_id: result.data.id,
          first_name: result.data.firstName,
          last_name: result.data.lastName,
          middle_initial: result.data.middleInitial,
          sex: result.data.sex,
          date_of_birth: result.data.dob,
          email_address: result.data.email,
          phone: result.data.contactNo,
          address: result.data.address,
          age: null,
          roles: [],
          created_at: result.data.created_at,
          professional_title: null,
          license_number: null,
          years_of_experience: null,
          specialization: [],
          sub_specialization: [],
          board_certification: [],
          service: [],
          description: null,
          profile_pic: null,
          cert_image: null,
          cert_images: [],
          id_pictures: [],
          profile_completed: false,
        },
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
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
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

      {/* ════════════════════════════
          CREATE ACCOUNT MODAL
      ════════════════════════════ */}
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
                      className={`${styles.formInput} ${
                        formErrors.some(
                          (e) => e.field === "firstName" || e.field === "all",
                        )
                          ? styles.inputError
                          : ""
                      }`}
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
                      className={`${styles.formInput} ${
                        formErrors.some(
                          (e) => e.field === "lastName" || e.field === "all",
                        )
                          ? styles.inputError
                          : ""
                      }`}
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
                      className={`${styles.formInput} ${
                        formErrors.some(
                          (e) => e.field === "sex" || e.field === "all",
                        )
                          ? styles.inputError
                          : ""
                      }`}
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
                      className={`${styles.formInput} ${
                        formErrors.some(
                          (e) => e.field === "dob" || e.field === "all",
                        )
                          ? styles.inputError
                          : ""
                      }`}
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
                      className={`${styles.formInput} ${
                        formErrors.some(
                          (e) => e.field === "email" || e.field === "all",
                        )
                          ? styles.inputError
                          : ""
                      }`}
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
                      className={`${styles.formInput} ${
                        formErrors.some(
                          (e) => e.field === "contactNo" || e.field === "all",
                        )
                          ? styles.inputError
                          : ""
                      }`}
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
                      className={`${styles.formInput} ${
                        formErrors.some(
                          (e) => e.field === "address" || e.field === "all",
                        )
                          ? styles.inputError
                          : ""
                      }`}
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

      {/* ════════════════════════════
          VIEW ACCOUNT MODAL
      ════════════════════════════ */}
      {showViewModal && selectedUser && (
        <div className={styles.overlay} onClick={() => setShowViewModal(false)}>
          <div
            className={styles.viewModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.viewHeader}>
              <div className={styles.viewHeaderLeft}>
                {/* ── Profile picture with cache-bust so edits show immediately ── */}
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
                      {selectedUser.sex || "—"}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Age</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.age ? `${selectedUser.age} years old` : "—"}
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
                </div>
              </div>

              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>
                  Professional Information
                </p>
                <div className={styles.viewInfoGrid}>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>License No.</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.license_number || "—"}
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

              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>About</p>
                <p className={styles.viewDescription}>
                  {selectedUser.description || "No description yet."}
                </p>
              </div>

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

              {/* ── Board Cert Images (all of them) ── */}
              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>
                  Certification Documents
                </p>
                <div className={styles.viewCertContainer}>
                  {selectedUser.cert_images &&
                  selectedUser.cert_images.length > 0 ? (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                    >
                      {selectedUser.cert_images.map((src, i) => (
                        <img
                          key={i}
                          src={`${src}?t=${Date.now()}`}
                          alt={`Certificate ${i + 1}`}
                          className={styles.viewCertImage}
                          style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1.5px solid #e2d5f5",
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

              {/* ── ID Pictures ── */}
              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>ID Pictures</p>
                <div className={styles.viewCertContainer}>
                  {selectedUser.id_pictures &&
                  selectedUser.id_pictures.length > 0 ? (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
                    >
                      {selectedUser.id_pictures.map((src, i) => (
                        <img
                          key={i}
                          src={`${src}?t=${Date.now()}`}
                          alt={`ID ${i + 1}`}
                          style={{
                            width: "120px",
                            height: "120px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "1.5px solid #e2d5f5",
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
    </div>
  );
}

export default ManageAccounts;

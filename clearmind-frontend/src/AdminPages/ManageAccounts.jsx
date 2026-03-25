import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/ManageAccounts.module.css";
import { FiX } from "react-icons/fi";

function ManageAccounts() {
  const [activeMenu, setActiveMenu] = useState("Manage Accounts");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([
    {
      doctors_id: 1,
      first_name: "Miriam",
      last_name: "Mulawin",
      middle_initial: "B",
      sex: "Female",
      date_of_birth: "1985-03-15",
      age: 39,
      email_address: "miriam.mulawin@gmail.com",
      phone: "+63 917 123 4567",
      description:
        "Licensed clinical psychologist specializing in cognitive-behavioral therapy and trauma-informed care.",
      professional_title: "Clinical Psychologist",
      years_of_experience: 12,
      license_number: "LIC-2012-45678",
      specialization: "Psychology",
      sub_specialization: "Cognitive-Behavioral Therapy",
      board_certification: "Philippine Board of Psychology",
      service: "Mental Health & Wellness Center",
      cert_image:
        "https://via.placeholder.com/600x400/6a49a9/ffffff?text=Psychology+Certificate",
      profile_pic:
        "https://via.placeholder.com/150/6a49a9/ffffff?text=Dr.+Mulawin",
      roles: ["Add Clinic", "View Billing", "Edit Appointment"],
      created_at: "2023-01-15",
    },
    {
      doctors_id: 2,
      first_name: "Liezel",
      last_name: "Reyes",
      middle_initial: "M",
      sex: "Female",
      date_of_birth: "1990-07-22",
      age: 34,
      email_address: "liezel.reyes@hospital.com",
      phone: "+63 918 987 6543",
      description:
        "Board-certified psychologist with expertise in child and adolescent psychology and developmental behavioral assessments.",
      professional_title: "Psychologist",
      years_of_experience: 8,
      license_number: "LIC-2016-78901",
      specialization: "Psychology",
      sub_specialization: "Child & Adolescent Psychology",
      board_certification: "Philippine Board of Psychology",
      service: "Child & Family Counseling Unit",
      cert_image:
        "https://via.placeholder.com/600x400/4e237c/ffffff?text=Board+Certificate",
      profile_pic:
        "https://via.placeholder.com/150/4e237c/ffffff?text=Dr.+Reyes",
      roles: ["Edit Appointment", "Add Clinic"],
      created_at: "2023-06-20",
    },
  ]);

  const allRoles = [
    "Add Clinic",
    "Edit Appointment",
    "View Patients",
    "View Billing",
    "Manage Accounts",
  ];

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

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className={`admin-content ${styles.page}`}>
          {/* Header */}
          <div className={styles.header}>
            <h3 className={styles.title}>Manage Accounts</h3>
            <button
              className={styles.btnCreate}
              onClick={() => setShowCreateModal(true)}
            >
              + Create Account
            </button>
          </div>

          {/* Table */}
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
                {users.map((user) => (
                  <tr key={user.doctors_id}>
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
                ))}
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
                      className={styles.formInput}
                      placeholder="e.g. Maria"
                    />
                  </label>
                  <label className={styles.formLabel}>
                    Last Name
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Santos"
                    />
                  </label>
                  <label className={styles.formLabel}>
                    M.I.
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. B"
                      maxLength={1}
                    />
                  </label>
                  <label className={styles.formLabel}>
                    Sex
                    <select className={styles.formInput}>
                      <option value="">Select Sex</option>
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </label>
                  <label className={styles.formLabel}>
                    Date of Birth
                    <input type="date" className={styles.formInput} />
                  </label>
                  <label className={styles.formLabel}>
                    Email Address
                    <input
                      type="email"
                      className={styles.formInput}
                      placeholder="doctor@email.com"
                    />
                  </label>
                  <label className={`${styles.formLabel} ${styles.col2}`}>
                    Contact Number
                    <input
                      type="tel"
                      className={styles.formInput}
                      placeholder="e.g. 09123456789"
                    />
                  </label>
                  <label className={styles.formLabel}>
                    Address
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Quezon City"
                    />
                  </label>
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
              <button className={styles.btnSubmit}>Create Account</button>
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
                <img
                  src={selectedUser.profile_pic}
                  alt="Profile"
                  className={styles.viewAvatar}
                />
                <div className={styles.viewHeaderInfo}>
                  <h2>
                    Dr. {selectedUser.first_name} {selectedUser.middle_initial}.{" "}
                    {selectedUser.last_name}
                  </h2>
                  <p className={styles.viewSubtitle}>
                    {selectedUser.professional_title} &nbsp;•&nbsp;{" "}
                    {selectedUser.specialization}
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
                      {selectedUser.doctors_id}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Sex</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.sex}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Age</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.age} years old
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Date of Birth</span>
                    <span className={styles.viewInfoValue}>
                      {new Date(selectedUser.date_of_birth).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Email</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.email_address}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Phone</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.phone}
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
                    <span className={styles.viewInfoLabel}>License No.</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.license_number}
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Experience</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.years_of_experience} years
                    </span>
                  </div>
                  <div className={styles.viewInfoItem}>
                    <span className={styles.viewInfoLabel}>Specialization</span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.specialization}
                    </span>
                  </div>
                  <div
                    className={`${styles.viewInfoItem} ${styles.viewInfoFull}`}
                  >
                    <span className={styles.viewInfoLabel}>
                      Sub-Specialization
                    </span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.sub_specialization}
                    </span>
                  </div>
                  <div
                    className={`${styles.viewInfoItem} ${styles.viewInfoFull}`}
                  >
                    <span className={styles.viewInfoLabel}>
                      Board Certification
                    </span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.board_certification}
                    </span>
                  </div>
                  <div
                    className={`${styles.viewInfoItem} ${styles.viewInfoFull}`}
                  >
                    <span className={styles.viewInfoLabel}>
                      Service Department
                    </span>
                    <span className={styles.viewInfoValue}>
                      {selectedUser.service}
                    </span>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>About</p>
                <p className={styles.viewDescription}>
                  {selectedUser.description}
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

              {/* Certificate */}
              <div className={styles.viewSection}>
                <p className={styles.viewSectionTitle}>
                  Certification Document
                </p>
                <div className={styles.viewCertContainer}>
                  <img
                    src={selectedUser.cert_image}
                    alt="Certificate"
                    className={styles.viewCertImage}
                  />
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

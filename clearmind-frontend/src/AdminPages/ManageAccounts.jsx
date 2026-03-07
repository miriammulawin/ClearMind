import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/ManageAccounts.css";
import { FiX } from "react-icons/fi";

function ManageAccounts() {
  const [activeMenu, setActiveMenu] = useState("Manage Accounts");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
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
        "Licensed clinical psychologist specializing in cognitive-behavioral therapy and trauma-informed care. Dedicated to supporting patients through anxiety, depression, and emotional regulation challenges with a compassionate, evidence-based approach.",
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
        "Board-certified psychologist with expertise in child and adolescent psychology and developmental behavioral assessments. Committed to fostering mental well-being among young patients through play therapy and family-centered interventions.",
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
        if (user.doctors_id === userId) {
          const hasRole = user.roles.includes(role);
          return {
            ...user,
            roles: hasRole
              ? user.roles.filter((r) => r !== role)
              : [...user.roles, role],
          };
        }
        return user;
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
        <div className="admin-content" style={{ padding: "20px" }}>
          <div className="manage-accounts-header">
            <h3 className="manage-accounts-title">Manage Account</h3>
            <button
              className="btn-create"
              onClick={() => setShowDoctorModal(true)}
            >
              + Create Account
            </button>
          </div>

          <div className="table-container">
            <table className="account-table">
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
                        className="btn-view"
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

      {/* ── Create Doctor Account Modal ── */}
      {showDoctorModal && (
        <div
          className="doctor-modal-overlay"
          onClick={() => setShowDoctorModal(false)}
        >
          <div className="doctor-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="doctor-modal-header">
              <h2>Create Doctor Account</h2>
              <button
                className="doctor-close-btn"
                onClick={() => setShowDoctorModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="doctor-modal-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control input-violet"
                      placeholder="e.g. Maria"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control input-violet"
                      placeholder="e.g. Santos"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">M.I.</label>
                    <input
                      type="text"
                      className="form-control input-violet"
                      placeholder="e.g. B"
                      maxLength={1}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Sex</label>
                    <select className="form-select input-violet">
                      <option value="">Select Sex</option>
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control input-violet" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control input-violet"
                      placeholder="e.g. doctor@email.com"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="tel"
                      className="form-control input-violet"
                      placeholder="e.g. 09123456789"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control input-violet"
                      placeholder="e.g. Quezon City, Metro Manila"
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDoctorModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary create-btn">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── View Account Modal ── */}
      {showViewModal && selectedUser && (
        <div
          className="view-modal-overlay"
          onClick={() => setShowViewModal(false)}
        >
          <div className="view-modal-lg" onClick={(e) => e.stopPropagation()}>
            {/* ── Purple Header with profile ── */}
            <div className="view-modal-header">
              <div className="view-modal-header-left">
                <img
                  src={selectedUser.profile_pic}
                  alt="Profile"
                  className="view-modal-avatar"
                />
                <div className="view-modal-header-info">
                  <h2>
                    Dr. {selectedUser.first_name} {selectedUser.middle_initial}.{" "}
                    {selectedUser.last_name}
                  </h2>
                  <p className="view-modal-subtitle">
                    {selectedUser.professional_title} &nbsp;•&nbsp;{" "}
                    {selectedUser.specialization}
                  </p>
                </div>
              </div>
              <button
                className="view-modal-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <FiX />
              </button>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="view-modal-body">
              {/* Personal Information */}
              <div className="view-modal-section">
                <h4 className="view-modal-section-title">
                  Personal Information
                </h4>
                <div className="view-info-grid">
                  <div className="view-info-item">
                    <span className="view-info-label">Doctor ID</span>
                    <span className="view-info-value">
                      {selectedUser.doctors_id}
                    </span>
                  </div>
                  <div className="view-info-item">
                    <span className="view-info-label">Sex</span>
                    <span className="view-info-value">{selectedUser.sex}</span>
                  </div>
                  <div className="view-info-item">
                    <span className="view-info-label">Date of Birth</span>
                    <span className="view-info-value">
                      {new Date(selectedUser.date_of_birth).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="view-info-item">
                    <span className="view-info-label">Age</span>
                    <span className="view-info-value">
                      {selectedUser.age} years old
                    </span>
                  </div>
                  <div className="view-info-item">
                    <span className="view-info-label">Email Address</span>
                    <span className="view-info-value">
                      {selectedUser.email_address}
                    </span>
                  </div>
                  <div className="view-info-item">
                    <span className="view-info-label">Phone Number</span>
                    <span className="view-info-value">
                      {selectedUser.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="view-modal-section">
                <h4 className="view-modal-section-title">
                  Professional Information
                </h4>
                <div className="view-info-grid">
                  <div className="view-info-item">
                    <span className="view-info-label">License Number</span>
                    <span className="view-info-value">
                      {selectedUser.license_number}
                    </span>
                  </div>
                  <div className="view-info-item">
                    <span className="view-info-label">Years of Experience</span>
                    <span className="view-info-value">
                      {selectedUser.years_of_experience} years
                    </span>
                  </div>
                  <div className="view-info-item">
                    <span className="view-info-label">Specialization</span>
                    <span className="view-info-value">
                      {selectedUser.specialization}
                    </span>
                  </div>
                  <div className="view-info-item">
                    <span className="view-info-label">Sub-Specialization</span>
                    <span className="view-info-value">
                      {selectedUser.sub_specialization}
                    </span>
                  </div>
                  <div className="view-info-item view-info-full">
                    <span className="view-info-label">Board Certification</span>
                    <span className="view-info-value">
                      {selectedUser.board_certification}
                    </span>
                  </div>
                  <div className="view-info-item view-info-full">
                    <span className="view-info-label">Service Department</span>
                    <span className="view-info-value">
                      {selectedUser.service}
                    </span>
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="view-modal-section">
                <h4 className="view-modal-section-title">About</h4>
                <p className="view-modal-description">
                  {selectedUser.description}
                </p>
              </div>

              {/* Roles & Permissions */}
              <div className="view-modal-section">
                <h4 className="view-modal-section-title">
                  Assigned Roles & Permissions
                </h4>
                <div className="view-roles-list">
                  {selectedUser.roles.length > 0 ? (
                    selectedUser.roles.map((role, index) => (
                      <span key={index} className="view-role-badge">
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="view-empty">No roles assigned</span>
                  )}
                </div>
              </div>

              {/* Certification */}
              <div className="view-modal-section">
                <h4 className="view-modal-section-title">
                  Certification Document
                </h4>
                <div className="view-cert-container">
                  <img
                    src={selectedUser.cert_image}
                    alt="Certificate"
                    className="view-cert-image"
                  />
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="view-modal-footer">
              <button
                className="view-btn-close"
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

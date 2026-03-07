import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/ManageAccounts.css";
import { FiX } from "react-icons/fi";

function ManageAccounts() {
  const [activeMenu, setActiveMenu] = useState("Manage Accounts");
  const [showViewModal, setShowViewModal] = useState(false);
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
        "Experienced cardiologist specializing in interventional cardiology and heart failure management. Dedicated to providing comprehensive cardiac care with a patient-centered approach.",
      professional_title: "Cardiologist",
      years_of_experience: 12,
      license_number: "LIC-2012-45678",
      specialization: "Cardiology",
      sub_specialization: "Interventional Cardiology",
      board_certification: "Philippine Board of Cardiology",
      service: "Heart Center",
      cert_image:
        "https://via.placeholder.com/600x400/6a49a9/ffffff?text=Medical+Certificate",
      profile_pic:
        "https://via.placeholder.com/150/6a49a9/ffffff?text=Dr.+Santos",
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
        "Board-certified pediatrician with expertise in developmental pediatrics and adolescent medicine. Committed to ensuring the health and well-being of children from infancy through adolescence.",
      professional_title: "Pediatrician",
      years_of_experience: 8,
      license_number: "LIC-2016-78901",
      specialization: "Pediatrics",
      sub_specialization: "Developmental Pediatrics",
      board_certification: "Philippine Board of Pediatrics",
      service: "Children's Ward",
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

  const handleSave = () => {
    console.log("Updated users with roles:", users);
    alert("Roles updated successfully!");
  };

  const handleViewAccount = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content" style={{ padding: "20px" }}>
          <div className="manage-accounts-header">
            <h3 className="manage-accounts-title">Manage Account</h3>
            <button className="btn-create">+ Create Account</button>
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

   
      {showViewModal && selectedUser && (
        <div className="account-modal-overlay">
          <div className="account-modal">
            <div className="account-modal-header">
              <img
                src={selectedUser.profile_pic}
                alt="Profile"
                className="account-modal-profile"
              />
              <div className="account-modal-header-info">
                <h3>
                  Dr. {selectedUser.first_name} {selectedUser.middle_initial}.{" "}
                  {selectedUser.last_name}
                </h3>
                <p className="account-modal-subtitle">
                  {selectedUser.professional_title} •{" "}
                  {selectedUser.specialization}
                </p>
              </div>
              <button
                className="account-modal-close"
                onClick={() => setShowViewModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="account-modal-body">
          
              <div className="account-section">
                <h4 className="account-section-title">Personal Information</h4>
                <div className="account-info-grid">
                  <div className="account-info-item">
                    <div className="account-info-label">Doctor ID</div>
                    <div className="account-info-value">
                      {selectedUser.doctors_id}
                    </div>
                  </div>
                  <div className="account-info-item">
                    <div className="account-info-label">Sex</div>
                    <div className="account-info-value">{selectedUser.sex}</div>
                  </div>
                  <div className="account-info-item">
                    <div className="account-info-label">Date of Birth</div>
                    <div className="account-info-value">
                      {new Date(selectedUser.date_of_birth).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </div>
                  </div>
                  <div className="account-info-item">
                    <div className="account-info-label">Age</div>
                    <div className="account-info-value">
                      {selectedUser.age} years old
                    </div>
                  </div>
                  <div className="account-info-item">
                    <div className="account-info-label">Email Address</div>
                    <div className="account-info-value">
                      {selectedUser.email_address}
                    </div>
                  </div>
                  <div className="account-info-item">
                    <div className="account-info-label">Phone Number</div>
                    <div className="account-info-value">
                      {selectedUser.phone}
                    </div>
                  </div>
                </div>
              </div>


              <div className="account-section">
                <h4 className="account-section-title">
                  Professional Information
                </h4>
                <div className="account-info-grid">
                  <div className="account-info-item">
                    <div className="account-info-label">License Number</div>
                    <div className="account-info-value">
                      {selectedUser.license_number}
                    </div>
                  </div>
                  <div className="account-info-item">
                    <div className="account-info-label">
                      Years of Experience
                    </div>
                    <div className="account-info-value">
                      {selectedUser.years_of_experience} years
                    </div>
                  </div>
                  <div className="account-info-item">
                    <div className="account-info-label">Specialization</div>
                    <div className="account-info-value">
                      {selectedUser.specialization}
                    </div>
                  </div>
                  <div className="account-info-item">
                    <div className="account-info-label">Sub-Specialization</div>
                    <div className="account-info-value">
                      {selectedUser.sub_specialization}
                    </div>
                  </div>
                  <div className="account-info-item account-info-full">
                    <div className="account-info-label">
                      Board Certification
                    </div>
                    <div className="account-info-value">
                      {selectedUser.board_certification}
                    </div>
                  </div>
                  <div className="account-info-item account-info-full">
                    <div className="account-info-label">Service Department</div>
                    <div className="account-info-value">
                      {selectedUser.service}
                    </div>
                  </div>
                </div>
              </div>

       
              <div className="account-section">
                <h4 className="account-section-title">About</h4>
                <div className="account-description">
                  {selectedUser.description}
                </div>
              </div>

              <div className="account-section">
                <h4 className="account-section-title">
                  Assigned Roles & Permissions
                </h4>
                <div className="account-roles-list">
                  {selectedUser.roles.length > 0 ? (
                    selectedUser.roles.map((role, index) => (
                      <span key={index} className="role-badge">
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="empty-value">No roles assigned</span>
                  )}
                </div>
              </div>

   
              <div className="account-section">
                <h4 className="account-section-title">
                  Certification Document
                </h4>
                <div className="cert-image-container">
                  <img
                    src={selectedUser.cert_image}
                    alt="Certificate"
                    className="cert-image"
                  />
                </div>
              </div>
            </div>

            <div className="account-modal-footer">
              <button
                className="btn-close-modal"
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

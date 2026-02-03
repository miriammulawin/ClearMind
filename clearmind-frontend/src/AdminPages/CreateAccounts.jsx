import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/CreateAccount.css";
import { FiX } from "react-icons/fi";

function CreateAccounts() {
  const [activeMenu, setActiveMenu] = useState("Create Accounts");
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content create-accounts-page">
          <div className="create-accounts-header">
            <h3 className="create-accounts-title">Doctor&apos;s Account</h3>
            <button
              className="create-btn"
              onClick={() => setShowDoctorModal(true)}
            >
              Create <i className="bi bi-plus-lg" />
            </button>
          </div>

          <div className="create-accounts-card">
            <table className="create-accounts-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Email Address</th>
                  <th>Mobile No.</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Liezel Paciente</td>
                  <td>Psychologist</td>
                  <td>paciente@gmail.com</td>
                  <td>09123456767</td>
                  <td>
                    <div className="status-switch form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultChecked
                      />
                    </div>
                  </td>
                  <td>
                    <button className="view-btn">View</button>
                  </td>
                </tr>

                <tr>
                  <td>2</td>
                  <td>Brian Dela Cruz</td>
                  <td>Psychologist</td>
                  <td>briandelacruz@gmail.com</td>
                  <td>09123456767</td>
                  <td>
                    <div className="status-switch form-check form-switch">
                      <input className="form-check-input" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <button className="view-btn">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="create-pagination">
            <p>Page 1 of 3</p>
            <ul>
              <li>‹</li>
              <li className="active">1</li>
              <li>2</li>
              <li>3</li>
              <li>›</li>
            </ul>
          </div>
        </div>
      </div>

      {showDoctorModal && (
        <div className="doctor-modal-overlay">
          <div className="doctor-modal-lg">
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
              <div className="doctor-modal-section">
                <h4>Personal Information</h4>
                <div className="doctor-form-grid">
                  <input placeholder="First Name" />
                  <input placeholder="Last Name" />
                  <input placeholder="Middle Initial" />
                  <input placeholder="Sex" />
                  <input type="date" />
                  <input placeholder="Contact Number" />
                  <input placeholder="Specialization" />
                  <input placeholder="Email Address" />
                </div>
              </div>
            </div>

            <div className="doctor-modal-footer">
              <button className="doctor-save-btn">Create Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateAccounts;

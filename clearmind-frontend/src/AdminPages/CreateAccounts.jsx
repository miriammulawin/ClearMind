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
  <div
    className="doctor-modal-overlay"
    onClick={() => setShowDoctorModal(false)}
  >
    <div
      className="doctor-modal-lg"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="doctor-modal-header">
        <h2>Create Doctor Account</h2>
        <button
          className="doctor-close-btn"
          onClick={() => setShowDoctorModal(false)}
        >
          <FiX />
        </button>
      </div>

      {/* Body */}
      <div className="doctor-modal-body">
        <form>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">First Name</label>
              <input type="text" className="form-control input-violet" />
            </div>

            <div className="col-md-4">
              <label className="form-label">Last Name</label>
              <input type="text" className="form-control input-violet" />
            </div>

            <div className="col-md-4">
              <label className="form-label">M.I</label>
              <input type="text" className="form-control input-violet" />
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
              <input type="email" className="form-control input-violet" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Contact Number</label>
              <input type="tel" className="form-control input-violet" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Address</label>
              <input type="text" className="form-control input-violet" />
            </div>
          </div>

          {/* Footer */}
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

    </div>
  );
}

export default CreateAccounts;

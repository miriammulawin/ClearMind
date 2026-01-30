import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/DoctorAccounts.css";

function CreateAccounts() {
  const [activeMenu, setActiveMenu] = useState("Create Accounts");
  const [showModal, setShowModal] = useState(false); 

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className="admin-content d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="doctor-text text-black">Doctor&apos;s Account</h3>

            <button
              className="btn btn-primary text-white px-3 p-3"
              style={{ backgroundColor: "#005892", border: "none" }}
              onClick={() => setShowModal(true)}
            >
              Create <i className="bi bi-plus-lg px-2"></i>
            </button>
          </div>

          {/* Table Content */}
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <td>#</td>
                <td>Name</td>
                <td>Specialization</td>
                <td>Email Address</td>
                <td>Mobile No.</td>
                <td>Status</td>
                <td>Actions</td>
              </tr>
            </thead>

            <tbody>
              <tr>
                <th scope="row">1</th>
                <th>Liezel Paciente</th>
                <th>Psychologist</th>
                <th>paciente@gmail.com</th>
                <th>09123456767</th>
                <th>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" />
                  </div>
                </th>
                <th>
                  <button className="btn btn-primary px-4" style={{ backgroundColor: "#7341A8" }}>
                    View
                  </button>
                </th>
              </tr>
               <tr>
                <th scope="row">2</th>
                <th>Liezel Paciente</th>
                <th>Psychologist</th>
                <th>paciente@gmail.com</th>
                <th>09123456767</th>
                <th>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" />
                  </div>
                </th>
                <th>
                  <button className="btn btn-primary px-4" style={{ backgroundColor: "#7341A8" }}>
                    View
                  </button>
                </th>
              </tr> 
               <tr>
                <th scope="row">3</th>
                <th>Liezel Paciente</th>
                <th>Psychologist</th>
                <th>paciente@gmail.com</th>
                <th>09123456767</th>
                <th>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" role="switch" />
                  </div>
                </th>
                <th>
                  <button className="btn btn-primary px-4" style={{ backgroundColor: "#7341A8" }}>
                    View
                  </button>
                </th>
              </tr>
            </tbody>
          </table>

          {/* Pagination */}
          <nav className="mt-auto">
            <div className="d-flex align-items-center position-relative">
              <p className="mb-0" style={{ color: "#4D227C" }}>
                Page 1 of 3
              </p>
              <ul className="pagination justify-content-center mx-auto mb-0">
                <li className="page-item">
                  <i className="bi bi-arrow-left-short" />
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    1
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    2
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    3
                  </a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">
                    Next
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Modal */}
      {/* Modal */}
{showModal && (
  <div className="modal-backdrop">
    <div className="modal-card p-4">
      <h4 className="text-purple mb-3">Create Doctor Account</h4>
      <form>
        <div className="row g-3">
          <div className="col-md-4">
            <label htmlFor="firstName" className="form-label">
              First Name
            </label>
            <input type="text" className="form-control input-violet" id="firstName" />
          </div>

          <div className="col-md-4">
            <label htmlFor="lastName" className="form-label">
              Last Name
            </label>
            <input type="text" className="form-control input-violet" id="lastName" />
          </div>

          <div className="col-md-4">
            <label htmlFor="mi" className="form-label">
              M.I
            </label>
            <input type="text" className="form-control input-violet" id="mi" />
          </div>

          <div className="col-md-4">
            <label htmlFor="sex" className="form-label">
              Sex
            </label>
            <select className="form-select input-violet" id="sex">
              <option value="">Select Sex</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </div>

          <div className="col-md-4">
            <label htmlFor="dob" className="form-label">
              Date of Birth
            </label>
            <input type="date" className="form-control input-violet" id="dob" />
          </div>

          <div className="col-md-4">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input type="email" className="form-control input-violet" id="email" />
          </div>
          

          <div className="col-md-6">
            <label htmlFor="contact" className="form-label">
              Contact Number
            </label>
            <input type="tel" className="form-control input-violet" id="contact" />
          </div>
           <div className="col-md-6">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input type="tel" className="form-control input-violet" id="address" />
          </div>
        </div>
          

        <div className="d-flex justify-content-end mt-4">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={() => setShowModal(false)}
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
)}
      </div>
    </div>
  );
}

export default CreateAccounts;

import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient"; // ← adjust path if needed
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/CreateAccount.css";
import { FiX, FiEye } from "react-icons/fi";

function CreateAccounts() {
  const [activeMenu, setActiveMenu] = useState("Create Accounts");
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Table state
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Form state
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    middle_initial: "",
    sex: "",
    dob: "",
    email: "",
    contact_no: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ── Fetch doctors list ─────────────────────────────────────────
  const fetchDoctors = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/admin/doctors", {
        params: { page },
      });
      setDoctors(data.data || []);
      setCurrentPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(currentPage);
  }, [currentPage]);

  // ── Toggle active status ───────────────────────────────────────
  const handleToggleStatus = async (id) => {
    try {
      const { data } = await axiosClient.patch(
        `/admin/doctors/${id}/toggle-status`
      );
      setDoctors((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, is_active: data.is_active } : doc
        )
      );
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  // ── View single doctor ─────────────────────────────────────────
  const handleView = async (id) => {
    try {
      const { data } = await axiosClient.get(`/admin/doctors/${id}`);
      setSelectedDoctor(data);
      setShowViewModal(true);
    } catch (err) {
      console.error("Failed to fetch doctor:", err);
    }
  };

  // ── Create doctor form ─────────────────────────────────────────
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setSuccessMessage("");

    try {
      const { data } = await axiosClient.post("/admin/doctors", form);
      setSuccessMessage(
        `Account created! Default password: ${data.default_password}`
      );
      setForm({
        first_name: "",
        last_name: "",
        middle_initial: "",
        sex: "",
        dob: "",
        email: "",
        contact_no: "",
        address: "",
      });
      fetchDoctors(currentPage);
      setTimeout(() => {
        setShowDoctorModal(false);
        setSuccessMessage("");
      }, 2500);
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        setFormErrors({
          general: err.response?.data?.message || "Something went wrong.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Pagination ─────────────────────────────────────────────────
  const renderPaginationItems = () => {
    const items = [];
    for (let i = 1; i <= lastPage; i++) {
      items.push(
        <li
          key={i}
          className={i === currentPage ? "active" : ""}
          onClick={() => setCurrentPage(i)}
          style={{ cursor: "pointer" }}
        >
          {i}
        </li>
      );
    }
    return items;
  };

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content create-accounts-page">
          <div className="create-accounts-header">
            <h3 className="create-accounts-title">Doctors Account</h3>
            <button
              className="btn-create"
              onClick={() => {
                setShowDoctorModal(true);
                setSuccessMessage("");
                setFormErrors({});
              }}
            >
              + Create Account
            </button>
          </div>

          <div className="create-accounts-card">
            {loading ? (
              <p className="text-center py-4">Loading...</p>
            ) : (
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
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No doctors found.
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doc, index) => (
                      <tr key={doc.id}>
                        <td>{(currentPage - 1) * 10 + index + 1}</td>
                        <td>{doc.name}</td>
                        <td>{doc.specialization}</td>
                        <td>{doc.email}</td>
                        <td>{doc.contact}</td>
                        <td>
                          <div className="status-switch form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={!!doc.is_active}
                              onChange={() => handleToggleStatus(doc.id)}
                            />
                          </div>
                        </td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => handleView(doc.id)}
                          >
                            <FiEye style={{ marginRight: 4 }} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {lastPage > 1 && (
            <div className="create-pagination">
              <p>
                Page {currentPage} of {lastPage}
              </p>
              <ul>
                <li
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  style={{ cursor: "pointer" }}
                >
                  ‹
                </li>
                {renderPaginationItems()}
                <li
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, lastPage))
                  }
                  style={{ cursor: "pointer" }}
                >
                  ›
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Doctor Modal ─────────────────────────────────── */}
      {showDoctorModal && (
        <div
          className="doctor-modal-overlay"
          onClick={() => setShowDoctorModal(false)}
        >
          <div
            className="doctor-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
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
              {successMessage && (
                <div className="alert alert-success mb-3">{successMessage}</div>
              )}
              {formErrors.general && (
                <div className="alert alert-danger mb-3">
                  {formErrors.general}
                </div>
              )}

              <form onSubmit={handleCreateSubmit}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      className={`form-control input-violet ${
                        formErrors.first_name ? "is-invalid" : ""
                      }`}
                      value={form.first_name}
                      onChange={handleFormChange}
                    />
                    {formErrors.first_name && (
                      <div className="invalid-feedback">
                        {formErrors.first_name[0]}
                      </div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      className={`form-control input-violet ${
                        formErrors.last_name ? "is-invalid" : ""
                      }`}
                      value={form.last_name}
                      onChange={handleFormChange}
                    />
                    {formErrors.last_name && (
                      <div className="invalid-feedback">
                        {formErrors.last_name[0]}
                      </div>
                    )}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">M.I</label>
                    <input
                      type="text"
                      name="middle_initial"
                      className="form-control input-violet"
                      value={form.middle_initial}
                      onChange={handleFormChange}
                      maxLength={2}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Sex</label>
                    <select
                      name="sex"
                      className="form-select input-violet"
                      value={form.sex}
                      onChange={handleFormChange}
                    >
                      <option value="">Select Sex</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      className="form-control input-violet"
                      value={form.dob}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control input-violet ${
                        formErrors.email ? "is-invalid" : ""
                      }`}
                      value={form.email}
                      onChange={handleFormChange}
                    />
                    {formErrors.email && (
                      <div className="invalid-feedback">
                        {formErrors.email[0]}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="tel"
                      name="contact_no"
                      className="form-control input-violet"
                      value={form.contact_no}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control input-violet"
                      value={form.address}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDoctorModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary create-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── View Doctor Modal ───────────────────────────────────── */}
      {showViewModal && selectedDoctor && (
        <div
          className="doctor-modal-overlay"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="doctor-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doctor-modal-header">
              <h2>Doctor Details</h2>
              <button
                className="doctor-close-btn"
                onClick={() => setShowViewModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="doctor-modal-body">
              {selectedDoctor.profile_picture && (
                <div className="text-center mb-3">
                  <img
                    src={selectedDoctor.profile_picture}
                    alt="Profile"
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              <div className="row g-3">
                {[
                  ["First Name", selectedDoctor.first_name],
                  ["Last Name", selectedDoctor.last_name],
                  ["M.I", selectedDoctor.middle_initial || "—"],
                  ["Sex", selectedDoctor.sex || "—"],
                  ["Date of Birth", selectedDoctor.dob || "—"],
                  ["Email", selectedDoctor.email],
                  ["Contact", selectedDoctor.contact || "—"],
                  ["Address", selectedDoctor.address || "—"],
                  ["Specialization", selectedDoctor.specialization || "—"],
                ].map(([label, value]) => (
                  <div className="col-md-4" key={label}>
                    <label className="form-label fw-semibold">{label}</label>
                    <p className="form-control-plaintext border rounded px-2">
                      {value}
                    </p>
                  </div>
                ))}

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Status</label>
                  <p className="form-control-plaintext">
                    <span
                      className={`badge ${
                        selectedDoctor.is_active ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {selectedDoctor.is_active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateAccounts;
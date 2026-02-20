import { useState, useEffect } from "react";
import DoctorSideBar from "./DoctorSideBar";
import DoctorTopNavbar from "./DoctorTopNavbar";
import "./DoctorStyle/DoctorPatient.css";
import { FiX } from "react-icons/fi";
import axiosClient from "../axiosClient";

function DoctorPatient() {
  const [activeMenu, setActiveMenu]           = useState("");
  const [activeTab, setActiveTab]             = useState("patients");
  const [currentPage, setCurrentPage]         = useState(1);
  const [lastPage, setLastPage]               = useState(1);
  const [totalPatients, setTotalPatients]     = useState(0);
  const [patientsData, setPatientsData]       = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    setActiveMenu("Patients");
    fetchPatients(1);
  }, []);

  // ── Fetch from API ───────────────────────────────────────────────
  const fetchPatients = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/doctor/dashboard?page=${page}`);
      const { data, total, last_page, current_page } = res.data;
      setPatientsData(data);
      setTotalPatients(total);
      setLastPage(last_page);
      setCurrentPage(current_page);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const parts = String(dateStr).split("T")[0].split("-");
      if (parts.length !== 3) return "N/A";
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      });
    } catch { return "N/A"; }
  };

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const getStatusClass = (status) => {
    if (!status) return "";
    switch (status.toLowerCase()) {
      case "scheduled": return "scheduled";
      case "cancelled": return "cancelled";
      case "pending":   return "pending";
      default:          return "";
    }
  };

  const handleView = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  // ── Smart pagination ─────────────────────────────────────────────
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;

    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > delta + 2) pages.push("...");

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(lastPage - 1, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < lastPage - delta - 1) pages.push("...");

    pages.push(lastPage);

    return pages;
  };

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="doctor-content" style={{ padding: "20px" }}>
          <div className="patient-card">

            {/* TABS */}
            <div className="patient-tabs">
              <button
                className={activeTab === "patients" ? "tab-active" : ""}
                onClick={() => {
                  setActiveTab("patients");
                  fetchPatients(1);
                }}
              >
                Total's Patients <span>{totalPatients}</span>
              </button>
            </div>

            {/* TABLE */}
            <div className="patient-table-wrapper">
              {loading ? (
                <p className="text-center py-3">Loading...</p>
              ) : (
                <table className="patient-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Date of Birth</th>
                      <th>Contact No.</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsData.map((row, index) => (
                      <tr key={row.id}>
                        <td>{(currentPage - 1) * 10 + index + 1}</td>
                        <td>{row.first_name} {row.last_name}</td>
                        <td>{capitalize(row.sex)}</td>
                        <td>{formatDate(row.dob)}</td>
                        <td>{row.contact_no}</td>
                        <td>{row.email}</td>
                        <td>
                          <span className={`status ${getStatusClass(row.appointment_status)}`}>
                            {row.appointment_status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => handleView(row)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── Smart Pagination ── */}
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchPatients(currentPage - 1)}
              >
                ‹ Previous
              </button>

              {getPageNumbers().map((n, i) =>
                n === "..." ? (
                  <span
                    key={`dots-${i}`}
                    style={{ padding: "0 6px", color: "#574a65", alignSelf: "center" }}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={n}
                    className={currentPage === n ? "page-active" : ""}
                    onClick={() => fetchPatients(n)}
                  >
                    {n}
                  </button>
                )
              )}

              <button
                disabled={currentPage === lastPage}
                onClick={() => fetchPatients(currentPage + 1)}
              >
                Next ›
              </button>
            </div>

            <div className="page-info">
              Page {currentPage} of {lastPage}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedPatient && (
        <div
          className="patient-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="patient-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Patient Details</h2>
              <div style={{ display: "flex", gap: "15px" }}>
                <span className="modal-date">
                  Joined {formatDate(selectedPatient.created_at)}
                </span>
                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>Patient Information</h4>
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </p>
                <p>
                  <strong>Gender:</strong> {capitalize(selectedPatient.sex)}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {formatDate(selectedPatient.dob)}
                </p>
                <p>
                  <strong>Contact:</strong> {selectedPatient.contact_no}
                </p>
                <p>
                  <strong>Email:</strong> {selectedPatient.email}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className={`btn-completed ${getStatusClass(selectedPatient.appointment_status)}`}
                disabled
              >
                {selectedPatient.appointment_status}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPatient;
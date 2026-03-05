import { useState, useEffect } from "react";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import "./DoctorStyle/DoctorPatient.css";
import PatientDetailsModal from "./components/PatientsDetailsModal";
import axiosClient from "../axiosClient";

function DoctorPatient() {
  const [activeMenu, setActiveMenu]           = useState("Patients");
  const [activeTab, setActiveTab]             = useState("patients");
  const [currentPage, setCurrentPage]         = useState(1);
  const [lastPage, setLastPage]               = useState(1);
  const [totalPatients, setTotalPatients]     = useState(0);
  const [loading, setLoading]                 = useState(false);
  const [patientsData, setPatientsData]       = useState([]);
  const [showModal, setShowModal]             = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ── Fetch patients ───────────────────────────────────────────────
  const fetchPatients = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/doctor/patients?page=${page}`);
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

  useEffect(() => {
    fetchPatients(1);
  }, []);

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
    ) { pages.push(i); }
    if (currentPage < lastPage - delta - 1) pages.push("...");
    pages.push(lastPage);
    return pages;
  };

  const handleView = (row) => {
    setSelectedPatient(row);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled": return "#1E3A8A";
      case "Completed": return "#16A34A";
      case "Cancelled": return "#DC2626";
      case "Pending":   return "#B45309";
      default:          return "#000";
    }
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
                onClick={() => { setActiveTab("patients"); setCurrentPage(1); fetchPatients(1); }}
              >
                Total's Patients <span>{totalPatients}</span>
              </button>
            </div>

            {/* TABLE */}
            <div className="patient-table-wrapper">
              {loading ? (
                <p className="text-center py-4">Loading...</p>
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
                    {patientsData.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                          No patients found.
                        </td>
                      </tr>
                    ) : (
                      patientsData.map((row, index) => (
                        <tr key={row.id}>
                          <td>{(currentPage - 1) * 10 + index + 1}</td>
                          <td>{row.first_name} {row.last_name}</td>
                          <td style={{ textTransform: "capitalize" }}>{row.sex ?? "—"}</td>
                          <td>{row.dob ?? "—"}</td>
                          <td>{row.contact_no}</td>
                          <td>{row.email}</td>
                          <td>
                            <span
                              style={{
                                color: getStatusColor(row.appointment_status),
                                fontWeight: "600",
                              }}
                            >
                              {row.appointment_status}
                            </span>
                          </td>
                          <td>
                            <button className="btn-view" onClick={() => handleView(row)}>
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

            {/* PAGINATION */}
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchPatients(currentPage - 1)}
              >
                ‹ Previous
              </button>
              {getPageNumbers().map((n, i) =>
                n === "..." ? (
                  <span key={`dots-${i}`} style={{ padding: "0 6px", alignSelf: "center", color: "#574a65" }}>
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

            <div className="page-info">Page {currentPage} of {lastPage}</div>
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        show={showModal}
        onClose={() => { setShowModal(false); setSelectedPatient(null); }}
        patient={selectedPatient}
      />
    </div>
  );
}

export default DoctorPatient;
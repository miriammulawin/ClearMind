import { useState, useEffect } from "react";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import "./DoctorStyle/DoctorPatient.css";
import PatientDetailsModal from "./components/PatientsDetailsModal";

function DoctorPatient() {
  const [activeMenu, setActiveMenu] = useState("");
  const [activeTab, setActiveTab]   = useState("patients");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal]     = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [zoomImage, setZoomImage]     = useState(null);

  useEffect(() => { setActiveMenu("Patients"); }, []);

  const rowsPerPage = 4;

  const patients = [
    {
      id: 101,
      name: "Liezel Paciente",
      age: "28", dob: "January 15, 1997", sex: "Female", civilStatus: "Single",
      contact: "09171234567", email: "liezel@example.com",
      address: "123 Main St, Manila",
      patientType: "Existing Patient", classification: "Regular",
      type: "Follow Up", date: "January 20, 2026", time: "2:00 pm",
      status: "Completed", reason: "For Consultation",
      informant: "—", relation: "—",
      paymentStatus: "Paid", paymentRef: "REF-20260120", paymentAmount: "1,500",
      services: ["Psychotherapy and Counseling"],
      initialImpression: "Patient shows signs of improvement with current treatment plan.",
      complaints: "Mild anxiety, difficulty sleeping",
      feedback: { rating: 5, comment: "The doctor was very attentive and understanding. I felt heard and supported throughout the session.", date: "January 21, 2026" },
    },
    {
      id: 102,
      name: "Ara Christina Ceres",
      age: "35", dob: "March 8, 1990", sex: "Female", civilStatus: "Married",
      contact: "09181234567", email: "ara@example.com",
      address: "456 Rizal Ave, Quezon City",
      patientType: "New Patient", classification: "Regular",
      type: "New Concern", date: "January 15, 2026", time: "9:00 am",
      status: "Completed", reason: "For Consultation",
      informant: "Juan Ceres", relation: "Spouse",
      paymentStatus: "Paid", paymentRef: "REF-20260115", paymentAmount: "2,000",
      services: ["Psychological Assessment and Evaluation"],
      initialImpression: "First consultation. Patient appears cooperative and willing to engage in therapy.",
      complaints: "Work-related stress, burnout symptoms",
      feedback: { rating: 4, comment: "Very professional and kind. The session was helpful and I will definitely come back.", date: "January 16, 2026" },
    },
    {
      id: 103,
      name: "Maria Santos",
      age: "31", dob: "June 22, 1994", sex: "Female", civilStatus: "Single",
      contact: "09191234567", email: "maria@example.com",
      address: "101 Boni Ave, Mandaluyong",
      patientType: "New Patient", classification: "PWD",
      type: "Check Up", date: "January 10, 2026", time: "1:30 pm",
      status: "Scheduled", reason: "For Consultation",
      informant: "—", relation: "—",
      paymentStatus: "Not_Paid", paymentRef: null, paymentAmount: null,
      services: ["Psychiatric Assessment"],
      initialImpression: "", complaints: "",
      feedback: null,
    },
    {
      id: 104,
      name: "Kevin Ramos",
      age: "45", dob: "November 3, 1980", sex: "Male", civilStatus: "Married",
      contact: "09221234567", email: "kevin@example.com",
      address: "202 EDSA, Quezon City",
      patientType: "Existing Patient", classification: "Senior Citizen",
      type: "Follow Up", date: "December 28, 2025", time: "10:00 am",
      status: "Completed", reason: "For Consultation",
      informant: "—", relation: "—",
      paymentStatus: "Probono", paymentRef: null, paymentAmount: null,
      services: ["Psychotherapy and Counseling", "Mental Health Certification"],
      initialImpression: "Patient demonstrates positive response to cognitive behavioral therapy.",
      complaints: "Depression, low motivation",
      feedback: null,
    },
  ];

  const totalPages   = Math.ceil(patients.length / rowsPerPage);
  const displayedData = patients.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleView = (row) => {
    setSelectedPatient(row);
    setShowModal(true);
  };

  const statusColor = { Completed: "#16a34a", Scheduled: "#1e3a8a", Cancelled: "#dc2626" };

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
                onClick={() => { setActiveTab("patients"); setCurrentPage(1); }}
              >
                Total's Patients <span>{patients.length}</span>
              </button>
            </div>

            {/* TABLE */}
            <div className="patient-table-wrapper">
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date of Appointment</th>
                    <th>Time</th>
                    <th>Visit Type</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedData.map((row) => (
                    <tr key={row.id}>
                      <td>{row.name}</td>
                      <td>{row.date}</td>
                      <td>{row.time}</td>
                      <td>{row.type}</td>
                      <td>
                        <span className={`status ${row.status.toLowerCase()}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-view" onClick={() => handleView(row)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>‹ Previous</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={currentPage === i + 1 ? "page-active" : ""} onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next ›</button>
            </div>

            <div className="page-info">Page {currentPage} of {totalPages}</div>
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      <PatientDetailsModal
        show={showModal}
        onClose={() => { setShowModal(false); setSelectedPatient(null); }}
        patient={selectedPatient}
      />

      {/* Image Zoom */}
      {zoomImage && (
        <div className="patient-modal-overlay" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="Zoom" />
        </div>
      )}
    </div>
  );
}

export default DoctorPatient;
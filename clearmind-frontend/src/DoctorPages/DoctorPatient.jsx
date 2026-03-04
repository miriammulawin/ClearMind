import { useState, useEffect } from "react";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import "./DoctorStyle/DoctorPatient.css";
import { FiX } from "react-icons/fi";

function DoctorPatient() {
  const [activeMenu, setActiveMenu] = useState("");
  const [activeTab, setActiveTab] = useState("consultation");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [initialImpression, setInitialImpression] = useState("");
  const [complaints, setComplaints] = useState("");

  useEffect(() => {
    setActiveMenu("Patients");
  }, []);

  const rowsPerPage = 4;

  const consultationRequests = [
    {
      id: 1,
      name: "Liezel Paciente",
      age: "28",
      date: "January 20, 2026",
      time: "2:00 pm",
      type: "Follow Up",
      status: "Scheduled",
      contact: "09171234567",
      email: "liezel@example.com",
      address: "123 Main St, Manila",
      reason: "For Consultation",
      initialImpression: "Good",
      complaints: "None",
    },
    {
      id: 2,
      name: "Ara Christina Ceres",
      age: "35",
      date: "January 15, 2026",
      time: "9:00 am",
      type: "New Concern",
      status: "Scheduled",
      contact: "09181234567",
      email: "ara@example.com",
      address: "456 Rizal Ave, Quezon City",
      reason: "For Consultation",
      initialImpression: "Good",
      complaints: "None",
    },
    {
      id: 3,
      name: "John Doe",
      age: "42",
      date: "January 22, 2026",
      time: "11:00 am",
      type: "Check Up",
      status: "Cancelled",
      contact: "09201234567",
      email: "john@example.com",
      reason: "For Consultation",
      initialImpression: "Good",
      complaints: "None",
    },
  ];

  const patients = [
    {
      id: 101,
      name: "Liezel Paciente",
      age: "28",
      date: "January 20, 2026",
      time: "2:00 pm",
      type: "Follow Up",
      status: "Completed",
      contact: "09171234567",
      email: "liezel@example.com",
      address: "123 Main St, Manila",
      initialImpression:
        "Patient shows signs of improvement with current treatment plan.",
      complaints: "Mild anxiety, difficulty sleeping",
    },
    {
      id: 102,
      name: "Ara Christina Ceres",
      age: "35",
      date: "January 15, 2026",
      time: "9:00 am",
      type: "New Concern",
      status: "Completed",
      contact: "09181234567",
      email: "ara@example.com",
      address: "456 Rizal Ave, Quezon City",
      initialImpression:
        "First consultation. Patient appears cooperative and willing to engage in therapy.",
      complaints: "Work-related stress, burnout symptoms",
    },
    {
      id: 103,
      name: "Maria Santos",
      age: "31",
      date: "January 10, 2026",
      time: "1:30 pm",
      type: "Check Up",
      status: "Scheduled",
      contact: "09191234567",
      email: "maria@example.com",
      address: "101 Boni Ave, Mandaluyong",
      initialImpression: "",
      complaints: "",
    },
    {
      id: 104,
      name: "Kevin Ramos",
      age: "45",
      date: "December 28, 2025",
      time: "10:00 am",
      type: "Follow Up",
      status: "Completed",
      contact: "09221234567",
      email: "kevin@example.com",
      address: "202 EDSA, Quezon City",
      initialImpression:
        "Patient demonstrates positive response to cognitive behavioral therapy.",
      complaints: "Depression, low motivation",
    },
  ];

  const activeData =
    activeTab === "consultation" ? consultationRequests : patients;

  const totalPages = Math.ceil(activeData.length / rowsPerPage);
  const displayedData = activeData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleView = (row) => {
    setSelectedPatient(row);
    setInitialImpression(row.initialImpression || "");
    setComplaints(row.complaints || "");
    setShowModal(true);
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
                  setCurrentPage(1);
                }}
              >
                Total's Patients <span>{patients.length}</span>
              </button>

              {/* <button
                className={activeTab === "consultation" ? "tab-active" : ""}
                onClick={() => {
                  setActiveTab("consultation");
                  setCurrentPage(1);
                }}
              >
                Consultation Request <span>{consultationRequests.length}</span>
              </button> */}
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
            </div>

            {/* PAGINATION */}
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ‹ Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "page-active" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next ›
              </button>
            </div>

            <div className="page-info">
              Page {currentPage} of {totalPages}
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
                <span className="modal-date">{selectedPatient.date}</span>
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
                  <strong>Name:</strong> {selectedPatient.name}
                </p>
                <p>
                  <strong>Age:</strong> {selectedPatient.age}
                </p>
                <p>
                  <strong>Contact:</strong> {selectedPatient.contact}
                </p>
                <p>
                  <strong>Email:</strong> {selectedPatient.email}
                </p>
                <p>
                  <strong>Address:</strong> {selectedPatient.address}
                </p>
                <p>
                  <strong>Reason for Consultation:</strong>{" "}
                  {selectedPatient.reason}
                </p>
                <p>
                  <strong>Initial Impression:</strong>{" "}
                  {selectedPatient.initialImpression}
                </p>
                <p>
                  <strong>Complains:</strong> {selectedPatient.complaints}
                </p>
              </div>

              <hr
                style={{
                  margin: "20px 0",
                  border: "none",
                  borderTop: "1px solid #e0e0e0",
                }}
              />

              <div className="modal-section">
                <h4>Progress Note</h4>
                <div style={{ marginBottom: "15px" }}>
                  <p>
                    <strong>Initial Impression:</strong>
                  </p>
                  <textarea
                    value={initialImpression}
                    onChange={(e) => setInitialImpression(e.target.value)}
                    placeholder="Enter initial impression..."
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div>
                  <p>
                    <strong>Complains:</strong>
                  </p>
                  <textarea
                    value={complaints}
                    onChange={(e) => setComplaints(e.target.value)}
                    placeholder="Enter patient complaints..."
                    style={{
                      width: "100%",
                      minHeight: "100px",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-completed"
                disabled={selectedPatient.status === "Completed"}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE ZOOM */}
      {zoomImage && (
        <div
          className="patient-modal-overlay"
          onClick={() => setZoomImage(null)}
        >
          <img src={zoomImage} alt="Zoom" />
        </div>
      )}
    </div>
  );
}

export default DoctorPatient;

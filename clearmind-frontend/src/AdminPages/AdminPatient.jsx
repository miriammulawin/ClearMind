import { useState } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminPatient.css";
import { FiX } from "react-icons/fi";
import samplePayment from "../assets/payment/images.png";

function AdminPatient() {
  const [activeMenu, setActiveMenu] = useState("Patients");
  const [activeTab, setActiveTab] = useState("consultation");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const rowsPerPage = 4;

  const consultationRequests = [
    {
      id: 1,
      name: "Liezel Paciente",
      date: "January 20, 2026",
      time: "2:00 pm",
      type: "Follow Up",
      status: "Scheduled",
      contact: "09171234567",
      email: "liezel@example.com",
      address: "123 Main St, Manila",
    },
    {
      id: 2,
      name: "Ara Christina Ceres",
      date: "January 15, 2026",
      time: "9:00 am",
      type: "New Concern",
      status: "Scheduled",
      contact: "09181234567",
      email: "ara@example.com",
      address: "456 Rizal Ave, Quezon City",
    },
    {
      id: 3,
      name: "John Doe",
      date: "January 22, 2026",
      time: "11:00 am",
      type: "Check Up",
      status: "Cancelled",
      contact: "09201234567",
      email: "john@example.com",
      address: "789 Taft Ave, Manila",
    },
  ];

  const patients = [
    {
      id: 101,
      name: "Liezel Paciente",
      date: "January 20, 2026",
      time: "2:00 pm",
      type: "Follow Up",
      status: "Completed",
      contact: "09171234567",
      email: "liezel@example.com",
      address: "123 Main St, Manila",
    },
    {
      id: 102,
      name: "Ara Christina Ceres",
      date: "January 15, 2026",
      time: "9:00 am",
      type: "New Concern",
      status: "Completed",
      contact: "09181234567",
      email: "ara@example.com",
      address: "456 Rizal Ave, Quezon City",
    },
    {
      id: 103,
      name: "Maria Santos",
      date: "January 10, 2026",
      time: "1:30 pm",
      type: "Check Up",
      status: "Scheduled",
      contact: "09191234567",
      email: "maria@example.com",
      address: "101 Boni Ave, Mandaluyong",
    },
    {
      id: 104,
      name: "Kevin Ramos",
      date: "December 28, 2025",
      time: "10:00 am",
      type: "Follow Up",
      status: "Completed",
      contact: "09221234567",
      email: "kevin@example.com",
      address: "202 EDSA, Quezon City",
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
    setShowModal(true);
  };

  const [zoomImage, setZoomImage] = useState(null);

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content" style={{ padding: "20px" }}>
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
                Total’s Patients <span>{patients.length}</span>
              </button>

              <button
                className={activeTab === "consultation" ? "tab-active" : ""}
                onClick={() => {
                  setActiveTab("consultation");
                  setCurrentPage(1);
                }}
              >
                Consultation Request <span>{consultationRequests.length}</span>
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
                        <button
                          className="btn-view"
                          onClick={() => handleView(row)}
                        >
                          View
                        </button>
                        {activeTab === "patients" ? (
                          <button
                            className="btn-completed"
                            disabled={row.status === "Completed"}
                          >
                            Completed
                          </button>
                        ) : (
                          <button className="btn-confirm">Confirm</button>
                        )}
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
            {/* HEADER */}
            <div className="modal-header">
              <h2>Patient Details</h2>
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <span className="modal-date">{selectedPatient.date}</span>
                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiX />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div className="modal-body">
              <div
                className="modal-section"
                style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}
              >
                <div style={{ flex: 1, minWidth: "300px" }}>
                  <h4>Patient Information</h4>
                  <p>
                    <strong>Name:</strong> {selectedPatient.name}
                  </p>
                  <p>
                    <strong>Contact Number:</strong> {selectedPatient.contact}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedPatient.email}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedPatient.address}
                  </p>
                  <h4 style={{ marginTop: "60px" }}>Appointment Details</h4>
                  <p>
                    <strong>Date:</strong> {selectedPatient.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedPatient.time}
                  </p>
                  <p>
                    <strong>Visit Type:</strong> {selectedPatient.type}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedPatient.status}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
                  <div
                    style={{
                      flex: 1,
                      minWidth: "300px",
                      borderRight: "1px solid #e5d6f5",
                      paddingRight: "20px",
                    }}
                  >
                    <h4>Payment Details</h4>
                    <p>
                      <strong>Paid Amount:</strong> -
                    </p>
                    <p>
                      <strong>Reference No:</strong> -
                    </p>
                    <p>
                      <strong>Payment Option:</strong> -
                    </p>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minWidth: "300px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "stretch",
                      height: "100%",
                    }}
                  >
                    <img
                      src={samplePayment}
                      alt="Payment Proof"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => setZoomImage(samplePayment)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
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
          style={{ cursor: "zoom-out" }}
        >
          <div
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomImage}
              alt="Zoomed Payment Proof"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPatient;

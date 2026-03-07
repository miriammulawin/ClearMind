import { useState } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminPatient.css";
import {
  FiX,
  FiCheck,
  FiXCircle,
  FiUser,
  FiUserCheck,
  FiUserPlus,
  FiPhone,
  FiCalendar,
  FiClock,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiMonitor,
  FiHome,
  FiFileText,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";
import { FaCalendarAlt, FaUserMd } from "react-icons/fa";
import samplePayment from "../assets/payment/images.png";
import { useNavigate } from "react-router-dom";

const AvatarPlaceholder = ({ name, size = 80 }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "#7341A8",
    "#4D227C",
    "#005892",
    "#4A965B",
    "#9333ea",
    "#0ea5e9",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        border: "3px solid #fff",
      }}
    >
      {initials}
    </div>
  );
};

function AdminPatient() {
  const [activeMenu, setActiveMenu] = useState("Patients");
  const [activeTab, setActiveTab] = useState("patients");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalSource, setModalSource] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const navigate = useNavigate();

  const [rescheduleRequests, setRescheduleRequests] = useState([
    {
      id: 201,
      name: "Liezel Paciente",
      originalDate: "January 20, 2026",
      originalTime: "2:00 pm",
      requestedDate: "January 27, 2026",
      requestedTime: "10:00 am",
      type: "Follow Up",
      status: "Pending",
      reason: "I have a conflict with my work schedule on the original date.",
      contact: "09171234567",
      email: "liezel@email.com",
      address: "123 Sampaguita St, Calamba, Laguna",
      consultationMode: "On-Site",
      patientType: "Existing Patient",
      age: 34,
      gender: "Female",
      totalVisits: 5,
    },
    {
      id: 202,
      name: "Kevin Ramos",
      originalDate: "December 28, 2025",
      originalTime: "10:00 am",
      requestedDate: "January 5, 2026",
      requestedTime: "2:00 pm",
      type: "Follow Up",
      status: "Pending",
      reason: "Family emergency on the scheduled day.",
      contact: "09221234567",
      email: "kevin@email.com",
      address: "45 Rizal Ave, San Pablo, Laguna",
      consultationMode: "Virtual",
      patientType: "New Patient",
      age: 39,
      gender: "Male",
      totalVisits: 3,
    },
    {
      id: 203,
      name: "Maria Santos",
      originalDate: "January 10, 2026",
      originalTime: "1:30 pm",
      requestedDate: "January 15, 2026",
      requestedTime: "9:00 am",
      type: "Check Up",
      status: "Approved",
      reason: "Transportation issue.",
      contact: "09191234567",
      email: "maria@email.com",
      address: "78 Mabini St, Los Baños, Laguna",
      consultationMode: "On-Site",
      patientType: "Existing Patient",
      age: 52,
      gender: "Female",
      totalVisits: 12,
    },
  ]);

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedReschedule, setSelectedReschedule] = useState(null);
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
      email: "liezel@email.com",
      address: "123 Sampaguita St, Calamba, Laguna",
      consultationMode: "On-Site",
      patientType: "Existing Patient",
      age: 34,
      gender: "Female",
      totalVisits: 5,
      assignedDoctor: {
        name: "Dr. Maria Reyes",
        specialization: "General Physician",
      },
    },
    {
      id: 2,
      name: "Ara Christina Ceres",
      date: "January 15, 2026",
      time: "9:00 am",
      type: "New Concern",
      status: "Scheduled",
      contact: "09181234567",
      email: "ara@email.com",
      address: "22 Acacia Rd, Santa Rosa, Laguna",
      consultationMode: "Virtual",
      patientType: "New Patient",
      age: 28,
      gender: "Female",
      totalVisits: 2,
      assignedDoctor: {
        name: "Dr. Jose Santos",
        specialization: "Dermatologist",
      },
    },
    {
      id: 3,
      name: "John Doe",
      date: "January 22, 2026",
      time: "11:00 am",
      type: "Check Up",
      status: "Cancelled",
      contact: "09201234567",
      email: "john@email.com",
      address: "10 Magnolia St, Biñan, Laguna",
      consultationMode: "On-Site",
      patientType: "Existing Patient",
      age: 45,
      gender: "Male",
      totalVisits: 8,
      assignedDoctor: { name: "Dr. Anna Cruz", specialization: "Cardiologist" },
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
      email: "liezel@email.com",
      address: "123 Sampaguita St, Calamba, Laguna",
      consultationMode: "On-Site",
      patientType: "Existing Patient",
      age: 34,
      gender: "Female",
      totalVisits: 5,
      assignedDoctor: {
        name: "Dr. Maria Reyes",
        specialization: "General Physician",
      },
      progressionNote: {
        assessment:
          "Patient presents with persistent headache and dizziness lasting 3 days. Vital signs are stable. Diagnosed with tension-type headache, likely stress-induced. Prescribed ibuprofen 400mg every 8 hours as needed. Patient appears fatigued and stressed. Advised adequate rest, hydration, and stress management techniques. Follow-up recommended in 2 weeks or sooner if symptoms worsen.",
      },
    },
    {
      id: 102,
      name: "Ara Christina Ceres",
      date: "January 15, 2026",
      time: "9:00 am",
      type: "New Concern",
      status: "Completed",
      contact: "09181234567",
      email: "ara@email.com",
      address: "22 Acacia Rd, Santa Rosa, Laguna",
      consultationMode: "Virtual",
      patientType: "New Patient",
      age: 28,
      gender: "Female",
      totalVisits: 2,
      assignedDoctor: {
        name: "Dr. Jose Santos",
        specialization: "Dermatologist",
      },
      progressionNote: {
        assessment:
          "Patient presents with erythematous rash on bilateral forearms for approximately 1 week. No fever or systemic symptoms noted. Diagnosed with contact dermatitis, likely allergic in origin. Topical hydrocortisone 1% cream prescribed for application twice daily for 7 days. Patient advised to avoid potential allergens and irritants. Allergy patch testing recommended if no improvement within 7 days. Follow-up in 1 week.",
      },
    },
    {
      id: 103,
      name: "Maria Santos",
      date: "January 10, 2026",
      time: "1:30 pm",
      type: "Check Up",
      status: "Scheduled",
      contact: "09191234567",
      email: "maria@email.com",
      address: "78 Mabini St, Los Baños, Laguna",
      consultationMode: "On-Site",
      patientType: "Existing Patient",
      age: 52,
      gender: "Female",
      totalVisits: 12,
      assignedDoctor: { name: "Dr. Anna Cruz", specialization: "Cardiologist" },
    },
    {
      id: 104,
      name: "Kevin Ramos",
      date: "December 28, 2025",
      time: "10:00 am",
      type: "Follow Up",
      status: "Completed",
      contact: "09221234567",
      email: "kevin@email.com",
      address: "45 Rizal Ave, San Pablo, Laguna",
      consultationMode: "Virtual",
      patientType: "New Patient",
      age: 39,
      gender: "Male",
      totalVisits: 3,
      assignedDoctor: { name: "Dr. Anna Cruz", specialization: "Cardiologist" },
      progressionNote: {
        assessment:
          "Follow-up consultation for hypertension management. Patient reports improved well-being and no adverse effects from current medication. Blood pressure today: 128/82 mmHg — within acceptable range and showing marked improvement from last visit. Patient is fully compliant with amlodipine 5mg once daily. No changes to current medication regimen. Advised to continue home blood pressure monitoring and maintain low-sodium diet. Next check-up in 1 month.",
      },
    },
  ];

  const activeData =
    activeTab === "consultation"
      ? consultationRequests
      : activeTab === "patients"
        ? patients
        : rescheduleRequests;

  const totalPages = Math.ceil(activeData.length / rowsPerPage);
  const displayedData = activeData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleView = (row, source) => {
    setSelectedPatient(row);
    setModalSource(source);
    setShowModal(true);
    setPaymentOpen(false);
  };

  const handleViewReschedule = (row) => {
    setSelectedReschedule(row);
    setShowRescheduleModal(true);
  };

  const handleRescheduleAction = (id, action) => {
    setRescheduleRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: action === "approve" ? "Approved" : "Declined" }
          : r,
      ),
    );
    setShowRescheduleModal(false);
  };

  const getRescheduleStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return {
          background: "#dcfce7",
          color: "#16a34a",
          border: "1px solid #bbf7d0",
        };
      case "Declined":
        return {
          background: "#fee2e2",
          color: "#dc2626",
          border: "1px solid #fecaca",
        };
      default:
        return {
          background: "#fef9c3",
          color: "#b45309",
          border: "1px solid #fde68a",
        };
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          background: "#dcfce7",
          color: "#16a34a",
          border: "1px solid #bbf7d0",
        };
      case "scheduled":
        return {
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        };
      case "cancelled":
        return {
          background: "#fee2e2",
          color: "#dc2626",
          border: "1px solid #fecaca",
        };
      default:
        return {
          background: "#f3f4f6",
          color: "#6b7280",
          border: "1px solid #e5e7eb",
        };
    }
  };

  const getConsultationModeBadge = (mode) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "20px",
    background: mode === "Virtual" ? "#dbeafe" : "#ede9f6",
    color: mode === "Virtual" ? "#1d4ed8" : "#4D227C",
    border: mode === "Virtual" ? "1px solid #bfdbfe" : "1px solid #d8ccf0",
  });

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content" style={{ padding: "20px" }}>
          <div className="patient-card">
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
              <button
                className={activeTab === "consultation" ? "tab-active" : ""}
                onClick={() => {
                  setActiveTab("consultation");
                  setCurrentPage(1);
                }}
              >
                Consultation Request <span>{consultationRequests.length}</span>
              </button>
              <button
                className={activeTab === "reschedule" ? "tab-active" : ""}
                onClick={() => {
                  setActiveTab("reschedule");
                  setCurrentPage(1);
                }}
              >
                Reschedule Request{" "}
                <span
                  className={
                    rescheduleRequests.filter((r) => r.status === "Pending")
                      .length > 0
                      ? "tab-badge-pending"
                      : ""
                  }
                >
                  {
                    rescheduleRequests.filter((r) => r.status === "Pending")
                      .length
                  }
                </span>
              </button>
            </div>

            <div className="patient-table-wrapper">
              <table className="patient-table">
                <thead>
                  {activeTab === "reschedule" ? (
                    <tr>
                      <th>Name</th>
                      <th>Original Date & Time</th>
                      <th>Requested Date & Time</th>
                      <th>Visit Type</th>
                      <th>Consultation Mode</th>
                      <th>Action</th>
                    </tr>
                  ) : activeTab === "consultation" ? (
                    <tr>
                      <th>Name</th>
                      <th>Date of Appointment</th>
                      <th>Time</th>
                      <th>Visit Type</th>
                      <th>Consultation Mode</th>
                      <th>Action</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Name</th>
                      <th>Date of Appointment</th>
                      <th>Time</th>
                      <th>Visit Type</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {activeTab === "reschedule"
                    ? displayedData.map((row) => (
                        <tr key={row.id}>
                          <td>{row.name}</td>
                          <td>
                            <span className="date-original">
                              {row.originalDate}
                            </span>
                            <br />
                            <small style={{ color: "#aaa" }}>
                              {row.originalTime}
                            </small>
                          </td>
                          <td>
                            <span className="date-requested">
                              {row.requestedDate}
                            </span>
                            <br />
                            <small
                              style={{ color: "#4D227C", fontWeight: 600 }}
                            >
                              {row.requestedTime}
                            </small>
                          </td>
                          <td>{row.type}</td>
                          <td>
                            <span
                              style={getConsultationModeBadge(
                                row.consultationMode,
                              )}
                            >
                              {row.consultationMode === "Virtual" ? (
                                <FiMonitor size={11} />
                              ) : (
                                <FiHome size={11} />
                              )}
                              {row.consultationMode}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-view"
                              onClick={() => handleViewReschedule(row)}
                            >
                              View
                            </button>
                            <button
                              className="btn-confirm"
                              disabled={row.status !== "Pending"}
                              onClick={() =>
                                handleRescheduleAction(row.id, "approve")
                              }
                            >
                              Approve
                            </button>
                          </td>
                        </tr>
                      ))
                    : activeTab === "consultation"
                      ? displayedData.map((row) => (
                          <tr key={row.id}>
                            <td>{row.name}</td>
                            <td>{row.date}</td>
                            <td>{row.time}</td>
                            <td>{row.type}</td>
                            <td>
                              <span
                                style={getConsultationModeBadge(
                                  row.consultationMode,
                                )}
                              >
                                {row.consultationMode === "Virtual" ? (
                                  <FiMonitor size={11} />
                                ) : (
                                  <FiHome size={11} />
                                )}
                                {row.consultationMode}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn-view"
                                onClick={() => handleView(row, activeTab)}
                              >
                                View
                              </button>
                              <button
                                className="btn-confirm"
                                disabled={row.status === "Cancelled"}
                              >
                                Confirm
                              </button>
                            </td>
                          </tr>
                        ))
                      : displayedData.map((row) => (
                          <tr key={row.id}>
                            <td>{row.name}</td>
                            <td>{row.date}</td>
                            <td>{row.time}</td>
                            <td>{row.type}</td>
                            <td>
                              <span
                                className={`status ${row.status.toLowerCase()}`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn-view"
                                onClick={() => handleView(row, activeTab)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                </tbody>
              </table>
            </div>

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

      {showModal && selectedPatient && (
        <div
          className="patient-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="patient-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-profile-header">
              <button
                className="close-btn profile-close-btn"
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
              <div className="modal-profile-row">
                <AvatarPlaceholder name={selectedPatient.name} size={68} />
                <div className="patient-profile-info">
                  <h3 className="patient-profile-name">
                    {selectedPatient.name}
                  </h3>
                  <p className="patient-profile-contact">
                    <FiPhone size={12} style={{ marginRight: 5 }} />
                    {selectedPatient.contact}
                  </p>
                  <div className="patient-profile-meta">
                    {selectedPatient.age && (
                      <span className="profile-meta-chip">
                        {selectedPatient.age} yrs
                      </span>
                    )}
                    {selectedPatient.gender && (
                      <span className="profile-meta-chip">
                        {selectedPatient.gender}
                      </span>
                    )}
                    {selectedPatient.totalVisits && (
                      <span className="profile-meta-chip visits">
                        {selectedPatient.totalVisits} Visits
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="btn-view-profile"
                  onClick={() =>
                    navigate(`/admin/patient-profile/${selectedPatient.id}`, {
                      state: { patient: selectedPatient },
                    })
                  }
                >
                  <FiExternalLink style={{ marginRight: "6px" }} />
                  View Profile
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div
                className="modal-content-card"
                style={{ marginBottom: "12px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #ede9f6",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #7341A8, #4D227C)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaCalendarAlt size={13} color="#fff" />
                  </div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#3b1f6e",
                    }}
                  >
                    Appointment Details
                  </h4>
                </div>
                <div className="modal-two-col">
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiCalendar />
                    </div>
                    <div>
                      <span className="modal-info-label">Date</span>
                      <span className="modal-info-value">
                        {selectedPatient.date}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiClock />
                    </div>
                    <div>
                      <span className="modal-info-label">Time</span>
                      <span className="modal-info-value">
                        {selectedPatient.time}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiUser />
                    </div>
                    <div>
                      <span className="modal-info-label">Visit Type</span>
                      <span className="modal-info-value">
                        {selectedPatient.type}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiUser />
                    </div>
                    <div>
                      <span className="modal-info-label">Status</span>
                      <span
                        className="status-badge"
                        style={getStatusBadgeStyle(selectedPatient.status)}
                      >
                        {selectedPatient.status}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      {selectedPatient.patientType === "Existing Patient" ? (
                        <FiUserCheck />
                      ) : (
                        <FiUserPlus />
                      )}
                    </div>
                    <div>
                      <span className="modal-info-label">Patient Type</span>
                      <span className="modal-info-value">
                        {selectedPatient.patientType}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      {selectedPatient.consultationMode === "Virtual" ? (
                        <FiMonitor />
                      ) : (
                        <FiHome />
                      )}
                    </div>
                    <div>
                      <span className="modal-info-label">Mode</span>
                      <span className="modal-info-value">
                        {selectedPatient.consultationMode}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedPatient.assignedDoctor && (
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "14px",
                      borderTop: "1px dashed #e5e7eb",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9b7ec8",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Assigned Doctor
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background: "linear-gradient(135deg, #f3eeff, #ede9f6)",
                        border: "1px solid #d8ccf0",
                        borderRadius: "10px",
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #7341A8, #4D227C)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: "0 2px 8px rgba(115,65,168,0.3)",
                        }}
                      >
                        <FaUserMd size={18} color="#fff" />
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#3b1f6e",
                            margin: "0 0 2px 0",
                            lineHeight: 1.2,
                          }}
                        >
                          {selectedPatient.assignedDoctor.name}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#7341A8",
                            margin: 0,
                            fontStyle: "italic",
                          }}
                        >
                          {selectedPatient.assignedDoctor.specialization}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {selectedPatient.status === "Completed" &&
                selectedPatient.progressionNote && (
                  <div
                    className="modal-content-card"
                    style={{ marginBottom: "12px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "14px",
                        paddingBottom: "12px",
                        borderBottom: "1px solid #ede9f6",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "8px",
                          background:
                            "linear-gradient(135deg, #7341A8, #4D227C)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FiActivity size={14} color="#fff" />
                      </div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "17px",
                          fontWeight: 800,
                          color: "#3b1f6e",
                        }}
                      >
                        Progression Note
                      </h4>
                    </div>
                    <div
                      style={{
                        background: "#faf7ff",
                        border: "1px solid #ede9f6",
                        borderRadius: "10px",
                        padding: "16px 18px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: "#7341A8",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: "10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <FiFileText size={12} />
                        Assessment
                      </p>
                      <p
                        style={{
                          fontSize: "13.5px",
                          color: "#374151",
                          margin: 0,
                          lineHeight: "1.75",
                        }}
                      >
                        {selectedPatient.progressionNote.assessment}
                      </p>
                    </div>
                  </div>
                )}
              
              <div className="modal-content-card">
                <button
                  className="payment-collapse-toggle"
                  onClick={() => setPaymentOpen(!paymentOpen)}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #7341A8, #4D227C)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FiFileText size={13} color="#fff" />
                    </div>
                    <span
                      className="modal-section-title"
                      style={{ margin: 0, padding: 0, border: "none" }}
                    >
                      Payment Details
                    </span>
                  </span>
                  <span className="payment-toggle-icon">
                    {paymentOpen ? (
                      <FiChevronUp size={18} />
                    ) : (
                      <FiChevronDown size={18} />
                    )}
                    <span style={{ fontSize: 12, marginLeft: 4 }}>
                      {paymentOpen ? "Hide" : "View"}
                    </span>
                  </span>
                </button>
                {paymentOpen && (
                  <div className="payment-collapse-body">
                    <div className="payment-layout">
                      <div className="payment-fields">
                        <div className="modal-info-item">
                          <div
                            className="modal-info-icon"
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            ₱
                          </div>
                          <div>
                            <span className="modal-info-label">
                              Paid Amount
                            </span>
                            <span className="modal-info-value">—</span>
                          </div>
                        </div>
                        <div className="modal-info-item">
                          <div
                            className="modal-info-icon"
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            #
                          </div>
                          <div>
                            <span className="modal-info-label">
                              Reference No.
                            </span>
                            <span className="modal-info-value">—</span>
                          </div>
                        </div>
                        <div className="modal-info-item">
                          <div
                            className="modal-info-icon"
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            PAY
                          </div>
                          <div>
                            <span className="modal-info-label">
                              Payment Option
                            </span>
                            <span className="modal-info-value">—</span>
                          </div>
                        </div>
                      </div>
                      <div className="payment-proof">
                        <span className="payment-proof-label">
                          Payment Proof
                        </span>
                        <img
                          src={samplePayment}
                          alt="Payment Proof"
                          className="payment-proof-img"
                          onClick={() => setZoomImage(samplePayment)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-view-history"
                onClick={() =>
                  navigate(`/admin/patient-history/${selectedPatient.id}`, {
                    state: { patient: selectedPatient },
                  })
                }
              >
                <FiFileText style={{ marginRight: "6px" }} />
                View History
              </button>
              {modalSource === "consultation" && (
                <button
                  className="btn-confirm"
                  style={{
                    padding: "10px 28px",
                    fontSize: "14px",
                    fontWeight: 700,
                    borderRadius: "10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    height: "auto",
                    width: "auto",
                  }}
                  disabled={selectedPatient.status === "Cancelled"}
                >
                  <FiCheck size={15} />
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && selectedReschedule && (
        <div
          className="patient-modal-overlay"
          onClick={() => setShowRescheduleModal(false)}
        >
          <div
            className="patient-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-profile-header">
              <button
                className="close-btn profile-close-btn"
                onClick={() => setShowRescheduleModal(false)}
              >
                <FiX />
              </button>
              <div className="modal-profile-row">
                <AvatarPlaceholder name={selectedReschedule.name} size={68} />
                <div className="patient-profile-info">
                  <h3 className="patient-profile-name">
                    {selectedReschedule.name}
                  </h3>
                  <p className="patient-profile-contact">
                    <FiPhone size={12} style={{ marginRight: 5 }} />
                    {selectedReschedule.contact}
                  </p>
                  <div className="patient-profile-meta">
                    {selectedReschedule.age && (
                      <span className="profile-meta-chip">
                        {selectedReschedule.age} yrs
                      </span>
                    )}
                    {selectedReschedule.gender && (
                      <span className="profile-meta-chip">
                        {selectedReschedule.gender}
                      </span>
                    )}
                    {selectedReschedule.totalVisits && (
                      <span className="profile-meta-chip visits">
                        {selectedReschedule.totalVisits} Visits
                      </span>
                    )}
                    <span className="profile-meta-chip">
                      {selectedReschedule.patientType}
                    </span>
                  </div>
                </div>
                <button
                  className="btn-view-profile"
                  onClick={() =>
                    navigate(
                      `/admin/patient-profile/${selectedReschedule.id}`,
                      { state: { patient: selectedReschedule } },
                    )
                  }
                >
                  <FiExternalLink style={{ marginRight: "6px" }} />
                  View Profile
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div
                className="modal-content-card"
                style={{ marginBottom: "12px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #ede9f6",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #7341A8, #4D227C)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaCalendarAlt size={13} color="#fff" />
                  </div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#3b1f6e",
                    }}
                  >
                    Appointment Details
                  </h4>
                </div>
                <div className="modal-two-col">
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiCalendar />
                    </div>
                    <div>
                      <span className="modal-info-label">Original Date</span>
                      <span className="modal-info-value">
                        {selectedReschedule.originalDate}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiClock />
                    </div>
                    <div>
                      <span className="modal-info-label">Original Time</span>
                      <span className="modal-info-value">
                        {selectedReschedule.originalTime}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div
                      className="modal-info-icon"
                      style={{ color: "#4D227C" }}
                    >
                      <FiCalendar />
                    </div>
                    <div>
                      <span className="modal-info-label">Requested Date</span>
                      <span
                        className="modal-info-value"
                        style={{ color: "#4D227C", fontWeight: 700 }}
                      >
                        {selectedReschedule.requestedDate}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div
                      className="modal-info-icon"
                      style={{ color: "#4D227C" }}
                    >
                      <FiClock />
                    </div>
                    <div>
                      <span className="modal-info-label">Requested Time</span>
                      <span
                        className="modal-info-value"
                        style={{ color: "#4D227C", fontWeight: 700 }}
                      >
                        {selectedReschedule.requestedTime}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiUser />
                    </div>
                    <div>
                      <span className="modal-info-label">Visit Type</span>
                      <span className="modal-info-value">
                        {selectedReschedule.type}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      {selectedReschedule.consultationMode === "Virtual" ? (
                        <FiMonitor />
                      ) : (
                        <FiHome />
                      )}
                    </div>
                    <div>
                      <span className="modal-info-label">Mode</span>
                      <span className="modal-info-value">
                        {selectedReschedule.consultationMode}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "1px dashed #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6b7280",
                    }}
                  >
                    Request Status:
                  </span>
                  <span
                    className="status-badge"
                    style={{
                      ...getRescheduleStatusBadge(selectedReschedule.status),
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {selectedReschedule.status}
                  </span>
                </div>
              </div>

              <div className="modal-content-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "14px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #ede9f6",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #7341A8, #4D227C)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FiAlertCircle size={14} color="#fff" />
                  </div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#3b1f6e",
                    }}
                  >
                    Reason for Reschedule
                  </h4>
                </div>
                <div
                  style={{
                    background: "#faf7ff",
                    border: "1px solid #ede9f6",
                    borderRadius: "10px",
                    padding: "16px 18px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "#374151",
                      margin: 0,
                      lineHeight: "1.75",
                    }}
                  >
                    {selectedReschedule.reason}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-decline"
                disabled={selectedReschedule.status !== "Pending"}
                onClick={() =>
                  handleRescheduleAction(selectedReschedule.id, "decline")
                }
              >
                <FiXCircle style={{ marginRight: "6px" }} /> Decline
              </button>
              <button
                className="btn-confirm"
                style={{
                  padding: "10px 28px",
                  fontSize: "14px",
                  fontWeight: 700,
                  borderRadius: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  height: "auto",
                  width: "auto",
                }}
                disabled={selectedReschedule.status !== "Pending"}
                onClick={() =>
                  handleRescheduleAction(selectedReschedule.id, "approve")
                }
              >
                <FiCheck size={15} /> Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {zoomImage && (
        <div
          className="patient-modal-overlay"
          onClick={() => setZoomImage(null)}
          style={{ cursor: "zoom-out" }}
        >
          <div
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
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
                maxWidth: "100%",
                maxHeight: "90vh",
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

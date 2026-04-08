import { useState } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminPatient.module.css";
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
  FiFilter,
  FiDollarSign,
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

/* ── Reusable section header — declared OUTSIDE AdminPatient ── */
const SectionHeader = ({ icon, title }) => (
  <div className={styles.cardSectionHeader}>
    <div className={styles.cardSectionIcon}>{icon}</div>
    <h4 className={styles.cardSectionTitle}>{title}</h4>
  </div>
);

function AdminPatient() {
  const [activeMenu, setActiveMenu] = useState("Patients");
  const [activeTab, setActiveTab] = useState("patients");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalSource, setModalSource] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [patientTypeFilter, setPatientTypeFilter] = useState("all");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [refundProcessed, setRefundProcessed] = useState({});
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
          "Patient presents with persistent headache and dizziness lasting 3 days. Vital signs are stable. Diagnosed with tension-type headache, likely stress-induced. Prescribed ibuprofen 400mg every 8 hours as needed.",
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
          "Patient presents with erythematous rash on bilateral forearms for approximately 1 week. No fever or systemic symptoms noted. Diagnosed with contact dermatitis, likely allergic in origin.",
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
          "Follow-up consultation for hypertension management. Patient reports improved well-being and no adverse effects from current medication. Blood pressure today: 128/82 mmHg.",
      },
    },
  ];

  const cancelledAppointments = [
    {
      id: 301,
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
      cancellationReason:
        "Patient called to cancel due to a sudden work obligation that could not be rescheduled.",
    },
    {
      id: 302,
      name: "Sofia Dela Cruz",
      date: "February 3, 2026",
      time: "3:00 pm",
      type: "Follow Up",
      status: "Cancelled",
      contact: "09301234567",
      email: "sofia@email.com",
      address: "11 Sampaguita Ave, Sta. Rosa, Laguna",
      consultationMode: "Virtual",
      patientType: "New Patient",
      age: 25,
      gender: "Female",
      totalVisits: 1,
      assignedDoctor: {
        name: "Dr. Maria Reyes",
        specialization: "General Physician",
      },
      cancellationReason:
        "Patient requested cancellation via email citing personal reasons and did not wish to reschedule at this time.",
    },
  ];

  const rawData =
    activeTab === "consultation"
      ? consultationRequests
      : activeTab === "patients"
        ? patients
        : activeTab === "cancelled"
          ? cancelledAppointments
          : rescheduleRequests;

  const activeData =
    patientTypeFilter === "all"
      ? rawData
      : rawData.filter((r) => r.patientType === patientTypeFilter);
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
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setPatientTypeFilter("all");
  };
  const handleFilterChange = (e) => {
    setPatientTypeFilter(e.target.value);
    setCurrentPage(1);
  };
  const handleRefundOpen = (row) => {
    setSelectedRefund(row);
    setShowRefundModal(true);
  };
  const handleRefundConfirm = (id) => {
    setRefundProcessed((prev) => ({ ...prev, [id]: true }));
    setShowRefundModal(false);
  };

  const getRescheduleStatusBadge = (s) =>
    ({
      Approved: {
        background: "#dcfce7",
        color: "#16a34a",
        border: "1px solid #bbf7d0",
      },
      Declined: {
        background: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      },
    })[s] || {
      background: "#fef9c3",
      color: "#b45309",
      border: "1px solid #fde68a",
    };

  const getStatusBadgeStyle = (s) =>
    ({
      completed: {
        background: "#dcfce7",
        color: "#16a34a",
        border: "1px solid #bbf7d0",
      },
      scheduled: {
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      },
      cancelled: {
        background: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      },
    })[s?.toLowerCase()] || {
      background: "#f3f4f6",
      color: "#6b7280",
      border: "1px solid #e5e7eb",
    };

  const getModeBadgeStyle = (mode) => ({
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
        <div className={`admin-content ${styles.patientPage}`}>
          <div className={styles.patientCard}>
            {/* ── Tabs + Filter ── */}
            <div className={styles.patientTabsRow}>
              <div className={styles.patientTabs}>
                <button
                  className={`${styles.tabBtn} ${activeTab === "patients" ? styles.tabActive : ""}`}
                  onClick={() => handleTabChange("patients")}
                >
                  Total's Patients <span>{patients.length}</span>
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === "consultation" ? styles.tabActive : ""}`}
                  onClick={() => handleTabChange("consultation")}
                >
                  Consultation Request{" "}
                  <span>{consultationRequests.length}</span>
                </button>
                <button
                  className={`${styles.tabBtn} ${activeTab === "reschedule" ? styles.tabActive : ""}`}
                  onClick={() => handleTabChange("reschedule")}
                >
                  Reschedule Request{" "}
                  <span
                    className={
                      rescheduleRequests.filter((r) => r.status === "Pending")
                        .length > 0
                        ? styles.tabBadgePending
                        : ""
                    }
                  >
                    {
                      rescheduleRequests.filter((r) => r.status === "Pending")
                        .length
                    }
                  </span>
                </button>
                <button
                  className={`${styles.tabCancelledBtn} ${activeTab === "cancelled" ? styles.tabCancelledActive : ""}`}
                  onClick={() => handleTabChange("cancelled")}
                >
                  Cancelled{" "}
                  <span className={styles.tabCancelledCount}>
                    {cancelledAppointments.length}
                  </span>
                </button>
              </div>

              <div className={styles.filterDropdown}>
                <FiFilter size={13} />
                <select value={patientTypeFilter} onChange={handleFilterChange}>
                  <option value="all">All Patients</option>
                  <option value="Existing Patient">Existing Patient</option>
                  <option value="New Patient">New Patient</option>
                </select>
              </div>
            </div>

            {/* ── Table ── */}
            <div className={styles.tableWrapper}>
              <table className={styles.patientTable}>
                <thead>
                  {activeTab === "reschedule" ? (
                    <tr>
                      <th>Name</th>
                      <th>Patient Type</th>
                      <th>Original Date & Time</th>
                      <th>Requested Date & Time</th>
                      <th>Visit Type</th>
                      <th>Consultation Mode</th>
                      <th>Action</th>
                    </tr>
                  ) : activeTab === "consultation" ? (
                    <tr>
                      <th>Name</th>
                      <th>Patient Type</th>
                      <th>Date of Appointment</th>
                      <th>Time</th>
                      <th>Visit Type</th>
                      <th>Consultation Mode</th>
                      <th>Action</th>
                    </tr>
                  ) : activeTab === "cancelled" ? (
                    <tr>
                      <th>Name</th>
                      <th>Patient Type</th>
                      <th>Date of Appointment</th>
                      <th>Time</th>
                      <th>Visit Type</th>
                      <th>Consultation Mode</th>
                      <th>Action</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Name</th>
                      <th>Patient Type</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {displayedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyRow}>
                        No{" "}
                        {patientTypeFilter !== "all" ? patientTypeFilter : ""}{" "}
                        records found.
                      </td>
                    </tr>
                  ) : activeTab === "reschedule" ? (
                    displayedData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>
                          <span
                            className={`${styles.patientTypeBadge} ${row.patientType === "New Patient" ? styles.badgeNew : styles.badgeExisting}`}
                          >
                            {row.patientType}
                          </span>
                        </td>
                        <td>
                          <span className={styles.dateOriginal}>
                            {row.originalDate}
                          </span>
                          <br />
                          <small style={{ color: "#aaa" }}>
                            {row.originalTime}
                          </small>
                        </td>
                        <td>
                          <span className={styles.dateRequested}>
                            {row.requestedDate}
                          </span>
                          <br />
                          <small style={{ color: "#4D227C", fontWeight: 600 }}>
                            {row.requestedTime}
                          </small>
                        </td>
                        <td>{row.type}</td>
                        <td>
                          <span style={getModeBadgeStyle(row.consultationMode)}>
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
                            className={styles.btnView}
                            onClick={() => handleViewReschedule(row)}
                          >
                            View
                          </button>
                          <button
                            className={styles.btnConfirm}
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
                  ) : activeTab === "consultation" ? (
                    displayedData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>
                          <span
                            className={`${styles.patientTypeBadge} ${row.patientType === "New Patient" ? styles.badgeNew : styles.badgeExisting}`}
                          >
                            {row.patientType}
                          </span>
                        </td>
                        <td>{row.date}</td>
                        <td>{row.time}</td>
                        <td>{row.type}</td>
                        <td>
                          <span style={getModeBadgeStyle(row.consultationMode)}>
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
                            className={styles.btnView}
                            onClick={() => handleView(row, activeTab)}
                          >
                            View
                          </button>
                          <button
                            className={styles.btnConfirm}
                            disabled={row.status === "Cancelled"}
                          >
                            Confirm
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : activeTab === "cancelled" ? (
                    displayedData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>
                          <span
                            className={`${styles.patientTypeBadge} ${row.patientType === "New Patient" ? styles.badgeNew : styles.badgeExisting}`}
                          >
                            {row.patientType}
                          </span>
                        </td>
                        <td>{row.date}</td>
                        <td>{row.time}</td>
                        <td>{row.type}</td>
                        <td>
                          <span style={getModeBadgeStyle(row.consultationMode)}>
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
                            className={styles.btnView}
                            onClick={() => handleView(row, "cancelled")}
                          >
                            View
                          </button>
                          <button
                            className={`${styles.btnRefund} ${refundProcessed[row.id] ? styles.btnRefundDone : ""}`}
                            disabled={refundProcessed[row.id]}
                            onClick={() => handleRefundOpen(row)}
                          >
                            {refundProcessed[row.id] ? "Refunded" : "Refund"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    displayedData.map((row) => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>
                          <span
                            className={`${styles.patientTypeBadge} ${row.patientType === "New Patient" ? styles.badgeNew : styles.badgeExisting}`}
                          >
                            {row.patientType}
                          </span>
                        </td>
                        <td>{row.age}</td>
                        <td>{row.gender}</td>
                        <td>{row.address}</td>
                        <td>
                          <span
                            className={`${styles.statusText} ${styles[`status${row.status}`]}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.btnView}
                            onClick={() => handleView(row, activeTab)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div className={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ‹ Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? styles.pageActive : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next ›
              </button>
            </div>
            <div className={styles.pageInfo}>
              Page {currentPage} of {totalPages || 1}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════
          VIEW MODAL
      ════════════════════════════ */}
      {showModal && selectedPatient && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modalLg} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalProfileHeader}>
              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
              <div className={styles.modalProfileRow}>
                <AvatarPlaceholder name={selectedPatient.name} size={68} />
                <div className={styles.patientProfileInfo}>
                  <h3 className={styles.patientProfileName}>
                    {selectedPatient.name}
                  </h3>
                  <p className={styles.patientProfileContact}>
                    <FiPhone size={12} style={{ marginRight: 5 }} />
                    {selectedPatient.contact}
                  </p>
                  <div className={styles.patientProfileMeta}>
                    {selectedPatient.age && (
                      <span className={styles.metaChip}>
                        {selectedPatient.age} yrs
                      </span>
                    )}
                    {selectedPatient.gender && (
                      <span className={styles.metaChip}>
                        {selectedPatient.gender}
                      </span>
                    )}
                    {selectedPatient.totalVisits && (
                      <span className={styles.metaChip}>
                        {selectedPatient.totalVisits} Visits
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className={styles.btnViewProfile}
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

            {/* Body */}
            <div className={styles.modalBody}>
              {/* Appointment Details */}
              <div
                className={styles.modalCard}
                style={{ marginBottom: "12px" }}
              >
                <SectionHeader
                  icon={<FaCalendarAlt size={13} color="#fff" />}
                  title="Appointment Details"
                />
                <div className={styles.twoCol}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiCalendar />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Date</span>
                      <span className={styles.infoValue}>
                        {selectedPatient.date}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiClock />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Time</span>
                      <span className={styles.infoValue}>
                        {selectedPatient.time}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiUser />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Visit Type</span>
                      <span className={styles.infoValue}>
                        {selectedPatient.type}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiUser />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Status</span>
                      <span
                        className={styles.statusBadge}
                        style={getStatusBadgeStyle(selectedPatient.status)}
                      >
                        {selectedPatient.status}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      {selectedPatient.patientType === "Existing Patient" ? (
                        <FiUserCheck />
                      ) : (
                        <FiUserPlus />
                      )}
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Patient Type</span>
                      <span className={styles.infoValue}>
                        {selectedPatient.patientType}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      {selectedPatient.consultationMode === "Virtual" ? (
                        <FiMonitor />
                      ) : (
                        <FiHome />
                      )}
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Mode</span>
                      <span className={styles.infoValue}>
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

              {/* Cancellation Reason (cancelled tab only) */}
              {modalSource === "cancelled" &&
                selectedPatient.cancellationReason && (
                  <div
                    className={styles.modalCard}
                    style={{ marginBottom: "12px" }}
                  >
                    <div className={styles.cancellationHeader}>
                      <div className={styles.cancellationIcon}>
                        <FiAlertCircle size={14} color="#fff" />
                      </div>
                      <h4 className={styles.cancellationTitle}>
                        Cancellation Reason
                      </h4>
                    </div>
                    <div className={styles.cancellationBox}>
                      <p className={styles.cancellationText}>
                        {selectedPatient.cancellationReason}
                      </p>
                    </div>
                  </div>
                )}

              {/* Progression Note */}
              {selectedPatient.status === "Completed" &&
                selectedPatient.progressionNote && (
                  <div
                    className={styles.modalCard}
                    style={{ marginBottom: "12px" }}
                  >
                    <SectionHeader
                      icon={<FiActivity size={14} color="#fff" />}
                      title="Progression Note"
                    />
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

              {/* Payment Details */}
              <div className={styles.modalCard}>
                <button
                  className={styles.paymentToggle}
                  onClick={() => setPaymentOpen(!paymentOpen)}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div className={styles.cardSectionIcon}>
                      <FiFileText size={13} color="#fff" />
                    </div>
                    <span className={styles.paymentToggleTitle}>
                      Payment Details
                    </span>
                  </span>
                  <span className={styles.paymentToggleIcon}>
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
                  <div className={styles.paymentCollapseBody}>
                    <div className={styles.paymentLayout}>
                      <div className={styles.paymentFields}>
                        <div className={styles.infoItem}>
                          <div
                            className={styles.infoIcon}
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            ₱
                          </div>
                          <div>
                            <span className={styles.infoLabel}>
                              Paid Amount
                            </span>
                            <span className={styles.infoValue}>—</span>
                          </div>
                        </div>
                        <div className={styles.infoItem}>
                          <div
                            className={styles.infoIcon}
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            #
                          </div>
                          <div>
                            <span className={styles.infoLabel}>
                              Reference No.
                            </span>
                            <span className={styles.infoValue}>—</span>
                          </div>
                        </div>
                        <div className={styles.infoItem}>
                          <div
                            className={styles.infoIcon}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            PAY
                          </div>
                          <div>
                            <span className={styles.infoLabel}>
                              Payment Option
                            </span>
                            <span className={styles.infoValue}>—</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.paymentProof}>
                        <span className={styles.paymentProofLabel}>
                          Payment Proof
                        </span>
                        <img
                          src={samplePayment}
                          alt="Payment Proof"
                          className={styles.paymentProofImg}
                          onClick={() => setZoomImage(samplePayment)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button
                className={styles.btnViewHistory}
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
                  className={styles.btnFooterConfirm}
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

      {/* ════════════════════════════
          RESCHEDULE MODAL
      ════════════════════════════ */}
      {showRescheduleModal && selectedReschedule && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowRescheduleModal(false)}
        >
          <div className={styles.modalLg} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalProfileHeader}>
              <button
                className={styles.closeBtn}
                onClick={() => setShowRescheduleModal(false)}
              >
                <FiX />
              </button>
              <div className={styles.modalProfileRow}>
                <AvatarPlaceholder name={selectedReschedule.name} size={68} />
                <div className={styles.patientProfileInfo}>
                  <h3 className={styles.patientProfileName}>
                    {selectedReschedule.name}
                  </h3>
                  <p className={styles.patientProfileContact}>
                    <FiPhone size={12} style={{ marginRight: 5 }} />
                    {selectedReschedule.contact}
                  </p>
                  <div className={styles.patientProfileMeta}>
                    {selectedReschedule.age && (
                      <span className={styles.metaChip}>
                        {selectedReschedule.age} yrs
                      </span>
                    )}
                    {selectedReschedule.gender && (
                      <span className={styles.metaChip}>
                        {selectedReschedule.gender}
                      </span>
                    )}
                    {selectedReschedule.totalVisits && (
                      <span className={styles.metaChip}>
                        {selectedReschedule.totalVisits} Visits
                      </span>
                    )}
                    <span className={styles.metaChip}>
                      {selectedReschedule.patientType}
                    </span>
                  </div>
                </div>
                <button
                  className={styles.btnViewProfile}
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

            <div className={styles.modalBody}>
              <div
                className={styles.modalCard}
                style={{ marginBottom: "12px" }}
              >
                <SectionHeader
                  icon={<FaCalendarAlt size={13} color="#fff" />}
                  title="Appointment Details"
                />
                <div className={styles.twoCol}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiCalendar />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Original Date</span>
                      <span className={styles.infoValue}>
                        {selectedReschedule.originalDate}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiClock />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Original Time</span>
                      <span className={styles.infoValue}>
                        {selectedReschedule.originalTime}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div
                      className={styles.infoIcon}
                      style={{ color: "#4D227C" }}
                    >
                      <FiCalendar />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Requested Date</span>
                      <span
                        className={styles.infoValue}
                        style={{ color: "#4D227C", fontWeight: 700 }}
                      >
                        {selectedReschedule.requestedDate}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div
                      className={styles.infoIcon}
                      style={{ color: "#4D227C" }}
                    >
                      <FiClock />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Requested Time</span>
                      <span
                        className={styles.infoValue}
                        style={{ color: "#4D227C", fontWeight: 700 }}
                      >
                        {selectedReschedule.requestedTime}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiUser />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Visit Type</span>
                      <span className={styles.infoValue}>
                        {selectedReschedule.type}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      {selectedReschedule.consultationMode === "Virtual" ? (
                        <FiMonitor />
                      ) : (
                        <FiHome />
                      )}
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Mode</span>
                      <span className={styles.infoValue}>
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
                    className={styles.statusBadge}
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

              <div className={styles.modalCard}>
                <SectionHeader
                  icon={<FiAlertCircle size={14} color="#fff" />}
                  title="Reason for Reschedule"
                />
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

            <div className={styles.modalFooter}>
              <button
                className={styles.btnDecline}
                disabled={selectedReschedule.status !== "Pending"}
                onClick={() =>
                  handleRescheduleAction(selectedReschedule.id, "decline")
                }
              >
                <FiXCircle style={{ marginRight: "6px" }} />
                Decline
              </button>
              <button
                className={styles.btnFooterConfirm}
                disabled={selectedReschedule.status !== "Pending"}
                onClick={() =>
                  handleRescheduleAction(selectedReschedule.id, "approve")
                }
              >
                <FiCheck size={15} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════
          REFUND MODAL
      ════════════════════════════ */}
      {showRefundModal && selectedRefund && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowRefundModal(false)}
        >
          <div
            className={styles.refundModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.refundHeader}>
              <div className={styles.refundHeaderLeft}>
                <div className={styles.refundHeaderIcon}>
                  <FiDollarSign size={18} color="#fff" />
                </div>
                <h3 className={styles.refundHeaderTitle}>Process Refund</h3>
              </div>
              <button
                className={styles.refundCloseBtn}
                onClick={() => setShowRefundModal(false)}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.refundBody}>
              <div className={styles.refundInfoBox}>
                <p className={styles.refundInfoLabel}>Cancelled Appointment</p>
                <p className={styles.refundInfoName}>{selectedRefund.name}</p>
                <p className={styles.refundInfoMeta}>
                  {selectedRefund.date} · {selectedRefund.time} ·{" "}
                  {selectedRefund.type}
                </p>
              </div>
              <div className={styles.refundGrid}>
                <div className={styles.refundGridItem}>
                  <span className={styles.refundGridItemLabel}>
                    Paid Amount
                  </span>
                  <span className={styles.refundGridItemValue}>—</span>
                </div>
                <div className={styles.refundGridItem}>
                  <span className={styles.refundGridItemLabel}>
                    Reference No.
                  </span>
                  <span className={styles.refundGridItemValue}>—</span>
                </div>
              </div>
              <p className={styles.refundWarning}>
                ⚠️ Confirming this will mark the payment as refunded. This
                action cannot be undone.
              </p>
            </div>
            <div className={styles.refundFooter}>
              <button
                className={styles.refundCancelBtn}
                onClick={() => setShowRefundModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.refundConfirmBtn}
                onClick={() => handleRefundConfirm(selectedRefund.id)}
              >
                <FiDollarSign size={14} /> Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Zoom Image ── */}
      {zoomImage && (
        <div className={styles.zoomOverlay} onClick={() => setZoomImage(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} alt="Zoomed" className={styles.zoomImg} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPatient;

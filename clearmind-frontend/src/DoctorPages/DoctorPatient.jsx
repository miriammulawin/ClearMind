import { useState } from "react";
import DoctorSidebar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import styles from "./DoctorStyle/DoctorPatient.module.css";
import {
  FiX,
  FiCheck,
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
  FiEdit3,
  FiFilter,
} from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import samplePayment from "../assets/payment/images.png";
import { useNavigate } from "react-router-dom";
import CompleteAppointmentModal from "./components/CompleteAppointmentModal";

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

function DoctorPatient() {
  const [activeMenu, setActiveMenu] = useState("Patients");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [patientTypeFilter, setPatientTypeFilter] = useState("all");
  const [showClinicalModal, setShowClinicalModal] = useState(false);
  const [clinicalModalPatient, setClinicalModalPatient] = useState(null);
  const navigate = useNavigate();

  const [patientList, setPatientList] = useState([
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
      progressionNote: {
        assessment:
          "Follow-up consultation for hypertension management. Patient reports improved well-being and no adverse effects from current medication. Blood pressure today: 128/82 mmHg — within acceptable range and showing marked improvement from last visit. Patient is fully compliant with amlodipine 5mg once daily. No changes to current medication regimen. Advised to continue home blood pressure monitoring and maintain low-sodium diet. Next check-up in 1 month.",
      },
    },
  ]);

  const [progressionDraft, setProgressionDraft] = useState("");
  const rowsPerPage = 4;

  const filteredList =
    patientTypeFilter === "all"
      ? patientList
      : patientList.filter((p) => p.patientType === patientTypeFilter);

  const totalPages = Math.ceil(filteredList.length / rowsPerPage);
  const displayedData = filteredList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleView = (row) => {
    setSelectedPatient(row);
    setProgressionDraft("");
    setShowModal(true);
    setPaymentOpen(false);
  };

  const handleFilterChange = (e) => {
    setPatientTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleMarkComplete = () => {
    if (!progressionDraft.trim()) return;
    const updated = patientList.map((p) =>
      p.id === selectedPatient.id
        ? {
            ...p,
            status: "Completed",
            progressionNote: { assessment: progressionDraft.trim() },
          }
        : p,
    );
    setPatientList(updated);
    setSelectedPatient((prev) => ({
      ...prev,
      status: "Completed",
      progressionNote: { assessment: progressionDraft.trim() },
    }));
    setProgressionDraft("");
  };

  const handleOpenClinical = (row) => {
    setClinicalModalPatient(row);
    setShowClinicalModal(true);
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
    <div className="doctor-layout">
      <DoctorSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />
        <div className="doctor-content" style={{ padding: "20px" }}>
          <div className="patient-card">
            {/* ── Tab + Filter Row ── */}
            <div className={styles.patientTabsRow}>
              <div className={styles.patientTabs}>
                <button className={styles.tabActive}>
                  Total's Patients <span>{patientList.length}</span>
                </button>
              </div>
              <div className={styles.patientFilterDropdown}>
                <FiFilter size={13} />
                <select value={patientTypeFilter} onChange={handleFilterChange}>
                  <option value="all">All Patients</option>
                  <option value="Existing Patient">Existing Patient</option>
                  <option value="New Patient">New Patient</option>
                </select>
              </div>
            </div>

            {/* ── Table ── */}
            <div className={styles.patientTableWrapper}>
              <table className={styles.patientTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Patient Type</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: "32px",
                          color: "#aaa",
                          fontStyle: "italic",
                        }}
                      >
                        No{" "}
                        {patientTypeFilter !== "all" ? patientTypeFilter : ""}{" "}
                        records found.
                      </td>
                    </tr>
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
                            className={`${styles.status} ${styles[row.status.toLowerCase()]}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.btnView}
                            onClick={() => handleView(row)}
                          >
                            View
                          </button>
                          <button
                            className={styles.btnConfirm}
                            style={{
                              height: 32,
                              width: "auto",
                              padding: "0 14px",
                              fontSize: 12,
                              borderRadius: 8,
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              cursor:
                                row.status === "Completed"
                                  ? "not-allowed"
                                  : "pointer",
                              border: "1px solid #4a965b",
                              background:
                                row.status === "Completed"
                                  ? "#a8d5b5"
                                  : "#4a965b",
                              color: "#fff",
                              opacity: row.status === "Completed" ? 0.55 : 1,
                            }}
                            disabled={row.status === "Completed"}
                            onClick={() =>
                              row.status !== "Completed" &&
                              handleOpenClinical(row)
                            }
                          >
                            Complete
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

      {/* ══════════════════════════════════════
          VIEW MODAL
      ══════════════════════════════════════ */}
      {showModal && selectedPatient && (
        <div
          className={styles.patientModalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.patientModalLg}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.modalProfileHeader}>
              <button
                className={`${styles.closeBtn} ${styles.profileCloseBtn}`}
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
                      <span className={styles.profileMetaChip}>
                        {selectedPatient.age} yrs
                      </span>
                    )}
                    {selectedPatient.gender && (
                      <span className={styles.profileMetaChip}>
                        {selectedPatient.gender}
                      </span>
                    )}
                    {selectedPatient.totalVisits && (
                      <span className={styles.profileMetaChip}>
                        {selectedPatient.totalVisits} Visits
                      </span>
                    )}
                    <span
                      className={`${styles.patientTypeBadge} ${selectedPatient.patientType === "New Patient" ? styles.badgeNew : styles.badgeExisting}`}
                      style={{ fontSize: "11px" }}
                    >
                      {selectedPatient.patientType}
                    </span>
                  </div>
                </div>
                <button
                  className={styles.btnViewProfile}
                  onClick={() =>
                    navigate(`/doctor/patient-profile/${selectedPatient.id}`, {
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
                className={styles.modalContentCard}
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
                <div className={styles.modalTwoCol}>
                  <div className={styles.modalInfoItem}>
                    <div className={styles.modalInfoIcon}>
                      <FiCalendar />
                    </div>
                    <div>
                      <span className={styles.modalInfoLabel}>Date</span>
                      <span className={styles.modalInfoValue}>
                        {selectedPatient.date}
                      </span>
                    </div>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <div className={styles.modalInfoIcon}>
                      <FiClock />
                    </div>
                    <div>
                      <span className={styles.modalInfoLabel}>Time</span>
                      <span className={styles.modalInfoValue}>
                        {selectedPatient.time}
                      </span>
                    </div>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <div className={styles.modalInfoIcon}>
                      <FiUser />
                    </div>
                    <div>
                      <span className={styles.modalInfoLabel}>Visit Type</span>
                      <span className={styles.modalInfoValue}>
                        {selectedPatient.type}
                      </span>
                    </div>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <div className={styles.modalInfoIcon}>
                      <FiUser />
                    </div>
                    <div>
                      <span className={styles.modalInfoLabel}>Status</span>
                      <span
                        className={styles.statusBadge}
                        style={getStatusBadgeStyle(selectedPatient.status)}
                      >
                        {selectedPatient.status}
                      </span>
                    </div>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <div className={styles.modalInfoIcon}>
                      {selectedPatient.patientType === "Existing Patient" ? (
                        <FiUserCheck />
                      ) : (
                        <FiUserPlus />
                      )}
                    </div>
                    <div>
                      <span className={styles.modalInfoLabel}>
                        Patient Type
                      </span>
                      <span className={styles.modalInfoValue}>
                        {selectedPatient.patientType}
                      </span>
                    </div>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <div className={styles.modalInfoIcon}>
                      {selectedPatient.consultationMode === "Virtual" ? (
                        <FiMonitor />
                      ) : (
                        <FiHome />
                      )}
                    </div>
                    <div>
                      <span className={styles.modalInfoLabel}>Mode</span>
                      <span
                        style={getConsultationModeBadge(
                          selectedPatient.consultationMode,
                        )}
                      >
                        {selectedPatient.consultationMode === "Virtual" ? (
                          <FiMonitor size={11} />
                        ) : (
                          <FiHome size={11} />
                        )}
                        {selectedPatient.consultationMode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progression Note */}
              {selectedPatient.status === "Completed" &&
              selectedPatient.progressionNote ? (
                <div
                  className={styles.modalContentCard}
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
                        background: "linear-gradient(135deg, #7341A8, #4D227C)",
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
                      <FiFileText size={12} /> Assessment
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
              ) : selectedPatient.status !== "Completed" ? (
                <div
                  className={styles.modalContentCard}
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
                        background: "linear-gradient(135deg, #7341A8, #4D227C)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FiEdit3 size={14} color="#fff" />
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
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#1d4ed8",
                        background: "#dbeafe",
                        border: "1px solid #bfdbfe",
                        borderRadius: "20px",
                        padding: "3px 10px",
                      }}
                    >
                      Draft
                    </span>
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
                      <FiFileText size={12} /> Assessment
                    </p>
                    <textarea
                      value={progressionDraft}
                      onChange={(e) => setProgressionDraft(e.target.value)}
                      placeholder="Write your clinical assessment here..."
                      rows={5}
                      style={{
                        width: "100%",
                        fontSize: "13.5px",
                        color: "#374151",
                        lineHeight: "1.75",
                        border: "1px solid #d8ccf0",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        resize: "vertical",
                        outline: "none",
                        background: "#fff",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#7341A8")}
                      onBlur={(e) => (e.target.style.borderColor = "#d8ccf0")}
                    />
                  </div>
                </div>
              ) : null}

              {/* Payment Details */}
              <div className={styles.modalContentCard}>
                <button
                  className={styles.paymentCollapseToggle}
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
                      className={styles.modalSectionTitle}
                      style={{ margin: 0, padding: 0, border: "none" }}
                    >
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
                        <div className={styles.modalInfoItem}>
                          <div className={styles.modalInfoIcon}>
                            <FiFileText />
                          </div>
                          <div>
                            <span className={styles.modalInfoLabel}>
                              Payment Status
                            </span>
                            <span
                              className={styles.statusBadge}
                              style={{
                                background: "#dcfce7",
                                color: "#16a34a",
                                border: "1px solid #bbf7d0",
                                padding: "3px 10px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              Paid
                            </span>
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
                  navigate(`/doctor/patient-history/${selectedPatient.id}`, {
                    state: { patient: selectedPatient },
                  })
                }
              >
                <FiFileText style={{ marginRight: "6px" }} />
                View History
              </button>
              {selectedPatient.status !== "Completed" && (
                <button
                  className={styles.btnConfirm}
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
                    opacity: progressionDraft.trim() ? 1 : 0.5,
                    cursor: progressionDraft.trim() ? "pointer" : "not-allowed",
                  }}
                  disabled={!progressionDraft.trim()}
                  onClick={handleMarkComplete}
                >
                  <FiCheck size={15} />
                  Mark as Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zoom image */}
      {zoomImage && (
        <div
          className={styles.patientModalOverlay}
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

      {/* Clinical Notes Modal */}
      {showClinicalModal && clinicalModalPatient && (
        <CompleteAppointmentModal
          isOpen={showClinicalModal}
          onClose={() => {
            setShowClinicalModal(false);
            setClinicalModalPatient(null);
          }}
          appt={{
            patientName: clinicalModalPatient.name,
            start: new Date(
              `${clinicalModalPatient.date} ${clinicalModalPatient.time}`,
            ),
            end: new Date(
              `${clinicalModalPatient.date} ${clinicalModalPatient.time}`,
            ),
            title:
              clinicalModalPatient.consultationMode === "Virtual"
                ? "Online Clinic"
                : "Physical Clinic",
          }}
          onConfirm={() => {
            const updated = patientList.map((p) =>
              p.id === clinicalModalPatient.id
                ? { ...p, status: "Completed" }
                : p,
            );
            setPatientList(updated);
          }}
        />
      )}
    </div>
  );
}

export default DoctorPatient;

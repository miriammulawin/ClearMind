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
  const [progressionDraft, setProgressionDraft] = useState("");
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
      progressionNote: {
        assessment:
          "Patient presents with erythematous rash on bilateral forearms for approximately 1 week. Diagnosed with contact dermatitis, likely allergic in origin.",
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
          "Follow-up for hypertension. Blood pressure: 128/82 mmHg. Medication compliance confirmed. No changes to regimen. Next check-up in 1 month.",
      },
    },
  ]);

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

  const getModeBadge = (mode) => ({
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

  const CardHeader = ({ icon, title, badge }) => (
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
      <div className={styles.cardSectionIcon}>{icon}</div>
      <h4 className={styles.cardSectionTitle}>{title}</h4>
      {badge && (
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
          {badge}
        </span>
      )}
    </div>
  );

  return (
    <div className="doctor-layout">
      <DoctorSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className={`doctor-content ${styles.patientPage}`}>
          <div className={styles.patientCard}>
            {/* ── Tabs + Filter ── */}
            <div className={styles.patientTabsRow}>
              <div className={styles.patientTabs}>
                <button className={`${styles.tabBtn} ${styles.tabActive}`}>
                  Total's Patients <span>{patientList.length}</span>
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
                      <td colSpan={7} className={styles.emptyRow}>
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
                            className={`${styles.statusText} ${styles[`status${row.status}`]}`}
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
                  <FiExternalLink style={{ marginRight: "6px" }} /> View Profile
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
                <CardHeader
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
                      <span
                        style={getModeBadge(selectedPatient.consultationMode)}
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

              {/* Progression Note — completed: read-only */}
              {selectedPatient.status === "Completed" &&
                selectedPatient.progressionNote && (
                  <div
                    className={styles.modalCard}
                    style={{ marginBottom: "12px" }}
                  >
                    <CardHeader
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
                )}

              {/* Progression Note — scheduled: editable draft */}
              {selectedPatient.status !== "Completed" && (
                <div
                  className={styles.modalCard}
                  style={{ marginBottom: "12px" }}
                >
                  <CardHeader
                    icon={<FiEdit3 size={14} color="#fff" />}
                    title="Progression Note"
                    badge="Draft"
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
                        border: "2px solid #e5d6f5",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        resize: "vertical",
                        outline: "none",
                        background: "#fff",
                        fontFamily: "inherit",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#4D227C";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(77,34,124,0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e5d6f5";
                        e.target.style.boxShadow = "none";
                      }}
                    />
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
                          <div className={styles.infoIcon}>
                            <FiFileText />
                          </div>
                          <div>
                            <span className={styles.infoLabel}>
                              Payment Status
                            </span>
                            <span
                              className={styles.statusBadge}
                              style={{
                                background: "#dcfce7",
                                color: "#16a34a",
                                border: "1px solid #bbf7d0",
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
                <FiFileText style={{ marginRight: "6px" }} /> View History
              </button>
              {selectedPatient.status !== "Completed" && (
                <button
                  className={styles.btnFooterConfirm}
                  disabled={!progressionDraft.trim()}
                  onClick={handleMarkComplete}
                >
                  <FiCheck size={15} /> Mark as Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zoom image */}
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

export default DoctorPatient;

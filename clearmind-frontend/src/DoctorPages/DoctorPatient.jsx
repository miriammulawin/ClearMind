import { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import CompleteAppointmentModal from "./components/CompleteAppointmentModal";

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */
const API_BASE = "http://localhost:8000";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
const AvatarPlaceholder = ({ name = "?", size = 80 }) => {
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
  const color = colors[(name.charCodeAt(0) || 0) % colors.length];
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

/**
 * Resolve receipt URL from an appointment object.
 * Handles receipt_urls[] (model $appends), receipt_paths[], and plain receiptUrl.
 */
const resolveReceiptUrl = (appointment) => {
  if (!appointment) return null;

  const buildUrl = (path) => {
    if (!path) return null;

    // already full URL (correct)
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // remove duplicate "storage/" if exists
    const clean = path.replace(/^storage\//, "").replace(/^\/+/, "");

    return `${API_BASE}/storage/${clean}`;
  };

  // ✅ priority order
  if (
    Array.isArray(appointment.receipt_urls) &&
    appointment.receipt_urls.length
  ) {
    return buildUrl(appointment.receipt_urls[0]);
  }

  if (appointment.receiptUrl) {
    return buildUrl(appointment.receiptUrl);
  }

  if (
    Array.isArray(appointment.receipt_paths) &&
    appointment.receipt_paths.length
  ) {
    return buildUrl(appointment.receipt_paths[0]);
  }

  return null;
};

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSaveId, setPendingSaveId] = useState(null);
  const navigate = useNavigate();

  const [patientList, setPatientList] = useState([]);
  const [progressionDraft, setProgressionDraft] = useState("");
  const rowsPerPage = 4;

  /* Filtered + paginated data */
  const filteredList =
    patientTypeFilter === "all"
      ? patientList
      : patientList.filter((p) => p.patientType === patientTypeFilter);

  const totalPages = Math.ceil(filteredList.length / rowsPerPage);
  const displayedData = filteredList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  /* ══════════════════════════════════════════════════════
     FETCH — GET /api/doctor/patients
  ══════════════════════════════════════════════════════ */

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/doctor/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch patients.");

      const mapped = (json.data || []).map((p) => {
        const latest = p.latestAppointment || {};
        const appointments = p.appointments || [];

        return {
          id: p.patient_id,
          patient_id: p.patient_id,
          name: p.name,
          age: p.age ?? "—",
          gender: p.gender ?? "—",
          address: p.address ?? "—",
          contact: p.contact ?? "—",
          email: p.email ?? "—",
          patientType: p.patientType,
          totalVisits: p.totalVisits,

          profilePicture: p.user?.profilePicture
            ? `${API_BASE}/storage/${p.user.profilePicture}`
            : null,

          date: latest?.date ?? "—",
          time: latest?.time ?? "—",
          type: latest?.type ?? "—",
          status: latest?.status || "—",
          raw_status: latest?.raw_status ?? "",

          consultationMode:
            latest?.consultationMode ?? latest?.consultation_mode ?? "On-Site",

          paymentStatus:
            latest?.payment_status ?? latest?.paymentStatus ?? "not_paid",

          appointmentId: latest?.appointment_id ?? null,

          appointmentDate: latest?.raw_date ?? latest?.date ?? null,
          startTime: latest?.start_time ?? null,
          endTime: latest?.end_time ?? null,
          visitType: latest?.visit_type ?? null,

          referenceNumber:
            latest?.appointment_ref ?? latest?.referenceNumber ?? null,

          serviceType: latest?.service_type ?? null,
          assessmentPurpose: latest?.pae_purpose ?? null,
          reason: latest?.reason_for_consultation ?? latest?.notes ?? null,

          receiptUrl: resolveReceiptUrl({
            receipt_urls: latest?.receipt_urls,
            receipt_paths: latest?.receipt_paths,
            receiptUrl: latest?.receiptUrl,
          }),
          progressionNote: latest?.progression_note ?? null,

          appointments: appointments.map((a) => ({
            ...a,
            receiptUrl: resolveReceiptUrl(a),
          })),
        };
      });

      setPatientList(mapped);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  /* ══════════════════════════════════════════════════════
     ACTIONS
  ══════════════════════════════════════════════════════ */
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

  const handleMarkComplete = async () => {
    if (!selectedPatient) return;
    if (!progressionDraft.trim()) {
      alert("Please write a clinical assessment before completing.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/appointments/${selectedPatient.appointmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status: "completed",
            notes: progressionDraft.trim(),
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to mark complete");
      }

      const updated = patientList.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              status: "Completed",
              raw_status: "completed",
              progressionNote: { assessment: progressionDraft.trim() },
              notes: progressionDraft.trim(),
            }
          : p,
      );
      setPatientList(updated);
      setSelectedPatient((prev) => ({
        ...prev,
        status: "Completed",
        raw_status: "completed",
        progressionNote: { assessment: progressionDraft.trim() },
        notes: progressionDraft.trim(),
      }));
      setProgressionDraft("");
    } catch (err) {
      console.error("Mark complete error:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleOpenClinical = (row) => {
    setClinicalModalPatient(row);
    setShowClinicalModal(true);
  };

  /**
   * ✅ Fixed: correct URL  POST /api/appointments/{id}/progression-note
   */
  const handleSaveProgressionNote = async (appointmentId) => {
    if (!progressionDraft.trim()) {
      alert("Please write an assessment before saving.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/appointments/${appointmentId}/progression-note`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ assessment: progressionDraft.trim() }),
        },
      );

      let data;

      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned invalid JSON (probably 500 error)");
      }
      if (!res.ok) throw new Error(data.message || "Save failed");
      await fetchPatients();

      // Update local state so the draft becomes permanent in the modal
      setPatientList((prev) =>
        prev.map((p) =>
          p.appointmentId === appointmentId
            ? {
                ...p,
                progressionNote: { assessment: progressionDraft.trim() },
                notes: progressionDraft.trim(),
              }
            : p,
        ),
      );

      if (selectedPatient?.appointmentId === appointmentId) {
        setSelectedPatient((prev) => ({
          ...prev,
          progressionNote: { assessment: progressionDraft.trim() },
          notes: progressionDraft.trim(),
        }));
      }

      setProgressionDraft("");
      alert("Progression note saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Save failed: " + err.message);
    }
  };

  /* ══════════════════════════════════════════════════════
     BADGE STYLES
  ══════════════════════════════════════════════════════ */
  const getStatusBadgeStyle = (status) => {
    switch ((status ?? "").toLowerCase()) {
      case "completed":
        return {
          background: "#dcfce7",
          color: "#16a34a",
          border: "1px solid #bbf7d0",
        };
      case "confirmed":
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
      case "pending":
        return {
          background: "#fef9c3",
          color: "#b45309",
          border: "1px solid #fde68a",
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

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="doctor-layout">
      <DoctorSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />
        <div className="doctor-content" style={{ padding: "20px" }}>
          <div className="patient-card">
            {/* Error banner */}
            {error && (
              <div
                style={{
                  padding: "10px 16px",
                  background: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                ⚠ {error}
              </div>
            )}

            {/* Tab + Filter Row */}
            <div className={styles.patientTabsRow}>
              <div className={styles.patientTabs}>
                <button className={styles.tabActive}>
                  My Patients&nbsp;<span>{patientList.length}</span>
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

            {/* Table */}
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
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          padding: "32px",
                          color: "#aaa",
                        }}
                      >
                        Loading patients…
                      </td>
                    </tr>
                  ) : displayedData.length === 0 ? (
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
                    displayedData.map((row) => {
                      const isCompleted =
                        (row.raw_status || row.status || "").toLowerCase() ===
                        "completed";
                      return (
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
                              className={styles.statusBadge}
                              style={getStatusBadgeStyle(row.status)}
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
                                cursor: isCompleted ? "not-allowed" : "pointer",
                                border: "1px solid #4a965b",
                                background: isCompleted ? "#a8d5b5" : "#4a965b",
                                color: "#fff",
                                opacity: isCompleted ? 0.55 : 1,
                                marginLeft: 6,
                              }}
                              disabled={isCompleted}
                              onClick={() => {
                                if (!isCompleted) handleOpenClinical(row);
                              }}
                            >
                              Complete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                {selectedPatient.profilePicture ? (
                  <img
                    src={selectedPatient.profilePicture}
                    alt={selectedPatient.name}
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #fff",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                ) : (
                  <AvatarPlaceholder name={selectedPatient.name} size={68} />
                )}
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
                    {selectedPatient.totalVisits !== undefined && (
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
                    navigate(
                      `/doctor/patient-profile/${selectedPatient.patient_id}`,
                    )
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
                  {[
                    {
                      icon: <FiCalendar />,
                      label: "Date",
                      value: selectedPatient.date,
                    },
                    {
                      icon: <FiClock />,
                      label: "Time",
                      value: selectedPatient.time,
                    },
                    {
                      icon: <FiFileText />,
                      label: "Visit Type",
                      value: selectedPatient.type,
                    },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className={styles.modalInfoItem}>
                      <div className={styles.modalInfoIcon}>{icon}</div>
                      <div>
                        <span className={styles.modalInfoLabel}>{label}</span>
                        <span className={styles.modalInfoValue}>{value}</span>
                      </div>
                    </div>
                  ))}
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
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#7341A8")}
                      onBlur={(e) => (e.target.style.borderColor = "#d8ccf0")}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "12px",
                    }}
                  >
                    <button
                      onClick={() => {
                        if (!selectedPatient?.appointmentId) {
                          alert("No appointment ID found for this patient.");
                          return;
                        }
                        setPendingSaveId(selectedPatient.appointmentId);
                        setShowConfirmModal(true);
                      }}
                      style={{
                        background: "#7341A8",
                        color: "#fff",
                        border: "none",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Save Progression Note
                    </button>
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
                              style={
                                selectedPatient.paymentStatus === "paid"
                                  ? {
                                      background: "#dcfce7",
                                      color: "#16a34a",
                                      border: "1px solid #bbf7d0",
                                      padding: "3px 10px",
                                      borderRadius: "20px",
                                      fontSize: "12px",
                                      fontWeight: 700,
                                    }
                                  : {
                                      background: "#fef9c3",
                                      color: "#b45309",
                                      border: "1px solid #fde68a",
                                      padding: "3px 10px",
                                      borderRadius: "20px",
                                      fontSize: "12px",
                                      fontWeight: 700,
                                    }
                              }
                            >
                              {selectedPatient.paymentStatus === "paid"
                                ? "Paid"
                                : selectedPatient.paymentStatus === "probono"
                                  ? "Pro Bono"
                                  : "Not Paid"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ✅ Payment proof — use resolved receiptUrl */}
                      <div className={styles.paymentProof}>
                        <span className={styles.paymentProofLabel}>
                          Payment Proof
                        </span>
                        {selectedPatient.receiptUrl ? (
                          <img
                            src={selectedPatient.receiptUrl}
                            alt="Payment Proof"
                            className={styles.paymentProofImg}
                            style={{
                              cursor: "zoom-in",
                              objectFit: "cover",
                              width: "100%",
                              height: "180px",
                              borderRadius: "10px",
                              border: "1px solid #e5e7eb",
                            }}
                            onClick={() =>
                              setZoomImage(selectedPatient.receiptUrl)
                            }
                            onError={(e) => {
                              console.error(
                                "❌ Image failed:",
                                selectedPatient.receiptUrl,
                              );
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              padding: "20px",
                              textAlign: "center",
                              color: "#aaa",
                              fontSize: "13px",
                              background: "#f9f9f9",
                              borderRadius: "8px",
                              border: "1px dashed #e5e7eb",
                            }}
                          >
                            No payment proof uploaded
                          </div>
                        )}
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
                  navigate(
                    `/doctor/patient-profile/${selectedPatient.patient_id}#appointment-history`,
                    { state: { patient: selectedPatient } },
                  )
                }
              >
                <FiFileText style={{ marginRight: "6px" }} /> View History
              </button>
              {(
                selectedPatient.raw_status ||
                selectedPatient.status ||
                ""
              ).toLowerCase() !== "completed" && (
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
                    opacity: 1,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setShowModal(false);
                    handleOpenClinical(selectedPatient);
                  }}
                >
                  <FiCheck size={15} /> Mark as Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zoom Image */}
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

      {/* ══════════════════════════════════════
          Clinical Notes / Complete Modal
      ══════════════════════════════════════ */}
      {showClinicalModal && (
        <CompleteAppointmentModal
          isOpen={showClinicalModal}
          onClose={() => {
            setShowClinicalModal(false);
            setClinicalModalPatient(null);
          }}
          appt={{
            appointment_id: clinicalModalPatient?.appointmentId,

            referenceNumber: clinicalModalPatient?.referenceNumber,
            patientName: clinicalModalPatient?.name,

            // ✅ Pass raw_date so CompleteAppointmentModal can parse it correctly
            appointmentDate: clinicalModalPatient?.appointmentDate,
            startTime: clinicalModalPatient?.startTime,
            endTime: clinicalModalPatient?.endTime,
            visitType: clinicalModalPatient?.visitType,

            serviceType: clinicalModalPatient?.serviceType,
            assessmentPurpose: clinicalModalPatient?.assessmentPurpose,
            reason: clinicalModalPatient?.reason,

            paymentStatus: clinicalModalPatient?.paymentStatus,

            // ✅ Pass receipt arrays so resolveReceiptUrl inside modal works
            receipt_urls: clinicalModalPatient?.receipt_urls ?? [],
            receipt_paths: clinicalModalPatient?.receipt_paths ?? [],
            // Also pass the already-resolved URL as fallback
            receiptUrl: clinicalModalPatient?.receiptUrl ?? null,
          }}
          onConfirm={() => {
            setPatientList((prev) =>
              prev.map((p) =>
                p.appointmentId === clinicalModalPatient?.appointmentId
                  ? { ...p, status: "Completed", raw_status: "completed" }
                  : p,
              ),
            );
            setShowClinicalModal(false);
            setClinicalModalPatient(null);
          }}
        />
      )}

      {/* Confirm Progression Note Save */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              width: "360px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#3b1f6e" }}>
              Confirm Save
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#6b7280",
                marginBottom: "20px",
              }}
            >
              Are you sure you want to save this progression note? This will be
              stored in the patient's appointment record.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!pendingSaveId) return;
                  setShowConfirmModal(false);
                  await handleSaveProgressionNote(pendingSaveId);
                  setPendingSaveId(null);
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#7341A8",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Yes, Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPatient;

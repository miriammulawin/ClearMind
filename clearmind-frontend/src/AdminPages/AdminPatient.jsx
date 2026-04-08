import { useState, useEffect, useCallback } from "react";
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
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

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
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedReschedule, setSelectedReschedule] = useState(null);
  const navigate = useNavigate();

  // ── Real data state ──
  const [patients, setPatients] = useState([]);
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const rowsPerPage = 4;

  // ─────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────

  const fetchPatients = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/admin/patients");
      if (!data.success) throw new Error("patients fetch failed");
      // Normalize API data to match the shape used in the UI
      const normalized = (Array.isArray(data.data) ? data.data : []).map(
        (p) => ({
          id: p.id,
          name: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
          date: p.lastAppointmentDate ?? "—",
          time: p.lastAppointmentTime ?? "—",
          type: p.lastVisitType ?? "—",
          status: p.lastAppointmentStatus ?? "Scheduled",
          contact: p.contactNo ?? "—",
          email: p.email ?? "—",
          address: p.address ?? "—",
          consultationMode: p.consultationMode ?? "On-Site",
          patientType: p.is_new ? "New Patient" : "Existing Patient",
          age: p.age ?? "—",
          gender: p.sex ? p.sex.charAt(0).toUpperCase() + p.sex.slice(1) : "—",
          totalVisits: p.totalVisits ?? 0,
          assignedDoctor: p.assignedDoctor ?? null,
          progressionNote: p.progressionNote ?? null,
        }),
      );
      setPatients(normalized);
    } catch (err) {
      console.error("fetchPatients:", err);
      toast.error("Failed to load patients");
      setPatients([]);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/admin/appointments");
      if (!data.success) throw new Error("appointments fetch failed");
      const all = Array.isArray(data.data) ? data.data : [];

      const normalize = (appt) => ({
        id: appt.id,
        name: appt.patient ?? appt.patientName ?? "Unknown",
        date: appt.appointment_date ?? appt.date ?? "—",
        time: appt.appointment_time ?? appt.time ?? "—",
        type: appt.visit_type ?? appt.type ?? "—",
        status: appt.status ?? "Scheduled",
        contact: appt.contact ?? appt.contactNo ?? "—",
        email: appt.email ?? "—",
        address: appt.address ?? "—",
        consultationMode:
          appt.type === "online" || appt.consultationMode === "Virtual"
            ? "Virtual"
            : "On-Site",
        patientType: appt.is_new ? "New Patient" : "Existing Patient",
        age: appt.age ?? "—",
        gender: appt.sex
          ? appt.sex.charAt(0).toUpperCase() + appt.sex.slice(1)
          : (appt.gender ?? "—"),
        totalVisits: appt.totalVisits ?? 0,
        assignedDoctor: appt.assignedDoctor ?? null,
        progressionNote: appt.progressionNote ?? null,
        cancellationReason:
          appt.cancellationReason ?? appt.cancellation_reason ?? null,
        reason: appt.reason ?? null,
        originalDate: appt.originalDate ?? appt.original_date ?? null,
        originalTime: appt.originalTime ?? appt.original_time ?? null,
        requestedDate: appt.requestedDate ?? appt.requested_date ?? null,
        requestedTime: appt.requestedTime ?? appt.requested_time ?? null,
      });

      // Split into tabs by status
      const scheduled = all
        .filter((a) => {
          const s = (a.status ?? "").toLowerCase();
          return s === "scheduled" || s === "confirmed" || s === "pending";
        })
        .map(normalize);

      const cancelled = all
        .filter((a) => (a.status ?? "").toLowerCase() === "cancelled")
        .map(normalize);

      const reschedule = all
        .filter(
          (a) =>
            (a.status ?? "").toLowerCase() === "reschedule_requested" ||
            a.reschedule_requested,
        )
        .map((a) => ({
          ...normalize(a),
          status: a.rescheduleStatus ?? "Pending",
        }));

      setConsultationRequests(scheduled);
      setCancelledAppointments(cancelled);
      setRescheduleRequests(reschedule);
    } catch (err) {
      console.error("fetchAppointments:", err);
      toast.error("Failed to load appointments");
    }
  }, []);

  // Also try dedicated reschedule endpoint if available
  const fetchRescheduleRequests = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/admin/reschedule-requests");
      if (!data.success) return; // silently skip if endpoint doesn't exist
      const normalized = (Array.isArray(data.data) ? data.data : []).map(
        (r) => ({
          id: r.id,
          name: r.patient ?? r.patientName ?? "Unknown",
          originalDate: r.originalDate ?? r.original_date ?? "—",
          originalTime: r.originalTime ?? r.original_time ?? "—",
          requestedDate: r.requestedDate ?? r.requested_date ?? "—",
          requestedTime: r.requestedTime ?? r.requested_time ?? "—",
          type: r.visit_type ?? r.type ?? "—",
          status: r.status ?? "Pending",
          reason: r.reason ?? "—",
          contact: r.contact ?? r.contactNo ?? "—",
          email: r.email ?? "—",
          address: r.address ?? "—",
          consultationMode:
            r.type === "online" || r.consultationMode === "Virtual"
              ? "Virtual"
              : "On-Site",
          patientType: r.is_new ? "New Patient" : "Existing Patient",
          age: r.age ?? "—",
          gender: r.sex
            ? r.sex.charAt(0).toUpperCase() + r.sex.slice(1)
            : (r.gender ?? "—"),
          totalVisits: r.totalVisits ?? 0,
        }),
      );
      if (normalized.length > 0) setRescheduleRequests(normalized);
    } catch {
      // endpoint may not exist yet — silently ignore
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchPatients(),
        fetchAppointments(),
        fetchRescheduleRequests(),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, [fetchPatients, fetchAppointments, fetchRescheduleRequests]);

  // ─────────────────────────────────────────────
  // RESCHEDULE ACTIONS (optimistic + API)
  // ─────────────────────────────────────────────

  const handleRescheduleAction = async (id, action) => {
    const newStatus = action === "approve" ? "Approved" : "Declined";
    // Optimistic UI update
    setRescheduleRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    );
    setShowRescheduleModal(false);
    try {
      await axiosClient.patch(`/admin/reschedule-requests/${id}`, {
        status: newStatus,
      });
      toast.success(`Request ${newStatus.toLowerCase()} successfully`);
    } catch (err) {
      console.error("reschedule action:", err);
      toast.error("Failed to update reschedule request");
      // Revert on failure
      setRescheduleRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Pending" } : r)),
      );
    }
  };

  // ─────────────────────────────────────────────
  // REFUND ACTION (optimistic + API)
  // ─────────────────────────────────────────────

  const handleRefundConfirm = async (id) => {
    setRefundProcessed((prev) => ({ ...prev, [id]: true }));
    setShowRefundModal(false);
    try {
      await axiosClient.patch(`/admin/appointments/${id}/refund`);
      toast.success("Refund processed successfully");
    } catch (err) {
      console.error("refund:", err);
      toast.error("Failed to process refund");
      setRefundProcessed((prev) => ({ ...prev, [id]: false }));
    }
  };

  // ─────────────────────────────────────────────
  // UI HANDLERS
  // ─────────────────────────────────────────────

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
            {/* ── Loading Banner ── */}
            {loading && (
              <div
                style={{
                  padding: "10px 16px",
                  background: "#f0ebf8",
                  color: "#4D227C",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                Loading patient data…
              </div>
            )}

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
                  {loading ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyRow}>
                        Loading…
                      </td>
                    </tr>
                  ) : displayedData.length === 0 ? (
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
                    {selectedPatient.totalVisits !== undefined && (
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

              {/* Cancellation Reason */}
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
                            <span className={styles.infoValue}>
                              {selectedPatient.paidAmount ?? "—"}
                            </span>
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
                            <span className={styles.infoValue}>
                              {selectedPatient.referenceNo ?? "—"}
                            </span>
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
                            <span className={styles.infoValue}>
                              {selectedPatient.paymentOption ?? "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.paymentProof}>
                        <span className={styles.paymentProofLabel}>
                          Payment Proof
                        </span>
                        <img
                          src={selectedPatient.paymentProof ?? samplePayment}
                          alt="Payment Proof"
                          className={styles.paymentProofImg}
                          onClick={() =>
                            setZoomImage(
                              selectedPatient.paymentProof ?? samplePayment,
                            )
                          }
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
                    {selectedReschedule.totalVisits !== undefined && (
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
                      {
                        state: { patient: selectedReschedule },
                      },
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
                  <span className={styles.refundGridItemValue}>
                    {selectedRefund.paidAmount ?? "—"}
                  </span>
                </div>
                <div className={styles.refundGridItem}>
                  <span className={styles.refundGridItemLabel}>
                    Reference No.
                  </span>
                  <span className={styles.refundGridItemValue}>
                    {selectedRefund.referenceNo ?? "—"}
                  </span>
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

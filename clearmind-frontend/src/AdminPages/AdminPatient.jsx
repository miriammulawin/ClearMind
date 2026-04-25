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
import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";
import { format } from "date-fns";

/* ─────────────────────────────────────────────────────────
   Receipt helper
───────────────────────────────────────────────────────── */
const STORAGE_BASE = "http://localhost:8000";

const toUrl = (path) => `${STORAGE_BASE}/storage/${path}`;

const getReceiptPaths = (obj) =>
  (Array.isArray(obj?.receipt_paths) && obj.receipt_paths.length > 0
    ? obj.receipt_paths
    : null) ?? (obj?.receipt_path ? [obj.receipt_path] : []);

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

const SectionHeader = ({ icon, title }) => (
  <div className={styles.cardSectionHeader}>
    <div className={styles.cardSectionIcon}>{icon}</div>
    <h4 className={styles.cardSectionTitle}>{title}</h4>
  </div>
);

/* ─────────────────────────────────────────────────────────
   Normalizers
───────────────────────────────────────────────────────── */
const normalizePatient = (p) => ({
  id: p.patient_id,
  name: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "—",
  firstName: p.firstName ?? "",
  lastName: p.lastName ?? "",
  middleInitial: p.middleInitial ?? "",
  contact: p.contactNo ?? "—",
  email: p.email ?? "—",
  address: p.address ?? "—",
  age: p.dob ? calcAge(p.dob) : "—",
  gender: p.sex ? capitalize(p.sex) : "—",
  civilStatus: p.civilStatus ?? "—",
  classification: p.patientClassification ?? "Regular",
  patientType: p.user_id ? "Existing Patient" : "New Patient",
  totalVisits: p.appointments_count ?? 0,
  is_active: p.is_active,
  date: p.last_appointment_date
    ? format(new Date(p.last_appointment_date), "MMMM dd, yyyy")
    : "—",
  time: p.last_appointment_time
    ? format(new Date(`1970-01-01T${p.last_appointment_time}`), "hh:mm a")
    : "—",
  type: p.last_visit_type ?? "—",
  status: p.last_status ?? "—",
  consultationMode: p.last_visit_type === "virtual" ? "Virtual" : "On-Site",
  assignedDoctor: p.assigned_doctor ?? null,
  progressionNote: p.progression_note ?? null,
});

const normalizeAppointment = (a) => {
  const patient = a.patient ?? {};
  const doctor = a.doctor ?? null;
  const name = patient.firstName
    ? `${patient.firstName}${patient.middleInitial ? " " + patient.middleInitial + "." : ""} ${patient.lastName}`
    : "Unknown";

  return {
    id: a.appointment_id,
    patientId: a.patient_id,
    name,
    contact: patient.contactNo ?? "—",
    email: patient.email ?? "—",
    address: patient.address ?? "—",
    age: patient.dob ? calcAge(patient.dob) : "—",
    gender: patient.sex ? capitalize(patient.sex) : "—",
    patientType: patient.user_id ? "Existing Patient" : "New Patient",
    classification: patient.patientClassification ?? "Regular",
    date: a.appointment_date
      ? format(new Date(a.appointment_date), "MMMM dd, yyyy")
      : "—",
    time: a.start_time
      ? format(new Date(`1970-01-01T${a.start_time}`), "hh:mm a")
      : "—",
    endTime: a.end_time ?? "—",
    type: a.visit_type ?? "—",
    status: capitalize(a.status ?? "pending"),
    consultationMode: a.visit_type === "virtual" ? "Virtual" : "On-Site",
    reason: a.reason_for_consultation ?? "—",
    serviceType: a.service_type ?? "—",
    paePurpose: a.pae_purpose ?? null,
    paymentStatus: a.payment_status ?? "—",
    receiptPath: a.receipt_path ?? null,
    receipt_paths: a.receipt_paths ?? null,
    informantName: a.informant_name ?? null,
    informantRelation: a.informant_relation ?? null,
    cancellationReason: a.notes ?? null,
    assignedDoctor: doctor
      ? {
          name: `${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialty ?? "",
        }
      : null,
    progressionNote: null,
    totalVisits: 0,
  };
};

function calcAge(dob) {
  if (!dob) return "—";
  const b = new Date(dob);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a >= 0 ? `${a}` : "—";
}

function capitalize(str) {
  if (!str) return "—";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
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

  const [patients, setPatients] = useState([]);
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const rowsPerPage = 4;

  /* ══════════════════════════════════════════════════════
     DATA FETCHING
  ══════════════════════════════════════════════════════ */
  const fetchPatients = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/admin/patients", {
        params: { per_page: 100 },
      });
      const rows = Array.isArray(data.data) ? data.data : [];
      setPatients(rows.map(normalizePatient));
    } catch (err) {
      console.error("fetchPatients:", err);
      toast.error("Failed to load patients");
      setPatients([]);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/admin/appointments");
      const all = Array.isArray(data.data) ? data.data : [];
      const normalized = all.map(normalizeAppointment);

      setConsultationRequests(
        normalized.filter((a) => (a.status ?? "").toLowerCase() === "pending"),
      );
      setConfirmedAppointments(
        normalized.filter(
          (a) => (a.status ?? "").toLowerCase() === "confirmed",
        ),
      );
      setCancelledAppointments(
        normalized.filter(
          (a) => (a.status ?? "").toLowerCase() === "cancelled",
        ),
      );
      setRescheduleRequests(
        normalized.filter(
          (a) => (a.status ?? "").toLowerCase() === "reschedule_requested",
        ),
      );
    } catch (err) {
      console.error("fetchAppointments:", err);
      toast.error("Failed to load appointments");
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchPatients(), fetchAppointments()]);
      setLoading(false);
    };
    load();
  }, [fetchPatients, fetchAppointments]);

  /* ══════════════════════════════════════════════════════
     ACTIONS
  ══════════════════════════════════════════════════════ */
  const handleConfirmAppointment = async (id) => {
    try {
      await axiosClient.put(`/admin/appointments/${id}`, {
        status: "confirmed",
      });
      toast.success("Appointment confirmed");
      const appt = consultationRequests.find((a) => a.id === id);
      if (appt) {
        setConsultationRequests((prev) => prev.filter((a) => a.id !== id));
        setConfirmedAppointments((prev) => [
          ...prev,
          { ...appt, status: "Confirmed" },
        ]);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to confirm appointment");
    }
  };

  const handleRescheduleAction = async (id, action) => {
    const newStatus = action === "approve" ? "confirmed" : "cancelled";
    setRescheduleRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: capitalize(newStatus) } : r,
      ),
    );
    setShowRescheduleModal(false);
    try {
      await axiosClient.put(`/admin/appointments/${id}`, { status: newStatus });
      toast.success(`Request ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update reschedule request");
      fetchAppointments();
    }
  };

  const handleRefundConfirm = async (id) => {
    setRefundProcessed((prev) => ({ ...prev, [id]: true }));
    setShowRefundModal(false);
    try {
      await axiosClient.patch(`/admin/appointments/${id}/refund`);
      toast.success("Refund processed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process refund");
      setRefundProcessed((prev) => ({ ...prev, [id]: false }));
    }
  };

  /* ══════════════════════════════════════════════════════
     UI HELPERS
  ══════════════════════════════════════════════════════ */
  const rawData =
    activeTab === "consultation"
      ? consultationRequests
      : activeTab === "confirmed"
        ? confirmedAppointments
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
      confirmed: {
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      },
      scheduled: {
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      },
      pending: {
        background: "#fef9c3",
        color: "#b45309",
        border: "1px solid #fde68a",
      },
      cancelled: {
        background: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      },
    })[(s ?? "").toLowerCase()] || {
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

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className={`admin-content ${styles.patientPage}`}>
          <div className={styles.patientCard}>
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
                Loading data…
              </div>
            )}

            {/* ── Tabs + Filter ── */}
            <div className={styles.patientTabsRow}>
              <div className={styles.patientTabs}>
                <button
                  className={`${styles.tabBtn} ${activeTab === "patients" ? styles.tabActive : ""}`}
                  onClick={() => handleTabChange("patients")}
                >
                  Total Patients <span>{patients.length}</span>
                </button>

                <button
                  className={`${styles.tabBtn} ${activeTab === "confirmed" ? styles.tabActive : ""}`}
                  onClick={() => handleTabChange("confirmed")}
                >
                  Total Appointments <span>{confirmedAppointments.length}</span>
                </button>

                <button
                  className={`${styles.tabBtn} ${activeTab === "consultation" ? styles.tabActive : ""}`}
                  onClick={() => handleTabChange("consultation")}
                >
                  Consultation Requests{" "}
                  <span
                    className={
                      consultationRequests.length > 0
                        ? styles.tabBadgePending
                        : ""
                    }
                  >
                    {consultationRequests.length}
                  </span>
                </button>

                <button
                  className={`${styles.tabBtn} ${activeTab === "reschedule" ? styles.tabActive : ""}`}
                  onClick={() => handleTabChange("reschedule")}
                >
                  Reschedule Requests{" "}
                  <span
                    className={
                      rescheduleRequests.filter(
                        (r) => (r.status ?? "").toLowerCase() === "pending",
                      ).length > 0
                        ? styles.tabBadgePending
                        : ""
                    }
                  >
                    {
                      rescheduleRequests.filter(
                        (r) => (r.status ?? "").toLowerCase() === "pending",
                      ).length
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
                  {activeTab === "confirmed" ? (
                    <tr>
                      <th>Name</th>
                      <th>Patient Type</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Service</th>
                      <th>Mode</th>
                      <th>Doctor</th>
                      <th>Action</th>
                    </tr>
                  ) : activeTab === "reschedule" ? (
                    <tr>
                      <th>Name</th>
                      <th>Patient Type</th>
                      <th>Original Date & Time</th>
                      <th>Requested Date & Time</th>
                      <th>Visit Type</th>
                      <th>Mode</th>
                      <th>Action</th>
                    </tr>
                  ) : activeTab === "consultation" ? (
                    <tr>
                      <th>Name</th>
                      <th>Patient Type</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Service</th>
                      <th>Mode</th>
                      <th>Action</th>
                    </tr>
                  ) : activeTab === "cancelled" ? (
                    <tr>
                      <th>Name</th>
                      <th>Patient Type</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Visit Type</th>
                      <th>Mode</th>
                      <th>Action</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>Name</th>
                      <th>Patient Type</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Address</th>
                      <th>Classification</th>
                      <th>Action</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className={styles.emptyRow}>
                        Loading…
                      </td>
                    </tr>
                  ) : displayedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={styles.emptyRow}>
                        No{" "}
                        {patientTypeFilter !== "all" ? patientTypeFilter : ""}{" "}
                        records found.
                      </td>
                    </tr>
                  ) : activeTab === "confirmed" ? (
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
                        <td style={{ fontSize: "12px" }}>
                          {row.serviceType}
                          {row.paePurpose && (
                            <>
                              <br />
                              <small style={{ color: "#1d6fa4" }}>
                                {row.paePurpose}
                              </small>
                            </>
                          )}
                        </td>
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
                        <td style={{ fontSize: "12px" }}>
                          {row.assignedDoctor ? (
                            <span style={{ color: "#4D227C", fontWeight: 600 }}>
                              {row.assignedDoctor.name}
                            </span>
                          ) : (
                            <span style={{ color: "#aaa" }}>—</span>
                          )}
                        </td>
                        <td>
                          <button
                            className={styles.btnView}
                            onClick={() => handleView(row, "confirmed")}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
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
                            {row.date}
                          </span>
                          <br />
                          <small style={{ color: "#aaa" }}>{row.time}</small>
                        </td>
                        <td>
                          <span className={styles.dateRequested}>
                            {row.requestedDate ?? "—"}
                          </span>
                          <br />
                          <small style={{ color: "#4D227C", fontWeight: 600 }}>
                            {row.requestedTime ?? "—"}
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
                        <td style={{ fontSize: "12px" }}>
                          {row.serviceType}
                          {row.paePurpose && (
                            <>
                              <br />
                              <small style={{ color: "#1d6fa4" }}>
                                {row.paePurpose}
                              </small>
                            </>
                          )}
                        </td>
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
                            onClick={() => handleView(row, "consultation")}
                          >
                            View
                          </button>
                          <button
                            className={styles.btnConfirm}
                            disabled={
                              row.status === "Confirmed" ||
                              row.status === "Cancelled"
                            }
                            onClick={() => handleConfirmAppointment(row.id)}
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
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "3px 10px",
                              borderRadius: "20px",
                              background:
                                row.classification === "PWD"
                                  ? "#fef9c3"
                                  : row.classification === "Senior Citizen"
                                    ? "#dbeafe"
                                    : "#f3f4f6",
                              color:
                                row.classification === "PWD"
                                  ? "#b45309"
                                  : row.classification === "Senior Citizen"
                                    ? "#1d4ed8"
                                    : "#6b7280",
                            }}
                          >
                            {row.classification}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.btnView}
                            onClick={() => handleView(row, "patients")}
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

            {/* ── Header ── */}
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
                    <span className={styles.metaChip}>
                      {selectedPatient.classification}
                    </span>
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
                  <FiExternalLink style={{ marginRight: "6px" }} /> View Profile
                </button>
              </div>
            </div>

            {/* ── Body ── */}
            <div className={styles.modalBody}>

              {/* Appointment Details */}
              {(modalSource === "consultation" ||
                modalSource === "confirmed" ||
                modalSource === "cancelled") && (
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
                      <div className={styles.infoIcon}><FiCalendar /></div>
                      <div>
                        <span className={styles.infoLabel}>Date</span>
                        <span className={styles.infoValue}>{selectedPatient.date}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><FiClock /></div>
                      <div>
                        <span className={styles.infoLabel}>Time</span>
                        <span className={styles.infoValue}>
                          {selectedPatient.time}
                          {selectedPatient.endTime && ` – ${selectedPatient.endTime}`}
                        </span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><FiFileText /></div>
                      <div>
                        <span className={styles.infoLabel}>Service</span>
                        <span className={styles.infoValue}>
                          {selectedPatient.serviceType ?? selectedPatient.type}
                        </span>
                        {selectedPatient.paePurpose && (
                          <span style={{ fontSize: "11px", color: "#1d6fa4", display: "block" }}>
                            → {selectedPatient.paePurpose}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><FiUser /></div>
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
                        <span className={styles.infoValue}>{selectedPatient.patientType}</span>
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
                        <span className={styles.infoValue}>{selectedPatient.consultationMode}</span>
                      </div>
                    </div>
                    {selectedPatient.reason && (
                      <div className={styles.infoItem} style={{ gridColumn: "1/-1" }}>
                        <div className={styles.infoIcon}><FiFileText /></div>
                        <div>
                          <span className={styles.infoLabel}>Reason</span>
                          <span className={styles.infoValue}>{selectedPatient.reason}</span>
                        </div>
                      </div>
                    )}
                    {selectedPatient.informantName && (
                      <div className={styles.infoItem} style={{ gridColumn: "1/-1" }}>
                        <div className={styles.infoIcon}><FiUser /></div>
                        <div>
                          <span className={styles.infoLabel}>Informant</span>
                          <span className={styles.infoValue}>
                            {selectedPatient.informantName} ({selectedPatient.informantRelation})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assigned Doctor */}
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
                            background: "linear-gradient(135deg, #7341A8, #4D227C)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <FaUserMd size={18} color="#fff" />
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: 700, color: "#3b1f6e", margin: "0 0 2px 0" }}>
                            {selectedPatient.assignedDoctor.name}
                          </p>
                          <p style={{ fontSize: "12px", color: "#7341A8", margin: 0, fontStyle: "italic" }}>
                            {selectedPatient.assignedDoctor.specialization}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Patient Details (patients tab only) */}
              {modalSource === "patients" && (
                <div
                  className={styles.modalCard}
                  style={{ marginBottom: "12px" }}
                >
                  <SectionHeader
                    icon={<FiUser size={13} color="#fff" />}
                    title="Patient Details"
                  />
                  <div className={styles.twoCol}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><FiPhone /></div>
                      <div>
                        <span className={styles.infoLabel}>Contact</span>
                        <span className={styles.infoValue}>{selectedPatient.contact}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><FiUser /></div>
                      <div>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{selectedPatient.email}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><FiHome /></div>
                      <div>
                        <span className={styles.infoLabel}>Address</span>
                        <span className={styles.infoValue}>{selectedPatient.address}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><FiUser /></div>
                      <div>
                        <span className={styles.infoLabel}>Civil Status</span>
                        <span className={styles.infoValue}>{selectedPatient.civilStatus}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><FiCalendar /></div>
                      <div>
                        <span className={styles.infoLabel}>Classification</span>
                        <span className={styles.infoValue}>{selectedPatient.classification}</span>
                      </div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}><FiActivity /></div>
                      <div>
                        <span className={styles.infoLabel}>Total Visits</span>
                        <span className={styles.infoValue}>{selectedPatient.totalVisits}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancellation Reason */}
              {modalSource === "cancelled" && selectedPatient.cancellationReason && (
                <div
                  className={styles.modalCard}
                  style={{ marginBottom: "12px" }}
                >
                  <div className={styles.cancellationHeader}>
                    <div className={styles.cancellationIcon}>
                      <FiAlertCircle size={14} color="#fff" />
                    </div>
                    <h4 className={styles.cancellationTitle}>Cancellation Reason</h4>
                  </div>
                  <div className={styles.cancellationBox}>
                    <p className={styles.cancellationText}>
                      {selectedPatient.cancellationReason}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Details — hidden for patients tab */}
              {modalSource !== "patients" && (
                <div className={styles.modalCard}>
                  <button
                    className={styles.paymentToggle}
                    onClick={() => setPaymentOpen(!paymentOpen)}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className={styles.cardSectionIcon}>
                        <FiFileText size={13} color="#fff" />
                      </div>
                      <span className={styles.paymentToggleTitle}>Payment Details</span>
                    </span>
                    <span className={styles.paymentToggleIcon}>
                      {paymentOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
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
                              style={{ fontSize: 13, fontWeight: 700, color: "#888" }}
                            >
                              ₱
                            </div>
                            <div>
                              <span className={styles.infoLabel}>Payment Status</span>
                              <span className={styles.infoValue}>
                                {selectedPatient.paymentStatus
                                  ? selectedPatient.paymentStatus
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (c) => c.toUpperCase())
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Payment Proof Image — only shown if receipt exists */}
                        {getReceiptPaths(selectedPatient).length > 0 && (
                          <div className={styles.paymentProof}>
                            <span className={styles.paymentProofLabel}>Payment Proof</span>
                            <img
                              src={toUrl(getReceiptPaths(selectedPatient)[0])}
                              alt="Payment Proof"
                              className={styles.paymentProofImg}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = "none";
                              }}
                              onClick={() =>
                                setZoomImage(toUrl(getReceiptPaths(selectedPatient)[0]))
                              }
                            />
                          </div>
                        )}

                      </div>
                    </div>
                  )}
                </div>
              )}

            </div> {/* ── end modalBody ── */}

            {/* ── Footer ── */}
            <div className={styles.modalFooter}>
              <button
                className={styles.btnViewHistory}
                onClick={() =>
                  navigate(`/admin/patient-history/${selectedPatient.id}`, {
                    state: { patient: selectedPatient },
                  })
                }
              >
                <FiFileText style={{ marginRight: "6px" }} /> View History
              </button>
              {modalSource === "consultation" && (
                <button
                  className={styles.btnFooterConfirm}
                  disabled={
                    selectedPatient.status === "Confirmed" ||
                    selectedPatient.status === "Cancelled"
                  }
                  onClick={() => handleConfirmAppointment(selectedPatient.id)}
                >
                  <FiCheck size={15} /> Confirm
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
                    <span className={styles.metaChip}>
                      {selectedReschedule.patientType}
                    </span>
                  </div>
                </div>
                <button
                  className={styles.btnViewProfile}
                  onClick={() =>
                    navigate(`/admin/patient-profile/${selectedReschedule.id}`, {
                      state: { patient: selectedReschedule },
                    })
                  }
                >
                  <FiExternalLink style={{ marginRight: "6px" }} /> View Profile
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
                  title="Reschedule Details"
                />
                <div className={styles.twoCol}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}><FiCalendar /></div>
                    <div>
                      <span className={styles.infoLabel}>Original Date</span>
                      <span className={styles.infoValue}>{selectedReschedule.date}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}><FiClock /></div>
                    <div>
                      <span className={styles.infoLabel}>Original Time</span>
                      <span className={styles.infoValue}>{selectedReschedule.time}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon} style={{ color: "#4D227C" }}>
                      <FiCalendar />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Requested Date</span>
                      <span className={styles.infoValue} style={{ color: "#4D227C", fontWeight: 700 }}>
                        {selectedReschedule.requestedDate ?? "—"}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon} style={{ color: "#4D227C" }}>
                      <FiClock />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Requested Time</span>
                      <span className={styles.infoValue} style={{ color: "#4D227C", fontWeight: 700 }}>
                        {selectedReschedule.requestedTime ?? "—"}
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
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                    Status:
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
                  <p style={{ fontSize: "13.5px", color: "#374151", margin: 0, lineHeight: "1.75" }}>
                    {selectedReschedule.reason}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnDecline}
                disabled={selectedReschedule.status !== "Pending"}
                onClick={() => handleRescheduleAction(selectedReschedule.id, "decline")}
              >
                <FiXCircle style={{ marginRight: "6px" }} /> Decline
              </button>
              <button
                className={styles.btnFooterConfirm}
                disabled={selectedReschedule.status !== "Pending"}
                onClick={() => handleRescheduleAction(selectedReschedule.id, "approve")}
              >
                <FiCheck size={15} /> Approve
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
                  {selectedRefund.date} · {selectedRefund.time} · {selectedRefund.type}
                </p>
              </div>
              <div className={styles.refundGrid}>
                <div className={styles.refundGridItem}>
                  <span className={styles.refundGridItemLabel}>Payment Status</span>
                  <span className={styles.refundGridItemValue}>
                    {selectedRefund.paymentStatus
                      ? selectedRefund.paymentStatus
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())
                      : "—"}
                  </span>
                </div>
              </div>
              <p className={styles.refundWarning}>
                ⚠️ Confirming this will mark the payment as refunded. This action cannot be undone.
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
import { useState, useEffect, useCallback } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminDashboard.module.css";
import { FaClinicMedical, FaBullhorn, FaTrash, FaEdit } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import {
  FiX,
  FiMessageSquare,
  FiFlag,
  FiEye,
  FiAlertTriangle,
} from "react-icons/fi";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels,
);

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */

const REFRESH_MS = 60_000;

/* ─── Toast Styles ─── */
const toastSuccess = {
  duration: 1500,
  style: {
    background: "#E2F7E3",
    border: "1px solid #91C793",
    color: "#2E7D32",
    fontWeight: 600,
    fontSize: "0.95rem",
    textAlign: "center",
    maxWidth: "320px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
  },
  iconTheme: { primary: "#2E7D32", secondary: "#E2F7E3" },
};

const toastError = {
  duration: 1500,
  style: {
    background: "#FDECEA",
    border: "1px solid #F5C6CB",
    color: "#C62828",
    fontWeight: 600,
    fontSize: "0.9rem",
    textAlign: "center",
    maxWidth: "320px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
  },
  iconTheme: { primary: "#C62828", secondary: "#FDECEA" },
};

const audienceMeta = {
  all: {
    label: "Everyone",
    color: "#4D227C",
    bg: "#f0ebf8",
    border: "#d8cce8",
  },
  clients: {
    label: "Clients Only",
    color: "#1E3A8A",
    bg: "#DBEAFE",
    border: "#BFDBFE",
  },
  doctors: {
    label: "Doctors Only",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
  },
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function calcAge(dob) {
  if (!dob) return null;
  const b = new Date(dob);
  const t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
  return a >= 0 ? a : null;
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "—";
}

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Normalize a Patient record from GET /admin/patients
 */
function normalizePatient(p) {
  return {
    id: p.patient_id,
    firstName: p.firstName ?? "",
    lastName: p.lastName ?? "",
    name: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "—",
    sex: p.sex ?? null,
    genderIdentity: p.genderIdentity ?? null,
    email: p.email ?? "—",
    contactNo: p.contactNo ?? "—",
    address: p.address ?? "—",
    dob: p.dob ?? null,
    age: p.dob ? calcAge(p.dob) : null,
    is_active: p.is_active ?? true,
    classification: p.patientClassification ?? "Regular",
    patientType: p.user_id ? "Existing Patient" : "New Patient",
  };
}

/**
 * Normalize an Appointment record from GET /admin/appointments
 * rawDate preserves the original "YYYY-MM-DD" string for reliable
 * today-filtering without any timezone conversion issues.
 */
function normalizeAppointment(a) {
  const patient = a.patient ?? {};
  const doctor = a.doctor ?? null;
  const patientName = patient.firstName
    ? `${patient.firstName}${patient.middleInitial ? " " + patient.middleInitial + "." : ""} ${patient.lastName}`
    : "Unknown";

  return {
    id: a.appointment_id,
    patient: patientName,
    rawDate: a.appointment_date ?? null, // "YYYY-MM-DD" — used for today filter & monthly chart
    date: formatDate(a.appointment_date),
    time: formatTime(a.start_time),
    endTime: a.end_time ? formatTime(a.end_time) : null,
    visitType: a.visit_type ?? "—",
    status: capitalize(a.status ?? "pending"),
    service: a.service_type ?? "—",
    paePurpose: a.pae_purpose ?? null,
    payment: a.payment_status ?? "—",
    doctor: doctor ? `${doctor.firstName} ${doctor.lastName}` : null,
  };
}

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [today, setToday] = useState(new Date());

  /* ── Stats (derived from patients + appointments) ── */
  const [activePatients, setActivePatients] = useState(0);
  const [inactivePatients, setInactivePatients] = useState(0);
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));

  /* ── Today's appointments (Confirmed only) ── */
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayOnline, setTodayOnline] = useState(0);
  const [todayPhysical, setTodayPhysical] = useState(0);

  /* ── Pending consultation requests ── */
  const [totalPendingRequests, setTotalPendingRequests] = useState(0);
  const [pendingAppointments, setPendingAppointments] = useState([]);

  /* ── Patients table ── */
  const [patients, setPatients] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  /* ── Search / filter ── */
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PATIENTS_PER_PAGE = 10;

  /* ── Announcements ── */
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "normal",
    audience: "all",
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  const openConfirmModal = (message, onConfirm) => {
    setConfirmMessage(message);
    setConfirmAction(() => onConfirm);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) confirmAction();
    setShowConfirmModal(false);
  };

  /* ══════════════════════════════════════════════
     DATA FETCHING
  ══════════════════════════════════════════════ */

  /**
   * GET /admin/patients?per_page=200
   * Derives active/inactive counts for the Pie chart.
   */
  const fetchPatients = useCallback(async () => {
    try {
      setTableLoading(true);
      const { data } = await axiosClient.get("/admin/patients", {
        params: { per_page: 200 },
      });
      const rows = (Array.isArray(data.data) ? data.data : []).map(
        normalizePatient,
      );
      setPatients(rows);

      // Always derive counts so the Pie chart is always accurate
      setActivePatients(rows.filter((p) => p.is_active).length);
      setInactivePatients(rows.filter((p) => !p.is_active).length);
    } catch (err) {
      console.error("fetchPatients:", err);
      toast.error("Failed to load patients", toastError);
      setPatients([]);
    } finally {
      setTableLoading(false);
    }
  }, []);

  /**
   * GET /admin/appointments
   * Today counts only include appointments with status "Confirmed".
   * Uses rawDate ("YYYY-MM-DD") for reliable today comparison —
   * avoids timezone issues that occur when re-parsing a formatted date string.
   */
  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/admin/appointments");
      const all = (Array.isArray(data.data) ? data.data : []).map(
        normalizeAppointment,
      );

      // Build today string in local time as "YYYY-MM-DD"
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      // Today's CONFIRMED appointments only
      const todays = all.filter(
        (a) =>
          a.rawDate &&
          a.rawDate.slice(0, 10) === todayStr &&
          ["confirmed", "Confirmed"].includes(a.status),
      );
      setTodayTotal(todays.length);
      setTodayOnline(todays.filter((a) => a.visitType === "virtual").length);
      setTodayPhysical(todays.filter((a) => a.visitType === "onsite").length);

      // Pending consultations widget (all dates, pending status)
      const pending = all.filter((a) =>
        ["pending", "Pending"].includes(a.status),
      );
      setPendingAppointments(pending);
      setTotalPendingRequests(pending.length);

      // Monthly data for Bar chart — all statuses, use rawDate
      const monthly = Array(12).fill(0);
      all.forEach((a) => {
        if (!a.rawDate) return;
        const m = new Date(a.rawDate).getMonth(); // 0-based
        if (m >= 0 && m < 12) monthly[m]++;
      });
      setMonthlyData(monthly);
    } catch (err) {
      console.error("fetchAppointments:", err);
      toast.error("Failed to load appointments", toastError);
    }
  }, []);

  /**
   * GET /admin/announcements
   */
  const fetchAnnouncements = useCallback(async () => {
    try {
      setAnnouncementsLoading(true);
      const { data } = await axiosClient.get("/admin/announcements");
      setAnnouncements(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("fetchAnnouncements:", err);
      toast.error("Failed to load announcements", toastError);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  /* Initial load + periodic refresh */
  useEffect(() => {
    fetchPatients();
    fetchAppointments();
    fetchAnnouncements();

    const interval = setInterval(() => {
      fetchPatients();
      fetchAppointments();
    }, REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchPatients, fetchAppointments, fetchAnnouncements]);

  /* Clock tick */
  useEffect(() => {
    const t = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  /* ══════════════════════════════════════════════
     FILTER + PAGINATION
  ══════════════════════════════════════════════ */

  const filteredPatients = patients.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      p.firstName?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.contactNo?.includes(searchTerm);
    const matchGender = !genderFilter || p.sex === genderFilter;
    const matchStatus =
      !statusFilter ||
      (statusFilter === "active" && p.is_active) ||
      (statusFilter === "inactive" && !p.is_active);
    return matchSearch && matchGender && matchStatus;
  });

  const totalPages = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * PATIENTS_PER_PAGE,
    currentPage * PATIENTS_PER_PAGE,
  );

  /* ══════════════════════════════════════════════
     ANNOUNCEMENT ACTIONS
  ══════════════════════════════════════════════ */

  const openAddModal = () => {
    setForm({ title: "", message: "", priority: "normal", audience: "all" });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (ann) => {
    setForm({
      title: ann.title,
      message: ann.message,
      priority: ann.priority,
      audience: ann.audience ?? "all",
    });
    setEditingId(ann.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    try {
      setSaving(true);
      if (editingId) {
        const { data } = await axiosClient.put(
          `/admin/announcements/${editingId}`,
          form,
        );
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingId ? (data.data ?? data) : a)),
        );
        toast.success("Announcement updated!", toastSuccess);
      } else {
        const { data } = await axiosClient.post("/admin/announcements", form);
        setAnnouncements((prev) => [data.data ?? data, ...prev]);
        toast.success("Announcement posted!", toastSuccess);
      }
      setShowModal(false);
    } catch (err) {
      console.error("handleSave:", err);
      toast.error(
        err.response?.data?.message ?? "Failed to save announcement",
        toastError,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    openConfirmModal("Delete this announcement?", async () => {
      try {
        await axiosClient.delete(`/admin/announcements/${id}`);
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        toast.success("Announcement deleted.", toastSuccess);
      } catch (err) {
        console.error("handleDelete:", err);
        toast.error("Failed to delete announcement", toastError);
      }
    });
  };

  /* ══════════════════════════════════════════════
     CHART CONFIG
  ══════════════════════════════════════════════ */

  const barData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Monthly Appointments",
        data: monthlyData,
        backgroundColor: "#4D227C",
        borderRadius: 6,
        barThickness: 35,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: "#ffffff9c",
        anchor: "center",
        align: "center",
        font: { family: "Poppins, sans-serif", size: 10 },
        formatter: (v) => (v > 0 ? v : ""),
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#574a65",
          font: { family: "Poppins, sans-serif", size: 12 },
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#574a65",
          font: { family: "Poppins, sans-serif", size: 12 },
        },
      },
    },
  };

  const pieData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        label: "Patient Status",
        data: [activePatients, inactivePatients],
        backgroundColor: ["#52a1ec", "#EF5350"],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    hoverOffset: 12,
    plugins: {
      legend: {
        position: window.innerWidth < 768 ? "bottom" : "right",
        labels: {
          boxWidth: 14,
          boxHeight: 14,
          padding: 10,
          color: "#4E237C",
          font: {
            family: "Poppins, sans-serif",
            size: window.innerWidth < 768 ? 12 : 16,
            weight: "500",
          },
          usePointStyle: true,
        },
      },
      datalabels: {
        color: "#ffffff",
        font: { family: "Poppins, sans-serif", size: 14 },
      },
      tooltip: {
        bodyFont: { family: "Poppins, sans-serif" },
        titleFont: { family: "Poppins, sans-serif", weight: "900" },
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}` },
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: window.innerWidth < 768 ? 10 : 60,
      },
    },
    cutout: "0%",
  };

  /* ══════════════════════════════════════════════
     UI helpers
  ══════════════════════════════════════════════ */
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const getStatusColor = (isActive) => (isActive ? "#1E3A8A" : "#808080");
  const getStatusLabel = (isActive) => (isActive ? "Active" : "Inactive");

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className={`admin-content ${styles.adminContent}`}>
          <div className={`container-fluid ${styles.containerFluid}`}>
            <div className="row g-4">
              {/* ── Announcements ── */}
              <div className="col-12">
                <div
                  className={`${styles.dashboardCard} ${styles.announcementCard}`}
                >
                  <div className={styles.cardHeader}>
                    <h5 className={styles.announcementTitle}>
                      <FaBullhorn className={styles.announceIcon} />{" "}
                      Announcements
                    </h5>
                    <button
                      className={styles.btnPostAnnounce}
                      onClick={openAddModal}
                    >
                      + Create Announcement
                    </button>
                  </div>

                  {showConfirmModal && (
                    <div
                      className={styles.logoutOverlay}
                      onClick={(e) => {
                        if (e.target === e.currentTarget)
                          setShowConfirmModal(false);
                      }}
                    >
                      <div className={styles.logoutModal}>
                        {/* Icon */}
                        <div className={styles.logoutIconWrap}>
                          <FiAlertTriangle className={styles.logoutIcon} />
                        </div>

                        {/* Content */}
                        <div className={styles.logoutContent}>
                          <h2 className={styles.logoutTitle}>Confirm Action</h2>
                          <p className={styles.logoutDesc}>{confirmMessage}</p>
                        </div>

                        {/* Actions */}
                        <div className={styles.logoutActions}>
                          <button
                            className={styles.cancelBtn}
                            onClick={() => setShowConfirmModal(false)}
                          >
                            Cancel
                          </button>

                          <button
                            className={styles.confirmBtn}
                            onClick={handleConfirm}
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {announcementsLoading ? (
                    <div className={styles.noAnnounce}>
                      Loading announcements…
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className={styles.noAnnounce}>
                      No announcements yet.
                    </div>
                  ) : (
                    <div className={styles.announceList}>
                      {announcements.map((ann) => {
                        const meta = audienceMeta[ann.audience ?? "all"];
                        return (
                          <div
                            key={ann.id}
                            className={`${styles.announceItem} ${ann.priority === "high" ? styles.announceHigh : styles.announceNormal}`}
                          >
                            <div className={styles.announceLeft}>
                              <div className={styles.announceItemHeader}>
                                {ann.priority === "high" && (
                                  <span className={styles.priorityBadge}>
                                    Urgent
                                  </span>
                                )}
                                <strong className={styles.announceItemTitle}>
                                  {ann.title}
                                </strong>
                              </div>
                              <p className={styles.announceMessage}>
                                {ann.message}
                              </p>
                              <div className={styles.announceMeta}>
                                <small className={styles.announceDate}>
                                  Posted:{" "}
                                  {ann.created_at
                                    ? new Date(
                                        ann.created_at,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "2-digit",
                                        year: "numeric",
                                      })
                                    : ann.date}
                                </small>
                                <span
                                  className={styles.audienceBadge}
                                  style={{
                                    color: meta.color,
                                    backgroundColor: meta.bg,
                                    border: `1px solid ${meta.border}`,
                                  }}
                                >
                                  {meta.label}
                                </span>
                              </div>
                            </div>
                            <div className={styles.announceActions}>
                              <button
                                className={`${styles.annBtn} ${styles.annEdit}`}
                                onClick={() => openEditModal(ann)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className={`${styles.annBtn} ${styles.annDelete}`}
                                onClick={() => handleDelete(ann.id)}
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Today's Appointments ── */}
              <div className="col-md-6">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>Today's Appointments</h5>
                    <div className={styles.cardDate}>
                      {formattedDate} <span>{todayTotal}</span>
                    </div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    <div className={styles.appointmentItems}>
                      <div className={styles.appointmentIconText}>
                        <IoVideocam className={styles.appointmentIcon} />
                        <strong>Virtual</strong>
                      </div>
                      <p>
                        {todayOnline} Appointment{todayOnline !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className={styles.appointmentItems}>
                      <div className={styles.appointmentIconText}>
                        <FaClinicMedical className={styles.appointmentIcon} />
                        <strong>On-Site</strong>
                      </div>
                      <p>
                        {todayPhysical} Appointment
                        {todayPhysical !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Pending Consultation Requests ── */}
              <div className="col-md-6">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>Pending Consultations</h5>
                    <div className={styles.cardDate}>
                      {formattedDate} <span>{totalPendingRequests}</span>
                    </div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    {pendingAppointments.length === 0 ? (
                      <p className={styles.noData}>No pending consultations</p>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "13px",
                            fontFamily: "inherit",
                          }}
                        >
                          <tbody>
                            {pendingAppointments
                              .slice(0, 5)
                              .map((appt, idx) => (
                                <tr
                                  key={appt.id}
                                  style={{
                                    backgroundColor:
                                      idx % 2 === 0 ? "#ffffff" : "#faf7ff",
                                    transition: "background 0.15s",
                                    cursor: "default",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "#f0ebf8")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      idx % 2 === 0 ? "#ffffff" : "#faf7ff")
                                  }
                                >
                                  {/* Patient name */}
                                  <td
                                    style={{
                                      padding: "10px 12px",
                                      borderBottom: "1px solid #ede8f5",
                                      borderRight: "1px solid #ede8f5",
                                      fontWeight: "600",
                                      color: "#2d1254",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: "26px",
                                          height: "26px",
                                          borderRadius: "50%",
                                          backgroundColor: "#4D227C",
                                          color: "#fff",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: "10px",
                                          fontWeight: "700",
                                          flexShrink: 0,
                                        }}
                                      >
                                        {(appt.patient || "?")
                                          .split(" ")
                                          .map((n) => n[0])
                                          .slice(0, 2)
                                          .join("")
                                          .toUpperCase()}
                                      </div>
                                      <span style={{ fontSize: "13px" }}>
                                        {appt.patient}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Service */}
                                  <td
                                    style={{
                                      padding: "10px 12px",
                                      borderBottom: "1px solid #ede8f5",
                                      borderRight: "1px solid #ede8f5",
                                      color: "#555",
                                      maxWidth: "160px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        color: "#374151",
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {appt.service !== "—" ? (
                                        appt.service
                                      ) : (
                                        <span style={{ color: "#bbb" }}>—</span>
                                      )}
                                    </div>
                                    {appt.paePurpose && (
                                      <div
                                        style={{
                                          fontSize: "11px",
                                          color: "#1d6fa4",
                                          marginTop: "2px",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        → {appt.paePurpose}
                                      </div>
                                    )}
                                  </td>

                                  {/* Date badge */}
                                  <td
                                    style={{
                                      padding: "10px 12px",
                                      borderBottom: "1px solid #ede8f5",
                                      textAlign: "center",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    <span
                                      style={{
                                        display: "inline-block",
                                        padding: "3px 10px",
                                        borderRadius: "20px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        backgroundColor: "#fef9c3",
                                        color: "#b45309",
                                        border: "1px solid #fde68a",
                                      }}
                                    >
                                      {appt.date}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        {pendingAppointments.length > 5 && (
                          <div
                            style={{
                              padding: "8px 12px",
                              borderTop: "1px solid #ede8f5",
                              fontSize: "12px",
                              color: "#7c3aed",
                              fontWeight: "600",
                              textAlign: "center",
                              background: "#faf7ff",
                              borderRadius: "0 0 8px 8px",
                            }}
                          >
                            +{pendingAppointments.length - 5} more pending
                            consultations
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Patients Table ── */}
            <div className="row g-4 mt-0">
              <div className="col-12">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>All Patients</h5>
                    <div className={styles.cardDate}>
                      <span>{patients.length}</span>
                    </div>
                  </div>
                  <hr />
                  <div className={styles.filterSection}>
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    <select
                      className={styles.filterSelect}
                      value={genderFilter}
                      onChange={(e) => {
                        setGenderFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Sexes</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      className={styles.filterSelect}
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div
                    className={`${styles.cardBody} ${styles.tableResponsive}`}
                  >
                    {tableLoading ? (
                      <div className={styles.loadingState}>
                        <p>Loading patients…</p>
                      </div>
                    ) : paginatedPatients.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p>
                          {filteredPatients.length === 0
                            ? "No patients found"
                            : "No data to display"}
                        </p>
                      </div>
                    ) : (
                      <table className={styles.patientsTable}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Sex</th>
                            <th>Gender Identity</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Classification</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedPatients.map((p) => (
                            <tr key={p.id}>
                              <td>
                                <strong>
                                  {p.firstName} {p.lastName}
                                </strong>
                              </td>
                              <td>{p.sex ? capitalize(p.sex) : "—"}</td>
                              <td>
                                {p.genderIdentity
                                  ? p.genderIdentity
                                      .split("_")
                                      .map((w) => capitalize(w))
                                      .join(" ")
                                  : "—"}
                              </td>
                              <td>{p.email}</td>
                              <td>{p.contactNo}</td>
                              <td>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    padding: "2px 8px",
                                    borderRadius: "20px",
                                    background:
                                      p.classification === "PWD"
                                        ? "#fef9c3"
                                        : p.classification === "Senior Citizen"
                                          ? "#dbeafe"
                                          : "#f3f4f6",
                                    color:
                                      p.classification === "PWD"
                                        ? "#b45309"
                                        : p.classification === "Senior Citizen"
                                          ? "#1d4ed8"
                                          : "#6b7280",
                                  }}
                                >
                                  {p.classification}
                                </span>
                              </td>
                              <td
                                style={{
                                  color: getStatusColor(p.is_active),
                                  fontWeight: "bold",
                                }}
                              >
                                {getStatusLabel(p.is_active)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {!tableLoading && totalPages > 1 && (
                    <div className={styles.tablePagination}>
                      <span>
                        Page {currentPage} of {totalPages} (
                        {filteredPatients.length} results)
                      </span>
                      <div className={styles.paginationButtons}>
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          {"< Previous"}
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }).map(
                          (_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className={
                                currentPage === i + 1 ? styles.activePage : ""
                              }
                            >
                              {i + 1}
                            </button>
                          ),
                        )}
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          {"Next >"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Charts ── */}
            <div className="row g-4 mt-0">
              <div className="col-md-6">
                <div className={styles.dashboardCard}>
                  <h5>Monthly Appointments</h5>
                  <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: "900px", height: "300px" }}>
                      <Bar data={barData} options={barOptions} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.dashboardCard}>
                  <h5>Patient Status Distribution</h5>
                  <div className={styles.pieChartContainer}>
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          ANNOUNCEMENT MODAL
      ════════════════════════════════════════ */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modalLg} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalProfileHeader}>
              <button
                className={styles.profileCloseBtn}
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
              <div className={styles.modalProfileRow}>
                <div className={styles.iconBubble}>
                  <FaBullhorn size={20} color="#fff" />
                </div>
                <div>
                  <h3 className={styles.modalProfileName}>
                    {editingId ? "Edit Announcement" : "Create Announcement"}
                  </h3>
                  <p className={styles.modalProfileContact}>{formattedDate}</p>
                </div>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalContentCard}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    <FiMessageSquare size={11} style={{ marginRight: 5 }} />
                    Title
                  </label>
                  <input
                    type="text"
                    className={styles.fieldInput}
                    placeholder="Enter announcement title..."
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Message</label>
                  <textarea
                    className={styles.fieldTextarea}
                    placeholder="Write your announcement here..."
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className={styles.modalDivider} />
                <div className={styles.fieldRowTwo}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      <FiFlag size={11} style={{ marginRight: 5 }} />
                      Priority
                    </label>
                    <div className={styles.priorityToggle}>
                      {[
                        {
                          value: "normal",
                          label: "Normal",
                          color: "#4D227C",
                          bg: "#f0ebf8",
                          border: "#d8cce8",
                        },
                        {
                          value: "high",
                          label: "Urgent",
                          color: "#dc2626",
                          bg: "#fff0f0",
                          border: "#fecaca",
                        },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`${styles.priorityToggleBtn} ${form.priority === opt.value ? styles.priorityToggleActive : ""}`}
                          style={
                            form.priority === opt.value
                              ? {
                                  background: opt.bg,
                                  borderColor: opt.color,
                                  color: opt.color,
                                }
                              : {}
                          }
                          onClick={() =>
                            setForm({ ...form, priority: opt.value })
                          }
                        >
                          {opt.value === "high" && (
                            <span className={styles.urgentDot} />
                          )}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      <FiEye size={11} style={{ marginRight: 5 }} />
                      Visible To
                    </label>
                    <div className={styles.audienceSelectWrapper}>
                      <select
                        className={styles.audienceSelect}
                        value={form.audience}
                        onChange={(e) =>
                          setForm({ ...form, audience: e.target.value })
                        }
                        style={{
                          borderColor: audienceMeta[form.audience]?.color,
                          color: audienceMeta[form.audience]?.color,
                          backgroundColor: audienceMeta[form.audience]?.bg,
                        }}
                      >
                        <option value="all">Everyone</option>
                        <option value="clients">Clients Only</option>
                        <option value="doctors">Doctors Only</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancel}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.btnSave}
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.message.trim()}
              >
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Save Changes"
                    : "Post Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

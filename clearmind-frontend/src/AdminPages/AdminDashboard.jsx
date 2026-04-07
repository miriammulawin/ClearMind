import { useState, useEffect, useCallback } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminDashboard.module.css";
import { FaClinicMedical, FaBullhorn, FaTrash, FaEdit } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import { FiX, FiMessageSquare, FiFlag, FiEye } from "react-icons/fi";
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

const urgencyColor = {
  emergency: "#DC2626",
  high:      "#EA580C",
  normal:    "#1E3A8A",
  low:       "#16A34A",
};

const REFRESH_INTERVAL_MS = 60_000;

const audienceMeta = {
  all: {
    label:  "Everyone",
    color:  "#4D227C",
    bg:     "#f0ebf8",
    border: "#d8cce8",
  },
  clients: {
    label:  "Clients Only",
    color:  "#1E3A8A",
    bg:     "#DBEAFE",
    border: "#BFDBFE",
  },
  doctors: {
    label:  "Doctors Only",
    color:  "#065F46",
    bg:     "#D1FAE5",
    border: "#6EE7B7",
  },
};

function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [today, setToday]           = useState(new Date());

  /* ── Stats ── */
  const [activePatients,   setActivePatients]   = useState(0);
  const [inactivePatients, setInactivePatients] = useState(0);
  const [monthlyData,      setMonthlyData]      = useState(Array(12).fill(0));

  /* ── Today's appointments ── */
  const [todayTotal,        setTodayTotal]        = useState(0);
  const [todayOnline,       setTodayOnline]       = useState(0);
  const [todayPhysical,     setTodayPhysical]     = useState(0);
  const [todayAppointments, setTodayAppointments] = useState([]);

  /* ── Consultation requests ── */
  const [totalPendingRequests, setTotalPendingRequests] = useState(0);
  const [todayRequests,        setTodayRequests]        = useState([]);

  /* ── Patients table ── */
  const [patients,      setPatients]      = useState([]);
  const [tableLoading,  setTableLoading]  = useState(true);
  const [statsLoading,  setStatsLoading]  = useState(true);

  /* ── Search / filter ── */
  const [searchTerm,   setSearchTerm]   = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const PATIENTS_PER_PAGE = 10;

  /* ── Announcements ── */
  const [announcements,        setAnnouncements]        = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [form, setForm] = useState({
    title:    "",
    message:  "",
    priority: "normal",
    audience: "all",
  });

  // ─────────────────────────────────────────────
  // DATA FETCHING
  // ─────────────────────────────────────────────

  const fetchDashboardStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const { data } = await axiosClient.get("/admin/dashboard/stats");
      if (!data.success) throw new Error("stats fetch failed");
      const d = data.data;
      setActivePatients(d.activePatients ?? 0);
      setInactivePatients(d.inactivePatients ?? 0);
      setMonthlyData(
        Array.isArray(d.monthlyPatients) && d.monthlyPatients.length === 12
          ? d.monthlyPatients
          : Array(12).fill(0),
      );
      setTodayTotal(d.todayTotal ?? 0);
      setTodayOnline(d.todayOnline ?? 0);
      setTodayPhysical(d.todayPhysical ?? 0);
      setTodayAppointments(Array.isArray(d.todayAppointments) ? d.todayAppointments : []);
      setTotalPendingRequests(d.totalPendingRequests ?? 0);
      setTodayRequests(Array.isArray(d.todayRequests) ? d.todayRequests : []);
    } catch (err) {
      console.error("fetchDashboardStats:", err);
      toast.error("Failed to load dashboard stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/admin/appointments");
      if (!data.success) throw new Error("appointments fetch failed");
      const todayDateStr = today.toISOString().split("T")[0];
      const filtered = (Array.isArray(data.data) ? data.data : []).filter(
        (appt) => appt.appointment_date === todayDateStr,
      );
      setTodayAppointments(filtered);
      setTodayTotal(filtered.length);
      setTodayOnline(filtered.filter((a) => a.type === "online").length);
      setTodayPhysical(filtered.filter((a) => a.type === "physical").length);
    } catch (err) {
      console.error("fetchAppointments:", err);
      toast.error("Failed to load appointments");
    }
  }, [today]);

  const fetchPatients = useCallback(async () => {
    try {
      setTableLoading(true);
      const { data } = await axiosClient.get("/admin/patients");
      if (!data.success) throw new Error("patients fetch failed");
      setPatients(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("fetchPatients:", err);
      toast.error("Failed to load patients");
      setPatients([]);
    } finally {
      setTableLoading(false);
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setAnnouncementsLoading(true);
      const { data } = await axiosClient.get("/admin/announcements");
      if (!data.success) throw new Error("announcements fetch failed");
      setAnnouncements(data.data);
    } catch (err) {
      console.error("fetchAnnouncements:", err);
      toast.error("Failed to load announcements");
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
    fetchAppointments();
    fetchPatients();
    fetchAnnouncements();
    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchAppointments();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchDashboardStats, fetchAppointments, fetchPatients, fetchAnnouncements]);

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // ─────────────────────────────────────────────
  // FILTER + PAGINATION
  // ─────────────────────────────────────────────

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
      (statusFilter === "active"   && p.is_active) ||
      (statusFilter === "inactive" && !p.is_active);
    return matchSearch && matchGender && matchStatus;
  });

  const totalPages       = Math.ceil(filteredPatients.length / PATIENTS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * PATIENTS_PER_PAGE,
    currentPage * PATIENTS_PER_PAGE,
  );

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day:   "2-digit",
    year:  "numeric",
  });

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour   = parseInt(h, 10);
    return `${hour % 12 === 0 ? 12 : hour % 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const getStatusColor = (isActive) => (isActive ? "#1E3A8A" : "#808080");
  const getStatusLabel = (isActive) => (isActive ? "Active" : "Inactive");

  // ─────────────────────────────────────────────
  // ANNOUNCEMENTS — API-connected
  // ─────────────────────────────────────────────

  const openAddModal = () => {
    setForm({ title: "", message: "", priority: "normal", audience: "all" });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (ann) => {
    setForm({
      title:    ann.title,
      message:  ann.message,
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
        // UPDATE
        const { data } = await axiosClient.put(
          `/admin/announcements/${editingId}`,
          form,
        );
        if (!data.success) throw new Error(data.message);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingId ? data.data : a)),
        );
        toast.success("Announcement updated!");
      } else {
        // CREATE
        const { data } = await axiosClient.post("/admin/announcements", form);
        if (!data.success) throw new Error(data.message);
        setAnnouncements((prev) => [data.data, ...prev]);
        toast.success("Announcement posted!");
      }
      setShowModal(false);
    } catch (err) {
      console.error("handleSave:", err);
      toast.error(err.response?.data?.message ?? "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axiosClient.delete(`/admin/announcements/${id}`);
      if (!data.success) throw new Error(data.message);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success("Announcement deleted.");
    } catch (err) {
      console.error("handleDelete:", err);
      toast.error("Failed to delete announcement");
    }
  };

  // ─────────────────────────────────────────────
  // CHART CONFIG
  // ─────────────────────────────────────────────

  const barData = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [{
      label:           "Monthly Patients",
      data:            monthlyData,
      backgroundColor: "#4D227C",
      borderRadius:    6,
      barThickness:    35,
    }],
  };

  const barOptions = {
    responsive:          true,
    maintainAspectRatio: false,
    plugins: {
      legend:      { display: false },
      datalabels:  {
        color:     "#ffffff9c",
        anchor:    "center",
        align:     "center",
        font:      { family: "Poppins, sans-serif", size: 10, weight: "100" },
        formatter: (v) => (v > 0 ? v : ""),
      },
    },
    scales: {
      x: { ticks: { color: "#574a65", font: { family: "Poppins, sans-serif", size: 12 } } },
      y: { beginAtZero: true, ticks: { stepSize: 1, color: "#574a65", font: { family: "Poppins, sans-serif", size: 12 } } },
    },
  };

  const pieData = {
    labels: ["Active", "Inactive"],
    datasets: [{
      label:           "Patient Status",
      data:            [activePatients, inactivePatients],
      backgroundColor: ["#52a1ec", "#EF5350"],
      borderColor:     "rgb(255,255,255)",
      borderWidth:     1,
    }],
  };

  const pieOptions = {
    responsive:          true,
    maintainAspectRatio: false,
    hoverOffset:         12,
    plugins: {
      legend: {
        position: window.innerWidth < 768 ? "bottom" : "right",
        align:    window.innerWidth < 768 ? "center" : "start",
        labels: {
          boxWidth:      14,
          boxHeight:     14,
          padding:       10,
          color:         "#4E237C",
          font: { family: "Poppins, sans-serif", size: window.innerWidth < 768 ? 12 : 16, weight: "500" },
          usePointStyle: true,
        },
      },
      datalabels: { color: "#ffffff", font: { family: "Poppins, sans-serif", size: 14, weight: "100" } },
      tooltip: {
        bodyFont:  { family: "Poppins, sans-serif" },
        titleFont: { family: "Poppins, sans-serif", weight: "900" },
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}` },
      },
    },
    layout: { padding: { top: 10, bottom: 10, left: 10, right: window.innerWidth < 768 ? 10 : 60 } },
    cutout: "0%",
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className={`admin-content ${styles.adminContent}`}>
          <div className={`container-fluid ${styles.containerFluid}`}>
            {statsLoading && (
              <div className={styles.loadingBanner}>Refreshing dashboard data…</div>
            )}

            <div className="row g-4">
              {/* ── Announcements ── */}
              <div className="col-12">
                <div className={`${styles.dashboardCard} ${styles.announcementCard}`}>
                  <div className={styles.cardHeader}>
                    <h5 className={styles.announcementTitle}>
                      <FaBullhorn className={styles.announceIcon} /> Announcements
                    </h5>
                    <button className={styles.btnPostAnnounce} onClick={openAddModal}>
                      + Create Announcement
                    </button>
                  </div>

                  {announcementsLoading ? (
                    <div className={styles.noAnnounce}>Loading announcements…</div>
                  ) : announcements.length === 0 ? (
                    <div className={styles.noAnnounce}>No announcements yet.</div>
                  ) : (
                    <div className={styles.announceList}>
                      {announcements.map((ann) => {
                        const meta = audienceMeta[ann.audience ?? "all"];
                        return (
                          <div
                            key={ann.id}
                            className={`${styles.announceItem} ${
                              ann.priority === "high" ? styles.announceHigh : styles.announceNormal
                            }`}
                          >
                            <div className={styles.announceLeft}>
                              <div className={styles.announceItemHeader}>
                                {ann.priority === "high" && (
                                  <span className={styles.priorityBadge}>Urgent</span>
                                )}
                                <strong className={styles.announceItemTitle}>{ann.title}</strong>
                              </div>
                              <p className={styles.announceMessage}>{ann.message}</p>
                              <div className={styles.announceMeta}>
                                <small className={styles.announceDate}>Posted: {ann.date}</small>
                                <span
                                  className={styles.audienceBadge}
                                  style={{
                                    color:           meta.color,
                                    backgroundColor: meta.bg,
                                    border:          `1px solid ${meta.border}`,
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
                    <h5>Today's Appointment</h5>
                    <div className={styles.cardDate}>{formattedDate} <span>{todayTotal}</span></div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    <div className={styles.appointmentItems}>
                      <div className={styles.appointmentIconText}>
                        <IoVideocam className={styles.appointmentIcon} />
                        <strong>Online Clinic</strong>
                      </div>
                      <p>{todayOnline} Appointment{todayOnline !== 1 ? "s" : ""}</p>
                    </div>
                    <div className={styles.appointmentItems}>
                      <div className={styles.appointmentIconText}>
                        <FaClinicMedical className={styles.appointmentIcon} />
                        <strong>Physical Clinic</strong>
                      </div>
                      <p>{todayPhysical} Appointment{todayPhysical !== 1 ? "s" : ""}</p>
                    </div>
                    {todayAppointments.length > 0 && (
                      <div className={styles.appointmentMiniList}>
                        {todayAppointments.slice(0, 3).map((appt) => (
                          <div key={appt.id} className={styles.appointmentMiniItem}>
                            <div className={styles.appointmentMiniLeft}>
                              <span className={styles.appointmentMiniTime}>{formatTime(appt.appointment_time)}</span>
                              <span className={styles.appointmentMiniName}>{appt.patient}</span>
                            </div>
                            <span
                              className={styles.appointmentMiniType}
                              style={{
                                backgroundColor: appt.type === "online" ? "#EDE9FE" : "#DBEAFE",
                                color:           appt.type === "online" ? "#4D227C" : "#1E3A8A",
                              }}
                            >
                              {appt.type === "online" ? "Online" : "Physical"}
                            </span>
                          </div>
                        ))}
                        {todayAppointments.length > 3 && (
                          <p className={styles.appointmentMoreText}>+{todayAppointments.length - 3} more today</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Consultation Requests ── */}
              <div className="col-md-6">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>Consultation Request</h5>
                    <div className={styles.cardDate}>{formattedDate} <span>{totalPendingRequests}</span></div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    {todayRequests.length === 0 && !statsLoading ? (
                      <p className={styles.noData}>No new requests today</p>
                    ) : (
                      <div className={styles.consultList}>
                        {todayRequests.slice(0, 4).map((req) => (
                          <div key={req.id} className={styles.consultItem}>
                            <div className={styles.consultLeft}>
                              <span className={styles.consultName}>{req.patient}</span>
                              <span className={styles.consultConcern}>
                                {req.concern.length > 45 ? req.concern.slice(0, 45) + "…" : req.concern}
                              </span>
                            </div>
                            <span
                              className={styles.urgencyBadge}
                              style={{
                                backgroundColor: urgencyColor[req.urgency] + "1A",
                                color:           urgencyColor[req.urgency],
                                border:          `1px solid ${urgencyColor[req.urgency]}40`,
                              }}
                            >
                              {req.urgency.charAt(0).toUpperCase() + req.urgency.slice(1)}
                            </span>
                          </div>
                        ))}
                        {todayRequests.length > 4 && (
                          <p className={styles.appointmentMoreText}>+{todayRequests.length - 4} more today</p>
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
                    <div className={styles.cardDate}><span>{patients.length}</span></div>
                  </div>
                  <hr />
                  <div className={styles.filterSection}>
                    <input
                      type="text"
                      className={styles.searchInput}
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                    <select
                      className={styles.filterSelect}
                      value={genderFilter}
                      onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="">All Sexes</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      className={styles.filterSelect}
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className={`${styles.cardBody} ${styles.tableResponsive}`}>
                    {tableLoading ? (
                      <div className={styles.loadingState}><p>Loading patients data…</p></div>
                    ) : paginatedPatients.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p>{filteredPatients.length === 0 ? "No patients found matching your filters" : "No data to display"}</p>
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
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedPatients.map((p) => (
                            <tr key={p.id}>
                              <td><strong>{p.firstName} {p.lastName}</strong></td>
                              <td>{p.sex ? p.sex.charAt(0).toUpperCase() + p.sex.slice(1) : "—"}</td>
                              <td>
                                {p.genderIdentity
                                  ? p.genderIdentity.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
                                  : "—"}
                              </td>
                              <td>{p.email}</td>
                              <td>{p.contactNo}</td>
                              <td style={{ color: getStatusColor(p.is_active), fontWeight: "bold" }}>
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
                      <span>Page {currentPage} of {totalPages} ({filteredPatients.length} results)</span>
                      <div className={styles.paginationButtons}>
                        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                          {"< Previous"}
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={currentPage === i + 1 ? styles.activePage : ""}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
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
                  <h5>Monthly Patients</h5>
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
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalLg} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className={styles.modalProfileHeader}>
              <button className={styles.profileCloseBtn} onClick={() => setShowModal(false)}>
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

            {/* Body */}
            <div className={styles.modalBody}>
              <div className={styles.modalContentCard}>

                {/* Title */}
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
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                {/* Message */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Message</label>
                  <textarea
                    className={styles.fieldTextarea}
                    placeholder="Write your announcement here..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className={styles.modalDivider} />

                {/* Priority + Audience */}
                <div className={styles.fieldRowTwo}>

                  {/* Priority */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      <FiFlag size={11} style={{ marginRight: 5 }} />
                      Priority
                    </label>
                    <div className={styles.priorityToggle}>
                      {[
                        { value: "normal", label: "Normal", color: "#4D227C", bg: "#f0ebf8", border: "#d8cce8" },
                        { value: "high",   label: "Urgent", color: "#dc2626", bg: "#fff0f0", border: "#fecaca" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`${styles.priorityToggleBtn} ${form.priority === opt.value ? styles.priorityToggleActive : ""}`}
                          style={
                            form.priority === opt.value
                              ? { background: opt.bg, borderColor: opt.color, color: opt.color }
                              : {}
                          }
                          onClick={() => setForm({ ...form, priority: opt.value })}
                        >
                          {opt.value === "high" && <span className={styles.urgentDot} />}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audience */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      <FiEye size={11} style={{ marginRight: 5 }} />
                      Visible To
                    </label>
                    <div className={styles.audienceSelectWrapper}>
                      <span className={styles.audienceSelectIcon}>
                        {audienceMeta[form.audience]?.icon}
                      </span>
                      <select
                        className={styles.audienceSelect}
                        value={form.audience}
                        onChange={(e) => setForm({ ...form, audience: e.target.value })}
                        style={{
                          borderColor:     audienceMeta[form.audience]?.color,
                          color:           audienceMeta[form.audience]?.color,
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

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)}>
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
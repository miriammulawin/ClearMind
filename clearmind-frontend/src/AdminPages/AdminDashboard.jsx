import { useState, useEffect } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminDashboard.module.css";
import { FaClinicMedical, FaBullhorn, FaTrash, FaEdit } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import { FiX, FiMessageSquare, FiFlag } from "react-icons/fi";
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

function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [today, setToday] = useState(new Date());

  // ── Patient Data ──
  const [patients, setPatients] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [activePatients, setActivePatients] = useState(0);
  const [inactivePatients, setInactivePatients] = useState(0);
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0)); // ← NEW
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);

  // ── Search & Filter ──
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ── Announcements ──
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Clinic Holiday Schedule",
      message:
        "The clinic will be closed on February 25 in observance of EDSA People Power Anniversary. Please reschedule your appointments accordingly.",
      date: "Feb 20, 2026",
      priority: "high",
    },
    {
      id: 2,
      title: "New Online Consultation Hours",
      message:
        "Starting March 1, online consultations will be available from 8:00 AM to 6:00 PM, Monday to Saturday.",
      date: "Feb 18, 2026",
      priority: "normal",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "normal",
  });

  // ── Fetch Patients Data ──
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/admin/patients", {
        params: {
          role: "Client",
        },
      });

      if (response.data.success) {
        const allPatients = response.data.data || [];
        setPatients(allPatients);
        setTotalPatients(allPatients.length);

        const active = allPatients.filter((p) => p.is_active).length;
        const inactive = allPatients.length - active;
        setActivePatients(active);
        setInactivePatients(inactive);

        // ── NEW: Compute monthly registration counts for current year ──
        const currentYear = new Date().getFullYear();
        const counts = Array(12).fill(0);
        allPatients.forEach((p) => {
          if (p.created_at) {
            const d = new Date(p.created_at);
            if (d.getFullYear() === currentYear) {
              counts[d.getMonth()]++;
            }
          }
        });
        setMonthlyData(counts);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients data");
      setPatients([]);
      setTotalPatients(0);
      setMonthlyData(Array(12).fill(0));
    } finally {
      setLoading(false);
    }
  };

  // ── Time Update ──
  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  // ── Filter and Search Logic ──
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contactNo?.includes(searchTerm);

    const matchesGender = !genderFilter || patient.sex === genderFilter;

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && patient.is_active) ||
      (statusFilter === "inactive" && !patient.is_active);

    return matchesSearch && matchesGender && matchesStatus;
  });

  // ── Pagination Logic ──
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  // ── Announcement Functions ──
  const openAddModal = () => {
    setForm({ title: "", message: "", priority: "normal" });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (ann) => {
    setForm({ title: ann.title, message: ann.message, priority: ann.priority });
    setEditingId(ann.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.message.trim()) return;
    const nowFormatted = today.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    if (editingId) {
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...form } : a)),
      );
    } else {
      setAnnouncements((prev) => [
        { id: Date.now(), ...form, date: nowFormatted },
        ...prev,
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) =>
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

  // ── Helper Functions ──
  const getStatusColor = (status) => {
    if (status === true || status === "Scheduled") return "#1E3A8A";
    if (status === "Completed") return "#16A34A";
    if (status === "Cancelled") return "#DC2626";
    return "#808080";
  };

  const getStatusLabel = (isActive) => {
    return isActive ? "Active" : "Inactive";
  };

  // ── Chart Data ──
  // ← UPDATED: uses dynamic monthlyData state instead of hardcoded values
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
        label: "Monthly Patients",
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
        font: { family: "Poppins, sans-serif", size: 10, weight: "100" },
        formatter: (v) => (v > 0 ? v : ""), // ← hide "0" labels on empty bars
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
        borderColor: "rgb(255,255,255)",
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
        align: window.innerWidth < 768 ? "center" : "start",
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
        font: { family: "Poppins, sans-serif", size: 14, weight: "100" },
      },
      tooltip: {
        bodyFont: { family: "Poppins, sans-serif" },
        titleFont: { family: "Poppins, sans-serif", weight: "900" },
        callbacks: { label: (context) => `${context.label}: ${context.raw}` },
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

  const priorityOptions = [
    {
      value: "normal",
      label: "Normal",
      desc: "Standard announcement",
      activeClass: styles.normalActive,
      accentColor: "#4D227C",
    },
    {
      value: "high",
      label: "Urgent",
      desc: "High priority alert",
      activeClass: styles.urgentActive,
      accentColor: "#dc2626",
    },
  ];

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
                  <hr />
                  {announcements.length === 0 ? (
                    <div className={styles.noAnnounce}>
                      No announcements yet.
                    </div>
                  ) : (
                    <div className={styles.announceList}>
                      {announcements.map((ann) => (
                        <div
                          key={ann.id}
                          className={`${styles.announceItem} ${
                            ann.priority === "high"
                              ? styles.announceHigh
                              : styles.announceNormal
                          }`}
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
                            <small className={styles.announceDate}>
                              Posted: {ann.date}
                            </small>
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
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Statistics Cards ── */}
              <div className="col-md-4">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>Total Patients</h5>
                    <div className={styles.cardDate}>
                      <span>{totalPatients}</span>
                    </div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    <p className={styles.statText}>
                      <strong>{activePatients}</strong> Active
                    </p>
                    <p className={styles.statText}>
                      <strong>{inactivePatients}</strong> Inactive
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Today's Appointment ── */}
              <div className="col-md-4">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>Today's Appointment</h5>
                    <div className={styles.cardDate}>
                      {formattedDate} <span>0</span>
                    </div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    <div className={styles.appointmentItems}>
                      <div className={styles.appointmentIconText}>
                        <IoVideocam className={styles.appointmentIcon} />
                        <strong>Online Clinic</strong>
                      </div>
                      <p>0 Appointment</p>
                    </div>
                    <div className={styles.appointmentItems}>
                      <div className={styles.appointmentIconText}>
                        <FaClinicMedical className={styles.appointmentIcon} />
                        <strong>Physical Clinic</strong>
                      </div>
                      <p>0 Appointment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Consultation Request ── */}
              <div className="col-md-4">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>Consultation Request</h5>
                    <div className={styles.cardDate}>
                      {formattedDate} <span>0</span>
                    </div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    <div className={styles.consultItem}>
                      <p className={styles.noData}>No requests</p>
                    </div>
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
                      <span>{totalPatients}</span>
                    </div>
                  </div>
                  <hr />

                  {/* ── Search and Filter ── */}
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

                  {/* ── Table ── */}
                  <div
                    className={`${styles.cardBody} ${styles.tableResponsive}`}
                  >
                    {loading ? (
                      <div className={styles.loadingState}>
                        <p>Loading patients data...</p>
                      </div>
                    ) : paginatedPatients.length === 0 ? (
                      <div className={styles.emptyState}>
                        <p>
                          {filteredPatients.length === 0
                            ? "No patients found matching your filters"
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
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedPatients.map((patient) => (
                            <tr key={patient.id}>
                              <td>
                                <strong>
                                  {patient.firstName} {patient.lastName}
                                </strong>
                              </td>
                              <td>
                                {patient.sex
                                  ? patient.sex.charAt(0).toUpperCase() +
                                    patient.sex.slice(1)
                                  : "-"}
                              </td>
                              <td>
                                {patient.genderIdentity
                                  ? patient.genderIdentity
                                      .split("_")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1),
                                      )
                                      .join(" ")
                                  : "-"}
                              </td>
                              <td>{patient.email}</td>
                              <td>{patient.contactNo}</td>
                              <td
                                style={{
                                  color: getStatusColor(patient.is_active),
                                  fontWeight: "bold",
                                }}
                              >
                                {getStatusLabel(patient.is_active)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* ── Pagination ── */}
                  {!loading && totalPages > 1 && (
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
                          (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={
                                  currentPage === pageNum
                                    ? styles.activePage
                                    : ""
                                }
                              >
                                {pageNum}
                              </button>
                            );
                          },
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

      {/* ── Announcement Modal ── */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modalLg} onClick={(e) => e.stopPropagation()}>
            {/* Purple Header */}
            <div className={styles.modalProfileHeader}>
              <button
                className={styles.profileCloseBtn}
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
              <div className={styles.modalProfileRow}>
                <div className={styles.iconBubble}>
                  <FaBullhorn size={22} color="#fff" />
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
                {/* Announcement Details section */}
                <div className={styles.fieldGroup}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionIconBox}>
                      <FiMessageSquare size={13} color="#fff" />
                    </div>
                    <h4 className={styles.sectionTitle}>
                      Announcement Details
                    </h4>
                  </div>

                  <label className={styles.fieldLabel}>Title</label>
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

                {/* Message */}
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

                {/* Priority Level section */}
                <div>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionIconBox}>
                      <FiFlag size={13} color="#fff" />
                    </div>
                    <h4 className={styles.sectionTitle}>Priority Level</h4>
                  </div>

                  <div className={styles.priorityGroup}>
                    {priorityOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`${styles.priorityCard} ${
                          form.priority === opt.value ? opt.activeClass : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={opt.value}
                          checked={form.priority === opt.value}
                          onChange={() =>
                            setForm({ ...form, priority: opt.value })
                          }
                          style={{
                            accentColor: opt.accentColor,
                            width: 16,
                            height: 16,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            className={`${styles.priorityCardLabel} ${
                              form.priority === opt.value ? opt.activeClass : ""
                            }`}
                          >
                            {opt.label}
                          </div>
                          <div className={styles.priorityCardDesc}>
                            {opt.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancel}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className={styles.btnSave} onClick={handleSave}>
                {editingId ? "Save Changes" : "Post Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

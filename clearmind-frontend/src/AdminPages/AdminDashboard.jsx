import { useState, useEffect } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminDashboard.module.css";
import { FaClinicMedical, FaBullhorn, FaTrash, FaEdit } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import { FiX, FiMessageSquare, FiFlag } from "react-icons/fi";

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

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

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

  const patientsData = [
    {
      name: "Liezel Paciente",
      gender: "Female",
      date: "January 20, 2026",
      time: "2:00 pm",
      type: "Follow Up",
      status: "Scheduled",
    },
    {
      name: "Ara Christina Ceres",
      gender: "Female",
      date: "January 15, 2026",
      time: "9:00 am",
      type: "New Concern",
      status: "Completed",
    },
    {
      name: "Ara Christina Ceres",
      gender: "Female",
      date: "January 15, 2026",
      time: "9:00 am",
      type: "New Concern",
      status: "Scheduled",
    },
    {
      name: "Ara Christina Ceres",
      gender: "Female",
      date: "January 15, 2026",
      time: "9:00 am",
      type: "New Concern",
      status: "Cancelled",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "#1E3A8A";
      case "Completed":
        return "#16A34A";
      case "Cancelled":
        return "#DC2626";
      default:
        return "#000";
    }
  };

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
        data: [10, 8, 6, 5, 4, 7, 9, 11, 6, 8, 5, 12],
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
        formatter: (v) => v,
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
    labels: ["Completed", "Cancelled", "Pending"],
    datasets: [
      {
        label: "Appointment Status",
        data: [
          patientsData.filter((p) => p.status === "Completed").length,
          patientsData.filter((p) => p.status === "Cancelled").length,
          patientsData.filter((p) => p.status === "Scheduled").length,
        ],
        backgroundColor: ["#52a1ec", "#EF5350", "#d1a4de"],
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

              {/* ── Today's Appointment ── */}
              <div className="col-md-6">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>Today's Appointment</h5>
                    <div className={styles.cardDate}>
                      {formattedDate} <span>1</span>
                    </div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    <div className={styles.appointmentItems}>
                      <div className={styles.appointmentIconText}>
                        <IoVideocam className={styles.appointmentIcon} />
                        <strong>Online Clinic</strong>
                      </div>
                      <p>1 Appointment</p>
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
              <div className="col-md-6">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>Consultation Request</h5>
                    <div className={styles.cardDate}>
                      {formattedDate} <span>1</span>
                    </div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    <div className={styles.consultItem}>
                      <div>
                        <p>
                          <strong>Name:</strong> Liezel Paciente
                        </p>
                        <p>
                          <strong>Time:</strong> 2:00 PM
                        </p>
                      </div>
                      <button className={styles.btnView}>View</button>
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
                    <h5>Total's Patients</h5>
                    <div className={styles.cardDate}>
                      <span>{patientsData.length}</span>
                    </div>
                  </div>
                  <hr />
                  <div
                    className={`${styles.cardBody} ${styles.tableResponsive}`}
                  >
                    <table className={styles.patientsTable}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Gender</th>
                          <th>Date of Appointment</th>
                          <th>Time</th>
                          <th>Visit Type</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientsData.map((patient, index) => (
                          <tr key={index}>
                            <td>{patient.name}</td>
                            <td>{patient.gender}</td>
                            <td>{patient.date}</td>
                            <td>{patient.time}</td>
                            <td>{patient.type}</td>
                            <td
                              style={{ color: getStatusColor(patient.status) }}
                            >
                              {patient.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles.tablePagination}>
                    <span>Page 1 of 5</span>
                    <div className={styles.paginationButtons}>
                      <button>{"< Previous"}</button>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n}>{n}</button>
                      ))}
                      <button>{"Next >"}</button>
                    </div>
                  </div>
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
                  <h5>Appointment Status</h5>
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
                        className={`${styles.priorityCard} ${form.priority === opt.value ? opt.activeClass : ""}`}
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
                            className={`${styles.priorityCardLabel} ${form.priority === opt.value ? opt.activeClass : ""}`}
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

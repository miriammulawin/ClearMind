import { useState, useEffect } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminDashboard.css";
import {
  FaClinicMedical,
  FaBullhorn,
  FaTimes,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";

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

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content">
          <div className="container-fluid">
            <div className="row g-4">
              {/* Announcements */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="dashboard-card announcement-card">
                    <div className="card-header">
                      <h5 className="announcement-title">
                        <FaBullhorn className="announce-icon" /> Announcements
                      </h5>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          className="btn-post-announce"
                          onClick={openAddModal}
                        >
                          Create Announcement
                        </button>
                      </div>
                    </div>
                    <hr />
                    {announcements.length === 0 ? (
                      <div className="no-announce">No announcements yet.</div>
                    ) : (
                      <div className="announce-list">
                        {announcements.map((ann) => (
                          <div
                            key={ann.id}
                            className={`announce-item ${ann.priority === "high" ? "announce-high" : "announce-normal"}`}
                          >
                            <div className="announce-left">
                              <div className="announce-item-header">
                                {ann.priority === "high" && (
                                  <span className="priority-badge">Urgent</span>
                                )}
                                <strong className="announce-item-title">
                                  {ann.title}
                                </strong>
                              </div>
                              <p className="announce-message">{ann.message}</p>
                              <small className="announce-date">
                                Posted: {ann.date}
                              </small>
                            </div>
                            <div className="announce-actions">
                              <button
                                className="ann-btn ann-edit"
                                onClick={() => openEditModal(ann)}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="ann-btn ann-delete"
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
              </div>

              {/* Today's Appointment */}
              <div className="col-md-6">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h5>Today's Appointment</h5>
                    <div className="card-date">
                      {formattedDate} <span>1</span>
                    </div>
                  </div>
                  <hr />
                  <div className="card-body">
                    <div className="appointment-items">
                      <div className="appointment-icon-text">
                        <IoVideocam className="appointment-icon" />
                        <strong>Online Clinic</strong>
                      </div>
                      <p>1 Appointment</p>
                    </div>
                    <div className="appointment-items">
                      <div className="appointment-icon-text">
                        <FaClinicMedical className="appointment-icon" />
                        <strong>Physical Clinic</strong>
                      </div>
                      <p>0 Appointment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Request */}
              <div className="col-md-6">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h5>Consultation Request</h5>
                    <div className="card-date">
                      {formattedDate} <span>1</span>
                    </div>
                  </div>
                  <hr />
                  <div className="card-body">
                    <div className="consult-item">
                      <div>
                        <p>
                          <strong>Name:</strong> Liezel Paciente
                        </p>
                        <p>
                          <strong>Time:</strong> 2:00 PM
                        </p>
                      </div>
                      <button className="btn-view">View</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Patients Table */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h5>Total's Patients</h5>
                    <div className="card-date">
                      <span>{patientsData.length}</span>
                    </div>
                  </div>
                  <hr />
                  <div className="card-body table-responsive">
                    <table className="patients-table">
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
                  <div className="table-pagination">
                    <span>Page 1 of 5</span>
                    <div className="pagination-buttons">
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

            {/* Charts */}
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="dashboard-card">
                  <h5>Monthly Patients</h5>
                  <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: "900px", height: "300px" }}>
                      <Bar data={barData} options={barOptions} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="dashboard-card">
                  <h5>Appointment Status</h5>
                  <div className="pie-chart-container">
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{editingId ? "Edit Announcement" : "Post Announcement"}</h5>
              <div className="modal-header-right">
                <span className="modal-header-date">{formattedDate}</span>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="modal-body">
              <label>Title</label>
              <input
                type="text"
                className="modal-input"
                placeholder="Announcement title..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <label>Message</label>
              <textarea
                className="modal-input modal-textarea"
                placeholder="Write your announcement here..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
              />
              <label>Priority</label>
              <select
                className="modal-input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="high">Urgent / High Priority</option>
              </select>
            </div>
            <div className="modal-footer">
              <button
                className="modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="modal-save" onClick={handleSave}>
                {editingId ? "Save Changes" : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

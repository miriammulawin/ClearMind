import { useState, useEffect } from "react";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import "./DoctorStyle/DoctorDashboard.css";
import { FaClinicMedical, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { BsMegaphone } from "react-icons/bs";
import AccountSetupModal from "./components/SetupAccountModal";
import axiosClient from "../axiosClient";

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
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, ChartDataLabels,
);

function DoctorDashboard() {
  const [activeMenu, setActiveMenu]           = useState("Dashboard");
  const [today, setToday]                     = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement]     = useState(null);
  const [announcementTab, setAnnouncementTab] = useState("received");
  const [showSetupModal, setShowSetupModal]   = useState(true);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", message: "", priority: "normal" });

  // ── API Data ─────────────────────────────────────────────────────
  const [patientsData, setPatientsData]   = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [currentPage, setCurrentPage]     = useState(1);
  const [lastPage, setLastPage]           = useState(1);
  const [loading, setLoading]             = useState(false);
  const [statusCounts, setStatusCounts]   = useState({ Scheduled: 0, Cancelled: 0, Pending: 0, Completed: 0 });
  const [monthlyData, setMonthlyData]     = useState(Array(12).fill(0));

  // ── Announcements (static for now) ───────────────────────────────
  const [adminAnnouncements, setAdminAnnouncements] = useState([
    { id: 1, title: "TIME OUT",                   message: "MAG TIME OUT NA TAYO",                                                                                                    priority: "urgent", postedDate: "Feb 24, 2026" },
    { id: 2, title: "Clinic Holiday Schedule",    message: "The clinic will be closed on February 25 in observance of EDSA People Power Anniversary. Please reschedule accordingly.", priority: "urgent", postedDate: "Feb 20, 2026" },
    { id: 3, title: "New Online Consultation Hours", message: "Starting March 1, online consultations will be available from 8:00 AM to 6:00 PM, Monday to Saturday.",              priority: "normal", postedDate: "Feb 18, 2026" },
  ]);

  const [doctorAnnouncements, setDoctorAnnouncements] = useState([
    { id: 1, title: "Office Hours Update", message: "Please note that consultation hours for this week have been adjusted. Morning slots start at 9:00 AM.", priority: "normal", postedDate: "Feb 25, 2026" },
  ]);

  // ── Fetch API data ───────────────────────────────────────────────
  const fetchPatients = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/doctor/dashboard?page=${page}`);
      const { data, total, last_page, current_page } = res.data;
      setPatientsData(data);
      setTotalPatients(total);
      setLastPage(last_page);
      setCurrentPage(current_page);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const res = await axiosClient.get("/doctor/status-counts");
      setStatusCounts(res.data);
    } catch (err) {
      console.error("Failed to fetch status counts:", err);
    }
  };

  const fetchMonthlyPatients = async () => {
    try {
      const res = await axiosClient.get("/doctor/monthly-patients");
      setMonthlyData(res.data);
    } catch (err) {
      console.error("Failed to fetch monthly patients:", err);
    }
  };

  useEffect(() => {
    fetchPatients(1);
    fetchStatusCounts();
    fetchMonthlyPatients();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    setCurrentWeekStart(startOfWeek);
  }, []);

  useEffect(() => { setShowSetupModal(true); }, []);

  const formattedDate = today.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setMonth(currentWeekStart.getMonth() + direction);
    setCurrentWeekStart(newDate);
  };

  const isToday = (date) =>
    date.getDate()     === today.getDate()     &&
    date.getMonth()    === today.getMonth()    &&
    date.getFullYear() === today.getFullYear();

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled": return "#1E3A8A";
      case "Completed": return "#16A34A";
      case "Cancelled": return "#DC2626";
      case "Pending":   return "#B45309";
      default:          return "#000";
    }
  };

  // ── Smart pagination ─────────────────────────────────────────────
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    if (lastPage <= 7) { for (let i = 1; i <= lastPage; i++) pages.push(i); return pages; }
    pages.push(1);
    if (currentPage > delta + 2) pages.push("...");
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(lastPage - 1, currentPage + delta); i++) pages.push(i);
    if (currentPage < lastPage - delta - 1) pages.push("...");
    pages.push(lastPage);
    return pages;
  };

  // ── Announcements ────────────────────────────────────────────────
  const handleOpenAnnouncementModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementForm({ title: announcement.title, message: announcement.message, priority: announcement.priority });
    } else {
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: "", message: "", priority: "normal" });
    }
    setShowAnnouncementModal(true);
  };

  const handleCloseAnnouncementModal = () => {
    setShowAnnouncementModal(false);
    setEditingAnnouncement(null);
    setAnnouncementForm({ title: "", message: "", priority: "normal" });
  };

  const handleSubmitAnnouncement = () => {
    if (editingAnnouncement) {
      setDoctorAnnouncements(doctorAnnouncements.map((a) => a.id === editingAnnouncement.id ? { ...a, ...announcementForm } : a));
    } else {
      setDoctorAnnouncements([{
        id: doctorAnnouncements.length + 1,
        ...announcementForm,
        postedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      }, ...doctorAnnouncements]);
    }
    handleCloseAnnouncementModal();
  };

  const handleDeleteAnnouncement = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setDoctorAnnouncements(doctorAnnouncements.filter((a) => a.id !== id));
    }
  };

  const getCurrentAnnouncements = () =>
    announcementTab === "received" ? adminAnnouncements : doctorAnnouncements;

  // ── Bar chart ────────────────────────────────────────────────────
  const maxMonthly = Math.max(...monthlyData, 1);

  const barData = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [{
      label: "Monthly Patients",
      data: monthlyData,
      backgroundColor: "#4D227C",
      borderRadius: 6,
      barThickness: 35,
    }],
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
        formatter: (value) => value > 0 ? value : "",
      },
    },
    scales: {
      x: { ticks: { color: "#574a65", font: { family: "Poppins, sans-serif", size: 12 } } },
      y: {
        beginAtZero: true,
        max: maxMonthly + Math.ceil(maxMonthly * 0.2),
        ticks: {
          stepSize: Math.ceil(maxMonthly / 6),
          color: "#574a65",
          font: { family: "Poppins, sans-serif", size: 12 },
        },
      },
    },
  };

  // ── Pie chart ────────────────────────────────────────────────────
  const pieData = {
    labels: ["Completed", "Cancelled", "Scheduled", "Pending"],
    datasets: [{
      label: "Appointment Status",
      data: [statusCounts.Completed, statusCounts.Cancelled, statusCounts.Scheduled, statusCounts.Pending],
      backgroundColor: ["#52a1ec", "#EF5350", "#d1a4de", "#F59E0B"],
      borderColor: "rgb(255,255,255)",
      borderWidth: 1,
    }],
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
          boxWidth: 14, boxHeight: 14, padding: 10, color: "#4E237C",
          font: { family: "Poppins, sans-serif", size: window.innerWidth < 768 ? 12 : 16, weight: "500" },
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
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}` },
      },
    },
    layout: { padding: { top: 10, bottom: 10, left: 10, right: window.innerWidth < 768 ? 10 : 60 } },
    cutout: "0%",
  };

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="doctor-content">
          <div className="container-fluid">

            {/* Announcements */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="announcements-card">
                  <div className="announcements-header">
                    <div className="announcements-title">
                      <BsMegaphone className="me-2" />
                      <h5>Announcements</h5>
                    </div>
                    <button className="btn-create-announcement" onClick={() => handleOpenAnnouncementModal()}>
                      Create Announcement
                    </button>
                  </div>

                  <div className="announcement-tabs">
                    <button className={`announcement-tab ${announcementTab === "received" ? "active" : ""}`} onClick={() => setAnnouncementTab("received")}>
                      Clinic Announcements {adminAnnouncements.length > 0 && <span className="tab-badge">{adminAnnouncements.length}</span>}
                    </button>
                    <button className={`announcement-tab ${announcementTab === "created" ? "active" : ""}`} onClick={() => setAnnouncementTab("created")}>
                      My Announcements {doctorAnnouncements.length > 0 && <span className="tab-badge">{doctorAnnouncements.length}</span>}
                    </button>
                  </div>

                  <div className="announcements-list">
                    {getCurrentAnnouncements().length === 0 ? (
                      <div className="no-announcements"><p>No announcements yet.</p></div>
                    ) : (
                      getCurrentAnnouncements().map((announcement) => (
                        <div key={announcement.id} className={`announcement-item ${announcement.priority === "urgent" ? "urgent" : ""}`}>
                          <div className="announcement-content">
                            <div className="announcement-header-line">
                              {announcement.priority === "urgent" && <span className="priority-badge">URGENT</span>}
                              <h6 className="announcement-title">{announcement.title}</h6>
                            </div>
                            <p className="announcement-message">{announcement.message}</p>
                            <small className="announcement-date">Posted: {announcement.postedDate}</small>
                          </div>
                          {announcementTab === "created" && (
                            <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
                              <button onClick={() => handleOpenAnnouncementModal(announcement)} title="Edit" style={{ border: "none", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", background: "#4d227c", color: "#fff" }}>
                                <FiEdit2 />
                              </button>
                              <button onClick={() => handleDeleteAnnouncement(announcement.id)} title="Delete" style={{ border: "none", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "18px", background: "#dc2626", color: "#fff" }}>
                                <FiTrash2 />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Appointment + Calendar */}
            <div className="row g-4">
              <div className="col-md-6">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h5>Today's Appointment</h5>
                    <div className="card-date">{formattedDate} <span>1</span></div>
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

              <div className="col-md-6">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h5>Calendar</h5>
                    <div className="week-navigation">
                      <button className="week-nav-btn" onClick={() => navigateWeek(-1)}><FaChevronLeft /></button>
                      <span className="week-range">
                        {currentWeekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </span>
                      <button className="week-nav-btn" onClick={() => navigateWeek(1)}><FaChevronRight /></button>
                    </div>
                  </div>
                  <hr />
                  <div className="card-body">
                    <div className="calendar-grid">
                      <div className="calendar-header">
                        {["Su","Mo","Tu","We","Th","Fr","Sa"].map((day) => (
                          <div key={day} className="calendar-day-label">{day}</div>
                        ))}
                      </div>
                      <div className="calendar-dates">
                        {(() => {
                          const dates = [];
                          const firstDay   = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1);
                          const lastDay    = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth() + 1, 0);
                          const startDay   = firstDay.getDay();
                          const daysInMonth = lastDay.getDate();
                          const prevMonthLastDay = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 0).getDate();

                          for (let i = startDay - 1; i >= 0; i--) {
                            dates.push(<div key={`prev-${i}`} className="calendar-date other-month">{prevMonthLastDay - i}</div>);
                          }
                          for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), day);
                            dates.push(<div key={day} className={`calendar-date ${isToday(date) ? "today" : ""}`}>{day}</div>);
                          }
                          const remainingCells = 42 - dates.length;
                          for (let day = 1; day <= remainingCells; day++) {
                            dates.push(<div key={`next-${day}`} className="calendar-date other-month">{day}</div>);
                          }
                          return dates;
                        })()}
                      </div>
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
                    <div className="card-date"><span>{totalPatients}</span></div>
                  </div>
                  <hr />
                  <div className="card-body table-responsive">
                    {loading ? (
                      <p className="text-center py-3">Loading...</p>
                    ) : (
                      <table className="patients-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Date of Birth</th>
                            <th>Contact No.</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientsData.map((patient, index) => (
                            <tr key={index}>
                              <td>{patient.first_name} {patient.last_name}</td>
                              <td>{patient.sex ?? "—"}</td>
                             <td>
                              {patient.dob
                                ? new Date(patient.dob).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
                                : "—"}
                            </td>
                              <td>{patient.contact_no}</td>
                              <td>{patient.email}</td>
                              <td style={{ color: getStatusColor(patient.appointment_status), fontWeight: "600" }}>
                                {patient.appointment_status}
                              </td>
                              <td>{patient.created_at ? new Date(patient.created_at).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="table-pagination">
                    <span>Page {currentPage} of {lastPage}</span>
                    <div className="pagination-buttons">
                      <button onClick={() => fetchPatients(currentPage - 1)} disabled={currentPage === 1}>{"< Previous"}</button>
                      {getPageNumbers().map((n, i) =>
                        n === "..." ? (
                          <span key={`dots-${i}`} style={{ padding: "0 6px", color: "#574a65", alignSelf: "center" }}>...</span>
                        ) : (
                          <button
                            key={n}
                            onClick={() => fetchPatients(n)}
                            style={{
                              fontWeight:      n === currentPage ? "bold"    : "normal",
                              backgroundColor: n === currentPage ? "#4D227C" : "",
                              color:           n === currentPage ? "#fff"    : "",
                            }}
                          >
                            {n}
                          </button>
                        )
                      )}
                      <button onClick={() => fetchPatients(currentPage + 1)} disabled={currentPage === lastPage}>{"Next >"}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="dashboard-card">
                  <h5>Monthly Patients <small style={{ fontSize: "12px", color: "#888", marginLeft: "8px" }}>{new Date().getFullYear()}</small></h5>
                  <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: "500px", height: "300px" }}>
                      <Bar data={barData} options={barOptions} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="dashboard-card">
                  <h5>Appointment Status</h5>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <span style={{ background: "#e8f0fe", color: "#1E3A8A", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>Scheduled: {statusCounts.Scheduled}</span>
                    <span style={{ background: "#d1fae5", color: "#16A34A", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>Completed: {statusCounts.Completed}</span>
                    <span style={{ background: "#fde8e8", color: "#DC2626", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>Cancelled: {statusCounts.Cancelled}</span>
                    <span style={{ background: "#fef3c7", color: "#B45309", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>Pending: {statusCounts.Pending}</span>
                  </div>
                  <div className="pie-chart-container">
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="announcement-modal-overlay">
          <div className="announcement-modal">
            <div className="modal-header-announcement">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h2>Create Announcement</h2>
                {editingAnnouncement?.priority === "urgent" && (
                  <span style={{ background: "#DC2626", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "4px", textTransform: "uppercase" }}>URGENT</span>
                )}
              </div>
              <button className="close-btn-announcement" onClick={handleCloseAnnouncementModal}><FiX /></button>
            </div>
            <div className="modal-body-announcement">
              <div className="form-group-announcement">
                <p>Title:</p>
                <input type="text" className="form-input-announcement" placeholder="Enter announcement title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} />
              </div>
              <div className="form-group-announcement">
                <p>Message:</p>
                <textarea className="form-textarea-announcement" placeholder="Enter announcement message" rows="4" value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} />
              </div>
              <div className="form-group-announcement">
                <p>Priority:</p>
                <select className="form-select-announcement" value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent / High Priority</option>
                </select>
              </div>
            </div>
            <div className="modal-footer-announcement">
              <button className="btn-cancel-announcement" onClick={handleCloseAnnouncementModal}>Cancel</button>
              <button className="btn-post-announcement" onClick={handleSubmitAnnouncement}>Create</button>
            </div>
          </div>
        </div>
      )}

      <AccountSetupModal showModal={showSetupModal} onClose={() => setShowSetupModal(false)} />
    </div>
  );
}

export default DoctorDashboard;
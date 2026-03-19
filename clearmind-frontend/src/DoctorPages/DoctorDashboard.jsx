import { useState, useEffect } from "react";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import styles from "./DoctorStyle/DoctorDashboard.module.css";
import { FaClinicMedical, FaChevronLeft, FaChevronRight, FaBullhorn } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";
import AccountSetupModal from "./components/SetUpAccountModal";

// Chart.js
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

function DoctorDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [today, setToday] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [showSetupModal, setShowSetupModal] = useState(true);

  const [adminAnnouncements] = useState([
    {
      id: 1,
      title: "TIME OUT",
      message: "MAG TIME OUT NA TAYO",
      priority: "high",
      postedDate: "Feb 24, 2026",
    },
    {
      id: 2,
      title: "Clinic Holiday Schedule",
      message:
        "The clinic will be closed on February 25 in observance of EDSA People Power Anniversary. Please reschedule your appointments accordingly.",
      priority: "high",
      postedDate: "Feb 20, 2026",
    },
    {
      id: 3,
      title: "New Online Consultation Hours",
      message:
        "Starting March 1, online consultations will be available from 8:00 AM to 6:00 PM, Monday to Saturday.",
      priority: "normal",
      postedDate: "Feb 18, 2026",
    },
  ]);

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

  useEffect(() => {
    setShowSetupModal(true);
  }, []);

  const closeModal = () => setShowSetupModal(false);

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const patientsData = [
    { name: "Liezel Paciente", gender: "Female", date: "January 20, 2026", time: "2:00 pm", type: "Follow Up", status: "Scheduled" },
    { name: "Ara Christina Ceres", gender: "Female", date: "January 15, 2026", time: "9:00 am", type: "New Concern", status: "Completed" },
    { name: "Ara Christina Ceres", gender: "Female", date: "January 15, 2026", time: "9:00 am", type: "New Concern", status: "Scheduled" },
    { name: "Ara Christina Ceres", gender: "Female", date: "January 15, 2026", time: "9:00 am", type: "New Concern", status: "Cancelled" },
  ];

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setMonth(currentWeekStart.getMonth() + direction);
    setCurrentWeekStart(newDate);
  };

  const isToday = (date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled": return "#1E3A8A";
      case "Completed": return "#16A34A";
      case "Cancelled": return "#DC2626";
      default: return "#000";
    }
  };

  const barData = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [{
      label: "Monthly Patients",
      data: [10, 8, 6, 5, 4, 7, 9, 11, 6, 8, 5, 12],
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
        formatter: (value) => value,
      },
    },
    scales: {
      x: { ticks: { color: "#574a65", font: { family: "Poppins, sans-serif", size: 12 } } },
      y: { beginAtZero: true, ticks: { stepSize: 1, color: "#574a65", font: { family: "Poppins, sans-serif", size: 12 } } },
    },
  };

  const pieData = {
    labels: ["Completed", "Cancelled", "Scheduled"],
    datasets: [{
      label: "Appointment Status",
      data: [
        patientsData.filter((p) => p.status === "Completed").length,
        patientsData.filter((p) => p.status === "Cancelled").length,
        patientsData.filter((p) => p.status === "Scheduled").length,
      ],
      backgroundColor: ["#52a1ec", "#EF5350", "#d1a4de"],
      borderColor: "rgb(255, 255, 255)",
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
          boxWidth: 14,
          boxHeight: 14,
          padding: 10,
          color: "#4E237C",
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
        callbacks: { label: (context) => `${context.label}: ${context.raw}` },
      },
    },
    layout: {
      padding: { top: 10, bottom: 10, left: 10, right: window.innerWidth < 768 ? 10 : 60 },
    },
    cutout: "0%",
  };

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="doctor-content">
          <div className={styles["container-fluid"]}>

            {/* ── Announcements (admin style) ── */}
            <div className="row mb-4">
              <div className="col-12">
                <div className={`${styles["dashboard-card"]} ${styles["announcement-card"]}`}>
                  <div className={styles["card-header"]}>
                    <h5 className={styles["announcement-title"]}>
                      <FaBullhorn className={styles["announce-icon"]} />
                      Announcements
                    </h5>
                  </div>
                  <hr />
                  {adminAnnouncements.length === 0 ? (
                    <div className={styles["no-announce"]}>No announcements yet.</div>
                  ) : (
                    <div className={styles["announce-list"]}>
                      {adminAnnouncements.map((ann) => (
                        <div
                          key={ann.id}
                          className={`${styles["announce-item"]} ${
                            ann.priority === "high"
                              ? styles["announce-high"]
                              : styles["announce-normal"]
                          }`}
                        >
                          <div className={styles["announce-left"]}>
                            <div className={styles["announce-item-header"]}>
                              {ann.priority === "high" && (
                                <span className={styles["priority-badge"]}>Urgent</span>
                              )}
                              <strong className={styles["announce-item-title"]}>
                                {ann.title}
                              </strong>
                            </div>
                            <p className={styles["announce-message"]}>{ann.message}</p>
                            <small className={styles["announce-date"]}>
                              Posted: {ann.postedDate}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Today's Appointment + Calendar */}
            <div className="row g-4">
              <div className="col-md-6">
                <div className={styles["dashboard-card"]}>
                  <div className={styles["card-header"]}>
                    <h5>Today's Appointment</h5>
                    <div className={styles["card-date"]}>
                      {formattedDate} <span>1</span>
                    </div>
                  </div>
                  <hr />
                  <div className={styles["card-body"]}>
                    <div className={styles["appointment-items"]}>
                      <div className={styles["appointment-icon-text"]}>
                        <IoVideocam className={styles["appointment-icon"]} />
                        <strong>Online Clinic</strong>
                      </div>
                      <p>1 Appointment</p>
                    </div>
                    <div className={styles["appointment-items"]}>
                      <div className={styles["appointment-icon-text"]}>
                        <FaClinicMedical className={styles["appointment-icon"]} />
                        <strong>Physical Clinic</strong>
                      </div>
                      <p>0 Appointment</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className={styles["dashboard-card"]}>
                  <div className={styles["card-header"]}>
                    <h5>Calendar</h5>
                    <div className={styles["week-navigation"]}>
                      <button className={styles["week-nav-btn"]} onClick={() => navigateWeek(-1)}>
                        <FaChevronLeft />
                      </button>
                      <span className={styles["week-range"]}>
                        {currentWeekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </span>
                      <button className={styles["week-nav-btn"]} onClick={() => navigateWeek(1)}>
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                  <hr />
                  <div className={styles["card-body"]}>
                    <div className={styles["calendar-grid"]}>
                      <div className={styles["calendar-header"]}>
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <div key={day} className={styles["calendar-day-label"]}>{day}</div>
                        ))}
                      </div>
                      <div className={styles["calendar-dates"]}>
                        {(() => {
                          const dates = [];
                          const firstDay = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 1);
                          const lastDay = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth() + 1, 0);
                          const startDay = firstDay.getDay();
                          const daysInMonth = lastDay.getDate();
                          const prevMonthLastDay = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), 0).getDate();

                          for (let i = startDay - 1; i >= 0; i--) {
                            dates.push(
                              <div key={`prev-${i}`} className={`${styles["calendar-date"]} ${styles["other-month"]}`}>
                                {prevMonthLastDay - i}
                              </div>
                            );
                          }
                          for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), day);
                            dates.push(
                              <div key={day} className={`${styles["calendar-date"]} ${isToday(date) ? styles["today"] : ""}`}>
                                {day}
                              </div>
                            );
                          }
                          const remainingCells = 42 - dates.length;
                          for (let day = 1; day <= remainingCells; day++) {
                            dates.push(
                              <div key={`next-${day}`} className={`${styles["calendar-date"]} ${styles["other-month"]}`}>
                                {day}
                              </div>
                            );
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
                <div className={styles["dashboard-card"]}>
                  <div className={styles["card-header"]}>
                    <h5>Total's Patients</h5>
                    <div className={styles["card-date"]}>
                      <span>{patientsData.length}</span>
                    </div>
                  </div>
                  <hr />
                  <div className={`${styles["card-body"]} ${styles["table-responsive"]}`}>
                    <table className={styles["patients-table"]}>
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
                            <td style={{ color: getStatusColor(patient.status) }}>{patient.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={styles["table-pagination"]}>
                    <span>Page 1 of 5</span>
                    <div className={styles["pagination-buttons"]}>
                      <button>{"< Previous"}</button>
                      {[1, 2, 3, 4, 5].map((n) => <button key={n}>{n}</button>)}
                      <button>{"Next >"}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="row mt-4">
              <div className="col-md-6">
                <div className={styles["dashboard-card"]}>
                  <h5>Monthly Patients</h5>
                  <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: "900px", height: "300px" }}>
                      <Bar data={barData} options={barOptions} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles["dashboard-card"]}>
                  <h5>Appointment Status</h5>
                  <div className={styles["pie-chart-container"]}>
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <AccountSetupModal showModal={showSetupModal} onClose={closeModal} />
    </div>
  );
}

export default DoctorDashboard;
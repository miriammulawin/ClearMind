import { useState, useEffect } from "react";
import DoctorSidebar from "./DoctorSideBar";
import DoctorTopNavbar from "./DoctorTopNavbar";
import "./DoctorStyle/DoctorDashboard.css";
import { FaClinicMedical, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoVideocam } from "react-icons/io5";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setToday(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Set to start of current week (Monday)
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Adjust to Monday
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    setCurrentWeekStart(startOfWeek);
  }, []);

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

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

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setMonth(currentWeekStart.getMonth() + direction);
    setCurrentWeekStart(newDate);
  };

  const isToday = (date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

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
        font: {
          family: "Poppins, sans-serif",
          size: 10,
          weight: "100",
        },
        formatter: (value) => value,
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
        borderColor: "rgb(255, 255, 255)",
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
        font: {
          family: "Poppins, sans-serif",
          size: 14,
          weight: "100",
        },
      },
      tooltip: {
        bodyFont: { family: "Poppins, sans-serif" },
        titleFont: { family: "Poppins, sans-serif", weight: "900" },
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
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
    <div className="doctor-layout">
      <DoctorSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="doctor-content">
          <div className="container-fluid">
            <div className="row g-4">
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

              <div className="col-md-6">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h5>Calendar</h5>
                    <div className="week-navigation">
                      <button
                        className="week-nav-btn"
                        onClick={() => navigateWeek(-1)}
                      >
                        <FaChevronLeft />
                      </button>
                      <span className="week-range">
                        {currentWeekStart.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        className="week-nav-btn"
                        onClick={() => navigateWeek(1)}
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                  <hr />
                  <div className="card-body">
                    <div className="calendar-grid">
                      {/* Day headers */}
                      <div className="calendar-header">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                          <div key={day} className="calendar-day-label">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar dates */}
                      <div className="calendar-dates">
                        {(() => {
                          const dates = [];
                          const firstDay = new Date(
                            currentWeekStart.getFullYear(),
                            currentWeekStart.getMonth(),
                            1
                          );
                          const lastDay = new Date(
                            currentWeekStart.getFullYear(),
                            currentWeekStart.getMonth() + 1,
                            0
                          );
                          const startDay = firstDay.getDay();
                          const daysInMonth = lastDay.getDate();

                          // Previous month's trailing days
                          const prevMonthLastDay = new Date(
                            currentWeekStart.getFullYear(),
                            currentWeekStart.getMonth(),
                            0
                          ).getDate();

                          for (let i = startDay - 1; i >= 0; i--) {
                            dates.push(
                              <div key={`prev-${i}`} className="calendar-date other-month">
                                {prevMonthLastDay - i}
                              </div>
                            );
                          }

                          // Current month's days
                          for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(
                              currentWeekStart.getFullYear(),
                              currentWeekStart.getMonth(),
                              day
                            );
                            const todayCheck = isToday(date);

                            dates.push(
                              <div
                                key={day}
                                className={`calendar-date ${todayCheck ? "today" : ""}`}
                              >
                                {day}
                              </div>
                            );
                          }

                          // Next month's leading days
                          const remainingCells = 42 - dates.length; // 6 rows × 7 days
                          for (let day = 1; day <= remainingCells; day++) {
                            dates.push(
                              <div key={`next-${day}`} className="calendar-date other-month">
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
    </div>
  );
}

export default DoctorDashboard;
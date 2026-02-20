import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import DoctorSidebar from "./DoctorSideBar";
import DoctorTopNavbar from "./DoctorTopNavbar";
import "./DoctorStyle/DoctorDashboard.css";
import { FaClinicMedical, FaChevronLeft, FaChevronRight } from "react-icons/fa";
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
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement, ChartDataLabels
);

function DoctorDashboard() {
  const [activeMenu, setActiveMenu]             = useState("Dashboard");
  const [today, setToday]                       = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  // ── Patients state ──────────────────────────────────────────────
  const [patientsData, setPatientsData]   = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [currentPage, setCurrentPage]     = useState(1);
  const [lastPage, setLastPage]           = useState(1);
  const [loading, setLoading]             = useState(false);

  // ── Status counts for pie chart ─────────────────────────────────
  const [statusCounts, setStatusCounts] = useState({
    Scheduled: 0,
    Cancelled: 0,
    Pending:   0,
  });

  // ── Monthly patients for bar chart ──────────────────────────────
  const [monthlyData, setMonthlyData] = useState(
    Array(12).fill(0)
  );

  // ── Fetch patients ──────────────────────────────────────────────
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

  // ── Fetch status counts ─────────────────────────────────────────
  const fetchStatusCounts = async () => {
    try {
      const res = await axiosClient.get("/doctor/status-counts");
      setStatusCounts(res.data);
    } catch (err) {
      console.error("Failed to fetch status counts:", err);
    }
  };

  // ── Fetch monthly patients ──────────────────────────────────────
  const fetchMonthlyPatients = async () => {
    try {
      const res = await axiosClient.get("/doctor/monthly-patients");
      setMonthlyData(res.data);
    } catch (err) {
      console.error("Failed to fetch monthly patients:", err);
    }
  };

  // ── On mount ────────────────────────────────────────────────────
  useEffect(() => {
    fetchPatients(1);
    fetchStatusCounts();
    fetchMonthlyPatients();
  }, []);

  // ── Timer ───────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Calendar week start ─────────────────────────────────────────
  useEffect(() => {
    const startOfWeek = new Date(today);
    const day  = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    setCurrentWeekStart(startOfWeek);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const parts = String(dateStr).split("T")[0].split("-");
      if (parts.length !== 3) return "N/A";
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      });
    } catch { return "N/A"; }
  };

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

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
      case "Cancelled": return "#DC2626";
      case "Pending":   return "#B45309";
      default:          return "#000";
    }
  };

  // ── Smart pagination ────────────────────────────────────────────
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;

    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage > delta + 2) pages.push("...");

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(lastPage - 1, currentPage + delta);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < lastPage - delta - 1) pages.push("...");
    pages.push(lastPage);

    return pages;
  };

  // ── Bar chart — REAL monthly data ───────────────────────────────
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
        ticks: {
          stepSize: 1,
          color: "#574a65",
          font: { family: "Poppins, sans-serif", size: 12 },
        },
      },
    },
  };

  // ── Pie chart — real data ───────────────────────────────────────
  const pieData = {
    labels: ["Scheduled", "Cancelled", "Pending"],
    datasets: [{
      label: "Appointment Status",
      data: [
        statusCounts.Scheduled,
        statusCounts.Cancelled,
        statusCounts.Pending,
      ],
      backgroundColor: ["#52a1ec", "#EF5350", "#d1a4de"],
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
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}` },
      },
    },
    layout: {
      padding: {
        top: 10, bottom: 10, left: 10,
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

            {/* ── Row 1: Appointments + Calendar ── */}
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
                      <button className="week-nav-btn" onClick={() => navigateWeek(-1)}>
                        <FaChevronLeft />
                      </button>
                      <span className="week-range">
                        {currentWeekStart.toLocaleDateString("en-US", {
                          month: "long", year: "numeric",
                        })}
                      </span>
                      <button className="week-nav-btn" onClick={() => navigateWeek(1)}>
                        <FaChevronRight />
                      </button>
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
                          const firstDay = new Date(
                            currentWeekStart.getFullYear(),
                            currentWeekStart.getMonth(), 1
                          );
                          const lastDay = new Date(
                            currentWeekStart.getFullYear(),
                            currentWeekStart.getMonth() + 1, 0
                          );
                          const startDay         = firstDay.getDay();
                          const daysInMonth      = lastDay.getDate();
                          const prevMonthLastDay = new Date(
                            currentWeekStart.getFullYear(),
                            currentWeekStart.getMonth(), 0
                          ).getDate();

                          for (let i = startDay - 1; i >= 0; i--)
                            dates.push(
                              <div key={`prev-${i}`} className="calendar-date other-month">
                                {prevMonthLastDay - i}
                              </div>
                            );

                          for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(
                              currentWeekStart.getFullYear(),
                              currentWeekStart.getMonth(), day
                            );
                            dates.push(
                              <div key={day} className={`calendar-date ${isToday(date) ? "today" : ""}`}>
                                {day}
                              </div>
                            );
                          }

                          const remaining = 42 - dates.length;
                          for (let day = 1; day <= remaining; day++)
                            dates.push(
                              <div key={`next-${day}`} className="calendar-date other-month">
                                {day}
                              </div>
                            );

                          return dates;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 2: Patients Table ── */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h5>Total Patients</h5>
                    <div className="card-date">
                      <span>{totalPatients}</span>
                    </div>
                  </div>
                  <hr />
                  <div className="card-body table-responsive">
                    {loading ? (
                      <p className="text-center py-3">Loading...</p>
                    ) : (
                      <table className="patients-table">
                        <thead>
                          <tr>
                            <th>#</th>
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
                            <tr key={patient.id}>
                              <td>{(currentPage - 1) * 10 + index + 1}</td>
                              <td>{patient.first_name} {patient.last_name}</td>
                              <td>{capitalize(patient.sex)}</td>
                              <td>{formatDate(patient.dob)}</td>
                              <td>{patient.contact_no}</td>
                              <td>{patient.email}</td>
                              <td style={{
                                color: getStatusColor(patient.appointment_status),
                                fontWeight: "600",
                              }}>
                                {patient.appointment_status}
                              </td>
                              <td>{formatDate(patient.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* ── Smart Pagination ── */}
                  <div className="table-pagination">
                    <span>Page {currentPage} of {lastPage}</span>
                    <div className="pagination-buttons">
                      <button
                        onClick={() => fetchPatients(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        {"< Previous"}
                      </button>

                      {getPageNumbers().map((n, i) =>
                        n === "..." ? (
                          <span
                            key={`dots-${i}`}
                            style={{ padding: "0 6px", color: "#574a65", alignSelf: "center" }}
                          >
                            ...
                          </span>
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

                      <button
                        onClick={() => fetchPatients(currentPage + 1)}
                        disabled={currentPage === lastPage}
                      >
                        {"Next >"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 3: Charts ── */}
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

                  {/* Status count badges */}
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
                    <span style={{
                      background: "#e8f0fe", color: "#1E3A8A",
                      padding: "4px 14px", borderRadius: "20px",
                      fontSize: "13px", fontWeight: "600",
                    }}>
                      Scheduled: {statusCounts.Scheduled}
                    </span>
                    <span style={{
                      background: "#fde8e8", color: "#DC2626",
                      padding: "4px 14px", borderRadius: "20px",
                      fontSize: "13px", fontWeight: "600",
                    }}>
                      Cancelled: {statusCounts.Cancelled}
                    </span>
                    <span style={{
                      background: "#fef3c7", color: "#B45309",
                      padding: "4px 14px", borderRadius: "20px",
                      fontSize: "13px", fontWeight: "600",
                    }}>
                      Pending: {statusCounts.Pending}
                    </span>
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
    </div>
  );
}

export default DoctorDashboard;
import { useState, useEffect } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminDashboard.css";
import axiosClient from "../axiosClient";
import { FaClinicMedical } from "react-icons/fa";
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
  Title, Tooltip, Legend, ArcElement, ChartDataLabels,
);

function AdminDashboard() {
  const [patientsData, setPatientsData]     = useState([]);
  const [totalClients, setTotalClients]     = useState(0);
  const [currentPage, setCurrentPage]       = useState(1);
  const [lastPage, setLastPage]             = useState(1);
  const [loading, setLoading]               = useState(false);

  const [statusCounts, setStatusCounts] = useState({
    Scheduled: 0,
    Completed: 0,
    Cancelled: 0,
    Pending: 0,
  });

  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));
  const [activeMenu, setActiveMenu]   = useState("Dashboard");
  const [today, setToday]             = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAppointments(1);
    fetchStatusCounts();
    fetchMonthlyPatients();
    fetchTotalClients();
  }, []);

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short", day: "2-digit", year: "numeric",
  });

  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/admin/dashboard?page=${page}`);
      const { data, last_page, current_page } = res.data;
      setPatientsData(data);
      setLastPage(last_page);
      setCurrentPage(current_page);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalClients = async () => {
    try {
      const res = await axiosClient.get("/admin/total-clients");
      setTotalClients(res.data.total);
    } catch (err) {
      console.error("Failed to fetch total clients:", err);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const res = await axiosClient.get("/admin/status-counts");
      const { Scheduled, Completed, Cancelled, Pending } = res.data;
      setStatusCounts({ Scheduled, Completed, Cancelled, Pending });
    } catch (err) {
      console.error("Failed to fetch status counts:", err);
    }
  };

  const fetchMonthlyPatients = async () => {
    try {
      const res = await axiosClient.get("/admin/monthly-patients");
      setMonthlyData(res.data);
    } catch (err) {
      console.error("Failed to fetch monthly patients:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled": return "#1E3A8A";
      case "Completed": return "#16A34A";
      case "Cancelled": return "#DC2626";
      case "Pending":   return "#B45309";
      default:          return "#000";
    }
  };

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
    ) { pages.push(i); }
    if (currentPage < lastPage - delta - 1) pages.push("...");
    pages.push(lastPage);
    return pages;
  };

  // ── Bar chart ───────────────────────────────────────────────────
  const maxMonthly = Math.max(...monthlyData, 1);

  const barData = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [{
      label: "Monthly Appointments",
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
      x: {
        ticks: { color: "#574a65", font: { family: "Poppins, sans-serif", size: 12 } },
      },
      y: {
        beginAtZero: true,
        max: maxMonthly + Math.ceil(maxMonthly * 0.2), // 20% gap above tallest bar
        ticks: {
          stepSize: Math.ceil(maxMonthly / 6), // dynamic steps based on data
          color: "#574a65",
          font: { family: "Poppins, sans-serif", size: 12 },
        },
      },
    },
  };

  // ── Pie chart ───────────────────────────────────────────────────
  const pieData = {
    labels: ["Completed", "Cancelled", "Scheduled", "Pending"],
    datasets: [{
      label: "Appointment Status",
      data: [statusCounts.Completed, statusCounts.Cancelled, statusCounts.Scheduled, statusCounts.Pending],
      backgroundColor: ["#52a1ec", "#EF5350", "#d1a4de", "#f5a623"],
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
      padding: { top: 10, bottom: 10, left: 10, right: window.innerWidth < 768 ? 10 : 60 },
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

            {/* Row 1 */}
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
                    <h5>Consultation Request</h5>
                    <div className="card-date">{formattedDate} <span>1</span></div>
                  </div>
                  <hr />
                  <div className="card-body">
                    <div className="consult-item">
                      <div>
                        <p><strong>Name:</strong> Liezel Paciente</p>
                        <p><strong>Time:</strong> 2:00 PM</p>
                      </div>
                      <button className="btn-view">View</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h5>Total Patients</h5>
                    <div className="card-date">
                      <span>{totalClients}</span>
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
                            <th>Date of Appointment</th>
                            <th>Time</th>
                            <th>Visit Type</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientsData.map((patient, index) => (
                            <tr key={index}>
                              <td>{(currentPage - 1) * 10 + index + 1}</td>
                              <td>{patient.name}</td>
                              <td>{patient.gender}</td>
                              <td>{patient.date}</td>
                              <td>{patient.time}</td>
                              <td>{patient.type}</td>
                              <td style={{ color: getStatusColor(patient.status), fontWeight: "600" }}>
                                {patient.status}
                              </td>
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
                      <button onClick={() => fetchAppointments(currentPage - 1)} disabled={currentPage === 1}>
                        {"< Previous"}
                      </button>
                      {getPageNumbers().map((n, i) =>
                        n === "..." ? (
                          <span key={`dots-${i}`} style={{ padding: "0 6px", color: "#574a65", alignSelf: "center" }}>...</span>
                        ) : (
                          <button
                            key={n}
                            onClick={() => fetchAppointments(n)}
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
                      <button onClick={() => fetchAppointments(currentPage + 1)} disabled={currentPage === lastPage}>
                        {"Next >"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="dashboard-card">
                  <h5>
                    Monthly Appointments
                    <small style={{ fontSize: "12px", color: "#888", marginLeft: "8px" }}>
                      {new Date().getFullYear()}
                    </small>
                  </h5>
                  {/* ── same scrollable pattern as Doctor Dashboard ── */}
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
                    <span style={{ background: "#e8f0fe", color: "#1E3A8A", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
                      Scheduled: {statusCounts.Scheduled}
                    </span>
                    <span style={{ background: "#d1fae5", color: "#16A34A", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
                      Completed: {statusCounts.Completed}
                    </span>
                    <span style={{ background: "#fde8e8", color: "#DC2626", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
                      Cancelled: {statusCounts.Cancelled}
                    </span>
                    <span style={{ background: "#fef3c7", color: "#D97706", padding: "4px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
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

export default AdminDashboard;
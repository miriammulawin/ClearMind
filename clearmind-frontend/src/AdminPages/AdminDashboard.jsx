import { useState, useEffect } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminDashboard.css";
import { FaClinicMedical } from "react-icons/fa";
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
import { color } from "chart.js/helpers";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setToday(new Date());
    }, 60000);
    return () => clearInterval(timer);
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
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className="admin-content">

       
            <div className="row g-4">

              {/* Today's Appointments */}
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

              {/* Consultation Requests */}
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
                      <button className="verify-btn">Verify</button>
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
                    <h5>Total Patients</h5>
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
    
  );
}

export default AdminDashboard;

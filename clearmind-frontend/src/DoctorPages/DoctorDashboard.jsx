import { useState, useEffect, useCallback } from "react";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import styles from "./DoctorStyle/DoctorDashboard.module.css";
import axiosClient from "../axiosClient";
import {
  FaClinicMedical,
  FaChevronLeft,
  FaChevronRight,
  FaBullhorn,
} from "react-icons/fa";
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

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  return new Date(`1970-01-01T${timeStr}`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "—";

function normalizeAppointment(a) {
  const patient = a.patient ?? {};
  const patientName = patient.firstName
    ? `${patient.firstName}${patient.middleInitial ? " " + patient.middleInitial + "." : ""} ${patient.lastName}`
    : "Unknown";

  return {
    id: a.appointment_id,
    patient: patientName,
    rawDate: a.appointment_date ?? null,
    date: formatDate(a.appointment_date),
    time: formatTime(a.start_time),
    visitType: a.visit_type ?? "—",
    status: capitalize(a.status ?? "pending"),
    service: a.service_type ?? "—",
    payment: a.payment_status ?? "—",
  };
}

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
function DoctorDashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [today, setToday] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [showSetupModal, setShowSetupModal] = useState(true);

  /* ── Announcements ── */
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);

  /* ── Today's appointments ── */
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayOnline, setTodayOnline] = useState(0);
  const [todayPhysical, setTodayPhysical] = useState(0);

  /* ── Appointments table ── */
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const APPOINTMENTS_PER_PAGE = 10;

  /* ── Monthly chart data ── */
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));

  /* ══════════════════════════════════════════════
     DATA FETCHING
  ══════════════════════════════════════════════ */

  /**
   * Fetch announcements from shared endpoint.
   * Backend automatically filters by the logged-in user's role,
   * so doctors only see audience = 'all' or 'doctors'.
   */
  const fetchAnnouncements = useCallback(async () => {
    try {
      setAnnouncementsLoading(true);
      const { data } = await axiosClient.get("admin/announcements");
      setAnnouncements(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("fetchAnnouncements:", err);
      setAnnouncements([]);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  /**
   * Fetch the doctor's own appointments.
   * Adjust the endpoint to whatever your backend exposes for the
   * authenticated doctor, e.g. GET /doctor/appointments.
   */
  const fetchAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      const { data } = await axiosClient.get("/admin/appointments");
      const all = (Array.isArray(data.data) ? data.data : []).map(
        normalizeAppointment,
      );
      setAppointments(all);

      // Today string "YYYY-MM-DD" in local time
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      // Today's confirmed appointments
      const todays = all.filter(
        (a) =>
          a.rawDate &&
          a.rawDate.slice(0, 10) === todayStr &&
          ["confirmed", "Confirmed"].includes(a.status),
      );
      setTodayTotal(todays.length);
      setTodayOnline(todays.filter((a) => a.visitType === "virtual").length);
      setTodayPhysical(todays.filter((a) => a.visitType === "onsite").length);

      // Monthly bar chart — count by appointment month
      const monthly = Array(12).fill(0);
      all.forEach((a) => {
        if (!a.rawDate) return;
        const m = new Date(a.rawDate).getMonth();
        if (m >= 0 && m < 12) monthly[m]++;
      });
      setMonthlyData(monthly);
    } catch (err) {
      console.error("fetchAppointments:", err);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  /* Initial load */
  useEffect(() => {
    fetchAnnouncements();
    fetchAppointments();
  }, [fetchAnnouncements, fetchAppointments]);

  /* Clock tick */
  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  /* Set week start once on mount */
  useEffect(() => {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    setCurrentWeekStart(startOfWeek);
  }, []);

  useEffect(() => {
    setShowSetupModal(true);
  }, []);

  const closeModal = () => setShowSetupModal(false);

  /* ══════════════════════════════════════════════
     DERIVED DATA
  ══════════════════════════════════════════════ */

  const totalPages = Math.ceil(appointments.length / APPOINTMENTS_PER_PAGE);
  const paginatedAppointments = appointments.slice(
    (currentPage - 1) * APPOINTMENTS_PER_PAGE,
    currentPage * APPOINTMENTS_PER_PAGE,
  );

  /* ══════════════════════════════════════════════
     UI HELPERS
  ══════════════════════════════════════════════ */

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const navigateMonth = (direction) => {
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
      case "Scheduled":
      case "Confirmed":
        return "#1E3A8A";
      case "Completed":
        return "#16A34A";
      case "Cancelled":
        return "#DC2626";
      case "Pending":
        return "#D97706";
      default:
        return "#000";
    }
  };

  /* ══════════════════════════════════════════════
     CHART CONFIG
  ══════════════════════════════════════════════ */

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
        label: "Monthly Appointments",
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
        formatter: (value) => (value > 0 ? value : ""),
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

  const completedCount = appointments.filter(
    (a) => a.status === "Completed",
  ).length;
  const cancelledCount = appointments.filter(
    (a) => a.status === "Cancelled",
  ).length;
  const scheduledCount = appointments.filter((a) =>
    ["Scheduled", "Confirmed"].includes(a.status),
  ).length;
  const pendingCount = appointments.filter(
    (a) => a.status === "Pending",
  ).length;

  const pieData = {
    labels: ["Completed", "Cancelled", "Confirmed", "Pending"],
    datasets: [
      {
        label: "Appointment Status",
        data: [completedCount, cancelledCount, scheduledCount, pendingCount],
        backgroundColor: ["#52a1ec", "#EF5350", "#d1a4de", "#FCD34D"],
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
        font: { family: "Poppins, sans-serif", size: 14, weight: "100" },
        formatter: (value) => (value > 0 ? value : ""),
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

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="doctor-content">
          <div className={styles.containerFluid}>
            {/* ── Announcements ── */}
            <div className="row mb-4">
              <div className="col-12">
                <div
                  className={`${styles.dashboardCard} ${styles.announcementCard}`}
                >
                  <div className={styles.cardHeader}>
                    <h5 className={styles.announcementTitle}>
                      <FaBullhorn className={styles.announceIcon} />
                      Announcements
                    </h5>
                  </div>
                  <hr />

                  {announcementsLoading ? (
                    <div className={styles.noAnnounce}>
                      Loading announcements…
                    </div>
                  ) : announcements.length === 0 ? (
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
                              Posted:{" "}
                              {ann.created_at
                                ? new Date(ann.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "2-digit",
                                      year: "numeric",
                                    },
                                  )
                                : (ann.postedDate ?? "—")}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Today's Appointment + Calendar ── */}
            <div className="row g-4">
              {/* Today's Appointment */}
              <div className="col-md-6">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>Today's Appointments</h5>
                    <div className={styles.cardDate}>
                      {formattedDate} <span>{todayTotal}</span>
                    </div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    <div className={styles.appointmentItems}>
                      <div className={styles.appointmentIconText}>
                        <IoVideocam className={styles.appointmentIcon} />
                        <strong>Online Clinic</strong>
                      </div>
                      <p>
                        {todayOnline} Appointment{todayOnline !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className={styles.appointmentItems}>
                      <div className={styles.appointmentIconText}>
                        <FaClinicMedical className={styles.appointmentIcon} />
                        <strong>Physical Clinic</strong>
                      </div>
                      <p>
                        {todayPhysical} Appointment
                        {todayPhysical !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="col-md-6">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>Calendar</h5>
                    <div className={styles.weekNavigation}>
                      <button
                        className={styles.weekNavBtn}
                        onClick={() => navigateMonth(-1)}
                      >
                        <FaChevronLeft />
                      </button>
                      <span className={styles.weekRange}>
                        {currentWeekStart.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        className={styles.weekNavBtn}
                        onClick={() => navigateMonth(1)}
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                  <hr />
                  <div className={styles.cardBody}>
                    <div className={styles.calendarGrid}>
                      <div className={styles.calendarHeader}>
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                          (day) => (
                            <div key={day} className={styles.calendarDayLabel}>
                              {day}
                            </div>
                          ),
                        )}
                      </div>
                      <div className={styles.calendarDates}>
                        {(() => {
                          const dates = [];
                          const firstDay = new Date(
                            currentWeekStart.getFullYear(),
                            currentWeekStart.getMonth(),
                            1,
                          );
                          const lastDay = new Date(
                            currentWeekStart.getFullYear(),
                            currentWeekStart.getMonth() + 1,
                            0,
                          );
                          const startDay = firstDay.getDay();
                          const daysInMonth = lastDay.getDate();
                          const prevMonthLastDay = new Date(
                            currentWeekStart.getFullYear(),
                            currentWeekStart.getMonth(),
                            0,
                          ).getDate();

                          for (let i = startDay - 1; i >= 0; i--) {
                            dates.push(
                              <div
                                key={`prev-${i}`}
                                className={`${styles.calendarDate} ${styles.otherMonth}`}
                              >
                                {prevMonthLastDay - i}
                              </div>,
                            );
                          }
                          for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(
                              currentWeekStart.getFullYear(),
                              currentWeekStart.getMonth(),
                              day,
                            );
                            dates.push(
                              <div
                                key={day}
                                className={`${styles.calendarDate} ${isToday(date) ? styles.today : ""}`}
                              >
                                {day}
                              </div>,
                            );
                          }
                          const remainingCells = 42 - dates.length;
                          for (let day = 1; day <= remainingCells; day++) {
                            dates.push(
                              <div
                                key={`next-${day}`}
                                className={`${styles.calendarDate} ${styles.otherMonth}`}
                              >
                                {day}
                              </div>,
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

            {/* ── Appointments Table ── */}
            <div className="row mt-4">
              <div className="col-12">
                <div className={styles.dashboardCard}>
                  <div className={styles.cardHeader}>
                    <h5>My Appointments</h5>
                    <div className={styles.cardDate}>
                      <span>{appointments.length}</span>
                    </div>
                  </div>
                  <hr />
                  <div
                    className={`${styles.cardBody} ${styles.tableResponsive}`}
                  >
                    {appointmentsLoading ? (
                      <div className={styles.loadingState ?? {}}>
                        <p>Loading appointments…</p>
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className={styles.emptyState ?? {}}>
                        <p>No appointments found.</p>
                      </div>
                    ) : (
                      <table className={styles.patientsTable}>
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Visit Type</th>
                            <th>Service</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedAppointments.map((appt) => (
                            <tr key={appt.id}>
                              <td>{appt.patient}</td>
                              <td>{appt.date}</td>
                              <td>{appt.time}</td>
                              <td>{capitalize(appt.visitType)}</td>
                              <td>{appt.service}</td>
                              <td
                                style={{
                                  color: getStatusColor(appt.status),
                                  fontWeight: "bold",
                                }}
                              >
                                {appt.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {!appointmentsLoading && totalPages > 1 && (
                    <div className={styles.tablePagination}>
                      <span>
                        Page {currentPage} of {totalPages} (
                        {appointments.length} total)
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
                          (_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              className={
                                currentPage === i + 1 ? styles.activePage : ""
                              }
                            >
                              {i + 1}
                            </button>
                          ),
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
            <div className="row mt-4">
              <div className="col-md-6">
                <div className={styles.dashboardCard}>
                  <h5>Monthly Appointments</h5>
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

      <AccountSetupModal showModal={showSetupModal} onClose={closeModal} />
    </div>
  );
}

export default DoctorDashboard;

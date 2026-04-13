import { useState, useCallback, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  parseISO,
  isValid,
} from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminAppointment.module.css";
import CreateAppointmentModal from "../DoctorPages/components/CreateAppointmentModal";
import DayAppointmentsModal from "../DoctorPages/components/DayAppointmentsModal";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const getToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  "";

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

function appointmentToEvent(appt) {
  const dateStr = appt.appointment_date ?? "";
  const startStr = (appt.start_time ?? "00:00").substring(0, 5);
  const endStr = (appt.end_time ?? "00:00").substring(0, 5);

  const startDate = parseISO(`${dateStr}T${startStr}:00`);
  const endDate = parseISO(`${dateStr}T${endStr}:00`);

  const patient = appt.patient
    ? `${appt.patient.firstName ?? ""} ${appt.patient.lastName ?? ""}`.trim()
    : "Unknown Patient";

  return {
    id: appt.appointment_id,
    title: patient,
    start: isValid(startDate) ? startDate : new Date(dateStr),
    end: isValid(endDate) ? endDate : new Date(dateStr),
    serviceType: appt.service_type ?? "",
    visitType: appt.visit_type ?? "",
    assessmentPurpose: appt.pae_purpose ?? "",
    status: appt.status ?? "confirmed",
    paymentStatus: appt.payment_status ?? "not_paid",
    doctor: appt.doctor ?? null,
    bookedBy: appt.bookedBy ?? appt.booked_by ?? null,
    patientData: appt.patient ?? null,
    raw: appt,
  };
}

const isPsychAssessment = (serviceType = "") =>
  serviceType.toLowerCase().includes("psychological assessment") ||
  serviceType.toLowerCase().includes("assessment and evaluation");

const EVENT_PALETTE = {
  counseling: { bg: "#6b7280", border: "#4b5563" },
  vawc: { bg: "#4D227C", border: "#3b1a5e" },
  legal: { bg: "#8B4545", border: "#6e3535" },
  school: { bg: "#1e6091", border: "#154c73" },
  work: { bg: "#2d6a4f", border: "#1e4d38" },
};

const getEventPalette = (event) => {
  const svc = event.serviceType || event.visitType || "";
  if (isPsychAssessment(svc)) {
    switch (event.assessmentPurpose) {
      case "VAWC":
        return EVENT_PALETTE.vawc;
      case "Adoption or Legal":
        return EVENT_PALETTE.legal;
      case "School / Academic Support":
        return EVENT_PALETTE.school;
      case "Work-Related":
        return EVENT_PALETTE.work;
      default:
        return EVENT_PALETTE.work;
    }
  }
  return EVENT_PALETTE.counseling;
};

const LEGEND = [
  { label: "Counseling / Therapy", color: EVENT_PALETTE.counseling.bg },
  { label: "PA — VAWC", color: EVENT_PALETTE.vawc.bg },
  { label: "PA — Adoption / Legal", color: EVENT_PALETTE.legal.bg },
  { label: "PA — School / Academic", color: EVENT_PALETTE.school.bg },
  { label: "PA — Work-Related", color: EVENT_PALETTE.work.bg },
];

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 400,
        gap: 16,
        color: "#6b7280",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          border: "3px solid #e5e7eb",
          borderTop: "3px solid #4D227C",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 14 }}>Loading appointments…</span>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div
      style={{
        margin: "16px 0",
        padding: "14px 18px",
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <span style={{ color: "#991b1b", fontSize: 14 }}>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "6px 14px",
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

function StatsBar({ events }) {
  const counts = events.reduce((acc, e) => {
    const s = e.status || "confirmed";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const items = [
    { label: "Total", value: events.length, color: "#4D227C" },
    { label: "Confirmed", value: counts.confirmed || 0, color: "#059669" },
    { label: "Completed", value: counts.completed || 0, color: "#2563eb" },
    { label: "No Show", value: counts.no_show || 0, color: "#dc2626" },
  ];

  return (
    <div
      style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}
    >
      {items.map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            flex: "1 1 100px",
            minWidth: 100,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color }}>{value}</span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

const filterInputStyle = {
  padding: "7px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 13,
  color: "#374151",
  background: "#fff",
  cursor: "pointer",
};

function FilterBar({ filters, onChange, onClear }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
        style={filterInputStyle}
      >
        <option value="">Confirmed (default)</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="no_show">No Show</option>
      </select>

      <input
        type="date"
        value={filters.date}
        onChange={(e) => onChange({ ...filters, date: e.target.value })}
        style={filterInputStyle}
      />

      {(filters.status || filters.date) && (
        <button
          onClick={onClear}
          style={{
            padding: "7px 14px",
            background: "transparent",
            border: "1px solid #d1d5db",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            color: "#6b7280",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

/* ── Main Component ── */
function AdminAppointment() {
  const [activeMenu, setActiveMenu] = useState("Appointment");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: "", date: "" });

  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [singleEventId, setSingleEventId] = useState(null);

  /* ── Fetch CONFIRMED appointments only for the calendar ── */
  const fetchAppointments = useCallback(async (activeFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Default to confirmed — calendar only shows confirmed appointments
      const statusFilter = activeFilters.status || "confirmed";
      params.append("status", statusFilter);

      if (activeFilters.date) params.append("date", activeFilters.date);

      const url = `${API_BASE}/admin/appointments?${params.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: authHeaders(),
        credentials: "include",
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          msg = body.message ?? body.error ?? msg;
        } catch (_) {}
        throw new Error(msg);
      }

      const body = await res.json();
      const records = Array.isArray(body.data) ? body.data : [];

      // Extra client-side guard — only confirmed/completed on calendar
      const allowed = ["confirmed", "completed", "no_show"];
      const filtered = records.filter((r) =>
        allowed.includes((r.status ?? "").toLowerCase()),
      );

      setEvents(filtered.map(appointmentToEvent));
    } catch (err) {
      console.error("[AdminAppointment] fetch error:", err);
      setError(`Failed to load appointments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchAppointments(filters), 300);
    return () => clearTimeout(timer);
  }, [filters, fetchAppointments]);

  /* ── Add newly confirmed appointment to calendar ── */
  const handleAddEvent = useCallback((newAppt) => {
    const status = (newAppt.status ?? "").toLowerCase();
    // Only add to calendar if it's confirmed
    if (status !== "confirmed") return;

    const event = newAppt.appointment_date
      ? appointmentToEvent(newAppt)
      : newAppt;
    setEvents((prev) => [...prev, event]);
  }, []);

  const openDayModal = useCallback((date, eventId = null) => {
    setSelectedDayDate(date);
    setSingleEventId(eventId);
    setShowDayModal(true);
  }, []);

  const closeDayModal = useCallback(() => {
    setShowDayModal(false);
    setSingleEventId(null);
  }, []);

  const handleSelectSlot = useCallback(
    ({ start }) => openDayModal(start),
    [openDayModal],
  );

  const handleSelectEvent = useCallback(
    (event) => {
      if (currentView === "month") openDayModal(event.start, null);
      else openDayModal(event.start, event.id);
    },
    [currentView, openDayModal],
  );

  const handleShowMore = useCallback(
    (_, date) => {
      openDayModal(date, null);
      return false;
    },
    [openDayModal],
  );

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className={`admin-content ${styles.appointmentPage}`}>
          <div className={styles.pageHeader}>
            <h3 className={styles.pageTitle}>Appointment Calendar</h3>
            <div className={styles.headerActions}>
              <button
                className={styles.btnCreate}
                onClick={() => setShowModal(true)}
              >
                + Create Appointment
              </button>
            </div>
          </div>

          <hr className={styles.hr} />

          {error && (
            <ErrorBanner
              message={error}
              onRetry={() => fetchAppointments(filters)}
            />
          )}

          <div className={styles.calendarWrapper}>
            {loading ? (
              <Spinner />
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                date={currentDate}
                view={currentView}
                onNavigate={setCurrentDate}
                onView={setCurrentView}
                views={["month", "week", "day", "agenda"]}
                startAccessor="start"
                endAccessor="end"
                selectable
                doShowMoreDrillDown={false}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onShowMore={handleShowMore}
                style={{ height: 600 }}
                eventPropGetter={(event) => {
                  const palette = getEventPalette(event);
                  const isAgenda = currentView === "agenda";
                  return {
                    style: {
                      backgroundColor: isAgenda ? "transparent" : palette.bg,
                      borderLeft: isAgenda
                        ? "none"
                        : `4px solid ${palette.border}`,
                      border: isAgenda ? "none" : undefined,
                      color: isAgenda ? palette.bg : "#fff",
                      borderRadius: isAgenda ? "0" : "16px",
                      padding: isAgenda ? "0" : "4px 8px",
                      fontWeight: isAgenda ? 600 : 500,
                      marginBottom: "4px",
                      fontSize: "13px",
                      boxShadow: "none",
                      opacity: event.status === "cancelled" ? 0.5 : 1,
                    },
                  };
                }}
                tooltipAccessor={(event) =>
                  [
                    event.title,
                    event.serviceType && `Service: ${event.serviceType}`,
                    event.visitType && `Visit: ${event.visitType}`,
                    event.status && `Status: ${event.status}`,
                  ]
                    .filter(Boolean)
                    .join("\n")
                }
              />
            )}

            <div className={styles.legend}>
              {LEGEND.map(({ label, color }) => (
                <div key={label} className={styles.legendItem}>
                  <span
                    className={styles.legendDot}
                    style={{ backgroundColor: color }}
                  />
                  <span className={styles.legendLabel}>{label}</span>
                </div>
              ))}
            </div>
<br />
            {!loading && !error && <StatsBar events={events} />}
          </div>
        </div>
      </div>

      <DayAppointmentsModal
        isOpen={showDayModal}
        onClose={closeDayModal}
        selectedDate={selectedDayDate}
        events={events}
        singleEventId={singleEventId}
      />

      <CreateAppointmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleAddEvent}
        showReceipt={true}
        showAssignedDoctor={true}
        isAdmin={true}
      />
    </div>
  );
}

export default AdminAppointment;

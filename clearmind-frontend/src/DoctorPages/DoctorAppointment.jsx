import { useState, useEffect, useCallback } from "react";
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

import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import DayAppointmentsModal from "./components/DayAppointmentsModal";
import CreateAppointmentModal from "./components/CreateAppointmentModal";

import styles from "./DoctorStyle/DoctorAppointment.module.css";

// ── Localizer ──────────────────────────────────────────────────────────────
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("auth_token") ||
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

// ── Service type detectors ─────────────────────────────────────────────────
const isPsychAssessment = (serviceType = "") =>
  serviceType.toLowerCase().includes("psychological assessment") ||
  serviceType.toLowerCase().includes("assessment and evaluation");

const isESA = (serviceType = "") =>
  serviceType.toLowerCase().includes("emotional support animal") ||
  serviceType.toLowerCase().includes("esa");

const isInternship = (serviceType = "") =>
  serviceType.toLowerCase().includes("internship");

// ── Event color palette ────────────────────────────────────────────────────
export const EVENT_PALETTE = {
  counseling: { bg: "#6b7280", border: "#4b5563" },
  vawc: { bg: "#4D227C", border: "#3b1a5e" },
  legal: { bg: "#8B4545", border: "#6e3535" },
  school: { bg: "#1e6091", border: "#154c73" },
  work: { bg: "#2d6a4f", border: "#1e4d38" },
  preEmployment: { bg: "#b45309", border: "#92400e" },
  esa: { bg: "#0e7490", border: "#0c5f75" },
  internship: { bg: "#6d28d9", border: "#5b21b6" },
};

const getEventPalette = (event) => {
  const svc = event.serviceType || event.service_type || event.visitType || "";
  if (isESA(svc)) return EVENT_PALETTE.esa;
  if (isInternship(svc)) return EVENT_PALETTE.internship;
  if (isPsychAssessment(svc)) {
    const purpose = event.assessmentPurpose || event.pae_purpose || "";
    switch (purpose) {
      case "VAWC":
        return EVENT_PALETTE.vawc;
      case "Adoption or Legal":
        return EVENT_PALETTE.legal;
      case "School / Academic Support":
        return EVENT_PALETTE.school;
      case "Work-Related":
        return EVENT_PALETTE.work;
      case "Pre-Employment":
        return EVENT_PALETTE.preEmployment;
      default:
        return EVENT_PALETTE.work;
    }
  }
  return EVENT_PALETTE.counseling;
};

// ── Legend ─────────────────────────────────────────────────────────────────
const LEGEND = [
  { label: "Counseling / Therapy", color: EVENT_PALETTE.counseling.bg },
  { label: "PA — VAWC", color: EVENT_PALETTE.vawc.bg },
  { label: "PA — Adoption / Legal", color: EVENT_PALETTE.legal.bg },
  { label: "PA — School / Academic", color: EVENT_PALETTE.school.bg },
  { label: "PA — Work-Related", color: EVENT_PALETTE.work.bg },
  { label: "PA — Pre-Employment", color: EVENT_PALETTE.preEmployment.bg },
  { label: "Emotional Support Animal (ESA)", color: EVENT_PALETTE.esa.bg },
  { label: "Mental Health for Internship", color: EVENT_PALETTE.internship.bg },
];

// ── Map raw API appointment → calendar event ───────────────────────────────
function mapToCalendarEvent(raw) {
  const patient = raw.patient || {};
  const patientName =
    [
      patient.firstName,
      patient.middleInitial ? patient.middleInitial + "." : null,
      patient.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    raw.patient_name ||
    "Patient";

  const dateStr = raw.appointment_date ?? "";
  const startStr = (raw.start_time ?? "00:00").substring(0, 5);
  const endStr = (raw.end_time ?? "00:00").substring(0, 5);

  const startDate = parseISO(`${dateStr}T${startStr}:00`);
  const endDate = parseISO(`${dateStr}T${endStr}:00`);

  return {
    id: raw.appointment_id,
    appointment_id: raw.appointment_id,
    title: patientName,
    start: isValid(startDate) ? startDate : new Date(dateStr),
    end: isValid(endDate) ? endDate : new Date(dateStr),
    appointmentDate: raw.appointment_date,
    startTime: raw.start_time,
    endTime: raw.end_time,
    serviceType: raw.service_type || "",
    visitType: raw.visit_type || "onsite",
    assessmentPurpose: raw.pae_purpose || null,
    pae_purpose: raw.pae_purpose || null,
    patientName,
    status: raw.status,
    paymentStatus: raw.payment_status,
    appointmentRef: raw.appointment_ref || "—",
    doctor: raw.doctor ?? null,
    patientData: raw.patient ?? null,
    raw,
  };
}

// ── Spinner ────────────────────────────────────────────────────────────────
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
      <span style={{ fontSize: 14, fontFamily: "'Poppins', sans-serif" }}>
        Loading appointments…
      </span>
    </div>
  );
}

// ── Stats Bar ──────────────────────────────────────────────────────────────
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
          <span
            style={{
              fontSize: 12,
              color: "#6b7280",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
function DoctorAppointment() {
  const [activeMenu, setActiveMenu] = useState("Appointment");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [calendarError, setCalendarError] = useState(null);

  // ── Day modal state ──────────────────────────────────────────────────────
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [singleEventId, setSingleEventId] = useState(null);

  // ── Fetch appointments assigned to this doctor ────────────────────────
  const loadCalendarEvents = useCallback(async () => {
    setLoadingCalendar(true);
    setCalendarError(null);
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
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
      const raw = Array.isArray(body.data) ? body.data : [];

      // Backend already scopes to doctor_user_id = auth()->id() for Doctor role.
      // Only show confirmed / completed / no_show on the calendar.
      const allowed = ["confirmed", "completed", "no_show"];
      const filtered = raw.filter((r) =>
        allowed.includes((r.status ?? "").toLowerCase()),
      );

      setEvents(filtered.map(mapToCalendarEvent));
    } catch (e) {
      console.error("Failed to load calendar appointments:", e);
      setCalendarError(`Failed to load appointments: ${e.message}`);
    } finally {
      setLoadingCalendar(false);
    }
  }, []);

  useEffect(() => {
    loadCalendarEvents();
  }, [loadCalendarEvents]);

  const openDayModal = useCallback((date, eventId = null) => {
    setSelectedDayDate(date);
    setSingleEventId(eventId);
    setShowDayModal(true);
  }, []);

  const closeDayModal = useCallback(() => {
    setShowDayModal(false);
    setSingleEventId(null);
  }, []);

  // After creating an appointment, reload calendar
  const handleAddEvent = useCallback(() => {
    loadCalendarEvents();
  }, [loadCalendarEvents]);

  // ── Calendar interactions ────────────────────────────────────────────────
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
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className={`doctor-content ${styles.appointmentPage}`}>
          {/* ── Page Header ── */}
          <div className={styles.pageHeader}>
            <h3 className={styles.pageTitle}>Appointment Calendar</h3>
            <div className={styles.headerActions}>
              <button
                className={styles.btnCreate}
                onClick={() => setShowCreateModal(true)}
              >
                + Create Appointment
              </button>
            </div>
          </div>

          <hr className={styles.hr} />

          {/* ── Error Banner ── */}
          {calendarError && (
            <div
              style={{
                background: "#fff0f0",
                border: "1px solid #fca5a5",
                borderRadius: "8px",
                padding: "10px 16px",
                marginBottom: "12px",
                color: "#b91c1c",
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <span>⚠ {calendarError}</span>
              <button
                onClick={loadCalendarEvents}
                style={{
                  background: "#4D227C",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 14px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Calendar ── */}
          <div className={styles.calendarWrapper}>
            {loadingCalendar ? (
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

            {/* ── Color Legend ── */}
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
            {!loadingCalendar && !calendarError && <StatsBar events={events} />}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}

<DayAppointmentsModal
  isOpen={showDayModal}
  onClose={closeDayModal}
  selectedDate={selectedDayDate}
  events={events}          
  singleEventId={singleEventId}
  onRefresh={loadCalendarEvents}
/>

      <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAdd={handleAddEvent}
        onSuccess={handleAddEvent}
      />
    </div>
  );
}

export default DoctorAppointment;

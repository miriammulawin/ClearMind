import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import DayAppointmentsModal from "./components/DayAppointmentsModal";
import CreateAppointmentModal from "./components/CreateAppointmentModal";
// ← AddScheduleModal removed: it now lives at /doctor/schedule
import { calendarEvents } from "./data/appointmentsData";
import "./DoctorStyle/DoctorAppointment.module.css";

// ── Localizer ──────────────────────────────────────────────────────────────
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

// ── Event color system ─────────────────────────────────────────────────────
const isPsychAssessment = (serviceType) =>
  serviceType?.toLowerCase().includes("psychological assessment") ||
  serviceType?.toLowerCase().includes("assessment and evaluation");

export const EVENT_PALETTE = {
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

// ── Component ──────────────────────────────────────────────────────────────
function DoctorAppointment() {
  const navigate = useNavigate(); // ← used for "Add Schedule" button

  const [activeMenu, setActiveMenu] = useState("Appointment");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState(calendarEvents);

  // ── Day modal state ──────────────────────────────────────────────────────
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [singleEventId, setSingleEventId] = useState(null);

  const openDayModal = useCallback((date, eventId = null) => {
    setSelectedDayDate(date);
    setSingleEventId(eventId);
    setShowDayModal(true);
  }, []);

  const closeDayModal = useCallback(() => {
    setShowDayModal(false);
    setSingleEventId(null);
  }, []);

  const handleAddEvent = (newEvent) => setEvents((prev) => [...prev, newEvent]);

  // ── Calendar interactions ────────────────────────────────────────────────
  const handleSelectSlot = useCallback(
    ({ start }) => openDayModal(start),
    [openDayModal],
  );

  const handleSelectEvent = useCallback(
    (event) => {
      if (currentView === "month") {
        openDayModal(event.start, null);
      } else {
        openDayModal(event.start, event.id);
      }
    },
    [currentView, openDayModal],
  );

  const handleShowMore = useCallback(
    (moreEvents, date) => {
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

        <div className="doctor-content" style={{ padding: "20px" }}>
          <br />
          <div className="appointment-card">
            {/* ── Toolbar ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>Appointments Calendar</h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {/* Add Schedule → navigates to /doctor/schedule */}
                <button
                  className="btn-create"
                  onClick={() => navigate("/doctor/schedule")}
                  style={{
                    backgroundColor: "#8B4545",
                    color: "#fff",
                    border: "2px solid #8B4545",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#8B4545";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#8B4545";
                    e.currentTarget.style.color = "#fff";
                  }}
                >
                  + Add Schedule
                </button>

                {/* Create Appointment → opens modal as before */}
                <button
                  className="btn-create"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create Appointment
                </button>
              </div>
            </div>

            {/* ── Calendar ── */}
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
              style={{
                height: "clamp(380px, 60vh, 650px)",
                marginTop: 20,
                borderRadius: "12px",
              }}
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
                    borderRadius: isAgenda ? "0" : "4px",
                    padding: isAgenda ? "0" : "3px 8px",
                    fontWeight: isAgenda ? 600 : 500,
                    marginBottom: "3px",
                    fontSize: "12px",
                    boxShadow: "none",
                  },
                };
              }}
            />

            {/* ── Color Legend ── */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "8px 24px",
                marginTop: "14px",
                padding: "10px 20px",
                backgroundColor: "#f9f7ff",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
              }}
            >
              {LEGEND.map(({ label, color }) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: "7px" }}
                >
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "3px",
                      backgroundColor: color,
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#374151",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
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
      />
      <CreateAppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAdd={handleAddEvent}
      />
      {/* AddScheduleModal is gone — it now lives at /doctor/schedule */}
    </div>
  );
}

export default DoctorAppointment;

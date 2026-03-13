import { useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import DayAppointmentsModal from "./components/DayAppointmentsModal";
import CreateAppointmentModal from "./components/CreateAppointmentModal";
import AddScheduleModal from "./components/AddScheduleModal";
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

// ── Event color system ────────────────────────────────────────────────────
// Counseling / Therapy  → teal family
// Psych Assessment      → color by Purpose
//   VAWC                → rose/red
//   Adoption or Legal   → amber/gold
//   School / Academic   → sky blue
//   Work-Related        → slate/indigo

const isPsychAssessment = (serviceType) =>
  serviceType?.toLowerCase().includes("psychological assessment") ||
  serviceType?.toLowerCase().includes("assessment and evaluation");

// Base palette — tones inspired by the app's purple/maroon theme
export const EVENT_PALETTE = {
  counseling: { bg: "#6b7280", border: "#4b5563" }, // muted gray
  vawc: { bg: "#4D227C", border: "#3b1a5e" }, // deep purple (calendar header tone)
  legal: { bg: "#8B4545", border: "#6e3535" }, // maroon (Add Schedule button tone)
  school: { bg: "#1e6091", border: "#154c73" }, // navy blue — softer
  work: { bg: "#2d6a4f", border: "#1e4d38" }, // forest green — muted
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
        return EVENT_PALETTE.work; // fallback for PA without purpose
    }
  }

  // Counseling / Therapy (or any other service)
  return EVENT_PALETTE.counseling;
};

// Legend entries shown below the calendar
const LEGEND = [
  { label: "Counseling / Therapy", color: EVENT_PALETTE.counseling.bg },
  { label: "PA — VAWC", color: EVENT_PALETTE.vawc.bg },
  { label: "PA — Adoption / Legal", color: EVENT_PALETTE.legal.bg },
  { label: "PA — School / Academic", color: EVENT_PALETTE.school.bg },
  { label: "PA — Work-Related", color: EVENT_PALETTE.work.bg },
];

// ── Component ──────────────────────────────────────────────────────────────
function DoctorAppointment() {
  const [activeMenu, setActiveMenu] = useState("Appointment");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [events, setEvents] = useState(calendarEvents);

  // ── Modal state ──────────────────────────────────────────────────────────
  // selectedDayDate  → the date to filter appointments by (always set)
  // singleEventId    → when set, modal shows only that one event (week/day view)
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

  // ── Slot click (month empty cell, week/day empty slot) ───────────────────
  const handleSelectSlot = useCallback(
    ({ start }) => {
      openDayModal(start);
    },
    [openDayModal],
  );

  // ── Event click ───────────────────────────────────────────────────────────
  // In month view → show all appointments for that day (no singleEventId).
  // In week / day / agenda view → show only this specific event.
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

  // ── "+X more" click (month view overflow) ────────────────────────────────
  // Returning false prevents react-big-calendar from navigating to the day
  // view. We open the modal instead so the user stays in month view.
  const handleShowMore = useCallback(
    (moreEvents, date) => {
      openDayModal(date, null);
      return false; // ← stops the default drill-down to day view
    },
    [openDayModal],
  );

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Override react-big-calendar event text alignment */}
      <style>{`
        .rbc-event-content { text-align: left !important; justify-content: flex-start !important; }
        .rbc-event { text-align: left !important; }

        /* Agenda view — strip all background/border from event wrapper, color text only */
        .rbc-agenda-view .rbc-event {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        .rbc-agenda-view .rbc-event-content {
          font-weight: 600 !important;
        }
        .rbc-agenda-view table tbody tr:hover td {
          background-color: #f9f7ff !important;
        }

        /* Agenda date and time — plain dark text, no color */
        .rbc-agenda-date-cell,
        .rbc-agenda-time-cell {
          color: #333 !important;
          background-color: transparent !important;
        }
      `}</style>

      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="doctor-content" style={{ padding: "20px" }}>
          <br />
          <div className="appointment-card">
            {/* Toolbar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>Appointments Calendar</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-create"
                  onClick={() => setShowScheduleModal(true)}
                  style={{
                    backgroundColor: "#8B4545",
                    color: "#fff",
                    border: "2px solid #8B4545",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#8B4545";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#8B4545";
                    e.target.style.color = "#fff";
                  }}
                >
                  + Add Schedule
                </button>
                <button
                  className="btn-create"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Create Appointment
                </button>
              </div>
            </div>

            {/* Calendar */}
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
              style={{ height: 600, marginTop: 20, borderRadius: "12px" }}
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

            {/* ── Color Legend ──────────────────────────────────────────── */}
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

      {/* Modals */}
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
      <AddScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
  );
}

export default DoctorAppointment;

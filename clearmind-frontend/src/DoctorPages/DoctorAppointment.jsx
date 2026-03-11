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

// ── Event color ────────────────────────────────────────────────────────────
const getEventColor = (event) => {
  if (event.title?.includes("Physical")) return "#4D227C";
  if (event.title?.includes("Online")) return "#3d5a8a";
  return "#4D227C";
};

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
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: getEventColor(event),
                  color: "#fff",
                  borderRadius: "16px",
                  border: "none",
                  padding: "4px 8px",
                  fontWeight: 500,
                  marginBottom: "4px",
                  fontSize: "13px",
                },
              })}
            />
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

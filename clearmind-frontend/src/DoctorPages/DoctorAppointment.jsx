import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import DoctorSideBar        from "./components/DoctorSideBar";
import DoctorTopNavbar      from "./components/DoctorTopNavbar";
import DayAppointmentsModal from "./components/DayAppointmentsModal";
import CreateAppointmentModal from "./components/CreateAppointmentModal";
import AddScheduleModal     from "./components/AddScheduleModal";
import { calendarEvents, EVENT_COLORS } from "./data/appointmentsData";
import "./DoctorStyle/DoctorAppointment.css";

// ── Localizer ──────────────────────────────────────────────────────────────
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

// ── Helpers ────────────────────────────────────────────────────────────────
const getEventColor = (event) => {
  if (event.title?.includes("Physical")) return EVENT_COLORS.physical;
  if (event.title?.includes("Online"))   return EVENT_COLORS.online;
  return "#4D227C";
};

// ── Component ──────────────────────────────────────────────────────────────
function DoctorAppointment() {
  const [activeMenu, setActiveMenu]         = useState("Appointment");
  const [currentDate, setCurrentDate]       = useState(new Date());
  const [currentView, setCurrentView]       = useState("month");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDayModal, setShowDayModal]     = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [events, setEvents]                 = useState(calendarEvents);

  const handleAddEvent = (newEvent) => setEvents((prev) => [...prev, newEvent]);

  const handleSelectSlot = ({ start }) => {
    setSelectedDayDate(start);
    setShowDayModal(true);
  };

  // Also open the modal when clicking directly on an event pill
  const handleSelectEvent = (event) => {
    setSelectedDayDate(event.start);
    setShowDayModal(true);
  };

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="doctor-content" style={{ padding: "20px" }}>
          <br />
          <div className="appointment-card">

            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Appointments Calendar</h3>


              {/* Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-create"
                  onClick={() => setShowScheduleModal(true)}
                  style={{ backgroundColor: "#8B4545", color: "#fff", border: "2px solid #8B4545", transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#8B4545"; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = "#8B4545";      e.target.style.color = "#fff"; }}
                >
                  + Add Schedule
                </button>
                <button className="btn-create" onClick={() => setShowCreateModal(true)}>
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
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              style={{ height: 600, marginTop: 20, borderRadius: "12px" }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: getEventColor(event),
                  color: "#fff",
                  borderRadius: "16px",
                  padding: "4px 8px",
                  fontWeight: 500,
                  marginBottom: "4px",
                  fontSize: "13px",
                  opacity: event.isRescheduledGhost ? 0.85 : 1,
                  fontStyle: event.isRescheduledGhost ? "italic" : "normal",
                },
              })}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <DayAppointmentsModal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        selectedDate={selectedDayDate}
        events={events}
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
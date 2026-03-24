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
import { calendarEvents } from "./data/appointmentsData";

import styles from "./DoctorStyle/DoctorAppointment.module.css";

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
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu]           = useState("Appointment");
  const [currentDate, setCurrentDate]         = useState(new Date());
  const [currentView, setCurrentView]         = useState("month");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents]                   = useState(calendarEvents);

  // ── Day modal state ──────────────────────────────────────────────────────
  const [showDayModal, setShowDayModal]       = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [singleEventId, setSingleEventId]     = useState(null);

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
      if (currentView === "month") openDayModal(event.start, null);
      else openDayModal(event.start, event.id);
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

          {/* ── Calendar ── */}
          <div className={styles.calendarWrapper}>
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
    </div>
  );
}

export default DoctorAppointment;
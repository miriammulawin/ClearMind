import { useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminAppointment.module.css";
import CreateAppointmentModal from "../DoctorPages/components/CreateAppointmentModal";
import DayAppointmentsModal from "../DoctorPages/components/DayAppointmentsModal";

import { calendarEvents } from "../DoctorPages/data/appointmentsData";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// ── Event color system (same as DoctorAppointment) ─────────────────────────
const isPsychAssessment = (serviceType) =>
  serviceType?.toLowerCase().includes("psychological assessment") ||
  serviceType?.toLowerCase().includes("assessment and evaluation");

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

// ── Component ──────────────────────────────────────────────────────────────
function AdminAppointment() {
  const [activeMenu, setActiveMenu] = useState("Appointment");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [showModal, setShowModal] = useState(false);
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
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className={`admin-content ${styles.appointmentPage}`}>
          {/* ── Page Header ── */}
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
                  },
                };
              }}
            />

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
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddEvent}
        showReceipt={true}
        showAssignedDoctor={true}
      />
    </div>
  );
}

export default AdminAppointment;

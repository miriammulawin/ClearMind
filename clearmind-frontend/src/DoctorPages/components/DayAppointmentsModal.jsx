import { useState } from "react";
import { format } from "date-fns";
import { FiX } from "react-icons/fi";
import { EVENT_COLORS } from "../data/appointmentsData";

// ── Helpers ────────────────────────────────────────────────────────────────
const toTime24 = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const toTime12 = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const isSameDay = (d1, d2) => {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────
const ModalHeader = ({ title, dateLabel, onClose }) => (
  <div style={{
    backgroundColor: "#4D227C",
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "16px 16px 0 0",
    flexShrink: 0,
  }}>
    <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#fff" }}>{title}</h3>
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <span style={{
        backgroundColor: "#fff", color: "#4D227C",
        padding: "6px 16px", borderRadius: "20px",
        fontSize: "13px", fontWeight: 600,
      }}>
        {dateLabel}
      </span>
      <button
        onClick={onClose}
        style={{
          backgroundColor: "#fff", border: "none", borderRadius: "50%",
          width: 32, height: 32, display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer", color: "#4D227C",
          fontSize: "18px", padding: 0,
        }}
      >
        <FiX />
      </button>
    </div>
  </div>
);

const InfoRow = ({ label, value, minWidth = 190 }) => (
  <div style={{ display: "flex", gap: "8px", fontSize: "14px" }}>
    <span style={{ fontWeight: 700, color: "#4D227C", minWidth }}>{label}:</span>
    <span style={{ color: "#333" }}>{value}</span>
  </div>
);

// ── Detail View ────────────────────────────────────────────────────────────
// Handles both original appointments and ghost (rescheduled new-date) events.
// If isGhost=true, the appt data is the original but start/end reflect new sched.
function DetailView({ appt, isGhost, selectedDate, onClose }) {
  const startTime  = toTime12(toTime24(appt.start));
  const endTime    = toTime12(toTime24(appt.end));
  const isOnline   = appt.title?.toLowerCase().includes("online");
  const clinicType = isOnline ? "Online Clinic" : "Physical Clinic";
  const clinicColor = isOnline ? EVENT_COLORS.online : EVENT_COLORS.physical;

  // Original is "Rescheduled" OR this card IS the ghost new-date event
  const isRescheduled = appt.status === "Rescheduled" || isGhost;

  // For the ghost card we show the NEW date/time in the header & info row
  const displayDate = format(new Date(appt.start), "MMMM dd, yyyy");
  const displayDateShort = format(new Date(appt.start), "MM/dd/yyyy");

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          title={
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{
                width: 10, height: 10, borderRadius: "50%",
                backgroundColor: clinicColor, display: "inline-block", flexShrink: 0,
              }} />
              {isGhost ? "↪ " : ""}{startTime} — {clinicType}
              {isGhost && (
                <span style={{
                  fontSize: "12px", fontWeight: 600,
                  backgroundColor: "#fff3e0", color: "#b45309",
                  padding: "2px 10px", borderRadius: 10, marginLeft: 6,
                }}>
                  Rescheduled
                </span>
              )}
            </span>
          }
          dateLabel={displayDateShort}
          onClose={onClose}
        />

        <div style={{ padding: "24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Appointment Info */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              {isGhost ? "Rescheduled Appointment Information" : "Appointment Information"}
            </div>

            <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                <InfoRow label="Name"                    value={appt.patientName || "—"} />
                <InfoRow label="Visit Type"              value={appt.visitType   || "—"} />
                <InfoRow label="Status"                  value={isGhost ? "Rescheduled" : (appt.status || "—")} />
                <InfoRow label="Reason for Consultation" value={appt.reason      || "Not specified"} />
                <InfoRow label="Appointment Date & Time" value={`${displayDate} | ${startTime} – ${endTime}`} />
                {isGhost && appt.rescheduledTo?.reason && (
                  <InfoRow label="Reason for Reschedule" value={appt.rescheduledTo.reason} />
                )}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: "#4D227C" }}>Payment:</span>
                <span style={{
                  backgroundColor: appt.payment === "Paid" ? "#e8f5e9" : "#fff3e0",
                  color:           appt.payment === "Paid" ? "#2e7d32" : "#b45309",
                  padding: "2px 12px", borderRadius: 12, fontWeight: 600, fontSize: 13,
                }}>
                  {appt.payment || "—"}
                </span>
              </div>
            </div>

            {/* Hide Completed only on the original event that was rescheduled, not the new schedule */}
            {(!isRescheduled || isGhost) && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0" }}>
                <button
                  style={styles.btnGreen}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#15803d")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#16a34a")}
                >
                  Completed
                </button>
              </div>
            )}
          </section>

          {/* Reschedule Status — shown for original events only */}
          {!isGhost && (
            <section style={styles.card}>
              <div style={{ ...styles.cardHeader, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Reschedule Status</span>
                <span style={{
                  backgroundColor: isRescheduled ? "#fff3e0" : "#f3f4f6",
                  color:           isRescheduled ? "#b45309" : "#6b7280",
                  padding: "3px 14px", borderRadius: 12, fontWeight: 600, fontSize: 12,
                }}>
                  {isRescheduled ? "Rescheduled" : "Not Rescheduled"}
                </span>
              </div>

              <div style={{ padding: "16px 20px" }}>
                {isRescheduled && appt.rescheduledTo ? (
                  <div style={styles.rescheduleBox}>
                    <InfoRow minWidth={130} label="New Date"          value={format(new Date(appt.rescheduledTo.date), "MMMM dd, yyyy")} />
                    <InfoRow minWidth={130} label="New Time"          value={`${toTime12(appt.rescheduledTo.startTime)} – ${toTime12(appt.rescheduledTo.endTime)}`} />
                    <InfoRow minWidth={130} label="Duration"          value="1 hour" />
                    <InfoRow minWidth={130} label="Reason"            value={appt.rescheduledTo.reason || "Not specified"} />
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: "#9ca3af", fontStyle: "italic" }}>
                    This appointment has not been rescheduled.
                  </p>
                )}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
// `events` should be the full calendarEvents array (includes ghost events).
function DayAppointmentsModal({ isOpen, onClose, selectedDate, events }) {
  const [activeAppt, setActiveAppt] = useState(null); // { appt, isGhost }

  if (!isOpen || !selectedDate) return null;

  const selectedDateObj    = new Date(selectedDate);
  const formattedDate      = format(selectedDateObj, "MMMM dd, yyyy");

  const dayAppointments = events.filter((e) => isSameDay(e.start, selectedDateObj));

  // ── Detail view ──────────────────────────────────────────────────────────
  if (activeAppt) {
    return (
      <DetailView
        appt={activeAppt.appt}
        isGhost={activeAppt.isGhost}
        selectedDate={selectedDate}
        onClose={() => setActiveAppt(null)}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────────────────
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Appointments" dateLabel={formattedDate} onClose={onClose} />

        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {dayAppointments.length === 0 ? (
            <p style={{ textAlign: "center", color: "#aaa", fontSize: 14, padding: "40px 0" }}>
              No appointments scheduled for this day.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {dayAppointments.map((appt) => {
                const isGhost    = !!appt.isRescheduledGhost;
                const startTime  = toTime12(toTime24(appt.start));
                const endTime    = toTime12(toTime24(appt.end));
                const isOnline   = appt.title?.toLowerCase().includes("online");
                const clinicType = isOnline ? "Online Clinic" : "Physical Clinic";
                const dotColor   = isOnline ? EVENT_COLORS.online : EVENT_COLORS.physical;
                const cardDate   = format(new Date(appt.start), "MMMM dd, yyyy");

                return (
                  <div key={appt.id} style={styles.card}>
                    {/* Card header with dot + optional Rescheduled badge */}
                    <div style={{ ...styles.cardHeader, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: dotColor, display: "inline-block" }} />
                        {isGhost ? "Rescheduled Appointment" : "Appointment Information"}
                      </div>
                      {isGhost && (
                        <span style={{
                          backgroundColor: "#fff3e0", color: "#b45309",
                          padding: "2px 12px", borderRadius: 10,
                          fontSize: 12, fontWeight: 600,
                        }}>
                          New Schedule
                        </span>
                      )}
                    </div>

                    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <InfoRow minWidth={180} label="Name"                   value={appt.patientName || "—"} />
                      <InfoRow minWidth={180} label="Date of Appointment"    value={cardDate} />
                      <InfoRow minWidth={180} label="Time"                   value={`${startTime} – ${endTime}`} />
                      <InfoRow minWidth={180} label="Clinic Type"            value={clinicType} />
                      <InfoRow minWidth={180} label="Reason of Consultation" value={appt.reason || "Not specified"} />
                      <InfoRow minWidth={180} label="Status"                 value={isGhost ? "Rescheduled" : (appt.status || "—")} />
                    </div>

                    <div style={{ padding: "12px 20px", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f0f0f0" }}>
                      <button
                        style={styles.btnPurple}
                        onClick={() => setActiveAppt({ appt, isGhost })}
                        onMouseEnter={(e) => (e.target.style.backgroundColor = "#3a1a5c")}
                        onMouseLeave={(e) => (e.target.style.backgroundColor = "#4D227C")}
                      >
                        View More
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────
const styles = {
  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 10000, padding: "20px",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
    maxWidth: "620px", width: "100%",
    maxHeight: "90vh", overflow: "hidden",
    display: "flex", flexDirection: "column",
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "14px 20px",
    borderBottom: "1px solid #e0e0e0",
    fontSize: "15px", fontWeight: 700, color: "#4D227C",
  },
  rescheduleBox: {
    backgroundColor: "#f7f2ff",
    border: "1px solid #d9c8f0",
    borderRadius: "10px",
    padding: "14px 18px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  btnPurple: {
    padding: "10px 28px",
    backgroundColor: "#4D227C", color: "#fff",
    border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: 600, cursor: "pointer",
  },
  btnGreen: {
    padding: "8px 20px",
    backgroundColor: "#16a34a", color: "#fff",
    border: "none", borderRadius: "8px",
    fontSize: "13px", fontWeight: 600, cursor: "pointer",
  },
};

export default DayAppointmentsModal;
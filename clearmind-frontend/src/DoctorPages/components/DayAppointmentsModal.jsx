import { useState } from "react";
import { format } from "date-fns";
import { FiX } from "react-icons/fi";

function DayAppointmentsModal({ isOpen, onClose, selectedDate, events }) {
  const [viewMoreAppointment, setViewMoreAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [showReschedule, setShowReschedule] = useState(false);

  if (!isOpen || !selectedDate) return null;

  const dayAppointments = events.filter((event) => {
    const eventDate = new Date(event.start);
    const selectedDateObj = new Date(selectedDate);
    return (
      eventDate.getFullYear() === selectedDateObj.getFullYear() &&
      eventDate.getMonth() === selectedDateObj.getMonth() &&
      eventDate.getDate() === selectedDateObj.getDate()
    );
  });

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const format12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleViewMore = (appointment) => {
    setViewMoreAppointment(appointment);
    setShowReschedule(false);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleReason("");
  };

  const handleCloseViewMore = () => {
    setViewMoreAppointment(null);
    setShowReschedule(false);
  };

  const modalHeader = (title, dateLabel, onCloseHandler) => (
    <div
      style={{
        backgroundColor: "#4D227C",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "16px 16px 0 0",
        flexShrink: 0,
      }}
    >
      <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#fff" }}>
        {title}
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            backgroundColor: "#fff",
            color: "#4D227C",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {dateLabel}
        </div>
        <button
          onClick={onCloseHandler}
          style={{
            backgroundColor: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#4D227C",
            fontSize: "18px",
            padding: 0,
          }}
        >
          <FiX />
        </button>
      </div>
    </div>
  );

  // ── View More Detail Modal ──────────────────────────────────────────────
  if (viewMoreAppointment) {
    const appt = viewMoreAppointment;
    const startTime = format12Hour(formatTime(appt.start));
    const endTime = format12Hour(formatTime(appt.end));
    const isOnline = appt.title?.toLowerCase().includes("online");
    const clinicType = isOnline ? "Online Clinic" : "Physical Clinic";
    const patientName = appt.patientName || "Liezel Paciente";

    return (
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10001,
          padding: "20px",
        }}
        onClick={handleCloseViewMore}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
            maxWidth: "620px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {modalHeader(
            `${startTime} ${clinicType}`,
            format(new Date(selectedDate), "MM/dd/yyyy"),
            handleCloseViewMore
          )}

          <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
            {/* Appointment info card */}
            <div
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                overflow: "hidden",
                marginBottom: "20px",
              }}
            >
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #e0e0e0" }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#4D227C" }}>
                  Appointment Information
                </span>
              </div>

              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  {/* Left: details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                    {[
                      { label: "Name", value: patientName },
                      { label: "Visit Type", value: appt.visitType || "New Concern" },
                      { label: "Status", value: appt.status || "Scheduled" },
                      { label: "Reason for Consultation", value: appt.reason || "Not specified" },
                      { label: "Appointment Date & Time", value: `${format(new Date(selectedDate), "MMMM dd, yyyy")} | ${startTime} – ${endTime}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", gap: "8px", fontSize: "14px" }}>
                        <span style={{ fontWeight: "700", color: "#4D227C", minWidth: "190px" }}>
                          {label}:
                        </span>
                        <span style={{ color: "#333" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Right: payment */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "14px" }}>
                    <span style={{ fontWeight: "700", color: "#4D227C" }}>Payment:</span>
                    <span
                      style={{
                        backgroundColor: "#e8f5e9",
                        color: "#2e7d32",
                        padding: "2px 12px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "13px",
                      }}
                    >
                      {appt.payment || "Paid"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div
                style={{
                  padding: "12px 20px",
                  display: "flex",
                  gap: "10px",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <button
                  onClick={() => setShowReschedule((v) => !v)}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#4D227C",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#3a1a5c")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#4D227C")}
                >
                  Reschedule
                </button>
                <button
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#15803d")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#16a34a")}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Reschedule section */}
            {showReschedule && (
              <div
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #e0e0e0" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700", color: "#4D227C" }}>
                    Reschedule Appointment
                  </span>
                </div>
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "12px",
                    alignItems: "flex-end",
                  }}
                >
                  {[
                    {
                      label: "Reschedule Date:",
                      type: "date",
                      value: rescheduleDate,
                      onChange: setRescheduleDate,
                      placeholder: "mm/dd/yyyy",
                    },
                    {
                      label: "Reschedule Time:",
                      type: "time",
                      value: rescheduleTime,
                      onChange: setRescheduleTime,
                      placeholder: "Choose new time",
                    },
                    {
                      label: "Reason for Reschedule:",
                      type: "text",
                      value: rescheduleReason,
                      onChange: setRescheduleReason,
                      placeholder: "",
                    },
                  ].map(({ label, type, value, onChange, placeholder }) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "1 1 140px" }}>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#4D227C" }}>{label}</label>
                      <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1px solid #d0d0d0",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                    </div>
                  ))}
                  <button
                    style={{
                      padding: "8px 20px",
                      backgroundColor: "#4D227C",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      alignSelf: "flex-end",
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "#3a1a5c")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "#4D227C")}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main List Modal ─────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {modalHeader(
          "Appointments",
          format(new Date(selectedDate), "MMMM dd, yyyy"),
          onClose
        )}

        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {dayAppointments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#aaa" }}>
              <p style={{ fontSize: "14px", margin: 0 }}>No appointments scheduled for this day</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {dayAppointments.map((appointment, index) => {
                const startTime = format12Hour(formatTime(appointment.start));
                const endTime = format12Hour(formatTime(appointment.end));
                const isOnline = appointment.title?.toLowerCase().includes("online");
                const clinicType = isOnline ? "Online Clinic" : "Physical Clinic";
                const patientName = appointment.patientName || "Liezel Paciente";

                return (
                  <div
                    key={index}
                    style={{ border: "1px solid #e0e0e0", borderRadius: "12px", overflow: "hidden" }}
                  >
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid #e0e0e0" }}>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#4D227C" }}>
                        Appointment Information
                      </span>
                    </div>

                    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { label: "Name", value: patientName },
                        { label: "Date of Appointment", value: format(new Date(selectedDate), "MMMM dd, yyyy") },
                        { label: "Time", value: `${startTime} - ${endTime}` },
                        { label: "Clinic Type", value: clinicType },
                        { label: "Reason of Consultation", value: appointment.reason || "Not specified" },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: "flex", gap: "8px", fontSize: "14px" }}>
                          <span style={{ fontWeight: "700", color: "#4D227C", minWidth: "180px" }}>
                            {label}:
                          </span>
                          <span style={{ color: "#333" }}>{value}</span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        padding: "12px 20px",
                        display: "flex",
                        justifyContent: "flex-end",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <button
                        onClick={() => handleViewMore(appointment)}
                        style={{
                          padding: "10px 28px",
                          backgroundColor: "#4D227C",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
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

export default DayAppointmentsModal;
import { useState } from "react";
import { format } from "date-fns";
import { FiX } from "react-icons/fi";

function DayAppointmentsModal({ isOpen, onClose, selectedDate, events }) {
  if (!isOpen || !selectedDate) return null;

  // Filter events for the selected date
  const dayAppointments = events.filter((event) => {
    const eventDate = new Date(event.start);
    const selectedDateObj = new Date(selectedDate);
    return (
      eventDate.getFullYear() === selectedDateObj.getFullYear() &&
      eventDate.getMonth() === selectedDateObj.getMonth() &&
      eventDate.getDate() === selectedDateObj.getDate()
    );
  });

  // Format time helper
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Convert 24hr to 12hr format
  const format12Hour = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 12px 48px rgba(77, 34, 124, 0.2)",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "85vh",
          overflow: "auto",
          animation: "slideUp 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            padding: "24px 24px 20px 24px",
            borderBottom: "1px solid #e0d4f5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "18px",
                fontWeight: "700",
                color: "#333",
              }}
            >
              {format(new Date(selectedDate), "EEEE")} Appointments
            </h3>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "#e8e0f5",
                color: "#4D227C",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {format(new Date(selectedDate), "MM/dd/yyyy")}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#aaa",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#333")}
            onMouseLeave={(e) => (e.target.style.color = "#aaa")}
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px" }}>
          {dayAppointments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#aaa",
              }}
            >
              <p style={{ fontSize: "14px", margin: "0 0 8px 0" }}>
                No appointments scheduled for this day
              </p>
              <p
                style={{
                  fontSize: "12px",
                  margin: 0,
                  color: "#ccc",
                }}
              >
                Click "Create Appointment" to add one
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {dayAppointments.map((appointment, index) => {
                const startTime = format12Hour(
                  formatTime(appointment.start)
                );
                const endTime = format12Hour(formatTime(appointment.end));

                // Determine clinic type from title
                const isOnline = appointment.title
                  .toLowerCase()
                  .includes("online");
                const clinicType = isOnline ? "Online Clinic" : "Physical Clinic";
                const clinicColor = isOnline ? "#7A92D1" : "#8B4545";

                return (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid #e0d4f5",
                      backgroundColor: "#f9f7ff",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f3ecfc";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(77, 34, 124, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f9f7ff";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Time */}
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#333",
                        marginBottom: "8px",
                      }}
                    >
                      {startTime} {clinicType}
                    </div>

                    {/* Appointment Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {/* Name */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          color: "#666",
                        }}
                      >
                        <span style={{ fontWeight: "600", minWidth: "80px" }}>
                          Name:
                        </span>
                        <span>Unset Patient</span>
                      </div>

                      {/* Date of Appointment */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          color: "#666",
                        }}
                      >
                        <span style={{ fontWeight: "600", minWidth: "80px" }}>
                          Date of Appointment:
                        </span>
                        <span>{format(new Date(selectedDate), "MMMM dd, yyyy")}</span>
                      </div>

                      {/* Time Duration */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          color: "#666",
                        }}
                      >
                        <span style={{ fontWeight: "600", minWidth: "80px" }}>
                          Time:
                        </span>
                        <span>
                          {startTime} - {endTime}
                        </span>
                      </div>
                    </div>

                    {/* View More Button */}
                    <button
                      style={{
                        marginTop: "12px",
                        padding: "8px 16px",
                        backgroundColor: "#4D227C",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#3a1a5c";
                        e.target.style.transform = "scale(1.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#4D227C";
                        e.target.style.transform = "scale(1)";
                      }}
                    >
                      VIEW MORE
                    </button>
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
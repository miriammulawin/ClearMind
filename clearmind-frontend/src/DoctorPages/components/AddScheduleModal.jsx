import { useState } from "react";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function AddScheduleModal({ isOpen, onClose }) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [weeklySchedule, setWeeklySchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const handleAddTimeSlot = () => {
    setWeeklySchedule({
      ...weeklySchedule,
      [selectedDay]: [
        ...weeklySchedule[selectedDay],
        { startTime: "", endTime: "", clinicType: "" },
      ],
    });
  };

  const handleRemoveTimeSlot = (dayName, index) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [dayName]: weeklySchedule[dayName].filter((_, i) => i !== index),
    });
  };

  const handleTimeSlotChange = (dayName, index, field, value) => {
    const updatedSlots = [...weeklySchedule[dayName]];
    updatedSlots[index][field] = value;
    setWeeklySchedule({ ...weeklySchedule, [dayName]: updatedSlots });
  };

  const handleSaveSchedule = () => {
    for (const day of DAYS_OF_WEEK) {
      for (const slot of weeklySchedule[day]) {
        if (!slot.startTime || !slot.endTime) {
          alert("Please fill in all time slots or remove empty ones");
          return;
        }
        if (!slot.clinicType) {
          alert("Please select a clinic type for all time slots");
          return;
        }
      }
    }
    alert("Schedule saved successfully!");
    onClose();
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div className="appointment-modal-lg">

        {/* Header */}
        <div className="modal-header">
          <h2>Add Weekly Schedule</h2>
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-section">

            {/* Day Selector */}
            <h4>Select Day of the Week</h4>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: selectedDay === day ? "2px solid #4D227C" : "1px solid #ddd",
                    backgroundColor: selectedDay === day ? "#4D227C" : "#fff",
                    color: selectedDay === day ? "#fff" : "#333",
                    cursor: "pointer",
                    fontWeight: selectedDay === day ? "600" : "400",
                    transition: "all 0.2s",
                  }}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Time Slots */}
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h4>Time Slots for {selectedDay}</h4>
                <button
                  onClick={handleAddTimeSlot}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#4D227C",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: "500",
                  }}
                >
                  <FiPlus /> Add Time Slot
                </button>
              </div>

              {weeklySchedule[selectedDay].length === 0 ? (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#666",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                  }}
                >
                  No time slots added for {selectedDay}. Click "Add Time Slot" to get started.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {weeklySchedule[selectedDay].map((slot, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        padding: "16px",
                        backgroundColor: "#f9f9f9",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span style={{ fontWeight: "500", minWidth: "80px" }}>
                          Slot {index + 1}:
                        </span>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeSlotChange(selectedDay, index, "startTime", e.target.value)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            fontSize: "14px",
                            minWidth: "150px",
                          }}
                        />
                        <span style={{ fontWeight: "500" }}>to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeSlotChange(selectedDay, index, "endTime", e.target.value)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "6px",
                            border: "1px solid #ddd",
                            fontSize: "14px",
                            minWidth: "150px",
                          }}
                        />
                        <button
                          onClick={() => handleRemoveTimeSlot(selectedDay, index)}
                          style={{
                            padding: "8px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#ff4444",
                            color: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      {/* Clinic Type */}
                      <div style={{ paddingLeft: "90px" }}>
                        <h5
                          style={{
                            marginBottom: "10px",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#333",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Clinic Type
                        </h5>
                        <div style={{ display: "flex", gap: "20px" }}>
                          {["online", "physical"].map((type) => (
                            <label
                              key={type}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                cursor: "pointer",
                                fontSize: "13px",
                                color: "#555",
                              }}
                            >
                              <input
                                type="radio"
                                name={`clinicType-${selectedDay}-${index}`}
                                value={type}
                                checked={slot.clinicType === type}
                                onChange={(e) => handleTimeSlotChange(selectedDay, index, "clinicType", e.target.value)}
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  accentColor: "#4D227C",
                                  cursor: "pointer",
                                }}
                              />
                              <span>{type === "online" ? "Online Clinic" : "Physical Clinic"}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Schedule Summary */}
            <div
              style={{
                marginTop: "30px",
                padding: "15px",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
              }}
            >
              <h4 style={{ marginBottom: "10px" }}>Schedule Summary</h4>
              {DAYS_OF_WEEK.map(
                (day) =>
                  weeklySchedule[day].length > 0 && (
                    <div key={day} style={{ marginBottom: "8px" }}>
                      <strong>{day}:</strong>{" "}
                      {weeklySchedule[day].map((slot, idx) => {
                        const clinicTypeLabel =
                          slot.clinicType === "online"
                            ? " (Online Clinic)"
                            : slot.clinicType === "physical"
                            ? " (Physical Clinic)"
                            : "";
                        return (
                          <span key={idx}>
                            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                            {clinicTypeLabel}
                            {idx < weeklySchedule[day].length - 1 ? ", " : ""}
                          </span>
                        );
                      })}
                    </div>
                  )
              )}
              {DAYS_OF_WEEK.every((day) => weeklySchedule[day].length === 0) && (
                <div style={{ color: "#666" }}>No schedules added yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-add" onClick={handleSaveSchedule}>
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddScheduleModal;
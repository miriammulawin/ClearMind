import { useState } from "react";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatTime = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

const addOneHour = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const newH = (h + 1) % 24;
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const labelSt = {
  fontSize: "clamp(11px, 1.6vw, 12px)",
  fontWeight: 700,
  color: "#333",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  display: "block",
  marginBottom: 8,
};

const timeInputSt = {
  padding: "9px 12px",
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: "clamp(12px, 1.8vw, 14px)",
  color: "#333",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

/* ── AddScheduleModal ───────────────────────────────────────────────────── */
function AddScheduleModal({ isOpen, onClose, savedSchedule, onSave }) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [weeklySchedule, setWeeklySchedule] = useState({
    Monday: [{ startTime: "", endTime: "", clinicType: "" }],
    Tuesday: [], Wednesday: [], Thursday: [],
    Friday: [], Saturday: [], Sunday: [],
  });

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    if (!weeklySchedule[day].length) {
      setWeeklySchedule((prev) => ({
        ...prev,
        [day]: [{ startTime: "", endTime: "", clinicType: "" }],
      }));
    }
  };

  const handleAddTimeSlot = () =>
    setWeeklySchedule((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], { startTime: "", endTime: "", clinicType: "" }],
    }));

  const handleRemoveTimeSlot = (index) =>
    setWeeklySchedule((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((_, i) => i !== index),
    }));

  const handleTimeSlotChange = (index, field, value) =>
    setWeeklySchedule((prev) => {
      const updated = [...prev[selectedDay]];
      if (field === "startTime") {
        updated[index] = { ...updated[index], startTime: value, endTime: addOneHour(value) };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, [selectedDay]: updated };
    });

  const handleSaveSchedule = () => {
    for (const day of DAYS_OF_WEEK) {
      for (const slot of weeklySchedule[day]) {
        if (!slot.startTime || !slot.endTime) {
          alert("Please fill in all time slots or remove empty ones.");
          return;
        }
        if (!slot.clinicType) {
          alert("Please select a clinic type for all time slots.");
          return;
        }
      }
    }

    const merged = { ...(savedSchedule ?? {}) };
    DAYS_OF_WEEK.forEach((day) => {
      if (weeklySchedule[day].length > 0)
        merged[day] = weeklySchedule[day].map((s) => ({ ...s }));
    });

    onSave(merged);
    alert("Schedule saved successfully!");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .day-full  { display: inline; }
        .day-short { display: none; }
        @media (max-width: 480px) {
          .day-full  { display: none; }
          .day-short { display: inline; }
        }

        .asm-day-btn {
          padding: 8px 16px; border-radius: 8px; cursor: pointer;
          font-size: clamp(12px, 1.8vw, 14px); transition: all 0.2s;
          white-space: nowrap; font-family: inherit;
        }
        .asm-day-btn:hover:not(.asm-day-active) {
          border-color: #9b6bbf !important;
          color: #4D227C !important;
          background-color: #f5f0fa !important;
        }
        @media (max-width: 480px) {
          .asm-day-btn { padding: 6px 10px !important; }
        }

        .asm-slot-card {
          padding: 16px; background-color: #f9f9f9;
          border-radius: 8px; border: 1px solid #e0e0e0;
          transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
        }
        .asm-slot-card:hover {
          border-color: #9b6bbf !important;
          background-color: #f3ecff !important;
          box-shadow: 0 4px 14px rgba(77,34,124,0.10) !important;
        }

        .asm-time-row {
          display: grid;
          grid-template-columns: 56px 1fr 28px 1fr;
          align-items: center; gap: 10px;
        }
        .asm-time-sep { text-align: center; font-size: clamp(12px,1.8vw,13px); color: #555; font-weight: 500; }
        .asm-time-lbl { font-size: clamp(12px,1.8vw,13px); font-weight: 600; color: #333; }
        @media (max-width: 520px) {
          .asm-time-row { grid-template-columns: 1fr 1fr; }
          .asm-time-sep { display: none; }
          .asm-time-lbl { grid-column: 1 / -1; }
        }
        @media (max-width: 360px) {
          .asm-time-row { grid-template-columns: 1fr; }
        }

        .asm-slot-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 14px;
        }
        @media (max-width: 400px) {
          .asm-slot-header { flex-direction: column; align-items: flex-start; gap: 8px; }
        }

        .asm-day-buttons { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 20, boxSizing: "border-box",
      }}>
        <div
          className="appointment-modal-lg"
          style={{ display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 40px)", overflow: "hidden" }}
        >
          {/* Header */}
          <div className="modal-header" style={{ flexShrink: 0 }}>
            <h2 style={{ margin: 0, fontSize: "clamp(15px, 2.5vw, 20px)" }}>
              Add Weekly Schedule
            </h2>
            <button
              className="close-btn" onClick={onClose}
              style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center" }}
            >
              <FiX />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="modal-body" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            <div className="modal-section">

              {/* Day Selector */}
              <p style={{ ...labelSt, marginBottom: 10 }}>Select Day of the Week</p>
              <div className="asm-day-buttons">
                {DAYS_OF_WEEK.map((day, i) => (
                  <button
                    key={day}
                    className={`asm-day-btn${selectedDay === day ? " asm-day-active" : ""}`}
                    onClick={() => handleSelectDay(day)}
                    style={{
                      border: selectedDay === day ? "2px solid #4D227C" : "1px solid #ddd",
                      backgroundColor: selectedDay === day ? "#4D227C" : "#fff",
                      color: selectedDay === day ? "#fff" : "#333",
                      fontWeight: selectedDay === day ? 700 : 400,
                    }}
                  >
                    <span className="day-full">{day}</span>
                    <span className="day-short">{DAY_SHORT[i]}</span>
                  </button>
                ))}
              </div>

              {/* Time Slots */}
              <div>
                <div className="asm-slot-header">
                  <p style={{ ...labelSt, margin: 0 }}>
                    Time Slots for{" "}
                    <span style={{ color: "#4D227C", fontWeight: 800 }}>{selectedDay}</span>
                  </p>
                  <button
                    onClick={handleAddTimeSlot}
                    style={{
                      padding: "8px 14px", borderRadius: 8, border: "none",
                      backgroundColor: "#4D227C", color: "#fff", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                      fontWeight: 600, fontSize: "clamp(12px, 1.8vw, 13px)",
                      flexShrink: 0, fontFamily: "inherit",
                    }}
                  >
                    <FiPlus size={14} /> Add Time Slot
                  </button>
                </div>

                {weeklySchedule[selectedDay].length === 0 ? (
                  <div style={{
                    padding: 20, textAlign: "center", color: "#555",
                    backgroundColor: "#f5f5f5", borderRadius: 8,
                    fontSize: "clamp(12px,1.8vw,14px)", border: "1px dashed #ddd",
                  }}>
                    No time slots for <strong style={{ color: "#333" }}>{selectedDay}</strong>.
                    Click <strong style={{ color: "#4D227C" }}>+ Add Time Slot</strong> to get started.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {weeklySchedule[selectedDay].map((slot, index) => (
                      <div key={index} className="asm-slot-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: 700, color: "#4D227C" }}>
                            Slot {index + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveTimeSlot(index)}
                            style={{
                              padding: "6px 8px", borderRadius: 6, border: "none",
                              backgroundColor: "#ff4444", color: "#fff", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>

                        <div className="asm-time-row">
                          <span className="asm-time-lbl">Start</span>
                          <input
                            type="time" value={slot.startTime}
                            onChange={(e) => handleTimeSlotChange(index, "startTime", e.target.value)}
                            style={timeInputSt}
                          />
                          <span className="asm-time-sep">to</span>
                          <input
                            type="time" value={slot.endTime}
                            onChange={(e) => handleTimeSlotChange(index, "endTime", e.target.value)}
                            style={timeInputSt}
                          />
                        </div>
                        <div className="asm-time-row" style={{ marginTop: 4 }}>
                          <span />
                          <span style={{ fontSize: "clamp(10px,1.5vw,11px)", color: "#888", paddingLeft: 2 }}>Start Time</span>
                          <span />
                          <span style={{ fontSize: "clamp(10px,1.5vw,11px)", color: "#888", paddingLeft: 2 }}>End Time</span>
                        </div>

                        <div style={{ marginTop: 14 }}>
                          <span style={labelSt}>Clinic Type</span>
                          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                            {["online", "physical"].map((type) => (
                              <label
                                key={type}
                                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "clamp(12px,1.8vw,13px)", color: "#333" }}
                              >
                                <input
                                  type="radio"
                                  name={`clinicType-${selectedDay}-${index}`}
                                  value={type}
                                  checked={slot.clinicType === type}
                                  onChange={(e) => handleTimeSlotChange(index, "clinicType", e.target.value)}
                                  style={{ width: 16, height: 16, accentColor: "#4D227C", cursor: "pointer" }}
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

              {/* Schedule Summary — live as soon as start + end time are set */}
              <div style={{
                marginTop: 28, padding: 16,
                backgroundColor: "#f5f3ff", borderRadius: 10, border: "1px solid #e0d4f5",
              }}>
                <p style={{ ...labelSt, color: "#4D227C", marginBottom: 12 }}>Schedule Summary</p>
                {DAYS_OF_WEEK.every((d) => !weeklySchedule[d]?.some((s) => s.startTime && s.endTime)) ? (
                  <div style={{ color: "#999", fontSize: "clamp(12px,1.8vw,13px)" }}>No slots added yet.</div>
                ) : (
                  DAYS_OF_WEEK.map((day) => {
                    const slots = weeklySchedule[day]?.filter((s) => s.startTime && s.endTime);
                    if (!slots?.length) return null;
                    return (
                      <div key={day} style={{ marginBottom: 8, fontSize: "clamp(12px,1.8vw,13px)", color: "#333", lineHeight: 1.6 }}>
                        <strong style={{ color: "#4D227C" }}>{day}:</strong>{" "}
                        {slots.map((slot, idx) => (
                          <span key={idx}>
                            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                            {slot.clinicType ? ` (${slot.clinicType === "online" ? "Online" : "Physical"} Clinic)` : ""}
                            {idx < slots.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ flexShrink: 0 }}>
            <button className="btn-add" onClick={handleSaveSchedule}>
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddScheduleModal;
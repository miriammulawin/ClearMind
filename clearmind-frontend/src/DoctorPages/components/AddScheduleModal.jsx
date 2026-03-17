import { useState } from "react";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import styles from "../DoctorStyle/AddScheduleModal.module.css";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const EMPTY_SLOT = { startTime: "", endTime: "", clinicType: "" };

function AddScheduleModal({ isOpen, onClose, savedSchedule, onSave }) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [weeklySchedule, setWeeklySchedule] = useState({
    Monday: [{ ...EMPTY_SLOT }],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    if (!weeklySchedule[day].length) {
      setWeeklySchedule((prev) => ({ ...prev, [day]: [{ ...EMPTY_SLOT }] }));
    }
  };

  const handleAddSlot = () =>
    setWeeklySchedule((prev) => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], { ...EMPTY_SLOT }],
    }));

  const handleRemoveSlot = (index) =>
    setWeeklySchedule((prev) => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter((_, i) => i !== index),
    }));

  const handleSlotChange = (index, field, value) =>
    setWeeklySchedule((prev) => {
      const updated = [...prev[selectedDay]];
      if (field === "startTime") {
        updated[index] = {
          ...updated[index],
          startTime: value,
          endTime: addOneHour(value),
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, [selectedDay]: updated };
    });

  const handleSave = () => {
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Add Weekly Schedule</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className={styles.body}>
          {/* ▸ Day Selector */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Select Day of the Week</span>
            <div className={styles.dayButtons}>
              {DAYS_OF_WEEK.map((day, i) => (
                <button
                  key={day}
                  className={`${styles.dayBtn} ${selectedDay === day ? styles.dayBtnActive : ""}`}
                  onClick={() => handleSelectDay(day)}
                >
                  <span className={styles.dayFull}>{day}</span>
                  <span className={styles.dayShort}>{DAY_SHORT[i]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ▸ Time Slots */}
          <div className={styles.section}>
            <div className={styles.slotHeader}>
              <p className={styles.slotHeaderLabel}>
                Time Slots for{" "}
                <span className={styles.slotHeaderDay}>{selectedDay}</span>
              </p>
              <button className={styles.btnAddSlot} onClick={handleAddSlot}>
                <FiPlus size={14} /> Add Time Slot
              </button>
            </div>

            {weeklySchedule[selectedDay].length === 0 ? (
              <div className={styles.emptySlots}>
                No time slots for <strong>{selectedDay}</strong>. Click{" "}
                <strong>+ Add Time Slot</strong> to get started.
              </div>
            ) : (
              <div className={styles.slotList}>
                {weeklySchedule[selectedDay].map((slot, index) => (
                  <div key={index} className={styles.slotCard}>
                    {/* Slot top row */}
                    <div className={styles.slotCardTop}>
                      <span className={styles.slotNumber}>
                        Slot {index + 1}
                      </span>
                      <button
                        className={styles.btnRemoveSlot}
                        onClick={() => handleRemoveSlot(index)}
                        title="Remove slot"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>

                    {/* Time inputs */}
                    <div className={styles.timeRow}>
                      <span className={styles.timeLabel}>Start</span>
                      <input
                        className={styles.timeInput}
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          handleSlotChange(index, "startTime", e.target.value)
                        }
                      />
                      <span className={styles.timeSep}>–</span>
                      <input
                        className={styles.timeInput}
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          handleSlotChange(index, "endTime", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.timeHintRow}>
                      <span />
                      <span className={styles.timeHintText}>Start Time</span>
                      <span />
                      <span className={styles.timeHintText}>End Time</span>
                    </div>

                    {/* Clinic type */}
                    <span className={styles.clinicTypeLabel}>Clinic Type</span>
                    <div className={styles.radioRow}>
                      {["online", "physical"].map((type) => (
                        <label key={type} className={styles.radioLabel}>
                          <input
                            type="radio"
                            className={styles.radioInput}
                            name={`clinicType-${selectedDay}-${index}`}
                            value={type}
                            checked={slot.clinicType === type}
                            onChange={(e) =>
                              handleSlotChange(
                                index,
                                "clinicType",
                                e.target.value,
                              )
                            }
                          />
                          {type === "online"
                            ? "Online Clinic"
                            : "Physical Clinic"}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ▸ Summary */}
          <div className={styles.summary}>
            <p className={styles.summaryTitle}>Schedule Summary</p>
            {DAYS_OF_WEEK.every(
              (d) => !weeklySchedule[d]?.some((s) => s.startTime && s.endTime),
            ) ? (
              <span className={styles.summaryEmpty}>No slots added yet.</span>
            ) : (
              DAYS_OF_WEEK.map((day) => {
                const slots = weeklySchedule[day]?.filter(
                  (s) => s.startTime && s.endTime,
                );
                if (!slots?.length) return null;
                return (
                  <div key={day} className={styles.summaryRow}>
                    <span className={styles.summaryDay}>{day}:</span>{" "}
                    {slots.map((slot, idx) => (
                      <span key={idx}>
                        {formatTime(slot.startTime)} –{" "}
                        {formatTime(slot.endTime)}
                        {slot.clinicType
                          ? ` (${slot.clinicType === "online" ? "Online" : "Physical"})`
                          : ""}
                        {idx < slots.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* /body */}

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.btnSave} onClick={handleSave}>
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddScheduleModal;

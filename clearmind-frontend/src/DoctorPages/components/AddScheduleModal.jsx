import { useState } from "react";
import { FiX } from "react-icons/fi";
import { IoVideocam } from "react-icons/io5";
import { FaClinicMedical } from "react-icons/fa";
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

const TIME_BLOCKS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const BLOCK_END = {
  "9:00 AM": "10:00 AM",
  "10:00 AM": "11:00 AM",
  "11:00 AM": "12:00 PM",
  "12:00 PM": "1:00 PM",
  "1:00 PM": "2:00 PM",
  "2:00 PM": "3:00 PM",
  "3:00 PM": "4:00 PM",
  "4:00 PM": "5:00 PM",
  "5:00 PM": "6:00 PM",
};

function AddScheduleModal({ isOpen, onClose, savedSchedule, onSave }) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [clinicType, setClinicType] = useState("online");
  const [timeBlocks, setTimeBlocks] = useState(() =>
    Object.fromEntries(
      DAYS_OF_WEEK.map((d) => [d, { online: [], physical: [] }]),
    ),
  );

  /* ── already saved in DB ── */
  const isSavedBlock = (day, block) =>
    !!savedSchedule?.[day]?.some((s) => s.startTime === block);

  /* ── picked by the OTHER clinic type this session ── */
  const isBlockedByOther = (day, block) => {
    const other = clinicType === "online" ? "physical" : "online";
    return timeBlocks[day][other].includes(block);
  };

  const toggleBlock = (block) => {
    if (isSavedBlock(selectedDay, block)) return;
    if (isBlockedByOther(selectedDay, block)) return;
    setTimeBlocks((prev) => {
      const cur = prev[selectedDay][clinicType];
      const next = cur.includes(block)
        ? cur.filter((b) => b !== block)
        : [...cur, block];
      return {
        ...prev,
        [selectedDay]: { ...prev[selectedDay], [clinicType]: next },
      };
    });
  };

  const clearDay = () =>
    setTimeBlocks((p) => ({
      ...p,
      [selectedDay]: { online: [], physical: [] },
    }));

  const totalBlocks = DAYS_OF_WEEK.reduce(
    (a, d) => a + timeBlocks[d].online.length + timeBlocks[d].physical.length,
    0,
  );

  const handleSave = () => {
    const merged = { ...(savedSchedule ?? {}) };
    DAYS_OF_WEEK.forEach((day) => {
      const slots = [
        ...timeBlocks[day].online.map((b) => ({
          startTime: b,
          endTime: BLOCK_END[b],
          clinicType: "online",
        })),
        ...timeBlocks[day].physical.map((b) => ({
          startTime: b,
          endTime: BLOCK_END[b],
          clinicType: "physical",
        })),
      ];
      if (slots.length) merged[day] = slots;
    });
    onSave(merged);
    onClose();
  };

  if (!isOpen) return null;

  const activeBlocks = timeBlocks[selectedDay][clinicType];
  const otherType = clinicType === "online" ? "physical" : "online";
  const summaryDays = DAYS_OF_WEEK.filter(
    (d) => timeBlocks[d].online.length || timeBlocks[d].physical.length,
  );

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Add Weekly Schedule</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className={styles.body}>
          {/* ▸ 1. Day Selector */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Select Day of the Week</span>
            <div className={styles.dayButtons}>
              {DAYS_OF_WEEK.map((day, i) => {
                const hasBlocks = !!(
                  timeBlocks[day].online.length ||
                  timeBlocks[day].physical.length
                );
                const isActive = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`${styles.dayBtn} ${isActive ? styles.dayBtnActive : ""}`}
                  >
                    <span className={styles.dayFull}>{day}</span>
                    <span className={styles.dayShort}>{DAY_SHORT[i]}</span>
                    {/* dot indicator — inline so position always works */}
                    {hasBlocks && (
                      <span
                        style={{
                          position: "absolute",
                          top: 5,
                          right: 6,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: isActive
                            ? "rgba(255,255,255,0.7)"
                            : "#a78bfa",
                          display: "inline-block",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ▸ 2. Clinic Type */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Clinic Type</span>
            {/* inline flex — guarantees row layout regardless of CSS module hashing */}
            <div
              style={{
                display: "flex",
                gap: "clamp(8px, 1.2vw, 10px)",
                flexWrap: "wrap",
              }}
            >
              {[
                { value: "online", label: "Online Clinic", Icon: IoVideocam },
                {
                  value: "physical",
                  label: "Physical Clinic",
                  Icon: FaClinicMedical,
                },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setClinicType(value)}
                  className={`${styles.clinicBtn} ${clinicType === value ? styles.clinicBtnActive : ""}`}
                  style={{ flex: 1, minWidth: "120px" }}
                >
                  <Icon className={styles.clinicIcon} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ▸ 3. Time Block Grid */}
          <div className={styles.section}>
            <div className={styles.slotHeader}>
              <span className={styles.sectionLabel} style={{ margin: 0 }}>
                Available Hours —{" "}
                <span className={styles.slotHeaderDay}>{selectedDay}</span>
              </span>
              {activeBlocks.length > 0 && (
                <button className={styles.btnClearDay} onClick={clearDay}>
                  Clear day
                </button>
              )}
            </div>

            <p className={styles.slotHint}>
              Tap a time block to mark it as available for{" "}
              {clinicType === "online" ? "Online" : "Physical"} Clinic
            </p>

            {/* inline grid — guarantees 3-col layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "clamp(6px, 1vw, 10px)",
              }}
            >
              {TIME_BLOCKS.map((block) => {
                const isSelected = activeBlocks.includes(block);
                const isSaved = isSavedBlock(selectedDay, block);
                const isConflict =
                  !isSelected && isBlockedByOther(selectedDay, block);
                const isDisabled = isSaved || isConflict;

                let btnClass = styles.blockBtn;
                if (isSelected) btnClass += ` ${styles.blockBtnSelected}`;
                if (isConflict) btnClass += ` ${styles.blockBtnConflict}`;
                if (isSaved) btnClass += ` ${styles.blockBtnSaved}`;

                return (
                  <button
                    key={block}
                    onClick={() => toggleBlock(block)}
                    disabled={isDisabled}
                    className={btnClass}
                  >
                    <span className={styles.blockTime}>
                      {block} – {BLOCK_END[block]}
                    </span>
                    {isSaved && (
                      <span className={styles.blockSub}>Already set</span>
                    )}
                    {isConflict && (
                      <span className={styles.blockSub}>
                        {otherType === "online" ? "Online" : "Physical"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ▸ 4. Summary */}
          <div className={styles.summary}>
            <p className={styles.summaryTitle}>
              Schedule Summary
              {totalBlocks > 0 && (
                <span className={styles.summaryBadge}>
                  {totalBlocks} slot{totalBlocks !== 1 ? "s" : ""}
                </span>
              )}
            </p>

            {summaryDays.length === 0 ? (
              <span className={styles.summaryEmpty}>No slots added yet.</span>
            ) : (
              <div className={styles.summaryGrid}>
                {summaryDays.map((day) => (
                  <div key={day} className={styles.summaryDayCard}>
                    <span className={styles.summaryDayName}>{day}</span>
                    <div className={styles.summarySlots}>
                      {["online", "physical"].map((type) =>
                        timeBlocks[day][type].length ? (
                          <div key={type} className={styles.summaryTypeRow}>
                            {type === "online" ? (
                              <IoVideocam
                                className={styles.summaryTypeIcon}
                                style={{ color: "#4D227C" }}
                              />
                            ) : (
                              <FaClinicMedical
                                className={styles.summaryTypeIcon}
                                style={{ color: "#1f6aa5" }}
                              />
                            )}
                            <span>
                              {timeBlocks[day][type]
                                .slice()
                                .sort()
                                .map((b) => `${b} – ${BLOCK_END[b]}`)
                                .join(", ")}
                            </span>
                          </div>
                        ) : null,
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

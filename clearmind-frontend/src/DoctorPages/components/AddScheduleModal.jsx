import { useState } from "react";
import { FiX } from "react-icons/fi";
import { IoVideocam } from "react-icons/io5";
import { FaClinicMedical } from "react-icons/fa";

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

const PURPLE = "#4D227C";
const PURPLE_DARK = "#3a1960";
const PURPLE_LIGHT = "#f3eeff";

const S = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    boxSizing: "border-box",
    fontFamily: "'Poppins',sans-serif",
  },
  modal: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "640px",
    maxHeight: "calc(100vh - 32px)",
    overflow: "hidden",
    margin: "auto",
    borderRadius: "18px",
    background: "#fff",
    boxShadow: "0 24px 64px rgba(77,34,124,0.28)",
    animation: "modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)",
  },
  header: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: PURPLE,
    padding: "16px 20px",
    borderRadius: "18px 18px 0 0",
  },
  headerTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    fontFamily: "'Poppins',sans-serif",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    minHeight: 0,
    background: "#f5f0fb",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  section: {
    background: "#fff",
    border: "1px solid #ede5f7",
    borderRadius: "14px",
    padding: "16px",
    boxShadow: "0 2px 10px rgba(77,34,124,0.05)",
  },
  sectionLabel: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: PURPLE,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    margin: "0 0 12px 0",
    fontFamily: "'Poppins',sans-serif",
  },
  footer: {
    flexShrink: 0,
    borderTop: "2px solid #ede5f7",
    padding: "12px 20px",
    background: "#fff",
    borderRadius: "0 0 18px 18px",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "10px",
  },
  btn: {
    boxSizing: "border-box",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontFamily: "'Poppins',sans-serif",
    lineHeight: 1.4,
    textDecoration: "none",
    outline: "none",
    transition: "all 0.18s",
    WebkitAppearance: "none",
    appearance: "none",
  },
};

function AddScheduleModal({ isOpen, onClose, savedSchedule, onSave }) {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [timeBlocks, setTimeBlocks] = useState(() =>
    Object.fromEntries(
      DAYS_OF_WEEK.map((d) => [d, { online: [], physical: [] }]),
    ),
  );
  const [clinicType, setClinicType] = useState("online");
  const [hDay, setHDay] = useState(null);
  const [hClinic, setHClinic] = useState(null);
  const [hBlock, setHBlock] = useState(null);
  const [hFooter, setHFooter] = useState(null);

  /* ── already saved in DB ── */
  const isSavedBlock = (day, block) =>
    !!savedSchedule?.[day]?.some((s) => s.startTime === block);

  /* ── picked in the OTHER clinic type this session ── */
  const isBlockedByOther = (day, block) => {
    const other = clinicType === "online" ? "physical" : "online";
    return timeBlocks[day][other].includes(block);
  };

  const toggleBlock = (block) => {
    if (isSavedBlock(selectedDay, block)) return;
    if (isBlockedByOther(selectedDay, block)) return; // conflict — already in other type
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

  const isMobile = window.innerWidth < 576;

  return (
    <>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(-20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

      <div
        style={{
          ...S.backdrop,
          ...(isMobile ? { padding: 0, alignItems: "flex-end" } : {}),
        }}
      >
        <div
          style={{
            ...S.modal,
            ...(isMobile
              ? {
                  maxWidth: "100%",
                  maxHeight: "95vh",
                  borderRadius: "18px 18px 0 0",
                }
              : {}),
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              ...S.header,
              ...(isMobile
                ? { borderRadius: "18px 18px 0 0", padding: "14px 16px" }
                : {}),
            }}
          >
            <h2 style={S.headerTitle}>Add Weekly Schedule</h2>
            <button
              onClick={onClose}
              style={{
                ...S.btn,
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "34px",
                height: "34px",
                minWidth: "34px",
                fontSize: "18px",
                padding: 0,
                flexShrink: 0,
              }}
            >
              <FiX />
            </button>
          </div>

          {/* ── Body ── */}
          <div
            style={{
              ...S.body,
              ...(isMobile ? { padding: "12px", gap: "10px" } : {}),
            }}
          >
            {/* ▸ Day Selector */}
            <div
              style={{
                ...S.section,
                ...(isMobile ? { padding: "12px", borderRadius: "10px" } : {}),
              }}
            >
              <span style={S.sectionLabel}>Select Day of the Week</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {DAYS_OF_WEEK.map((day, i) => {
                  const hasBlocks = !!(
                    timeBlocks[day].online.length ||
                    timeBlocks[day].physical.length
                  );
                  const isActive = selectedDay === day;
                  const isHov = hDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      onMouseEnter={() => setHDay(day)}
                      onMouseLeave={() => setHDay(null)}
                      style={{
                        ...S.btn,
                        position: "relative",
                        padding: "7px 14px",
                        borderRadius: "9px",
                        border: `1.5px solid ${PURPLE}`,
                        background: isActive
                          ? PURPLE
                          : isHov
                            ? PURPLE_LIGHT
                            : "#fff",
                        color: isActive ? "#fff" : PURPLE,
                        fontSize: "13px",
                        fontWeight: isActive ? 600 : 500,
                        whiteSpace: "nowrap",
                        boxShadow: "none",
                      }}
                    >
                      <span style={{ display: isMobile ? "none" : "inline" }}>
                        {day}
                      </span>
                      <span style={{ display: isMobile ? "inline" : "none" }}>
                        {DAY_SHORT[i]}
                      </span>
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

            {/* ▸ Clinic Type */}
            <div
              style={{
                ...S.section,
                ...(isMobile ? { padding: "12px", borderRadius: "10px" } : {}),
              }}
            >
              <span style={S.sectionLabel}>Clinic Type</span>
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  gap: "10px",
                  width: "100%",
                }}
              >
                {[
                  { value: "online", label: "Online Clinic", Icon: IoVideocam },
                  {
                    value: "physical",
                    label: "Physical Clinic",
                    Icon: FaClinicMedical,
                  },
                ].map(({ value, label, Icon }) => {
                  const isActive = clinicType === value;
                  const isHov = hClinic === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setClinicType(value)}
                      onMouseEnter={() => setHClinic(value)}
                      onMouseLeave={() => setHClinic(null)}
                      style={{
                        ...S.btn,
                        flex: 1,
                        gap: "8px",
                        padding: "11px 16px",
                        borderRadius: "10px",
                        border: `1.5px solid ${PURPLE}`,
                        background: isActive
                          ? PURPLE
                          : isHov
                            ? PURPLE_LIGHT
                            : "#fff",
                        color: isActive ? "#fff" : PURPLE,
                        fontSize: "13px",
                        fontWeight: isActive ? 600 : 500,
                        whiteSpace: "nowrap",
                        boxShadow: isActive
                          ? "0 4px 12px rgba(77,34,124,0.25)"
                          : "none",
                      }}
                    >
                      <Icon style={{ fontSize: 16, flexShrink: 0 }} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ▸ Time Blocks */}
            <div
              style={{
                ...S.section,
                ...(isMobile ? { padding: "12px", borderRadius: "10px" } : {}),
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <span style={{ ...S.sectionLabel, margin: 0 }}>
                  Available Hours —{" "}
                  <span
                    style={{
                      color: PURPLE,
                      fontWeight: 700,
                      textTransform: "none",
                      letterSpacing: 0,
                      fontSize: "12px",
                    }}
                  >
                    {selectedDay}
                  </span>
                </span>
                {activeBlocks.length > 0 && (
                  <button
                    onClick={clearDay}
                    style={{
                      ...S.btn,
                      background: "#fff0f0",
                      color: "#dc2626",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      boxShadow: "none",
                    }}
                  >
                    Clear day
                  </button>
                )}
              </div>

              <p
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  fontFamily: "'Poppins',sans-serif",
                  margin: "0 0 12px 0",
                }}
              >
                Tap a time block to mark it as available for{" "}
                {clinicType === "online" ? "Online" : "Physical"} Clinic
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2,1fr)"
                    : "repeat(3,1fr)",
                  gap: "8px",
                  width: "100%",
                }}
              >
                {TIME_BLOCKS.map((block) => {
                  const isSelected = activeBlocks.includes(block);
                  const isSaved = isSavedBlock(selectedDay, block);
                  const isConflict =
                    !isSelected && isBlockedByOther(selectedDay, block);
                  const isDisabled = isSaved || isConflict;
                  const isHov = hBlock === block && !isDisabled;

                  /* ── colour logic ── */
                  let bg, color, border, shadow, cursor;

                  if (isSaved) {
                    /* grey — already in DB */
                    bg = "#f3f3f3";
                    color = "#bbb";
                    border = "1.5px solid #e0e0e0";
                    shadow = "none";
                    cursor = "not-allowed";
                  } else if (isConflict) {
                    /* amber — taken by other clinic type this session */
                    bg = "#fff8e1";
                    color = "#b45309";
                    border = "1.5px solid #f59e0b";
                    shadow = "none";
                    cursor = "not-allowed";
                  } else if (isSelected) {
                    bg = isHov ? PURPLE_DARK : PURPLE;
                    color = "#fff";
                    border = `1.5px solid ${isHov ? PURPLE_DARK : PURPLE}`;
                    shadow = "0 4px 12px rgba(77,34,124,0.3)";
                    cursor = "pointer";
                  } else {
                    bg = isHov ? PURPLE_LIGHT : "#fff";
                    color = PURPLE;
                    border = `1.5px solid ${PURPLE}`;
                    shadow = "none";
                    cursor = "pointer";
                  }

                  /* label shown below the time */
                  let subLabel = null;
                  if (isSaved)
                    subLabel = (
                      <span
                        style={{
                          display: "block",
                          fontSize: "9px",
                          color: "#aaa",
                          marginTop: "2px",
                          fontFamily: "'Poppins',sans-serif",
                          pointerEvents: "none",
                        }}
                      >
                        Already set
                      </span>
                    );
                  if (isConflict)
                    subLabel = (
                      <span
                        style={{
                          display: "block",
                          fontSize: "9px",
                          color: "#b45309",
                          marginTop: "2px",
                          fontFamily: "'Poppins',sans-serif",
                          pointerEvents: "none",
                        }}
                      >
                        {otherType === "online" ? "Online" : "Physical"}
                      </span>
                    );

                  return (
                    <button
                      key={block}
                      onClick={() => toggleBlock(block)}
                      disabled={isDisabled}
                      onMouseEnter={() => !isDisabled && setHBlock(block)}
                      onMouseLeave={() => setHBlock(null)}
                      style={{
                        ...S.btn,
                        flexDirection: "column",
                        gap: "2px",
                        padding: "10px 6px",
                        borderRadius: "8px",
                        border,
                        background: bg,
                        color,
                        width: "100%",
                        minHeight: "42px",
                        textAlign: "center",
                        boxShadow: shadow,
                        cursor,
                        opacity: isDisabled ? 0.75 : 1,
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "inherit",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          width: "100%",
                          textAlign: "center",
                          fontFamily: "'Poppins',sans-serif",
                          pointerEvents: "none",
                        }}
                      >
                        {block}– {BLOCK_END[block]}
                      </span>
                      {subLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ▸ Summary */}
            <div
              style={{
                ...S.section,
                ...(isMobile ? { padding: "12px", borderRadius: "10px" } : {}),
              }}
            >
              <p
                style={{
                  ...S.sectionLabel,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  margin: "0 0 12px 0",
                }}
              >
                Schedule Summary
                {totalBlocks > 0 && (
                  <span
                    style={{
                      background: PURPLE,
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "20px",
                      letterSpacing: 0,
                      fontFamily: "'Poppins',sans-serif",
                    }}
                  >
                    {totalBlocks} slot{totalBlocks !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
              {summaryDays.length === 0 ? (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontFamily: "'Poppins',sans-serif",
                  }}
                >
                  No slots added yet.
                </span>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {summaryDays.map((day) => (
                    <div
                      key={day}
                      style={{
                        background: "#faf7ff",
                        border: "1px solid #ede5f7",
                        borderRadius: "10px",
                        padding: "12px 14px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#2e104e",
                          fontFamily: "'Poppins',sans-serif",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        {day}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        {["online", "physical"].map((type) =>
                          timeBlocks[day][type].length ? (
                            <div
                              key={type}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "8px",
                                fontSize: "11px",
                                fontFamily: "'Poppins',sans-serif",
                                color: "#374151",
                                lineHeight: 1.5,
                              }}
                            >
                              {type === "online" ? (
                                <IoVideocam
                                  style={{
                                    fontSize: 13,
                                    color: PURPLE,
                                    flexShrink: 0,
                                    marginTop: 1,
                                  }}
                                />
                              ) : (
                                <FaClinicMedical
                                  style={{
                                    fontSize: 13,
                                    color: "#1f6aa5",
                                    flexShrink: 0,
                                    marginTop: 1,
                                  }}
                                />
                              )}
                              <span
                                style={{
                                  color: "#374151",
                                  fontSize: "11px",
                                  fontFamily: "'Poppins',sans-serif",
                                }}
                              >
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

          {/* ── Footer ── */}
          <div
            style={{
              ...S.footer,
              ...(isMobile
                ? { padding: "10px 14px", borderRadius: 0, flexWrap: "wrap" }
                : {}),
            }}
          >
            <button
              onClick={onClose}
              onMouseEnter={() => setHFooter("cancel")}
              onMouseLeave={() => setHFooter(null)}
              style={{
                ...S.btn,
                ...(isMobile ? { flex: 1 } : {}),
                background: hFooter === "cancel" ? PURPLE_LIGHT : "#fff",
                color: PURPLE,
                border: `1.5px solid #c9b8f0`,
                padding: "10px 22px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                boxShadow: "none",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              onMouseEnter={() => setHFooter("save")}
              onMouseLeave={() => setHFooter(null)}
              style={{
                ...S.btn,
                ...(isMobile ? { flex: 1 } : {}),
                background: hFooter === "save" ? PURPLE_DARK : PURPLE,
                color: "#fff",
                border: `2px solid ${hFooter === "save" ? PURPLE_DARK : PURPLE}`,
                padding: "10px 26px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(77,34,124,0.3)",
              }}
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddScheduleModal;

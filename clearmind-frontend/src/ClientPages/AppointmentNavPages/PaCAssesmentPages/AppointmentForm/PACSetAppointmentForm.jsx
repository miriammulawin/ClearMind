import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaClock,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
} from "date-fns";
import axiosClient from "../../../../axiosClient";

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const APPOINTMENT_DURATION_MINS = 60; // 1-hour sessions

const DAY_ABBR = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

const STEPS = ["Schedule", "Verify Details", "Confirm"];

/* ─────────────────────────────────────────────────────────
   HELPERS  (same logic as admin CreateAppointmentModal)
───────────────────────────────────────────────────────── */

/** HH:MM  →  "12:00 PM" */
function formatTimePH(time24) {
  if (!time24) return "—";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Returns true if choosing slotTime as a START would overlap
 * any existing booked slot.  Each slot is 60 min wide.
 */
function isSlotBooked(slotTime, bookedSlots) {
  if (!bookedSlots || bookedSlots.length === 0) return false;
  const [sh, sm] = slotTime.split(":").map(Number);
  const slotStart = sh * 60 + sm;
  const slotEnd = slotStart + APPOINTMENT_DURATION_MINS;

  return bookedSlots.some((b) => {
    const [bsh, bsm] = b.start_time.split(":").map(Number);
    const [beh, bem] = b.end_time.split(":").map(Number);
    const bStart = bsh * 60 + bsm;
    const bEnd =
      beh * 60 + bem > bStart
        ? beh * 60 + bem
        : bStart + APPOINTMENT_DURATION_MINS;
    return slotStart < bEnd && slotEnd > bStart;
  });
}

/**
 * Build every valid 30-min-spaced START time within a schedule window.
 * The last valid start is schedEnd − 60 min (so the session fits exactly).
 *
 *  e.g. 9:00–17:00  →  9:00 9:30 10:00 … 16:00  (NOT 16:30, NOT 17:00)
 */
function buildSlotsForSchedule(schedEntry) {
  if (!schedEntry) return [];
  const sh = parseInt(schedEntry.start_time.split(":")[0]);
  const sm = parseInt(schedEntry.start_time.split(":")[1]);
  const eh = parseInt(schedEntry.end_time.split(":")[0]);
  const em = parseInt(schedEntry.end_time.split(":")[1]);
  const schedEnd = eh * 60 + em; // schedule end in minutes

  const slots = [];
  for (let h = sh; h <= eh; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === sh && m < sm) continue;
      const start = h * 60 + m;
      // ✅ skip if the full 60-min session would overflow the schedule
      if (start + APPOINTMENT_DURATION_MINS > schedEnd) continue;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

/**
 * Returns true when every valid slot on a given date is already booked.
 */
function isDateFullyBooked(dateStr, bookedSlotsForDate, doctorSchedule) {
  if (!bookedSlotsForDate || bookedSlotsForDate.length === 0) return false;
  if (!doctorSchedule || doctorSchedule.length === 0) return false;
  const dayNum = new Date(dateStr + "T00:00:00").getDay();
  const sched = doctorSchedule.find((s) => s.day_num === dayNum);
  if (!sched) return false;
  const all = buildSlotsForSchedule(sched);
  return (
    all.length > 0 && all.every((t) => isSlotBooked(t, bookedSlotsForDate))
  );
}

/* ─────────────────────────────────────────────────────────
   CALENDAR COMPONENT
   • Only scheduled days are clickable
   • Past dates are disabled
   • Fully-booked dates show a red dot and are disabled
   • Available (not fully-booked) scheduled dates show a purple dot
───────────────────────────────────────────────────────── */
function Calendar({
  value,
  onChange,
  schedule,
  fullyBookedDates = new Set(),
  loadingDates = false,
  onMonthChange,
}) {
  const [viewDate, setViewDate] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const availDayNums = (schedule || []).map((s) => s.day_num);

  // Calendar grid
  const monthStart = startOfMonth(viewDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 });
  const days = [];
  let cur = calStart;
  while (cur <= calEnd) {
    days.push(new Date(cur));
    cur = addDays(cur, 1);
  }

  const goMonth = (dir) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth() + dir, 1);
    setViewDate(d);
    onMonthChange?.(d.getFullYear(), d.getMonth() + 1);
  };

  // Notify parent of initial visible month
  useEffect(() => {
    onMonthChange?.(viewDate.getFullYear(), viewDate.getMonth() + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = (d) => {
    if (isBefore(d, today)) return true; // past
    if (fullyBookedDates.has(format(d, "yyyy-MM-dd"))) return true; // fully booked
    if (availDayNums.length > 0) return !availDayNums.includes(d.getDay()); // not a scheduled day
    return false;
  };

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  return (
    <div style={cal.wrap}>
      {/* ── Month header ── */}
      <div style={cal.header}>
        <button style={cal.navBtn} onClick={() => goMonth(-1)}>
          <FaChevronLeft size={11} />
        </button>
        <span style={cal.monthLabel}>
          {format(viewDate, "MMMM yyyy")}
          {loadingDates && <span style={cal.spinner} />}
        </span>
        <button style={cal.navBtn} onClick={() => goMonth(1)}>
          <FaChevronRight size={11} />
        </button>
      </div>

      {/* ── Available day badges ── */}
      {availDayNums.length > 0 && (
        <div style={cal.availStrip}>
          <span style={cal.availLabel}>Available days:</span>
          {availDayNums.sort().map((n) => (
            <span key={n} style={cal.availBadge}>
              {DAY_ABBR[n]}
            </span>
          ))}
        </div>
      )}

      {/* ── Day-of-week headers ── */}
      <div style={cal.grid7}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} style={cal.dayHdr}>
            {d}
          </div>
        ))}
      </div>

      {/* ── Date cells ── */}
      <div style={cal.grid7}>
        {days.map((d, i) => {
          const ds = format(d, "yyyy-MM-dd");
          const inMon = isSameMonth(d, viewDate);
          const disabled = isDisabled(d);
          const isSel = selectedDate && isSameDay(d, selectedDate);
          const isTod = isToday(d);
          const isBooked =
            fullyBookedDates.has(ds) && inMon && !isBefore(d, today);
          // dot = purple when available & selectable, red when fully booked
          const showAvailDot =
            inMon &&
            !isBefore(d, today) &&
            availDayNums.includes(d.getDay()) &&
            !isBooked &&
            !isSel;
          const showBookedDot = isBooked && !isSel;

          return (
            <div
              key={i}
              title={
                isBooked && inMon
                  ? "Fully booked — no slots available"
                  : undefined
              }
              onClick={() => {
                if (!disabled && inMon) onChange(ds);
              }}
              style={{
                ...cal.cell,
                color: !inMon
                  ? "#e0d4f5"
                  : isSel
                    ? "#fff"
                    : isBooked
                      ? "#c4a0d4"
                      : disabled
                        ? "#d1d5db"
                        : isTod
                          ? "#4D227C"
                          : "#374151",
                background: isSel
                  ? "#4D227C"
                  : isTod && !isSel
                    ? "#f3ecfc"
                    : "transparent",
                border:
                  isTod && !isSel
                    ? "1.5px solid #d4b8f0"
                    : "1.5px solid transparent",
                opacity: !inMon ? 0.3 : isBooked ? 0.55 : 1,
                cursor: disabled || !inMon ? "not-allowed" : "pointer",
                fontWeight: isSel ? "700" : "400",
                boxShadow: isSel ? "0 2px 8px rgba(77,34,124,0.35)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!disabled && inMon && !isSel)
                  e.currentTarget.style.background = isBooked
                    ? "#fef2f2"
                    : "#f0ebfa";
              }}
              onMouseLeave={(e) => {
                if (!isSel)
                  e.currentTarget.style.background =
                    isTod && !isSel ? "#f3ecfc" : "transparent";
              }}
            >
              {d.getDate()}
              {showAvailDot && (
                <span style={{ ...cal.dot, background: "#4D227C" }} />
              )}
              {showBookedDot && (
                <span style={{ ...cal.dot, background: "#ef4444" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div style={cal.legend}>
        <span style={cal.legItem}>
          <span style={{ ...cal.legDot, background: "#4D227C" }} /> Available
        </span>
        <span style={cal.legItem}>
          <span style={{ ...cal.legDot, background: "#ef4444" }} /> Fully booked
        </span>
        <span style={cal.legItem}>
          <span
            style={{
              ...cal.legDot,
              background: "#4D227C",
              borderRadius: "3px",
            }}
          />{" "}
          Selected
        </span>
      </div>
    </div>
  );
}

// Calendar styles
const cal = {
  wrap: {
    background: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(77,34,124,0.10)",
    border: "1px solid #e8d8f8",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px 12px",
    background: "#4D227C",
  },
  navBtn: {
    background: "rgba(255,255,255,0.18)",
    border: "none",
    borderRadius: "7px",
    color: "#fff",
    cursor: "pointer",
    padding: "7px 10px",
    display: "flex",
    alignItems: "center",
    transition: "background .15s",
  },
  monthLabel: {
    fontWeight: "700",
    fontSize: "15px",
    color: "#fff",
    fontFamily: "Poppins,sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  spinner: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTop: "2px solid #fff",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
  availStrip: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    padding: "8px 16px",
    background: "#f0f9fd",
    borderBottom: "1px solid #d1fae5",
  },
  availLabel: { fontSize: "10px", color: "#056696", fontWeight: "700" },
  availBadge: {
    fontSize: "10px",
    background: "#4D227C",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "20px",
    fontWeight: "700",
  },
  grid7: {
    display: "grid",
    gridTemplateColumns: "repeat(7,1fr)",
    padding: "0 10px",
  },
  dayHdr: {
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: "#9c7dd4",
    padding: "10px 0 4px",
  },
  cell: {
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9px",
    fontSize: "13px",
    margin: "2px",
    transition: "background .12s,box-shadow .12s",
    position: "relative",
  },
  dot: {
    position: "absolute",
    bottom: "3px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
  },
  legend: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "10px 12px",
    borderTop: "1px solid #f0eaf8",
    flexWrap: "wrap",
  },
  legItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "10px",
    color: "#888",
  },
  legDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
  },
};

/* ─────────────────────────────────────────────────────────
   TIME PICKER COMPONENT
   • Only shows slots where full 60-min session fits in schedule
   • Hides already-booked slots entirely
   • Shows "end time" alongside each option
───────────────────────────────────────────────────────── */
function TimePicker({
  value,
  onChange,
  schedule,
  selectedDate,
  bookedSlots,
  loadingSlots,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Schedule entry for the chosen date
  const dayNum = selectedDate
    ? new Date(selectedDate + "T00:00:00").getDay()
    : null;
  const schedEntry =
    dayNum !== null ? (schedule || []).find((s) => s.day_num === dayNum) : null;

  // All valid start times (overflow slots already excluded)
  const allSlots = buildSlotsForSchedule(schedEntry);
  // Remove booked ones — they simply don't appear
  const available = allSlots.filter((t) => !isSlotBooked(t, bookedSlots));
  const bookedCount = allSlots.length - available.length;

  const disabled = !selectedDate || !schedEntry;

  // Compute end time string for a given start
  const endOf = (t) => {
    const [h, m] = t.split(":").map(Number);
    const total = h * 60 + m + APPOINTMENT_DURATION_MINS;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <div
        onClick={() => {
          if (!disabled && !loadingSlots) setOpen((o) => !o);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "13px 16px",
          borderRadius: "12px",
          border: open
            ? "2px solid #4D227C"
            : value
              ? "2px solid #c4a0d4"
              : "2px solid #e8d8f8",
          background: disabled ? "#f9f7fd" : value ? "#faf7ff" : "#fff",
          cursor: disabled || loadingSlots ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "all .2s",
          boxShadow: open ? "0 0 0 4px rgba(77,34,124,0.10)" : "none",
        }}
      >
        {loadingSlots ? (
          <div
            style={{
              width: "15px",
              height: "15px",
              borderRadius: "50%",
              border: "2px solid #4D227C",
              borderTop: "2px solid transparent",
              animation: "spin 0.8s linear infinite",
              flexShrink: 0,
            }}
          />
        ) : (
          <FaClock
            style={{ color: value ? "#4D227C" : "#bbb", flexShrink: 0 }}
          />
        )}
        <span
          style={{
            flex: 1,
            fontSize: "14px",
            color: loadingSlots ? "#aaa" : value ? "#2d1254" : "#aaa",
            fontWeight: value ? "600" : "400",
          }}
        >
          {loadingSlots
            ? "Loading slots…"
            : value
              ? `${formatTimePH(value)} – ${formatTimePH(endOf(value))}`
              : "Select time"}
        </span>
        {!disabled && !loadingSlots && (
          <FaChevronDown
            size={12}
            style={{
              color: "#4D227C",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform .2s",
            }}
          />
        )}
      </div>

      {/* Booked count hint */}
      {!disabled && bookedCount > 0 && !loadingSlots && (
        <div
          style={{
            marginTop: "5px",
            fontSize: "11px",
            color: "#9a3412",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#ef4444",
              display: "inline-block",
            }}
          />
          {bookedCount} slot{bookedCount > 1 ? "s" : ""} already booked on this
          date
        </div>
      )}

      {/* Dropdown */}
      {open && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #e8d8f8",
            borderRadius: "14px",
            boxShadow: "0 16px 48px rgba(77,34,124,.18)",
            overflow: "hidden",
          }}
        >
          {/* Schedule header */}
          {schedEntry && (
            <div
              style={{
                padding: "8px 14px",
                background: "#f5f0fb",
                borderBottom: "1px solid #e9d8fd",
                fontSize: "11px",
                color: "#4D227C",
                fontWeight: "700",
              }}
            >
              Schedule: {formatTimePH(schedEntry.start_time)} –{" "}
              {formatTimePH(schedEntry.end_time)}
            </div>
          )}
          {/* Booked hidden notice */}
          {bookedCount > 0 && (
            <div
              style={{
                padding: "6px 14px",
                background: "#fef2f2",
                borderBottom: "1px solid #fecaca",
                fontSize: "11px",
                color: "#991b1b",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  display: "inline-block",
                }}
              />
              {bookedCount} booked slot{bookedCount > 1 ? "s" : ""} hidden
            </div>
          )}
          {/* Slot list */}
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {available.length === 0 ? (
              <div
                style={{
                  padding: "28px 16px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "28px" }}>📅</span>
                <span
                  style={{
                    fontWeight: "700",
                    color: "#9a3412",
                    fontSize: "14px",
                  }}
                >
                  No available slots
                </span>
                <span style={{ color: "#aaa", fontSize: "12px" }}>
                  All time slots are booked for this date
                </span>
              </div>
            ) : (
              available.map((t) => {
                const isSel = value === t;
                return (
                  <div
                    key={t}
                    onClick={() => {
                      onChange(t);
                      setOpen(false);
                    }}
                    style={{
                      padding: "12px 16px",
                      fontSize: "14px",
                      cursor: "pointer",
                      color: isSel ? "#fff" : "#374151",
                      fontWeight: isSel ? "700" : "400",
                      background: isSel ? "#4D227C" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "background .12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSel) e.currentTarget.style.background = "#f0ebfa";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSel)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <FaClock
                      size={11}
                      style={{
                        color: isSel ? "#c4a8e8" : "#bbb",
                        flexShrink: 0,
                      }}
                    />
                    <span>{formatTimePH(t)}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: isSel ? "rgba(255,255,255,0.65)" : "#aaa",
                        marginLeft: "auto",
                      }}
                    >
                      ends {formatTimePH(endOf(t))}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────────────────── */
function StepIndicator({ current }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "36px",
      }}
    >
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: done || active ? "#4D227C" : "#e8d8f8",
                  color: done || active ? "#fff" : "#aaa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "700",
                  transition: "all .3s",
                  boxShadow: active ? "0 0 0 5px rgba(77,34,124,0.18)" : "none",
                }}
              >
                {done ? <FaCheck size={12} /> : i + 1}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: active ? "700" : "400",
                  color: active || done ? "#4D227C" : "#bbb",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  height: "2px",
                  width: "72px",
                  background: done ? "#4D227C" : "#e8d8f8",
                  marginBottom: "20px",
                  margin: "0 4px 20px",
                  transition: "background .3s",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
const SetAppointmentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor, selectedService } = location.state || {};

  // ── Wizard step ────────────────────────────────────────
  const [step, setStep] = useState(0);

  // ── Doctor schedule ────────────────────────────────────
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // ── User selections ────────────────────────────────────
  const [consultMode, setConsultMode] = useState("onsite");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");

  // ── Booked slots for selected date (TimePicker) ────────
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookedSlotsLoading, setBookedSlotsLoading] = useState(false);

  // ── Fully-booked dates map for the calendar ────────────
  // key = "yyyy-MM-dd", value = [{start_time, end_time}]
  const [monthBookedMap, setMonthBookedMap] = useState({});
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);

  // ── Submission ─────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /* ── 1. Fetch doctor schedule on mount ───────────────── */
  useEffect(() => {
    if (!doctor?.doctor_id) {
      setScheduleLoading(false);
      return;
    }
    setScheduleLoading(true);
    axiosClient
      .get(`/doctors/${doctor.doctor_id}/schedules`)
      .then((res) => setSchedule(res.data?.data?.schedule ?? []))
      .catch((e) => {
        console.error("Schedule fetch:", e);
        setSchedule([]);
      })
      .finally(() => setScheduleLoading(false));
  }, [doctor]);

  /* ── 2. Fetch booked slots for the selected date ─────── */
  useEffect(() => {
    if (!doctor?.id || !selectedDate) {
      setBookedSlots([]);
      return;
    }
    let cancelled = false;
    setBookedSlotsLoading(true);
    axiosClient
      .get("/appointments/booked-slots", {
        params: { doctor_user_id: doctor.id, date: selectedDate },
      })
      .then((res) => {
        if (!cancelled) setBookedSlots(res.data?.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setBookedSlots([]);
      })
      .finally(() => {
        if (!cancelled) setBookedSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [doctor, selectedDate]);

  /* ── 3. Fetch booked slots for a whole calendar month ── */
  const fetchMonthBookedSlots = useCallback(
    async (year, month) => {
      // Wait until we have the schedule so we know which days to check
      if (!doctor?.id || schedule.length === 0) return;

      setLoadingBookedDates(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const availNums = schedule.map((s) => s.day_num);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);

      // Only fetch dates that are: today-or-future AND on a scheduled day
      const dates = [];
      const d = new Date(monthStart);
      while (d <= monthEnd) {
        if (d >= today && availNums.includes(d.getDay()))
          dates.push(format(d, "yyyy-MM-dd"));
        d.setDate(d.getDate() + 1);
      }

      if (dates.length === 0) {
        setLoadingBookedDates(false);
        return;
      }

      try {
        const results = await Promise.all(
          dates.map((dateStr) =>
            axiosClient
              .get("/appointments/booked-slots", {
                params: { doctor_user_id: doctor.id, date: dateStr },
              })
              .then((r) => ({ dateStr, slots: r.data?.data ?? [] }))
              .catch(() => ({ dateStr, slots: [] })),
          ),
        );
        const newMap = {};
        results.forEach(({ dateStr, slots }) => {
          newMap[dateStr] = slots;
        });
        // Merge with existing map (other months stay cached)
        setMonthBookedMap((prev) => ({ ...prev, ...newMap }));
      } catch (e) {
        console.error("Month booked slots fetch:", e);
      } finally {
        setLoadingBookedDates(false);
      }
    },
    [doctor, schedule], // re-create when schedule or doctor changes
  );

  /* ── 4. Once schedule loads, immediately fetch current month ── */
  useEffect(() => {
    if (schedule.length > 0) {
      const now = new Date();
      fetchMonthBookedSlots(now.getFullYear(), now.getMonth() + 1);
    }
  }, [schedule, fetchMonthBookedSlots]);

  /* ── Reset month map when doctor changes ─────────────── */
  useEffect(() => {
    setMonthBookedMap({});
  }, [doctor]);

  /* ── Derived: Set of fully-booked date strings ───────── */
  const fullyBookedDates = new Set(
    Object.entries(monthBookedMap)
      .filter(([ds, slots]) => isDateFullyBooked(ds, slots, schedule))
      .map(([ds]) => ds),
  );

  /* ── Schedule entry for the currently selected date ───── */
  const scheduleForDate = (() => {
    if (!selectedDate || schedule.length === 0) return null;
    const dayNum = new Date(selectedDate + "T00:00:00").getDay();
    return schedule.find((s) => s.day_num === dayNum) || null;
  })();

  /* ── Auto-computed end time ───────────────────────────── */
  const computedEndTime = (() => {
    if (!selectedTime) return "";
    const [h, m] = selectedTime.split(":").map(Number);
    const total = h * 60 + m + APPOINTMENT_DURATION_MINS;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  })();

  /* ── Date change → clear time ─────────────────────────── */
  const handleDateChange = (ds) => {
    setSelectedDate(ds);
    setSelectedTime("");
  };

  /* ── Submit ───────────────────────────────────────────── */
  const handleSubmit = async () => {
    setSubmitError("");
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      await axiosClient.post("/appointments", {
        doctor_user_id: doctor.id,
        appointment_date: selectedDate,
        start_time: selectedTime,
        end_time: computedEndTime,
        visit_type: consultMode,
        reason_for_consultation: reason,
        service_type: selectedService || "",
      });
      setSubmitSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.start_time?.[0] ||
        "Failed to book appointment. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Guard: no doctor in state ───────────────────────── */
  if (!doctor) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          fontFamily: "Poppins,sans-serif",
        }}
      >
        <p style={{ color: "#888" }}>
          No doctor selected. Please go back and choose a doctor.
        </p>
        <button onClick={() => navigate(-1)} style={s.backBtn}>
          ← Go Back
        </button>
      </div>
    );
  }

  const canContinue = !!selectedDate && !!selectedTime;
  const initials =
    `${doctor.firstName?.[0] ?? ""}${doctor.lastName?.[0] ?? ""}`.toUpperCase();
  const doctorName =
    doctor.name || `${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim();

  /* ── Success screen ───────────────────────────────────── */
  if (submitSuccess) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f3fd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Poppins,sans-serif",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "40px 32px",
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 8px 40px rgba(77,34,124,0.14)",
            animation: "fadeIn .4s ease",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#dcfce7",
              border: "2px solid #bbf7d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <FaCheck size={26} color="#15803d" />
          </div>
          <h3
            style={{ color: "#2d1254", fontWeight: 700, marginBottom: "8px" }}
          >
            Appointment Booked!
          </h3>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
            Your appointment has been submitted and is pending confirmation.
          </p>
          <div
            style={{
              background: "#f5f0fb",
              border: "1.5px solid #d4b8f0",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "24px",
              textAlign: "left",
            }}
          >
            {[
              ["Doctor", doctorName],
              [
                "Date",
                format(
                  new Date(selectedDate + "T00:00:00"),
                  "MMMM d, yyyy (EEEE)",
                ),
              ],
              [
                "Time",
                `${formatTimePH(selectedTime)} – ${formatTimePH(computedEndTime)}`,
              ],
              ["Mode", consultMode === "onsite" ? "🏥 On-Site" : "📷 Virtual"],
              ...(selectedService ? [["Service", selectedService]] : []),
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #ede8f5",
                  fontSize: "13px",
                  gap: "12px",
                }}
              >
                <span style={{ color: "#888", fontWeight: 600 }}>{label}</span>
                <span
                  style={{
                    color: "#2d1254",
                    fontWeight: 600,
                    textAlign: "right",
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/client/appointment/services")}
            style={{ ...s.continueBtn, width: "100%" }}
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        textarea:focus { border-color: #4D227C !important; box-shadow: 0 0 0 4px rgba(77,34,124,0.10); outline: none; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#f7f3fd",
          fontFamily: "Poppins,sans-serif",
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            background: "#4D227C",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <FaArrowLeft size={12} /> Go Back
          </button>
        </div>

        {/* ── Doctor header strip ── */}
        <div
          style={{
            background: "#fff",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
            borderBottom: "1px solid #f0eaf8",
            boxShadow: "0 1px 6px rgba(77,34,124,0.06)",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              background: "#4D227C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {doctor.profile_picture ? (
              <img
                src={doctor.profile_picture}
                alt={doctorName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span
                style={{ color: "#fff", fontWeight: "700", fontSize: "15px" }}
              >
                {initials}
              </span>
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: "#9c7dd4",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "2px",
              }}
            >
              ASSIGNED DOCTOR
            </div>
            <div
              style={{ fontSize: "16px", fontWeight: "700", color: "#2d1254" }}
            >
              {doctorName}
            </div>
            {doctor.title && (
              <div style={{ fontSize: "12px", color: "#7c3aed" }}>
                {doctor.title}
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "32px 20px 100px",
          }}
        >
          <StepIndicator current={step} />

          {/* ══════════ STEP 0 — SCHEDULE ══════════ */}
          {step === 0 && (
            <div style={{ animation: "fadeIn .3s ease" }}>
              {/* Service badge */}
              {selectedService && (
                <div
                  style={{
                    padding: "12px 18px",
                    background: "#f0e6ff",
                    border: "1.5px solid #d4b8f0",
                    borderRadius: "12px",
                    fontSize: "13px",
                    color: "#4D227C",
                    marginBottom: "28px",
                  }}
                >
                  <strong>Selected Service:</strong> {selectedService}
                </div>
              )}

              {/* Consultation mode */}
              <div style={s.block}>
                <label style={s.label}>* Consultation Mode</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  {[
                    ["onsite", "🏥 On-Site"],
                    ["virtual", "📷 Virtual"],
                  ].map(([val, lbl]) => (
                    <button
                      key={val}
                      onClick={() => setConsultMode(val)}
                      style={{
                        flex: 1,
                        padding: "12px 20px",
                        borderRadius: "12px",
                        border:
                          consultMode === val
                            ? "2px solid #4D227C"
                            : "2px solid #e8d8f8",
                        background: consultMode === val ? "#f5f0fb" : "#fff",
                        color: consultMode === val ? "#4D227C" : "#888",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all .2s",
                        fontFamily: "Poppins,sans-serif",
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              <div style={s.block}>
                <label style={s.label}>
                  * Select Date
                  {scheduleLoading && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "400",
                        color: "#aaa",
                        textTransform: "none",
                        marginLeft: "8px",
                      }}
                    >
                      Loading schedule…
                    </span>
                  )}
                </label>

                {scheduleLoading ? (
                  /* Skeleton */
                  <div
                    style={{
                      height: "340px",
                      borderRadius: "16px",
                      background: "#f0eaf8",
                      animation: "fadeIn 1s infinite alternate",
                    }}
                  />
                ) : schedule.length === 0 ? (
                  <div style={s.warn}>
                    ⚠ This doctor has no available schedule configured yet.
                  </div>
                ) : (
                  <Calendar
                    value={selectedDate}
                    onChange={handleDateChange}
                    schedule={schedule}
                    fullyBookedDates={fullyBookedDates}
                    loadingDates={loadingBookedDates}
                    onMonthChange={fetchMonthBookedSlots}
                  />
                )}
              </div>

              {/* Time picker */}
              <div style={s.block}>
                <label style={s.label}>
                  * Select Time
                  {selectedDate && scheduleForDate && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "400",
                        color: "#7c3aed",
                        textTransform: "none",
                        marginLeft: "8px",
                      }}
                    >
                      Schedule: {formatTimePH(scheduleForDate.start_time)} –{" "}
                      {formatTimePH(scheduleForDate.end_time)}
                    </span>
                  )}
                </label>

                {!selectedDate ? (
                  <div
                    style={{
                      ...s.warn,
                      background: "#faf7ff",
                      border: "1.5px dashed #d4b8f0",
                      color: "#aaa",
                      textAlign: "center",
                    }}
                  >
                    📅 Please select a date first
                  </div>
                ) : !scheduleForDate ? (
                  <div style={s.warn}>
                    ⚠ Doctor is not available on{" "}
                    {format(new Date(selectedDate + "T00:00:00"), "EEEE")}s.
                    Please choose a different date.
                  </div>
                ) : (
                  <TimePicker
                    value={selectedTime}
                    onChange={setSelectedTime}
                    schedule={schedule}
                    selectedDate={selectedDate}
                    bookedSlots={bookedSlots}
                    loadingSlots={bookedSlotsLoading}
                  />
                )}

                {/* Duration badge */}
                {selectedTime && (
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#059669",
                      fontWeight: "600",
                      padding: "8px 14px",
                      background: "#f0fdf4",
                      borderRadius: "9px",
                      border: "1px solid #a7f3d0",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    ⏱ Session: {formatTimePH(selectedTime)} –{" "}
                    {formatTimePH(computedEndTime)} (1 hour)
                  </div>
                )}
              </div>

              {/* Reason */}
              <div style={s.block}>
                <label style={s.label}>
                  Reason for Consultation{" "}
                  <span
                    style={{
                      color: "#bbb",
                      fontWeight: 400,
                      textTransform: "none",
                    }}
                  >
                    (optional)
                  </span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly describe your concern…"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    borderRadius: "12px",
                    border: "2px solid #e8d8f8",
                    fontSize: "14px",
                    color: "#333",
                    fontFamily: "Poppins,sans-serif",
                    resize: "vertical",
                    transition: "border .2s, box-shadow .2s",
                    background: "#fff",
                  }}
                />
              </div>

              {/* Summary card when ready */}
              {canContinue && (
                <div
                  style={{
                    padding: "20px",
                    background: "#f5f0fb",
                    border: "1.5px solid #d4b8f0",
                    borderRadius: "14px",
                    animation: "fadeIn .3s ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#4D227C",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "14px",
                    }}
                  >
                    📋 Appointment Summary
                  </div>
                  {[
                    ["Doctor", doctorName],
                    [
                      "Date",
                      format(
                        new Date(selectedDate + "T00:00:00"),
                        "MMMM d, yyyy (EEEE)",
                      ),
                    ],
                    [
                      "Time",
                      `${formatTimePH(selectedTime)} – ${formatTimePH(computedEndTime)}`,
                    ],
                    [
                      "Mode",
                      consultMode === "onsite" ? "🏥 On-Site" : "📷 Virtual",
                    ],
                    ...(selectedService ? [["Service", selectedService]] : []),
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "7px 0",
                        borderBottom: "1px solid #ede8f5",
                        fontSize: "13px",
                        gap: "12px",
                      }}
                    >
                      <span style={{ color: "#888" }}>{label}</span>
                      <strong style={{ color: "#2d1254", textAlign: "right" }}>
                        {val}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════ STEP 1 — VERIFY ══════════ */}
          {step === 1 && (
            <div style={{ animation: "fadeIn .3s ease" }}>
              <div style={s.card}>
                <div style={s.cardTitle}>Verify Your Details</div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#888",
                    marginBottom: "20px",
                  }}
                >
                  Please review the appointment details below before confirming.
                </p>
                {[
                  ["Doctor", doctorName],
                  ["Service", selectedService || "—"],
                  [
                    "Date",
                    format(
                      new Date(selectedDate + "T00:00:00"),
                      "MMMM d, yyyy (EEEE)",
                    ),
                  ],
                  [
                    "Time",
                    `${formatTimePH(selectedTime)} – ${formatTimePH(computedEndTime)}`,
                  ],
                  [
                    "Mode",
                    consultMode === "onsite" ? "🏥 On-Site" : "📷 Virtual",
                  ],
                  ...(reason ? [["Reason", reason]] : []),
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "11px 0",
                      borderBottom: "1px solid #f0eaf8",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#aaa",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        flexShrink: 0,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#2d1254",
                        fontWeight: "600",
                        textAlign: "right",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ STEP 2 — CONFIRM ══════════ */}
          {step === 2 && (
            <div style={{ animation: "fadeIn .3s ease" }}>
              <div style={s.card}>
                <div style={s.cardTitle}>Confirm & Book</div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#888",
                    marginBottom: "20px",
                  }}
                >
                  Your appointment will be set to <strong>Pending</strong> until
                  confirmed by the clinic. Payment is collected on-site.
                </p>
                <div
                  style={{
                    padding: "16px 20px",
                    background: "#f0fdf4",
                    border: "1.5px solid #a7f3d0",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>🏥</span>
                  <div>
                    <div
                      style={{
                        fontWeight: "700",
                        color: "#059669",
                        fontSize: "13px",
                      }}
                    >
                      Payment at the Clinic
                    </div>
                    <div style={{ fontSize: "12px", color: "#065f46" }}>
                      Bring your reference number on the day of your
                      appointment.
                    </div>
                  </div>
                </div>
                {submitError && (
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "10px",
                      fontSize: "13px",
                      color: "#991b1b",
                      fontWeight: "600",
                      marginTop: "12px",
                    }}
                  >
                    ⚠ {submitError}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Footer navigation ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "32px",
              gap: "12px",
            }}
          >
            {step > 0 ? (
              <button
                style={s.prevBtn}
                onClick={() => {
                  setStep((s) => s - 1);
                  setSubmitError("");
                }}
              >
                <FaChevronLeft size={11} /> Back
              </button>
            ) : (
              <div /> /* spacer */
            )}

            {step < STEPS.length - 1 ? (
              <button
                style={{
                  ...s.continueBtn,
                  ...(!canContinue ? s.continueBtnOff : {}),
                }}
                disabled={!canContinue}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue <FaChevronRight size={11} />
              </button>
            ) : (
              <button
                style={{
                  ...s.continueBtn,
                  ...(submitting ? s.continueBtnOff : {}),
                }}
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Booking…" : "✓ Confirm Appointment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Shared style tokens ── */
const s = {
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.28)",
    borderRadius: "9px",
    color: "#fff",
    cursor: "pointer",
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "Poppins,sans-serif",
    transition: "background .15s",
  },
  block: { marginBottom: "28px" },
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: "700",
    color: "#4D227C",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  warn: {
    padding: "14px 18px",
    background: "#fff8f0",
    border: "1px solid #fed7aa",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#9a3412",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(77,34,124,0.08)",
    border: "1px solid #e8d8f8",
  },
  cardTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#2d1254",
    marginBottom: "6px",
  },
  prevBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    borderRadius: "12px",
    border: "2px solid #e8d8f8",
    background: "#fff",
    color: "#4D227C",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "Poppins,sans-serif",
    transition: "all .2s",
  },
  continueBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 36px",
    borderRadius: "12px",
    border: "none",
    background: "#4D227C",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "Poppins,sans-serif",
    transition: "background .2s",
    boxShadow: "0 4px 16px rgba(77,34,124,0.25)",
  },
  continueBtnOff: {
    background: "#c4a0d4",
    cursor: "not-allowed",
    boxShadow: "none",
  },
};

export default SetAppointmentForm;

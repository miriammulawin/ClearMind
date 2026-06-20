// AppointmentComponents/SelectDateandTime.jsx
// FIXED v3: Derives availableDayNums internally from doctorSchedule+consultationMode
// so it never depends on the parent passing correct day numbers.

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { TiWarningOutline } from "react-icons/ti";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import Holidays from "date-holidays";

// ─── Constants ────────────────────────────────────────────────────────────────
const APPOINTMENT_DURATION_MINS = 60;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── PH Holiday helper ────────────────────────────────────────────────────────
const hd = new Holidays("PH");
const getHolidayName = (year, month, day) => {
  const result = hd.isHoliday(new Date(year, month, day));
  return result ? result[0].name : null;
};

// ─── Time helpers ─────────────────────────────────────────────────────────────
const formatTimePH = (time24) => {
  if (!time24) return "";
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
};

export const getEndTime = (startTime) => {
  if (!startTime) return "";
  let mins;
  if (startTime.includes("AM") || startTime.includes("PM")) {
    const [time, period] = startTime.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    mins = h * 60 + m;
  } else {
    const [h, m] = startTime.split(":").map(Number);
    mins = h * 60 + m;
  }
  mins += APPOINTMENT_DURATION_MINS;
  const hours = Math.floor(mins / 60) % 24;
  const minutes = mins % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayH = hours % 12 || 12;
  const displayM = String(minutes).padStart(2, "0");
  return `${displayH}:${displayM} ${period}`;
};

// ─── isSlotBooked ─────────────────────────────────────────────────────────────
function isSlotBooked(slotTime24, bookedSlots) {
  if (!bookedSlots || bookedSlots.length === 0) return false;
  const [sh, sm] = slotTime24.split(":").map(Number);
  const slotStart = sh * 60 + sm;
  const slotEnd = slotStart + APPOINTMENT_DURATION_MINS;
  return bookedSlots.some((b) => {
    const [bsh, bsm] = b.start_time.split(":").map(Number);
    const [beh, bem] = b.end_time.split(":").map(Number);
    const bookedStart = bsh * 60 + bsm;
    const bookedEnd =
      beh * 60 + bem > bookedStart
        ? beh * 60 + bem
        : bookedStart + APPOINTMENT_DURATION_MINS;
    return slotStart < bookedEnd && slotEnd > bookedStart;
  });
}

// ─── Build time slots ─────────────────────────────────────────────────────────
function buildSlots(schedEntry) {
  if (!schedEntry) return [];
  const startH = parseInt(schedEntry.start_time.split(":")[0]);
  const startM = parseInt(schedEntry.start_time.split(":")[1]);
  const endH = parseInt(schedEntry.end_time.split(":")[0]);
  const endM = parseInt(schedEntry.end_time.split(":")[1]);
  const schedEndMins = endH * 60 + endM;
  const slots = [];
  for (let h = startH; h <= endH; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === startH && m < startM) continue;
      const slotStart = h * 60 + m;
      const slotEnd = slotStart + APPOINTMENT_DURATION_MINS;
      if (slotEnd > schedEndMins) continue;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

// ─── Normalize day_of_week → JS getDay() number (0=Sun … 6=Sat) ──────────────
// Handles: number 0-6, "Monday", "monday", "Mon", "mon", "1" (string number)
const DAY_NAME_TO_NUM = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

function normalizeDayOfWeek(raw) {
  if (raw === null || raw === undefined) return null;
  // Already a number
  if (typeof raw === "number") return raw;
  // String number e.g. "1", "0"
  const asNum = Number(raw);
  if (!isNaN(asNum) && String(raw).trim() !== "") return asNum;
  // String name e.g. "Monday", "Mon"
  const key = String(raw).toLowerCase().trim();
  return DAY_NAME_TO_NUM[key] ?? null;
}

// ─── scheduleSupportsMode ─────────────────────────────────────────────────────
// slot_type values: "physical", "online", "both"
// consultationMode values: "ON-SITE", "VIRTUAL"
function scheduleSupportsMode(entry, consultationMode) {
  if (!entry || !consultationMode) return false;
  const t = (entry.slot_type || "").toLowerCase().trim();
  if (t === "both") return true;
  if (
    consultationMode === "ON-SITE" &&
    (t === "physical" || t === "onsite" || t === "on-site")
  )
    return true;
  if (consultationMode === "VIRTUAL" && (t === "online" || t === "virtual"))
    return true;
  return false;
}

// ─── Toast keyframes ──────────────────────────────────────────────────────────
const ensureKeyframes = () => {
  if (document.getElementById("same-day-toast-kf")) return;
  const s = document.createElement("style");
  s.id = "same-day-toast-kf";
  s.textContent = `
    @keyframes sdToastIn { from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)} }
    @keyframes sdToastBar { from{width:100%}to{width:0%} }
  `;
  document.head.appendChild(s);
};

// ─── SameDayToast ─────────────────────────────────────────────────────────────
export const SameDayToast = ({ show, onClose }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;
  ensureKeyframes();

  return createPortal(
    <div
      style={{
        position: "fixed",
        bottom: "90px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(92vw,380px)",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        background: "#ffffff",
        borderRadius: "12px",
        borderLeft: "5px solid #e83434",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        padding: "14px 14px 20px",
        zIndex: 99999,
        overflow: "hidden",
        animation: "sdToastIn 0.25s ease",
      }}
    >
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "#ffe8e8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <TiWarningOutline style={{ fontSize: "17px", color: "#ba4242" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: "0 0 2px",
            fontSize: "13px",
            fontWeight: 700,
            color: "#ba4242",
          }}
        >
          Same-Day Booking Not Allowed
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "#ba4242" }}>
          Please select a <strong>future date</strong> to proceed.
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          fontSize: "14px",
          color: "#ba4242",
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
      <div
        key={String(show)}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: "3px",
          background: "#e83434",
          borderRadius: "0 0 0 12px",
          animation: "sdToastBar 4s linear forwards",
        }}
      />
    </div>,
    document.body,
  );
};

// ─── Calendar ─────────────────────────────────────────────────────────────────
const Calendar = ({
  doctorSchedule = [],
  consultationMode = null,
  fullyBookedDates = new Set(),
  onMonthChange,
  selectedDateStr = null,
  onSelectDate,
  onTodayClick,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const prevMonth = () => {
    if (!canGoPrev) return;
    const [nm, ny] =
      viewMonth === 0 ? [11, viewYear - 1] : [viewMonth - 1, viewYear];
    setViewMonth(nm);
    setViewYear(ny);
    onMonthChange?.({ year: ny, month: nm });
  };
  const nextMonth = () => {
    const [nm, ny] =
      viewMonth === 11 ? [0, viewYear + 1] : [viewMonth + 1, viewYear];
    setViewMonth(nm);
    setViewYear(ny);
    onMonthChange?.({ year: ny, month: nm });
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  const toIso = (day) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();
  const isPast = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };
  const isSelected = (day) => toIso(day) === selectedDateStr;
  const isFullyBooked = (day) => fullyBookedDates.has(toIso(day));

  // ── KEY: derive valid days entirely from doctorSchedule + consultationMode ──
  // No dependency on availableDayNums from parent at all.
  const isDayValidForMode = (day) => {
    if (!consultationMode || !doctorSchedule.length) return false;
    const jsDay = new Date(viewYear, viewMonth, day).getDay(); // 0=Sun…6=Sat
    const matches = doctorSchedule.filter(
      (s) => normalizeDayOfWeek(s.day_num ?? s.day_of_week) === jsDay,
    );
    return matches.some((s) => scheduleSupportsMode(s, consultationMode));
  };

  // Days to show in the "Available:" badge strip
  const modeValidDayNums = useMemo(() => {
    if (!consultationMode || !doctorSchedule.length) return [];
    const days = new Set();
    doctorSchedule.forEach((s) => {
      if (scheduleSupportsMode(s, consultationMode)) {
        const n = normalizeDayOfWeek(s.day_num ?? s.day_of_week);
        if (n !== null) days.add(n);
      }
    });
    return [...days].sort();
  }, [doctorSchedule, consultationMode]);

  const handleClick = (day) => {
    if (isToday(day)) {
      onTodayClick();
      return;
    }
    if (isPast(day)) return;
    if (getHolidayName(viewYear, viewMonth, day)) return;
    if (!isDayValidForMode(day)) return;
    if (isFullyBooked(day)) return;
    onSelectDate(toIso(day));
  };

  const modeLabel =
    consultationMode === "VIRTUAL"
      ? "Virtual"
      : consultationMode === "ON-SITE"
        ? "On-Site"
        : null;

  // Debug — remove after confirming it works
  useEffect(() => {
    if (doctorSchedule.length) {
      console.log("[Calendar] doctorSchedule sample:", doctorSchedule[0]);
      console.log("[Calendar] consultationMode:", consultationMode);
      console.log("[Calendar] modeValidDayNums:", modeValidDayNums);
    }
  }, [doctorSchedule, consultationMode]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "14px",
        border: "1px solid #e2d5f5",
        boxShadow: "0 4px 16px rgba(77,34,124,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Mode filter notice */}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px 10px",
          borderBottom: "1px solid #f0eaf8",
        }}
      >
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          style={{
            background: "none",
            border: "1px solid #e2d5f5",
            borderRadius: "7px",
            cursor: canGoPrev ? "pointer" : "default",
            padding: "6px 8px",
            color: "#4D227C",
            display: "flex",
            alignItems: "center",
            opacity: canGoPrev ? 1 : 0.3,
          }}
        >
          <IoChevronBack size={14} />
        </button>
        <span
          style={{
            fontWeight: 700,
            fontSize: "14px",
            color: "#2d1254",
            fontFamily: "Poppins,sans-serif",
          }}
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: "none",
            border: "1px solid #e2d5f5",
            borderRadius: "7px",
            cursor: "pointer",
            padding: "6px 8px",
            color: "#4D227C",
            display: "flex",
            alignItems: "center",
          }}
        >
          <IoChevronForward size={14} />
        </button>
      </div>

      {/* Available days badge strip */}
      {modeValidDayNums.length > 0 && (
        <div
          style={{
            padding: "8px 14px",
            background: "#f0f9fd",
            borderBottom: "1px solid #d1fae5",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "10px", color: "#056696", fontWeight: 700 }}>
            Available:
          </span>
          {modeValidDayNums.map((n) => (
            <span
              key={n}
              style={{
                fontSize: "10px",
                background: "#4D227C",
                color: "#fff",
                padding: "2px 7px",
                borderRadius: "20px",
                fontWeight: 600,
              }}
            >
              {DAY_ABBR[n]}
            </span>
          ))}
        </div>
      )}

      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          padding: "10px 12px 4px",
        }}
      >
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: "11px",
              fontWeight: 700,
              color: "#9c7dd4",
              padding: "4px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          padding: "0 12px 12px",
          gap: "2px",
        }}
      >
        {calendarDays.map((day, i) => {
          if (!day) return <div key={`e-${i}`} style={{ height: "36px" }} />;

          const past = isPast(day);
          const todayCell = isToday(day);
          const validMode = !past && !todayCell && isDayValidForMode(day);
          const fullyBooked = validMode && isFullyBooked(day);
          const selected = isSelected(day);
          const holiday =
            !past && !todayCell
              ? getHolidayName(viewYear, viewMonth, day)
              : null;

          let bg = "transparent",
            color = "#d1d5db",
            border = "1.5px solid transparent",
            cursor = "default",
            opacity = 1,
            dotColor = null;

          if (selected) {
            bg = "#4D227C";
            color = "#fff";
            cursor = "pointer";
          } else if (todayCell) {
            bg = "#f3ecfc";
            color = "#4D227C";
            border = "1.5px solid #d4b8f0";
            cursor = "pointer";
          } else if (holiday) {
            color = "#f87171";
            cursor = "not-allowed";
          } else if (past) {
            color = "#d1d5db";
          } else if (fullyBooked) {
            color = "#9ca3af";
            cursor = "not-allowed";
            dotColor = "#ef4444";
          } else if (validMode) {
            color = "#374151";
            cursor = "pointer";
            dotColor = "#056696";
          } else {
            color = "#d1d5db";
            opacity = 0.35;
            cursor = "not-allowed";
          }

          return (
            <div
              key={i}
              title={
                holiday
                  ? `Holiday: ${holiday}`
                  : fullyBooked
                    ? "Fully booked"
                    : !validMode && !past && !todayCell
                      ? `Not available for ${modeLabel}`
                      : undefined
              }
              onClick={() => handleClick(day)}
              style={{
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: selected ? 700 : 400,
                cursor,
                color,
                background: bg,
                border,
                opacity,
                transition: "background .12s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (validMode && !selected && !fullyBooked)
                  e.currentTarget.style.background = "#f5f0fb";
              }}
              onMouseLeave={(e) => {
                if (!selected)
                  e.currentTarget.style.background = todayCell
                    ? "#f3ecfc"
                    : "transparent";
              }}
            >
              {day}
              {dotColor && !selected && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "3px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: dotColor,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "8px 14px",
          borderTop: "1px solid #f0eaf8",
          fontSize: "10px",
          color: "#bbb",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#056696",
              display: "inline-block",
            }}
          />
          Available
        </span>
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
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
          Fully booked
        </span>
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "4px",
              background: "#4D227C",
              display: "inline-block",
            }}
          />
          Selected
        </span>
      </div>
    </div>
  );
};

// ─── TimeDropdown ─────────────────────────────────────────────────────────────
const TimeDropdown = ({
  scheduleForDate = null,
  bookedSlots = [],
  loadingSlots = false,
  selectedTime = null,
  onSelectTime,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const allSlots = useMemo(
    () => buildSlots(scheduleForDate),
    [scheduleForDate],
  );
  const availableSlots = useMemo(
    () => allSlots.filter((t) => !isSlotBooked(t, bookedSlots)),
    [allSlots, bookedSlots],
  );
  const displayLabel = selectedTime
    ? `${formatTimePH(selectedTime)} – ${getEndTime(selectedTime)}`
    : "Select a time slot";
  const canOpen = !disabled && !loadingSlots && scheduleForDate;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => {
          if (canOpen) setOpen((o) => !o);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 13px",
          borderRadius: "9px",
          border: open
            ? "1.5px solid #4D227C"
            : selectedTime
              ? "1.5px solid #d4b8f0"
              : "1.5px solid #e2d5f5",
          background: disabled ? "#f9f7fd" : selectedTime ? "#faf7ff" : "#fff",
          cursor: canOpen ? "pointer" : "not-allowed",
          transition: "all .2s",
          boxShadow: open ? "0 0 0 3px rgba(77,34,124,0.1)" : "none",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {loadingSlots ? (
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              border: "2px solid #4D227C",
              borderTop: "2px solid transparent",
              animation: "pac_spin 0.8s linear infinite",
              flexShrink: 0,
            }}
          />
        ) : (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke={selectedTime ? "#4D227C" : "#aaa"}
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )}
        <span
          style={{
            fontSize: "13px",
            flex: 1,
            color: loadingSlots ? "#aaa" : selectedTime ? "#2d1254" : "#aaa",
            fontWeight: selectedTime ? 600 : 400,
          }}
        >
          {loadingSlots
            ? "Loading slots…"
            : !scheduleForDate && !disabled
              ? "Select a date first"
              : displayLabel}
        </span>
        {canOpen && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4D227C"
            strokeWidth="2"
            style={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform .2s",
              flexShrink: 0,
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </div>

      {scheduleForDate && !loadingSlots && (
        <div
          style={{
            fontSize: "11px",
            color: "#4D227C",
            marginTop: "5px",
            fontWeight: 600,
          }}
        >
          Doctor's schedule: {formatTimePH(scheduleForDate.start_time)} –{" "}
          {formatTimePH(scheduleForDate.end_time)}
        </div>
      )}

      {open && canOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 99999,
            background: "#fff",
            border: "1px solid #e0d4f5",
            borderRadius: "12px",
            boxShadow: "0 12px 32px rgba(77,34,124,.16)",
            overflow: "hidden",
            minWidth: "220px",
          }}
        >
          <div
            style={{
              padding: "8px 12px",
              background: "#f5f0fb",
              borderBottom: "1px solid #e9d8fd",
              fontSize: "10px",
              color: "#4D227C",
              fontWeight: 700,
            }}
          >
            Schedule: {formatTimePH(scheduleForDate.start_time)} –{" "}
            {formatTimePH(scheduleForDate.end_time)}
          </div>
          <div style={{ maxHeight: "240px", overflowY: "auto" }}>
            {availableSlots.length === 0 ? (
              <div
                style={{
                  padding: "18px 14px",
                  color: "#9a3412",
                  fontSize: "12px",
                  textAlign: "center",
                  background: "#fff8f0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "20px" }}>📅</span>
                <span style={{ fontWeight: 600 }}>No available slots</span>
                <span style={{ color: "#aaa", fontSize: "11px" }}>
                  All time slots are booked for this date
                </span>
              </div>
            ) : (
              availableSlots.map((t) => {
                const isSel = selectedTime === t;
                return (
                  <div
                    key={t}
                    onClick={() => {
                      onSelectTime(t);
                      setOpen(false);
                    }}
                    style={{
                      padding: "9px 14px",
                      fontSize: "13px",
                      cursor: "pointer",
                      color: isSel ? "#fff" : "#374151",
                      fontWeight: isSel ? 700 : 400,
                      background: isSel ? "#4D227C" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background .12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSel) e.currentTarget.style.background = "#f5f0fb";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSel)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isSel ? "#c4a8e8" : "#aaa"}
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {formatTimePH(t)} – {getEndTime(t)}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes pac_spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── SelectDateandTime — main export ─────────────────────────────────────────
const SelectDateandTime = ({
  availableDayNums = [], // kept for backward-compat but no longer used for gating
  doctorSchedule = [], // full schedule array from API ← used for all filtering
  consultationMode = null, // "ON-SITE" | "VIRTUAL"
  scheduleForDate = null,
  bookedSlots = [],
  bookedSlotsLoading = false,
  fullyBookedDates = new Set(),
  loadingBookedDates = false,
  onMonthChange,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  onSameDayClick,
}) => {
  const handleSelectDate = (isoStr) => {
    setSelectedDate(isoStr);
    setSelectedTime(null);
  };
  const handleTodayClick = () => {
    onSameDayClick?.();
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const selectedDateStr =
    typeof selectedDate === "string"
      ? selectedDate
      : selectedDate?.isoDate || selectedDate?.date || null;

  // Check if there are ANY valid days for the selected mode
  const hasAnyValidDays = useMemo(() => {
    if (!consultationMode || !doctorSchedule.length) return false;
    return doctorSchedule.some((s) =>
      scheduleSupportsMode(s, consultationMode),
    );
  }, [doctorSchedule, consultationMode]);

  return (
    <>
      {/* ── Date Section ── */}
      <div style={{ marginBottom: "20px" }}>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#2d1254",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span style={{ color: "#e53e3e" }}>*</span> Select Date
        </p>

        {!hasAnyValidDays ? (
          <div
            style={{
              padding: "16px",
              background: "#fff8f0",
              border: "1px solid #fed7aa",
              borderRadius: "10px",
              fontSize: "13px",
              color: "#9a3412",
            }}
          >
            ⚠ No schedule available for this mode. Please go back and select a
            different option.
          </div>
        ) : (
          <Calendar
            doctorSchedule={doctorSchedule}
            consultationMode={consultationMode}
            fullyBookedDates={fullyBookedDates}
            loadingBookedDates={loadingBookedDates}
            onMonthChange={onMonthChange}
            selectedDateStr={selectedDateStr}
            onSelectDate={handleSelectDate}
            onTodayClick={handleTodayClick}
          />
        )}
      </div>

      {/* ── Time Section ── */}
      {selectedDateStr && (
        <div style={{ marginBottom: "20px" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#2d1254",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ color: "#e53e3e" }}>*</span> Select Time
            <span
              style={{
                fontSize: "11px",
                color: "#888",
                fontWeight: 400,
                marginLeft: "4px",
              }}
            >
              · 1 hour session
            </span>
          </p>

          {!scheduleForDate ? (
            <div
              style={{
                padding: "12px 14px",
                background: "#fff8f0",
                border: "1px solid #fed7aa",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#9a3412",
              }}
            >
              ⚠ The doctor is not available on this day. Please select a
              different date.
            </div>
          ) : (
            <TimeDropdown
              scheduleForDate={scheduleForDate}
              bookedSlots={bookedSlots}
              loadingSlots={bookedSlotsLoading}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
            />
          )}

          {selectedTime && scheduleForDate && (
            <p
              style={{
                marginTop: "8px",
                fontSize: "12px",
                color: "#4D227C",
                fontWeight: 600,
              }}
            >
              Session:{" "}
              <strong>
                {formatTimePH(selectedTime)} – {getEndTime(selectedTime)}
              </strong>
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default SelectDateandTime;

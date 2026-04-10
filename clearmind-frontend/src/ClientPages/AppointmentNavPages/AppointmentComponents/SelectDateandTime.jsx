// AppointmentComponents/SelectDateandTime.jsx
import React, { useMemo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { IoMdArrowDropdown } from "react-icons/io";
import { TiWarningOutline } from "react-icons/ti";
import Holidays from "date-holidays";
import styles from "./styles/SelectDateAndTime.module.css";

// ─── Holiday Helper ───────────────────────────────────────────────────────────
const hd = new Holidays("PH");

const getHolidayName = (year, month, day) => {
  const result = hd.isHoliday(new Date(year, month, day));
  return result ? result[0].name : null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export const getEndTime = (startTime) => {
  if (!startTime) return "";
  const mins = timeToMinutes(startTime) + 60;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMins = minutes === 0 ? "00" : String(minutes).padStart(2, "0");
  return `${displayHours}:${displayMins} ${period}`;
};

const getBookableSlots = (slots = []) =>
  slots.map((slot, index) => {
    if (index === slots.length - 1) return { ...slot, bookable: false };
    const next = slots[index + 1];
    return { ...slot, bookable: slot.available && !!next && next.available };
  });

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

// ─── Inject keyframes once ────────────────────────────────────────────────────
const ensureKeyframes = () => {
  if (document.getElementById("same-day-toast-kf")) return;
  const s = document.createElement("style");
  s.id = "same-day-toast-kf";
  s.textContent = `
    @keyframes sdToastIn {
      from { opacity:0; transform:translateX(-50%) translateY(10px); }
      to   { opacity:1; transform:translateX(-50%) translateY(0);    }
    }
    @keyframes sdToastBar {
      from { width:100%; }
      to   { width:0%;   }
    }
  `;
  document.head.appendChild(s);
};

// ─── Same-Day Toast ───────────────────────────────────────────────────────────
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
        width: "min(92vw, 380px)",
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
            lineHeight: 1.3,
          }}
        >
          Same-Day Booking Not Allowed
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            color: "#ba4242",
            lineHeight: 1.5,
          }}
        >
          Please select a <strong>future date</strong> to proceed.
        </p>
      </div>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          fontSize: "14px",
          color: "#ba4242",
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
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
  availability,
  selectedDate,
  onSelectDate,
  onTodayClick,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const availableMap = useMemo(() => {
    const map = {};
    (availability || []).forEach((d) => {
      map[d.date] = d;
    });
    return map;
  }, [availability]);

  const availableDateSet = useMemo(
    () => new Set(Object.keys(availableMap)),
    [availableMap],
  );

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  const getDateString = (day) =>
    new Date(viewYear, viewMonth, day).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const isStrictPast = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isAvailable = (day) => availableDateSet.has(getDateString(day));
  const isSelected = (day) => selectedDate?.date === getDateString(day);

  const handleDayClick = (day) => {
    if (isToday(day)) {
      onTodayClick();
      return;
    }
    if (isStrictPast(day)) return;
    if (!isAvailable(day)) return;
    onSelectDate(availableMap[getDateString(day)]);
  };

  return (
    <div className={styles.calCard}>
      <div className={styles.calHeader}>
        <button
          className={styles.calArrowBtn}
          onClick={prevMonth}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          <IoChevronBack size={11} />
        </button>
        <span className={styles.calMonthTitle}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          className={styles.calArrowBtn}
          onClick={nextMonth}
          aria-label="Next month"
        >
          <IoChevronForward size={11} />
        </button>
      </div>

      <div className={styles.calBody}>
        {DAY_LABELS.map((d) => (
          <div key={d} className={styles.calDayName}>
            {d}
          </div>
        ))}

        {calendarDays.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className={styles.calEmpty} />;

          const strictPast = isStrictPast(day);
          const todayCell = isToday(day);
          const available = isAvailable(day);
          const selected = isSelected(day);

          const isFutureNonAvailable = !strictPast && !todayCell && !available;
          const holidayName = isFutureNonAvailable
            ? getHolidayName(viewYear, viewMonth, day)
            : null;

          // ── KEY FIX ──────────────────────────────────────────────────────────
          // Today must NOT be disabled — we need onClick to fire so the toast
          // can show. Past days and holidays are truly disabled (no interaction).
          // Today is visually styled as unselectable via calCellToday but still
          // clickable so onTodayClick() → onSameDayClick?.() → parent shows toast.
          const disabled =
            strictPast || !!holidayName || (!available && !todayCell);

          let cellCls = styles.calCell;
          if (selected) cellCls += ` ${styles.calCellSelected}`;
          else if (todayCell) cellCls += ` ${styles.calCellToday}`;
          else if (holidayName) cellCls += ` ${styles.calCellHoliday}`;
          else if (available && !strictPast)
            cellCls += ` ${styles.calCellAvail}`;
          else cellCls += ` ${styles.calCellDisabled}`;

          return (
            <button
              key={day}
              type="button"
              className={cellCls}
              disabled={disabled}
              onClick={() => handleDayClick(day)}
              title={holidayName ?? undefined}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Time Dropdown ────────────────────────────────────────────────────────────
const TimeDropdown = ({ bookableSlots, selectedTime, onSelectTime }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = selectedTime
    ? `${selectedTime} – ${getEndTime(selectedTime)}`
    : "Select a time slot";

  return (
    <div className={styles.timeDropdownWrapper} ref={ref}>
      <button
        type="button"
        className={[
          styles.timeDropdownTrigger,
          selectedTime ? styles.timeDropdownTriggerSelected : "",
          open ? styles.timeDropdownTriggerOpen : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={
            selectedTime
              ? styles.timeDropdownValue
              : styles.timeDropdownPlaceholder
          }
        >
          {displayLabel}
        </span>
        <IoMdArrowDropdown
          className={[
            styles.timeDropdownIcon,
            open ? styles.timeDropdownIconOpen : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>

      {open && (
        <ul className={styles.timeDropdownList}>
          {bookableSlots.length === 0 ? (
            <li className={styles.timeDropdownEmpty}>
              No available slots for this date.
            </li>
          ) : (
            bookableSlots.map((slot, i) => (
              <li
                key={i}
                className={[
                  styles.timeDropdownItem,
                  selectedTime === slot.time
                    ? styles.timeDropdownItemSelected
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  onSelectTime(slot.time);
                  setOpen(false);
                }}
              >
                {slot.time} – {getEndTime(slot.time)}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

// ─── SelectDateandTime (main export) ──────────────────────────────────────────
const SelectDateandTime = ({
  doctorData,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  hideSectionTitle = false,
  onSameDayClick,
}) => {
  const handleSelectDate = (dateSlot) => {
    setSelectedDate(dateSlot);
    setSelectedTime(null);
  };

  const handleTodayClick = () => {
    onSameDayClick?.();
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const bookableSlots = useMemo(() => {
    const slots = selectedDate?.slots;
    if (!slots || !Array.isArray(slots) || slots.length === 0) return [];
    return getBookableSlots(slots).filter((s) => s.bookable);
  }, [selectedDate]);

  const noSlotsWarning =
    selectedDate &&
    Array.isArray(selectedDate?.slots) &&
    selectedDate.slots.length > 0 &&
    bookableSlots.length === 0;

  if (!doctorData) return null;

  return (
    <>
      <div className={styles.section}>
        {!hideSectionTitle && (
          <p className={styles.sectionTitle}>
            <span className={styles.required}>*</span> Select Date
          </p>
        )}

        <Calendar
          availability={doctorData.availability}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onTodayClick={handleTodayClick}
        />

        {noSlotsWarning && (
          <p className={styles.fieldWarning}>
            ⚠️ No available 1-hour slots on this date. Please choose a different
            day.
          </p>
        )}
      </div>

      {selectedDate && !noSlotsWarning && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>
            <span className={styles.required}>*</span> Select Time
            <span className={styles.sessionNote}> · 1 hour session</span>
          </p>

          <TimeDropdown
            bookableSlots={bookableSlots}
            selectedTime={selectedTime}
            onSelectTime={setSelectedTime}
          />

          {selectedTime && (
            <p className={styles.selectedTimeRange}>
              Session:{" "}
              <strong>
                {selectedTime} – {getEndTime(selectedTime)}
              </strong>
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default SelectDateandTime;

// AppointmentComponents/SelectDateandTime.jsx
//
// Self-contained Date + Time picker.
// Used in both ScheduleForm (PAC) and PAaEChooseRPm.
//
// Props:
//   doctorData       — doctor object from MOCK_DOCTORS (needs .availability)
//   selectedDate     — full dateSlot { date, day, slots } or null
//   setSelectedDate  — setter — receives full dateSlot object
//   selectedTime     — string or null  e.g. "4:00 PM"
//   setSelectedTime  — setter
//   hideSectionTitle — bool (default false) — hides "Select Date" / "Select Time"
//                      labels when the parent already provides its own header

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { IoMdArrowDropdown } from 'react-icons/io';
import { TiWarningOutline } from 'react-icons/ti';
import styles from './styles/SelectDateAndTime.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export const getEndTime = (startTime) => {
  if (!startTime) return '';
  const mins         = timeToMinutes(startTime) + 60;
  const hours        = Math.floor(mins / 60);
  const minutes      = mins % 60;
  const period       = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMins  = minutes === 0 ? '00' : String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMins} ${period}`;
};

// Returns slots that can start a 1-hour booking (current + next both available)
const getBookableSlots = (slots = []) =>
  slots.map((slot, index) => {
    if (index === slots.length - 1) return { ...slot, bookable: false };
    const next = slots[index + 1];
    return { ...slot, bookable: slot.available && !!next && next.available };
  });

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_LABELS = ['SU','MO','TU','WE','TH','FR','SA'];

// ─── Same-Day Toast ────────────────────────────────────────────────────────────
const SameDayToast = ({ show, onClose }) => {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={styles.toast}>
      <div className={styles.toastIconWrap}>
        <TiWarningOutline className={styles.toastIcon} />
      </div>
      <div className={styles.toastContent}>
        <p className={styles.toastTitle}>Same-Day Booking Not Allowed</p>
        <p className={styles.toastDesc}>
          Please select a <strong>future date</strong> to proceed.
        </p>
      </div>
      <button className={styles.toastClose} onClick={onClose} aria-label="Dismiss">✕</button>
      <div className={styles.toastProgress} key={String(show)} />
    </div>
  );
};

// ─── Calendar ─────────────────────────────────────────────────────────────────
// Passes full dateSlot object { date, day, slots } up via onSelectDate
const Calendar = ({ availability, selectedDate, onSelectDate, onTodayClick }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Map of "March 19, 2026" → full dateSlot object
  const availableMap = useMemo(() => {
    const map = {};
    (availability || []).forEach(d => { map[d.date] = d; });
    return map;
  }, [availability]);

  const availableDateSet = useMemo(
    () => new Set(Object.keys(availableMap)),
    [availableMap]
  );

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const calendarDays = useMemo(() => {
    const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells       = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  // Returns "March 19, 2026" format — must match availability[].date exactly
  const getDateString = (day) =>
    new Date(viewYear, viewMonth, day)
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear  === today.getFullYear();

  const isStrictPast = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isAvailable = (day) => availableDateSet.has(getDateString(day));

  // Compare against selectedDate.date string (not raw Date)
  const isSelected = (day) => selectedDate?.date === getDateString(day);

  const handleDayClick = (day) => {
    if (isToday(day))                           { onTodayClick(); return; }
    if (isStrictPast(day) || !isAvailable(day)) return;
    // Pass full dateSlot object up — TimeDropdown needs .slots
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
        {DAY_LABELS.map(d => (
          <div key={d} className={styles.calDayName}>{d}</div>
        ))}

        {calendarDays.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className={styles.calEmpty} />;

          const strictPast = isStrictPast(day);
          const todayCell  = isToday(day);
          const available  = isAvailable(day);
          const selected   = isSelected(day);
          const disabled   = strictPast || (!todayCell && !available);

          let cellCls = styles.calCell;
          if (selected)                      cellCls += ` ${styles.calCellSelected}`;
          else if (todayCell)                cellCls += ` ${styles.calCellToday}`;
          else if (available && !strictPast) cellCls += ` ${styles.calCellAvail}`;
          else                               cellCls += ` ${styles.calCellDisabled}`;

          return (
            <button
              key={day}
              type="button"
              className={cellCls}
              disabled={disabled}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Time Dropdown ─────────────────────────────────────────────────────────────
const TimeDropdown = ({ bookableSlots, selectedTime, onSelectTime }) => {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayLabel = selectedTime
    ? `${selectedTime} – ${getEndTime(selectedTime)}`
    : 'Select a time slot';

  return (
    <div className={styles.timeDropdownWrapper} ref={ref}>
      <button
        type="button"
        className={[
          styles.timeDropdownTrigger,
          selectedTime ? styles.timeDropdownTriggerSelected : '',
          open         ? styles.timeDropdownTriggerOpen     : '',
        ].filter(Boolean).join(' ')}
        onClick={() => setOpen(o => !o)}
      >
        <span className={selectedTime ? styles.timeDropdownValue : styles.timeDropdownPlaceholder}>
          {displayLabel}
        </span>
        <IoMdArrowDropdown
          className={[
            styles.timeDropdownIcon,
            open ? styles.timeDropdownIconOpen : '',
          ].filter(Boolean).join(' ')}
        />
      </button>

      {open && (
        <ul className={styles.timeDropdownList}>
          {bookableSlots.length === 0 ? (
            <li className={styles.timeDropdownEmpty}>No available slots for this date.</li>
          ) : (
            bookableSlots.map((slot, i) => (
              <li
                key={i}
                className={[
                  styles.timeDropdownItem,
                  selectedTime === slot.time ? styles.timeDropdownItemSelected : '',
                ].filter(Boolean).join(' ')}
                onClick={() => { onSelectTime(slot.time); setOpen(false); }}
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
  hideSectionTitle = false,  // ← set true when parent already has its own header
}) => {
  const [sameDayToast, setSameDayToast] = useState(false);

  const handleSelectDate = (dateSlot) => {
    setSelectedDate(dateSlot);  // dateSlot = { date, day, slots }
    setSelectedTime(null);      // reset time when date changes
  };

  const handleTodayClick = () => {
    setSameDayToast(true);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Build bookable slots from the selected dateSlot's slots array
  const bookableSlots = useMemo(() => {
    const slots = selectedDate?.slots;
    if (!slots || !Array.isArray(slots) || slots.length === 0) return [];
    return getBookableSlots(slots).filter(s => s.bookable);
  }, [selectedDate]);

  // Only warn if we have a date + confirmed slots array exists but all are taken
  const noSlotsWarning =
    selectedDate &&
    Array.isArray(selectedDate?.slots) &&
    selectedDate.slots.length > 0 &&
    bookableSlots.length === 0;

  if (!doctorData) return null;

  return (
    <>
      {/* ── Same-Day Toast ── */}
      <SameDayToast show={sameDayToast} onClose={() => setSameDayToast(false)} />

      {/* ── Select Date ── */}
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
            ⚠️ No available 1-hour slots on this date. Please choose a different day.
          </p>
        )}
      </div>

      {/* ── Select Time — only after a valid date with slots ── */}
      {selectedDate && !noSlotsWarning && (
        <div className={styles.section}>
          {/* Time label always shows — even when hideSectionTitle is true */}
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
              Session: <strong>{selectedTime} – {getEndTime(selectedTime)}</strong>
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default SelectDateandTime;
import React, { useMemo, useEffect, useState } from 'react';
import { FaVideo, FaHome } from 'react-icons/fa';
import { IoMdArrowDropdown } from 'react-icons/io';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { TiWarningOutline } from 'react-icons/ti';
import styles from '../../../ClientStyle/ScheduleForm.module.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const getEndTime = (startTime) => {
  if (!startTime) return '';
  const mins = timeToMinutes(startTime) + 60;
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const displayMins = minutes === 0 ? '00' : String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMins} ${period}`;
};

const getBookableSlots = (slots) => {
  return slots.map((slot, index) => {
    const isLastSlot = index === slots.length - 1;
    if (isLastSlot) return { ...slot, bookable: false };
    const nextSlot = slots[index + 1];
    const bookable = slot.available && !!nextSlot && nextSlot.available;
    return { ...slot, bookable };
  });
};

const getDayMode = (dateSlot, doctorData) => {
  if (!dateSlot || !doctorData) return null;
  const day = dateSlot.day;
  const onSiteDays  = doctorData.onSiteDays  || [];
  const virtualDays = doctorData.virtualDays || [];
  if (onSiteDays.includes(day)  && !virtualDays.includes(day)) return 'ON-SITE';
  if (virtualDays.includes(day) && !onSiteDays.includes(day))  return 'VIRTUAL';
  return null;
};

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ─── Calendar ─────────────────────────────────────────────────────────────────
const Calendar = ({ availability, selectedDate, onSelectDate, onTodayClick }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const availableMap = useMemo(() => {
    const map = {};
    availability.forEach(d => { map[d.date] = d; });
    return map;
  }, [availability]);

  const availableDateSet = useMemo(() => new Set(Object.keys(availableMap)), [availableMap]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const canGoPrev = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const calendarDays = useMemo(() => {
    const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

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
  const isSelected  = (day) => selectedDate?.date === getDateString(day);

  const handleDayClick = (day) => {
    if (isToday(day)) {
      onTodayClick();
      return;
    }
    if (isStrictPast(day) || !isAvailable(day)) return;
    onSelectDate(availableMap[getDateString(day)]);
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.calHeader}>
        <button className={styles.calNavBtn} onClick={prevMonth} disabled={!canGoPrev} aria-label="Previous month">
          <IoChevronBack />
        </button>
        <span className={styles.calMonthLabel}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button className={styles.calNavBtn} onClick={nextMonth} aria-label="Next month">
          <IoChevronForward />
        </button>
      </div>

      <div className={styles.calDayHeaders}>
        {DAY_LABELS.map(d => <span key={d} className={styles.calDayLabel}>{d}</span>)}
      </div>

      <div className={styles.calGrid}>
        {calendarDays.map((day, i) => {
          if (!day) return <span key={`e-${i}`} />;

          const strictPast  = isStrictPast(day);
          const todayCell   = isToday(day);
          const available   = isAvailable(day);
          const selected    = isSelected(day);
          const disabled    = strictPast || (!todayCell && !available);

          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => handleDayClick(day)}
              className={[
                styles.calDay,
                strictPast                              ? styles.calDayPast        : '',
                !strictPast && !available && !todayCell ? styles.calDayUnavailable : '',
                available && !strictPast && !todayCell  ? styles.calDayAvailable   : '',
                todayCell  && !selected                 ? styles.calDayToday       : '',
                selected                                ? styles.calDaySelected    : '',
              ].filter(Boolean).join(' ')}
            >
              {day}
              {available && !strictPast && !todayCell && !selected && (
                <span className={styles.calDot} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Same-Day Toast ────────────────────────────────────────────────────────────
const SameDayToast = ({ show, onClose }) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
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

// ─── ScheduleForm ─────────────────────────────────────────────────────────────
const ScheduleForm = ({
  doctorData,
  consultationMode,
  setConsultationMode,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  consultationFee,
}) => {
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [sameDayModal,  setSameDayModal]  = useState(false);

  const availableModes = useMemo(() => {
    const modes = [];
    if (doctorData) {
      const mode = doctorData.consultationMode;
      if (mode === 'Both' || mode === 'In-Person' || mode === 'Onsite') modes.push('ON-SITE');
      if (mode === 'Both' || mode === 'Online'    || mode === 'Virtual') modes.push('VIRTUAL');
    }
    return modes;
  }, [doctorData]);

  useEffect(() => {
    if (availableModes.length === 1 && consultationMode !== availableModes[0]) {
      setConsultationMode(availableModes[0]);
    }
  }, [availableModes, consultationMode, setConsultationMode]);

  useEffect(() => {
    if (!selectedDate || availableModes.length !== 2) return;
    const dayMode = getDayMode(selectedDate, doctorData);
    if (dayMode && consultationMode !== dayMode) setConsultationMode(dayMode);
  }, [selectedDate, availableModes, doctorData, consultationMode, setConsultationMode]);

  const handleSelectDate = (dateSlot) => {
    setSelectedDate(dateSlot);
    setSelectedTime(null);
    setDropdownOpen(false);
  };

  const handleTodayClick = () => {
    setSameDayModal(true);   // ← show modal instead of inline alert
    setSelectedDate(null);
    setSelectedTime(null);
    setDropdownOpen(false);
  };

  const bookableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getBookableSlots(selectedDate.slots).filter(s => s.bookable);
  }, [selectedDate]);

  const isFormComplete = consultationMode && selectedDate && selectedTime;

  return (
    <>
      {/* ── Same-Day Toast ── */}
      <SameDayToast show={sameDayModal} onClose={() => setSameDayModal(false)} />

      {/* ── Consultation Mode ── */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>
          <span className={styles.required}>*</span> Consultation Mode
        </p>
        {availableModes.length === 1 ? (
          <div className={styles.singleModeInfo}>
            {availableModes[0] === 'VIRTUAL'
              ? <><FaVideo className={styles.singleModeIcon} /> Virtual Consultation</>
              : <><FaHome  className={styles.singleModeIcon} /> On-Site Consultation</>
            }
          </div>
        ) : (
          <div className={styles.modeToggleRow}>
            <button
              className={`${styles.modeToggle} ${consultationMode === 'ON-SITE' ? styles.modeToggleActive : ''}`}
              onClick={() => { setConsultationMode('ON-SITE'); setSelectedDate(null); setSelectedTime(null); }}
            >
              <FaHome className={styles.modeToggleIcon} /><span>On-Site</span>
            </button>
            <button
              className={`${styles.modeToggle} ${consultationMode === 'VIRTUAL' ? styles.modeToggleActive : ''}`}
              onClick={() => { setConsultationMode('VIRTUAL'); setSelectedDate(null); setSelectedTime(null); }}
            >
              <FaVideo className={styles.modeToggleIcon} /><span>Virtual</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Calendar ── */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>
          <span className={styles.required}>*</span> Select Date
        </p>
        <Calendar
          availability={doctorData.availability}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          onTodayClick={handleTodayClick}
        />
      </div>

      {/* ── Time Dropdown ── */}
      {selectedDate && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>
            <span className={styles.required}>*</span> Select Time
            <span className={styles.sessionNote}> · 1 hour session</span>
          </p>
          <div className={styles.timeDropdownWrapper}>
            <button
              className={`${styles.timeDropdownTrigger} ${selectedTime ? styles.timeDropdownTriggerSelected : ''}`}
              onClick={() => setDropdownOpen(prev => !prev)}
            >
              <span>{selectedTime ? `${selectedTime} – ${getEndTime(selectedTime)}` : 'Select a time slot'}</span>
              <IoMdArrowDropdown className={`${styles.timeDropdownIcon} ${dropdownOpen ? styles.timeDropdownIconOpen : ''}`} />
            </button>
            {dropdownOpen && (
              <ul className={styles.timeDropdownList}>
                {bookableSlots.length === 0 ? (
                  <li className={styles.timeDropdownEmpty}>No available slots</li>
                ) : bookableSlots.map((slot, i) => (
                  <li
                    key={i}
                    className={`${styles.timeDropdownItem} ${selectedTime === slot.time ? styles.timeDropdownItemSelected : ''}`}
                    onClick={() => { setSelectedTime(slot.time); setDropdownOpen(false); }}
                  >
                    {slot.time} – {getEndTime(slot.time)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedTime && (
            <p className={styles.selectedTimeRange}>
              Session: <strong>{selectedTime} – {getEndTime(selectedTime)}</strong>
            </p>
          )}
        </div>
      )}

      {/* ── Booking Summary ── */}
      {isFormComplete && (
        <div className={styles.summaryCard}>
          <p className={styles.summaryTitle}>Booking Summary</p>
          <div className={styles.summaryGrid}>
            <span className={styles.summaryLabel}>Doctor</span>
            <span className={styles.summaryValue}>{doctorData.name}</span>

            <span className={styles.summaryLabel}>Mode</span>
            <span className={styles.summaryValue}>{consultationMode}</span>

            <span className={styles.summaryLabel}>Date</span>
            <span className={styles.summaryValue}>{selectedDate.date}</span>

            <span className={styles.summaryLabel}>Time</span>
            <span className={styles.summaryValue}>{selectedTime} – {getEndTime(selectedTime)}</span>

            <span className={`${styles.summaryLabel} ${styles.summaryFeeLabel}`}>Consultation Fee</span>
            <span className={`${styles.summaryValue} ${styles.summaryFee}`}>
              ₱{consultationFee?.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleForm;
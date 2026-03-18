// AppointmentForm/PAaEChooseRPm.jsx
// Step: Choose RPm / Psychometrician
// Calendar + dropdown time slot picker matches the screenshot design

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { MOCK_DOCTORS } from '../../../../MockData/MockDoctors';
import styles from '../../../ClientStyle/PAaEAppointmentForm.module.css';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/* -----------------------------------------------------------------
   AvailabilityCalendar — matches screenshot design
   · Purple filled header with bold month/year
   · Circular nav arrows
   · Unavailable = light grey text
   · Available = bold purple text
   · Today = purple ring outline circle
   · Selected = solid purple filled circle, white text
------------------------------------------------------------------ */
function AvailabilityCalendar({ doctor, selectedDate, onSelectDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const availableDateSet = useMemo(() => {
    if (!doctor) return new Set();
    const set = new Set();
    (doctor.availability || []).forEach(a => {
      const d = new Date(a.date);
      if (!isNaN(d)) {
        set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      }
    });
    return set;
  }, [doctor]);

  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className={styles.calCard}>

      {/* ── Purple header ── */}
      <div className={styles.calHeader}>
        <button className={styles.calArrowBtn} onClick={prevMonth} type="button">
          <FaChevronLeft size={10} />
        </button>
        <span className={styles.calMonthTitle}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button className={styles.calArrowBtn} onClick={nextMonth} type="button">
          <FaChevronRight size={10} />
        </button>
      </div>

      {/* ── Day grid ── */}
      <div className={styles.calBody}>
        {/* Day headers */}
        {['SU','MO','TU','WE','TH','FR','SA'].map(d => (
          <div key={d} className={styles.calDayName}>{d}</div>
        ))}

        {/* Empty cells + day cells */}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className={styles.calEmpty} />;

          const cellDate = new Date(viewYear, viewMonth, day);
          cellDate.setHours(0, 0, 0, 0);

          const isPast     = cellDate < today;
          const isToday    = cellDate.getTime() === today.getTime();
          const key        = `${viewYear}-${viewMonth}-${day}`;
          const isAvail    = availableDateSet.has(key) && !isPast;

          const selDate    = selectedDate ? new Date(selectedDate) : null;
          const isSelected = selDate &&
            selDate.getFullYear() === viewYear &&
            selDate.getMonth()    === viewMonth &&
            selDate.getDate()     === day;

          // Build class list
          let cellCls = styles.calCell;
          if (isSelected)       cellCls += ` ${styles.calCellSelected}`;
          else if (isToday)     cellCls += ` ${styles.calCellToday}`;
          else if (isAvail)     cellCls += ` ${styles.calCellAvail}`;
          else                  cellCls += ` ${styles.calCellDisabled}`;

          return (
            <button
              key={key}
              type="button"
              className={cellCls}
              disabled={!isAvail && !isSelected}
              onClick={() => isAvail && onSelectDate(cellDate)}
            >
              {day}
            </button>
          );
        })}
      </div>

    </div>
  );
}

/* -----------------------------------------------------------------
   TimeSlotDropdown — custom dropdown matching screenshot
   · "Select a time slot" placeholder with chevron
   · Opens a flat list of time slot rows
------------------------------------------------------------------ */
function TimeSlotDropdown({ doctor, selectedDate, selectedTime, onSelectTime }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!doctor || !selectedDate) return null;

  const selKey  = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const dayData = (doctor.availability || []).find(a => a.date === selKey);
  if (!dayData) return null;

  const slots    = dayData.slots;
  const bookable = [];
  for (let i = 0; i < slots.length - 1; i++) {
    if (slots[i].available && slots[i + 1].available) {
      bookable.push(`${slots[i].time} – ${slots[i + 1].time}`);
    }
  }

  if (bookable.length === 0)
    return <div className={styles.noSlotsMsg}>No available 1-hour slots for this date.</div>;

  return (
    <div className={styles.slotDropdownWrapper} ref={ref}>

      {/* ── Trigger ── */}
      <button
        type="button"
        className={`${styles.slotDropdownTrigger} ${open ? styles.slotDropdownTriggerOpen : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={selectedTime ? styles.slotDropdownSelected : styles.slotDropdownPlaceholder}>
          {selectedTime || 'Select a time slot'}
        </span>
        {open ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
      </button>

      {/* ── Dropdown list ── */}
      {open && (
        <div className={styles.slotDropdownList}>
          {bookable.map(slot => (
            <button
              key={slot}
              type="button"
              className={`${styles.slotDropdownItem} ${selectedTime === slot ? styles.slotDropdownItemActive : ''}`}
              onClick={() => { onSelectTime(slot); setOpen(false); }}
            >
              {slot}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}

/* -----------------------------------------------------------------
   PAaEChooseRPm
   Props:
     config          — SERVICE_CONFIG entry
     form            — shared form state
     setForm         — form state setter
     selectedDoctor  — currently selected doctor object (or null)
     onDoctorSelect  — (doctor) => void — lifts selection to parent
------------------------------------------------------------------ */
const PAaEChooseRPm = ({ config, form, setForm, selectedDoctor, onDoctorSelect }) => {

  const rpmList = useMemo(() => {
    const all = MOCK_DOCTORS.filter(d => d.title === 'Psychometrician');
    return config.femaleOnly
      ? all.filter(d => ['Maria', 'Angela', 'Patricia'].some(n => d.name.includes(n)))
      : all;
  }, [config.femaleOnly]);

  const modeLabel = (mode) => {
    if (mode === 'Virtual') return { label: 'Virtual',           cls: styles.modeVirtual };
    if (mode === 'Onsite')  return { label: 'On-Site',           cls: styles.modeOnsite  };
    return                         { label: 'On-Site & Virtual', cls: styles.modeBoth    };
  };

  return (
    <div className={styles.stepCard}>

      {/* ── VAWC female-only notice ── */}
      {config.femaleOnly && (
        <div className={styles.infoBanner}>
          <span>⚠️</span>
          <span>For VAWC cases, only <strong>Female</strong> RPm / Psychometricians are available.</span>
        </div>
      )}

      {/* ── RPm cards ── */}
      <div className={styles.rpmGrid}>
        {rpmList.map(r => {
          const mode       = modeLabel(r.consultationMode);
          const initials   = r.name.split(' ').filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join('');
          const isSelected = form.rpm === r.id;

          return (
            <div
              key={r.id}
              className={`${styles.rpmCard} ${isSelected ? styles.rpmCardSelected : ''}`}
              onClick={() => {
                setForm({ ...form, rpm: r.id, date: null, time: null });
                onDoctorSelect(r);
              }}
            >
              <div className={styles.rpmAvatar}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.rpmName}>{r.name}</div>
                <div className={styles.rpmTitle}>RPm / Psychometrician</div>
                <div className={styles.rpmSchedule}>
                  🗓 {r.schedule.days.join(', ')} · {r.schedule.time}
                </div>
                <span className={`${styles.rpmBadge} ${mode.cls}`}>{mode.label}</span>
              </div>
              {isSelected && <div className={styles.rpmCheck}>✓</div>}
            </div>
          );
        })}
      </div>

      {/* ── Calendar + time dropdown (shown after RPm is selected) ── */}
      {selectedDoctor && (
        <div style={{ marginTop: 24 }}>

          {/* Calendar section */}
          <div className={styles.calSectionDivider}>
            <span>📅</span>
            <span>Select a preferred date for <strong>{selectedDoctor.name}</strong></span>
          </div>

          <div className={styles.calFieldLabel}>
            Select Date <span className={styles.req}>*</span>
          </div>
          <AvailabilityCalendar
            doctor={selectedDoctor}
            selectedDate={form.date || null}
            onSelectDate={date => setForm({ ...form, date, time: null })}
          />

          {/* Time dropdown section */}
          {form.date && (
            <div style={{ marginTop: 20 }}>
              <div className={styles.calFieldLabel}>
                Select Time &nbsp;
                <span className={styles.calFieldSub}>· 1 hour session</span>
                <span className={styles.req}> *</span>
              </div>
              <TimeSlotDropdown
                doctor={selectedDoctor}
                selectedDate={form.date}
                selectedTime={form.time}
                onSelectTime={time => setForm({ ...form, time })}
              />
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default PAaEChooseRPm;
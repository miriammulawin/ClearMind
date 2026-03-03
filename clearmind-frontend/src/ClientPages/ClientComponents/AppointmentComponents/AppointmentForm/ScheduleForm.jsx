import React, { useMemo, useEffect } from 'react';
import { FaVideo, FaHome } from 'react-icons/fa';
import styles from '../../../ClientStyle/SetAppointmentForm.module.css';

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

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * ScheduleForm  –  Step 1 body
 *
 * Location: ClientComponent/AppointmentComponents/AppointmentForm/ScheduleForm.jsx
 *
 * Props (all lifted state from SetAppointmentForm):
 *   doctorData           – full doctor object
 *   consultationMode     – '' | 'IN-PERSON' | 'ONLINE'
 *   setConsultationMode  – setter
 *   selectedDate         – null | dateSlot object
 *   setSelectedDate      – setter
 *   selectedTime         – null | time string
 *   setSelectedTime      – setter
 *   consultationFee      – number (e.g. 500)
 */
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

  // ── Derive available modes ─────────────────────────────────────────────────
  const availableModes = [];
  if (doctorData) {
    const mode = doctorData.consultationMode;
    if (mode === 'Both' || mode === 'In-Person' || mode === 'Onsite') availableModes.push('IN-PERSON');
    if (mode === 'Both' || mode === 'Online') availableModes.push('ONLINE');
  }

  // Auto-select if only one mode — must be in useEffect
  useEffect(() => {
    if (availableModes.length === 1 && consultationMode !== availableModes[0]) {
      setConsultationMode(availableModes[0]);
    }
  }, [availableModes.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectDate = (dateSlot) => {
    setSelectedDate(dateSlot);
    setSelectedTime(null);
  };

  // ── Bookable slots for selected date ──────────────────────────────────────
  const bookableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getBookableSlots(selectedDate.slots);
  }, [selectedDate]);

  const isFormComplete = consultationMode && selectedDate && selectedTime;

  return (
    <>
      {/* ── Consultation Mode ── */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>
          <span className={styles.required}>*</span> Consultation Mode
        </p>
        {availableModes.length === 1 ? (
          <div className={styles.singleModeInfo}>
            {availableModes[0] === 'ONLINE'
              ? <><FaVideo className={styles.singleModeIcon} /> Online Consultation</>
              : <><FaHome className={styles.singleModeIcon} /> In-Person Consultation</>
            }
          </div>
        ) : (
          <div className={styles.modeToggleRow}>
            <button
              className={`${styles.modeToggle} ${consultationMode === 'IN-PERSON' ? styles.modeToggleActive : ''}`}
              onClick={() => setConsultationMode('IN-PERSON')}
            >
              <FaHome className={styles.modeToggleIcon} />
              <span>In-Person</span>
            </button>
            <button
              className={`${styles.modeToggle} ${consultationMode === 'ONLINE' ? styles.modeToggleActive : ''}`}
              onClick={() => setConsultationMode('ONLINE')}
            >
              <FaVideo className={styles.modeToggleIcon} />
              <span>Online</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Date Selection ── */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>
          <span className={styles.required}>*</span> Select Date
        </p>
        <div className={styles.datesGrid}>
          {doctorData.availability.map((dateSlot, index) => (
            <button
              key={index}
              className={`${styles.dateCard} ${selectedDate?.date === dateSlot.date ? styles.dateCardSelected : ''}`}
              onClick={() => handleSelectDate(dateSlot)}
            >
              <span className={styles.dateDay}>{dateSlot.day}</span>
              <span className={styles.dateNum}>{dateSlot.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Time Selection ── */}
      {selectedDate && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>
            <span className={styles.required}>*</span> Select Time
            <span className={styles.sessionNote}> · 1 hour session</span>
          </p>
          <div className={styles.timeSlotsGrid}>
            {bookableSlots
              .filter(slot => slot.bookable)
              .map((slot, index) => (
                <button
                  key={index}
                  className={`${styles.timeSlot} ${selectedTime === slot.time ? styles.timeSlotSelected : ''}`}
                  onClick={() => setSelectedTime(slot.time)}
                  title={`${slot.time} – ${getEndTime(slot.time)}`}
                >
                  {slot.time}
                </button>
              ))
            }
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
            <span className={styles.summaryValue}>
              {selectedTime} – {getEndTime(selectedTime)}
            </span>

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
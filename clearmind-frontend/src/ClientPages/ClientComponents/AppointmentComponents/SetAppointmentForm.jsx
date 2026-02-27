import React, { useState, useMemo } from 'react';
import { Image } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaVideo, FaHome, FaArrowLeft } from 'react-icons/fa';
import { CONSULTATION_FEES } from '../../../MockData/MockDoctors.js';
import styles from '../../ClientStyle/SetAppointmentForm.module.css';
import logo_login_single from "../../../../src/assets/CMPS_Img_logo_only.png";


// ─── Convert "4:30 PM" → total minutes since midnight ─────────────────────────
const timeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// ─── Get end time string (start + 60 mins) ────────────────────────────────────
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

// ─── Mark each slot as bookable ───────────────────────────────────────────────
// A slot is BOOKABLE (can be selected as a session start) only if:
//   • this slot's 30-min block is free (available: true)
//   • the NEXT slot's 30-min block is also free (available: true)
//     → together they cover the full 1-hour session
// Slots that are NOT bookable are shown grayed out (user sees all slots)
const getBookableSlots = (slots) => {
  return slots.map((slot, index) => {
    const isLastSlot = index === slots.length - 1;
    // Last slot can never start a 1hr session (no room left in schedule)
    if (isLastSlot) return { ...slot, bookable: false };
    const nextSlot = slots[index + 1];
    const bookable = slot.available && !!nextSlot && nextSlot.available;
    return { ...slot, bookable };
  });
};


const SetAppointmentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const doctorData = location.state?.doctor;

  const [consultationMode, setConsultationMode] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleModeSelect = (mode) => setConsultationMode(mode);

  const handleSelectDate = (dateSlot) => {
    setSelectedDate(dateSlot);
    setSelectedTime(null);
  };

  const handleSelectTime = (time) => setSelectedTime(time);

  const handleContinue = () => {
    if (isFormComplete) {
      alert(`Proceeding to payment...\n\nMode: ${consultationMode}\nDate: ${selectedDate.date}\nTime: ${selectedTime} – ${getEndTime(selectedTime)}`);
      // navigate('/client/appointment/payment', { state: { doctor: doctorData, consultationMode, selectedDate, selectedTime } });
    }
  };

  // ─── Bookable slots for the selected date ─────────────────────────────────
  const bookableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return getBookableSlots(selectedDate.slots);
  }, [selectedDate]);

  const isFormComplete = consultationMode && selectedDate && selectedTime;

  // ─── Derive available consultation modes from doctor data ──────────────────
  const availableModes = [];
  if (doctorData) {
    const mode = doctorData.consultationMode;
    if (mode === 'Both' || mode === 'In-Person' || mode === 'Onsite') availableModes.push('IN-PERSON');
    if (mode === 'Both' || mode === 'Online') availableModes.push('ONLINE');
  }

  // Auto-select if only one mode available
  if (availableModes.length === 1 && consultationMode !== availableModes[0]) {
    setConsultationMode(availableModes[0]);
  }

  if (!doctorData) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.scrollContent}>
          <p className={styles.noDataText}>No doctor selected. Please go back and select a doctor.</p>
          <button className={styles.backButton} onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>

      {/* ── Sticky Header ── */}
      <div className={styles.stickyHeader}>
        <div className={styles.backRow}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <FaArrowLeft /> Go Back
          </button>
        </div>
        <div className={styles.doctorStrip}>
          <div className={styles.doctorStripLeft}>
            <div className={styles.avatarCircle}>
              {doctorData.name.charAt(0)}
            </div>
            <div className={styles.doctorDetails}>
              <span className={styles.assignedLabel}>Assigned Doctor</span>
              <span className={styles.doctorName}>{doctorData.name}</span>
              <span className={styles.doctorCredentials}>{doctorData.credentials}</span>
            </div>
          </div>
          <div className={styles.logoIconProfile}>
            <Image src={logo_login_single} fluid />
          </div>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className={styles.scrollContent}>

        {/* Stepper */}
        <div className={styles.stepper}>
          {[
            { num: 1, label: 'Schedule' },
            { num: 2, label: 'Verify Profile' },
            { num: 3, label: 'Payment' },
          ].map((step, i, arr) => (
            <React.Fragment key={step.num}>
              <div className={styles.stepperItem}>
                <div className={`${styles.stepCircle} ${step.num === 1 ? styles.active : ''}`}>
                  {step.num}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
              {i < arr.length - 1 && <div className={styles.stepperLine} />}
            </React.Fragment>
          ))}
        </div>

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
                onClick={() => handleModeSelect('IN-PERSON')}
              >
                <FaHome className={styles.modeToggleIcon} />
                <span>In-Person</span>
              </button>
              <button
                className={`${styles.modeToggle} ${consultationMode === 'ONLINE' ? styles.modeToggleActive : ''}`}
                onClick={() => handleModeSelect('ONLINE')}
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
                    onClick={() => handleSelectTime(slot.time)}
                    title={`${slot.time} – ${getEndTime(slot.time)}`}
                  >
                    {slot.time}
                  </button>
                ))
              }
            </div>

            {/* Show selected session range */}
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
                ₱{CONSULTATION_FEES.initial.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className={styles.footerSpacer} />
      </div>

      {/* ── Sticky Footer ── */}
      <div className={styles.stickyFooter}>
        <button
          className={`${styles.continueButton} ${!isFormComplete ? styles.continueDisabled : ''}`}
          disabled={!isFormComplete}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>

    </div>
  );
};

export default SetAppointmentForm;
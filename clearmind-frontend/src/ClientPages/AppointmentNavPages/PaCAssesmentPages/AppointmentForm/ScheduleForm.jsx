// ScheduleForm.jsx
// Step 1 of the appointment booking flow.
// Calendar + time picker are now delegated to SelectDateAndTime.jsx.

import React, { useMemo, useEffect } from 'react';
import { FaVideo, FaHome } from 'react-icons/fa';
import styles from '../../../ClientStyle/ScheduleForm.module.css';

import SelectDateAndTime, { getEndTime } from '../../AppointmentComponents/SelectDateandTime';
import SetAppointmentFormHeader from './SetAppointmentFormHeader'; // ← adjust path as needed

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getDayMode = (dateSlot, doctorData) => {
  if (!dateSlot || !doctorData) return null;
  const day         = dateSlot.day;
  const onSiteDays  = doctorData.onSiteDays  || [];
  const virtualDays = doctorData.virtualDays || [];
  if (onSiteDays.includes(day)  && !virtualDays.includes(day)) return 'ON-SITE';
  if (virtualDays.includes(day) && !onSiteDays.includes(day))  return 'VIRTUAL';
  return null;
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
  currentStep,   // ← new prop (pass 1 for the Schedule tab)
  onBack,        // ← new prop
}) => {

  // ── Derive available modes from doctor data ──────────────────
  const availableModes = useMemo(() => {
    const modes = [];
    if (doctorData) {
      const mode = doctorData.consultationMode;
      if (mode === 'Both' || mode === 'In-Person' || mode === 'Onsite') modes.push('ON-SITE');
      if (mode === 'Both' || mode === 'Online'    || mode === 'Virtual') modes.push('VIRTUAL');
    }
    return modes;
  }, [doctorData]);

  // Auto-select mode when there is only one option
  useEffect(() => {
    if (availableModes.length === 1 && consultationMode !== availableModes[0]) {
      setConsultationMode(availableModes[0]);
    }
  }, [availableModes, consultationMode, setConsultationMode]);

  // Auto-switch mode when a date is selected that belongs to a specific mode
  useEffect(() => {
    if (!selectedDate || availableModes.length !== 2) return;
    const dayMode = getDayMode(selectedDate, doctorData);
    if (dayMode && consultationMode !== dayMode) setConsultationMode(dayMode);
  }, [selectedDate, availableModes, doctorData, consultationMode, setConsultationMode]);

  const isFormComplete = consultationMode && selectedDate && selectedTime;

  return (
    <>
      {/* ── Consultation Mode ── */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>
          <span className={styles.required}>*</span> Consultation Mode
        </p>

        {availableModes.length === 1 ? (
          /* Single mode — just show info, no toggle needed */
          <div className={styles.singleModeInfo}>
            {availableModes[0] === 'VIRTUAL'
              ? <><FaVideo className={styles.singleModeIcon} /> Virtual Consultation</>
              : <><FaHome  className={styles.singleModeIcon} /> On-Site Consultation</>
            }
          </div>
        ) : (
          /* Both modes available — show toggle */
          <div className={styles.modeToggleRow}>
            <button
              className={`${styles.modeToggle} ${consultationMode === 'ON-SITE' ? styles.modeToggleActive : ''}`}
              onClick={() => {
                setConsultationMode('ON-SITE');
                setSelectedDate(null);
                setSelectedTime(null);
              }}
            >
              <FaHome className={styles.modeToggleIcon} />
              <span>On-Site</span>
            </button>
            <button
              className={`${styles.modeToggle} ${consultationMode === 'VIRTUAL' ? styles.modeToggleActive : ''}`}
              onClick={() => {
                setConsultationMode('VIRTUAL');
                setSelectedDate(null);
                setSelectedTime(null);
              }}
            >
              <FaVideo className={styles.modeToggleIcon} />
              <span>Virtual</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Date + Time picker ── */}
      <SelectDateAndTime
        doctorData={doctorData}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
      />

      {/* ── Booking Summary (shown once all three fields are filled) ── */}
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

            <span className={`${styles.summaryLabel} ${styles.summaryFeeLabel}`}>
              Consultation Fee
            </span>
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
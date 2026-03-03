import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CONSULTATION_FEES } from '../../../../MockData/MockDoctors.js';
import styles from '../../../ClientStyle/SetAppointmentForm.module.css';
import SetAppointmentFormHeader from './SetAppointmentFormHeader.jsx';
import ScheduleForm from './ScheduleForm.jsx';

// ─── Total steps (must match STEPS array in SetAppointmentFormHeader) ─────────
const TOTAL_STEPS = 3;

const SetAppointmentForm = () => {
  const location   = useLocation();
  const navigate   = useNavigate();
  const doctorData = location.state?.doctor;

  const [currentStep, setCurrentStep] = useState(1);

  // ── Shared form state (lifted so all steps can read/write) ────────────────
  const [consultationMode, setConsultationMode] = useState('');
  const [selectedDate,     setSelectedDate]     = useState(null);
  const [selectedTime,     setSelectedTime]     = useState(null);

  // ─── Navigation ──────────────────────────────────────────────────────────
  const handleBack = () => {
    if (currentStep === 1) navigate(-1);
    else setCurrentStep(prev => prev - 1);
  };

  const handleContinue = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      alert('Submitting appointment...');
      // navigate('/client/appointment/confirmation', { state: { ... } });
    }
  };

  // ─── Step validation ─────────────────────────────────────────────────────
  const isCurrentStepComplete = () => {
    if (currentStep === 1) return !!(consultationMode && selectedDate && selectedTime);
    return true; // update per step as you build them
  };

  // ─── Step body ───────────────────────────────────────────────────────────
  const renderStepBody = () => {
    switch (currentStep) {
      case 1:
        return (
          <ScheduleForm
            doctorData={doctorData}
            consultationMode={consultationMode}
            setConsultationMode={setConsultationMode}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            consultationFee={CONSULTATION_FEES.initial}
          />
        );
      case 2:
        // TODO: swap with <DetailsForm /> when ready
        return (
          <div className={styles.placeholderStep}>
            <p>Step 2 – Patient Details (coming soon)</p>
          </div>
        );
      case 3:
        // TODO: swap with <PaymentForm /> when ready
        return (
          <div className={styles.placeholderStep}>
            <p>Step 3 – Payment (coming soon)</p>
          </div>
        );
      default:
        return null;
    }
  };

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

      {/* ── Header ── */}
      <SetAppointmentFormHeader
        doctorData={doctorData}
        currentStep={currentStep}
        onBack={handleBack}
      />

      {/* ── Scrollable Body ── */}
      <div className={styles.scrollContent}>
        {renderStepBody()}
        <div className={styles.footerSpacer} />
      </div>

      {/* ── Sticky Footer ── */}
      <div className={styles.stickyFooter}>
        {currentStep === TOTAL_STEPS && (
          <button
            className={styles.cancelButton}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        )}
        <button
          className={`${styles.continueButton} ${!isCurrentStepComplete() ? styles.continueDisabled : ''}`}
          disabled={!isCurrentStepComplete()}
          onClick={handleContinue}
        >
          {currentStep === TOTAL_STEPS ? 'Confirm & Book' : 'Continue'}
        </button>
      </div>

    </div>
  );
};

export default SetAppointmentForm;
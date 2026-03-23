import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { FiCheckCircle } from 'react-icons/fi';
import { CONSULTATION_FEES } from '../../../../MockData/MockDoctors.js';
import styles from '../../../ClientStyle/SetAppointmentForm.module.css';
import SetAppointmentFormHeader from './SetAppointmentFormHeader.jsx';
import ScheduleForm from './ScheduleForm.jsx';
import VerifyProfileForm from './VerifyProfileForm.jsx';
import PaymentForm from './PaymentForm.jsx';

// ─── Total steps (must match STEPS array in SetAppointmentFormHeader) ─────────
const TOTAL_STEPS = 3;

const SetAppointmentForm = () => {
  const location   = useLocation();
  const navigate   = useNavigate();
  const doctorData = location.state?.doctor;

  const [currentStep, setCurrentStep] = useState(1);
  const [errorModal,   setErrorModal]   = useState({ show: false, message: '' });
  const [confirmModal, setConfirmModal] = useState(false);

  // ── Shared form state (lifted so all steps can read/write) ────────────────
  const [consultationMode, setConsultationMode] = useState('');
  const [selectedDate,     setSelectedDate]     = useState(null);
  const [selectedTime,     setSelectedTime]     = useState(null);
  const [profileData,      setProfileData]      = useState({
    isInformant:    false,
    patientType:    'New Patient',
    classification: 'Regular',
  });
  const [paymentData, setPaymentData] = useState({
    paymentMode: 'G-Cash',
  });

  // ─── Navigation ──────────────────────────────────────────────────────────
  const handleBack = () => {
    if (currentStep === 1) navigate(-1);
    else setCurrentStep(prev => prev - 1);
  };

  const handleContinue = () => {
    const error = getStepError();
    if (error) {
      setErrorModal({ show: true, message: error });
      return;
    }
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      setConfirmModal(true);
    }
  };

  const handleConfirmBook = () => {
    setConfirmModal(false);
    // navigate('/client/appointment/confirmation', { state: { ... } });
    alert('Appointment booked!');
  };

  const closeErrorModal = () => setErrorModal({ show: false, message: '' });

  // ─── Per-step error message ───────────────────────────────────────────────
  const getStepError = () => {

    // ── Step 1: Schedule ──────────────────────────────────────────
    if (currentStep === 1) {
      if (!consultationMode) return 'Please select a consultation mode before continuing.';
      if (!selectedDate)     return 'Please select a date before continuing.';
      if (!selectedTime)     return 'Please select a time slot before continuing.';
    }

    // ── Step 2: Verify Profile ────────────────────────────────────
    if (currentStep === 2) {

      // Reason is always required in both modes
      if (!profileData.reason) return 'Please enter a reason for consultation.';

      if (profileData.isInformant === true) {
        // ── Complainant mode: all manual fields required ──
        if (!profileData.complainantName)
          return 'Please enter your full name.';
        if (!profileData.complainantRelation)
          return 'Please enter your relation to the patient.';
        if (!profileData.firstName)
          return "Please enter the patient's first name.";
        if (!profileData.lastName)
          return "Please enter the patient's last name.";
        if (!profileData.sex)
          return "Please select the patient's sex.";
        if (!profileData.dateOfBirth)
          return "Please enter the patient's date of birth.";
        if (profileData.age === '0' || profileData.age === '')
          return 'Patient must be at least 1 year old.';
        if (!profileData.contactNo)
          return "Please enter the patient's contact number.";
        if (!profileData.email)
          return "Please enter the patient's email address.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email))
          return 'Please enter a valid email address (e.g. juan@email.com).';
        if (!profileData.address)
          return "Please enter the patient's home address.";
      }

      // ── Patient mode: only reason needed — profile is pre-loaded ──
      // No extra validation required
    }

    // ── Step 3: Payment ───────────────────────────────────────────
    if (currentStep === 3) {
      if (!paymentData.paymentMode)  return 'Please select a payment mode.';
      if (!paymentData.referenceNo)  return 'Please enter the reference number.';
      if (!paymentData.receiptFile)  return 'Please upload your payment receipt.';
    }

    return '';
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
        return (
          <VerifyProfileForm
            formData={profileData}
            setFormData={setProfileData}
          />
        );
      case 3:
        return (
          <PaymentForm
            doctorData={doctorData}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            consultationMode={consultationMode}
            consultationFee={CONSULTATION_FEES.initial}
            profileData={profileData}
            paymentData={paymentData}
            setPaymentData={setPaymentData}
          />
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
          className={`${styles.continueButton} ${getStepError() ? styles.continueDisabled : ""}`}
          disabled={!!getStepError()}
          onClick={handleContinue}
        >
          {currentStep === TOTAL_STEPS ? 'Confirm & Book' : 'Continue'}
        </button>
      </div>

      {/* ── Confirm & Book Modal ── */}
      <Modal
        show={confirmModal}
        onHide={() => setConfirmModal(false)}
        centered
        size="sm"
        contentClassName={styles.confirmModalContent}
      >
        <Modal.Body className={styles.confirmModalBody}>
          <div className={styles.confirmModalIconWrapper}>
            <FiCheckCircle className={styles.confirmModalIcon} />
          </div>
          <p className={styles.confirmModalTitle}>Almost Done!</p>
          <p className={styles.confirmModalMessage}>
            You're about to book your appointment. Would you like to continue?
          </p>
          <div className={styles.confirmModalActions}>
            <button
              className={styles.confirmModalBtnBack}
              onClick={() => setConfirmModal(false)}
            >
              CANCEL
            </button>
            <button
              className={styles.confirmModalBtnConfirm}
              onClick={handleConfirmBook}
            >
              YES, CONFIRM
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ── Validation Error Modal ── */}
      <Modal
        show={errorModal.show}
        onHide={closeErrorModal}
        centered
        size="sm"
        contentClassName={styles.errorModalContent}
      >
        <Modal.Body className={styles.errorModalBody}>
          <div className={styles.errorModalIconWrapper}>
            <svg
              className={styles.errorModalIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
            >
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
            </svg>
          </div>
          <p className={styles.errorModalTitle}>Incomplete Form</p>
          <p className={styles.errorModalMessage}>{errorModal.message}</p>
          <button
            className={styles.errorModalBtn}
            onClick={closeErrorModal}
          >
            Got it
          </button>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default SetAppointmentForm;
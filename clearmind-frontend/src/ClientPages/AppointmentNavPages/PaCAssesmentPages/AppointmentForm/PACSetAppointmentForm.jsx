// SetAppointmentForm.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { FiCheckCircle } from "react-icons/fi";
import { CONSULTATION_FEES } from "../../../../MockData/MockDoctors.js";
import styles from "../style/PACSetAppointmentForm.module.css";
import SetAppointmentFormHeader from "./SetAppointmentFormHeader.jsx";
import ScheduleForm from "./ScheduleForm.jsx";
import VerifyProfileForm from "./VerifyProfileForm.jsx";
import PaymentForm from "./PaymentForm.jsx";
import PolicyModal from "../../AppointmentComponents/PolicyModal.jsx";
import { SameDayToast } from "../../AppointmentComponents/SelectDateandTime.jsx";
import {
  DECLARATION_SECTIONS,
  DECLARATION_RADIO_LABEL,
  BOOKING_POLICY_SECTIONS,
  BOOKING_POLICY_RADIO_LABEL,
} from "../../AppointmentComponents/PolicyModalContent.js";

// ─── Derive initial consultation fee from a doctor object ─────────────────────
// Each doctor has a consultationFees object with keys like initialConsultation,
// followUpConsultation, etc. We always show the initialConsultation fee on Step 1.
// Falls back to the role-based CONSULTATION_FEES map if the doctor has no fees.
const getInitialFee = (doctor) => {
  if (!doctor) return null;
  // Prefer the doctor's own fee record
  if (doctor.consultationFees?.initialConsultation)
    return doctor.consultationFees.initialConsultation;
  // Fallback: guess role from title
  const title = (doctor.title || "").toLowerCase();
  if (title.includes("psychiatrist"))
    return CONSULTATION_FEES.psychiatrist?.initialConsultation ?? null;
  if (title.includes("psychometrician"))
    return CONSULTATION_FEES.psychometrician?.initialConsultation ?? null;
  return CONSULTATION_FEES.psychologist?.initialConsultation ?? null;
};

// ─── Total steps (must match STEPS array in SetAppointmentFormHeader) ─────────
const TOTAL_STEPS = 3;

const SetAppointmentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const doctorData = location.state?.doctor;

  const [currentStep, setCurrentStep] = useState(1);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const [confirmModal, setConfirmModal] = useState(false);

  // ── Policy modal gates (Step 1 → Step 2 flow) ────────────────────────────
  const [declarationModal, setDeclarationModal] = useState(false);
  const [bookingPolicyModal, setBookingPolicyModal] = useState(false);

  // ── Same-day toast — owned here so it renders outside overflow:hidden ─────
  // SameDayToast uses position:fixed. Any overflow:hidden/auto ancestor clips it.
  // pageWrapper is position:fixed + overflow:hidden, so the toast must be a
  // direct child of pageWrapper — NOT inside scrollContent or ScheduleForm.
  const [sameDayToast, setSameDayToast] = useState(false);

  // ── Shared form state ─────────────────────────────────────────────────────
  const [consultationMode, setConsultationMode] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [profileData, setProfileData] = useState({
    isInformant: false,
    patientType: "New Patient",
    classification: "Regular",
  });
  const [paymentData, setPaymentData] = useState({
    paymentMode: "G-Cash",
  });

  // ─── Navigation ──────────────────────────────────────────────────────────
  const handleBack = () => {
    if (currentStep === 1) navigate(-1);
    else setCurrentStep((prev) => prev - 1);
  };

  const handleContinue = () => {
    const error = getStepError();
    if (error) {
      setErrorModal({ show: true, message: error });
      return;
    }

    // Step 1: show Declaration modal first before advancing
    if (currentStep === 1) {
      setDeclarationModal(true);
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setConfirmModal(true);
    }
  };

  // Declaration confirmed → open Booking Policy next
  const handleDeclarationConfirm = () => {
    setDeclarationModal(false);
    setBookingPolicyModal(true);
  };

  // Booking Policy confirmed → advance to Step 2
  const handleBookingPolicyConfirm = () => {
    setBookingPolicyModal(false);
    setCurrentStep((prev) => prev + 1);
  };

  const handleConfirmBook = () => {
    setConfirmModal(false);
    alert("Appointment booked!");
  };

  const closeErrorModal = () => setErrorModal({ show: false, message: "" });

  // ─── Per-step validation ──────────────────────────────────────────────────
  const getStepError = () => {
    if (currentStep === 1) {
      if (!consultationMode)
        return "Please select a consultation mode before continuing.";
      if (!selectedDate) return "Please select a date before continuing.";
      if (!selectedTime) return "Please select a time slot before continuing.";
    }

    if (currentStep === 2) {
      if (!profileData.reason) return "Please enter a reason for consultation.";

      if (profileData.isInformant === true) {
        if (!profileData.complainantName) return "Please enter your full name.";
        if (!profileData.complainantRelation)
          return "Please enter your relation to the patient.";
        if (!profileData.firstName)
          return "Please enter the patient's first name.";
        if (!profileData.lastName)
          return "Please enter the patient's last name.";
        if (!profileData.sex) return "Please select the patient's sex.";
        if (!profileData.dateOfBirth)
          return "Please enter the patient's date of birth.";
        if (profileData.age === "0" || profileData.age === "")
          return "Patient must be at least 1 year old.";
        if (!profileData.contactNo)
          return "Please enter the patient's contact number.";
        if (!profileData.email)
          return "Please enter the patient's email address.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profileData.email))
          return "Please enter a valid email address (e.g. juan@email.com).";
        if (!profileData.address)
          return "Please enter the patient's home address.";
      }
    }

    if (currentStep === 3) {
      if (!paymentData.paymentMode) return "Please select a payment mode.";
      if (!paymentData.referenceNo) return "Please enter the reference number.";
      if (!paymentData.receiptFile)
        return "Please upload your payment receipt.";
    }

    return "";
  };

  // ─── Step body ────────────────────────────────────────────────────────────
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
            consultationFee={getInitialFee(doctorData)}
            onSameDayClick={() => setSameDayToast(true)}
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
            consultationFee={getInitialFee(doctorData)}
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
          <p className={styles.noDataText}>
            No doctor selected. Please go back and select a doctor.
          </p>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            Go Back
          </button>
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

      {/* ── Same-Day Toast ────────────────────────────────────────────────────
          MUST live here as a direct child of pageWrapper.
          position:fixed is clipped by any overflow:hidden or overflow:auto
          ancestor — scrollContent has overflow-y:auto so anything inside it
          with position:fixed will be invisible. Rendering it here bypasses
          that entirely.
      ── */}
      <SameDayToast
        show={sameDayToast}
        onClose={() => setSameDayToast(false)}
      />

      {/* ── Scrollable Body ── */}
      <div className={styles.scrollContent}>
        {renderStepBody()}
        <div className={styles.footerSpacer} />
      </div>

      {/* ── Sticky Footer ── */}
      <div className={styles.stickyFooter}>
        {currentStep === TOTAL_STEPS && (
          <button className={styles.cancelButton} onClick={() => navigate(-1)}>
            Cancel
          </button>
        )}
        <button
          className={`${styles.continueButton} ${getStepError() ? styles.continueDisabled : ""}`}
          disabled={!!getStepError()}
          onClick={handleContinue}
        >
          {currentStep === TOTAL_STEPS ? "Confirm & Book" : "Continue"}
        </button>
      </div>

      {/* ── Step 1 Gate: Declaration of Participation ── */}
      <PolicyModal
        show={declarationModal}
        onHide={() => setDeclarationModal(false)}
        onConfirm={handleDeclarationConfirm}
        headerTitle="Declaration of Participation"
        headerSubtitle="Please read carefully and acknowledge before continuing."
        sections={DECLARATION_SECTIONS}
        radioLabel={DECLARATION_RADIO_LABEL}
        confirmLabel="Continue"
        cancelLabel="Cancel"
        size="md"
      />

      {/* ── Step 1 Gate: Booking & Cancellation Policy ── */}
      <PolicyModal
        show={bookingPolicyModal}
        onHide={() => setBookingPolicyModal(false)}
        onConfirm={handleBookingPolicyConfirm}
        headerTitle="Therapy Appointment, Cancellation & Rebooking Policy"
        headerSubtitle="All parties are advised to carefully review this policy."
        sections={BOOKING_POLICY_SECTIONS}
        radioLabel={BOOKING_POLICY_RADIO_LABEL}
        requireScroll
        confirmLabel="I Agree"
        cancelLabel="Back"
        size="lg"
      />

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
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
          </div>
          <p className={styles.errorModalTitle}>Incomplete Form</p>
          <p className={styles.errorModalMessage}>{errorModal.message}</p>
          <button className={styles.errorModalBtn} onClick={closeErrorModal}>
            Got it
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SetAppointmentForm;

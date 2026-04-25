// SetAppointmentForm.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { FiCheckCircle } from "react-icons/fi";
import styles from "../style/PACSetAppointmentForm.module.css";
import SetAppointmentFormHeader from "./SetAppointmentFormHeader.jsx";
import ScheduleForm from "./ScheduleForm.jsx";
import VerifyProfileForm from "./VerifyProfileForm.jsx";
import PaymentForm from "../../AppointmentComponents/PaymentForm";
import PolicyModal from "../../AppointmentComponents/PolicyModal.jsx";
import { SameDayToast } from "../../AppointmentComponents/SelectDateandTime.jsx";
import {
  DECLARATION_SECTIONS,
  DECLARATION_RADIO_LABEL,
  BOOKING_POLICY_SECTIONS,
  BOOKING_POLICY_RADIO_LABEL,
} from "../../AppointmentComponents/PolicyModalContent.js";
import AppointmentSuccessScreen from "../../AppointmentComponents/AppointmentSuccessScreen.jsx";
import axiosClient from "../../../../axiosClient";

const getInitialFee = (doctor) => {
  if (!doctor) return null;
  if (doctor.consultationFees?.initialConsultation)
    return doctor.consultationFees.initialConsultation;
  return null;
};

const TOTAL_STEPS = 3;

const SetAppointmentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const doctorData = location.state?.doctor;
  const selectedService = location.state?.selectedService;

  const [currentStep, setCurrentStep] = useState(1);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const [confirmModal, setConfirmModal] = useState(false);
  const [declarationModal, setDeclarationModal] = useState(false);
  const [bookingPolicyModal, setBookingPolicyModal] = useState(false);
  const [sameDayToast, setSameDayToast] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [bookingPolicyAgreed, setBookingPolicyAgreed] = useState(false);

  const [consultationMode, setConsultationMode] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [profileData, setProfileData] = useState({
    isInformant: false,
    patientType: "New Patient",
    classification: "Regular",
  });
  const [paymentData, setPaymentData] = useState({ paymentMode: "G-Cash" });

  // ── NEW: Doctor schedule from API ─────────────────────────────
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    if (!doctorData?.id) return;
    setScheduleLoading(true);
    axiosClient
      .get(`/doctors/${doctorData.id}/schedules`)
      .then(({ data }) => setDoctorSchedule(data.data?.schedule || []))
      .catch((e) => console.error("Failed to fetch schedule:", e))
      .finally(() => setScheduleLoading(false));
  }, [doctorData?.id]);

  // ── NEW: Derived values from schedule ────────────────────────
  const availableDayNums = useMemo(
    () => doctorSchedule.map((s) => s.day_num),
    [doctorSchedule],
  );

  const scheduleForDate = useMemo(() => {
    if (!selectedDate || doctorSchedule.length === 0) return null;
    const dayNum = new Date(selectedDate + "T00:00:00").getDay();
    return doctorSchedule.find((s) => s.day_num === dayNum) || null;
  }, [selectedDate, doctorSchedule]);

  // ── NEW: Booked slots from API ────────────────────────────────
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookedSlotsLoading, setBookedSlotsLoading] = useState(false);

  useEffect(() => {
    // doctor_user_id = users.id (set in mapDoctor as doctor_user_id: d.id)
    const doctorUserId = doctorData?.doctor_user_id;
    if (!doctorUserId || !selectedDate) {
      setBookedSlots([]);
      return;
    }

    setBookedSlotsLoading(true);
    axiosClient
      .get("/appointments/booked-slots", {
        params: { doctor_user_id: doctorUserId, date: selectedDate },
      })
      .then(({ data }) => setBookedSlots(data.data || []))
      .catch((e) => {
        console.error("Failed to fetch booked slots:", e);
        setBookedSlots([]);
      })
      .finally(() => setBookedSlotsLoading(false));
  }, [doctorData?.doctor_user_id, selectedDate]);

  // ── Navigation ────────────────────────────────────────────────
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
    if (currentStep === 1) {
      setCurrentStep(2);
      setDeclarationModal(true);
      return;
    }
    if (currentStep === 2) {
      setCurrentStep(3);
      setBookingPolicyModal(true);
      return;
    }
    setConfirmModal(true);
  };

  const handleDeclarationConfirm = () => {
    setDeclarationModal(false);
    setDeclarationAgreed(true);
  };
  const handleBookingPolicyConfirm = () => {
    setBookingPolicyModal(false);
    setBookingPolicyAgreed(true);
  };
  const handleConfirmBook = () => {
    setConfirmModal(false);
    setShowSuccess(true);
  };
  const closeErrorModal = () => setErrorModal({ show: false, message: "" });

  const getStepError = () => {
    if (currentStep === 1) {
      if (!consultationMode)
        return "Please select a consultation mode before continuing.";
      if (!selectedDate) return "Please select a date before continuing.";
      if (!selectedTime) return "Please select a time slot before continuing.";
    }
    if (currentStep === 2) {
      if (!declarationAgreed)
        return "Please acknowledge the Declaration of Participation.";
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
      if (!bookingPolicyAgreed)
        return "Please acknowledge the Cancellation & Rebooking Policy.";
      if (!paymentData.paymentMode) return "Please select a payment mode.";
      if (!paymentData.referenceNo) return "Please enter the reference number.";
      if (!paymentData.receiptFile)
        return "Please upload your payment receipt.";
    }
    return "";
  };

  const renderStepBody = () => {
    switch (currentStep) {
      case 1:
        return (
          <ScheduleForm
            doctorData={doctorData}
            // ── Real API data — NEW ──
            doctorSchedule={doctorSchedule}
            scheduleLoading={scheduleLoading}
            availableDayNums={availableDayNums}
            scheduleForDate={scheduleForDate}
            bookedSlots={bookedSlots}
            bookedSlotsLoading={bookedSlotsLoading}
            // ── Service ──
            selectedService={selectedService}
            // ── Form state ──
            consultationMode={consultationMode}
            setConsultationMode={setConsultationMode}
            selectedDate={selectedDate}
            setSelectedDate={(date) => {
              setSelectedDate(date);
              setSelectedTime(null); // reset time when date changes
            }}
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
            declarationAgreed={declarationAgreed}
            onOpenDeclaration={() => setDeclarationModal(true)}
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
            bookingPolicyAgreed={bookingPolicyAgreed}
            onOpenBookingPolicy={() => setBookingPolicyModal(true)}
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

  if (showSuccess) {
    return (
      <AppointmentSuccessScreen
        serviceTitle="Psychotherapy & Counseling"
        refPrefix="PAC"
        onBack={() => navigate("/client/appointment/services")}
      />
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <SetAppointmentFormHeader
        doctorData={doctorData}
        currentStep={currentStep}
        onBack={handleBack}
      />

      <SameDayToast
        show={sameDayToast}
        onClose={() => setSameDayToast(false)}
      />

      <div className={styles.scrollContent}>
        {renderStepBody()}
        <div className={styles.footerSpacer} />
      </div>

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

      <PolicyModal
        show={declarationModal}
        initialAgreed={declarationAgreed}
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

      <PolicyModal
        show={bookingPolicyModal}
        initialAgreed={bookingPolicyAgreed}
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

      <Modal
        show={confirmModal}
        onHide={() => setConfirmModal(false)}
        centered
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

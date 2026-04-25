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
import { useCurrentUser } from "../../../../hooks/userCurrentUser";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve the consultation fee:
 * Priority: selectedService fee → doctor initial consultation fee → null
 */
const resolveConsultationFee = (doctor, selectedService) => {
  // Service-level fee (handle both object shapes)
  if (selectedService && typeof selectedService === "object") {
    const serviceFee =
      selectedService.service_fee ??
      selectedService.fee ??
      selectedService.price ??
      selectedService.amount ??
      null;
    if (serviceFee !== null && serviceFee !== undefined) return serviceFee;
  }
  // Fallback: doctor's initial consultation fee
  return doctor?.consultationFees?.initialConsultation ?? null;
};

/**
 * selectedDate may be a plain "YYYY-MM-DD" string OR { date: "YYYY-MM-DD" }
 */
const resolveDateStr = (selectedDate) => {
  if (!selectedDate) return null;
  if (typeof selectedDate === "string") return selectedDate;
  if (selectedDate.date) return selectedDate.date;
  return null;
};

/**
 * Convert any time string → "HH:MM" (24-hr) for Laravel date_format:H:i
 * Handles:  "9:00 AM", "12:30 PM", "09:00", "9:00"
 */
const to24Hour = (timeStr) => {
  if (!timeStr) return null;
  if (!timeStr.includes("AM") && !timeStr.includes("PM")) {
    const [h, m] = timeStr.split(":").map(Number);
    return `${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
  }
  const [time, period] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

/**
 * Add 60 min to any time string → "HH:MM"
 */
const addOneHour = (timeStr) => {
  if (!timeStr) return null;
  const base = to24Hour(timeStr);
  if (!base) return null;
  const [h, m] = base.split(":").map(Number);
  const total = h * 60 + m + 60;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const TOTAL_STEPS = 3;

// ─── Component ────────────────────────────────────────────────────────────────
const SetAppointmentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const doctorData = location.state?.doctor;
  const selectedService = location.state?.selectedService; // may be string or object

  const currentUser = useCurrentUser();

  // ── UI state ──────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const [confirmModal, setConfirmModal] = useState(false);
  const [declarationModal, setDeclarationModal] = useState(false);
  const [bookingPolicyModal, setBookingPolicyModal] = useState(false);
  const [sameDayToast, setSameDayToast] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [bookingPolicyAgreed, setBookingPolicyAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Form state ────────────────────────────────────────────────
  const [consultationMode, setConsultationMode] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [profileData, setProfileData] = useState({
    isInformant: false,
    patientType: "New Patient",
    classification: "Regular",
  });
  const [paymentData, setPaymentData] = useState({ paymentMode: "G-Cash" });

  // ── Doctor schedule ───────────────────────────────────────────
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

  const availableDayNums = useMemo(
    () => doctorSchedule.map((s) => s.day_num),
    [doctorSchedule],
  );

  const scheduleForDate = useMemo(() => {
    const dateStr = resolveDateStr(selectedDate);
    if (!dateStr || !doctorSchedule.length) return null;
    const dayNum = new Date(dateStr + "T00:00:00").getDay();
    return doctorSchedule.find((s) => s.day_num === dayNum) || null;
  }, [selectedDate, doctorSchedule]);

  // ── Fully-booked calendar dates ───────────────────────────────
  const [fullyBookedDates, setFullyBookedDates] = useState(new Set());
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);

  const fetchFullyBookedDates = ({ year, month }) => {
    if (!doctorData?.doctor_user_id) return;
    setLoadingBookedDates(true);
    axiosClient
      .get("/appointments/fully-booked-dates", {
        params: {
          doctor_user_id: doctorData.doctor_user_id,
          year,
          month: month + 1, // JS month is 0-indexed
        },
      })
      .then(({ data }) => {
        setFullyBookedDates(new Set(data.data || []));
      })
      .catch(() => setFullyBookedDates(new Set()))
      .finally(() => setLoadingBookedDates(false));
  };

  // ── Booked slots ──────────────────────────────────────────────
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookedSlotsLoading, setBookedSlotsLoading] = useState(false);

  useEffect(() => {
    const doctorUserId = doctorData?.doctor_user_id;
    const dateStr = resolveDateStr(selectedDate);
    if (!doctorUserId || !dateStr) {
      setBookedSlots([]);
      return;
    }
    setBookedSlotsLoading(true);
    axiosClient
      .get("/appointments/booked-slots", {
        params: { doctor_user_id: doctorUserId, date: dateStr },
      })
      .then(({ data }) => setBookedSlots(data.data || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setBookedSlotsLoading(false));
  }, [doctorData?.doctor_user_id, selectedDate]);

  // ── Resolved fee — SERVICE FEE TAKES PRIORITY ────────────────
  const consultationFee = useMemo(
    () => resolveConsultationFee(doctorData, selectedService),
    [doctorData, selectedService],
  );

  // ── Selected service display name ─────────────────────────────
  const selectedServiceName = useMemo(() => {
    if (!selectedService) return "";
    if (typeof selectedService === "string") return selectedService;
    return (
      selectedService.service_name ||
      selectedService.title ||
      selectedService.name ||
      ""
    );
  }, [selectedService]);

  // ── Selected service fee (for display, separate from doctor fee) ──
  const selectedServiceFee = useMemo(() => {
    if (!selectedService || typeof selectedService === "string") return null;
    return (
      selectedService.service_fee ??
      selectedService.fee ??
      selectedService.price ??
      selectedService.amount ??
      null
    );
  }, [selectedService]);

  // ── Navigation ────────────────────────────────────────────────
  const handleBack = () => {
    if (currentStep === 1) navigate(-1);
    else setCurrentStep((p) => p - 1);
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
  const closeErrorModal = () => setErrorModal({ show: false, message: "" });

  // ── Submit ────────────────────────────────────────────────────
  const handleConfirmBook = async () => {
    setConfirmModal(false);
    setIsSubmitting(true);

    try {
      const dateStr = resolveDateStr(selectedDate);
      const startTime24 = to24Hour(selectedTime);
      const endTime24 = addOneHour(selectedTime);
      const isInformant = profileData.isInformant === true;

      const form = new FormData();

      // doctor
      if (doctorData?.doctor_user_id)
        form.append("doctor_user_id", doctorData.doctor_user_id);

      // schedule
      form.append("appointment_date", dateStr);
      form.append("start_time", startTime24);
      form.append("end_time", endTime24);
      form.append(
        "visit_type",
        consultationMode === "VIRTUAL" ? "virtual" : "onsite",
      );

      // service
      if (selectedServiceName) form.append("service_type", selectedServiceName);

      // reason
      if (profileData.reason)
        form.append("reason_for_consultation", profileData.reason);

      // ── patient ──────────────────────────────────────────────
      if (isInformant) {
        form.append("informant_name", profileData.complainantName || "");
        form.append(
          "informant_relation",
          profileData.complainantRelation || "",
        );
        form.append("patient_firstName", profileData.firstName || "");
        form.append("patient_lastName", profileData.lastName || "");
        form.append("patient_middleInitial", profileData.middleInitial || "");
        form.append("patient_dob", profileData.dateOfBirth || "");
        form.append("patient_sex", (profileData.sex || "").toLowerCase());
        form.append("patient_contactNo", profileData.contactNo || "");
        form.append("patient_email", profileData.email || "");
        form.append("patient_address", profileData.address || "");
        form.append(
          "patient_classification",
          profileData.classification || "Regular",
        );
        if (profileData.civilStatus)
          form.append(
            "patient_civilStatus",
            profileData.civilStatus.toLowerCase(),
          );
      } else {
        form.append("patient_firstName", currentUser?.firstName || "");
        form.append("patient_lastName", currentUser?.lastName || "");
        form.append("patient_middleInitial", currentUser?.middleInitial || "");
        form.append("patient_dob", currentUser?.dateOfBirth || "");
        form.append("patient_sex", (currentUser?.sex || "").toLowerCase());
        form.append("patient_contactNo", currentUser?.contactNo || "");
        form.append("patient_email", currentUser?.email || "");
        form.append(
          "patient_address",
          currentUser?.homeAddress || currentUser?.address || "",
        );
        form.append(
          "patient_classification",
          profileData.classification || "Regular",
        );
        if (currentUser?.civilStatus)
          form.append(
            "patient_civilStatus",
            currentUser.civilStatus.toLowerCase(),
          );
      }

      // payment — use resolved consultationFee (service-first)
      if (consultationFee !== null && consultationFee !== undefined)
        form.append("bill_amount", consultationFee);
      form.append("payment_status", "not_paid");
      if (paymentData.referenceNo)
        form.append("payment_reference", paymentData.referenceNo);
      if (paymentData.paymentMode)
        form.append("payment_mode", paymentData.paymentMode);

      // receipt
      if (paymentData.receiptFile)
        form.append("receipts[]", paymentData.receiptFile);

      await axiosClient.post("/appointments", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setShowSuccess(true);
    } catch (err) {
      console.error("Booking failed:", err);
      const serverMsg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : null) ||
        "Something went wrong. Please try again.";
      setErrorModal({ show: true, message: serverMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Validation ────────────────────────────────────────────────
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

  // ── Step render ───────────────────────────────────────────────
  const renderStepBody = () => {
    switch (currentStep) {
      case 1:
        return (
          <ScheduleForm
            doctorData={doctorData}
            doctorSchedule={doctorSchedule}
            scheduleLoading={scheduleLoading}
            availableDayNums={availableDayNums}
            scheduleForDate={scheduleForDate}
            bookedSlots={bookedSlots}
            bookedSlotsLoading={bookedSlotsLoading}
            fullyBookedDates={fullyBookedDates}
            loadingBookedDates={loadingBookedDates}
            onMonthChange={fetchFullyBookedDates}
            // Service info
            selectedService={selectedServiceName}
            selectedServiceFee={selectedServiceFee}
            serviceFromState={
              typeof selectedService === "object" ? selectedService : null
            }
            // Lifted form state
            consultationMode={consultationMode}
            setConsultationMode={setConsultationMode}
            selectedDate={selectedDate}
            setSelectedDate={(date) => {
              setSelectedDate(date);
              setSelectedTime(null);
            }}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            // Fee — service-first resolved
            consultationFee={consultationFee}
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
            // ── FIX: pass schedule summary props ──
            consultationMode={consultationMode}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            consultationFee={consultationFee}
            selectedService={selectedServiceName}
            doctorData={doctorData}
          />
        );
      case 3:
        return (
          <PaymentForm
            doctorData={doctorData}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            consultationMode={consultationMode}
            // ── FIX: use resolved fee (service-first) ──
            consultationFee={consultationFee}
            selectedService={selectedServiceName}
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
          className={`${styles.continueButton} ${
            getStepError() || isSubmitting ? styles.continueDisabled : ""
          }`}
          disabled={!!getStepError() || isSubmitting}
          onClick={handleContinue}
        >
          {currentStep === TOTAL_STEPS
            ? isSubmitting
              ? "Booking…"
              : "Confirm & Book"
            : "Continue"}
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
              disabled={isSubmitting}
            >
              CANCEL
            </button>
            <button
              className={styles.confirmModalBtnConfirm}
              onClick={handleConfirmBook}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Booking…" : "YES, CONFIRM"}
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

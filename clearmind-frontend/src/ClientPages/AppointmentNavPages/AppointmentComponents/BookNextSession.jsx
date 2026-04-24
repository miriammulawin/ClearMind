import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserMd, FaChevronDown } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { Modal } from "react-bootstrap";
import styles from "./styles/BookNextSession.module.css";
import StatusBadge from "./StatusBadge";
import PaymentForm from "./PaymentForm";
import PolicyModal from "./PolicyModal";
import {
  BOOKING_POLICY_SECTIONS,
  BOOKING_POLICY_RADIO_LABEL,
} from "./PolicyModalContent";

const DOCTOR_CHANGE_REASONS = [
  "Scheduling conflict with current doctor",
  "I prefer a different doctor",
  "Doctor is no longer available",
  "Other",
];

const BookNextSession = ({
  appointment: appointmentProp,
  onBack,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [keepDoctor, setKeepDoctor] = useState(null);
  const [changeReason, setChangeReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [confirmModal, setConfirmModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingPolicyModal, setBookingPolicyModal] = useState(false);
  const [bookingPolicyAgreed, setBookingPolicyAgreed] = useState(false);

  const appointment = appointmentProp || location.state?.appointment;
  if (!appointment) {
    navigate("/client/appointment/sessions");
    return null;
  }

  const sessionNumber = appointment.sessionNumber + 1;

  /* ── Validation ── */
  const getStepError = () => {
    if (step === 1) {
      if (keepDoctor === null) return "Please select a doctor preference.";
      if (keepDoctor === false && !changeReason)
        return "Please select a reason for changing doctor.";
      if (
        keepDoctor === false &&
        changeReason === "Other" &&
        !otherReason.trim()
      )
        return "Please describe your reason for changing doctor.";
    }
    if (step === 2) {
      if (!paymentData.paymentMode) return "Please select a payment method.";
      if (!paymentData.referenceNo) return "Please enter the reference number.";
      if (!paymentData.receiptFile)
        return "Please upload your proof of payment.";
    }
    return "";
  };

  const handleNext = () => {
    const err = getStepError();
    if (err) {
      setErrorModal({ show: true, message: err });
      return;
    }
    if (step === 1) {
      setStep(2);
      setBookingPolicyModal(true);
      return;
    }
    setConfirmModal(true);
  };

  const handleProofFile = (e) => {
    const file = e.target.files[0];
    if (file) setProofFile(file.name);
    e.target.value = "";
  };

  const handleBack = () => {
    if (onBack) {
      onBack(); // kapag nire-render as component
    } else {
      navigate("/client/appointment/sessions"); // kapag separate route
    }
  };

  const [paymentData, setPaymentData] = useState({
    paymentMode: "G-Cash",
    referenceNo: "",
    receiptFile: null,
  });

  return (
    <div className={styles.pageWrapper}>
      {/* ── Header ── */}
      <div className={styles.headerBar}>
        <button
          className={styles.backBtn}
          onClick={step === 1 ? handleBack : () => setStep(1)}
        >
          <FaArrowLeft /> {step === 1 ? "Back to Sessions" : "Back"}
        </button>
        <div className={styles.headerTitle}>BOOK NEXT SESSION</div>
      </div>

      {/* ── Stepper ── */}
      <div className={styles.stepperWrapper}>
        <div className={styles.stepperInner}>
          <div className={styles.stepper}>
            {["Doctor Preference", "Payment"].map((label, i, arr) => {
              const stepNum = i + 1;
              const isDone = stepNum < step;
              const isActive = stepNum === step;
              return (
                <React.Fragment key={label}>
                  <div className={styles.stepperItem}>
                    <div
                      className={`${styles.stepCircle} ${isActive ? styles.stepCircleActive : isDone ? styles.stepCircleDone : ""}`}
                    >
                      {isDone ? "✓" : stepNum}
                    </div>
                    <span
                      className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : isDone ? styles.stepLabelDone : ""}`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      className={`${styles.stepperLine} ${isDone ? styles.stepperLineDone : ""}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── Progress Bar ── */}
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className={styles.scrollBody}>
        <div lassName={styles.scrollBodyInner}>
          {/* ── Session Info Card ── */}
          <div className={styles.sessionInfoCard}>
            <div className={styles.sessionInfoRow}>
              <span className={styles.sessionInfoLabel}>Program:</span>
              <span className={styles.sessionInfoVal}>
                {appointment.serviceType || "Psychotherapy & Counseling"}
              </span>
            </div>
            <div className={styles.sessionInfoRow}>
              <span className={styles.sessionInfoLabel}>Booking Session:</span>
              <span className={styles.sessionInfoVal}>
                Session {sessionNumber} of {appointment.totalSessions}
              </span>
            </div>
            <div className={styles.sessionInfoRow}>
              <span className={styles.sessionInfoLabel}>Current Doctor:</span>
              <span className={styles.sessionInfoVal}>
                {appointment.doctor}
              </span>
            </div>
            <div className={styles.sessionInfoNote}>
              📅 Schedule will be confirmed by the admin after submission.
            </div>
          </div>

          {/* ══════════════ STEP 1 — Doctor Preference ══════════════ */}
          {step === 1 && (
            <div className={styles.stepCard}>
              <div className={styles.stepCardTitle}>Doctor Preference</div>

              {/* Keep same doctor */}
              <button
                type="button"
                className={`${styles.preferenceBtn} ${keepDoctor === true ? styles.preferenceBtnActive : ""}`}
                onClick={() => {
                  setKeepDoctor(true);
                  setChangeReason("");
                  setOtherReason("");
                }}
              >
                <div
                  className={`${styles.customCheck} ${keepDoctor === true ? styles.customCheckActive : ""}`}
                />
                <div className={styles.preferenceText}>
                  <span className={styles.preferenceMain}>
                    Keep same doctor
                  </span>
                  <span className={styles.preferenceSub}>
                    {appointment.doctor}
                  </span>
                </div>
              </button>

              {/* Request different doctor */}
              <button
                type="button"
                className={`${styles.preferenceBtn} ${keepDoctor === false ? styles.preferenceBtnActive : ""}`}
                onClick={() => setKeepDoctor(false)}
              >
                <div
                  className={`${styles.customCheck} ${keepDoctor === false ? styles.customCheckActive : ""}`}
                />
                <div className={styles.preferenceText}>
                  <span className={styles.preferenceMain}>
                    Request a different doctor
                  </span>
                  <span className={styles.preferenceSub}>
                    Admin will assign a new RPm
                  </span>
                </div>
              </button>

              {/* Reason dropdown — shows when "different doctor" selected */}
              {keepDoctor === false && (
                <div className={styles.reasonBlock}>
                  <label className={styles.reasonLabel}>
                    Reason for Change
                  </label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.reasonSelect}
                      value={changeReason}
                      onChange={(e) => {
                        setChangeReason(e.target.value);
                        setOtherReason("");
                      }}
                    >
                      <option value="">Select a reason...</option>
                      {DOCTOR_CHANGE_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className={styles.selectIcon} />
                  </div>

                  {/* Other text field */}
                  {changeReason === "Other" && (
                    <textarea
                      className={styles.otherTextarea}
                      placeholder="Please describe your reason..."
                      value={otherReason}
                      maxLength={300}
                      onChange={(e) => setOtherReason(e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ STEP 2 — Payment ══════════════ */}
          {step === 2 && (
            <div className={styles.stepCard}>
              <div className={styles.stepCardTitle}>Payment</div>
              <PaymentForm
                doctorData={{ name: appointment.doctor }}
                consultationFee={appointment.sessionFee || 800}
                profileData={{}}
                paymentData={paymentData}
                setPaymentData={setPaymentData}
                bookingPolicyAgreed={bookingPolicyAgreed}
                onOpenBookingPolicy={() => setBookingPolicyModal(true)}
                hideDatetime={true}
              />
            </div>
          )}
        </div>
        <div className={styles.footerSpacer} />
      </div>

      {/* ── Sticky Footer ── */}
      <div className={styles.stickyFooter}>
        <div className={styles.footerInner}>
          {" "}
          {/* ← wrapper */}
          {step === 2 && (
            <button className={styles.cancelBtn} onClick={() => setStep(1)}>
              Back
            </button>
          )}
          <button
            className={`${styles.continueBtn} ${getStepError() ? styles.continueBtnDisabled : ""}`}
            disabled={!!getStepError()}
            onClick={handleNext}
          >
            {step === 2 ? "Submit Request" : "Continue"}
          </button>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      <Modal
        show={confirmModal}
        onHide={() => setConfirmModal(false)}
        centered
        contentClassName={styles.confirmModalContent}
      >
        <Modal.Body className={styles.confirmModalBody}>
          <div className={styles.confirmIconWrapper}>
            <FiCheckCircle className={styles.confirmIcon} />
          </div>
          <p className={styles.confirmTitle}>Almost Done!</p>
          <p className={styles.confirmMessage}>
            You're about to submit your next session request. The admin will
            confirm your schedule shortly.
          </p>
          <div className={styles.confirmActions}>
            <button
              className={styles.confirmBtnBack}
              onClick={() => setConfirmModal(false)}
            >
              CANCEL
            </button>
            <button
              className={styles.confirmBtnConfirm}
              onClick={() => {
                setConfirmModal(false);
                onSuccess();
              }}
            >
              YES, CONFIRM
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ── Error Modal ── */}
      <Modal
        show={errorModal.show}
        onHide={() => setErrorModal({ show: false, message: "" })}
        centered
        size="sm"
        contentClassName={styles.errorModalContent}
      >
        <Modal.Body className={styles.errorModalBody}>
          <div className={styles.errorIconWrapper}>
            <svg
              className={styles.errorIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
            >
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
          </div>
          <p className={styles.errorTitle}>Incomplete Form</p>
          <p className={styles.errorMessage}>{errorModal.message}</p>
          <button
            className={styles.errorBtn}
            onClick={() => setErrorModal({ show: false, message: "" })}
          >
            Got it
          </button>
        </Modal.Body>
      </Modal>

      <PolicyModal
        show={bookingPolicyModal}
        initialAgreed={bookingPolicyAgreed}
        onHide={() => setBookingPolicyModal(false)}
        onConfirm={() => {
          setBookingPolicyModal(false);
          setBookingPolicyAgreed(true);
        }}
        headerTitle="Therapy Appointment, Cancellation & Rebooking Policy"
        headerSubtitle="All parties are advised to carefully review this policy."
        sections={BOOKING_POLICY_SECTIONS}
        radioLabel={BOOKING_POLICY_RADIO_LABEL}
        requireScroll
        confirmLabel="I Agree"
        cancelLabel="Back"
        size="lg"
      />
    </div>
  );
};

export default BookNextSession;

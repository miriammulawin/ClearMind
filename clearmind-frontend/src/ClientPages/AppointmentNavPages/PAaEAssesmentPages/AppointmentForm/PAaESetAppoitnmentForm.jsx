// PAaESetAppointmentForm.jsx
// Route: /client/appointment/psychological-assessment/set-appointment-form
// Receives: location.state.selectedService (string title from PAaEAppointment)

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal } from "react-bootstrap";
import PolicyModal from "../../AppointmentComponents/PolicyModal.jsx";
import {
  BOOKING_POLICY_SECTIONS,
  BOOKING_POLICY_RADIO_LABEL,
  DECLARATION_SECTIONS,
  DECLARATION_RADIO_LABEL,
} from "../../AppointmentComponents/PolicyModalContent.js";
import { FiCheckCircle } from "react-icons/fi";

import styles from "../../PAaEAssesmentPages/style/PAaEAppointmentForm.module.css";
import { useCurrentUser } from "../../../../hooks/userCurrentUser";

import PAaEFormHeader from "../AppointmentForm/PAaEFormHeader";
import VerifyProfileForm from "../../PaCAssesmentPages/AppointmentForm/VerifyProfileForm";
import PAaEChooseRPm from "../AppointmentForm/PAaEChooseRPm";
import PAeEDocuments from "../AppointmentForm/PAaEDocuments";
import PAeEPayment from "../../AppointmentComponents/PaymentForm";
import AppointmentSuccessScreen from "../../AppointmentComponents/AppointmentSuccessScreen.jsx";
import PreEmploymentDetails from "./PreEmploymentDetails";
import PreEmploymentPayment from "./PreEmploymentPayment";
import EsaTravelDiagnosis from "./EsaTravelDiagnosis";
import InternshipDetails from "./InternshipDetails";
import { buildPaymentProps } from "./PAaEHelpers.jsx";
/* -----------------------------------------------------------------
   Fee constants
------------------------------------------------------------------ */
const BASE_FEES = {
  "Pre-Employment Purpose": 3000,
};
const PRINTED_REPORT_FEE = 1500; // ← updated from 500 to 1500

const PAAE_SERVICE_FEES = {
  "VAWC Purpose": 3000,
  "Adoption or Other Legal Purposes": 3000,
  "School / Academic Support": 2500,
  "Work-related Purpose": 3000,
  "Pre-Employment Purpose": 3000,
  "Emotional Support Animal (ESA) Certification": 3000,
  "Mental Health Certification for Internship": 3000,
};

/* -----------------------------------------------------------------
   Services Config
------------------------------------------------------------------ */
const SERVICE_CONFIG = {
  "VAWC Purpose": {
    steps: ["Verify Profile", "Choose RPm", "Documents", "Payment"],
    femaleOnly: true,
    mandatoryDocs: ["Blotter Report", "Police Report"],
    optionalDocs: [],
    hasPayment: true,
    refPrefix: "VAWC",
  },
  "Adoption or Other Legal Purposes": {
    steps: ["Verify Profile", "Choose RPm", "Documents", "Payment"],
    femaleOnly: false,
    mandatoryDocs: ["RACO or CSWD Endorsement"],
    optionalDocs: [],
    hasPayment: true,
    refPrefix: "LEGAL",
    extraField: "legalType",
  },
  "School / Academic Support": {
    steps: ["Verify Profile", "Choose RPm", "Documents", "Payment"],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: ["Incident Report (if applicable)"],
    hasPayment: true,
    refPrefix: "SCHL",
    extraField: "school",
  },
  "Work-related Purpose": {
    steps: ["Verify Profile", "Choose RPm", "Payment"],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: [],
    hasPayment: true,
    refPrefix: "WORK",
    extraField: "company",
  },
  // ── Pre-Employment ────────────────────────────────────────────
  "Pre-Employment Purpose": {
    steps: ["Verify Profile", "Choose RPm", "Payment"],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: [],
    hasPayment: true,
    refPrefix: "PREE",
    extraField: "preEmployment",
    baseFee: BASE_FEES["Pre-Employment Purpose"], // 3000
    printedReportFee: PRINTED_REPORT_FEE, // 1500
  },
  // ── ESA ───────────────────────────────────────────────────────
  "Emotional Support Animal (ESA) Certification": {
    steps: ["Verify Profile", "Choose RPm", "Payment"],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: [],
    hasPayment: true,
    refPrefix: "ESA",
    extraField: "esa",
  },
  // ── Mental Health Certification for Internship ────────────────
  "Mental Health Certification for Internship": {
    steps: ["Verify Profile", "Choose RPm", "Payment"],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: ["Incident Report (if applicable)"],
    hasPayment: true,
    refPrefix: "MHCI",
    extraField: "internship",
  },
};

/* =================================================================
   MAIN COMPONENT
================================================================= */
const PAaESetAppointmentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();

  const serviceTitle = location.state?.selectedService || "VAWC Purpose";
  const config = SERVICE_CONFIG[serviceTitle] || SERVICE_CONFIG["VAWC Purpose"];

  const [declarationModal, setDeclarationModal] = useState(false);
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const hasOpenedDeclaration = useRef(false);

  useEffect(() => {
    if (location.state?.showDeclaration && !hasOpenedDeclaration.current) {
      hasOpenedDeclaration.current = true;
      setTimeout(() => setDeclarationModal(true), 200);
    }
  }, []);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    patientType: "New Patient",
    classification: "Regular",
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingPolicyModal, setBookingPolicyModal] = useState(false);
  const [bookingPolicyAgreed, setBookingPolicyAgreed] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });

  const totalSteps = config.steps.length;
  const isLastStep = step === totalSteps;
  const currentLabel = config.steps[step - 1];

  /* ── Validation ────────────────────────────────────────────── */
  const getStepError = () => {
    // ── Verify Profile ─────────────────────────────────────────
    if (currentLabel === "Verify Profile") {
      if (!declarationAgreed)
        return "Please agree to the Declaration of Participation.";

      if (form.isInformant) {
        if (!form.complainantName) return "Please enter your full name.";
        if (!form.complainantRelation)
          return "Please enter your relation to the patient.";
        if (!form.firstName) return "Please enter the patient's first name.";
        if (!form.lastName) return "Please enter the patient's last name.";
        if (!form.sex) return "Please select the patient's sex.";
        if (!form.dateOfBirth)
          return "Please enter the patient's date of birth.";
        if (form.age === "0" || form.age === "")
          return "Patient must be at least 1 year old.";
        if (!form.contactNo)
          return "Please enter the patient's contact number.";
        if (!form.email) return "Please enter the patient's email address.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email))
          return "Please enter a valid email address.";
        if (!form.address) return "Please enter the patient's home address.";
      }
    }

    // ── Choose RPm ─────────────────────────────────────────────
    if (currentLabel === "Choose RPm") {
      if (!form.rpm) return "Please select an RPm / Psychometrician.";

      // ESA-specific
      if (config.extraField === "esa") {
        if (!form.travelType)
          return "Please select a travel type (Local or International).";
        if (form.hasDiagnosis === undefined)
          return "Please indicate whether there is an existing diagnosis.";
        if (form.hasDiagnosis === true && !form.diagnosisFile)
          return "Please attach the diagnosis document (PDF).";
      }

      // Pre-Employment specific
      if (config.extraField === "preEmployment") {
        if (!form.employerName?.trim())
          return "Please enter the name of the employer or company.";
      }

      // Internship specific
      if (config.extraField === "internship") {
        if (!form.schoolName?.trim())
          return "Please enter the name of the school or university.";
        if (!form.program?.trim()) return "Please enter the program or course.";
      }
    }

    // ── Documents ──────────────────────────────────────────────
    if (currentLabel === "Documents") {
      const missing = config.mandatoryDocs.filter(
        (d) => !(form.docFiles || {})[d],
      );
      if (missing.length > 0) return `Please upload: ${missing.join(", ")}.`;
    }

    // ── Payment — Pre-Employment ───────────────────────────────
    if (currentLabel === "Payment" && config.extraField === "preEmployment") {
      if (form.wantsPrintedReport === undefined)
        return "Please indicate whether you want the printed psychological report.";
      if (!form.payMethod) return "Please select a payment method.";
      if (!form.proofFile) return "Please upload your proof of payment.";
    }

    // ── Payment — Standard ─────────────────────────────────────
    if (currentLabel === "Payment" && config.extraField !== "preEmployment") {
      if (!form.payMethod) return "Please select a payment method.";
      if (!form.proofFile) return "Please upload your proof of payment.";
    }

    return "";
  };

  /* ── Navigation ────────────────────────────────────────────── */
  const handleNext = () => {
    const err = getStepError();
    if (err) {
      setErrorModal({ show: true, message: err });
      return;
    }
    const nextLabel = config.steps[step];
    if (nextLabel === "Payment" && !bookingPolicyAgreed) {
      setBookingPolicyModal(true);
      return;
    }
    if (isLastStep) setConfirmModal(true);
    else setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else navigate("/client/appointment/psychological-assessment");
  };

  const handleConfirm = () => {
    setConfirmModal(false);
    setSubmitted(true);
  };

  /* ── Step renderer ─────────────────────────────────────────── */
  const renderStep = () => {
    if (currentLabel === "Verify Profile")
      return (
        <VerifyProfileForm
          formData={form}
          setFormData={setForm}
          declarationAgreed={declarationAgreed}
          onOpenDeclaration={() => setDeclarationModal(true)}
        />
      );
    // Pre-Employment details
    if (currentLabel === "Details" && config.extraField === "preEmployment")
      return <PreEmploymentDetails form={form} setForm={setForm} user={user} />;

    // Internship details
    if (currentLabel === "Details" && config.extraField === "internship")
      return <InternshipDetails form={form} setForm={setForm} user={user} />;

    // ESA travel & diagnosis
    if (currentLabel === "Travel & Diagnosis")
      return <EsaTravelDiagnosis form={form} setForm={setForm} user={user} />;

    // Choose RPm
    if (currentLabel === "Choose RPm")
      return (
        <PAaEChooseRPm
          config={config}
          form={form}
          setForm={setForm}
          selectedDoctor={selectedDoctor}
          onDoctorSelect={(doc) => {
            setSelectedDoctor(doc);
            setForm((f) => ({ ...f, selectedRpm: doc }));
          }}
        />
      );

    // Documents
    if (currentLabel === "Documents")
      return <PAeEDocuments config={config} form={form} setForm={setForm} />;

    // Payment — Pre-Employment (with report toggle)
    if (currentLabel === "Payment" && config.extraField === "preEmployment")
      return (
        <PreEmploymentPayment
          config={config}
          form={form}
          setForm={setForm}
          bookingPolicyAgreed={bookingPolicyAgreed}
          onOpenBookingPolicy={() => setBookingPolicyModal(true)}
        />
      );

    // Payment — Standard
    if (currentLabel === "Payment") {
      const fee = PAAE_SERVICE_FEES[serviceTitle] ?? 0;
      const paymentProps = buildPaymentProps(
        form,
        setForm,
        config,
        fee,
        bookingPolicyAgreed,
        () => setBookingPolicyModal(true),
      );
      return <PAeEPayment {...paymentProps} />;
    }

    return null;
  };

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div className={styles.pageWrapper}>
      <PAaEFormHeader
        serviceTitle={serviceTitle}
        steps={config.steps}
        currentStep={step}
        onBack={handleBack}
      />

      <div className={styles.scrollContent}>
        {submitted ? (
          <AppointmentSuccessScreen
            serviceTitle={serviceTitle}
            refPrefix={config.refPrefix}
            onBack={() =>
              navigate("/client/appointment/psychological-assessment")
            }
          />
        ) : (
          renderStep()
        )}
        <div className={styles.footerSpacer} />
      </div>

      {/* ── Sticky Footer Buttons ── */}
      {!submitted && (
        <div className={styles.stickyFooter}>
          {isLastStep && (
            <button
              className={styles.cancelButton}
              onClick={() =>
                navigate("/client/appointment/psychological-assessment")
              }
            >
              Cancel
            </button>
          )}
          <button
            className={`${styles.continueButton} ${
              getStepError() ? styles.continueDisabled : ""
            }`}
            disabled={!!getStepError()}
            onClick={handleNext}
          >
            {isLastStep ? "Submit Appointment" : "Continue"}
          </button>
        </div>
      )}

      {/* ── Confirm Modal ── */}
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
            You're about to submit your appointment request. Would you like to
            continue?
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
              onClick={handleConfirm}
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
          <button
            className={styles.errorModalBtn}
            onClick={() => setErrorModal({ show: false, message: "" })}
          >
            Got it
          </button>
        </Modal.Body>
      </Modal>

      {/* ── Booking & Cancellation Policy Modal ── */}
      <PolicyModal
        show={bookingPolicyModal}
        initialAgreed={bookingPolicyAgreed}
        onHide={() => setBookingPolicyModal(false)}
        onConfirm={() => {
          setBookingPolicyModal(false);
          setBookingPolicyAgreed(true);
          if (currentLabel !== "Payment") {
            setStep((s) => s + 1);
          }
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

      {/* ── Declaration Modal ── */}
      <PolicyModal
        show={declarationModal}
        initialAgreed={declarationAgreed}
        onHide={() => setDeclarationModal(false)}
        onConfirm={() => {
          setDeclarationModal(false);
          setDeclarationAgreed(true);
        }}
        headerTitle="Declaration of Participation"
        headerSubtitle="Please read carefully and acknowledge before continuing."
        sections={DECLARATION_SECTIONS}
        radioLabel={DECLARATION_RADIO_LABEL}
        confirmLabel="Continue"
        cancelLabel="Cancel"
        size="md"
      />
    </div>
  );
};

export default PAaESetAppointmentForm;

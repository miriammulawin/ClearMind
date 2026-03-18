// PAaESetAppointmentForm.jsx
// Route: /client/appointment/psychological-assessment/set-appointment-form
// Receives: location.state.selectedService (string title from PAaEAppointment)

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { FiCheckCircle } from 'react-icons/fi';
import styles from '../../../ClientStyle/PAaEAppointmentForm.module.css';
import { useCurrentUser } from '../../../../hooks/userCurrentUser';
import PAaEFormHeader  from './PAaEFormHeader';
import PAaEReason      from './PAaEReason';
import PAaEChooseRPm   from './PAaEChooseRPm';
import PAeEDocuments   from './PAaEDocuments';
import PAeEPayment     from './PAaEPayment';

/* -----------------------------------------------------------------
   Services Config
------------------------------------------------------------------ */
const SERVICE_CONFIG = {
  'VAWC Purpose': {
    steps: ['Reason', 'Choose RPm', 'Documents', 'Payment'],
    femaleOnly: true,
    mandatoryDocs: ['Blotter Report', 'Police Report'],
    optionalDocs: [],
    hasPayment: true,
    refPrefix: 'VAWC',
  },
  'Adoption or Other Legal Purposes': {
    steps: ['Reason', 'Choose RPm', 'Documents', 'Payment'],
    femaleOnly: false,
    mandatoryDocs: ['RACO or CSWD Endorsement'],
    optionalDocs: [],
    hasPayment: true,
    refPrefix: 'LEGAL',
    extraField: 'legalType',
  },
  'School / Academic Support': {
    steps: ['Reason', 'Choose RPm', 'Documents', 'Payment'],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: ['Incident Report (if applicable)'],
    hasPayment: true,
    refPrefix: 'SCHL',
    extraField: 'school',
  },
  'Work-related Purpose': {
    steps: ['Reason', 'Choose RPm', 'Payment'],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: [],
    hasPayment: true,
    refPrefix: 'WORK',
    extraField: 'company',
  },
  'Pre-Employment Purpose': {
    steps: ['Reason', 'Submit'],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: [],
    hasPayment: false,
    refPrefix: 'PREE',
    extraField: 'company',
  },
  'Emotional Support Animal (ESA) Certification': {
    steps: ['Reason', 'Submit'],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: [],
    hasPayment: false,
    refPrefix: 'ESA',
  },
  'Mental Health Certification': {
    steps: ['Reason', 'Submit'],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: [],
    hasPayment: false,
    refPrefix: 'MHC',
    extraField: 'institution',
  },
};

/* -----------------------------------------------------------------
   Success Screen (small enough to stay here)
------------------------------------------------------------------ */
function SuccessScreen({ config, serviceTitle, onBack }) {
  const ref = `${config.refPrefix}-2026-${String(Math.floor(Math.random() * 9000) + 1000).padStart(5, '0')}`;
  return (
    <div className={styles.stepCard}>
      <div className={styles.successScreen}>
        <div className={styles.successIcon}>✅</div>
        <div className={styles.successTitle}>Appointment Submitted!</div>
        <p className={styles.successMsg}>
          Your <strong>{serviceTitle}</strong> appointment request has been received
          and is now awaiting admin approval.
        </p>
        <div className={styles.refBadge}>REF# {ref}</div>
        <br />
        <div className={styles.pendingNote}>
          ⏳ Track your appointment under <strong>My Appointments → Pending</strong> tab.
        </div>
      </div>
      <div className={styles.btnRow}>
        <button className={styles.btnOutline} onClick={onBack}>
          <FaArrowLeft /> Back to Services
        </button>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   Main Component
------------------------------------------------------------------ */
const PAaESetAppointmentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = useCurrentUser();

  const serviceTitle = location.state?.selectedService || 'VAWC Purpose';
  const config       = SERVICE_CONFIG[serviceTitle] || SERVICE_CONFIG['VAWC Purpose'];

  const [step,           setStep]           = useState(1);
  const [submitted,      setSubmitted]      = useState(false);
  const [form,           setForm]           = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [confirmModal,   setConfirmModal]   = useState(false);
  const [errorModal,     setErrorModal]     = useState({ show: false, message: '' });

  const totalSteps   = config.steps.length;
  const isLastStep   = step === totalSteps;
  const currentLabel = config.steps[step - 1];

  // ── Validation ────────────────────────────────────────────────
  const getStepError = () => {
    if (currentLabel === 'Reason' || currentLabel === 'Submit') {
      if (!form.reason) return 'Please enter your reason for consultation.';
      if (!config.steps.includes('Choose RPm')) {
        if (!form.date) return 'Please select a preferred date.';
        if (!form.time) return 'Please select a time slot.';
      }
    }
    if (currentLabel === 'Choose RPm') {
      if (!form.rpm)  return 'Please select an RPm / Psychometrician.';
      if (!form.date) return 'Please select a preferred date.';
      if (!form.time) return 'Please select a time slot.';
    }
    if (currentLabel === 'Documents') {
      const missing = config.mandatoryDocs.filter(d => !(form.docFiles || {})[d]);
      if (missing.length > 0) return `Please upload: ${missing.join(', ')}.`;
    }
    if (currentLabel === 'Payment') {
      if (!form.payMethod) return 'Please select a payment method.';
      if (!form.proofFile) return 'Please upload your proof of payment.';
    }
    return '';
  };

  // ── Navigation ────────────────────────────────────────────────
  const handleNext = () => {
    const err = getStepError();
    if (err) { setErrorModal({ show: true, message: err }); return; }
    if (isLastStep) setConfirmModal(true);
    else setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    else navigate(-1);
  };

  // ── Step renderer ─────────────────────────────────────────────
  const renderStep = () => {
    if (currentLabel === 'Reason' || currentLabel === 'Submit')
      return (
        <PAaEReason
          config={config}
          form={form}
          setForm={setForm}
          user={user}
        />
      );
    if (currentLabel === 'Choose RPm')
      return (
        <PAaEChooseRPm
          config={config}
          form={form}
          setForm={setForm}
          selectedDoctor={selectedDoctor}
          onDoctorSelect={setSelectedDoctor}
        />
      );
    if (currentLabel === 'Documents')
      return (
        <PAeEDocuments
          config={config}
          form={form}
          setForm={setForm}
        />
      );
    if (currentLabel === 'Payment')
      return (
        <PAeEPayment
          form={form}
          setForm={setForm}
        />
      );
    return null;
  };

  return (
    <div className={styles.pageWrapper}>

      {/* ── Header (sticky) ── */}
      <PAaEFormHeader
        serviceTitle={serviceTitle}
        steps={config.steps}
        currentStep={step}
        onBack={handleBack}
      />

      {/* ── Scrollable body ── */}
      <div className={styles.scrollContent}>
        {submitted
          ? <SuccessScreen config={config} serviceTitle={serviceTitle} onBack={() => navigate(-1)} />
          : renderStep()
        }
        <div className={styles.footerSpacer} />
      </div>

      {/* ── Sticky footer ── */}
      {!submitted && (
        <div className={styles.stickyFooter}>
          {step > 1 && (
            <button className={styles.cancelButton} onClick={handleBack}>
              <FaArrowLeft size={12} /> Back
            </button>
          )}
          <button
            className={`${styles.continueButton} ${getStepError() ? styles.continueDisabled : ''}`}
            disabled={!!getStepError()}
            onClick={handleNext}
          >
            {isLastStep ? 'Submit Appointment' : 'Continue'}
          </button>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      <Modal
        show={confirmModal}
        onHide={() => setConfirmModal(false)}
        centered size="sm"
        contentClassName={styles.confirmModalContent}
      >
        <Modal.Body className={styles.confirmModalBody}>
          <div className={styles.confirmModalIconWrapper}>
            <FiCheckCircle className={styles.confirmModalIcon} />
          </div>
          <p className={styles.confirmModalTitle}>Almost Done!</p>
          <p className={styles.confirmModalMessage}>
            You're about to submit your appointment request. Would you like to continue?
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
              onClick={() => { setConfirmModal(false); setSubmitted(true); }}
            >
              YES, CONFIRM
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ── Error Modal ── */}
      <Modal
        show={errorModal.show}
        onHide={() => setErrorModal({ show: false, message: '' })}
        centered size="sm"
        contentClassName={styles.errorModalContent}
      >
        <Modal.Body className={styles.errorModalBody}>
          <div className={styles.errorModalIconWrapper}>
            <svg className={styles.errorModalIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
            </svg>
          </div>
          <p className={styles.errorModalTitle}>Incomplete Form</p>
          <p className={styles.errorModalMessage}>{errorModal.message}</p>
          <button
            className={styles.errorModalBtn}
            onClick={() => setErrorModal({ show: false, message: '' })}
          >
            Got it
          </button>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default PAaESetAppointmentForm;
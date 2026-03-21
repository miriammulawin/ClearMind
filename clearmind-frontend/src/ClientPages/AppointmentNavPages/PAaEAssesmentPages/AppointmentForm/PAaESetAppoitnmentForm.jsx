// PAaESetAppointmentForm.jsx
// Route: /client/appointment/psychological-assessment/set-appointment-form
// Receives: location.state.selectedService (string title from PAaEAppointment)
//
// Folder structure expected:
//   AppointmentForm/
//     PAaEFormHeader.jsx
//     PAaEReason.jsx
//     PAaEChooseRPm.jsx
//     PAeEDocuments.jsx
//     PAeEPayment.jsx

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { FiCheckCircle } from 'react-icons/fi';
<<<<<<< HEAD
import { FaArrowLeft } from 'react-icons/fa';
=======
>>>>>>> 83030e3 (- Changing the Profile form for PAC and PAaE services)

import styles from '../../PAaEAssesmentPages/style/PAaEAppointmentForm.module.css';
import { useCurrentUser } from '../../../../hooks/userCurrentUser';

import PAaEFormHeader  from '../AppointmentForm/PAaEFormHeader';
import PAaEReason      from '../AppointmentForm/PAaEReason';
import PAaEChooseRPm   from '../AppointmentForm/PAaEChooseRPm';
import PAeEDocuments   from '../AppointmentForm/PAaEDocuments';
import PAeEPayment     from '../../PaCAssesmentPages/AppointmentForm/PaymentForm';
<<<<<<< HEAD

/* -----------------------------------------------------------------
   Fee constants
------------------------------------------------------------------ */
const BASE_FEES = {
  'Pre-Employment Purpose': 3000,
};
const PRINTED_REPORT_FEE = 500;
=======
>>>>>>> 83030e3 (- Changing the Profile form for PAC and PAaE services)

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
  'Psychological Assessment and Evaluation': {
    steps: ['Reason', 'Choose RPm', 'Payment'],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: [],
    hasPayment: true,
    refPrefix: 'PAE',
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
    steps: ['Details', 'Choose RPm', 'Payment'],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: [],
    hasPayment: true,
    refPrefix: 'PREE',
    extraField: 'preEmployment',
    baseFee: BASE_FEES['Pre-Employment Purpose'],
    printedReportFee: PRINTED_REPORT_FEE,
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
  'Mental Health Certification for Internship': {
    steps: ['Details', 'Choose RPm', 'Documents', 'Payment'],
    femaleOnly: false,
    mandatoryDocs: [],
    optionalDocs: ['Incident Report (if applicable)'],
    hasPayment: true,
    refPrefix: 'MHCI',
    extraField: 'internship',
  },
};

/* -----------------------------------------------------------------
   Helper — build the props PaymentForm expects from PAaE's flat form

   Key fix:
     PAaEChooseRPm stores handleSetDate's dateSlot object directly into
     form.date (e.g. { date: "April 5, 2026", day: "Saturday" }).
     PaymentForm expects selectedDate = { date, day }.
     So we pass form.date AS-IS — do NOT wrap it again.
------------------------------------------------------------------ */
function buildPaymentProps(form, setForm, consultationFee) {
  // ── Doctor / RPm ──────────────────────────────────────────────
  const doctorData = form.selectedRpm || { name: form.rpm || '—' };

  // ── Date — form.date is already the dateSlot object { date, day } ──
  const selectedDate = form.date ?? {};

  // ── Time ──────────────────────────────────────────────────────
  const selectedTime = form.time || '';

  // ── Consultation mode ─────────────────────────────────────────
  const modeMap = { Virtual: 'ONLINE', Onsite: 'IN-PERSON', Both: 'IN-PERSON' };
  const consultationMode = modeMap[form.mode] || 'IN-PERSON';

  // ── Profile data ──────────────────────────────────────────────
  const profileData = {
    isInformant:         form.isInformant         || false,
    complainantName:     form.complainantName     || '',
    complainantRelation: form.complainantRelation || '',
    firstName:           form.firstName           || '',
    middleName:          form.middleName          || '',
    lastName:            form.lastName            || '',
    dateOfBirth:         form.dateOfBirth         || '',
    age:                 form.age                 || '',
    sex:                 form.sex                 || '',
    contactNo:           form.contactNo           || '',
    email:               form.email               || '',
    address:             form.address             || '',
    patientType:         form.patientType     || '',
    classification:      form.classification  || '',
    reason:              form.reason          || '',
  };

  // ── Payment data ──────────────────────────────────────────────
  // PaymentForm uses { paymentMode, referenceNo, receiptFile }
  // PAaE validation reads form.payMethod and form.proofFile — kept in sync.
  const paymentData = {
    paymentMode: form.payMethod   || 'G-Cash',
    referenceNo: form.referenceNo || '',
    receiptFile: form.proofFile   || null,
  };

  const setPaymentData = (updater) => {
    setForm(prev => {
      const current = {
        paymentMode: prev.payMethod   || 'G-Cash',
        referenceNo: prev.referenceNo || '',
        receiptFile: prev.proofFile   || null,
      };
      const next = typeof updater === 'function' ? updater(current) : updater;
      return {
        ...prev,
        payMethod:   next.paymentMode ?? prev.payMethod,
        referenceNo: next.referenceNo  ?? prev.referenceNo,
        proofFile:   next.receiptFile  ?? prev.proofFile,
      };
    });
  };

  return {
    doctorData,
    selectedDate,       // ← { date: "April 5, 2026", day: "Saturday" }  (not re-wrapped)
    selectedTime,
    consultationMode,
    consultationFee,
    profileData,
    paymentData,
    setPaymentData,
  };
}

/* -----------------------------------------------------------------
   Pre-Employment Details Step
------------------------------------------------------------------ */
function PreEmploymentDetails({ form, setForm }) {
  return (
    <div className={styles.stepCard}>
      <div className={styles.field}>
        <label className={styles.label}>
          Name of Employer / Company <span className={styles.req}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. ABC Corporation"
          value={form.employerName || ''}
          onChange={e => setForm(f => ({ ...f, employerName: e.target.value }))}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Purpose of Assessment <span className={styles.req}>*</span>
        </label>
        <textarea
          className={styles.textarea}
          placeholder="Briefly describe the purpose of this pre-employment assessment..."
          value={form.assessmentPurpose || ''}
          maxLength={500}
          onChange={e => setForm(f => ({ ...f, assessmentPurpose: e.target.value }))}
        />
        <div className={`${styles.charCount} ${(form.assessmentPurpose || '').length > 450 ? styles.charCountWarn : ''}`}>
          {(form.assessmentPurpose || '').length}/500
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   Mental Health Certification for Internship — Details Step
------------------------------------------------------------------ */
function InternshipDetails({ form, setForm }) {
  return (
    <div className={styles.stepCard}>
      <div className={styles.field}>
        <label className={styles.label}>
          Name of School / University <span className={styles.req}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. University of the Philippines"
          value={form.schoolName || ''}
          onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Program / Course <span className={styles.req}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. BS Psychology"
          value={form.program || ''}
          onChange={e => setForm(f => ({ ...f, program: e.target.value }))}
        />
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   Pre-Employment Payment Step
   — disclaimer + printed-report toggle + fee summary + PaymentForm
------------------------------------------------------------------ */
function PreEmploymentPayment({ config, form, setForm }) {
  const baseFee     = config.baseFee          || 3000;
  const reportFee   = config.printedReportFee || 500;
  const wantsReport = form.wantsPrintedReport === true;
  const totalFee    = baseFee + (wantsReport ? reportFee : 0);

  const paymentProps = buildPaymentProps(form, setForm, totalFee);

  return (
    <div className={styles.stepCard}>

      {/* ── Disclaimer ── */}
      <div className={styles.infoBanner} style={{ marginBottom: '16px' }}>
        <span className={styles.bannerIcon}>ℹ️</span>
        <span>
          <strong>Disclaimer:</strong> This service covers <strong>test administration only</strong>.
          The fee below applies to the psychological test session.
          An official printed psychological report (evaluation) is a separate deliverable
          and may require an additional fee.
        </span>
      </div>

      {/* ── Printed Report Toggle ── */}
      <div className={styles.field}>
        <label className={styles.label}>
          Would you like to receive the official printed psychological report (evaluation)?
        </label>

        <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
          {/* YES */}
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, wantsPrintedReport: true }))}
            style={{
              flex: '1', minWidth: '120px', padding: '10px 14px',
              borderRadius: '10px',
              border: `2px solid ${wantsReport ? '#5B2C91' : '#ddd0f0'}`,
              background: wantsReport ? '#f3eeff' : '#fff',
              color: wantsReport ? '#5B2C91' : '#9b8ab0',
              fontWeight: wantsReport ? 700 : 500,
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 'clamp(13px,3vw,14px)', transition: 'all 0.18s ease',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <span style={{ fontSize: '16px' }}>{wantsReport ? '✅' : '⬜'}</span>
            Yes — include printed report
            <span style={{
              marginLeft: 'auto', background: '#ede8f7', color: '#5B2C91',
              borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 700,
            }}>
              +₱{reportFee.toLocaleString()}
            </span>
          </button>

          {/* NO */}
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, wantsPrintedReport: false }))}
            style={{
              flex: '1', minWidth: '120px', padding: '10px 14px',
              borderRadius: '10px',
              border: `2px solid ${form.wantsPrintedReport === false ? '#5B2C91' : '#ddd0f0'}`,
              background: form.wantsPrintedReport === false ? '#f3eeff' : '#fff',
              color: form.wantsPrintedReport === false ? '#5B2C91' : '#9b8ab0',
              fontWeight: form.wantsPrintedReport === false ? 700 : 500,
              cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 'clamp(13px,3vw,14px)', transition: 'all 0.18s ease',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <span style={{ fontSize: '16px' }}>{form.wantsPrintedReport === false ? '✅' : '⬜'}</span>
            No — test administration only
          </button>
        </div>
      </div>

      {/* ── Fee Summary ── */}
      {form.wantsPrintedReport !== undefined && (
        <div className={styles.payDetailBox} style={{ marginBottom: '16px' }}>
          <div className={styles.payRow}>
            <span className={styles.payRowLabel}>Test Administration</span>
            <span className={styles.payRowVal}>₱{baseFee.toLocaleString()}</span>
          </div>
          {wantsReport && (
            <div className={styles.payRow}>
              <span className={styles.payRowLabel}>Printed Psychological Report</span>
              <span className={styles.payRowVal}>+₱{reportFee.toLocaleString()}</span>
            </div>
          )}
          <div className={styles.payRow} style={{ borderTop: '2px solid #ddd0f0', marginTop: '4px', paddingTop: '8px' }}>
            <span className={styles.payRowLabel} style={{ fontWeight: 700, color: '#1a1a1a' }}>Total</span>
            <span className={styles.payRowVal} style={{ color: '#5B2C91', fontSize: '15px' }}>
              ₱{totalFee.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* ── PaymentForm with all required props ── */}
      <PAeEPayment {...paymentProps} />
    </div>
  );
}

/* -----------------------------------------------------------------
   Success Screen
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
  const [form,           setForm]           = useState({
    patientType:    'New Patient',
    classification: 'Regular',
  });
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [confirmModal,   setConfirmModal]   = useState(false);
  const [errorModal,     setErrorModal]     = useState({ show: false, message: '' });

  const totalSteps   = config.steps.length;
  const isLastStep   = step === totalSteps;
  const currentLabel = config.steps[step - 1];

  // ── Validation ────────────────────────────────────────────────
  const getStepError = () => {

<<<<<<< HEAD
    if (currentLabel === 'Details' && config.extraField === 'preEmployment') {
      if (!form.employerName?.trim())      return 'Please enter the name of the employer or company.';
      if (!form.assessmentPurpose?.trim()) return 'Please enter the purpose of the assessment.';
    }

    if (currentLabel === 'Details' && config.extraField === 'internship') {
      if (!form.schoolName?.trim()) return 'Please enter the name of the school or university.';
      if (!form.program?.trim())    return 'Please enter the program or course.';
    }

=======
>>>>>>> 83030e3 (- Changing the Profile form for PAC and PAaE services)
    if (currentLabel === 'Reason' || currentLabel === 'Submit') {
      // ── Reason is always required ──
      if (!form.reason) return 'Please enter your reason for consultation.';

<<<<<<< HEAD
=======
      // ── Complainant mode: validate all manual patient fields ──
>>>>>>> 83030e3 (- Changing the Profile form for PAC and PAaE services)
      if (form.isInformant) {
        if (!form.complainantName)     return 'Please enter your full name.';
        if (!form.complainantRelation) return 'Please enter your relation to the patient.';
        if (!form.firstName)           return "Please enter the patient's first name.";
        if (!form.lastName)            return "Please enter the patient's last name.";
        if (!form.sex)                 return "Please select the patient's sex.";
        if (!form.dateOfBirth)         return "Please enter the patient's date of birth.";
        if (form.age === '0' || form.age === '') return 'Patient must be at least 1 year old.';
        if (!form.contactNo)           return "Please enter the patient's contact number.";
        if (!form.email)               return "Please enter the patient's email address.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) return 'Please enter a valid email address (e.g. juan@email.com).';
        if (!form.address)             return "Please enter the patient's home address.";
      }

<<<<<<< HEAD
=======
      // ── Free services without RPm step: also need date/time ──
>>>>>>> 83030e3 (- Changing the Profile form for PAC and PAaE services)
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

<<<<<<< HEAD
    if (currentLabel === 'Payment' && config.extraField === 'preEmployment') {
      if (form.wantsPrintedReport === undefined)
        return 'Please indicate whether you want the printed psychological report.';
=======
    if (currentLabel === 'Payment') {
>>>>>>> 83030e3 (- Changing the Profile form for PAC and PAaE services)
      if (!form.payMethod) return 'Please select a payment method.';
      if (!form.proofFile) return 'Please upload your proof of payment.';
    }

<<<<<<< HEAD
    if (currentLabel === 'Payment' && config.extraField !== 'preEmployment') {
      if (!form.payMethod) return 'Please select a payment method.';
      if (!form.proofFile) return 'Please upload your proof of payment.';
    }

=======
>>>>>>> 83030e3 (- Changing the Profile form for PAC and PAaE services)
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
    else navigate('/client/appointment/psychological-assessment');
  };

  const handleConfirm = () => {
    setConfirmModal(false);
    setSubmitted(true);
    setTimeout(() => navigate('/client/appointment/pending'), 3000);
  };

  // ── Step renderer ─────────────────────────────────────────────
  const renderStep = () => {

    if (currentLabel === 'Details' && config.extraField === 'preEmployment')
      return <PreEmploymentDetails form={form} setForm={setForm} />;

    if (currentLabel === 'Details' && config.extraField === 'internship')
      return <InternshipDetails form={form} setForm={setForm} />;

    if (currentLabel === 'Reason' || currentLabel === 'Submit')
      return <PAaEReason config={config} form={form} setForm={setForm} user={user} />;

    if (currentLabel === 'Choose RPm')
      return (
        <PAaEChooseRPm
          config={config}
          form={form}
          setForm={setForm}
          selectedDoctor={selectedDoctor}
          onDoctorSelect={(doc) => {
            setSelectedDoctor(doc);
            // Store full doctor object so buildPaymentProps can pass it to PaymentForm
            setForm(f => ({ ...f, selectedRpm: doc }));
          }}
        />
      );

    if (currentLabel === 'Documents')
      return <PAeEDocuments config={config} form={form} setForm={setForm} />;

    if (currentLabel === 'Payment' && config.extraField === 'preEmployment')
      return <PreEmploymentPayment config={config} form={form} setForm={setForm} />;

    // Standard payment — all required props mapped via buildPaymentProps
    if (currentLabel === 'Payment') {
      const paymentProps = buildPaymentProps(form, setForm, form.fee ?? 0);
      return <PAeEPayment {...paymentProps} />;
    }

    return null;
  };

  return (
    <div className={styles.pageWrapper}>

      <PAaEFormHeader
        serviceTitle={serviceTitle}
        steps={config.steps}
        currentStep={step}
        onBack={handleBack}
      />

      <div className={styles.scrollContent}>
        {submitted
          ? <SuccessScreen config={config} serviceTitle={serviceTitle} onBack={() => navigate('/client/appointment/psychological-assessment')} />
          : renderStep()
        }
        <div className={styles.footerSpacer} />
      </div>

      {!submitted && (
        <div className={styles.stickyFooter}>
          {isLastStep && (
<<<<<<< HEAD
            <button
              className={styles.cancelButton}
              onClick={() => navigate('/client/appointment/psychological-assessment')}
            >
=======
            <button className={styles.cancelButton} onClick={handleBack}>
>>>>>>> 83030e3 (- Changing the Profile form for PAC and PAaE services)
              Cancel
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
      <Modal show={confirmModal} onHide={() => setConfirmModal(false)} centered size="sm" contentClassName={styles.confirmModalContent}>
        <Modal.Body className={styles.confirmModalBody}>
          <div className={styles.confirmModalIconWrapper}>
            <FiCheckCircle className={styles.confirmModalIcon} />
          </div>
          <p className={styles.confirmModalTitle}>Almost Done!</p>
          <p className={styles.confirmModalMessage}>
            You're about to submit your appointment request. Would you like to continue?
          </p>
          <div className={styles.confirmModalActions}>
            <button className={styles.confirmModalBtnBack} onClick={() => setConfirmModal(false)}>CANCEL</button>
            <button className={styles.confirmModalBtnConfirm} onClick={handleConfirm}>YES, CONFIRM</button>
          </div>
        </Modal.Body>
      </Modal>

      {/* ── Error Modal ── */}
      <Modal show={errorModal.show} onHide={() => setErrorModal({ show: false, message: '' })} centered size="sm" contentClassName={styles.errorModalContent}>
        <Modal.Body className={styles.errorModalBody}>
          <div className={styles.errorModalIconWrapper}>
            <svg className={styles.errorModalIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
            </svg>
          </div>
          <p className={styles.errorModalTitle}>Incomplete Form</p>
          <p className={styles.errorModalMessage}>{errorModal.message}</p>
          <button className={styles.errorModalBtn} onClick={() => setErrorModal({ show: false, message: '' })}>Got it</button>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default PAaESetAppointmentForm;
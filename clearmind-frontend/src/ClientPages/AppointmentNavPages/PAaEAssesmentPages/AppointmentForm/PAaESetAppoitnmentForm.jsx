// PAaEAppointmentForm.jsx
// Route: /client/appointment/psychological-assessment/set-appointment-form
// Receives: location.state.selectedService (string title from PAaEAppointment)

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '../../../ClientStyle/PAaEAppointmentForm.module.css';

/* -----------------------------------------------------------------
   Service Config — maps service title → steps, docs, payment rules
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

const ALL_RPM = [
  { id: 1, name: 'Dr. Maria Santos',  initials: 'MS', gender: 'F', avail: 'Available' },
  { id: 2, name: 'Dr. Angela Reyes',  initials: 'AR', gender: 'F', avail: 'Available' },
  { id: 3, name: 'Dr. Luz Mendoza',   initials: 'LM', gender: 'F', avail: 'Limited'   },
  { id: 4, name: 'Dr. Ramon Cruz',    initials: 'RC', gender: 'M', avail: 'Available' },
  { id: 5, name: 'Dr. Jose Bautista', initials: 'JB', gender: 'M', avail: 'Available' },
];

const PAY_OPTIONS = [
  { key: 'bank',    label: 'Bank Transfer', icon: '🏦', sub: 'BDO / BPI / UnionBank', account: 'PAeE Clinic', number: '0012-3456-7890' },
  { key: 'gcash',   label: 'GCash',         icon: '📱', sub: 'Mobile Wallet',          account: 'PAeE Clinic', number: '0917-123-4567' },
  { key: 'paymaya', label: 'PayMaya',        icon: '💳', sub: 'Maya Wallet',            account: 'PAeE Clinic', number: '0928-765-4321' },
];

const TIME_SLOTS = [
  '8:00 AM – 9:00 AM',
  '9:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
  '1:00 PM – 2:00 PM',
  '2:00 PM – 3:00 PM',
  '3:00 PM – 4:00 PM',
];

// Mock logged-in client — replace with real auth context
const CLIENT = {
  name: 'Juan Dela Cruz',
  initials: 'JD',
  age: 24,
  gender: 'Male',
  location: 'Batangas City',
};

/* -----------------------------------------------------------------
   Stepper
------------------------------------------------------------------ */
function Stepper({ steps, current }) {
  return (
    <div className={styles.stepper}>
      {steps.map((label, i) => {
        const idx      = i + 1;
        const isDone   = idx < current;
        const isActive = idx === current;
        return (
          <div
            key={i}
            className={`${styles.stepItem} ${isDone ? styles.stepItemDone : ''}`}
          >
            <div
              className={[
                styles.stepCircle,
                isDone   ? styles.stepCircleDone   : '',
                isActive ? styles.stepCircleActive : '',
              ].join(' ')}
            >
              {isDone ? '✓' : idx}
            </div>
            <div
              className={[
                styles.stepLabel,
                isDone   ? styles.stepLabelDone   : '',
                isActive ? styles.stepLabelActive : '',
              ].join(' ')}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -----------------------------------------------------------------
   Step 1 — Reason
------------------------------------------------------------------ */
function StepReason({ config, form, setForm }) {
  const len = (form.reason || '').length;

  const extraFields = {
    legalType: (
      <div className={styles.field}>
        <label className={styles.label}>
          Legal Case Type <span className={styles.opt}>(optional)</span>
        </label>
        <select
          className={styles.select}
          value={form.legalType || ''}
          onChange={(e) => setForm({ ...form, legalType: e.target.value })}
        >
          <option value=''>-- Select --</option>
          {['Adoption', 'Custody', 'Annulment', 'Other Legal Purpose'].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
    ),
    school: (
      <div className={styles.field}>
        <label className={styles.label}>
          School / Institution <span className={styles.opt}>(optional)</span>
        </label>
        <input
          type='text'
          className={styles.input}
          placeholder='e.g. Batangas State University'
          value={form.school || ''}
          onChange={(e) => setForm({ ...form, school: e.target.value })}
        />
      </div>
    ),
    company: (
      <div className={styles.field}>
        <label className={styles.label}>
          Company / Employer <span className={styles.opt}>(optional)</span>
        </label>
        <input
          type='text'
          className={styles.input}
          placeholder='e.g. Company Name'
          value={form.company || ''}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
      </div>
    ),
    institution: (
      <div className={styles.field}>
        <label className={styles.label}>
          Institution / Purpose <span className={styles.opt}>(optional)</span>
        </label>
        <input
          type='text'
          className={styles.input}
          placeholder='e.g. Hospital / School / Employer'
          value={form.institution || ''}
          onChange={(e) => setForm({ ...form, institution: e.target.value })}
        />
      </div>
    ),
  };

  return (
    <div className={styles.sectionCard}>
      {/* Banner */}
      {!config.hasPayment ? (
        <div className={styles.freeBanner}>
          <span>✅</span>
          <span>This service is <strong>free of charge</strong>. No payment required.</span>
        </div>
      ) : (
        <div className={styles.infoBanner}>
          <span>ℹ️</span>
          <span>
            Your basic profile information is pre-loaded from your account.
            Only your reason for consultation is needed below.
          </span>
        </div>
      )}

      {/* Client Card */}
      <div className={styles.clientCard}>
        <div className={styles.clientAvatar}>{CLIENT.initials}</div>
        <div>
          <div className={styles.clientName}>{CLIENT.name}</div>
          <div className={styles.clientMeta}>
            📅 {CLIENT.age} yrs old &nbsp;|&nbsp;
            {CLIENT.gender === 'Male' ? '♂' : '♀'} {CLIENT.gender} &nbsp;|&nbsp;
            📍 {CLIENT.location}
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className={styles.field}>
        <label className={styles.label}>
          Reason for Consultation <span className={styles.req}>*</span>
        </label>
        <textarea
          className={styles.textarea}
          maxLength={500}
          placeholder='Describe the reason for your appointment…'
          value={form.reason || ''}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />
        <div className={`${styles.charCount} ${len > 450 ? styles.charCountWarn : ''}`}>
          {len} / 500
        </div>
      </div>

      {/* Extra field per service */}
      {config.extraField && extraFields[config.extraField]}

      {/* Date */}
      <div className={styles.field}>
        <label className={styles.label}>
          Preferred Date <span className={styles.req}>*</span>
        </label>
        <input
          type='date'
          className={styles.input}
          value={form.date || ''}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
      </div>

      {/* Time Slot */}
      <div className={styles.field}>
        <label className={styles.label}>
          Preferred Time Slot <span className={styles.req}>*</span>
        </label>
        <select
          className={styles.select}
          value={form.timeSlot || ''}
          onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
        >
          <option value=''>-- Select Time --</option>
          {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   Step — Choose RPm
------------------------------------------------------------------ */
function StepRpm({ config, form, setForm }) {
  const list = config.femaleOnly
    ? ALL_RPM.filter((r) => r.gender === 'F')
    : ALL_RPM;

  return (
    <div className={styles.sectionCard}>
      {config.femaleOnly && (
        <div className={styles.infoBanner}>
          <span>⚠️</span>
          <span>
            For VAWC cases, only <strong>Female</strong> RPm / Psychometricians are available.
          </span>
        </div>
      )}
      <div className={styles.rpmGrid}>
        {list.map((r) => (
          <div
            key={r.id}
            className={`${styles.rpmCard} ${form.rpm === r.id ? styles.rpmCardSelected : ''}`}
            onClick={() => setForm({ ...form, rpm: r.id })}
          >
            <div className={styles.rpmAvatar}>{r.initials}</div>
            <div>
              <div className={styles.rpmName}>{r.name}</div>
              <div className={styles.rpmTitle}>RPm / Psychometrician</div>
              <span
                className={`${styles.rpmBadge} ${
                  r.avail === 'Available' ? styles.rpmBadgeAvail : styles.rpmBadgeLimited
                }`}
              >
                {r.avail}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   Step — Documents
------------------------------------------------------------------ */
function StepDocuments({ config, form, setForm }) {
  const files = form.files || [];

  const handleAdd = (e) => {
    const added = Array.from(e.target.files)
      .filter((f) => f.name.endsWith('.pdf'))
      .map((f) => f.name);
    setForm({ ...form, files: [...files, ...added] });
    e.target.value = '';
  };

  const handleRemove = (idx) => {
    setForm({ ...form, files: files.filter((_, i) => i !== idx) });
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.infoBanner}>
        <span>📎</span>
        <span>Please upload the required documents in PDF format only.</span>
      </div>

      {(config.mandatoryDocs.length > 0 || config.optionalDocs.length > 0) && (
        <div className={styles.docTagsRow}>
          {config.mandatoryDocs.map((d) => (
            <span key={d} className={styles.mandatoryTag}>⚠ {d}</span>
          ))}
          {config.optionalDocs.map((d) => (
            <span key={d} className={styles.optionalTag}>📋 {d}</span>
          ))}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>
          Upload Documents
          {config.mandatoryDocs.length > 0 && <span className={styles.req}> *</span>}
          <span className={styles.opt}>(PDF only · max 10 MB each)</span>
        </label>
        <div className={styles.uploadZone}>
          <div className={styles.uploadIcon}>📄</div>
          <div className={styles.uploadHint}>Click to upload</div>
          <div className={styles.uploadSub}>Drag &amp; drop PDF files here</div>
          <input
            type='file'
            className={styles.uploadInput}
            accept='.pdf'
            multiple
            onChange={handleAdd}
          />
        </div>
        <div className={styles.fileList}>
          {files.map((name, i) => (
            <div key={i} className={styles.fileItem}>
              <span style={{ color: '#c0392b' }}>📄</span>
              <span className={styles.fileItemName}>{name}</span>
              <button
                className={styles.fileItemRemove}
                onClick={() => handleRemove(i)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   Step — Payment
------------------------------------------------------------------ */
function StepPayment({ form, setForm }) {
  const selected = PAY_OPTIONS.find((p) => p.key === form.payMethod);

  const handleProof = (e) => {
    if (e.target.files[0]) {
      setForm({ ...form, proofFile: e.target.files[0].name });
    }
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.field}>
        <label className={styles.label}>
          Select Payment Method <span className={styles.req}>*</span>
        </label>
        <div className={styles.payGrid}>
          {PAY_OPTIONS.map((p) => (
            <div
              key={p.key}
              className={`${styles.payCard} ${
                form.payMethod === p.key ? styles.payCardSelected : ''
              }`}
              onClick={() => setForm({ ...form, payMethod: p.key })}
            >
              <div className={styles.payIcon}>{p.icon}</div>
              <div className={styles.payName}>{p.label}</div>
              <div className={styles.paySub}>{p.sub}</div>
            </div>
          ))}
        </div>

        {selected && (
          <div className={styles.payDetailBox}>
            {[
              ['Method',       selected.label],
              ['Account Name', selected.account],
              ['Number',       selected.number],
            ].map(([k, v]) => (
              <div key={k} className={styles.payRow}>
                <span className={styles.payRowLabel}>{k}</span>
                <span className={styles.payRowVal}>{v}</span>
              </div>
            ))}

            <div className={styles.field} style={{ marginTop: 14, marginBottom: 0 }}>
              <label className={styles.label}>
                Upload Proof of Payment <span className={styles.req}>*</span>
              </label>
              <div className={styles.uploadZone}>
                <div className={styles.uploadIcon}>🧾</div>
                <div className={styles.uploadHint}>Click to upload receipt</div>
                <div className={styles.uploadSub}>PDF only</div>
                <input
                  type='file'
                  className={styles.uploadInput}
                  accept='.pdf'
                  onChange={handleProof}
                />
              </div>
              {form.proofFile && (
                <div className={styles.fileList}>
                  <div className={styles.fileItem}>
                    <span style={{ color: '#c0392b' }}>🧾</span>
                    <span className={styles.fileItemName}>{form.proofFile}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.pendingBanner}>
          <span>⏳</span>
          <span>
            After submission, your appointment will be sent for{' '}
            <strong>Admin Approval</strong>. You can track the status under{' '}
            <strong>My Appointments → Pending</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   Success Screen
------------------------------------------------------------------ */
function SuccessScreen({ config, serviceTitle, onBack }) {
  const ref = `${config.refPrefix}-2026-${String(
    Math.floor(Math.random() * 9000) + 1000
  ).padStart(5, '0')}`;

  return (
    <div className={styles.sectionCard}>
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
          ⏳ Track your appointment under{' '}
          <strong>My Appointments → Pending</strong> tab.
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

  const serviceTitle = location.state?.selectedService || 'VAWC Purpose';
  const config       = SERVICE_CONFIG[serviceTitle] || SERVICE_CONFIG['VAWC Purpose'];

  const [step,      setStep]      = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form,      setForm]      = useState({});

  const totalSteps   = config.steps.length;
  const isLastStep   = step === totalSteps;
  const currentLabel = config.steps[step - 1];

  const renderStepContent = () => {
    if (currentLabel === 'Reason' || currentLabel === 'Submit') {
      return <StepReason config={config} form={form} setForm={setForm} />;
    }
    if (currentLabel === 'Choose RPm') {
      return <StepRpm config={config} form={form} setForm={setForm} />;
    }
    if (currentLabel === 'Documents') {
      return <StepDocuments config={config} form={form} setForm={setForm} />;
    }
    if (currentLabel === 'Payment') {
      return <StepPayment form={form} setForm={setForm} />;
    }
    return null;
  };

  const handleNext = () => {
    if (isLastStep) setSubmitted(true);
    else setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else navigate(-1);
  };

  return (
    <div className={styles.container}>

      {/* Top Row */}
      <div className={styles.topRow}>
        <h5 className={styles.heading}>Set Appointment</h5>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* Selected service label */}
      <div className={styles.serviceLabel}>
        Selected Service: {serviceTitle}
      </div>

      {/* Scrollable Body */}
      <div className={styles.scrollableBody}>
        {submitted ? (
          <SuccessScreen
            config={config}
            serviceTitle={serviceTitle}
            onBack={() => navigate(-1)}
          />
        ) : (
          <>
            {/* Stepper Card */}
            <div className={styles.sectionCard} style={{ marginBottom: 12 }}>
              <Stepper steps={config.steps} current={step} />
            </div>

            {/* Step Content */}
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className={styles.btnRow}>
              {step > 1 && (
                <button className={styles.btnOutline} onClick={handleBack}>
                  <FaArrowLeft /> Back
                </button>
              )}
              {!isLastStep ? (
                <button className={styles.btnPrimary} onClick={handleNext}>
                  Next →
                </button>
              ) : (
                <button className={styles.btnSuccess} onClick={handleNext}>
                  Submit Appointment ✓
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PAaESetAppointmentForm;
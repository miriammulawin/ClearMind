// AppointmentForm/PAaEReason.jsx
// Step: Reason for Consultation
//
// When "I am the Patient"     → shows pre-loaded profile card (read-only)
// When "I am the Complainant" → shows manual patient info fields
// Reason textarea + extra service fields always shown

import React from 'react';
import {
  BsInfoCircleFill,
  BsCheckCircleFill,
  BsClockFill,
} from 'react-icons/bs';
import styles from '../style/PAaEAppointmentForm.module.css';
import FormHeader from '../../AppointmentComponents/FormHeader';

/* -----------------------------------------------------------------
   PAaEReason
   Props:
     config         — SERVICE_CONFIG entry for the selected service
     form           — shared form state object
     setForm        — form state setter
     user           — current user object from useCurrentUser
------------------------------------------------------------------ */
const PAaEReason = ({ config, form, setForm, user }) => {
  const len        = (form.reason || '').length;
  const hasRpmStep = config.steps.includes('Choose RPm');

  const extraFields = {
    legalType: (
      <div className={styles.field}>
        <label className={styles.label}>
          Legal Case Type <span className={styles.opt}>(optional)</span>
        </label>
        <select
          className={styles.select}
          value={form.legalType || ''}
          onChange={e => setForm(prev => ({ ...prev, legalType: e.target.value }))}
        >
          <option value=''>-- Select --</option>
          {['Adoption', 'Custody', 'Annulment', 'Other Legal Purpose'].map(o => (
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
          onChange={e => setForm(prev => ({ ...prev, school: e.target.value }))}
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
          onChange={e => setForm(prev => ({ ...prev, company: e.target.value }))}
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
          onChange={e => setForm(prev => ({ ...prev, institution: e.target.value }))}
        />
      </div>
    ),
  };

  return (
    <div className={styles.stepCard}>

      {/* ── Free / paid banner ── */}
      {!config.hasPayment ? (
        <div className={styles.freeBanner}>
          <BsCheckCircleFill className={styles.bannerIcon} />
          <span>This service is <strong>free of charge</strong>. No payment required.</span>
        </div>
      ) : (
        <div className={styles.infoBanner}>
          <BsInfoCircleFill className={styles.bannerIcon} />
          <span>
            Your basic profile information is pre-loaded from your account.
            Only your reason for consultation is needed below.
          </span>
        </div>
      )}

      {/* ── Toggle + Pre-loaded card OR Complainant fields ──
          FormHeader handles:
            - Required notice
            - Patient / Complainant toggle
            - Pre-loaded profile card (patient mode)
            - Manual patient fields (complainant mode)
      ── */}
      <FormHeader
        isInformant={form.isInformant ?? false}
        onToggle={(value) => setForm(prev => ({
          ...prev,
          isInformant: value,
          // Clear complainant-specific fields when switching back to patient
          ...(!value && {
            complainantName:     '',
            complainantRelation: '',
            firstName:           '',
            middleName:          '',
            lastName:            '',
            sex:                 '',
            dateOfBirth:         '',
            age:                 '',
            contactNo:           '',
            email:               '',
            address:             '',
          }),
        }))}
        user={user}
        patientForm={form}
        setPatientForm={setForm}
      />

      {/* ── Reason textarea ── */}
      <div className={styles.field}>
        <label className={styles.label}>
          Reason for Consultation <span className={styles.req}>*</span>
        </label>
        <textarea
          className={styles.textarea}
          maxLength={500}
          placeholder='Describe the reason for your appointment…'
          value={form.reason || ''}
          onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))}
        />
        <div className={`${styles.charCount} ${len > 450 ? styles.charCountWarn : ''}`}>
          {len} / 500
        </div>
      </div>

      {/* ── Service-specific extra field ── */}
      {config.extraField && extraFields[config.extraField]}

      {/* ── Hint: date/time picked on next step ── */}
      {hasRpmStep && (
        <div className={styles.infoBanner} style={{ marginTop: '0.25rem' }}>
          <BsClockFill className={styles.bannerIcon} />
          <span>
            You'll choose your preferred date &amp; time on the next step after selecting an RPm.
          </span>
        </div>
      )}

    </div>
  );
};

export default PAaEReason;
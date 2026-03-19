// AppointmentForm/PAaEReason.jsx
// Step: Reason for Consultation
// Shows: client card, reason textarea, optional extra field, hint banner

import React from 'react';
import {
  BsInfoCircleFill,
  BsCheckCircleFill,
  BsCalendar2CheckFill,
  BsGenderMale,
  BsGenderFemale,
  BsGeoAltFill,
  BsEnvelopeFill,
  BsTelephoneFill,
  BsClockFill,
} from 'react-icons/bs';
import styles from '../style/PAaEAppointmentForm.module.css';

/* -----------------------------------------------------------------
   ClientCard — pre-filled from useCurrentUser hook
------------------------------------------------------------------ */
function ClientCard({ user }) {
  const GenderIcon = user.sex === 'Male' ? BsGenderMale : BsGenderFemale;

  return (
    <div className={styles.clientCard}>

      {/* ── Avatar ── */}
      {user.profilePic ? (
        <img
          src={user.profilePic}
          alt={user.fullName}
          className={styles.clientAvatar}
          style={{ objectFit: 'cover', borderRadius: '50%' }}
        />
      ) : (
        <div className={styles.clientAvatar}>{user.initials}</div>
      )}

      {/* ── Info ── */}
      <div className={styles.clientInfo}>

        {/* Full name */}
        <div className={styles.clientName}>{user.fullName}</div>

        {/* 2-column grid for short fields */}
        <div className={styles.clientMetaGrid}>

          <div className={styles.clientMetaRow}>
            <BsCalendar2CheckFill className={styles.metaIcon} />
            <span>{user.age} yrs old</span>
          </div>

          <div className={styles.clientMetaRow}>
            <GenderIcon className={styles.metaIcon} />
            <span>{user.sex}</span>
          </div>

          <div className={styles.clientMetaRow}>
            <BsTelephoneFill className={styles.metaIcon} />
            <span>{user.contactNo}</span>
          </div>

          <div className={styles.clientMetaRow}>
            <BsEnvelopeFill className={styles.metaIcon} />
            <span className={styles.metaEllipsis}>{user.email}</span>
          </div>

          {/* Address spans full width */}
          <div className={`${styles.clientMetaRow} ${styles.clientMetaFull}`}>
            <BsGeoAltFill className={styles.metaIcon} />
            <span>{user.homeAddress}</span>
          </div>

        </div>
      </div>

    </div>
  );
}

/* -----------------------------------------------------------------
   PAaEReason
   Props:
     config      — SERVICE_CONFIG entry for the selected service
     form        — shared form state object
     setForm     — form state setter
     user        — current user object from useCurrentUser
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
          onChange={e => setForm({ ...form, legalType: e.target.value })}
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
          onChange={e => setForm({ ...form, school: e.target.value })}
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
          onChange={e => setForm({ ...form, company: e.target.value })}
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
          onChange={e => setForm({ ...form, institution: e.target.value })}
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
          <span>Your basic profile information is pre-loaded from your account. Only your reason for consultation is needed below.</span>
        </div>
      )}

      {/* ── Client card ── */}
      <ClientCard user={user} />

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
          onChange={e => setForm({ ...form, reason: e.target.value })}
        />
        <div className={`${styles.charCount} ${len > 450 ? styles.charCountWarn : ''}`}>
          {len} / 500
        </div>
      </div>

      {/* ── Service-specific extra field ── */}
      {config.extraField && extraFields[config.extraField]}

      {/* ── Hint: date/time picked on next step ── */}
      {hasRpmStep && (
        <div className={styles.infoBanner} style={{ marginTop: 4 }}>
          <BsClockFill className={styles.bannerIcon} />
          <span>You'll choose your preferred date &amp; time on the next step after selecting an RPm.</span>
        </div>
      )}

    </div>
  );
};

export default PAaEReason;
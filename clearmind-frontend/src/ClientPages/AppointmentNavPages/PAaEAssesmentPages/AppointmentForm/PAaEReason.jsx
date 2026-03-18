// AppointmentForm/PAaEReason.jsx
// Step: Reason for Consultation
// Shows: client card, reason textarea, optional extra field, hint banner

import React from 'react';
import styles from '../../../ClientStyle/PAaEAppointmentForm.module.css';

/* -----------------------------------------------------------------
   ClientCard — pre-filled from useCurrentUser hook
------------------------------------------------------------------ */
function ClientCard({ user }) {
  const genderIcon = user.sex === 'Male' ? '♂' : '♀';
  return (
    <div className={styles.clientCard}>
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
      <div>
        <div className={styles.clientName}>{user.fullName}</div>
        <div className={styles.clientMeta}>
          📅 {user.age} yrs old &nbsp;|&nbsp; {genderIcon} {user.sex} &nbsp;|&nbsp; 📍 {user.homeAddress}
        </div>
        <div className={styles.clientMeta} style={{ marginTop: 2 }}>
          ✉️ {user.email} &nbsp;|&nbsp; 📞 {user.contactNo}
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

  /* Extra fields rendered per service */
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
          <span>✅</span>
          <span>This service is <strong>free of charge</strong>. No payment required.</span>
        </div>
      ) : (
        <div className={styles.infoBanner}>
          <span>ℹ️</span>
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
          <span>📅</span>
          <span>You'll choose your preferred date &amp; time on the next step after selecting an RPm.</span>
        </div>
      )}

    </div>
  );
};

export default PAaEReason;

// AppointmentForm/PAeEPayment.jsx
// Step: Payment
// Shows: payment method cards, account details, proof of payment upload

import React from 'react';
import styles from '../../../ClientStyle/PAaEAppointmentForm.module.css';

const PAY_OPTIONS = [
  {
    key:     'bank',
    label:   'Bank Transfer',
    icon:    '🏦',
    sub:     'BDO / BPI / UnionBank',
    account: 'PAeE Clinic',
    number:  '0012-3456-7890',
  },
  {
    key:     'gcash',
    label:   'GCash',
    icon:    '📱',
    sub:     'Mobile Wallet',
    account: 'PAeE Clinic',
    number:  '0917-123-4567',
  },
  {
    key:     'paymaya',
    label:   'PayMaya',
    icon:    '💳',
    sub:     'Maya Wallet',
    account: 'PAeE Clinic',
    number:  '0928-765-4321',
  },
];

/* -----------------------------------------------------------------
   PAeEPayment
   Props:
     form     — shared form state
     setForm  — form state setter
------------------------------------------------------------------ */
const PAeEPayment = ({ form, setForm }) => {

  const selected = PAY_OPTIONS.find(p => p.key === form.payMethod);

  const handleProof = (e) => {
    if (e.target.files[0]) {
      setForm({ ...form, proofFile: e.target.files[0].name });
    }
  };

  return (
    <div className={styles.stepCard}>
      <div className={styles.field}>

        {/* ── Payment method cards ── */}
        <label className={styles.label}>
          Select Payment Method <span className={styles.req}>*</span>
        </label>
        <div className={styles.payGrid}>
          {PAY_OPTIONS.map(p => (
            <div
              key={p.key}
              className={`${styles.payCard} ${form.payMethod === p.key ? styles.payCardSelected : ''}`}
              onClick={() => setForm({ ...form, payMethod: p.key })}
            >
              <div className={styles.payIcon}>{p.icon}</div>
              <div className={styles.payName}>{p.label}</div>
              <div className={styles.paySub}>{p.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Account details + proof upload (shown after method is picked) ── */}
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

            {/* ── Proof of payment upload ── */}
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

        {/* ── Pending approval notice ── */}
        <div className={styles.pendingBanner}>
          <span>⏳</span>
          <span>
            After submission, your appointment will be sent for <strong>Admin Approval</strong>.
            You can track the status under <strong>My Appointments → Pending</strong>.
          </span>
        </div>

      </div>
    </div>
  );
};

export default PAeEPayment;
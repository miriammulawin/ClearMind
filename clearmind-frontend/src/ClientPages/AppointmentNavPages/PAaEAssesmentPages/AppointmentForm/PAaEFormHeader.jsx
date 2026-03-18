// AppointmentForm/PAaEFormHeader.jsx
// Sticky header: purple back bar + title/service label + stepper with progress bar

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';
import styles from '../../../ClientStyle/PAaEAppointmentForm.module.css';

/* -----------------------------------------------------------------
   Stepper
------------------------------------------------------------------ */
function Stepper({ steps, current }) {
  return (
    <div className={styles.stepperOuter}>
      <div className={styles.stepper}>
        {steps.map((label, i) => {
          const idx      = i + 1;
          const isDone   = idx < current;
          const isActive = idx === current;

          return (
            <React.Fragment key={i}>
              <div className={styles.stepItem}>
                <div className={[
                  styles.stepCircle,
                  isDone   ? styles.stepDone    : '',
                  isActive ? styles.stepActive  : '',
                  !isDone && !isActive ? styles.stepPending : '',
                ].join(' ')}>
                  {isDone ? <FiCheck size={13} strokeWidth={3} /> : idx}
                </div>
                <span className={[
                  styles.stepLabel,
                  isActive ? styles.stepLabelActive : '',
                  isDone   ? styles.stepLabelDone   : '',
                ].join(' ')}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={[
                  styles.stepConnector,
                  isDone ? styles.stepConnectorDone : '',
                ].join(' ')} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress bar — formula: current / steps.length * 100 */}
      <div className={styles.stepperProgressBar}>
        <div
          className={styles.stepperProgressFill}
          style={{ width: `${(current / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* -----------------------------------------------------------------
   PAaEFormHeader
   Props:
     serviceTitle  — string shown as subtitle
     steps         — string[] from SERVICE_CONFIG
     currentStep   — number (1-based)
     onBack        — called when back button is pressed
------------------------------------------------------------------ */
const PAaEFormHeader = ({ serviceTitle, steps, currentStep, onBack }) => {
  return (
    <div className={styles.header}>

      {/* ── Purple back bar ── */}
      <div className={styles.backRow}>
        <button className={styles.backBtn} onClick={onBack}>
          <FaArrowLeft size={13} /> Back
        </button>
      </div>

      {/* ── Title + service label ── */}
      <div className={styles.headerTitleRow}>
        <div>
          <div className={styles.headerTitle}>Set Appointment</div>
          <div className={styles.serviceLabel}>{serviceTitle}</div>
        </div>
      </div>

      {/* ── Stepper ── */}
      <Stepper steps={steps} current={currentStep} />

    </div>
  );
};

export default PAaEFormHeader;
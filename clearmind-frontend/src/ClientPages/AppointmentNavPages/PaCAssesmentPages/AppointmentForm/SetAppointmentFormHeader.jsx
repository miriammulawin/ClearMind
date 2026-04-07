import React from "react";
import { Image } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import styles from "../style/PACSetAppointment.module.css";
import logo_login_single from "../../../../../src/assets/CMPS_Img_logo_only.png";

const STEPS = [
  { num: 1, label: "Schedule" },
  { num: 2, label: "Verify Profile" },
  { num: 3, label: "Payment" },
];
const TOTAL_STEPS = STEPS.length;

/**
 * SetAppointmentFormHeader
 *
 * Props:
 *   doctorData   – doctor object (name, credentials, etc.)
 *   currentStep  – number (1-based)
 *   onBack       – function called when back button is pressed
 */
const SetAppointmentFormHeader = ({ doctorData, currentStep, onBack }) => {
  const progressPercent = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className={styles.stickyHeader}>
      {/* ── Back Row ── */}
      <div className={styles.backRow}>
        <button className={styles.backBtn} onClick={onBack}>
          <FaArrowLeft /> Go Back
        </button>
      </div>

      {/* ── Doctor Strip ── */}
      <div className={styles.doctorStrip}>
        <div className={styles.doctorStripLeft}>
          <div className={styles.avatarCircle}>
            {doctorData?.name?.charAt(0)}
          </div>
          <div className={styles.doctorDetails}>
            <span className={styles.assignedLabel}>Assigned Doctor</span>
            <span className={styles.doctorName}>{doctorData?.name}</span>
            <span className={styles.doctorCredentials}>
              {doctorData?.credentials}
            </span>
          </div>
        </div>

        <div className={styles.logoIconProfile}>
          <Image src={logo_login_single} fluid />
        </div>
      </div>

      {/* ── Stepper ── */}
      <div
        className={styles.stepper}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {STEPS.map((step, i, arr) => (
          <React.Fragment key={step.num}>
            <div className={styles.stepperItem}>
              <div
                className={`${styles.stepCircle} ${
                  step.num === currentStep
                    ? styles.active
                    : step.num < currentStep
                      ? styles.done
                      : ""
                }`}
              >
                {step.num < currentStep ? "✓" : step.num}
              </div>
              <span
                className={`${styles.stepLabel} ${
                  step.num === currentStep
                    ? styles.stepLabelActive
                    : step.num < currentStep
                      ? styles.stepLabelDone
                      : ""
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < arr.length - 1 && <div className={styles.stepperLine} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── Progress Bar ── */}
      <div className={styles.progressBarTrack}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default SetAppointmentFormHeader;

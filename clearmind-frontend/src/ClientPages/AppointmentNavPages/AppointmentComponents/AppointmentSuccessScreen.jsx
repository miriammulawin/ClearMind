import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Toast } from "react-bootstrap";
import styles from "./styles/AppointmentSuccessScreen.module.css";
import { BsCalendar2Check } from "react-icons/bs";

const AppointmentSuccessScreen = ({
  serviceTitle = "Appointment",
  refPrefix = "REF",
  refNumber = null,
  onBack,
}) => {
  // Fallback kung wala pang backend, edit if maglalagay ng backend
  const ref = useMemo(() => {
    if (refNumber) return refNumber;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const xxxx = Math.random().toString(36).substring(2, 6).toUpperCase();

    return `${refPrefix}-${xxxx}-${yyyy}-${mm}-${dd}`;
    // output: PAC-A3F8-2026-04-08
  }, [refNumber]);

  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 10000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* ── Toast ── */}
      <div className={styles.toastWrapper}>
        <Toast show={showToast} className={styles.toast}>
          <Toast.Body className={styles.toastBody}>
            <BsCalendar2Check className={styles.toastIcon} /> Appointment
            successfully booked!
          </Toast.Body>
        </Toast>
      </div>

      {/* ── Success Card ── */}
      <div className={styles.card}>
        <div className={styles.successIcon}>
          {" "}
          <BsCalendar2Check />
        </div>
        <div className={styles.successTitle}>Appointment Submitted!</div>
        <p className={styles.successMsg}>
          Your <strong>{serviceTitle}</strong> appointment request has been
          received and is now awaiting admin approval.
        </p>
        <div className={styles.refBadge}>REF# {ref}</div>
        <div className={styles.pendingNote}>
          ⏳ Track your appointment under{" "}
          <strong> Appointments → Pending</strong> tab.
        </div>
        <div className={styles.btnRow}>
          <button className={styles.backBtn} onClick={onBack}>
            <FaArrowLeft /> Back to Services
          </button>

          <button
            className={styles.viewBtn}
            onClick={() => navigate("/client/appointment/pending")} // adjust path
          >
            View Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSuccessScreen;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClinicMedical, FaVideo, FaCalendarTimes } from "react-icons/fa";
import MOCK_APPOINTMENTS from "../MockData/MockAppointment.js";
import styles from "./ClientStyle/ClientHome.module.css";
import ClientHeader from "./ClientComponents/Header.jsx";
import ClientFooter from "./ClientComponents/Footer.jsx";

const SLIDES = [1, 2, 3, 4];

const getIcon = (type) =>
  type === "Clinic - CMPS" ? (
    <FaClinicMedical className={styles.huIconType} />
  ) : (
    <FaVideo className={styles.huIconType} />
  );

const STATUS_STYLES = {
  Confirmed:   { bg: "#e3f2fd", color: "#1565c0", border: "#64b5f6" },
  Rescheduled: { bg: "#fff3e0", color: "#e65100", border: "#ffb74d" },
};

function ClientHome() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  // Only Confirmed or Rescheduled — NO Pending
  const activeAppointments = MOCK_APPOINTMENTS.filter(
    (apt) => apt.status === "Confirmed" || apt.status === "Rescheduled"
  );

  // Find the nearest appointment from today onward
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = activeAppointments
    .map((apt) => ({ ...apt, _date: new Date(apt.date) }))
    .filter((apt) => apt._date >= today)
    .sort((a, b) => a._date - b._date);

  const earliest = upcoming[0] || null;

  return (
    <div className={styles.pageWrapper}>

      {/* ── Sticky Header ── */}
      <div className={styles.stickyHeader}>
        <ClientHeader />
      </div>

      {/* ── Scrollable Body ── */}
      <div className={styles.bodyWrapper}>

        {/* Carousel */}
        <div className={styles.hcWrap}>
          <p className={styles.hcHeading}>
            Book an Appointment<br />with Our Specialists
          </p>

          <div className={styles.hcViewport}>
            <div
              className={styles.hcTrack}
              style={{ transform: `translateX(calc(-${current} * (100% + 12px)))` }}
            >
              {SLIDES.map((_, i) => (
                <div key={i} className={styles.hcSlide} />
              ))}
            </div>
          </div>

          <div className={styles.hcDots}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`${styles.hcDot}${i === current ? ` ${styles.hcDotActive}` : ""}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </div>

        {/* Next Available Session */}
        <div className={styles.huWrap}>
          <div className={styles.huSectionHeader}>
            <span className={styles.huTitle}>Next Available Session</span>
            <span className={styles.huCount}>({upcoming.length})</span>
          </div>

          <p className={styles.huEarliestLabel}>Earliest Appointment:</p>

          <div className={styles.huBox}>
            {!earliest ? (
              <div className={styles.huEmpty}>
                <FaCalendarTimes className={styles.huEmptyIcon} />
                <p>You have no confirmed appointment at this time.</p>
              </div>
            ) : (
              (() => {
                const s = STATUS_STYLES[earliest.status] || STATUS_STYLES.Confirmed;
                return (
                  <div className={styles.huCard} key={earliest.id}>
                    <div
                      className={styles.huCardAccent}
                      style={{ background: s.color }}
                    />
                    <div className={styles.huCardInfo}>
                      <span className={styles.huCardDate}>
                        {earliest.date} · {earliest.time}
                      </span>
                      <span className={styles.huCardService}>
                        {earliest.serviceType}
                      </span>
                      <span className={styles.huCardDoctor}>
                        {earliest.doctor}
                      </span>
                    </div>
                    <div className={styles.huCardRight}>
                      <span
                        className={styles.huBadge}
                        style={{
                          background: s.bg,
                          color: s.color,
                          border: `1px solid ${s.border}`,
                        }}
                      >
                        {earliest.status.toUpperCase()}
                      </span>
                      {getIcon(earliest.type)}
                      <button
                        className={styles.huViewDetailsBtn}
                        onClick={() => navigate(`/client/appointment/upcoming/${earliest.id}`)}
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {/* View All Appointments */}
          <div className={styles.huViewAllRow}>
            <button
              className={styles.huViewAllBtn}
              onClick={() => navigate("/client/appointment/upcoming")}
            >
              View All Appointments
            </button>
          </div>

        </div>

      </div>

      {/* ── Sticky Footer ── */}
      <div className={styles.stickyFooter}>
        <ClientFooter />
      </div>

    </div>
  );
}

export default ClientHome;
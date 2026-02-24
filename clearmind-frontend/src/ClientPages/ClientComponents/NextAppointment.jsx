import { useNavigate } from "react-router-dom";
import { FaClinicMedical, FaVideo, FaCalendarTimes } from "react-icons/fa";
import MOCK_APPOINTMENTS from "../../MockData/MockAppointment";
import styles from "../ClientStyle/ClientHome.module.css";

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

function NextAppointment() {
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = MOCK_APPOINTMENTS
    .filter((apt) => apt.status === "Confirmed" || apt.status === "Rescheduled")
    .map((apt) => ({ ...apt, _date: new Date(apt.date) }))
    .filter((apt) => apt._date >= today)
    .sort((a, b) => a._date - b._date);

  const earliest = upcoming[0] || null;

  return (
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
                <div className={styles.huCardAccent} style={{ background: s.color }} />
                <div className={styles.huCardInfo}>
                  <span className={styles.huCardDate}>{earliest.date} · {earliest.time}</span>
                  <span className={styles.huCardService}>{earliest.serviceType}</span>
                  <span className={styles.huCardDoctor}>{earliest.doctor}</span>
                </div>
                <div className={styles.huCardRight}>
                  <span
                    className={styles.huBadge}
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
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

      <div className={styles.huViewAllRow}>
        <button
          className={styles.huViewAllBtn}
          onClick={() => navigate("/client/appointment/upcoming")}
        >
          View All Appointments
        </button>
      </div>
    </div>
  );
}

export default NextAppointment;
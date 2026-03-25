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

  // All future confirmed/rescheduled sorted by date
  const allUpcoming = MOCK_APPOINTMENTS
    .filter((apt) => apt.status === "Confirmed" || apt.status === "Rescheduled")
    .map((apt) => ({ ...apt, _date: new Date(apt.date) }))
    .filter((apt) => apt._date >= today)
    .sort((a, b) => a._date - b._date);

  // Find the week (Sun–Sat) of the earliest appointment
  const firstApt = allUpcoming[0] || null;

  const weekStart = firstApt ? new Date(firstApt._date) : null;
  if (weekStart) {
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // back to Sunday
    weekStart.setHours(0, 0, 0, 0);
  }

  const weekEnd = weekStart ? new Date(weekStart) : null;
  if (weekEnd) {
    weekEnd.setDate(weekStart.getDate() + 6); // forward to Saturday
    weekEnd.setHours(23, 59, 59, 999);
  }

  // All appointments that fall within that same week
  const upcoming = firstApt
    ? allUpcoming.filter((apt) => apt._date >= weekStart && apt._date <= weekEnd)
    : [];

  // Is the earliest week the current week?
  const todayWeekStart = new Date(today);
  todayWeekStart.setDate(today.getDate() - today.getDay());
  const isThisWeek = weekStart && weekStart.getTime() === todayWeekStart.getTime();

  return (
    <div className={styles.huWrap}>
      <div className={styles.huSectionHeader}>
        <span className={styles.huTitle}>Next Available Session</span>
        <span className={styles.huCount}>({upcoming.length})</span>
      </div>

      <p className={styles.huEarliestLabel}>
        {upcoming.length === 0
          ? "Earliest Appointment:"
          : isThisWeek
          ? "Appointments This Week:"
          : `Appointments on the week of ${weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric" })}:`}
      </p>

      <div className={styles.huBox}>
        {upcoming.length === 0 ? (
          <div className={styles.huEmpty}>
            <FaCalendarTimes className={styles.huEmptyIcon} />
            <p>You have no confirmed appointments.</p>
          </div>
        ) : (
          upcoming.map((apt) => {
            const s = STATUS_STYLES[apt.status] || STATUS_STYLES.Confirmed;
            return (
              <div className={styles.huCard} key={apt.id}>
                <div className={styles.huCardAccent} style={{ background: s.color }} />
                <div className={styles.huCardInfo}>
                  <span className={styles.huCardDate}>{apt.date} · {apt.time}</span>
                  <span className={styles.huCardService}>{apt.serviceType}</span>
                  <span className={styles.huCardDoctor}>{apt.doctor}</span>
                </div>
                <div className={styles.huCardRight}>
                  <span
                    className={styles.huBadge}
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                  >
                    {apt.status.toUpperCase()}
                  </span>
                  {getIcon(apt.type)}
                  <button
                    className={styles.huViewDetailsBtn}
                    onClick={() => navigate(`/client/appointment/upcoming/${apt.id}`)}
                  >
                    VIEW DETAILS
                  </button>
                </div>
              </div>
            );
          })
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
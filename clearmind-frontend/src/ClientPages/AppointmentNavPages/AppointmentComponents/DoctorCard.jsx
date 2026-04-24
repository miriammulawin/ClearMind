import React, { useMemo } from "react";
import { Card } from "react-bootstrap";
import {
  FaVideo,
  FaClinicMedical,
  FaCalendarCheck,
  FaUserCircle,
} from "react-icons/fa";
import styles from "./styles/DoctorCard.module.css";

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAY_NUM_TO_NAME = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

// ── Component ─────────────────────────────────────────────────────────────────
const DoctorCard = ({
  doctor,
  schedule, // ← NEW: raw array from API or null
  isSelected,
  compact,
  onViewProfile,
  onSetAppointment,
  onSelect,
}) => {
  // Build sorted schedule entries from the raw API array
  const scheduleEntries = useMemo(() => {
    if (!schedule || schedule.length === 0) return [];
    return schedule
      .map((s) => ({
        day: DAY_NUM_TO_NAME[s.day_num],
        startTime: s.start_time?.slice(0, 5),
        endTime: s.end_time?.slice(0, 5),
        slotType: s.slot_type,
      }))
      .filter((s) => s.day)
      .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
  }, [schedule]);

  const earliest = scheduleEntries[0] ?? null;

  // Slot type icon + label
  const SlotBadge = ({ type }) => {
    const map = {
      online: {
        icon: <FaVideo className={styles.consultationIcon} />,
        label: "Online",
      },
      physical: {
        icon: <FaClinicMedical className={styles.consultationIcon} />,
        label: "Physical",
      },
      both: {
        icon: (
          <>
            <FaVideo className={styles.consultationIcon} />
            <FaClinicMedical className={styles.consultationIcon} />
          </>
        ),
        label: "Online & Physical",
      },
    };
    const item = map[type];
    if (!item) return null;
    return (
      <div className={styles.availabilityItem}>
        {item.icon}
        <span>{item.label}</span>
      </div>
    );
  };

  return (
    <Card
      className={`
        ${styles.doctorCard}
        ${isSelected ? styles.doctorCardSelected : ""}
        ${compact ? styles.doctorCardCompact : ""}
      `}
      onClick={compact && onSelect ? () => onSelect(doctor.id) : undefined}
      style={{ cursor: compact && onSelect ? "pointer" : "default" }}
    >
      <Card.Body className={styles.cardBody}>
        {/* ── Header row (always visible) ── */}
        <div className={styles.doctorHeader}>
          {compact && onSelect && (
            <div
              className={`${styles.radioIndicator} ${isSelected ? styles.radioSelected : styles.radioUnselected}`}
            />
          )}

          {/* Avatar / Photo */}
          <div className={styles.doctorAvatar}>
            {doctor.profile_picture ? (
              <img
                src={doctor.profile_picture}
                alt={doctor.name}
                className={styles.avatarImg}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            ) : (
              <FaUserCircle className={styles.avatarIcon} />
            )}
          </div>

          <div className={styles.doctorInfo}>
            <h6 className={styles.doctorName}>{doctor.name}</h6>
            <p className={styles.doctorCredentials}>{doctor.title}</p>
          </div>

          {compact && (
            <button
              className={styles.btnViewProfile}
              style={{ marginLeft: "auto", whiteSpace: "nowrap" }}
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile(doctor.id);
              }}
            >
              View Profile
            </button>
          )}
        </div>

        {/* ── Full details: only when NOT compact ── */}
        {!compact && (
          <>
            {/* ── Consultation Availability ── */}
            <div className={styles.consultationAvailability}>
              <p className={styles.availabilityLabel}>
                Consultation Availability
              </p>

              {schedule === null ? (
                // Still loading
                <p className={styles.scheduleTime} style={{ color: "#9e84c2" }}>
                  Loading availability…
                </p>
              ) : scheduleEntries.length === 0 ? (
                // Loaded but empty
                <p className={styles.scheduleTime} style={{ color: "#aaa" }}>
                  No availability set
                </p>
              ) : (
                <div className={styles.availabilityDetails}>
                  {/* Day pills */}
                  <div className={styles.availabilityItem}>
                    <FaCalendarCheck className={styles.iconSmall} />
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {scheduleEntries.map((entry) => (
                        <span
                          key={entry.day}
                          style={{
                            background: "#ede7f6",
                            color: "#4D227C",
                            borderRadius: 20,
                            padding: "2px 8px",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {entry.day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Unique slot types across all days */}
                  {[...new Set(scheduleEntries.map((e) => e.slotType))].map(
                    (type) => (
                      <SlotBadge key={type} type={type} />
                    ),
                  )}
                </div>
              )}
            </div>

            {/* ── Earliest Available Schedule ── */}
            <div className={styles.earliestSchedule}>
              <p className={styles.scheduleLabel}>
                Earliest Available Schedule
              </p>

              {schedule === null ? (
                <p className={styles.scheduleTime} style={{ color: "#9e84c2" }}>
                  Loading…
                </p>
              ) : earliest ? (
                <div className={styles.scheduleInfo}>
                  <div className={styles.scheduleItem}>
                    <FaCalendarCheck className={styles.iconSmall} />
                    <span style={{ fontWeight: 600 }}>{earliest.day}</span>
                  </div>
                  <p className={styles.scheduleTime}>
                    {formatTime(earliest.startTime)} –{" "}
                    {formatTime(earliest.endTime)}
                  </p>
                  <SlotBadge type={earliest.slotType} />
                </div>
              ) : (
                <p className={styles.scheduleTime} style={{ color: "#aaa" }}>
                  —
                </p>
              )}
            </div>

            {/* ── Action buttons ── */}
            <div className={styles.cardActions}>
              <button
                className={styles.btnViewProfile}
                onClick={() => onViewProfile(doctor.id)}
              >
                View Profile
              </button>
              <button
                className={styles.btnBookAppointment}
                onClick={() => onSetAppointment(doctor.id)}
              >
                Set Appointment
              </button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default DoctorCard;

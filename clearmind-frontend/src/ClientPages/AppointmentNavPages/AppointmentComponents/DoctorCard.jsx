// DoctorCard.jsx
import React from "react";
import { Card, Button } from "react-bootstrap";
import {
  FaVideo,
  FaClinicMedical,
  FaCalendarCheck,
  FaUserCircle,
} from "react-icons/fa";
import styles from "./styles/DoctorCard.module.css";

const getConsultationIcon = (mode) =>
  mode === "Virtual" ? (
    <FaVideo className={styles.consultationIcon} />
  ) : (
    <FaClinicMedical className={styles.consultationIcon} />
  );

const formatScheduleDays = (days) => {
  if (!days || days.length === 0) return "";
  if (days.length === 1) return days[0];
  if (days.length === 2) return days.join(" & ");
  return `${days.slice(0, -1).join(", ")} & ${days[days.length - 1]}`;
};

const DoctorCard = ({
  doctor,
  isSelected,
  compact,
  onViewProfile,
  onSetAppointment,
  onSelect,
  hideViewProfileBtn = false,
  hideSetAppointment = false,
}) => {
  return (
    <Card
      className={`
        ${styles.doctorCard}
        ${isSelected ? styles.doctorCardSelected : ""}
        ${compact ? styles.doctorCardCompact : ""}
      `}
      onClick={compact && onSelect ? () => onSelect(doctor.id) : undefined} // ✅ FIXED
      style={{ cursor: compact && onSelect ? "pointer" : "default" }}
    >
      <Card.Body
        className={`${styles.cardBody} ${compact ? styles.cardBodyCompact : ""}`}
      >
        {" "}
        <div className={styles.doctorHeader}>
          {/* Radio indicator */}
          {compact && onSelect && (
            <div
              className={`${styles.radioIndicator} ${isSelected ? styles.radioSelected : styles.radioUnselected}`}
            />
          )}

          {/* Avatar */}
          <div className={styles.doctorAvatar}>
            {doctor.photo ? (
              <img
                src={doctor.photo}
                alt={doctor.name}
                className={styles.avatarImg}
              />
            ) : (
              <FaUserCircle className={styles.avatarIcon} />
            )}
          </div>

          {/* Name + Title */}
          <div className={styles.doctorInfo}>
            <h6 className={styles.doctorName}>{doctor.name}</h6>
            <p className={styles.doctorCredentials}>{doctor.title}</p>
          </div>

          {/* Compact header button */}
          {compact && !hideViewProfileBtn && (
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
        {/* ✅ FULL DETAILS - ADD THESE BACK */}
        {!compact && (
          <>
            {/* Consultation Availability */}
            <div className={styles.consultationAvailability}>
              <p className={styles.availabilityLabel}>
                Consultation Availability
              </p>
              <div className={styles.availabilityDetails}>
                {doctor.consultationMode && (
                  <div className={styles.availabilityItem}>
                    {getConsultationIcon(doctor.consultationMode)}
                    <span>
                      {doctor.consultationType || doctor.consultationMode}
                    </span>
                  </div>
                )}
                {doctor.schedule?.days && (
                  <div className={styles.availabilityItem}>
                    <FaCalendarCheck className={styles.iconSmall} />
                    <span>{formatScheduleDays(doctor.schedule.days)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Earliest Schedule */}
            {doctor.schedule?.earliest && (
              <div className={styles.earliestSchedule}>
                <p className={styles.scheduleLabel}>
                  Earliest Available Schedule
                </p>
                <div className={styles.scheduleInfo}>
                  <div className={styles.scheduleItem}>
                    <FaCalendarCheck className={styles.iconSmall} />
                    <span>{doctor.schedule.earliest}</span> {/* ← iisa lang */}
                  </div>
                  {doctor.schedule?.time && (
                    <p className={styles.scheduleTime}>
                      {doctor.schedule.time}
                    </p>
                  )}
                  {doctor.consultationFees?.initialConsultation && (
                    <p className={styles.scheduleFee}>
                      Fee: ₱
                      {doctor.consultationFees.initialConsultation.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className={styles.cardActions}>
              {!hideViewProfileBtn && (
                <button
                  className={styles.btnViewProfile}
                  onClick={() => onViewProfile(doctor.id)}
                >
                  View Profile
                </button>
              )}
              {!hideSetAppointment && (
                <button
                  className={styles.btnBookAppointment}
                  onClick={() => onSetAppointment(doctor.id)}
                >
                  Set Appointment
                </button>
              )}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};
export default DoctorCard;

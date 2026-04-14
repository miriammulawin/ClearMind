// DoctorCard.jsx
// Usage (doctor):  <DoctorCard doctor={doctor} onViewProfile={fn} onSetAppointment={fn} />
// Usage (rpm):     <DoctorCard doctor={rpm} variant="rpm" isSelected={bool} onSelect={fn} />

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
  if (days.length === 1) return days[0];
  if (days.length === 2) return days.join(" & ");
  const lastDay = days[days.length - 1];
  const otherDays = days.slice(0, -1).join(", ");
  return `${otherDays} & ${lastDay}`;
};

// ── Doctor variant ────────────────────────────────────────────────────────────
const DoctorVariant = ({
  doctor,
  onViewProfile,
  onSetAppointment,
  hideSetAppointment,
  viewProfileVariant = "outline",
  onSelect,
  isSelected,
  compact,
}) => (
  <Card
    className={`${styles.doctorCard} ${isSelected ? styles.doctorCardSelected : ""}`}
    onClick={onSelect ? () => onSelect(doctor.id) : undefined}
  >
    <Card.Body className={styles.cardBody}>
      {/* Header */}
      <div className={styles.doctorHeader}>
        {onSelect && (
          <div
            className={`${styles.radioIndicator} ${isSelected ? styles.radioSelected : styles.radioUnselected}`}
          />
        )}
        <div className={styles.doctorAvatar}>
          <FaUserCircle className={styles.avatarIcon} />
        </div>
        <div className={styles.doctorInfo}>
          <h6 className={styles.doctorName}>{doctor.name}</h6>
          <p className={styles.doctorCredentials}>{doctor.credentials}</p>
        </div>
        {compact && (
          <Button
            className={
              viewProfileVariant === "purple"
                ? styles.btnBookAppointment // purple
                : styles.btnViewProfile // outline
            }
            onClick={(e) => {
              e.stopPropagation(); // prevent card click triggering onSelect
              onViewProfile(doctor.id);
            }}
          >
            VIEW PROFILE
          </Button>
        )}
      </div>

      {/* Consultation Availability */}
      <div className={styles.consultationAvailability}>
        <p className={styles.availabilityLabel}>Consultation Availability</p>
        <div className={styles.availabilityDetails}>
          <div className={styles.availabilityItem}>
            <FaCalendarCheck className={styles.iconSmall} />
            <span>{formatScheduleDays(doctor.schedule.days)}</span>
          </div>
          <div className={styles.availabilityItem}>
            {getConsultationIcon(doctor.consultationMode)}
            <span>{doctor.consultationType}</span>
          </div>
        </div>
      </div>

      {/* Earliest Schedule */}
      {!compact && (
        <>
          <div className={styles.earliestSchedule}>
            <p className={styles.scheduleLabel}>Earliest Available Schedule</p>
            <div className={styles.scheduleInfo}>
              <div className={styles.scheduleItem}>
                {getConsultationIcon(doctor.consultationMode)}
                <span>{doctor.consultationType}</span>
              </div>
              <p className={styles.scheduleTime}>
                {doctor.availability[0]?.day},{" "}
                {doctor.availability[0]?.slots.find((s) => s.available)?.time ||
                  "N/A"}
              </p>
              <p className={styles.scheduleFee}>
                Fee: ₱
                {doctor.consultationFees.initialConsultation.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className={`${styles.cardActions} mt-3`}>
            <Button
              className={
                viewProfileVariant === "purple"
                  ? styles.btnBookAppointment
                  : styles.btnViewProfile
              }
              onClick={() => onViewProfile(doctor.id)}
            >
              VIEW PROFILE
            </Button>
            {onSelect && (
              <Button
                className={styles.btnBookAppointment}
                onClick={() => onSelect(doctor.id)}
              >
                SELECT
              </Button>
            )}
            {!hideSetAppointment && (
              <Button
                variant="purple"
                className={styles.btnBookAppointment}
                onClick={() => onSetAppointment(doctor.id)}
              >
                SET APPOINTMENT
              </Button>
            )}
          </div>
        </>
      )}
    </Card.Body>
  </Card>
);

const DoctorCard = ({
  doctor,
  onViewProfile,
  onSetAppointment,
  hideSetAppointment = false,
  viewProfileVariant = "outline",
  onSelect,
  isSelected,
  compact,
}) => (
  <DoctorVariant
    doctor={doctor}
    onViewProfile={onViewProfile}
    onSetAppointment={onSetAppointment}
    hideSetAppointment={hideSetAppointment}
    viewProfileVariant={viewProfileVariant}
    onSelect={onSelect}
    isSelected={isSelected}
    compact={compact}
  />
);

export default DoctorCard;

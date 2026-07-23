import React from "react";
import { Card, Button } from "react-bootstrap";
import { FaVideo, FaClinicMedical } from "react-icons/fa";
import styles from "./styles/AppointmentCard.module.css";
import StatusBadge from "./StatusBadge";
import SessionProgressBar from "./SessionProgressBar";

const getDayOfWeek = (dateString) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date(dateString);
  return days[date.getDay()];
};

// "2026-07-30" -> "July 30, 2026"
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// "09:00" or "09:00:00" -> "9:00 AM"
// "09:00 - 10:00" (range from AppointmentDetails-style strings) also supported
const formatTime = (timeString) => {
  if (!timeString) return "";

  const formatSingle = (t) => {
    const [hStr, mStr] = t.trim().split(":");
    const h = parseInt(hStr, 10);
    if (isNaN(h)) return t;
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${mStr} ${suffix}`;
  };

  if (timeString.includes(" - ")) {
    return timeString.split(" - ").map(formatSingle).join(" - ");
  }
  return formatSingle(timeString);
};

const getAppointmentIcon = (type) => {
  if (type === "Clinic - CMPS") {
    return <FaClinicMedical className={styles.appointmentIcon} />;
  }
  return <FaVideo className={styles.appointmentIcon} />;
};

const AppointmentCard = ({ appointment, onViewDetails }) => {
  const {
    id,
    referenceNumber,
    status,
    time,
    date,
    type,
    serviceType,
    doctor,
    programId,
    sessionNumber,
    totalSessions,
    progressionStatus,
  } = appointment;

  const isPartOfProgram = !!programId;

  return (
    <Card className={styles.appointmentCard}>
      <Card.Body>
        {/* Status Badge */}
        <StatusBadge status={status} className={styles.statusBadgePosition} />

        <div className={styles.appointmentDetails}>
          <div className={styles.appointmentInfo}>
            {/* Session Indicator — only shown for program appointments */}
            {isPartOfProgram && (
              <div className={styles.sessionIndicatorRow}>
                <SessionProgressBar
                  variant="mini"
                  sessionNumber={sessionNumber}
                  totalSessions={totalSessions}
                  progressionStatus={progressionStatus}
                  showLegend={false}
                />
              </div>
            )}

            {/* Reference Number */}
            <div className={styles.infoRow}>
              <span className={styles.label}>Ref #:</span>
              <span className={styles.value}>{referenceNumber}</span>
            </div>

            {/* Time */}
            <div className={styles.infoRow}>
              <span className={styles.label}>Time:</span>
              <span className={styles.value}>{formatTime(time)}</span>
            </div>

            {/* Date */}
            <div className={styles.infoRow}>
              <span className={styles.label}>Date:</span>
              <span className={`${styles.value} ${styles.dateValue}`}>
                {formatDate(date)} ({getDayOfWeek(date)})
              </span>
            </div>

            <hr className={styles.divider} />

            {/* Consultation Type */}
            <div className={`${styles.infoRow} ${styles.consultationType}`}>
              {getAppointmentIcon(type)}
              <span>{type}</span>
            </div>

            {/* Service Type */}
            <div className={styles.infoRow}>
              <span className={styles.label}>Type of Service:</span>
              <span className={`${styles.value} ${styles.serviceType}`}>
                {serviceType}
              </span>
            </div>

            {/* Doctor */}
            <div className={styles.infoRow}>
              <span className={styles.label}>Assigned Doctor:</span>
              <span className={`${styles.value} ${styles.doctorName}`}>
                {doctor}
              </span>
            </div>
          </div>

          {/* View Details Button */}
          <Button
            variant="outline-purple"
            className={styles.viewDetailsBtn}
            onClick={() => onViewDetails(id)}
          >
            VIEW DETAILS
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AppointmentCard;

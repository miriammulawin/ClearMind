import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge } from "react-bootstrap";
import { FaUserCircle, FaVideo, FaClinicMedical } from "react-icons/fa";
import styles from "./styles/DoctorProfile.module.css";

// Maps a camelCase fee key like "initialConsultation" → "Initial Consultation"
const formatFeeLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const DoctorProfile = ({ doctorData, onBookAppointment, onBack }) => {
  const navigate = useNavigate();
  console.log("DoctorProfile doctorData:", doctorData);
  if (!doctorData) return null;

  const handleBookAppointment = () => {
    if (onBookAppointment) onBookAppointment();
    navigate(
      "/client/appointment/psychotherapy-and-counseling/set-appointment-form",
      {
        state: { doctor: doctorData },
        replace: true,
      },
    );
  };

  const getConsultationIcon = (mode) => {
    return mode === "Virtual" ? (
      <FaVideo className={styles.consultationIcon} />
    ) : (
      <FaClinicMedical className={styles.consultationIcon} />
    );
  };

  const formatScheduleDays = (days) => {
    if (!days || days.length === 0) return "—";
    if (days.length === 1) return days[0];
    if (days.length === 2) return days.join(" & ");
    const lastDay = days[days.length - 1];
    const otherDays = days.slice(0, -1).join(", ");
    return `${otherDays} & ${lastDay}`;
  };

  // Use the doctor's own consultationFees object
  const fees = doctorData?.consultationFees ?? {};

  return (
    <div className={styles.bookingView}>
      <Card className={`${styles.profileCard} mb-4`}>
        <Card.Body className={styles.cardBody}>
          {/* Header */}
          <div className={styles.doctorHeaderCentered}>
            <div className={styles.doctorAvatarLarge}>
              <FaUserCircle className={styles.avatarIconLarge} />
            </div>
            <div className={styles.doctorInfoFull}>
              <h5 className={styles.doctorNameLarge}>{doctorData.name}</h5>
              <p className={styles.doctorTitle}>{doctorData.title}</p>
              <p className={styles.doctorCredentialsFull}>
                {doctorData.credentials}
              </p>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Schedule */}
          <div className={styles.scheduleDetails}>
            <h6 className={styles.sectionTitle}>Schedule</h6>
            <div className={styles.scheduleRow}>
              <span className={styles.scheduleLabelText}>Days:</span>
              <span className={styles.scheduleValue}>
                {formatScheduleDays(doctorData.schedule?.days)}
              </span>
            </div>
            <div className={styles.scheduleRow}>
              <span className={styles.scheduleLabelText}>Time:</span>
              <span className={styles.scheduleValue}>
                {doctorData.schedule?.time ?? "—"}
              </span>
            </div>
            <div className={styles.scheduleRow}>
              <span className={styles.scheduleLabelText}>Type:</span>
              <Badge className={styles.consultationBadge}>
                {getConsultationIcon(doctorData.consultationMode)}
                {doctorData.consultationType}
              </Badge>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Fees — dynamically rendered from each doctor's consultationFees */}
          <div className={styles.feesDetails}>
            <h6 className={styles.sectionTitle}>Consultation Fees</h6>
            {Object.entries(fees).length > 0 ? (
              Object.entries(fees).map(([key, amount]) => (
                <div className={styles.feeRow} key={key}>
                  <span>{formatFeeLabel(key)}:</span>
                  <span className={styles.feeAmount}>
                    ₱{amount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className={styles.scheduleValue}>
                No fee information available.
              </p>
            )}
          </div>

          <button
            type="button"
            className={`${styles.btnBookAppointment} w-100 `}
            onClick={handleBookAppointment}
          >
            SET APPOINTMENT
          </button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DoctorProfile;

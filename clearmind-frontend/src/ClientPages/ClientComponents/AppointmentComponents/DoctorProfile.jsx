import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaUserCircle, FaVideo, FaClinicMedical } from 'react-icons/fa';
import { CONSULTATION_FEES } from '../../../MockData/MockDoctors.js';
import styles from '../../ClientStyle/SetAppointment.module.css';

const DoctorProfile = ({ 
  doctorData, 
  onBookAppointment,  
}) => {

  const getConsultationIcon = (mode) => {
    return mode === 'Online' ? 
      <FaVideo className={styles.consultationIcon} /> : 
      <FaClinicMedical className={styles.consultationIcon} />;
  };

  const formatScheduleDays = (days) => {
    if (days.length === 1) return days[0];
    if (days.length === 2) return days.join(' & ');
    if (days.length > 2) {
      const lastDay = days[days.length - 1];
      const otherDays = days.slice(0, -1).join(', ');
      return `${otherDays} & ${lastDay}`;
    }
    return '';
  };

  return (
    <div className={styles.bookingView}>

      {/* Doctor Profile Card */}
      <Card className={`${styles.profileCard} mb-4`}>
        <Card.Body className={styles.cardBody}>

          <div className={styles.doctorHeaderCentered}>
            <div className={styles.doctorAvatarLarge}>
              <FaUserCircle className={styles.avatarIconLarge} />
            </div>
            <div className={styles.doctorInfoFull}>
              <h5 className={styles.doctorNameLarge}>{doctorData.name}</h5>
              <p className={styles.doctorTitle}>{doctorData.title}</p>
              <p className={styles.doctorCredentialsFull}>{doctorData.credentials}</p>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.scheduleDetails}>
            <h6 className={styles.sectionTitle}>Schedule</h6>
            <div className={styles.scheduleRow}>
              <span className={styles.scheduleLabelText}>Days:</span>
              <span className={styles.scheduleValue}>{formatScheduleDays(doctorData.schedule.days)}</span>
            </div>
            <div className={styles.scheduleRow}>
              <span className={styles.scheduleLabelText}>Time:</span>
              <span className={styles.scheduleValue}>{doctorData.schedule.time}</span>
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

          <div className={styles.feesDetails}>
            <h6 className={styles.sectionTitle}>Consultation Fees</h6>
            <div className={styles.feeRow}>
              <span>Initial Consultation:</span>
              <span className={styles.feeAmount}>₱{CONSULTATION_FEES.initial.toLocaleString()}</span>
            </div>
            <div className={styles.feeRow}>
              <span>Follow-up Session:</span>
              <span className={styles.feeAmount}>₱{CONSULTATION_FEES.followUp.toLocaleString()}</span>
            </div>
          </div>

          <Button
            className={`${styles.btnBookAppointment} w-100 mt-4`}
            onClick={onBookAppointment}
          >
            SET APPOINTMENT
          </Button>

        </Card.Body>
      </Card>
    </div>
  );
};

export default DoctorProfile;
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaVideo, FaClinicMedical } from 'react-icons/fa';
import styles from './styles/AppointmentCard.module.css';

// All badge colors are handled purely via CSS module — no Bootstrap bg variant needed
const STATUS_CONFIG = {
  Pending:     { label: 'Pending' },
  Confirmed:   { label: 'Confirmed' },
  Rescheduled: { label: 'Rescheduled' },
  Completed:   { label: 'Completed' },
  Cancelled:   { label: 'Cancelled' },
};

const getDayOfWeek = (dateString) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return days[date.getDay()];
};

const getAppointmentIcon = (type) => {
  if (type === 'Clinic - CMPS') {
    return <FaClinicMedical className={styles.appointmentIcon} />;
  }
  return <FaVideo className={styles.appointmentIcon} />;
};

const AppointmentCard = ({ appointment, onViewDetails }) => {
  const { id, status, time, date, type, serviceType, doctor } = appointment;

  const statusConfig = STATUS_CONFIG[status] || { label: status };

  return (
    <Card className={styles.appointmentCard}>
      <Card.Body>
        {/* Status Badge — color driven entirely by CSS module class */}
        <span className={`${styles.statusBadge} ${styles[`badge${status}`]}`}>
          {statusConfig.label}
        </span>

        <div className={styles.appointmentDetails}>
          <div className={styles.appointmentInfo}>
            {/* Time */}
            <div className={styles.infoRow}>
              <span className={styles.label}>Time:</span>
              <span className={styles.value}>{time}</span>
            </div>

            {/* Date */}
            <div className={styles.infoRow}>
              <span className={styles.label}>Date:</span>
              <span className={`${styles.value} ${styles.dateValue}`}>
                {date} ({getDayOfWeek(date)})
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
              <span className={`${styles.value} ${styles.serviceType}`}>{serviceType}</span>
            </div>

            {/* Doctor */}
            <div className={styles.infoRow}>
              <span className={styles.label}>Assigned Doctor:</span>
              <span className={`${styles.value} ${styles.doctorName}`}>{doctor}</span>
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
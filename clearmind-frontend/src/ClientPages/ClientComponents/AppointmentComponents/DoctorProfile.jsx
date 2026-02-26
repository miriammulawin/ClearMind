import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FaUserCircle, FaVideo, FaClinicMedical } from 'react-icons/fa';
import { CONSULTATION_FEES } from '../../../MockData/MockDoctors.js';

const DoctorProfile = ({ 
  doctorData, 
  onBookAppointment,  
}) => {
  // Helper function to get consultation icon
  const getConsultationIcon = (mode) => {
    return mode === 'Online' ? 
      <FaVideo className="consultation-icon" /> : 
      <FaClinicMedical className="consultation-icon" />;
  };

  // Helper function to format schedule days
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
    <div className="booking-view">

      {/* Doctor Profile Card */}
      <Card className="profile-card mb-4">
        <Card.Body>
          <div className="doctor-header">
            <div className="doctor-avatar-large">
              <FaUserCircle className="avatar-icon-large" />
            </div>
            <div className="doctor-info-full">
              <h5 className="doctor-name-large">{doctorData.name}</h5>
              <p className="doctor-title">{doctorData.title}</p>
              <p className="doctor-credentials-full">{doctorData.credentials}</p>
            </div>
          </div>

          <hr className="divider" />

          <div className="schedule-details">
            <h6 className="section-title">Schedule</h6>
            <div className="schedule-row">
              <span className="schedule-label-text">Days:</span>
              <span className="schedule-value">{formatScheduleDays(doctorData.schedule.days)}</span>
            </div>
            <div className="schedule-row">
              <span className="schedule-label-text">Time:</span>
              <span className="schedule-value">{doctorData.schedule.time}</span>
            </div>
            <div className="schedule-row">
              <span className="schedule-label-text">Type:</span>
              <Badge className="consultation-badge">
                {getConsultationIcon(doctorData.consultationMode)}
                {doctorData.consultationType}
              </Badge>
            </div>
          </div>

          <hr className="divider" />

          <div className="fees-details">
            <h6 className="section-title">Consultation Fees</h6>
            <div className="fee-row">
              <span>Initial Consultation:</span>
              <span className="fee-amount">₱{CONSULTATION_FEES.initial.toLocaleString()}</span>
            </div>
            <div className="fee-row">
              <span>Follow-up Session:</span>
              <span className="fee-amount">₱{CONSULTATION_FEES.followUp.toLocaleString()}</span>
            </div>
          </div>

          {/* Book Appointment Button */}
          <Button
            variant="purple"
            className="btn-book-appointment w-100 mt-4"
            onClick={onBookAppointment}
          >
            BOOK APPOINTMENT
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DoctorProfile;
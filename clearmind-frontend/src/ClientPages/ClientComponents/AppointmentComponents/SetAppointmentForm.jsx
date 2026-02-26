import React, { useState } from 'react';
import { Image } from "react-bootstrap";
import { Container, Card, Button, Form } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaVideo, FaHome } from 'react-icons/fa';
import { CONSULTATION_FEES } from '../../../MockData/MockDoctors.js';
import styles from '../../ClientStyle/BookAppointmentForm.module.css';
import logo_login_single from "../../../../src/assets/CMPS_Img_logo_only.png";


const SetAppointmentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const doctorData = location.state?.doctor;

  const [consultationMode, setConsultationMode] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Handler for selecting consultation mode
  const handleModeSelect = (mode) => {
    setConsultationMode(mode);
  };

  // Handler for selecting date
  const handleSelectDate = (dateSlot) => {
    setSelectedDate(dateSlot);
    setSelectedTime(null);
  };

  // Handler for selecting time slot
  const handleSelectTime = (time) => {
    setSelectedTime(time);
  };

  // Handler for continue button
  const handleContinue = () => {
    if (consultationMode && selectedDate && selectedTime) {
      // Navigate to payment or next step
      alert(`Proceeding to payment...\n\nMode: ${consultationMode}\nDate: ${selectedDate.date}\nTime: ${selectedTime}`);
      // You can navigate to payment page here
      // navigate('/client/appointment/payment', { state: { doctor: doctorData, consultationMode, selectedDate, selectedTime } });
    } else {
      alert('Please complete all fields before continuing.');
    }
  };

  // Check if form is complete
  const isFormComplete = consultationMode && selectedDate && selectedTime;

  if (!doctorData) {
    return (
      <Container className={styles.container}>
        <p>No doctor selected. Please go back and select a doctor.</p>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      {/* Header with Doctor Info */}
      <div className={styles.header}>
        <div className={styles.doctorInfo}>
          <div className={styles.doctorAvatar}>
            <div className={styles.avatarCircle}>
              {doctorData.name.charAt(0)}
            </div>
          </div>
          <div className={styles.doctorDetails}>
            <p className={styles.assignedLabel}>Assigned Doctor</p>
            <h5 className={styles.doctorName}>{doctorData.name}</h5>
            <p className={styles.doctorCredentials}>{doctorData.credentials}</p>
          </div>
        </div>
        <div className={styles.logoIconProfile}>
            <Image src={logo_login_single } fluid className=" d-block mx-auto" />
        </div>
      </div>

      {/* Stepper */}
      <div className={styles.stepper}>
        <div className={styles.stepperItem}>
          <div className={`${styles.stepCircle} ${styles.active}`}>1</div>
          <p className={styles.stepLabel}>Schedule</p>
        </div>
        <div className={styles.stepperLine}></div>
        <div className={styles.stepperItem}>
          <div className={styles.stepCircle}>2</div>
          <p className={styles.stepLabel}>Verify Profile</p>
        </div>
        <div className={styles.stepperLine}></div>
        <div className={styles.stepperItem}>
          <div className={styles.stepCircle}>3</div>
          <p className={styles.stepLabel}>Payment</p>
        </div>
      </div>

      {/* Consultation Mode Selection */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>
          <span className={styles.required}>*</span> Select which mode of consultation do you prefer.
        </p>
        <div className={styles.modeButtons}>
          <button
            className={`${styles.modeButton} ${consultationMode === 'IN-PERSON' ? styles.selected : ''}`}
            onClick={() => handleModeSelect('IN-PERSON')}
          >
            <FaHome className={styles.modeIcon} />
            <span>IN-PERSON</span>
          </button>
          <button
            className={`${styles.modeButton} ${consultationMode === 'ONLINE' ? styles.selected : ''}`}
            onClick={() => handleModeSelect('ONLINE')}
          >
            <FaVideo className={styles.modeIcon} />
            <span>ONLINE</span>
          </button>
        </div>
      </div>

      {/* Date Selection */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>
          <span className={styles.required}>*</span> Select Date
        </p>
        <div className={styles.datesGrid}>
          {doctorData.availability.map((dateSlot, index) => (
            <div
              key={index}
              className={`${styles.dateCard} ${selectedDate?.date === dateSlot.date ? styles.selectedDate : ''}`}
              onClick={() => handleSelectDate(dateSlot)}
            >
              <div className={styles.dateDay}>{dateSlot.day}</div>
              <div className={styles.dateText}>{dateSlot.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>
            <span className={styles.required}>*</span> Select Time
          </p>
          <div className={styles.timeSlotsGrid}>
            {selectedDate.slots.map((slot, index) => (
              <button
                key={index}
                className={`${styles.timeSlot} ${selectedTime === slot.time ? styles.selectedTime : ''} ${!slot.available ? styles.disabled : ''}`}
                disabled={!slot.available}
                onClick={() => slot.available && handleSelectTime(slot.time)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Booking Summary (shown when all fields are selected) */}
      {isFormComplete && (
        <Card className={styles.summaryCard}>
          <Card.Body>
            <h6 className={styles.summaryTitle}>Booking Summary</h6>
            <div className={styles.summaryRow}>
              <span>Doctor:</span>
              <span className={styles.summaryValue}>{doctorData.name}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Mode:</span>
              <span className={styles.summaryValue}>{consultationMode}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Date:</span>
              <span className={styles.summaryValue}>{selectedDate.date}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Time:</span>
              <span className={styles.summaryValue}>{selectedTime}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.feeRow}`}>
              <span>Fee:</span>
              <span className={styles.summaryFee}>₱{CONSULTATION_FEES.initial.toLocaleString()}</span>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <Button
          variant="outline-secondary"
          className={styles.backButton}
          onClick={() => navigate(-1)}
        >
          GO BACK
        </Button>
        <Button
          variant={isFormComplete ? 'primary' : 'secondary'}
          className={styles.continueButton}
          disabled={!isFormComplete}
          onClick={handleContinue}
        >
          CONTINUE
        </Button>
      </div>
    </Container>
  );
};

export default SetAppointmentForm;
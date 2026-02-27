import React, { useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaVideo, FaClinicMedical, FaCalendarCheck, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import MOCK_DOCTORS, { CONSULTATION_FEES } from '../../../MockData/MockDoctors.js';
import DoctorProfile from './DoctorProfile.jsx';
import styles from '../../ClientStyle/SetAppointment.module.css';

const SetAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedService = location.state?.selectedService;
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

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

  const handleViewProfile = (doctorId) => {
    setSelectedDoctor(doctorId);
    setSelectedDate(null);
    setSelectedTime(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetAppointment = (doctorId) => {
    const doctor = MOCK_DOCTORS.find(d => d.id === doctorId);
    if (doctor) {
      navigate('/client/appointment/set-appointment-form', {
        state: { 
          doctor: doctor,
          selectedService: selectedService
        }
      });
    }
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleSelectTime = (time) => {
    setSelectedTime(time);
  };

  const handleConfirmBooking = () => {
    const doctor = MOCK_DOCTORS.find(d => d.id === selectedDoctor);
    if (doctor && selectedDate && selectedTime) {
      alert(`Appointment Confirmed!\n\nDoctor: ${doctor.name}\nDate: ${selectedDate.date}\nTime: ${selectedTime}\n\nThis will be connected to backend soon.`);
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  const handleBackToDoctors = () => {
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const doctorData = selectedDoctor ? MOCK_DOCTORS.find(d => d.id === selectedDoctor) : null;

  return (
    <Container className={`${styles.bookAppointmentContainer} py-4`}>
      <div className={styles.titleContainerBook}>
        <h5 className={styles.titleBookAppointment}>SET AN APPOINTMENT</h5>
        <Button
          variant="button"
          className={styles.backToServices}
          onClick={() => {
            if (selectedDoctor) {
              handleBackToDoctors();
            } else {
              navigate(-1);
            }
          }}
        >
          <FaArrowLeft /> Go Back
        </Button>
      </div>

      {selectedService && (
        <Alert className={styles.serviceAlert}>
          <strong>Selected Service:</strong> {selectedService}
        </Alert>
      )}

      {!selectedDoctor ? (
        <div className={styles.doctorsList}>
          {MOCK_DOCTORS.map((doctor) => (
            <Card key={doctor.id} className={styles.doctorCard}>
              <Card.Body className={styles.cardBody}>
                <div className={styles.doctorHeader}>
                  <div className={styles.doctorAvatar}>
                    <FaUserCircle className={styles.avatarIcon} />
                  </div>
                  <div className={styles.doctorInfo}>
                    <h6 className={styles.doctorName}>{doctor.name}</h6>
                    <p className={styles.doctorCredentials}>{doctor.credentials}</p>
                  </div>
                </div>

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

                <div className={styles.earliestSchedule}>
                  <p className={styles.scheduleLabel}>Earliest Available Schedule</p>
                  <div className={styles.scheduleInfo}>
                    <div className={styles.scheduleItem}>
                      {getConsultationIcon(doctor.consultationMode)}
                      <span>{doctor.consultationType}</span>
                    </div>
                    <p className={styles.scheduleTime}>
                      {doctor.availability[0]?.day}, {doctor.availability[0]?.slots.find(s => s.available)?.time || 'N/A'}
                    </p>
                    <p className={styles.scheduleFee}>Fee: ₱{CONSULTATION_FEES.initial.toLocaleString()}</p>
                  </div>
                </div>

                <div className={`${styles.cardActions} mt-3`}>
                  <Button
                    variant="outline-purple"
                    className={styles.btnViewProfile}
                    onClick={() => handleViewProfile(doctor.id)}
                  >
                    VIEW PROFILE
                  </Button>
                  <Button
                    variant="purple"
                    className={styles.btnBookAppointment}
                    onClick={() => handleSetAppointment(doctor.id)}
                  >
                    SET APPOINTMENT
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        doctorData && (
          <DoctorProfile
            doctorData={doctorData}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={handleSelectDate}
            onSelectTime={handleSelectTime}
            onConfirmBooking={handleConfirmBooking}
            onBack={handleBackToDoctors}
          />
        )
      )}
    </Container>
  );
};

export default SetAppointment;
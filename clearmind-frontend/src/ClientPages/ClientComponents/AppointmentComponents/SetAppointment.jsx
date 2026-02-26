import React, { useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaVideo, FaClinicMedical, FaCalendarCheck, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import MOCK_DOCTORS, { CONSULTATION_FEES } from '../../../MockData/MockDoctors.js';
import DoctorProfile from './DoctorProfile.jsx';
import '../../ClientStyle/BookAppointment.css';

const BookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedService = location.state?.selectedService;
  
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

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

  // Handler for View Profile button
  const handleViewProfile = (doctorId) => {
    setSelectedDoctor(doctorId);
    setSelectedDate(null);
    setSelectedTime(null);
    // Scroll to top when viewing profile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler for Book Appointment button - Navigate to new booking form
  const handleBookAppointment = (doctorId) => {
    const doctor = MOCK_DOCTORS.find(d => d.id === doctorId);
    if (doctor) {
      // Navigate to the new booking form with doctor data
      navigate('/client/appointment/book-form', {
        state: { 
          doctor: doctor,
          selectedService: selectedService
        }
      });
    }
  };

  // Handler for selecting date
  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  // Handler for selecting time slot
  const handleSelectTime = (time) => {
    setSelectedTime(time);
  };

  // Handler for confirming booking
  const handleConfirmBooking = () => {
    const doctor = MOCK_DOCTORS.find(d => d.id === selectedDoctor);
    if (doctor && selectedDate && selectedTime) {
      alert(`Appointment Confirmed!\n\nDoctor: ${doctor.name}\nDate: ${selectedDate.date}\nTime: ${selectedTime}\n\nThis will be connected to backend soon.`);
      // Reset selections
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  // Handler for back to doctors list
  const handleBackToDoctors = () => {
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  // Get selected doctor data
  const doctorData = selectedDoctor ? MOCK_DOCTORS.find(d => d.id === selectedDoctor) : null;

  return (
    <Container className="book-appointment-container py-4">
      {/* Back button to return to services */}
      <div className='title-container-book'>
        <h5 className="title-book-appointment mb-3">BOOK APPOINTMENT</h5>
        <Button
            variant="button"
            className="back-to-services mb-3"
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

      {/* Display selected service if available */}
      {selectedService && (
        <Alert className="service-alert">
          <strong>Selected Service:</strong> {selectedService}
        </Alert>
      )}

      {!selectedDoctor ? (
        // Doctor List View
        <div className="doctors-list">
          {MOCK_DOCTORS.map((doctor) => (
            <Card key={doctor.id} className="doctor-card">
              <Card.Body>
                <div className="doctor-header">
                  <div className="doctor-avatar">
                    <FaUserCircle className="avatar-icon" />
                  </div>
                  <div className="doctor-info">
                    <h6 className="doctor-name">{doctor.name}</h6>
                    <p className="doctor-credentials">{doctor.credentials}</p>
                  </div>
                </div>

                <div className="consultation-availability">
                  <p className="availability-label">Consultation Availability</p>
                  <div className="availability-details">
                    <div className="availability-item">
                      <FaCalendarCheck className="icon-small" />
                      <span>{formatScheduleDays(doctor.schedule.days)}</span>
                    </div>
                    <div className="availability-item">
                      {getConsultationIcon(doctor.consultationMode)}
                      <span>{doctor.consultationType}</span>
                    </div>
                  </div>
                </div>

                <div className="earliest-schedule">
                  <p className="schedule-label">Earliest Available Schedule</p>
                  <div className="schedule-info">
                    <div className="schedule-item">
                      {getConsultationIcon(doctor.consultationMode)}
                      <span>{doctor.consultationType}</span>
                    </div>
                    <p className="schedule-time">
                      {doctor.availability[0]?.day}, {doctor.availability[0]?.slots.find(s => s.available)?.time || 'N/A'}
                    </p>
                    <p className="schedule-fee">Fee: ₱{CONSULTATION_FEES.initial.toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-actions mt-3">
                  <Button
                    variant="outline-purple"
                    className="btn-view-profile"
                    onClick={() => handleViewProfile(doctor.id)}
                  >
                    VIEW PROFILE
                  </Button>
                  <Button
                    variant="purple"
                    className="btn-book-appointment"
                    onClick={() => handleBookAppointment(doctor.id)}
                  >
                    SET APPOINTMENT
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        // Doctor Profile & Booking View (now separated into component)
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

export default BookAppointment;
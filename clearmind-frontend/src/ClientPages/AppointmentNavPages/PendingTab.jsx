import React from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarTimes } from 'react-icons/fa';
import MOCK_APPOINTMENTS from '../../MockData/MockAppointment';
import AppointmentCard from './AppointmentComponents/AppointmentCard';
import "./styles/PendingTab.css";

const PendingTab = () => {
  const navigate = useNavigate();

  const handleViewDetails = (appointmentId) => {
    navigate(`/client/appointment/details/${appointmentId}`, { state: { from: 'pending' } });
  };

  const pendingAppointments = MOCK_APPOINTMENTS.filter(
    (apt) => apt.status === 'Pending'
  );

  return (
    <Container className="py-4 upcoming-container">
      <div className="d-flex justify-content-between align-items-center mb-3 header-section">
        <h5 className='title-upcoming'>PENDING APPOINTMENTS</h5>
      </div>

      <div className='appointments-list'>
        {pendingAppointments.length === 0 ? (
          <div className='no-appointments'>
            <FaCalendarTimes className='calendar-icon' />
            <p>You have no pending appointments.</p>
          </div>
        ) : (
          pendingAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>
    </Container>
  );
};

export default PendingTab;
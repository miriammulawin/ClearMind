import React, { useState } from 'react';
import { Container, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarTimes } from 'react-icons/fa';
import MOCK_APPOINTMENTS from '../../MockData/MockAppointment';
import AppointmentCard from './AppointmentComponents/AppointmentCard';
import "./styles/PendingTab.css";

const ScheduleTab = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('Confirmed');

  const statusOptions = ['Confirmed', 'Rescheduled'];

  const getEmptyMessage = (status) => {
    const messages = {
      Confirmed: 'You have no confirmed appointments.',
      Rescheduled: 'You have no rescheduled appointments.',
    };
    return messages[status] || 'You have no upcoming appointments.';
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/client/appointment/upcoming/${appointmentId}`);
  };

  const filteredAppointments = MOCK_APPOINTMENTS.filter(
    (apt) => apt.status === selectedStatus
  );

  return (
    <Container className="py-4 upcoming-container">
      <div className="d-flex justify-content-between align-items-center mb-3 header-section">
        <h5 className='title-upcoming'>SCHEDULED APPOINTMENTS</h5>

        <Dropdown className="status-dropdown">
          <Dropdown.Toggle variant="outline-purple" id="dropdown-status">
            {selectedStatus}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {statusOptions.map((status) => (
              <Dropdown.Item
                key={status}
                active={selectedStatus === status}
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className='appointments-list'>
        {filteredAppointments.length === 0 ? (
          <div className='no-appointments'>
            <FaCalendarTimes className='calendar-icon' />
            <p>{getEmptyMessage(selectedStatus)}</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
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

export default ScheduleTab;
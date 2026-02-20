import React, { useState } from 'react';
import { Container, Card, Button, Dropdown, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarTimes, FaVideo, FaClinicMedical } from "react-icons/fa";
import MOCK_APPOINTMENTS from '../../MockData/MockAppointment.js';
import "../ClientStyle/UpcomingTab.css";

const UpcomingTab = () => {
  const navigate = useNavigate();

  // No more Pending here — only Confirmed and Rescheduled
  const [selectedStatus, setSelectedStatus] = useState('Confirmed');

  const getDayOfWeek = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const getAppointmentIcon = (type) => {
    if (type === 'Clinic - CMPS') {
      return <FaClinicMedical className='appointment-icon' />;
    }
    return <FaVideo className='appointment-icon' />;
  };

  const getEmptyMessage = (status) => {
    const messages = {
      'Confirmed': 'You have no confirmed appointments.',
      'Rescheduled': 'You have no rescheduled appointments.',
    };
    return messages[status] || 'You have no upcoming appointments.';
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      'Confirmed': 'info',
      'Rescheduled': 'orange',
    };
    return variants[status] || 'secondary';
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/client/appointment/upcoming/${appointmentId}`);
  };

  // Only Confirmed and Rescheduled — Pending is handled by PendingTab
  const statusOptions = ['Confirmed', 'Rescheduled'];

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
            <Card key={appointment.id} className='appointment-card'>
              <Card.Body>
                <Badge
                  bg={getStatusBadgeVariant(appointment.status)}
                  className='status-badge-upcoming'
                >
                  {appointment.status}
                </Badge>

                <div className='appointment-details'>
                  <div className='appointment-info'>
                    <div className='info-row'>
                      <span className='label'>Time:</span>
                      <span className='value'>{appointment.time}</span>
                    </div>
                    <div className='info-row'>
                      <span className='label'>Date:</span>
                      <span className='value date-value'>
                        {appointment.date} ({getDayOfWeek(appointment.date)})
                      </span>
                    </div>
                    <hr className='hr-upcoming' />
                    <div className='info-row consultation-type'>
                      {getAppointmentIcon(appointment.type)}
                      <span>{appointment.type}</span>
                    </div>
                    <div className='info-row'>
                      <span className='label'>Type of Service:</span>
                      <span className='value service-type'>{appointment.serviceType}</span>
                    </div>
                    <div className='info-row'>
                      <span className='label'>Assigned Doctor:</span>
                      <span className='value doctor-name'>{appointment.doctor}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline-purple"
                    className='view-details-btn'
                    onClick={() => handleViewDetails(appointment.id)}
                  >
                    VIEW DETAILS
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
};

export default UpcomingTab;
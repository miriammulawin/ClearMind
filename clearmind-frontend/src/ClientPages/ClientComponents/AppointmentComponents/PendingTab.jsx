import React from 'react';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarTimes, FaVideo, FaClinicMedical } from "react-icons/fa";
import MOCK_APPOINTMENTS from '../../../MockData/MockAppointment.js';
import "../../ClientStyle/UpcomingTab.css";

const PendingTab = () => {
  const navigate = useNavigate();

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

  const handleViewDetails = (appointmentId) => {
    navigate(`/client/appointment/upcoming/${appointmentId}`);
  };

  // Only Pending appointments
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
            <Card key={appointment.id} className='appointment-card'>
              <Card.Body>
                <Badge bg="warning" className='status-badge-upcoming'>
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

export default PendingTab;
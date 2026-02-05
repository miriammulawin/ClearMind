import React, { useState } from 'react';
import { Container, Card, Button, Dropdown, Badge } from 'react-bootstrap';
import { FaCalendarTimes, FaVideo, FaClinicMedical } from "react-icons/fa";
import "../ClientStyle/UpcomingTab.css"

const UpcomingTab = () => {
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  
  // Helper function to get day of the week
  const getDayOfWeek = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };
  
  // Helper function to determine icon based on appointment type
  const getAppointmentIcon = (type) => {
    if (type === 'Clinic - CMPS') {
      return <FaClinicMedical className='appointment-icon' />;
    } else if (type === 'Online Consultation') {
      return <FaVideo className='appointment-icon' />;
    }
    return <FaVideo className='appointment-icon' />; // default
  };
  
  // Helper function to get empty state message based on status
  const getEmptyMessage = (status) => {
    const messages = {
      'Pending': 'You have no pending appointments.',
      'Confirmed': 'You have no confirmed appointments.',
      'Rescheduled': 'You have no rescheduled appointments.'
    };
    return messages[status] || 'You have no upcoming appointments.';
  };

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status) => {
    const variants = {
      'Pending': 'warning',      // Yellow
      'Confirmed': 'info',        // Light Blue
      'Rescheduled': 'orange'     // Orange (custom)
    };
    return variants[status] || 'secondary';
  };
  
  // Sample data - replace with your actual data from API
  const appointments = [
    {
      id: 1,
      time: '9:00 A.M.',
      date: 'February 19, 2026',
      serviceType: 'Psychotherapy and Counseling',
      doctor: 'Juan Dela Cruz',
      type: 'Clinic - CMPS',
      status: 'Pending'
    },
    {
      id: 2,
      time: '10:00 A.M.',
      date: 'January 27, 2026',
      serviceType: 'Psychiatric Assessment',
      doctor: 'Maria Santos',
      type: 'Online Consultation',
      status: 'Confirmed'
    },
    {
      id: 3,
      time: '11:00 A.M.',
      date: 'January 28, 2026',
      serviceType: 'Mental Health Certification',
      doctor: 'Pedro Reyes',
      type: 'Online Consultation',
      status: 'Rescheduled'
    },
    {
      id: 4,
      time: '2:00 P.M.',
      date: 'January 29, 2026',
      serviceType: 'Follow-up Consultation',
      doctor: 'Ana Rodriguez',
      type: 'Clinic - CMPS',
      status: 'Pending'
    }
  ];

  const statusOptions = ['Pending', 'Confirmed', 'Rescheduled'];
  
  // Filter appointments based on selected status
  const filteredAppointments = appointments.filter(
    apt => apt.status === selectedStatus
  );

  return (
    <Container className="py-4 upcoming-container">
      <div className="d-flex justify-content-between align-items-center mb-3 header-section">
        <h5 className='title-upcoming'>
          SCHEDULED APPOINTMENTS
        </h5>
        
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
                  
                  <Button variant="outline-purple" className='view-details-btn'>
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
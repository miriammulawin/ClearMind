import React, { useState } from 'react';
import { Container, Card, Button, Dropdown } from 'react-bootstrap';
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
      'Scheduled': 'You have no scheduled appointments.',
      'Rescheduled': 'You have no rescheduled appointments.'
    };
    return messages[status] || 'You have no upcoming appointments.';
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
      status: 'Pending'
    },
    {
      id: 3,
      time: '11:00 A.M.',
      date: 'January 28, 2026',
      serviceType: 'Mental Health Certification',
      doctor: 'Pedro Reyes',
      type: 'Online Consultation',
      status: 'Pending'
    }
    // Add more for testing scroll
  ];

  const statusOptions = ['Pending', 'Confirmed', 'Scheduled', 'Rescheduled'];

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
          <span className='label-filter me-2'>Status Filter:</span>
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
                <div className='appointment-details'>
                  <div className='appointment-info'>
                    <div className='info-row'>
                      <span className='label'>Time:</span>
                      <span className='value'>{appointment.time}</span>
                      <span className='status-badge'>{appointment.status}</span>
                    </div>
                    <div className='info-row'>
                      <span className='label'>Date:</span>
                      <span className='value date-value'>
                        {appointment.date} ({getDayOfWeek(appointment.date)})
                      </span>
                    </div>
                    <hr className='hr-upcodming' />
                    <div className='info-row'>
                      <span className='label'>Type of Service:</span>
                      <span className='value service-type'>{appointment.serviceType}</span>
                    </div>
                    <div className='info-row'>
                      <span className='label'>Assigned Doctor:</span>
                      <span className='value doctor-name'>{appointment.doctor}</span>
                    </div>
                    <div className='info-row consultation-type'>
                      {getAppointmentIcon(appointment.type)}
                      <span>{appointment.type}</span>
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
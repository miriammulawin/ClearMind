import React, { useState } from 'react';
import { Container, Card, Button, Dropdown, Row, Col, Form, Badge } from 'react-bootstrap';
import { FaCalendarTimes, FaVideo, FaClinicMedical, FaFilter } from "react-icons/fa";
import "../ClientStyle/HistoryTab.css";

const HistoryTab = () => {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Most Recent First');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  
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
    return <FaVideo className='appointment-icon' />;
  };
  
  // Helper function to get empty state message based on status
  const getEmptyMessage = (status) => {
    const messages = {
      'All': 'You have no appointment history.',
      'Completed': 'You have no completed appointments.',
      'Cancelled': 'You have no cancelled appointments.'
    };
    return messages[status] || 'No appointment history available.';
  };

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status) => {
    const variants = {
      'Completed': 'completed',    // Custom green
      'Cancelled': 'cancelled'     // Custom red
    };
    return variants[status] || 'secondary';
  };

  // Helper function to check if date is within range
  const isDateInRange = (dateString, from, to) => {
    if (!from && !to) return true;
    
    const date = new Date(dateString);
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    
    if (fromDate && toDate) {
      return date >= fromDate && date <= toDate;
    } else if (fromDate) {
      return date >= fromDate;
    } else if (toDate) {
      return date <= toDate;
    }
    
    return true;
  };

  // Helper function to filter by predefined date ranges
  const filterByDateRange = (dateString, sortOption) => {
    const date = new Date(dateString);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    switch(sortOption) {
      case 'This Month':
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      case 'Last 30 Days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return date >= thirtyDaysAgo;
      case 'Last 3 Months':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        return date >= threeMonthsAgo;
      case 'Last 6 Months':
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        return date >= sixMonthsAgo;
      default:
        return true;
    }
  };

  // Clear date range filter
  const clearDateRange = () => {
    setDateFrom('');
    setDateTo('');
  };
  
  // Sample data - replace with your actual data from API
  const appointments = [
    {
      id: 1,
      time: '9:00 A.M.',
      date: 'January 29, 2026',
      doctor: 'Juan Dela Cruz',
      serviceType: 'Follow-up Consultation',
      type: 'Online Consultation',
      status: 'Completed'
    },
    {
      id: 2,
      time: '9:00 A.M.',
      date: 'January 28, 2026',
      serviceType: 'Mental Health Certification',
      doctor: 'Juan Dela Cruz',
      type: 'Online Consultation',
      status: 'Completed'
    },
    {
      id: 3,
      time: '2:00 P.M.',
      date: 'February 01, 2026',
      serviceType: 'Mental Health Certification',
      doctor: 'Maria Santos',
      type: 'Clinic - CMPS',
      status: 'Completed'
    },
    {
      id: 4,
      time: '10:00 A.M.',
      date: 'January 27, 2026',
      serviceType: 'Psychiatric Assessment',
      doctor: 'Pedro Reyes',
      type: 'Online Consultation',
      status: 'Cancelled'
    },
    {
      id: 5,
      time: '3:00 P.M.',
      date: 'January 25, 2026',
      doctor: 'Ana Rodriguez',
      serviceType: 'Psychiatric Assessment',
      type: 'Clinic - CMPS',
      status: 'Cancelled'
    },
    {
      id: 6,
      time: '11:00 A.M.',
      date: 'December 15, 2025',
      serviceType: 'Psychiatric Assessment',
      doctor: 'Carlos Martinez',
      type: 'Online Consultation',
      status: 'Completed'
    },
    {
      id: 7,
      time: '4:00 P.M.',
      date: 'November 20, 2025',
      serviceType: 'Follow-up Consultation',
      doctor: 'Lisa Chen',
      type: 'Clinic - CMPS',
      status: 'Completed'
    }
  ];

  const statusOptions = ['All', 'Completed', 'Cancelled'];
  const sortOptions = [
    'Most Recent First',
    'Oldest First',
    'This Month',
    'Last 30 Days',
    'Last 3 Months',
    'Last 6 Months'
  ];
  
  // Filter and sort appointments
  const filteredAppointments = appointments
    .filter(apt => selectedStatus === 'All' ? true : apt.status === selectedStatus)
    .filter(apt => filterByDateRange(apt.date, selectedSort))
    .filter(apt => isDateInRange(apt.date, dateFrom, dateTo))
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (selectedSort === 'Oldest First') {
        return dateA - dateB;
      } else {
        return dateB - dateA; // Most Recent First (default)
      }
    });

  return (
    <Container className="py-4 history-container">
      <div className="d-flex justify-content-between align-items-center mb-3 header-section">
        <h5 className='title-history'>
          APPOINTMENTS HISTORY
        </h5>
        
        <div className="d-flex gap-2 filters-group">
          <Dropdown className="status-dropdown-history">
            <Dropdown.Toggle variant="outline-purple" id="dropdown-status-history">
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

          <Dropdown className="sort-dropdown-history">
            <Dropdown.Toggle variant="outline-purple" id="dropdown-sort-history">
              Sort
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {sortOptions.map((sort) => (
                <Dropdown.Item 
                  key={sort}
                  active={selectedSort === sort}
                  onClick={() => setSelectedSort(sort)}
                >
                  {sort}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Button 
            variant="outline-purple" 
            className="date-filter-toggle"
            onClick={() => setShowDateFilter(!showDateFilter)}
          >
            <FaFilter />
          </Button>
        </div>
      </div>

      {showDateFilter && (
        <div className="date-range-filter mb-3">
          <Row className="align-items-end g-2">
            <Col xs={12} sm={5}>
              <Form.Group>
                <Form.Label className="date-label">From</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="date-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={5}>
              <Form.Group>
                <Form.Label className="date-label">To</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="date-input"
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={2}>
              <Button 
                variant="outline-secondary" 
                className="clear-date-btn w-100"
                onClick={clearDateRange}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </div>
      )}

      <div className='appointments-history-list'>
        {filteredAppointments.length === 0 ? (
          <div className='no-history'>
            <FaCalendarTimes className='calendar-icon-history' />
            <p>{getEmptyMessage(selectedStatus)}</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className='history-card'>
              <Card.Body>
                <Badge 
                  bg={getStatusBadgeVariant(appointment.status)} 
                  className='status-badge-history'
                >
                  {appointment.status}
                </Badge>
                
                <div className='history-details'>
                  <div className='history-info'>
                    <div className='info-row-history'>
                      <span className='label-history'>Time:</span>
                      <span className='value-history'>{appointment.time}</span>
                    </div>
                    <div className='info-row-history'>
                      <span className='label-history'>Date:</span>
                      <span className='value-history date-value-history'>
                        {appointment.date}
                      </span>
                    </div>
                    <hr className='hr-upcoming' />
                    <div className='info-row-history consultation-type-history'>
                      {getAppointmentIcon(appointment.type)}
                      <span>{appointment.type}</span>
                    </div>
                    <div className='info-row'>
                      <span className='label'>Type of Service:</span>
                      <span className='value service-type'>{appointment.serviceType}</span>
                    </div>
                    <div className='info-row-history'>
                      <span className='label-history'>Assigned Doctor:</span>
                      <span className='value-history doctor-name-history'>{appointment.doctor}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline-purple" className='view-details-btn-history'>
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

export default HistoryTab;
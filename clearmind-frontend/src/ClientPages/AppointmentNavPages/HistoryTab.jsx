import React, { useState } from 'react';
import { Container, Dropdown, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCalendarTimes, FaFilter, FaSort } from 'react-icons/fa';
import MOCK_APPOINTMENTS from '../../MockData/MockAppointment';
import AppointmentCard from './AppointmentComponents/AppointmentCard';
import styles from './styles/HistoryTab.module.css';

const HistoryTab = () => {
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState('Completed');
  const [sortOrder, setSortOrder] = useState('Newest First');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const statusOptions = ['Completed', 'Cancelled'];
  const sortOptions = ['Newest First', 'Oldest First'];

  const getEmptyMessage = (status) => {
    const messages = {
      Completed: 'You have no completed appointments.',
      Cancelled: 'You have no cancelled appointments.',
    };
    return messages[status] || 'You have no appointment history.';
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/client/appointment/history/${appointmentId}`);
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  const filteredAndSorted = MOCK_APPOINTMENTS
    .filter((apt) => apt.status === selectedStatus)
    .filter((apt) => {
      if (!startDate && !endDate) return true;
      const aptDate = new Date(apt.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      if (from && aptDate < from) return false;
      if (to && aptDate > to) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'Newest First' ? dateB - dateA : dateA - dateB;
    });

  return (
    <Container className={`py-4 ${styles.historyContainer}`}>
      {/* Header */}
      <div className={styles.headerSection}>
        <h5 className={styles.titleHistory}>APPOINTMENT HISTORY</h5>

        {/* Filters Row */}
        <div className={styles.filtersGroup}>
          {/* Status Dropdown */}
          <Dropdown className={styles.statusDropdownHistory}>
            <Dropdown.Toggle variant="outline-purple" id="dropdown-history-status">
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

          {/* Sort Dropdown */}
          <Dropdown className={styles.sortDropdownHistory}>
            <Dropdown.Toggle variant="outline-purple" id="dropdown-history-sort">
              <FaSort className="me-1" />
              {sortOrder}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {sortOptions.map((option) => (
                <Dropdown.Item
                  key={option}
                  active={sortOrder === option}
                  onClick={() => setSortOrder(option)}
                >
                  {option}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* Date Filter Toggle */}
          <Button
            className={styles.dateFilterToggle}
            onClick={() => setShowDateFilter((prev) => !prev)}
          >
            <FaFilter className="me-1" />
            {showDateFilter ? 'Hide Dates' : 'Filter by Date'}
          </Button>
        </div>

        {/* Date Range Filter */}
        {showDateFilter && (
          <div className={styles.dateRangeFilter}>
            <Row className="g-2 align-items-end">
              <Col xs={12} sm={5}>
                <div className={styles.dateLabel}>From</div>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Col>
              <Col xs={12} sm={5}>
                <div className={styles.dateLabel}>To</div>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
              <Col xs={12} sm={2}>
                <Button className={styles.clearDateBtn} onClick={handleClearDates}>
                  Clear
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className={styles.appointmentsHistoryList}>
        {filteredAndSorted.length === 0 ? (
          <div className={styles.noHistory}>
            <FaCalendarTimes className={styles.calendarIconHistory} />
            <p>{getEmptyMessage(selectedStatus)}</p>
          </div>
        ) : (
          filteredAndSorted.map((appointment) => (
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

export default HistoryTab;
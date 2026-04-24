import React, { useState } from "react";
import { Container, Dropdown, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaCalendarTimes, FaFilter, FaSort } from "react-icons/fa";
import { MOCK_APPOINTMENTS } from "../../MockData/MockAppointment";
import SessionCard from "./AppointmentComponents/SessionCard";
import styles from "./styles/SessionsTab.module.css";
import BookNextSession from "./AppointmentComponents/BookNextSession";

const PREFIX_LABEL = {
  PAC: "Psychotherapy & Counseling",
  PAE: "Psychological Assessment & Evaluation",
};

const getPrefix = (referenceNumber) => {
  if (!referenceNumber) return "OTHER";
  if (referenceNumber.startsWith("PAC")) return "PAC";
  if (referenceNumber.startsWith("PAE")) return "PAE";
  return "OTHER";
};

const SessionsTab = () => {
  const navigate = useNavigate();
  const [bookingSession, setBookingSession] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const statusOptions = [
    "All",
    "Pending",
    "Confirmed",
    "Rescheduled",
    "Completed",
    "Cancelled",
  ];
  const sortOptions = ["Newest First", "Oldest First"];

  const handleBookNext = (appointment) => {
    navigate("/client/appointment/sessions/book-next", {
      state: { appointment },
    });
  };

  const getEmptyMessage = (status) => {
    const messages = {
      All: "You have no sessions yet.",
      Pending: "You have no pending sessions.",
      Confirmed: "You have no confirmed sessions.",
      Rescheduled: "You have no rescheduled sessions.",
      Completed: "You have no completed sessions.",
      Cancelled: "You have no cancelled sessions.",
    };
    return messages[status] || "You have no sessions.";
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/client/appointment/details/${appointmentId}`, {
      state: { from: "sessions" },
    });
  };

  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  if (bookingSession) {
    return (
      <BookNextSession
        appointment={bookingSession}
        onBack={() => setBookingSession(null)}
        onSuccess={() => {
          setBookingSession(null);
          alert("Session request submitted! Admin will confirm your schedule.");
        }}
      />
    );
  }

  const filteredAndSorted = MOCK_APPOINTMENTS.filter((apt) => !!apt.programId)
    .filter((apt) =>
      selectedStatus === "All" ? true : apt.status === selectedStatus,
    )
    .filter((apt) => {
      if (!startDate && !endDate) return true;
      const aptDate = new Date(apt.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
      if (from && aptDate < from) return false;
      if (to && aptDate > to) return false;
      return true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const grouped = filteredAndSorted.reduce((acc, apt) => {
    const key = apt.programId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(apt);
    return acc;
  }, {});

  const groupEntries = Object.entries(grouped).sort(([, aptsA], [, aptsB]) => {
    const latestA = new Date(aptsA[aptsA.length - 1].date);
    const latestB = new Date(aptsB[aptsB.length - 1].date);
    return sortOrder === "Newest First" ? latestB - latestA : latestA - latestB;
  });

  return (
    <Container className={`py-4 ${styles.sessionsContainer}`}>
      <div className={styles.headerSection}>
        <h5 className={styles.titleSessions}>MY SESSIONS</h5>

        <div className={styles.filtersGroup}>
          <Dropdown className={styles.statusDropdownSessions}>
            <Dropdown.Toggle
              variant="outline-purple"
              id="dropdown-sessions-status"
            >
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

          <Dropdown className={styles.sortDropdownSessions}>
            <Dropdown.Toggle
              variant="outline-purple"
              id="dropdown-sessions-sort"
            >
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

          <Button
            className={styles.dateFilterToggle}
            onClick={() => setShowDateFilter((prev) => !prev)}
          >
            <FaFilter className="me-1" />
            {showDateFilter ? "Hide Dates" : "Filter by Date"}
          </Button>
        </div>

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
                <Button
                  className={styles.clearDateBtn}
                  onClick={handleClearDates}
                >
                  Clear
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </div>

      <div className={styles.sessionsListWrapper}>
        {groupEntries.length === 0 ? (
          <div className={styles.noSessions}>
            <FaCalendarTimes className={styles.calendarIconSessions} />
            <p>{getEmptyMessage(selectedStatus)}</p>
          </div>
        ) : (
          groupEntries.map(([programId, apts]) => {
            const prefix = getPrefix(apts[0].referenceNumber);
            return (
              <SessionCard
                key={programId}
                prefix={prefix}
                groupLabel={PREFIX_LABEL[prefix] || prefix}
                appointments={apts}
                onViewDetails={handleViewDetails}
                onBookNext={handleBookNext}
              />
            );
          })
        )}
      </div>
    </Container>
  );
};

export default SessionsTab;

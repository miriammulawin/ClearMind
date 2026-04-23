import React from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaCalendarTimes } from "react-icons/fa";
import MOCK_APPOINTMENTS from "../../MockData/MockAppointment";
import AppointmentCard from "./AppointmentComponents/AppointmentCard";
import styles from "./styles/PendingTab.module.css";

const PendingTab = () => {
  const navigate = useNavigate();

  const handleViewDetails = (appointmentId) => {
    navigate(`/client/appointment/details/${appointmentId}`, {
      state: { from: "pending" },
    });
  };

  const pendingAppointments = MOCK_APPOINTMENTS.filter(
    (apt) => apt.status === "Pending",
  );

  return (
    <Container className={`py-4 ${styles.upcomingContainer}`}>
      <div
        className={`d-flex justify-content-between align-items-center mb-3 ${styles.headerSection}`}
      >
        <h5 className={styles.titleUpcoming}>PENDING APPOINTMENTS</h5>
      </div>

      <div className={styles.appointmentsList}>
        {pendingAppointments.length === 0 ? (
          <div className={styles.noAppointments}>
            <FaCalendarTimes className={styles.calendarIcon} />
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

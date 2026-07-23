import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaCalendarTimes } from "react-icons/fa";
import AppointmentCard from "./AppointmentComponents/AppointmentCard";
import styles from "./styles/PendingTab.module.css";
import axiosClient from "../../axiosClient";

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const mapAppointment = (apt) => ({
  id: apt.appointment_id,
  referenceNumber: apt.payment_reference,
  status: capitalize(apt.status), // "pending" -> "Pending"
  time: apt.start_time ? apt.start_time.slice(0, 5) : "",
  date: apt.appointment_date,
  type: apt.visit_type === "virtual" ? "Online" : "Clinic - CMPS",
  serviceType: apt.service_type || "—",
  doctor: apt.doctor
    ? `${apt.doctor.firstName ?? ""} ${apt.doctor.lastName ?? ""}`.trim() ||
      apt.doctor.name
    : "Not yet assigned",
  programId: apt.program_id ?? null,
  sessionNumber: apt.session_number ?? null,
  totalSessions: apt.total_sessions ?? null,
  progressionStatus: apt.progression_status ?? null,
});

const PendingTab = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get("/appointments", { params: { status: "pending" } })
      .then(({ data }) => {
        setAppointments((data.data || []).map(mapAppointment));
      })
      .catch((e) => console.error("Fetch Appointments Error:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleViewDetails = (appointmentId) => {
    navigate(`/client/appointment/details/${appointmentId}`, {
      state: { from: "pending" },
    });
  };

  if (loading) {
    return (
      <Container className={`py-4 ${styles.upcomingContainer}`}>
        <p style={{ color: "#888", textAlign: "center" }}>
          Loading appointments…
        </p>
      </Container>
    );
  }

  return (
    <Container className={`py-4 ${styles.upcomingContainer}`}>
      <div
        className={`d-flex justify-content-between align-items-center mb-3 ${styles.headerSection}`}
      >
        <h5 className={styles.titleUpcoming}>PENDING APPOINTMENTS</h5>
      </div>

      <div className={styles.appointmentsList}>
        {appointments.length === 0 ? (
          <div className={styles.noAppointments}>
            <FaCalendarTimes className={styles.calendarIcon} />
            <p>You have no pending appointments.</p>
          </div>
        ) : (
          appointments.map((appointment) => (
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

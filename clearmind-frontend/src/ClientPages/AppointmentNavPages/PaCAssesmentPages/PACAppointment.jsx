import React, { useState } from "react";
import { flushSync } from "react-dom";
import { Container, Card, Button } from "react-bootstrap";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  FaVideo,
  FaClinicMedical,
  FaCalendarCheck,
  FaUserCircle,
  FaArrowLeft,
} from "react-icons/fa";
import MOCK_DOCTORS from "../../../MockData/MockDoctors.js";
import DoctorProfile from "../AppointmentComponents/DoctorProfile.jsx";
import ServiceAlert from "../AppointmentComponents/ServiceAlert.jsx";
import styles from "./style/PACSetAppointment.module.css";

// ── Specialist Info ───────────────────────────────────────────────────────────
const SPECIALIST_INFO = {
  Psychologist: {
    label: "PSYCHOLOGIST",
    role: "Psychologist",
  },
  Psychiatrist: {
    label: "PSYCHIATRIST",
    role: "Psychiatrist",
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
const PACAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedService = location.state?.selectedService;

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [activeSpecialist, setActiveSpecialist] = useState("Psychologist");
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);

  const getConsultationIcon = (mode) =>
    mode === "Online" ? (
      <FaVideo className={styles.consultationIcon} />
    ) : (
      <FaClinicMedical className={styles.consultationIcon} />
    );

  const formatScheduleDays = (days) => {
    if (days.length === 1) return days[0];
    if (days.length === 2) return days.join(" & ");
    const lastDay = days[days.length - 1];
    const otherDays = days.slice(0, -1).join(", ");
    return `${otherDays} & ${lastDay}`;
  };

  const handleViewProfile = (doctorId) => {
    setSelectedDoctor(doctorId);
    setSelectedDate(null);
    setSelectedTime(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSetAppointment = (doctorId) => {
    const doctor = MOCK_DOCTORS.find((d) => d.id === doctorId);
    if (doctor) {
      navigate(
        "/client/appointment/psychotherapy-and-counseling/set-appointment-form",
        {
          state: { doctor, selectedService },
        },
      );
    }
  };

  const handleConfirmBooking = () => {
    const doctor = MOCK_DOCTORS.find((d) => d.id === selectedDoctor);
    if (doctor && selectedDate && selectedTime) {
      alert(
        `Appointment Confirmed!\n\nDoctor: ${doctor.name}\nDate: ${selectedDate.date}\nTime: ${selectedTime}\n\nThis will be connected to backend soon.`,
      );
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  const handleBackToDoctors = () => {
    flushSync(() => {
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
    });
  };

  // Filter doctors by specialist role
  const filteredDoctors = activeSpecialist
    ? MOCK_DOCTORS.filter((d) =>
        d.title
          .toLowerCase()
          .includes(SPECIALIST_INFO[activeSpecialist].role.toLowerCase()),
      )
    : MOCK_DOCTORS;

  const doctorData = selectedDoctor
    ? MOCK_DOCTORS.find((d) => d.id === selectedDoctor)
    : null;

  return (
    <Container className={`${styles.bookAppointmentContainer} py-4`}>
      {/* ── Header ── */}
      <div className={styles.titleContainerBook}>
        <h5 className={styles.titleBookAppointment}>SET AN APPOINTMENT</h5>
        <Button
          variant="button"
          className={styles.backToServices}
          onClick={() =>
            selectedDoctor
              ? handleBackToDoctors()
              : navigate("/client/appointment/services")
          }
        >
          <FaArrowLeft /> Go Back
        </Button>
      </div>

      <ServiceAlert selectedService={selectedService} />

      {!selectedDoctor ? (
        <>
          {/* ── Learn More Link ── */}
          <p
            className={styles.specialistLearnMore}
            onClick={() => setShowSpecialistModal(true)}
          >
            🤔 Not sure which is the right specialist to choose?{" "}
            <span> Click here to learn more!</span>
          </p>

          {/* ── Specialist Toggle ── */}
          <div style={{ marginBottom: "14px", marginTop: "4px" }}>
            <div className={styles.specialistToggle}>
              {Object.keys(SPECIALIST_INFO).map((key) => (
                <button
                  key={key}
                  className={`${styles.specialistToggleBtn} ${activeSpecialist === key ? styles.specialistToggleActive : ""}`}
                  onClick={() =>
                    setActiveSpecialist((prev) => (prev === key ? null : key))
                  }
                >
                  {SPECIALIST_INFO[key].label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Specialist Info Modal ── */}
          {showSpecialistModal && (
            <div
              className={styles.modalOverlay}
              onClick={() => setShowSpecialistModal(false)}
            >
              <div
                className={styles.modalBox}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h6 className={styles.modalTitle}>
                    Which specialist do I need?
                  </h6>
                  <button
                    className={styles.modalClose}
                    onClick={() => setShowSpecialistModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.modalCard}>
                    <p className={styles.modalCardTitle}>🧠 Psychologist</p>
                    <p className={styles.modalCardDesc}>
                      Best if you're dealing with stress, anxiety, trauma,
                      relationship issues, or just need someone to talk to. They
                      help through therapy and assessments — no medication
                      involved.
                    </p>
                  </div>

                  <div className={styles.modalDivider} />

                  <div className={styles.modalCard}>
                    <p className={styles.modalCardTitle}>🩺 Psychiatrist</p>
                    <p className={styles.modalCardDesc}>
                      Best if you need a formal diagnosis, a mental health
                      certificate (for work/school/legal), or a psychiatric
                      evaluation. They are medical doctors who can assess more
                      complex conditions.
                    </p>
                  </div>

                  <div className={styles.modalTip}>
                    💡 <strong>Not sure?</strong> Start with a Psychologist —
                    they can refer you to a Psychiatrist if needed.
                  </div>
                </div>

                <button
                  className={styles.modalConfirmBtn}
                  onClick={() => setShowSpecialistModal(false)}
                >
                  Got it!
                </button>
              </div>
            </div>
          )}

          {/* ── Doctor Cards ── */}
          <div className={styles.doctorsList}>
            {filteredDoctors.length === 0 ? (
              <p className={styles.noDoctorsMsg}>
                No doctors available for this specialization.
              </p>
            ) : (
              filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className={styles.doctorCard}>
                  <Card.Body className={styles.cardBody}>
                    <div className={styles.doctorHeader}>
                      <div className={styles.doctorAvatar}>
                        <FaUserCircle className={styles.avatarIcon} />
                      </div>
                      <div className={styles.doctorInfo}>
                        <h6 className={styles.doctorName}>{doctor.name}</h6>
                        <p className={styles.doctorCredentials}>
                          {doctor.credentials}
                        </p>
                      </div>
                    </div>

                    <div className={styles.consultationAvailability}>
                      <p className={styles.availabilityLabel}>
                        Consultation Availability
                      </p>
                      <div className={styles.availabilityDetails}>
                        <div className={styles.availabilityItem}>
                          <FaCalendarCheck className={styles.iconSmall} />
                          <span>
                            {formatScheduleDays(doctor.schedule.days)}
                          </span>
                        </div>
                        <div className={styles.availabilityItem}>
                          {getConsultationIcon(doctor.consultationMode)}
                          <span>{doctor.consultationType}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.earliestSchedule}>
                      <p className={styles.scheduleLabel}>
                        Earliest Available Schedule
                      </p>
                      <div className={styles.scheduleInfo}>
                        <div className={styles.scheduleItem}>
                          {getConsultationIcon(doctor.consultationMode)}
                          <span>{doctor.consultationType}</span>
                        </div>
                        <p className={styles.scheduleTime}>
                          {doctor.availability[0]?.day},{" "}
                          {doctor.availability[0]?.slots.find(
                            (s) => s.available,
                          )?.time || "N/A"}
                        </p>
                        <p className={styles.scheduleFee}>
                          Fee: ₱
                          {doctor.consultationFees.initialConsultation.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className={`${styles.cardActions} mt-3`}>
                      <Button
                        variant="outline-purple"
                        className={styles.btnViewProfile}
                        onClick={() => handleViewProfile(doctor.id)}
                      >
                        VIEW PROFILE
                      </Button>
                      <Button
                        variant="purple"
                        className={styles.btnBookAppointment}
                        onClick={() => handleSetAppointment(doctor.id)}
                      >
                        SET APPOINTMENT
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        doctorData && (
          <DoctorProfile
            doctorData={doctorData}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={setSelectedDate}
            onSelectTime={setSelectedTime}
            onConfirmBooking={handleConfirmBooking}
            onBack={handleBackToDoctors}
          />
        )
      )}

      <Outlet />
    </Container>
  );
};

export default PACAppointment;

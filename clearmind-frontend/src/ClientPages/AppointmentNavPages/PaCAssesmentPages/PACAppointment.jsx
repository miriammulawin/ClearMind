import React, { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { Container, Button } from "react-bootstrap";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import MOCK_DOCTORS from "../../../MockData/MockDoctors.js";
import DoctorCard from "../AppointmentComponents/DoctorCard.jsx";
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
        { state: { doctor, selectedService } },
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

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Container className={`${styles.bookAppointmentContainer} py-4`}>
      {/* ── Specialist Info Modal ── (unchanged) ── */}
      {showSpecialistModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowSpecialistModal(false)}
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h6 className={styles.modalTitle}>Which specialist do I need?</h6>
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
                  help through therapy and assessments — no medication involved.
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
                💡 <strong>Not sure?</strong> Start with a Psychologist — they
                can refer you to a Psychiatrist if needed.
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

      {/* ── Main content: two-col on desktop, single-col on mobile ── */}
      <div className={styles.desktopColumns}>
        {/* LEFT / MOBILE-FULL: Doctor list — hidden on mobile when profile is open */}

        <div
          className={`${styles.leftColumn} ${selectedDoctor ? styles.hideOnMobile : ""}`}
        >
          {/* ── Header ── */}
          <div className={styles.titleContainerBook}>
            <h5 className={styles.titleBookAppointment}>SET AN APPOINTMENT</h5>
            <Button
              variant="button"
              className={styles.backToServices}
              onClick={() => navigate("/client/appointment/services")}
            >
              <FaArrowLeft /> Go Back
            </Button>
          </div>

          <ServiceAlert selectedService={selectedService} />

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

          <div
            className={`${styles.doctorsList} ${selectedDoctor ? styles.doctorsListHidden : ""}`}
          >
            {filteredDoctors.length === 0 ? (
              <p className={styles.noDoctorsMsg}>
                No doctors available for this specialization.
              </p>
            ) : (
              filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  isSelected={selectedDoctor === doctor.id}
                  compact={
                    isDesktop &&
                    selectedDoctor !== null &&
                    selectedDoctor !== doctor.id
                  }
                  onViewProfile={handleViewProfile}
                  onSetAppointment={handleSetAppointment}
                  onSelect={isDesktop ? (id) => setSelectedDoctor(id) : null}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT / MOBILE-FULL: Profile panel */}
        <div
          className={`${styles.profilePanel} ${selectedDoctor ? styles.profilePanelActive : ""}`}
        >
          {/* <h5> Doctor's Profile:</h5> */}
          {selectedDoctor && doctorData ? (
            <>
              {/* Back button — mobile only */}
              {!isDesktop && (
                <div className={styles.profilePanelHeader}>
                  <h5>Doctor's Profile:</h5>
                  <Button
                    variant="button"
                    className={styles.backToServices}
                    onClick={handleBackToDoctors}
                  >
                    <FaArrowLeft /> Back to Doctors
                  </Button>
                </div>
              )}
              <DoctorProfile
                doctorData={doctorData}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDate={setSelectedDate}
                onSelectTime={setSelectedTime}
                onConfirmBooking={handleConfirmBooking}
                onBack={handleBackToDoctors}
                onBookAppointment={() => handleSetAppointment(selectedDoctor)}
              />
            </>
          ) : (
            <div className={styles.emptyProfile}>
              <span className={styles.emptyProfileIcon}>🩺</span>
              <p className={styles.emptyProfileText}>No doctor selected</p>
              <p className={styles.emptyProfileSub}>
                Select a doctor from the list to view their profile here
              </p>
            </div>
          )}
        </div>
      </div>

      <Outlet />
    </Container>
  );
};

export default PACAppointment;

import React, { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { Container, Button } from "react-bootstrap";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import axiosClient from "../../../axiosClient"; // ← same as ServicesTab
import DoctorCard from "../AppointmentComponents/DoctorCard.jsx";
import DoctorProfile from "../AppointmentComponents/DoctorProfile.jsx";
import ServiceAlert from "../AppointmentComponents/ServiceAlert.jsx";
import styles from "./style/PACSetAppointment.module.css";

const SPECIALIST_INFO = {
  Psychologist: { label: "PSYCHOLOGIST", role: "psychologist" },
  Psychiatrist: { label: "PSYCHIATRIST", role: "psychiatrist" },
};

// ── Backend → DoctorCard shape ────────────────────────────────────
const mapDoctor = (d) => ({
  id: d.doctor_id,
  name: `${d.firstName}${d.middleInitial ? " " + d.middleInitial + "." : ""} ${d.lastName}`,
  title: d.professional_title || d.specialization || "",
  sex: d.sex,
  photo: d.doctor?.profile_photo_url || null,
});

// ── Component ─────────────────────────────────────────────────────
const PACAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedService = location.state?.selectedService;

  // ── Doctors from backend ──────────────────────────────────────
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosClient
      .get("/doctors/list")
      .then(({ data }) => setDoctors(data.data || []))
      .catch(() => setError("Failed to load doctors."))
      .finally(() => setLoading(false));
  }, []);

  // ── UI state ──────────────────────────────────────────────────
  const [selectedDoctor, setSelectedDoctor] = useState(null); // stores doctor_id
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [activeSpecialist, setActiveSpecialist] = useState("Psychologist");
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Filter by specialist toggle ───────────────────────────────
  const filteredDoctors = doctors.filter((d) => {
    if (!activeSpecialist) return true;
    const role = SPECIALIST_INFO[activeSpecialist].role;
    const title = (d.professional_title || "").toLowerCase();
    const spec = (d.specialization || "").toLowerCase();
    return title.includes(role) || spec.includes(role);
  });

  // mapped version of the selected doctor (for DoctorProfile)
  const doctorData = selectedDoctor
    ? (() => {
        const raw = doctors.find((d) => d.doctor_id === selectedDoctor);
        return raw ? mapDoctor(raw) : null;
      })()
    : null;

  // ── Handlers ─────────────────────────────────────────────────
  const handleViewProfile = (doctorId) => {
    setSelectedDoctor(doctorId);
    setSelectedDate(null);
    setSelectedTime(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSetAppointment = (doctorId) => {
    const raw = doctors.find((d) => d.doctor_id === doctorId);
    if (raw) {
      navigate(
        "/client/appointment/psychotherapy-and-counseling/set-appointment-form",
        { state: { doctor: mapDoctor(raw), selectedService } },
      );
    }
  };

  const handleBackToDoctors = () => {
    flushSync(() => {
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
    });
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <Container className={`${styles.bookAppointmentContainer} py-4`}>
      {/* Specialist Modal — unchanged */}
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
                  relationship issues, or just need someone to talk to.
                </p>
              </div>
              <div className={styles.modalDivider} />
              <div className={styles.modalCard}>
                <p className={styles.modalCardTitle}>🩺 Psychiatrist</p>
                <p className={styles.modalCardDesc}>
                  Best if you need a formal diagnosis, a mental health
                  certificate, or a psychiatric evaluation.
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

      <div className={styles.desktopColumns}>
        {/* LEFT: Doctor list */}
        <div
          className={`${styles.leftColumn} ${selectedDoctor ? styles.hideOnMobile : ""}`}
        >
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

          <p
            className={styles.specialistLearnMore}
            onClick={() => setShowSpecialistModal(true)}
          >
            🤔 Not sure which is the right specialist to choose?{" "}
            <span>Click here to learn more!</span>
          </p>

          {/* Specialist Toggle */}
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

          {/* Doctor List */}
          <div
            className={`${styles.doctorsList} ${selectedDoctor ? styles.doctorsListHidden : ""}`}
          >
            {loading && (
              <p className={styles.noDoctorsMsg}>Loading doctors...</p>
            )}
            {error && <p className={styles.noDoctorsMsg}>{error}</p>}
            {!loading && !error && filteredDoctors.length === 0 && (
              <p className={styles.noDoctorsMsg}>
                No doctors available for this specialization.
              </p>
            )}
            {!loading &&
              !error &&
              filteredDoctors.map((d) => (
                <DoctorCard
                  key={d.doctor_id}
                  doctor={mapDoctor(d)} // ← mapped shape
                  isSelected={selectedDoctor === d.doctor_id}
                  compact={
                    isDesktop &&
                    selectedDoctor !== null &&
                    selectedDoctor !== d.doctor_id
                  }
                  onViewProfile={handleViewProfile}
                  onSetAppointment={handleSetAppointment}
                  onSelect={isDesktop ? (id) => setSelectedDoctor(id) : null}
                />
              ))}
          </div>
        </div>

        {/* RIGHT: Profile panel */}
        <div
          className={`${styles.profilePanel} ${selectedDoctor ? styles.profilePanelActive : ""}`}
        >
          {selectedDoctor && doctorData ? (
            <>
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
                onConfirmBooking={() => {}}
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

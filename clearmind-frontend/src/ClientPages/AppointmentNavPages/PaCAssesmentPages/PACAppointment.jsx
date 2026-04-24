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
  Psychologist: {
    label: "PSYCHOLOGIST",
    // exact strings to match against (lowercase)
    match: ["psychologist", "psychology", "clinical psychology"],
  },
  Psychiatrist: {
    label: "PSYCHIATRIST",
    match: ["psychiatrist", "psychiatry", "clinical psychiatry"],
  },
};
// ── Backend → DoctorCard shape ────────────────────────────────────
const DAY_NUM_TO_NAME = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

const mapDoctor = (d) => {
  const schedules = Array.isArray(d.schedules) ? d.schedules : [];

  const DAY_ORDER_NUM = [1, 2, 3, 4, 5, 6, 0]; // Mon→Sun

  // ── Find earliest UPCOMING available day ──
  const today = new Date();
  const todayNum = today.getDay(); // 0=Sun, 1=Mon...

  // Get all scheduled day_nums
  const scheduledDayNums = schedules.map((s) => s.day_num);

  // Find next available day starting from TOMORROW
  let earliestSchedule = null;
  for (let i = 1; i <= 7; i++) {
    const checkDay = (todayNum + i) % 7;
    const found = schedules.find((s) => s.day_num === checkDay);
    if (found) {
      earliestSchedule = found;
      break;
    }
  }

  const hasOnline = schedules.some(
    (s) => s.slot_type === "online" || s.slot_type === "both",
  );
  const hasPhysical = schedules.some(
    (s) => s.slot_type === "physical" || s.slot_type === "both",
  );

  const consultationMode =
    hasOnline && hasPhysical ? "Both" : hasOnline ? "Virtual" : "Onsite";

  const consultationType =
    hasOnline && hasPhysical
      ? "Online & On-site"
      : hasOnline
        ? "Virtual Consultation"
        : "On-site Consultation";

  // All available days sorted Mon→Sun for Consultation Availability display
  const sorted = [...schedules].sort(
    (a, b) =>
      DAY_ORDER_NUM.indexOf(a.day_num) - DAY_ORDER_NUM.indexOf(b.day_num),
  );

  return {
    ...d,
    id: d.doctor_id,
    name: `${d.firstName}${d.middleInitial ? " " + d.middleInitial + "." : ""} ${d.lastName}`,
    title: d.professional_title || d.doctor?.professional_title || "",
    photo: d.doctor?.profile_picture
      ? `http://localhost:8000/storage/${d.doctor.profile_picture}`
      : null,
    profile_picture: d.doctor?.profile_picture
      ? `http://localhost:8000/storage/${d.doctor.profile_picture}`
      : null,
    professional_title:
      d.professional_title || d.doctor?.professional_title || "",
    main_specialty: d.doctor?.main_specialty || "",
    description: d.doctor?.description || "",
    license_number: d.license_number || d.doctor?.license_number || "",
    prc_number: d.doctor?.prc_number || "",
    practicing_since: d.doctor?.practicing_since || "",
    years_of_experience: d.doctor?.years_of_experience || null,
    specializations: d.doctor?.specializations || d.specializations || [],
    sub_specializations: d.doctor?.sub_specializations || [],
    services: d.doctor?.services || [],
    board_cert_names: d.doctor?.board_cert_names || [],
    consultationMode,
    consultationType,
    schedule: {
      days: sorted.map((s) => s.day), // all days — para sa Consultation Availability
      time: earliestSchedule
        ? `${formatTime(earliestSchedule.start_time)} - ${formatTime(earliestSchedule.end_time)}`
        : null,
      earliest: earliestSchedule?.day || null, // ← iisa lang na araw
    },
    consultationFees: {
      initialConsultation: d.doctor?.initial_consultation_fee || null,
    },
  };
};

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
      .then(({ data }) => {
        console.log("FIRST DOCTOR schedules:", data.data?.[0]?.schedules);
        setDoctors(data.data || []);
      })
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

    const { match } = SPECIALIST_INFO[activeSpecialist];

    // Use specializations array first, fallback to main_specialty
    const specs = Array.isArray(d.specializations)
      ? d.specializations.map((s) => s.toLowerCase().trim())
      : (d.specialization || "")
          .toLowerCase()
          .split(",")
          .map((s) => s.trim());

    return match.some((keyword) => specs.includes(keyword));
  });

  // mapped version of the selected doctor (for DoctorProfile)
  const doctorData = selectedDoctor
    ? (() => {
        const raw = doctors.find((d) => d.doctor_id === selectedDoctor);
        return raw ? mapDoctor(raw) : null;
      })()
    : null;

  // ── Handlers ─────────────────────────────────────────────────
  const handleDoctorSelect = (doctorId) => {
    setSelectedDoctor(doctorId);
  };

  const handleViewProfile = (doctorId) => {
    if (isDesktop) {
      // Desktop/Tablet: Just select (collapsible)
      handleDoctorSelect(doctorId);
    } else {
      // Mobile: Full profile view
      setSelectedDoctor(doctorId);
      setSelectedDate(null);
      setSelectedTime(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
                  onClick={() => setActiveSpecialist(key)}
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
                  doctor={mapDoctor(d)}
                  isSelected={selectedDoctor === d.doctor_id}
                  compact={
                    selectedDoctor !== null && selectedDoctor !== d.doctor_id // Always compact OTHER doctors
                  }
                  onSelect={isDesktop ? handleDoctorSelect : null} //
                  onViewProfile={handleViewProfile}
                  onSetAppointment={handleSetAppointment}
                  hideViewProfileBtn={!isDesktop} //
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

import React, { useState, useEffect, useMemo } from "react";
import { flushSync } from "react-dom";
import { Container, Button } from "react-bootstrap";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import axiosClient from "../../../axiosClient";
import DoctorCard from "../AppointmentComponents/DoctorCard.jsx";
import DoctorProfile from "../AppointmentComponents/DoctorProfile.jsx";
import ServiceAlert from "../AppointmentComponents/ServiceAlert.jsx";
import styles from "./style/PACSetAppointment.module.css";

const STORAGE_BASE = "http://localhost:8000/storage/";

const SPECIALIST_INFO = {
  Psychologist: { label: "PSYCHOLOGIST", role: "Psychologist" },
  Psychiatrist: { label: "PSYCHIATRIST", role: "Psychiatrist" },
};

const normalizeDoctor = (raw) => {
  const d = raw.doctor || {};
  return {
    id: raw.id,
    doctor_id: raw.doctor_id,
    name: `${raw.firstName ?? ""} ${raw.lastName ?? ""}`.trim(),
    firstName: raw.firstName,
    lastName: raw.lastName,
    middleInitial: raw.middleInitial,
    email: raw.email,
    contactNo: raw.contactNo,
    is_active: raw.is_active,
    title: d.professional_title ?? "",
    professional_title: d.professional_title ?? "",
    description: d.description ?? "",
    profile_picture: d.profile_picture
      ? STORAGE_BASE + d.profile_picture
      : null,
    profile_completed: raw.profile_completed,
    years_of_experience: d.years_of_experience,
    practicing_since: d.practicing_since,
    main_specialty: d.main_specialty ?? raw.specialization ?? "",
    license_number: d.license_number ?? raw.license_number ?? "",
    prc_number: d.prc_number ?? "",
    specializations: d.specializations ?? [],
    sub_specializations: d.sub_specializations ?? [],
    board_cert_names: d.board_cert_names ?? [],
    board_cert_images: (d.board_cert_images ?? []).map((p) => STORAGE_BASE + p),
    id_pictures: (d.id_pictures ?? []).map((p) => STORAGE_BASE + p),
    services: d.services ?? [],
  };
};

// ── Component ─────────────────────────────────────────────────────────────────
const PACAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedService = location.state?.selectedService;

  // ── Data state ─────────────────────────────────────────────────────────────
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorsError, setDoctorsError] = useState(null);

  // ── Schedule state ─────────────────────────────────────────────────────────
  // Map of doctor_id → raw schedule array (null = not fetched yet)
  const [doctorSchedules, setDoctorSchedules] = useState({});
  // Schedule for the currently selected doctor's profile panel
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedScheduleLoading, setSelectedScheduleLoading] = useState(false);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [activeSpecialist, setActiveSpecialist] = useState("Psychologist");
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // ── 1. Fetch doctors ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        setDoctorsError(null);
        const response = await axiosClient.get("/admin/doctors");
        const raw = Array.isArray(response.data)
          ? response.data
          : (response.data.data ?? []);
        setDoctors(raw.map(normalizeDoctor));
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setDoctorsError("Failed to load doctors. Please try again.");
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  // ── 2. Once doctors load, fetch ALL their schedules in parallel ────────────
  useEffect(() => {
    if (doctors.length === 0) return;

    const fetchAllSchedules = async () => {
      const results = await Promise.allSettled(
        doctors.map((d) =>
          axiosClient.get(`/doctors/${d.doctor_id}/schedules`).then((res) => ({
            doctor_id: d.doctor_id,
            schedule: res.data?.data?.schedule ?? [],
          })),
        ),
      );

      const map = {};
      results.forEach((r) => {
        if (r.status === "fulfilled") {
          map[r.value.doctor_id] = r.value.schedule;
        }
      });
      setDoctorSchedules(map);
    };

    fetchAllSchedules();
  }, [doctors]);

  // ── 3. Fetch schedule for selected doctor (for the profile panel) ──────────
  const fetchSelectedSchedule = async (doctor) => {
    if (!doctor?.doctor_id) return;
    try {
      setSelectedScheduleLoading(true);
      setSelectedSchedule(null);
      const res = await axiosClient.get(
        `/doctors/${doctor.doctor_id}/schedules`,
      );
      setSelectedSchedule(res.data?.data?.schedule ?? []);
    } catch (err) {
      console.error("Failed to fetch doctor schedule:", err);
      setSelectedSchedule([]);
    } finally {
      setSelectedScheduleLoading(false);
    }
  };

  // ── Resize listener ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleViewProfile = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    setSelectedDoctor(doctorId);
    setSelectedDate(null);
    setSelectedTime(null);
    fetchSelectedSchedule(doctor); // ← fetch this doctor's schedule
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSetAppointment = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (doctor) {
      navigate(
        "/client/appointment/psychotherapy-and-counseling/set-appointment-form",
        { state: { doctor, selectedService } },
      );
    }
  };

  const handleConfirmBooking = () => {
    const doctor = doctors.find((d) => d.id === selectedDoctor);
    if (doctor && selectedDate && selectedTime) {
      alert(
        `Appointment Confirmed!\n\nDoctor: ${doctor.name}\nDate: ${selectedDate.date}\nTime: ${selectedTime}`,
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
      setSelectedSchedule(null); // ← clear profile schedule on back
    });
  };

  // ── Filter doctors ─────────────────────────────────────────────────────────
  const filteredDoctors = doctors.filter((d) => {
    if (!d.is_active || !d.profile_completed) return false;
    if (!activeSpecialist) return true;
    return d.specializations.some((spec) =>
      spec.toLowerCase().includes(activeSpecialist.toLowerCase()),
    );
  });

  const doctorData = selectedDoctor
    ? doctors.find((d) => d.id === selectedDoctor)
    : null;

  return (
    <Container className={`${styles.bookAppointmentContainer} py-4`}>
      {/* ── Specialist Info Modal ── */}
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

      {/* ── Main content ── */}
      <div className={styles.desktopColumns}>
        {/* LEFT column */}
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
            <span> Click here to learn more!</span>
          </p>

          {/* ── Specialist Toggle ── */}
          <div style={{ marginBottom: "14px", marginTop: "4px" }}>
            <div className={styles.specialistToggle}>
              {Object.keys(SPECIALIST_INFO).map((key) => {
                const count = doctors.filter(
                  (d) =>
                    d.is_active &&
                    d.profile_completed &&
                    d.specializations.some((s) =>
                      s.toLowerCase().includes(key.toLowerCase()),
                    ),
                ).length;

                return (
                  <button
                    key={key}
                    className={`${styles.specialistToggleBtn} ${activeSpecialist === key ? styles.specialistToggleActive : ""}`}
                    onClick={() =>
                      setActiveSpecialist((prev) => (prev === key ? null : key))
                    }
                  >
                    {SPECIALIST_INFO[key].label}
                    {!loadingDoctors && (
                      <span
                        style={{
                          marginLeft: "6px",
                          background:
                            activeSpecialist === key
                              ? "rgba(255,255,255,0.25)"
                              : "rgba(77,34,124,0.12)",
                          color: activeSpecialist === key ? "#fff" : "#4d227c",
                          borderRadius: "20px",
                          padding: "1px 7px",
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Doctor list ── */}
          <div
            className={`${styles.doctorsList} ${selectedDoctor ? styles.doctorsListHidden : ""}`}
          >
            {loadingDoctors ? (
              <p className={styles.noDoctorsMsg}>Loading doctors…</p>
            ) : doctorsError ? (
              <p className={styles.noDoctorsMsg} style={{ color: "red" }}>
                {doctorsError}
              </p>
            ) : filteredDoctors.length === 0 ? (
              <p className={styles.noDoctorsMsg}>
                No {activeSpecialist ?? "doctors"} available at the moment.
              </p>
            ) : (
              filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  // ← pass this doctor's schedule (null while loading, array once fetched)
                  schedule={doctorSchedules[doctor.doctor_id] ?? null}
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

        {/* RIGHT column */}
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
                schedule={selectedSchedule} // ← real schedule data
                scheduleLoading={selectedScheduleLoading} // ← loading flag
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

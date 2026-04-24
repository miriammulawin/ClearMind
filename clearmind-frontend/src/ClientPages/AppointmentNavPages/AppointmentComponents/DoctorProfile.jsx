import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge } from "react-bootstrap";
import {
  FaUserCircle,
  FaVideo,
  FaClinicMedical,
  FaStethoscope,
  FaBriefcase,
  FaIdCard,
  FaArrowLeft,
} from "react-icons/fa";
import axiosClient from "../../../axiosClient";
import styles from "./styles/DoctorProfile.module.css";

const DAY_NUM_TO_NAME = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};
const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const formatTime = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

const slotTypeLabel = (type) => {
  if (type === "both") return "Online & Physical";
  if (type === "online") return "Online";
  return "Physical";
};

const DoctorProfile = ({
  doctorData,
  onBookAppointment,
  onBack,
  hideBookButton = false,
  // legacy props (unused but accepted so no errors)
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onConfirmBooking,
}) => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // ── Fetch schedule when doctor changes ──
  useEffect(() => {
    if (!doctorData?.id) return;
    setScheduleLoading(true);
    axiosClient
      .get(`/doctors/${doctorData.id}/schedules`)
      .then(({ data }) => setSchedule(data.data?.schedule || []))
      .catch(() => setSchedule([]))
      .finally(() => setScheduleLoading(false));
  }, [doctorData?.id]);

  const scheduleMap = useMemo(() => {
    if (!schedule || !Array.isArray(schedule)) return {};
    return schedule.reduce((acc, s) => {
      const dayName = DAY_NUM_TO_NAME[s.day_num]; // ← day_num ✅ tama na
      if (dayName) {
        acc[dayName] = {
          startTime: s.start_time?.slice(0, 5),
          endTime: s.end_time?.slice(0, 5),
          slotType: s.slot_type,
        };
      }
      return acc;
    }, {});
  }, [schedule]);

  const availableDays = DAY_ORDER.filter((d) => scheduleMap[d]);

  const earliestSchedule = useMemo(() => {
    if (!schedule || !Array.isArray(schedule) || schedule.length === 0)
      return null;

    const today = new Date();
    const todayNum = today.getDay();

    for (let i = 1; i <= 7; i++) {
      const checkDay = (todayNum + i) % 7;
      const found = schedule.find((s) => s.day_num === checkDay);
      if (found) return found;
    }
    return null;
  }, [schedule]);

  if (!doctorData) return null;

  const handleBookAppointment = () => {
    if (onBookAppointment) onBookAppointment();
    else
      navigate(
        "/client/appointment/psychotherapy-and-counseling/set-appointment-form",
        { state: { doctor: doctorData }, replace: true },
      );
  };

  return (
    <div className={styles.bookingView}>
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: "#5b2c91",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            padding: "0 0 12px 0",
          }}
        >
          <FaArrowLeft /> Back
        </button>
      )}

      <Card className={`${styles.profileCard} mb-4`}>
        <Card.Body className={styles.cardBody}>
          {/* ── Header ── */}
          <div className={styles.doctorHeaderCentered}>
            <div className={styles.doctorAvatarLarge}>
              {doctorData.profile_picture ? (
                <img
                  src={doctorData.profile_picture}
                  alt={doctorData.name}
                  className={styles.profileImage}
                />
              ) : (
                <FaUserCircle className={styles.avatarIconLarge} />
              )}
            </div>
            <div className={styles.doctorInfoFull}>
              <h5 className={styles.doctorNameLarge}>{doctorData.name}</h5>
              {doctorData.professional_title && (
                <p className={styles.doctorTitle}>
                  {doctorData.professional_title}
                </p>
              )}
              {doctorData.main_specialty && (
                <p className={styles.specialtyText}>
                  {doctorData.main_specialty}
                </p>
              )}
              {(doctorData.years_of_experience ||
                doctorData.practicing_since) && (
                <p className={styles.experienceText}>
                  {doctorData.years_of_experience
                    ? `${doctorData.years_of_experience} years of experience`
                    : `Practicing since ${doctorData.practicing_since}`}
                </p>
              )}
            </div>
          </div>
          {/* ── Earliest Available Schedule ── */}
          {earliestSchedule && (
            <>
              <hr className={styles.divider} />
              <div style={{ marginBottom: "8px" }}>
                <h6 className={styles.sectionTitle}>
                  Earliest Available Schedule
                </h6>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#4D227C",
                    }}
                  >
                    {earliestSchedule.day}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "13px", color: "#555" }}>
                      {formatTime(earliestSchedule.start_time)} –{" "}
                      {formatTime(earliestSchedule.end_time)}
                    </span>
                    <Badge
                      className={styles.consultationBadge}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {earliestSchedule.slot_type === "online" && (
                        <FaVideo style={{ fontSize: "10px" }} />
                      )}
                      {earliestSchedule.slot_type === "physical" && (
                        <FaClinicMedical style={{ fontSize: "10px" }} />
                      )}
                      {earliestSchedule.slot_type === "both" && (
                        <>
                          <FaVideo style={{ fontSize: "10px" }} />
                          <FaClinicMedical style={{ fontSize: "10px" }} />
                        </>
                      )}{" "}
                      {slotTypeLabel(earliestSchedule.slot_type)}
                    </Badge>
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ── Description ── */}
          {doctorData.description && (
            <>
              <hr className={styles.divider} />
              <div style={{ padding: "4px 0" }}>
                <h6 className={styles.sectionTitle}>About</h6>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {doctorData.description}
                </p>
              </div>
            </>
          )}

          <hr className={styles.divider} />

          {/* ── Specializations ── */}
          {(doctorData.specializations?.length > 0 ||
            doctorData.sub_specializations?.length > 0) && (
            <>
              <div style={{ marginBottom: "12px" }}>
                <h6 className={styles.sectionTitle}>Specializations</h6>
                {doctorData.specializations?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    {doctorData.specializations.map((s) => (
                      <span
                        key={s}
                        style={{
                          background: "#ede7f6",
                          color: "#4D227C",
                          borderRadius: "20px",
                          padding: "3px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                {doctorData.sub_specializations?.length > 0 && (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                  >
                    {doctorData.sub_specializations.map((s) => (
                      <span
                        key={s}
                        style={{
                          background: "#f3f4f6",
                          color: "#6b7280",
                          borderRadius: "20px",
                          padding: "3px 12px",
                          fontSize: "11px",
                          fontWeight: 500,
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <hr className={styles.divider} />
            </>
          )}

          {/* ── Services ── */}
          {doctorData.services?.length > 0 && (
            <>
              <div style={{ marginBottom: "12px" }}>
                <h6 className={styles.sectionTitle}>Services Offered</h6>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {doctorData.services.map((s) => (
                    <div
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "12px",
                        color: "#374151",
                      }}
                    >
                      <FaStethoscope
                        style={{
                          color: "#4D227C",
                          fontSize: "11px",
                          flexShrink: 0,
                        }}
                      />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <hr className={styles.divider} />
            </>
          )}

          {/* ── Credentials ── */}
          {(doctorData.license_number ||
            doctorData.prc_number ||
            doctorData.board_cert_names?.length > 0) && (
            <>
              <div style={{ marginBottom: "12px" }}>
                <h6 className={styles.sectionTitle}>Credentials</h6>
                {doctorData.license_number && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "5px",
                    }}
                  >
                    <FaIdCard
                      style={{
                        color: "#4D227C",
                        fontSize: "12px",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#555" }}>
                      License No.: <strong>{doctorData.license_number}</strong>
                    </span>
                  </div>
                )}
                {doctorData.prc_number && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "5px",
                    }}
                  >
                    <FaIdCard
                      style={{
                        color: "#4D227C",
                        fontSize: "12px",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#555" }}>
                      PRC No.: <strong>{doctorData.prc_number}</strong>
                    </span>
                  </div>
                )}
                {doctorData.board_cert_names?.map((cert) => (
                  <div
                    key={cert}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <FaBriefcase
                      style={{
                        color: "#7c3aed",
                        fontSize: "11px",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <span style={{ fontSize: "12px", color: "#555" }}>
                      {cert}
                    </span>
                  </div>
                ))}
              </div>
              <hr className={styles.divider} />
            </>
          )}

          {/* ── Schedule ── */}
          <div className={styles.scheduleDetails}>
            <h6 className={styles.sectionTitle}>Schedule</h6>
            {scheduleLoading ? (
              <p className={styles.scheduleValue}>Loading availability…</p>
            ) : availableDays.length === 0 ? (
              <p className={styles.scheduleValue}>No schedule set yet.</p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {availableDays.map((day) => {
                  const entry = scheduleMap[day];
                  return (
                    <div
                      key={day}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          minWidth: "90px",
                          fontSize: "13px",
                        }}
                      >
                        {day}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontSize: "13px", color: "#555" }}>
                          {formatTime(entry.startTime)} –{" "}
                          {formatTime(entry.endTime)}
                        </span>
                        <Badge
                          className={styles.consultationBadge}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {entry.slotType === "online" && (
                            <FaVideo style={{ fontSize: "10px" }} />
                          )}
                          {entry.slotType === "physical" && (
                            <FaClinicMedical style={{ fontSize: "10px" }} />
                          )}
                          {entry.slotType === "both" && (
                            <>
                              <FaVideo style={{ fontSize: "10px" }} />
                              <FaClinicMedical style={{ fontSize: "10px" }} />
                            </>
                          )}{" "}
                          {slotTypeLabel(entry.slotType)}
                        </Badge>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <hr className={styles.divider} />

          {!hideBookButton && (
            <button
              type="button"
              className={`${styles.btnBookAppointment} w-100`}
              onClick={handleBookAppointment}
            >
              SET APPOINTMENT
            </button>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DoctorProfile;

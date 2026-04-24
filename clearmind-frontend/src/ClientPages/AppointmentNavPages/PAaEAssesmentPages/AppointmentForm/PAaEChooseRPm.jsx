// PAaEAssesmentPages/AppointmentForm/PAaEChooseRPm.jsx
import { useMemo, useState, useEffect } from "react";
import DoctorProfile from "../../AppointmentComponents/DoctorProfile";
import styles from "../style/PAaEAppointmentForm.module.css";
import DoctorCard from "../../AppointmentComponents/DoctorCard";
import axiosClient from "../../../../axiosClient";

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

const mapDoctor = (d) => {
  const schedules = Array.isArray(d.schedules) ? d.schedules : [];
  const DAY_ORDER_NUM = [1, 2, 3, 4, 5, 6, 0];
  const sorted = [...schedules].sort(
    (a, b) =>
      DAY_ORDER_NUM.indexOf(a.day_num) - DAY_ORDER_NUM.indexOf(b.day_num),
  );

  const today = new Date();
  const todayNum = today.getDay();
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

  return {
    ...d,
    id: d.doctor_id,
    name: `${d.firstName}${d.middleInitial ? " " + d.middleInitial + "." : ""} ${d.lastName}`,
    title: d.professional_title || d.doctor?.professional_title || "",
    sex: d.sex,

    // ── Profile pic ──
    photo: d.doctor?.profile_picture
      ? `http://localhost:8000/storage/${d.doctor.profile_picture}`
      : null,
    profile_picture: d.doctor?.profile_picture
      ? `http://localhost:8000/storage/${d.doctor.profile_picture}`
      : null,

    // ── DoctorProfile fields ──
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

    // ── DoctorCard display ──
    consultationMode:
      hasOnline && hasPhysical ? "Both" : hasOnline ? "Virtual" : "Onsite",
    consultationType:
      hasOnline && hasPhysical
        ? "Online & On-site"
        : hasOnline
          ? "Virtual Consultation"
          : "On-site Consultation",
    schedule: {
      days: sorted.map((s) => s.day),
      time: earliestSchedule
        ? `${formatTime(earliestSchedule.start_time)} - ${formatTime(earliestSchedule.end_time)}`
        : null,
      earliest: earliestSchedule?.day || null,
    },
    consultationFees: {
      initialConsultation: d.doctor?.initial_consultation_fee || null,
    },
  };
};

const PAaEChooseRPm = ({ config, form, setForm, onDoctorSelect }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosClient
      .get("/doctors/list")
      .then(({ data }) => {
        console.log("doctors/list raw response:", data.data);
        data.data?.forEach((d) =>
          console.log(`[${d.doctor_id}]`, {
            professional_title: d.professional_title,
            specialization: d.specialization,
            sex: d.sex,
          }),
        );
        setDoctors(data.data || []);
      })
      .catch((err) => {
        console.error("Failed to load doctors:", err);
        setError("Failed to load doctors.");
      })
      .finally(() => setLoading(false));
  }, []);

  const rpmList = useMemo(() => {
    return doctors.filter((d) => {
      const title = (d.professional_title || "").toLowerCase();
      const spec = (d.specialization || "").toLowerCase();

      const isRpm =
        title.includes("psychometrician") ||
        title.includes("rpm") ||
        title.includes("r.pm") ||
        spec.includes("psychometrician") ||
        spec.includes("rpm");

      if (config?.femaleOnly) {
        return isRpm && (d.sex || "").toLowerCase() === "female";
      }

      return isRpm;
    });
  }, [doctors, config?.femaleOnly]);

  const displayList = rpmList.length > 0 ? rpmList : doctors;

  return (
    <div className={styles.stepCard}>
      {selectedProfile ? (
        <DoctorProfile
          doctorData={selectedProfile}
          onBack={() => setSelectedProfile(null)}
          hideBookButton={true}
        />
      ) : (
        <>
          <h4 className={styles.titlePage}>Choose your Psychometrician:</h4>

          {config?.femaleOnly && (
            <div className={styles.infoBanner}>
              <span>⚠️</span>
              <span>
                For VAWC cases, only <strong>Female</strong> RPm /
                Psychometricians are available.
              </span>
            </div>
          )}

          {loading && <p>Loading doctors...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className={styles.rpmGrid}>
            {!loading && !error && displayList.length === 0 && (
              <p>No doctors available.</p>
            )}
            {!loading &&
              !error &&
              displayList.map((d) => {
                const mapped = mapDoctor(d);
                return (
                  <DoctorCard
                    compact
                    key={d.doctor_id}
                    doctor={mapped}
                    hideSetAppointment
                    hideViewProfileBtn={false}
                    isSelected={form.rpm === d.doctor_id}
                    onViewProfile={() => setSelectedProfile(mapped)}
                    onSelect={() => {
                      setForm((prev) => ({
                        ...prev,
                        rpm: d.doctor_id,
                        date: null,
                        time: null,
                      }));
                      onDoctorSelect(d);
                    }}
                  />
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default PAaEChooseRPm;

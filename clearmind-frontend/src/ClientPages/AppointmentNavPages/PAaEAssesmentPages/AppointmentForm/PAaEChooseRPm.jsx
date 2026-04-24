// PAaEAssesmentPages/AppointmentForm/PAaEChooseRPm.jsx
import { useMemo, useState, useEffect } from "react";
import DoctorProfile from "../../AppointmentComponents/DoctorProfile";
import styles from "../style/PAaEAppointmentForm.module.css";
import DoctorCard from "../../AppointmentComponents/DoctorCard";
import axiosClient from "../../../../axiosClient";

const STORAGE_BASE = "http://localhost:8000/storage/";

// Matches the exact shape of /admin/doctors response:
// raw.doctor = doctor info, raw.doctor.user = personal info
const normalizeDoctor = (raw) => {
  const d = raw.doctor || {};
  const u = d.user || {};

  // Name can come from raw level (PACAppointment shape)
  // OR from d.user level (PAaE shape) — handle both
  const firstName = raw.firstName ?? u.firstName ?? "";
  const lastName = raw.lastName ?? u.lastName ?? "";

  return {
    id: raw.id ?? u.id,
    doctor_id: raw.doctor_id ?? d.doctor_id,
    name: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    middleInitial: raw.middleInitial ?? u.middleInitial ?? "",
    email: raw.email ?? u.email ?? "",
    contactNo: raw.contactNo ?? u.contactNo ?? "",
    sex: raw.sex ?? u.sex ?? null,
    is_active: raw.is_active ?? u.is_active ?? true,
    title: d.professional_title ?? "",
    professional_title: d.professional_title ?? "",
    description: d.description ?? "",
    profile_picture: d.profile_picture
      ? STORAGE_BASE + d.profile_picture
      : null,
    profile_completed: raw.profile_completed ?? d.profile_completed ?? false,
    years_of_experience: d.years_of_experience,
    practicing_since: d.practicing_since,
    main_specialty: d.main_specialty ?? "",
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

const PAaEChooseRPm = ({ config, form, setForm, onDoctorSelect }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedScheduleLoading, setSelectedScheduleLoading] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── 1. Fetch all doctors ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosClient.get("/admin/doctors");
        const raw = Array.isArray(response.data)
          ? response.data
          : (response.data.data ?? []);
        setAllDoctors(raw.map(normalizeDoctor));
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Failed to load psychometricians. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // ── 2. Fetch ALL schedules in parallel once doctors load ───────────────────
  useEffect(() => {
    if (allDoctors.length === 0) return;
    const fetchAllSchedules = async () => {
      const results = await Promise.allSettled(
        allDoctors.map((d) =>
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
  }, [allDoctors]);

  // ── 3. Fetch schedule when viewing a profile ───────────────────────────────
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
      console.error("Failed to fetch schedule:", err);
      setSelectedSchedule([]);
    } finally {
      setSelectedScheduleLoading(false);
    }
  };

  // ── Filter: Psychometricians only ──────────────────────────────────────────
  const rpmList = useMemo(() => {
    return allDoctors.filter((d) => {
      if (!d.is_active || !d.profile_completed) return false;

      const isPsychometrician = d.specializations.some((s) =>
        s.toLowerCase().includes("psychometrician"),
      );
      if (!isPsychometrician) return false;

      // Only apply sex filter if sex field exists in the API response
      if (config?.femaleOnly && d.sex !== null && d.sex !== undefined) {
        return d.sex?.toLowerCase() === "female";
      }

      return true;
    });
  }, [allDoctors, config?.femaleOnly]);

  return (
    <div className={styles.stepCard}>
      {selectedProfile ? (
        // ── Profile view ────────────────────────────────────────────────────
        <DoctorProfile
          doctorData={selectedProfile}
          schedule={selectedSchedule}
          scheduleLoading={selectedScheduleLoading}
          onBack={() => {
            setSelectedProfile(null);
            setSelectedSchedule(null);
          }}
        />
      ) : (
        // ── List view ───────────────────────────────────────────────────────
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

          <div className={styles.rpmGrid}>
            {loading ? (
              <p className={styles.noDoctorsMsg}>Loading psychometricians…</p>
            ) : error ? (
              <p className={styles.noDoctorsMsg} style={{ color: "red" }}>
                {error}
              </p>
            ) : rpmList.length === 0 ? (
              <p className={styles.noDoctorsMsg}>
                No psychometricians available at the moment.
              </p>
            ) : (
              rpmList.map((r) => (
                <DoctorCard
                  // compact   ← remove this line
                  viewProfileVariant="purple"
                  key={r.id}
                  doctor={r}
                  schedule={doctorSchedules[r.doctor_id] ?? null}
                  hideSetAppointment
                  isSelected={form.rpm === r.id}
                  onViewProfile={(id) => {
                    const doctor = rpmList.find((d) => d.id === id);
                    if (doctor) {
                      setSelectedProfile(doctor);
                      fetchSelectedSchedule(doctor);
                    }
                  }}
                  onSelect={() => {
                    setForm((prev) => ({
                      ...prev,
                      rpm: r.id,
                      date: null,
                      time: null,
                    }));
                    onDoctorSelect(r);
                  }}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PAaEChooseRPm;

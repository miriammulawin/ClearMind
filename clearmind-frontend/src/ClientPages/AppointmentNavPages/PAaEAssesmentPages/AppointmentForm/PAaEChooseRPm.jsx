// PAaEAssesmentPages/AppointmentForm/PAaEChooseRPm.jsx
import { useMemo, useState, useEffect } from "react";
import DoctorProfile from "../../AppointmentComponents/DoctorProfile";
import { MOCK_DOCTORS } from "../../../../MockData/MockDoctors";
import styles from "../style/PAaEAppointmentForm.module.css";
import DoctorCard from "../../AppointmentComponents/DoctorCard";
import axiosClient from "../../../../axiosClient";

// ── Backend → DoctorCard shape ────────────────────────────────────
const mapDoctor = (d) => ({
  id: d.doctor_id,
  name: `${d.firstName}${d.middleInitial ? " " + d.middleInitial + "." : ""} ${d.lastName}`,
  title: d.professional_title || d.specialization || "",
  sex: d.sex,
  photo: d.doctor?.profile_photo_url || null,
});

const PAaEChooseRPm = ({ config, form, setForm, onDoctorSelect }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
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

  const rpmList = useMemo(() => {
    return doctors.filter((d) => {
      const specs = d.specializations ?? [];

      const isRpm = specs.some((s) => s.toLowerCase() === "psychometrician");

      if (config.femaleOnly) {
        return isRpm && d.sex === "female";
      }

      return isRpm;
    });
  }, [doctors, config.femaleOnly]);

  doctors.forEach((d) => {
    console.log({
      specialization: d.specialization,
      title: d.professional_title,
    });
  });

  return (
    <div className={styles.stepCard}>
      {selectedProfile ? (
        // ── Profile view ──────────────────────────────────
        <DoctorProfile
          doctorData={selectedProfile}
          onBack={() => setSelectedProfile(null)}
        />
      ) : (
        // ── List view ─────────────────────────────────────
        <>
          <div>
            <h4 className={styles.titlePage}>Choose your Psychometrician :</h4>
          </div>

          {config.femaleOnly && (
            <div className={styles.infoBanner}>
              <span>⚠️</span>
              <span>
                For VAWC cases, only <strong>Female</strong> RPm /
                Psychometricians are available.
              </span>
            </div>
          )}

          {loading && <p>Loading doctors...</p>}
          {error && <p>{error}</p>}

          <div className={styles.rpmGrid}>
            {!loading && !error && rpmList.length === 0 && (
              <p>No psychometricians available.</p>
            )}
            {!loading &&
              !error &&
              rpmList.map((d) => {
                const mapped = mapDoctor(d); // ← i-map ang bawat doctor
                return (
                  <DoctorCard
                    compact
                    viewProfileVariant="purple"
                    key={d.doctor_id} // ← d.doctor_id, hindi d.id
                    doctor={mapped} // ← mapped, hindi raw d
                    hideSetAppointment
                    isSelected={form.rpm === d.doctor_id} // ← doctor_id
                    onViewProfile={() => setSelectedProfile(mapped)}
                    onSelect={() => {
                      setForm((prev) => ({
                        ...prev,
                        rpm: d.doctor_id, // ← doctor_id
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

// PAaEAssesmentPages/AppointmentForm/PAaEChooseRPm.jsx
import { useMemo, useState, useEffect } from "react";
import DoctorProfile from "../../AppointmentComponents/DoctorProfile";
import styles from "../style/PAaEAppointmentForm.module.css";
import DoctorCard from "../../AppointmentComponents/DoctorCard";
import axiosClient from "../../../../axiosClient";

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

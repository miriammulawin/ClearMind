// PAaEAssesmentPages/AppointmentForm/PAaEChooseRPm.jsx
import { useMemo, useState } from "react";
import DoctorProfile from "../../AppointmentComponents/DoctorProfile";
import { MOCK_DOCTORS } from "../../../../MockData/MockDoctors";
import styles from "../style/PAaEAppointmentForm.module.css";
import DoctorCard from "../../AppointmentComponents/DoctorCard";

const PAaEChooseRPm = ({ config, form, setForm, onDoctorSelect }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const rpmList = useMemo(
    () =>
      MOCK_DOCTORS.filter((d) => {
        const isRpm =
          d.title.includes("Psychometrician") ||
          (d.credentials &&
            d.credentials
              .split(",")
              .map((c) => c.trim())
              .includes("RPm"));
        if (config.femaleOnly) return isRpm && d.sex === "Female";
        return isRpm;
      }),
    [config.femaleOnly],
  );

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

          <div className={styles.rpmGrid}>
            {rpmList.map((r) => (
              <DoctorCard
                compact
                viewProfileVariant="purple"
                key={r.id}
                doctor={r}
                hideSetAppointment
                isSelected={form.rpm === r.id}
                onViewProfile={(id) => {
                  const doctor = rpmList.find((d) => d.id === id); // CHANGED
                  setSelectedProfile(doctor);
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
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PAaEChooseRPm;

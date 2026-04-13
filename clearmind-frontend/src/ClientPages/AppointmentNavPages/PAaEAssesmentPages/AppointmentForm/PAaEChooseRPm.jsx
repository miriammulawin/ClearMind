// PAaEAssesmentPages/AppointmentForm/PAaEChooseRPm.jsx
import React, { useMemo, useState } from "react";
import { MOCK_DOCTORS } from "../../../../MockData/MockDoctors";
import styles from "../style/PAaEAppointmentForm.module.css";
import SelectDateandTime, {
  SameDayToast,
} from "../../AppointmentComponents/SelectDateandTime";

const PAaEChooseRPm = ({
  config,
  form,
  setForm,
  selectedDoctor,
  onDoctorSelect,
}) => {
  const [sameDayToast, setSameDayToast] = useState(false);

  // titles in MockDoctors: 'Clinic Psychometrician', 'Chief Psychometrician / Learning Head'
  // must use includes() — exact match 'Psychometrician' finds nothing
  const rpmList = useMemo(
    () => MOCK_DOCTORS.filter((d) => d.title.includes("Psychometrician")),
    [],
  );

  const modeLabel = (mode) => {
    if (mode === "Virtual")
      return { label: "Virtual", cls: styles.modeVirtual };
    if (mode === "Onsite") return { label: "On-Site", cls: styles.modeOnsite };
    return { label: "On-Site & Virtual", cls: styles.modeBoth };
  };

  const handleSetDate = (dateSlot) =>
    setForm((prev) => ({ ...prev, date: dateSlot, time: null }));

  const handleSetTime = (time) => setForm((prev) => ({ ...prev, time }));

  return (
    <div className={styles.stepCard}>
      {/* PAaESetAppointmentForm has no SameDayToast — own it here */}
      <SameDayToast
        show={sameDayToast}
        onClose={() => setSameDayToast(false)}
      />

      {/* VAWC female-only notice */}
      {config.femaleOnly && (
        <div className={styles.infoBanner}>
          <span>⚠️</span>
          <span>
            For VAWC cases, only <strong>Female</strong> RPm / Psychometricians
            are available.
          </span>
        </div>
      )}

      {/* RPm cards */}
      <div className={styles.rpmGrid}>
        {rpmList.map((r) => {
          const mode = modeLabel(r.consultationMode);
          const initials = r.name
            .split(" ")
            .filter((w) => /^[A-Z]/.test(w))
            .slice(0, 2)
            .map((w) => w[0])
            .join("");
          const isSelected = form.rpm === r.id;

          return (
            <div
              key={r.id}
              className={`${styles.rpmCard} ${isSelected ? styles.rpmCardSelected : ""}`}
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  rpm: r.id,
                  date: null,
                  time: null,
                }));
                onDoctorSelect(r);
              }}
            >
              <div className={styles.rpmAvatar}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.rpmName}>{r.name}</div>
                <div className={styles.rpmTitle}>RPm / Psychometrician</div>
                <div className={styles.rpmSchedule}>
                  🗓 {r.schedule.days.join(", ")} · {r.schedule.time}
                </div>
                <span className={`${styles.rpmBadge} ${mode.cls}`}>
                  {mode.label}
                </span>
              </div>
              {isSelected && <div className={styles.rpmCheck}>✓</div>}
            </div>
          );
        })}
      </div>

      {/* Calendar + Time — only after an RPm is picked */}
      {selectedDoctor && (
        <div style={{ marginTop: "1.5rem" }}>
          <div className={styles.calSectionDivider}>
            <span>📅</span>
            <span>
              Select a preferred date for <strong>{selectedDoctor.name}</strong>
            </span>
          </div>

          <SelectDateandTime
            doctorData={selectedDoctor}
            selectedDate={form.date ?? null}
            setSelectedDate={handleSetDate}
            selectedTime={form.time ?? null}
            setSelectedTime={handleSetTime}
            hideSectionTitle
            onSameDayClick={() => setSameDayToast(true)}
          />
        </div>
      )}
    </div>
  );
};

export default PAaEChooseRPm;

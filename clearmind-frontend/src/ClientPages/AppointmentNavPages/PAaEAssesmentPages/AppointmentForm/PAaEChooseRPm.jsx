// PAaEAssesmentPages/AppointmentForm/PAaEChooseRPm.jsx
// Step: Choose RPm / Psychometrician
// Uses same pattern as PAC ScheduleForm for date/time selection

import React, { useMemo } from 'react';
import { MOCK_DOCTORS } from '../../../../MockData/MockDoctors';
import styles from '../style/PAaEAppointmentForm.module.css';
import SelectDateandTime from '../../AppointmentComponents/SelectDateandTime';

/* -----------------------------------------------------------------
   PAaEChooseRPm
   Props:
     config          — SERVICE_CONFIG entry
     form            — shared form state  { rpm, date, time, ... }
     setForm         — form state setter
     selectedDoctor  — full doctor object or null
     onDoctorSelect  — (doctor) => void — lifts selection to parent
------------------------------------------------------------------ */
const PAaEChooseRPm = ({ config, form, setForm, selectedDoctor, onDoctorSelect }) => {

  const rpmList = useMemo(() => {
    const all = MOCK_DOCTORS.filter(d => d.title === 'Psychometrician');
    return config.femaleOnly
      ? all.filter(d => ['Maria', 'Angela', 'Patricia'].some(n => d.name.includes(n)))
      : all;
  }, [config.femaleOnly]);

  const modeLabel = (mode) => {
    if (mode === 'Virtual') return { label: 'Virtual',           cls: styles.modeVirtual };
    if (mode === 'Onsite')  return { label: 'On-Site',           cls: styles.modeOnsite  };
    return                         { label: 'On-Site & Virtual', cls: styles.modeBoth    };
  };

  // ── Same pattern as PAC: individual setters so no stale closure ──────────────
  const handleSetDate = (dateSlot) => {
    setForm(prev => ({ ...prev, date: dateSlot, time: null }));
  };

  const handleSetTime = (time) => {
    setForm(prev => ({ ...prev, time }));
  };

  return (
    <div className={styles.stepCard}>

      {/* ── VAWC female-only notice ── */}
      {config.femaleOnly && (
        <div className={styles.infoBanner}>
          <span>⚠️</span>
          <span>
            For VAWC cases, only <strong>Female</strong> RPm / Psychometricians are available.
          </span>
        </div>
      )}

      {/* ── RPm cards ── */}
      <div className={styles.rpmGrid}>
        {rpmList.map(r => {
          const mode       = modeLabel(r.consultationMode);
          const initials   = r.name
            .split(' ')
            .filter(w => /^[A-Z]/.test(w))
            .slice(0, 2)
            .map(w => w[0])
            .join('');
          const isSelected = form.rpm === r.id;

          return (
            <div
              key={r.id}
              className={`${styles.rpmCard} ${isSelected ? styles.rpmCardSelected : ''}`}
              onClick={() => {
                setForm(prev => ({ ...prev, rpm: r.id, date: null, time: null }));
                onDoctorSelect(r);
              }}
            >
              <div className={styles.rpmAvatar}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.rpmName}>{r.name}</div>
                <div className={styles.rpmTitle}>RPm / Psychometrician</div>
                <div className={styles.rpmSchedule}>
                  🗓 {r.schedule.days.join(', ')} · {r.schedule.time}
                </div>
                <span className={`${styles.rpmBadge} ${mode.cls}`}>{mode.label}</span>
              </div>
              {isSelected && <div className={styles.rpmCheck}>✓</div>}
            </div>
          );
        })}
      </div>

      {/* ── Calendar + Time slots — shown once an RPm is selected ── */}
      {selectedDoctor && (
        <div style={{ marginTop: '1.5rem' }}>

          <div className={styles.calSectionDivider}>
            <span>📅</span>
            <span>
              Select a preferred date for <strong>{selectedDoctor.name}</strong>
            </span>
          </div>

          {/* Exact same usage as PAC ScheduleForm — direct prop passing, no wrappers */}
          <SelectDateandTime
            doctorData={selectedDoctor}
            selectedDate={form.date ?? null}
            setSelectedDate={handleSetDate}
            selectedTime={form.time ?? null}
            setSelectedTime={handleSetTime}
            hideSectionTitle
          />

        </div>
      )}

    </div>
  );
};

export default PAaEChooseRPm;
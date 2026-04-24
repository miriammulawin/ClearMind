// ScheduleForm.jsx — Step 1
import React, { useMemo, useEffect } from "react";
import { FaVideo, FaHome } from "react-icons/fa";
import styles from "../../../ClientStyle/ScheduleForm.module.css";
import SelectDateAndTime, {
  getEndTime,
} from "../../AppointmentComponents/SelectDateandTime";

const getDayMode = (dateStr, doctorData) => {
  if (!dateStr || !doctorData) return null;
  const dayOfWeek = new Date(dateStr + "T00:00:00").getDay();
  const onSiteDays = doctorData.onSiteDays || [];
  const virtualDays = doctorData.virtualDays || [];
  if (onSiteDays.includes(dayOfWeek) && !virtualDays.includes(dayOfWeek))
    return "ON-SITE";
  if (virtualDays.includes(dayOfWeek) && !onSiteDays.includes(dayOfWeek))
    return "VIRTUAL";
  return null;
};

const formatTimePH = (time24) => {
  if (!time24) return "—";
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
};

const formatPeso = (amt) =>
  amt !== null && amt !== undefined
    ? new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(amt)
    : null;

const ScheduleForm = ({
  doctorData,
  // ── Live API data from SetAppointmentForm ──
  doctorSchedule = [],
  scheduleLoading = false,
  availableDayNums = [],
  scheduleForDate = null,
  bookedSlots = [],
  bookedSlotsLoading = false,
  // ── Service already chosen (passed from location.state) ──
  selectedService = "",
  selectedServiceFee = null,
  serviceFromState = null,
  // ── Form state ──
  consultationMode,
  setConsultationMode,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  consultationFee,
  onSameDayClick,
}) => {
  // Derive available consultation modes from schedule slot_type
  const availableModes = useMemo(() => {
    if (doctorData?.consultationMode) {
      const mode = doctorData.consultationMode;
      const modes = [];
      if (mode === "Both" || mode === "In-Person" || mode === "Onsite")
        modes.push("ON-SITE");
      if (mode === "Both" || mode === "Online" || mode === "Virtual")
        modes.push("VIRTUAL");
      if (modes.length) return modes;
    }
    const modes = new Set();
    doctorSchedule.forEach((s) => {
      if (s.slot_type === "physical" || s.slot_type === "both")
        modes.add("ON-SITE");
      if (s.slot_type === "online" || s.slot_type === "both")
        modes.add("VIRTUAL");
    });
    return [...modes];
  }, [doctorData, doctorSchedule]);

  useEffect(() => {
    if (availableModes.length === 1 && consultationMode !== availableModes[0])
      setConsultationMode(availableModes[0]);
  }, [availableModes, consultationMode, setConsultationMode]);

  useEffect(() => {
    if (!selectedDate || availableModes.length !== 2) return;
    const dayMode = getDayMode(selectedDate, doctorData);
    if (dayMode && consultationMode !== dayMode) setConsultationMode(dayMode);
  }, [
    selectedDate,
    availableModes,
    doctorData,
    consultationMode,
    setConsultationMode,
  ]);

  const isFormComplete = consultationMode && selectedDate && selectedTime;

  const resolvedDateStr =
    typeof selectedDate === "string"
      ? selectedDate
      : selectedDate?.isoDate || selectedDate?.date || "";

  const serviceDisplayName =
    serviceFromState?.service_name ||
    serviceFromState?.title ||
    selectedService ||
    "";

  return (
    <>
      {/* ══ Selected Service — read-only banner (already chosen on prev page) ══ */}
      {serviceDisplayName && (
        <div
          style={{
            margin: "0 0 20px",
            padding: "14px 18px",
            background: "#f5f0fb",
            border: "2px solid #4D227C",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#4D227C",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "4px",
              }}
            >
              Selected Service
            </div>
            <div
              style={{ fontSize: "14px", fontWeight: 600, color: "#2d1254" }}
            >
              {serviceDisplayName}
            </div>
            {selectedServiceFee !== null &&
              selectedServiceFee !== undefined && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#059669",
                    fontWeight: 600,
                    marginTop: "3px",
                  }}
                >
                  Fee: {formatPeso(selectedServiceFee)}
                </div>
              )}
          </div>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#4D227C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M2.5 8.5L6 12L13.5 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* ══ Consultation Mode ══ */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>
          <span className={styles.required}>*</span> Consultation Mode
        </p>

        {scheduleLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#aaa",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                border: "2px solid #4D227C",
                borderTop: "2px solid transparent",
                animation: "pac_spin 0.8s linear infinite",
                flexShrink: 0,
              }}
            />
            Loading schedule…
            <style>{`@keyframes pac_spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : availableModes.length === 0 ? (
          <p
            style={{
              color: "#9a3412",
              fontSize: "13px",
              padding: "10px 14px",
              background: "#fff8f0",
              border: "1px solid #fed7aa",
              borderRadius: "8px",
            }}
          >
            ⚠ No schedule available for this doctor.
          </p>
        ) : availableModes.length === 1 ? (
          <div className={styles.singleModeInfo}>
            {availableModes[0] === "VIRTUAL" ? (
              <>
                <FaVideo className={styles.singleModeIcon} /> Virtual
                Consultation
              </>
            ) : (
              <>
                <FaHome className={styles.singleModeIcon} /> On-Site
                Consultation
              </>
            )}
          </div>
        ) : (
          <div className={styles.modeToggleRow}>
            {[
              ["ON-SITE", "On-Site", FaHome],
              ["VIRTUAL", "Virtual", FaVideo],
            ].map(([val, lbl, Icon]) => (
              <button
                key={val}
                className={`${styles.modeToggle} ${consultationMode === val ? styles.modeToggleActive : ""}`}
                onClick={() => {
                  setConsultationMode(val);
                  setSelectedDate(null);
                  setSelectedTime(null);
                }}
              >
                <Icon className={styles.modeToggleIcon} />
                <span>{lbl}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══ Calendar + Time — real API data ══ */}
      <SelectDateAndTime
        availableDayNums={availableDayNums}
        scheduleForDate={scheduleForDate}
        bookedSlots={bookedSlots}
        bookedSlotsLoading={bookedSlotsLoading}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        onSameDayClick={onSameDayClick}
      />

      {/* ══ Booking Summary ══ */}
      {isFormComplete && (
        <div className={styles.summaryCard}>
          <p className={styles.summaryTitle}>Booking Summary</p>
          <div className={styles.summaryGrid}>
            <span className={styles.summaryLabel}>Doctor</span>
            <span className={styles.summaryValue}>{doctorData?.name}</span>

            <span className={styles.summaryLabel}>Mode</span>
            <span className={styles.summaryValue}>{consultationMode}</span>

            <span className={styles.summaryLabel}>Date</span>
            <span className={styles.summaryValue}>{resolvedDateStr}</span>

            <span className={styles.summaryLabel}>Time</span>
            <span className={styles.summaryValue}>
              {formatTimePH(selectedTime)} – {getEndTime(selectedTime)}
            </span>

            {serviceDisplayName && (
              <>
                <span className={styles.summaryLabel}>Service</span>
                <span className={styles.summaryValue}>
                  {serviceDisplayName}
                </span>
              </>
            )}

            {consultationFee !== null && consultationFee !== undefined && (
              <>
                <span
                  className={`${styles.summaryLabel} ${styles.summaryFeeLabel}`}
                >
                  Consultation Fee
                </span>
                <span className={`${styles.summaryValue} ${styles.summaryFee}`}>
                  ₱{Number(consultationFee).toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ScheduleForm;

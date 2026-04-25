// ScheduleForm.jsx — Step 1
// FIXED: passes doctorSchedule + consultationMode to SelectDateAndTime
// so the calendar properly disables dates that don't support the selected mode.

import React, { useMemo, useEffect } from "react";
import { FaVideo, FaHome, FaCheck } from "react-icons/fa";
import styles from "../../../ClientStyle/ScheduleForm.module.css";
import SelectDateAndTime, {
  getEndTime,
} from "../../AppointmentComponents/SelectDateandTime";

/* ─── Formatters ──────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────────────── */
const ScheduleForm = ({
  /* Doctor info */
  doctorData,
  /* Real schedule from backend */
  doctorSchedule = [],
  scheduleLoading = false,
  availableDayNums = [], // day-of-week nums already filtered by mode in parent
  scheduleForDate = null,
  /* Real booked slots */
  bookedSlots = [],
  bookedSlotsLoading = false,
  /* Fully-booked calendar data */
  fullyBookedDates = new Set(),
  loadingBookedDates = false,
  onMonthChange,
  /* Service */
  selectedService = "",
  selectedServiceFee = null,
  serviceFromState = null,
  /* Lifted form state */
  consultationMode,
  setConsultationMode,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  consultationFee,
  onSameDayClick,
}) => {
  /* ── Which modes does this doctor offer at all? ─────────────────────────── */
  const allAvailableModes = useMemo(() => {
    const modes = new Set();
    doctorSchedule.forEach((s) => {
      if (s.slot_type === "physical" || s.slot_type === "both")
        modes.add("ON-SITE");
      if (s.slot_type === "online" || s.slot_type === "both")
        modes.add("VIRTUAL");
    });
    return [...modes];
  }, [doctorSchedule]);

  /* ── Auto-select when only one mode available ───────────────────────────── */
  useEffect(() => {
    if (
      allAvailableModes.length === 1 &&
      consultationMode !== allAvailableModes[0]
    ) {
      setConsultationMode(allAvailableModes[0]);
    }
  }, [allAvailableModes]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Handle mode button click ───────────────────────────────────────────── */
  const handleModeSelect = (mode) => {
    if (consultationMode === mode) return;
    setConsultationMode(mode);
    // Clear date/time when mode changes — dates valid for one mode may not be valid for another
    setSelectedDate(null);
    setSelectedTime(null);
  };

  /* ── Derived ────────────────────────────────────────────────────────────── */
  const isFormComplete = consultationMode && selectedDate && selectedTime;
  const resolvedDateStr = typeof selectedDate === "string" ? selectedDate : "";
  const serviceDisplayName =
    serviceFromState?.service_name ||
    serviceFromState?.title ||
    selectedService ||
    "";

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ══ Service Banner ══ */}
      {serviceDisplayName && (
        <div
          style={{
            margin: "0 0 22px",
            padding: "14px 18px",
            background: "#f5f0fb",
            border: "2px solid #4D227C",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#4D227C",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
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
            <FaCheck size={14} color="#fff" />
          </div>
        </div>
      )}

      {/* ══ STEP 1: Consultation Mode ══ */}
      <div className={styles.section} style={{ marginBottom: "28px" }}>
        <p className={styles.sectionTitle}>
          <span className={styles.required}>*</span> Consultation Mode
        </p>

        {/* Loading */}
        {scheduleLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#aaa",
              fontSize: "13px",
              padding: "16px",
              background: "#f9f7fd",
              borderRadius: "12px",
              border: "1.5px solid #e8d8f8",
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
            Loading doctor schedule…
            <style>{`@keyframes pac_spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* No schedule */}
        {!scheduleLoading && allAvailableModes.length === 0 && (
          <div
            style={{
              padding: "14px 18px",
              background: "#fff8f0",
              border: "1px solid #fed7aa",
              borderRadius: "12px",
              fontSize: "13px",
              color: "#9a3412",
            }}
          >
            ⚠ No schedule available for this doctor. Please go back and select a
            different doctor.
          </div>
        )}

        {/* Single mode — auto-selected, show as read-only */}
        {!scheduleLoading && allAvailableModes.length === 1 && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 20px",
              background: "#f5f0fb",
              border: "2px solid #4D227C",
              borderRadius: "14px",
              color: "#4D227C",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#4D227C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {allAvailableModes[0] === "VIRTUAL" ? (
                <FaVideo size={16} color="#fff" />
              ) : (
                <FaHome size={16} color="#fff" />
              )}
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>
                {allAvailableModes[0] === "VIRTUAL"
                  ? "Virtual Consultation"
                  : "On-Site Consultation"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#7c3aed",
                  fontWeight: 400,
                  marginTop: "2px",
                }}
              >
                Only available mode for this doctor
              </div>
            </div>
            <span
              style={{
                marginLeft: "8px",
                background: "#4D227C",
                color: "#fff",
                borderRadius: "20px",
                fontSize: "10px",
                padding: "3px 10px",
                fontWeight: 700,
              }}
            >
              AUTO-SELECTED
            </span>
          </div>
        )}

        {/* Both modes — user chooses FIRST */}
        {!scheduleLoading && allAvailableModes.length === 2 && (
          <>
            <p
              style={{
                fontSize: "12px",
                color: "#7c3aed",
                marginBottom: "14px",
                fontWeight: 500,
              }}
            >
              Choose your preferred mode first. The calendar will only show
              dates available for that mode.
            </p>

            <div style={{ display: "flex", gap: "14px" }}>
              {[
                {
                  val: "ON-SITE",
                  label: "On-Site",
                  sub: "Visit the clinic in person",
                  Icon: FaHome,
                },
                {
                  val: "VIRTUAL",
                  label: "Virtual",
                  sub: "Online / video consultation",
                  Icon: FaVideo,
                },
              ].map(({ val, label, sub, Icon }) => {
                const isActive = consultationMode === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleModeSelect(val)}
                    style={{
                      flex: 1,
                      padding: "18px 14px",
                      borderRadius: "16px",
                      border: isActive
                        ? "2.5px solid #4D227C"
                        : "2px solid #e8d8f8",
                      background: isActive ? "#f5f0fb" : "#fff",
                      cursor: "pointer",
                      transition: "all .2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                      fontFamily: "Poppins, sans-serif",
                      boxShadow: isActive
                        ? "0 0 0 4px rgba(77,34,124,0.12)"
                        : "0 1px 4px rgba(0,0,0,0.06)",
                      position: "relative",
                      outline: "none",
                    }}
                  >
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background: "#4D227C",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FaCheck size={10} color="#fff" />
                      </div>
                    )}
                    <div
                      style={{
                        width: "54px",
                        height: "54px",
                        borderRadius: "50%",
                        background: isActive ? "#4D227C" : "#f0eaf8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all .2s",
                      }}
                    >
                      <Icon size={22} color={isActive ? "#fff" : "#9c7dd4"} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: isActive ? "#4D227C" : "#374151",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: isActive ? "#7c3aed" : "#aaa",
                          marginTop: "3px",
                          lineHeight: 1.3,
                        }}
                      >
                        {sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {!consultationMode && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  background: "#faf7ff",
                  border: "1px dashed #d4b8f0",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>💡</span>
                <span>Select a mode above to unlock the date calendar.</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ STEP 2: Calendar + Time (only shown after mode is selected) ══ */}
      {consultationMode && !scheduleLoading && (
        <SelectDateAndTime
          /* Mode-filtered available days (day-of-week nums) */
          availableDayNums={availableDayNums}
          /* FIXED: pass full schedule + mode so calendar can filter by slot_type */
          doctorSchedule={doctorSchedule}
          consultationMode={consultationMode}
          /* Schedule entry for the selected date */
          scheduleForDate={scheduleForDate}
          /* Booked slots */
          bookedSlots={bookedSlots}
          bookedSlotsLoading={bookedSlotsLoading}
          /* Fully-booked calendar data */
          fullyBookedDates={fullyBookedDates}
          loadingBookedDates={loadingBookedDates}
          onMonthChange={onMonthChange}
          /* Form state */
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          onSameDayClick={onSameDayClick}
        />
      )}

      {/* ══ Booking Summary (shown when all 3 fields filled) ══ */}
      {isFormComplete && (
        <div className={styles.summaryCard} style={{ marginTop: "24px" }}>
          <p className={styles.summaryTitle}>📋 Booking Summary</p>
          <div className={styles.summaryGrid}>
            <span className={styles.summaryLabel}>Doctor</span>
            <span className={styles.summaryValue}>{doctorData?.name}</span>

            <span className={styles.summaryLabel}>Mode</span>
            <span className={styles.summaryValue}>
              {consultationMode === "VIRTUAL" ? "🖥 Virtual" : "🏥 On-Site"}
            </span>

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
                  Fee
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

// VerifyProfileForm.jsx
import React from "react";
import FormHeader from "../../AppointmentComponents/FormHeader.jsx";
import { useCurrentUser } from "../../../../hooks/userCurrentUser";
import styles from "../../../ClientStyle/VerifyProfileForm.module.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTimePH = (time24) => {
  if (!time24) return "—";
  if (time24.includes("AM") || time24.includes("PM")) return time24;
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
};

const getEndTime = (startTime) => {
  if (!startTime) return "—";
  let mins;
  if (startTime.includes("AM") || startTime.includes("PM")) {
    const [time, period] = startTime.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    mins = h * 60 + m;
  } else {
    const [h, m] = startTime.split(":").map(Number);
    mins = h * 60 + m;
  }
  mins += 60;
  const hours = Math.floor(mins / 60) % 24;
  const minutes = mins % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayH = hours % 12 || 12;
  const displayM = String(minutes).padStart(2, "0");
  return `${displayH}:${displayM} ${period}`;
};

const formatPeso = (amt) =>
  amt !== null && amt !== undefined
    ? new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
      }).format(amt)
    : null;

const resolveDateStr = (selectedDate) => {
  if (!selectedDate) return null;
  if (typeof selectedDate === "string") return selectedDate;
  if (selectedDate.date) return selectedDate.date;
  return null;
};

// ─── Schedule Summary Banner ──────────────────────────────────────────────────
const ScheduleSummaryBanner = ({
  consultationMode,
  selectedDate,
  selectedTime,
  consultationFee,
  selectedService,
  doctorData,
}) => {
  const dateStr = resolveDateStr(selectedDate);
  if (!consultationMode || !dateStr || !selectedTime) return null;

  const rows = [
    { label: "Doctor", value: doctorData?.name || "—", icon: "🩺" },
    {
      label: "Mode",
      value: consultationMode === "VIRTUAL" ? "🖥 Virtual" : "On-Site",
      icon: null,
    },
    { label: "Date", value: dateStr, icon: "📅" },
    {
      label: "Time",
      value: `${formatTimePH(selectedTime)} – ${getEndTime(selectedTime)}`,
      icon: "🕐",
    },
    selectedService
      ? { label: "Service", value: selectedService, icon: "📋" }
      : null,
    consultationFee !== null && consultationFee !== undefined
      ? {
          label: "Fee",
          value: formatPeso(consultationFee),
          icon: "💰",
          highlight: true,
        }
      : null,
  ].filter(Boolean);

  return (
    <div
      style={{
        margin: "0 0 24px",
        padding: "16px 18px",
        background: "linear-gradient(135deg, #f5f0fb 0%, #eef6ff 100%)",
        border: "2px solid #4D227C",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(77,34,124,0.10)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "#4D227C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
          }}
        >
          ✓
        </div>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#4D227C",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Your Appointment Summary
        </span>
      </div>

      {/* Rows */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "6px 12px",
          alignItems: "center",
        }}
      >
        {rows.map(({ label, value, highlight }) => (
          <React.Fragment key={label}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#7c3aed",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: highlight ? 700 : 500,
                color: highlight ? "#059669" : "#2d1254",
              }}
            >
              {value}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─── VerifyProfileForm ────────────────────────────────────────────────────────
const VerifyProfileForm = ({
  formData,
  setFormData,
  declarationAgreed,
  onOpenDeclaration,
  // Schedule summary props (from SetAppointmentForm)
  consultationMode,
  selectedDate,
  selectedTime,
  consultationFee,
  selectedService,
  doctorData,
}) => {
  const currentUser = useCurrentUser();

  return (
    <div>
      {/* ── Schedule summary banner at the top of Step 2 ── */}
      <ScheduleSummaryBanner
        consultationMode={consultationMode}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        consultationFee={consultationFee}
        selectedService={selectedService}
        doctorData={doctorData}
      />

      {/* ── Reason for consultation ── */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#2d1254",
            display: "block",
            marginBottom: "8px",
          }}
        >
          <span style={{ color: "#e53e3e" }}>*</span> Reason for Consultation
        </label>
        <textarea
          rows={3}
          placeholder="Briefly describe the reason for your visit…"
          value={formData.reason || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, reason: e.target.value }))
          }
          style={{
            width: "100%",
            padding: "10px 13px",
            borderRadius: "9px",
            border: formData.reason
              ? "1.5px solid #d4b8f0"
              : "1.5px solid #e2d5f5",
            background: formData.reason ? "#faf7ff" : "#fff",
            fontSize: "13px",
            fontFamily: "Poppins, sans-serif",
            color: "#2d1254",
            resize: "vertical",
            outline: "none",
            transition: "border 0.2s",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.border = "1.5px solid #4D227C")}
          onBlur={(e) =>
            (e.target.style.border = formData.reason
              ? "1.5px solid #d4b8f0"
              : "1.5px solid #e2d5f5")
          }
        />
      </div>

      {/* ── FormHeader: isInformant toggle + profile / complainant fields ── */}
      <FormHeader
        isInformant={formData.isInformant}
        onToggle={(val) =>
          setFormData((prev) => ({ ...prev, isInformant: val }))
        }
        user={currentUser}
        patientForm={formData}
        setPatientForm={setFormData}
      />

      {/* ── Declaration acknowledgement — last item on the page ── */}
      <div className={styles.acknowledgementRow}>
        <input
          type="radio"
          checked={declarationAgreed}
          onChange={() => onOpenDeclaration()}
          className={styles.radioInput}
        />
        <span>
          {" "}
          I acknowledge and agree on the{" "}
          <button
            type="button"
            className={styles.policyLink}
            onClick={onOpenDeclaration}
          >
            Declaration of Participation
          </button>
        </span>
      </div>
    </div>
  );
};

export default VerifyProfileForm;

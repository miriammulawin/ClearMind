// AppointmentComponents/PaymentForm.jsx
// FIX: Shows full booking summary (date, time, mode, service, fee) at the top.
// Fee displayed is the resolved consultationFee (service-first, from parent).

import React, { useRef, useState } from "react";

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

// ─── Booking Summary Card ─────────────────────────────────────────────────────
const BookingSummaryCard = ({
  doctorData,
  consultationMode,
  selectedDate,
  selectedTime,
  consultationFee,
  selectedService,
}) => {
  const dateStr = resolveDateStr(selectedDate);

  const summaryRows = [
    { label: "Doctor", value: doctorData?.name || "—" },
    {
      label: "Mode",
      value:
        consultationMode === "VIRTUAL"
          ? "🖥 Virtual Consultation"
          : consultationMode === "ON-SITE"
            ? "🏥 On-Site Consultation"
            : "—",
    },
    { label: "Date", value: dateStr || "—" },
    {
      label: "Time",
      value: selectedTime
        ? `${formatTimePH(selectedTime)} – ${getEndTime(selectedTime)}`
        : "—",
    },
    selectedService ? { label: "Service", value: selectedService } : null,
  ].filter(Boolean);

  return (
    <div
      style={{
        margin: "0 0 24px",
        borderRadius: "16px",
        border: "2px solid #4D227C",
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(77,34,124,0.10)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          background: "#4D227C",
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "16px" }}>📋</span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          Appointment Summary
        </span>
      </div>

      {/* Summary rows */}
      <div
        style={{
          background: "#f5f0fb",
          padding: "14px 18px",
        }}
      >
        {summaryRows.map(({ label, value }) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
              padding: "6px 0",
              borderBottom: "1px solid #e8d8f8",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#7c3aed",
                fontWeight: 600,
                minWidth: "60px",
                flexShrink: 0,
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: "#2d1254",
                fontWeight: 500,
                textAlign: "right",
              }}
            >
              {value}
            </span>
          </div>
        ))}

        {/* Fee row — highlighted */}
        {consultationFee !== null && consultationFee !== undefined && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginTop: "8px",
              padding: "10px 14px",
              background: "#ecfdf5",
              border: "1.5px solid #6ee7b7",
              borderRadius: "10px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#065f46",
              }}
            >
              💰 Consultation Fee
            </span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#059669",
              }}
            >
              {formatPeso(consultationFee)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PaymentModeSelector ──────────────────────────────────────────────────────
const PAYMENT_MODES = [
  { value: "G-Cash", label: "GCash", emoji: "📱" },
  { value: "PayMaya", label: "PayMaya", emoji: "💳" },
  { value: "Bank Transfer", label: "Bank Transfer", emoji: "🏦" },
];

const PaymentModeSelector = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
    {PAYMENT_MODES.map((mode) => {
      const isActive = value === mode.value;
      return (
        <button
          key={mode.value}
          type="button"
          onClick={() => onChange(mode.value)}
          style={{
            flex: "1 1 calc(33% - 10px)",
            minWidth: "90px",
            padding: "12px 10px",
            borderRadius: "12px",
            border: isActive ? "2px solid #4D227C" : "1.5px solid #e2d5f5",
            background: isActive ? "#f5f0fb" : "#fff",
            cursor: "pointer",
            transition: "all .18s",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            fontFamily: "Poppins, sans-serif",
            boxShadow: isActive ? "0 0 0 3px rgba(77,34,124,0.12)" : "none",
            outline: "none",
          }}
        >
          <span style={{ fontSize: "20px" }}>{mode.emoji}</span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "#4D227C" : "#374151",
            }}
          >
            {mode.label}
          </span>
        </button>
      );
    })}
  </div>
);

// ─── PaymentForm (main export) ────────────────────────────────────────────────
const PaymentForm = ({
  doctorData,
  selectedDate,
  selectedTime,
  consultationMode,
  consultationFee, // Already resolved (service-first) from SetAppointmentForm
  selectedService, // Display name string
  profileData,
  paymentData,
  setPaymentData,
  bookingPolicyAgreed,
  onOpenBookingPolicy,
}) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handlePaymentModeChange = (mode) => {
    setPaymentData((prev) => ({ ...prev, paymentMode: mode }));
  };

  const handleReferenceChange = (e) => {
    setPaymentData((prev) => ({ ...prev, referenceNo: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPaymentData((prev) => ({ ...prev, receiptFile: file }));
    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setPaymentData((prev) => ({ ...prev, receiptFile: null }));
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 13px",
    borderRadius: "9px",
    border: "1.5px solid #e2d5f5",
    background: "#fff",
    fontSize: "13px",
    fontFamily: "Poppins, sans-serif",
    color: "#2d1254",
    outline: "none",
    transition: "border 0.2s",
    boxSizing: "border-box",
  };

  const sectionTitleStyle = {
    fontSize: "13px",
    fontWeight: 700,
    color: "#2d1254",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  return (
    <div>
      {/* ── Full booking summary ── */}
      <BookingSummaryCard
        doctorData={doctorData}
        consultationMode={consultationMode}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        consultationFee={consultationFee}
        selectedService={selectedService}
      />

      {/* ── Booking Policy acknowledgement ── */}
      {!bookingPolicyAgreed ? (
        <div
          style={{
            margin: "0 0 18px",
            padding: "14px 16px",
            background: "#fff8f0",
            border: "1.5px solid #fed7aa",
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
                fontSize: "12px",
                fontWeight: 700,
                color: "#9a3412",
                marginBottom: "3px",
              }}
            >
              ⚠ Policy Acknowledgement Required
            </div>
            <div style={{ fontSize: "12px", color: "#9a3412" }}>
              Please read and agree to the Cancellation & Rebooking Policy.
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenBookingPolicy}
            style={{
              padding: "8px 14px",
              background: "#4D227C",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            View Policy
          </button>
        </div>
      ) : (
        <div
          style={{
            margin: "0 0 18px",
            padding: "10px 14px",
            background: "#ecfdf5",
            border: "1.5px solid #6ee7b7",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#065f46",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✅</span> Cancellation & Rebooking Policy acknowledged
        </div>
      )}

      {/* ── Payment Mode ── */}
      <div style={{ marginBottom: "20px" }}>
        <p style={sectionTitleStyle}>
          <span style={{ color: "#e53e3e" }}>*</span> Payment Mode
        </p>
        <PaymentModeSelector
          value={paymentData.paymentMode}
          onChange={handlePaymentModeChange}
        />
      </div>

      {/* ── Reference Number ── */}
      <div style={{ marginBottom: "20px" }}>
        <label style={sectionTitleStyle}>
          <span style={{ color: "#e53e3e" }}>*</span> Reference Number
        </label>
        <input
          type="text"
          style={{
            ...inputStyle,
            border: paymentData.referenceNo
              ? "1.5px solid #d4b8f0"
              : "1.5px solid #e2d5f5",
            background: paymentData.referenceNo ? "#faf7ff" : "#fff",
          }}
          placeholder="Enter your payment reference number"
          value={paymentData.referenceNo || ""}
          onChange={handleReferenceChange}
          onFocus={(e) => (e.target.style.border = "1.5px solid #4D227C")}
          onBlur={(e) =>
            (e.target.style.border = paymentData.referenceNo
              ? "1.5px solid #d4b8f0"
              : "1.5px solid #e2d5f5")
          }
        />
      </div>

      {/* ── Receipt Upload ── */}
      <div style={{ marginBottom: "20px" }}>
        <label style={sectionTitleStyle}>
          <span style={{ color: "#e53e3e" }}>*</span> Upload Receipt
        </label>

        {!paymentData.receiptFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #d4b8f0",
              borderRadius: "12px",
              padding: "28px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: "#faf7ff",
              transition: "border-color .2s, background .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#4D227C";
              e.currentTarget.style.background = "#f5f0fb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#d4b8f0";
              e.currentTarget.style.background = "#faf7ff";
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📎</div>
            <div
              style={{ fontSize: "13px", fontWeight: 600, color: "#4D227C" }}
            >
              Click to upload receipt
            </div>
            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>
              JPG, PNG or PDF · Max 5MB
            </div>
          </div>
        ) : (
          <div
            style={{
              border: "1.5px solid #6ee7b7",
              borderRadius: "12px",
              background: "#ecfdf5",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            {previewUrl &&
            paymentData.receiptFile?.type?.startsWith("image/") ? (
              <img
                src={previewUrl}
                alt="Receipt"
                style={{
                  width: "52px",
                  height: "52px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "8px",
                  background: "#d1fae5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  flexShrink: 0,
                }}
              >
                📄
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#065f46",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {paymentData.receiptFile.name}
              </div>
              <div style={{ fontSize: "11px", color: "#6ee7b7" }}>
                {(paymentData.receiptFile.size / 1024).toFixed(1)} KB
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              style={{
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                color: "#9a3412",
                padding: 0,
                flexShrink: 0,
              }}
              title="Remove"
            >
              ✕
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* ── Payment instructions ── */}
      {paymentData.paymentMode && (
        <div
          style={{
            padding: "14px 16px",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "12px",
            fontSize: "12px",
            color: "#0369a1",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "6px" }}>
            💡 Payment Instructions
          </div>
          {paymentData.paymentMode === "G-Cash" && (
            <div>
              Send payment to <strong>GCash number: 09XX-XXX-XXXX</strong>{" "}
              (Account Name: Clinic Name). Take a screenshot of the confirmation
              and upload it above.
            </div>
          )}
          {paymentData.paymentMode === "PayMaya" && (
            <div>
              Send payment to <strong>PayMaya number: 09XX-XXX-XXXX</strong>{" "}
              (Account Name: Clinic Name). Upload the confirmation screenshot
              above.
            </div>
          )}
          {paymentData.paymentMode === "Bank Transfer" && (
            <div>
              Transfer to <strong>BDO Account: XXXX-XXXX-XXXX</strong> (Account
              Name: Clinic Name). Upload the bank transfer confirmation above.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentForm;

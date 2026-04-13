import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import {
  FiX,
  FiDownload,
  FiFile,
  FiPaperclip,
  FiChevronDown,
  FiRefreshCw,
  FiCalendar,
  FiClock,
  FiUser,
} from "react-icons/fi";
import styles from "../DoctorStyle/DayAppointmentsModal.module.css";
import CompleteAppointmentModal from "./CompleteAppointmentModal";

/* ─────────────────────────────────────────────────────────
   Config
───────────────────────────────────────────────────────── */
const API_BASE = "http://localhost:8000/api";
const getToken = () => localStorage.getItem("token");

/* ─────────────────────────────────────────────────────────
   API fetch helper
───────────────────────────────────────────────────────── */
async function fetchAppointments(date, signal) {
  const dateStr = format(date, "yyyy-MM-dd");
  const res = await fetch(`${API_BASE}/appointments?date=${dateStr}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

/* ─────────────────────────────────────────────────────────
   Map Laravel appointment → display shape
   Handles all field names from your AppointmentController
───────────────────────────────────────────────────────── */
function mapAppointment(raw) {
  // Patient name from nested relation
  const patient = raw.patient || {};
  const patientName =
    [
      patient.firstName,
      patient.middleInitial ? patient.middleInitial + "." : null,
      patient.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    raw.patient_name ||
    "—";

  // Doctor name from nested relation
  const doctor = raw.doctor || {};
  const doctorName = doctor.firstName
    ? [
        doctor.firstName,
        doctor.middleInitial ? doctor.middleInitial + "." : null,
        doctor.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  // Booker name
  const booker = raw.bookedBy || raw.booked_by || {};
  const bookerName = booker.firstName
    ? [booker.firstName, booker.lastName].filter(Boolean).join(" ")
    : null;

  return {
    // IDs
    id: raw.appointment_id,
    appointment_id: raw.appointment_id,

    // Patient
    patientName,
    patientId: raw.patient_id,
    patientDob: patient.dob || null,
    patientSex: patient.sex || null,
    patientContact: patient.contactNo || null,
    patientEmail: patient.email || null,
    patientAddress: patient.address || null,
    patientClassification: patient.patientClassification || null,
    gender: patient.sex || null,

    // Informant
    informantName: raw.informant_name || null,
    informantRelation: raw.informant_relation || null,

    // Schedule — keep raw strings for display
    appointmentDate: raw.appointment_date, // "2025-05-10"
    startTime: raw.start_time, // "09:00"
    endTime: raw.end_time, // "10:00"

    // Build JS Date objects for compatibility with old helper fns
    start: new Date(`${raw.appointment_date}T${raw.start_time}:00`),
    end: new Date(`${raw.appointment_date}T${raw.end_time}:00`),

    // Visit / service
    visitType: raw.visit_type, // "onsite" | "virtual"
    serviceType: raw.service_type || "", // e.g. "Psychological Assessment and Evaluation"
    paePurpose: raw.pae_purpose || null,
    assessmentPurpose: raw.pae_purpose || null,
    reason: raw.reason_for_consultation || null,

    // Payment
    paymentStatus: raw.payment_status, // "paid" | "not_paid" | "probono"
    receiptPaths:
      raw.receipt_paths || (raw.receipt_path ? [raw.receipt_path] : []),

    // Status
    status: raw.status, // "pending" | "confirmed" | "completed" | "cancelled" | "no_show"

    // Doctor / Booker
    doctorName,
    doctorId: raw.doctor_user_id || null,
    bookerName,
    bookedByUserId: raw.booked_by_user_id,

    // Notes
    notes: raw.notes || null,

    // Title (used by some helpers) — construct from visit type
    title:
      raw.visit_type === "virtual"
        ? "Online Consultation"
        : "Physical Consultation",

    // Reference number — generate from real data
    referenceNumber: generateReferenceNumber(raw),
  };
}

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
const toTime12 = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const isPsychAssessment = (s = "") =>
  s.toLowerCase().includes("psychological assessment") ||
  s.toLowerCase().includes("assessment and evaluation");

const isESA = (s = "") =>
  s.toLowerCase().includes("emotional support animal") ||
  s.toLowerCase().includes("esa");

const isInternship = (s = "") => s.toLowerCase().includes("internship");

const getServiceLabel = (appt) => {
  const svc = appt.serviceType || "";
  if (isPsychAssessment(svc) || isESA(svc) || isInternship(svc))
    return "Psychological Assessment and Evaluation";
  return "Psychotherapy and Counseling";
};

function generateReferenceNumber(raw) {
  const date = new Date(raw.appointment_date + "T00:00:00");
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const svc = raw.service_type || "";
  const prefix = isPsychAssessment(svc) ? "PAE" : "PAC";
  const seq = String(
    raw.appointment_id || Math.floor(Math.random() * 9999),
  ).padStart(4, "0");
  return `${prefix}-${yyyy}-${mm}-${dd}-${seq}`;
}

// Color helpers
const COLORS = {
  purple: "#4D227C",
  blue: "#1e6091",
  red: "#dc2626",
  brown: "#8B4545",
  green: "#2d6a4f",
  amber: "#92400e",
  teal: "#0e7490",
  violet: "#5b21b6",
  orange: "#b45309",
  gray: "#6b7280",
};

const getDotColor = (appt) => {
  const svc = appt.serviceType || "";
  if (isESA(svc)) return COLORS.teal;
  if (isInternship(svc)) return COLORS.violet;
  if (isPsychAssessment(svc)) {
    const p = appt.assessmentPurpose || "";
    if (p.toLowerCase().includes("vawc")) return COLORS.red;
    if (
      p.toLowerCase().includes("legal") ||
      p.toLowerCase().includes("adoption")
    )
      return COLORS.brown;
    if (
      p.toLowerCase().includes("school") ||
      p.toLowerCase().includes("academic")
    )
      return COLORS.blue;
    if (
      p.toLowerCase().includes("pre-employment") ||
      p.toLowerCase().includes("pre_employment")
    )
      return COLORS.amber;
    return COLORS.green;
  }
  return appt.visitType === "virtual" ? COLORS.blue : COLORS.purple;
};

const purposeBadgeStyle = (purpose = "") => {
  const p = purpose.toLowerCase();
  if (p.includes("vawc"))
    return {
      background: "#ede9f6",
      color: "#4D227C",
      border: "1px solid #d8ccf0",
    };
  if (p.includes("legal") || p.includes("adoption"))
    return {
      background: "#fce8e8",
      color: "#8B4545",
      border: "1px solid #f5c6c6",
    };
  if (p.includes("school") || p.includes("academic"))
    return {
      background: "#dbeafe",
      color: "#1e6091",
      border: "1px solid #bfdbfe",
    };
  if (p.includes("work"))
    return {
      background: "#dcfce7",
      color: "#2d6a4f",
      border: "1px solid #bbf7d0",
    };
  if (p.includes("pre-employment") || p.includes("pre_employment"))
    return {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fde68a",
    };
  return {
    background: "#f3f4f6",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
  };
};

const serviceBadgeStyle = (svc = "") => {
  if (isESA(svc))
    return {
      background: "#cffafe",
      color: "#0e7490",
      border: "1px solid #a5f3fc",
    };
  if (isInternship(svc))
    return {
      background: "#ede9fe",
      color: "#5b21b6",
      border: "1px solid #ddd6fe",
    };
  if (isPsychAssessment(svc))
    return {
      background: "#ede9f6",
      color: "#4D227C",
      border: "1px solid #d8ccf0",
    };
  return {
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
  };
};

const paymentBadgeStyle = (status = "") => {
  if (status === "paid")
    return {
      background: "#dcfce7",
      color: "#15803d",
      border: "1px solid #bbf7d0",
    };
  if (status === "probono")
    return {
      background: "#dbeafe",
      color: "#1e6091",
      border: "1px solid #bfdbfe",
    };
  return {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fde68a",
  };
};

const paymentLabel = (status = "") => {
  if (status === "paid") return "Paid";
  if (status === "probono") return "Pro Bono";
  return "Not Paid";
};

/* ─────────────────────────────────────────────────────────
   Reusable UI pieces
───────────────────────────────────────────────────────── */
const Badge = ({ style, children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11.5,
      fontWeight: 600,
      fontFamily: "'Poppins', sans-serif",
      ...style,
    }}
  >
    {children}
  </span>
);

const InfoRow = ({ label, value }) => (
  <div className={styles.infoRow}>
    <span className={styles.infoLabel}>{label}:</span>
    <span className={styles.infoValue}>{value}</span>
  </div>
);

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "pending")
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#b45309",
          background: "#fef3c7",
          padding: "2px 10px",
          borderRadius: 20,
          border: "1px solid #fde68a",
        }}
      >
        Pending
      </span>
    );
  if (s === "confirmed")
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#1e6091",
          background: "#dbeafe",
          padding: "2px 10px",
          borderRadius: 20,
          border: "1px solid #bfdbfe",
        }}
      >
        Confirmed
      </span>
    );
  if (s === "completed")
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#15803d",
          background: "#dcfce7",
          padding: "2px 10px",
          borderRadius: 20,
          border: "1px solid #bbf7d0",
        }}
      >
        Completed
      </span>
    );
  if (s === "cancelled" || s === "canceled")
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#dc2626",
          background: "#fce8e8",
          padding: "2px 10px",
          borderRadius: 20,
          border: "1px solid #f5c6c6",
        }}
      >
        Cancelled
      </span>
    );
  if (s === "no_show")
    return (
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#6b7280",
          background: "#f3f4f6",
          padding: "2px 10px",
          borderRadius: 20,
          border: "1px solid #e5e7eb",
        }}
      >
        No Show
      </span>
    );
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: "#4d227c" }}>
      {status || "—"}
    </span>
  );
}

function DrawerAccordion({
  title,
  children,
  defaultOpen = false,
  accentColor = "#4D227C",
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={styles.card}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.accordionHeader}
        style={{
          background: isOpen ? `${accentColor}12` : "#faf7ff",
          borderBottom: isOpen ? `2px solid ${accentColor}` : "none",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: accentColor,
            flex: 1,
          }}
        >
          {title}
        </span>
        <FiChevronDown
          size={18}
          style={{
            color: accentColor,
            transition: "transform 0.3s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </button>
      {isOpen && (
        <div
          className={styles.accordionBodyWrapper}
          style={{ borderTop: `2px solid ${accentColor}` }}
        >
          <div className={styles.accordionBody}>{children}</div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Receipt viewer — shows uploaded receipt files
───────────────────────────────────────────────────────── */
function ReceiptViewer({ paths = [] }) {
  if (!paths || paths.length === 0) return null;
  return (
    <DrawerAccordion
      title="Receipt / Proof of Payment"
      accentColor="#15803d"
      defaultOpen={false}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {paths.map((path, i) => {
          const url = `http://localhost:8000/storage/${path}`;
          const isPdf = path.toLowerCase().endsWith(".pdf");
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                padding: "10px",
                border: "1.5px solid #bbf7d0",
                borderRadius: "10px",
                background: "#f0fdf4",
                textDecoration: "none",
                color: "#15803d",
                fontSize: "11px",
                fontWeight: "600",
                minWidth: "80px",
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#dcfce7")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#f0fdf4")
              }
            >
              <FiFile size={22} />
              <span>{isPdf ? "PDF" : `Image ${i + 1}`}</span>
              <span
                style={{
                  fontSize: "10px",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <FiDownload size={10} /> View
              </span>
            </a>
          );
        })}
      </div>
    </DrawerAccordion>
  );
}

/* ─────────────────────────────────────────────────────────
   Loading skeleton
───────────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "4px 0",
      }}
    >
      {[1, 2].map((i) => (
        <div
          key={i}
          style={{
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #f0eaf8",
          }}
        >
          <div
            style={{
              height: "44px",
              background:
                "linear-gradient(90deg, #f3ecfc 0%, #e8dcf5 50%, #f3ecfc 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
            }}
          />
          <div
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {[80, 60, 70, 50].map((w, j) => (
              <div
                key={j}
                style={{
                  height: "14px",
                  width: `${w}%`,
                  borderRadius: "7px",
                  background:
                    "linear-gradient(90deg, #f3ecfc 0%, #e8dcf5 50%, #f3ecfc 100%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.4s infinite",
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   safeFormatDate — never throws, handles all input shapes:
     "2025-05-10"          API string date
     new Date(...)         JS Date (legacy static events)
     "2025-05-10T09:00"   ISO string
───────────────────────────────────────────────────────── */
function safeFormatDate(value, fmt = "MMMM d, yyyy") {
  if (!value) return "—";
  try {
    // Already a valid Date object
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return "—";
      return format(value, fmt);
    }
    // Plain date string "YYYY-MM-DD" — append time to avoid UTC shift
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return format(new Date(value + "T00:00:00"), fmt);
    }
    // ISO / other string
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return format(d, fmt);
  } catch {
    return "—";
  }
}

/* ─────────────────────────────────────────────────────────
   safeTime12 — converts either "09:00" string or JS Date
───────────────────────────────────────────────────────── */
function safeTime12(value) {
  if (!value) return "—";
  // Already a string like "09:00" or "09:00:00"
  if (typeof value === "string" && /^\d{1,2}:\d{2}/.test(value)) {
    return toTime12(value);
  }
  // JS Date object (legacy static events)
  if (value instanceof Date && !isNaN(value.getTime())) {
    const h = value.getHours();
    const m = String(value.getMinutes()).padStart(2, "0");
    return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
  }
  return "—";
}

/* ─────────────────────────────────────────────────────────
   normalizeAppt — unifies API-mapped and legacy static
   event objects into one consistent shape so DetailView
   never crashes regardless of what gets passed in
───────────────────────────────────────────────────────── */
function normalizeAppt(appt) {
  if (!appt) return appt;

  // Already has API-mapped fields → use as-is
  if (appt.appointmentDate && appt.startTime) return appt;

  // Legacy static event (has appt.start as JS Date, appt.end as JS Date)
  const start =
    appt.start instanceof Date
      ? appt.start
      : appt.start
        ? new Date(appt.start)
        : null;
  const end =
    appt.end instanceof Date ? appt.end : appt.end ? new Date(appt.end) : null;

  const padTime = (d) =>
    d
      ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
      : null;

  return {
    ...appt,
    // Build API-style fields from legacy JS Date fields
    appointmentDate: start
      ? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`
      : appt.appointmentDate || null,
    startTime: appt.startTime || padTime(start),
    endTime: appt.endTime || padTime(end),
    // visit type: legacy uses appt.title containing "online"
    visitType:
      appt.visitType ||
      (appt.title?.toLowerCase().includes("online") ? "virtual" : "onsite"),
    // service: legacy may use appt.serviceType or appt.visitType
    serviceType: appt.serviceType || "",
    // patient name
    patientName:
      appt.patientName || appt.patient?.firstName
        ? [appt.patient?.firstName, appt.patient?.lastName]
            .filter(Boolean)
            .join(" ")
        : appt.patientName || "—",
    // status fallback
    status: appt.status || "pending",
    // payment
    paymentStatus: appt.paymentStatus || appt.payment_status || "not_paid",
    // purpose
    assessmentPurpose:
      appt.assessmentPurpose || appt.pae_purpose || appt.paePurpose || null,
    // notes
    reason: appt.reason || appt.reason_for_consultation || null,
    // receipts
    receiptPaths: appt.receiptPaths || appt.receipt_paths || [],
    // IDs
    appointment_id: appt.appointment_id || appt.id,
  };
}

/* ─────────────────────────────────────────────────────────
   Detail View — full appointment info
───────────────────────────────────────────────────────── */
function DetailView({ appt: rawAppt, onClose, onBack, onRefresh }) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Normalize so both legacy static events and API-mapped objects work
  const appt = normalizeAppt(rawAppt);

  const svc = appt.serviceType || "";
  const isAssessment = isPsychAssessment(svc);
  const purpose = appt.assessmentPurpose || "";
  const dotColor = getDotColor(appt);
  const serviceLabel = getServiceLabel(appt);
  const visitLabel =
    appt.visitType === "virtual"
      ? "Virtual Consultation"
      : "Onsite Consultation";

  // Safe display values — never throw
  const dateBadge = safeFormatDate(appt.appointmentDate, "MMM d, yyyy");
  const dateFull = safeFormatDate(appt.appointmentDate, "MMMM d, yyyy");
  const timeDisplay = `${safeTime12(appt.startTime)} – ${safeTime12(appt.endTime)}`;

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>
              <span
                className={styles.clinicDot}
                style={{ backgroundColor: dotColor }}
              />
              Appointment Details
            </h3>
            <div className={styles.modalHeaderRight}>
              <span className={styles.dateBadge}>{dateBadge}</span>
              {onBack && (
                <button
                  onClick={onBack}
                  style={{
                    background: "none",
                    border: "1px solid #e2d5f5",
                    borderRadius: "7px",
                    cursor: "pointer",
                    color: "#4D227C",
                    fontSize: "12px",
                    padding: "4px 10px",
                    fontWeight: "600",
                  }}
                >
                  ← Back
                </button>
              )}
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className={styles.scrollBody}>
            {/* ── Main info card ── */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardHeaderLeft}>
                  <span
                    className={styles.clinicDot}
                    style={{ backgroundColor: dotColor }}
                  />
                  Appointment Information
                </span>
                <span className={styles.referenceNumber}>
                  {appt.referenceNumber || "—"}
                </span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardFields}>
                  <InfoRow
                    label="Patient Name"
                    value={appt.patientName || "—"}
                  />

                  {appt.patientDob && (
                    <InfoRow label="Date of Birth" value={appt.patientDob} />
                  )}
                  {appt.patientSex && (
                    <InfoRow
                      label="Sex"
                      value={
                        appt.patientSex.charAt(0).toUpperCase() +
                        appt.patientSex.slice(1)
                      }
                    />
                  )}
                  {appt.patientContact && (
                    <InfoRow label="Contact No." value={appt.patientContact} />
                  )}
                  {appt.patientEmail && (
                    <InfoRow label="Email" value={appt.patientEmail} />
                  )}
                  {appt.patientClassification && (
                    <InfoRow
                      label="Classification"
                      value={appt.patientClassification}
                    />
                  )}

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Appointment Date:</span>
                    <span
                      className={styles.infoValue}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FiCalendar size={13} style={{ color: "#9c7dd4" }} />
                      {dateFull}
                    </span>
                  </div>

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Time:</span>
                    <span
                      className={styles.infoValue}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FiClock size={13} style={{ color: "#9c7dd4" }} />
                      {timeDisplay}
                    </span>
                  </div>

                  <InfoRow label="Visit Type" value={visitLabel} />

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Service:</span>
                    <Badge style={serviceBadgeStyle(svc)}>{serviceLabel}</Badge>
                  </div>

                  {isAssessment && purpose && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Purpose:</span>
                      <Badge style={purposeBadgeStyle(purpose)}>
                        {purpose}
                      </Badge>
                    </div>
                  )}

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Payment:</span>
                    <Badge style={paymentBadgeStyle(appt.paymentStatus)}>
                      {paymentLabel(appt.paymentStatus)}
                    </Badge>
                  </div>

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Status:</span>
                    <StatusBadge status={appt.status} />
                  </div>

                  {appt.reason && (
                    <div>
                      <div className={styles.complaintLabel}>
                        Reason for Consultation:
                      </div>
                      <div className={styles.complaintBox}>{appt.reason}</div>
                    </div>
                  )}

                  {appt.doctorName && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Assigned Doctor:</span>
                      <span
                        className={styles.infoValue}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <FiUser size={13} style={{ color: "#9c7dd4" }} />
                        {appt.doctorName}
                      </span>
                    </div>
                  )}

                  {appt.informantName && (
                    <>
                      <InfoRow label="Informant" value={appt.informantName} />
                      {appt.informantRelation && (
                        <InfoRow
                          label="Relation"
                          value={appt.informantRelation}
                        />
                      )}
                    </>
                  )}

                  {appt.notes && (
                    <div>
                      <div className={styles.complaintLabel}>
                        Clinical Notes:
                      </div>
                      <div className={styles.complaintBox}>{appt.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              {appt.status !== "completed" && appt.status !== "cancelled" && (
                <div className={styles.cardFooter}>
                  <button
                    className={styles.btnGreen}
                    onClick={() => setShowCompleteModal(true)}
                  >
                    Add Clinical Notes
                  </button>
                </div>
              )}
            </section>

            {/* ── Receipts ── */}
            <ReceiptViewer paths={appt.receiptPaths} />
          </div>
        </div>
      </div>

      <CompleteAppointmentModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        appt={appt}
        onConfirm={() => {
          setShowCompleteModal(false);
          if (onRefresh) onRefresh();
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Appointment Card — used in list view
───────────────────────────────────────────────────────── */
function AppointmentCard({ appt, onView }) {
  const svc = appt.serviceType || "";
  const dotColor = getDotColor(appt);
  const serviceLabel = getServiceLabel(appt);
  const purpose = appt.assessmentPurpose || "";
  const visitLabel = appt.visitType === "virtual" ? "Virtual" : "Onsite";

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <span className={styles.cardHeaderLeft}>
          <span
            className={styles.clinicDot}
            style={{ backgroundColor: dotColor }}
          />
          {toTime12(appt.startTime)} — {visitLabel} Consultation
        </span>
        <span className={styles.badgeGroup}>
          {purpose && (
            <Badge
              style={{
                ...purposeBadgeStyle(purpose),
                fontSize: 11,
                padding: "2px 9px",
              }}
            >
              {purpose}
            </Badge>
          )}
          <span className={styles.referenceNumber}>{appt.referenceNumber}</span>
        </span>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <div className={styles.cardFields}>
          <InfoRow label="Patient" value={appt.patientName} />

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Time:</span>
            <span className={styles.infoValue}>
              {toTime12(appt.startTime)} – {toTime12(appt.endTime)}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Service:</span>
            <Badge style={{ ...serviceBadgeStyle(svc), fontSize: 11 }}>
              {serviceLabel}
            </Badge>
          </div>

          {appt.reason && <InfoRow label="Reason" value={appt.reason} />}

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Payment:</span>
            <Badge
              style={{ ...paymentBadgeStyle(appt.paymentStatus), fontSize: 11 }}
            >
              {paymentLabel(appt.paymentStatus)}
            </Badge>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Status:</span>
            <StatusBadge status={appt.status} />
          </div>

          {appt.doctorName && (
            <InfoRow label="Doctor" value={appt.doctorName} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <button className={styles.btnPurple} onClick={() => onView(appt)}>
          View Details
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
function DayAppointmentsModal({ isOpen, onClose, selectedDate }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeAppt, setActiveAppt] = useState(null);

  const loadAppointments = useCallback(async (date, signal) => {
    if (!date) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchAppointments(date, signal);
      setAppointments(raw.map(mapAppointment));
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message || "Failed to load appointments.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !selectedDate) return;
    // Reset to list view whenever date changes
    setActiveAppt(null);
    const ctrl = new AbortController();
    loadAppointments(new Date(selectedDate), ctrl.signal);
    return () => ctrl.abort();
  }, [isOpen, selectedDate, loadAppointments]);

  if (!isOpen || !selectedDate) return null;

  const dateObj = new Date(selectedDate);
  const formattedDate = format(dateObj, "MMMM d, yyyy");
  const dayName = format(dateObj, "EEEE");

  const handleRefresh = () => {
    loadAppointments(dateObj);
  };

  // ── Detail view ──
  if (activeAppt) {
    return (
      <DetailView
        appt={activeAppt}
        onClose={onClose}
        onBack={() => setActiveAppt(null)}
        onRefresh={() => {
          setActiveAppt(null);
          handleRefresh();
        }}
      />
    );
  }

  // ── List view ──
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{dayName}'s Appointments</h3>
          <div className={styles.modalHeaderRight}>
            <span className={styles.dateBadge}>{formattedDate}</span>
            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh"
              style={{
                background: "none",
                border: "1px solid #e2d5f5",
                borderRadius: "7px",
                cursor: "pointer",
                color: "#4D227C",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                opacity: loading ? 0.5 : 1,
              }}
            >
              <FiRefreshCw
                size={14}
                style={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />
            </button>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className={styles.scrollBody}>
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "14px",
                  margin: "0 0 16px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {error}
              </p>
              <button
                onClick={handleRefresh}
                style={{
                  background: "#4D227C",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 20px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FiRefreshCw size={13} /> Try Again
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#9ca3af",
                fontSize: 14,
                padding: "48px 0",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>
                📅
              </div>
              <p style={{ margin: 0 }}>
                No appointments scheduled for this day.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: "12px",
                  color: "#9c7dd4",
                  fontWeight: "600",
                  marginBottom: "12px",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {appointments.length} appointment
                {appointments.length !== 1 ? "s" : ""} on {formattedDate}
              </div>
              {appointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  onView={setActiveAppt}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default DayAppointmentsModal;

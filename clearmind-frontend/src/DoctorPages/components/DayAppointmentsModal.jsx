import { useState, useCallback } from "react";
import { format } from "date-fns";
import {
  FiX,
  FiDownload,
  FiFile,
  FiPaperclip,
  FiChevronDown,
} from "react-icons/fi";
import { EVENT_COLORS } from "../data/appointmentsData";
import styles from "../DoctorStyle/DayAppointmentsModal.module.css";
import CompleteAppointmentModal from "./CompleteAppointmentModal";

// ── Helpers ────────────────────────────────────────────────────────────────
const toTime24 = (date) => {
  if (!date) return "00:00";
  const d = date instanceof Date ? date : new Date(date);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const toTime12 = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const isSameDay = (d1, d2) => {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

// ── Service type detectors ─────────────────────────────────────────────────
const isPsychAssessment = (serviceType) =>
  serviceType?.toLowerCase().includes("psychological assessment") ||
  serviceType?.toLowerCase().includes("assessment and evaluation");

const isESA = (serviceType) =>
  serviceType?.toLowerCase().includes("emotional support animal") ||
  serviceType?.toLowerCase().includes("esa");

const isInternship = (serviceType) =>
  serviceType?.toLowerCase().includes("internship");

// ── PA Purposes ────────────────────────────────────────────────────────────
const PURPOSES = {
  VAWC: "VAWC",
  LEGAL: "Adoption or Legal",
  SCHOOL: "School / Academic Support",
  WORK: "Work-Related",
  PRE_EMPLOYMENT: "Pre-Employment",
};

const getPurpose = (appt) => appt?.assessmentPurpose || null;

const isFemalePatient = (appt) =>
  appt?.gender?.toLowerCase() === "female" ||
  appt?.gender?.toLowerCase() === "f";

// ── Inline badge styles ────────────────────────────────────────────────────
const purposeInlineStyle = (purpose) => {
  switch (purpose) {
    case PURPOSES.VAWC:
      return {
        background: "#ede9f6",
        color: "#4D227C",
        border: "1px solid #d8ccf0",
      };
    case PURPOSES.LEGAL:
      return {
        background: "#fce8e8",
        color: "#8B4545",
        border: "1px solid #f5c6c6",
      };
    case PURPOSES.SCHOOL:
      return {
        background: "#dbeafe",
        color: "#1e6091",
        border: "1px solid #bfdbfe",
      };
    case PURPOSES.WORK:
      return {
        background: "#dcfce7",
        color: "#2d6a4f",
        border: "1px solid #bbf7d0",
      };
    case PURPOSES.PRE_EMPLOYMENT:
      return {
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
      };
    default:
      return {
        background: "#f3f4f6",
        color: "#6b7280",
        border: "1px solid #e5e7eb",
      };
  }
};

const serviceTypeInlineStyle = (serviceType) => {
  if (isESA(serviceType))
    return {
      background: "#cffafe",
      color: "#0e7490",
      border: "1px solid #a5f3fc",
    };
  if (isInternship(serviceType))
    return {
      background: "#ede9fe",
      color: "#5b21b6",
      border: "1px solid #ddd6fe",
    };
  if (isPsychAssessment(serviceType))
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

const getDotColor = (appt) => {
  const svc = appt.serviceType || "";
  if (isESA(svc)) return EVENT_COLORS.esa ?? "#0e7490";
  if (isInternship(svc)) return EVENT_COLORS.internship ?? "#6d28d9";
  if (isPsychAssessment(svc)) {
    const p = getPurpose(appt);
    if (p === PURPOSES.VAWC) return EVENT_COLORS.vawc;
    if (p === PURPOSES.LEGAL) return EVENT_COLORS.legal;
    if (p === PURPOSES.SCHOOL) return EVENT_COLORS.school;
    if (p === PURPOSES.PRE_EMPLOYMENT)
      return EVENT_COLORS.preEmployment ?? "#b45309";
    return EVENT_COLORS.work;
  }
  return EVENT_COLORS.online;
};

// ── StatusBadge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "scheduled" || s === "confirmed")
    return <span className={styles.statusScheduled}>{status}</span>;
  if (s === "cancelled" || s === "canceled")
    return <span className={styles.statusCancelled}>{status}</span>;
  if (s === "completed" || s === "complete")
    return <span className={styles.statusCompleted}>{status}</span>;
  if (s === "rescheduled")
    return <span className={styles.statusRescheduled}>{status}</span>;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "#4d227c",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {status || "—"}
    </span>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────
const ModalHeader = ({ title, dateLabel, onClose }) => (
  <div className={styles.modalHeader}>
    <h3 className={styles.modalTitle}>{title}</h3>
    <div className={styles.modalHeaderRight}>
      <span className={styles.dateBadge}>{dateLabel}</span>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        <FiX />
      </button>
    </div>
  </div>
);

const InfoRow = ({ label, value, minWidth }) => (
  <div className={styles.infoRow}>
    <span className={styles.infoLabel} style={minWidth ? { minWidth } : {}}>
      {label}:
    </span>
    <span className={styles.infoValue}>{value}</span>
  </div>
);

const Badge = ({ style, children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 12px",
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

// ── react-pdf setup ────────────────────────────────────────────────────────
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// ── PDF Viewer Modal ───────────────────────────────────────────────────────
function PdfViewerModal({ label, filename, onClose }) {
  const src = `/forms/${filename}`;
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  return (
    <div className={styles.pdfViewerOverlay} onClick={onClose}>
      <div
        className={styles.pdfViewerModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.pdfViewerHeader}>
          <span className={styles.pdfViewerTitle}>
            <FiFile size={15} /> {label}
          </span>
          <div className={styles.pdfViewerActions}>
            <a
              href={src}
              download={filename}
              className={styles.pdfViewerDownload}
            >
              <FiDownload size={14} /> Download
            </a>
            <button
              className={styles.pdfViewerClose}
              onClick={onClose}
              aria-label="Close PDF"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        <div className={styles.pdfViewerContent}>
          <Document
            file={src}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              setPageNumber(1);
            }}
            loading={<div className={styles.pdfLoading}>Loading PDF…</div>}
            error={<div className={styles.pdfError}>Failed to load PDF.</div>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>

        <div className={styles.pdfToolbar}>
          <div className={styles.pdfPagination}>
            <button
              className={styles.pdfNavBtn}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            <span className={styles.pdfPageInfo}>
              {numPages ? `${pageNumber} / ${numPages}` : "—"}
            </span>
            <button
              className={styles.pdfNavBtn}
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={!numPages || pageNumber >= numPages}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
          <div className={styles.pdfZoom}>
            <button
              className={styles.pdfNavBtn}
              onClick={() =>
                setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(1)))
              }
              aria-label="Zoom out"
            >
              −
            </button>
            <span className={styles.pdfPageInfo}>
              {Math.round(scale * 100)}%
            </span>
            <button
              className={styles.pdfNavBtn}
              onClick={() =>
                setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(1)))
              }
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PDF File Chip ──────────────────────────────────────────────────────────
function PdfFileChip({ label, filename }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={styles.pdfChip}
        onClick={() => setOpen(true)}
        aria-label={`View ${label} PDF`}
      >
        <FiFile size={13} className={styles.pdfChipIcon} />
        <span className={styles.pdfChipLabel}>{label}.pdf</span>
      </button>
      {open && (
        <PdfViewerModal
          label={label}
          filename={filename}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ── Complaint Box ──────────────────────────────────────────────────────────
const ComplaintBox = ({ text }) => (
  <div>
    <div className={styles.complaintLabel}>Initial Complaint:</div>
    <div className={styles.complaintBox}>
      {text || (
        <span className={styles.complaintEmpty}>
          No initial complaint recorded.
        </span>
      )}
    </div>
  </div>
);

// ── DRAWER ACCORDION ──────────────────────────────────────────────────────
function DrawerAccordion({
  title,
  icon,
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
          {icon}
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

// ── Purpose / service-specific sections ───────────────────────────────────
const VawcSection = ({ appt }) => (
  <DrawerAccordion
    title="VAWC — Initial Complaint & Details"
    icon={<span className={styles.vawcDot} />}
    accentColor="#dc2626"
    defaultOpen={false}
  >
    <ComplaintBox text={appt.initialComplaint} />
    <div
      style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}
    >
      <InfoRow label="Incident Date" value="March 8, 2026" />
      <InfoRow label="Location" value="Quezon City, Metro Manila" />
      <InfoRow label="Number of Incidents" value="Multiple (8+ months)" />
      <InfoRow
        label="Types of Abuse"
        value="Physical, Emotional, Threatening"
      />
      <InfoRow label="Has Children Involved" value="Yes (2 children)" />
    </div>
    <div className={styles.docsSection} style={{ marginTop: 12 }}>
      <div className={styles.docsSectionLabel}>Supporting Documents:</div>
      <div className={styles.docsChipRow}>
        <PdfFileChip
          label="Barangay Blotter"
          filename="VAWC_Barangay_Blotter.pdf"
        />
        <PdfFileChip label="Police Report" filename="VAWC_Police_Report.pdf" />
        <PdfFileChip label="Incident Photos" filename="VAWC_Photos.pdf" />
      </div>
    </div>
    <div
      style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#4d227c",
          fontSize: 11,
          marginBottom: 8,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Previous Assessments:
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#666",
          lineHeight: 1.7,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div>
          • January 15, 2026: Initial psychological assessment - Suspected PTSD
          and anxiety
        </div>
        <div>
          • February 20, 2026: Follow-up session - Progress noted with therapy
        </div>
        <div>• March 1, 2026: Pre-assessment for legal proceedings</div>
      </div>
    </div>
  </DrawerAccordion>
);

const LegalSection = ({ appt }) => (
  <DrawerAccordion
    title="Adoption / Legal — Court-Related Assessment"
    accentColor="#8B4545"
    defaultOpen={false}
  >
    <ComplaintBox text={appt.initialComplaint} />
    <div className={styles.docsSection} style={{ marginTop: 12 }}>
      <div className={styles.docsSectionLabel}>Court Documents:</div>
      <div className={styles.docsChipRow}>
        <PdfFileChip label="Court Order" filename="Court_Order.pdf" />
        <PdfFileChip
          label="PACO Referral"
          filename="PACO_CSWD_Referral_Document.pdf"
        />
        <PdfFileChip
          label="Previous Assessment"
          filename="Previous_Psych_Report.pdf"
        />
        <PdfFileChip label="Case Summary" filename="Case_Summary.pdf" />
      </div>
    </div>
  </DrawerAccordion>
);

const SchoolSection = ({ appt }) => {
  const docs = appt.schoolDocuments || [];
  if (docs.length === 0) return null;
  return (
    <DrawerAccordion
      title="School / Academic — Learning Assessment"
      accentColor="#1e6091"
      defaultOpen={false}
    >
      <div className={styles.docsSection}>
        <div className={styles.docsSectionLabel}>Academic Documents:</div>
        <div className={styles.docsChipRow}>
          {docs.map((doc, i) => (
            <PdfFileChip key={i} label={doc.label} filename={doc.filename} />
          ))}
        </div>
        {docs.map((doc, i) => (
          <div key={i}>
            {/* Per-file metadata row */}
            <div
              className={styles.uploadedFileMeta}
              style={{ marginBottom: 6 }}
            >
              <span className={styles.uploadedFileMetaItem}>
                <span className={styles.uploadedFileMetaLabel}>
                  Uploaded by:
                </span>
                {doc.uploadedBy}
              </span>
              <span className={styles.uploadedFileMetaItem}>
                <span className={styles.uploadedFileMetaLabel}>Date:</span>
                {format(new Date(doc.uploadedAt), "MMMM dd, yyyy")}
              </span>
            </div>
            <div className={styles.docsChipRow}>
              <PdfFileChip label={doc.label} filename={doc.filename} />
            </div>
          </div>
        ))}
      </div>
    </DrawerAccordion>
  );
};

const WorkSection = ({ appt }) => (
  <DrawerAccordion
    title="Work-Related — Occupational Health Assessment"
    accentColor="#2d6a4f"
    defaultOpen={false}
  >
    <div>
      <div className={styles.complaintLabel}>
        Reason for Appointment / Assessment:
      </div>
      <div className={styles.complaintBox}>
        {appt.reason || (
          <span className={styles.complaintEmpty}>No reason provided.</span>
        )}
      </div>
    </div>
  </DrawerAccordion>
);

const PreEmploymentSection = ({ appt }) => (
  <DrawerAccordion
    title="Pre-Employment Psychological Assessment"
    accentColor="#92400e"
    defaultOpen={false}
  >
    <InfoRow label="Company" value="BDO Unibank Inc." />
    <InfoRow label="Position Applied" value="Branch Manager (Retail Banking)" />
    <InfoRow label="Salary Grade" value="Grade 17 - Management Level" />
    <InfoRow
      label="Assessment Type"
      value="Comprehensive Pre-Employment Evaluation"
    />
    <InfoRow
      label="Tests Included"
      value="IQ, Personality, Clinical Screening"
    />
    <div
      style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#4d227c",
          fontSize: 11,
          marginBottom: 4,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Assessment Results Status:
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#666",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Pending final evaluation and report compilation
      </div>
    </div>
  </DrawerAccordion>
);

const ESASection = ({ appt }) => {
  const isInternational = appt.placeOfTravel === "International";
  const hasDocs = appt.diagnosisDocuments?.length > 0;
  return (
    <DrawerAccordion
      title="Emotional Support Animal (ESA) Assessment"
      accentColor="#0e7490"
      defaultOpen={false}
    >
      <InfoRow
        label="Place of Travel"
        value={
          <Badge
            style={
              isInternational
                ? {
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    border: "1px solid #bfdbfe",
                  }
                : {
                    background: "#dcfce7",
                    color: "#15803d",
                    border: "1px solid #bbf7d0",
                  }
            }
          >
            {isInternational ? "🌏" : "🏠"} {appt.placeOfTravel}
          </Badge>
        }
      />
      {appt.travelDestination && (
        <InfoRow label="Destination" value={appt.travelDestination} />
      )}
      <InfoRow
        label="Duration of Travel"
        value="3 months (June - August 2026)"
      />
      <InfoRow label="Type of Animal" value="Golden Retriever (Service Dog)" />
      <InfoRow
        label="Existing Clinical Diagnosis"
        value={
          <Badge
            style={
              appt.hasExistingDiagnosis
                ? {
                    background: "#fef9c3",
                    color: "#854d0e",
                    border: "1px solid #fde68a",
                  }
                : {
                    background: "#f3f4f6",
                    color: "#6b7280",
                    border: "1px solid #e5e7eb",
                  }
            }
          >
            {appt.hasExistingDiagnosis ? "Yes" : "None"}
          </Badge>
        }
      />
      {appt.hasExistingDiagnosis && appt.existingDiagnosisNote && (
        <div style={{ marginTop: 8 }}>
          <div className={styles.complaintLabel}>Diagnosis Notes:</div>
          <div className={styles.complaintBox}>
            {appt.existingDiagnosisNote}
          </div>
        </div>
      )}
      {appt.hasExistingDiagnosis && hasDocs && (
        <div className={styles.docsSection} style={{ marginTop: 12 }}>
          <div className={styles.docsSectionLabel}>
            <FiPaperclip size={12} style={{ marginRight: 5 }} />
            Medical Records &amp; Letters:
          </div>
          <div className={styles.docsChipRow}>
            {appt.diagnosisDocuments.map((doc, i) => (
              <PdfFileChip key={i} label={doc.label} filename={doc.filename} />
            ))}
          </div>
        </div>
      )}
    </DrawerAccordion>
  );
};

const InternshipSection = ({ appt }) => (
  <DrawerAccordion
    title="Mental Health for Internship"
    accentColor="#5b21b6"
    defaultOpen={false}
  >
    <InfoRow
      label="School / University"
      value={appt.schoolName || "Not specified"}
    />
    <InfoRow label="Program / Course" value={appt.program || "Not specified"} />
    {appt.internshipStartDate && (
      <InfoRow label="Internship Start Date" value={appt.internshipStartDate} />
    )}
    <InfoRow label="Internship Company" value="GCash - Fintech Division" />
    <InfoRow label="Duration" value="6 months (June - November 2026)" />
    <InfoRow label="Required By" value="Department of Computer Science" />
  </DrawerAccordion>
);

const SESSION_TYPE_COLORS = {
  "Discussion of Psychological Assessment Results": {
    bg: "#e0f2fe",
    color: "#0369a1",
  },
  "Release of Certificate": { bg: "#dcfce7", color: "#15803d" },
};

const AssessmentSessionSection = ({ appt }) => {
  const session = appt.assessmentSession;
  if (!session) return null;
  const isCertRelease = session.sessionType === "Release of Certificate";
  const badgeStyle = SESSION_TYPE_COLORS[session.sessionType] || {
    bg: "#f3f4f6",
    color: "#374151",
  };
  const releaseDate = format(new Date(appt.start), "MMMM dd, yyyy");
  return (
    <DrawerAccordion
      title={session.sessionType}
      accentColor={badgeStyle.color}
      defaultOpen={false}
    >
      <InfoRow label="Session Type" value={session.sessionType} />
      <InfoRow label="Expected Duration" value="60-90 minutes" />
      <InfoRow label="Location" value="Office Room 305, Makati Branch" />
      {isCertRelease && (
        <>
          <InfoRow label="Release Date" value={releaseDate} />
          <div className={styles.certReminderBox}>
            <span className={styles.certReminderIcon}>⚠️</span>
            <span className={styles.certReminderText}>
              The certificate must be claimed <strong>in person</strong> at the
              clinic. Please bring a valid government-issued ID upon release.
            </span>
          </div>
        </>
      )}
    </DrawerAccordion>
  );
};

const RescheduleSection = ({ appt }) => (
  <DrawerAccordion
    title="Reschedule Status"
    accentColor="#b45309"
    defaultOpen={false}
  >
    <InfoRow
      label="Original Date"
      value="March 5, 2026 | 10:00 AM - 11:00 AM"
    />
    <InfoRow
      label="New Date"
      value={format(new Date(appt.rescheduledTo.date), "MMMM dd, yyyy")}
    />
    <InfoRow
      label="New Time"
      value={`${toTime12(appt.rescheduledTo.startTime)} – ${toTime12(appt.rescheduledTo.endTime)}`}
    />
    <InfoRow
      label="Reason for Reschedule"
      value={appt.rescheduledTo.reason || "Not specified"}
    />
    <InfoRow label="Rescheduled By" value="Patient Request" />
    <InfoRow label="Confirmation Email Sent" value="March 4, 2026 at 3:45 PM" />
  </DrawerAccordion>
);

// ── Helper to get service label ────────────────────────────────────────────
const getServiceLabel = (appt) => {
  const serviceType = appt.serviceType || appt.visitType || "";
  if (isPsychAssessment(serviceType))
    return "Psychological Assessment and Evaluation";
  if (isESA(serviceType)) return "Emotional Support Animal (ESA)";
  if (isInternship(serviceType)) return "Mental Health for Internship";
  return "Counseling / Therapy";
};

// ══════════════════════════════════════════════════════════════════════════
// DETAIL VIEW
// ══════════════════════════════════════════════════════════════════════════
function DetailView({ appt, isGhost, onClose, allEvents = [] }) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const startTime = toTime12(toTime24(appt.start));
  const endTime = toTime12(toTime24(appt.end));
  const isOnline = appt.title?.toLowerCase().includes("online");
  const clinicType = isOnline ? "Online Clinic" : "Physical Clinic";

  const isRescheduled = appt.status === "Rescheduled" || isGhost;
  const displayDate = format(new Date(appt.start), "MMMM dd, yyyy");

  const serviceType = appt.serviceType || appt.visitType || "";
  const isAssessment = isPsychAssessment(serviceType);
  const isEsa = isESA(serviceType);
  const isIntern = isInternship(serviceType);
  const purpose = isAssessment ? getPurpose(appt) : null;

  const clinicColor = getDotColor(appt);
  const showVawc =
    isAssessment && purpose === PURPOSES.VAWC && isFemalePatient(appt);

  // Service label
  const serviceLabel = getServiceLabel(appt);

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>
              <span
                className={styles.clinicDot}
                style={{ backgroundColor: clinicColor }}
              />
              {isGhost ? "↪ " : ""}
              {startTime} — {clinicType}
              {isGhost && (
                <span className={styles.rescheduledBadge}>Rescheduled</span>
              )}
            </h3>
            <div className={styles.modalHeaderRight}>
              <span className={styles.dateBadge}>{displayDate}</span>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* Scrollable body — purple bg like CreateAppointmentModal */}
          <div className={styles.scrollBody}>
            {/* Appointment Info card */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                {isGhost
                  ? "Rescheduled Appointment Information"
                  : "Appointment Information"}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardFields}>
                  <InfoRow
                    label="Patient Name"
                    value={appt.patientName || "—"}
                  />

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Payment Status:</span>
                    <span className={styles.paymentPaid}>Paid</span>
                  </div>

                  <InfoRow label="Visit Type" value={appt.visitType || "—"} />

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Type of Service:</span>
                    <Badge style={serviceTypeInlineStyle(serviceType)}>
                      {serviceLabel}
                    </Badge>
                  </div>

                  {isAssessment && purpose && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Purpose:</span>
                      <Badge style={purposeInlineStyle(purpose)}>
                        {purpose}
                      </Badge>
                    </div>
                  )}

                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Status:</span>
                    <StatusBadge
                      status={isGhost ? "Rescheduled" : appt.status}
                    />
                  </div>

                  <InfoRow
                    label="Reason for Consultation"
                    value={appt.reason || "Not specified"}
                  />
                  <InfoRow
                    label="Appointment Date & Time"
                    value={`${displayDate} | ${startTime} – ${endTime}`}
                  />

                  {isGhost && appt.rescheduledTo?.reason && (
                    <InfoRow
                      label="Reason for Reschedule"
                      value={appt.rescheduledTo.reason}
                    />
                  )}
                </div>
              </div>

              {!isRescheduled && (
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

            {/* Drawer Accordions */}
            {showVawc && <VawcSection appt={appt} />}
            {isAssessment && purpose === PURPOSES.LEGAL && (
              <LegalSection appt={appt} />
            )}
            {isAssessment && purpose === PURPOSES.SCHOOL && (
              <SchoolSection appt={appt} />
            )}
            {isAssessment && purpose === PURPOSES.WORK && (
              <WorkSection appt={appt} />
            )}
            {isAssessment && purpose === PURPOSES.PRE_EMPLOYMENT && (
              <PreEmploymentSection appt={appt} />
            )}
            {isEsa && <ESASection appt={appt} />}
            {isIntern && <InternshipSection appt={appt} />}
            {isAssessment && appt.assessmentSession && (
              <AssessmentSessionSection appt={appt} allEvents={allEvents} />
            )}
            {!isGhost && isRescheduled && appt.rescheduledTo && (
              <RescheduleSection appt={appt} />
            )}
          </div>
        </div>
      </div>

      <CompleteAppointmentModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        appt={appt}
        onConfirm={() => setShowCompleteModal(false)}
      />
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
function DayAppointmentsModal({
  isOpen,
  onClose,
  selectedDate,
  events,
  singleEventId = null,
}) {
  const [activeAppt, setActiveAppt] = useState(null);

  if (!isOpen || !selectedDate) return null;

  const selectedDateObj = new Date(selectedDate);
  const formattedDate = format(selectedDateObj, "MMMM dd, yyyy");
  const dayAppointments = events.filter((e) =>
    isSameDay(e.start, selectedDateObj),
  );

  // Week/Day view → jump straight to detail
  if (singleEventId && !activeAppt) {
    const target = events.find((e) => e.id === singleEventId);
    if (target)
      return (
        <DetailView
          appt={target}
          isGhost={!!target.isRescheduledGhost}
          onClose={onClose}
          allEvents={events}
        />
      );
  }

  // Detail view
  if (activeAppt) {
    return (
      <DetailView
        appt={activeAppt.appt}
        isGhost={activeAppt.isGhost}
        onClose={() => setActiveAppt(null)}
        allEvents={events}
      />
    );
  }

  // List view
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Appointments</h3>
          <div className={styles.modalHeaderRight}>
            <span className={styles.dateBadge}>{formattedDate}</span>
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className={styles.scrollBody}>
          {dayAppointments.length === 0 ? (
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
            dayAppointments.map((appt) => {
              const isGhost = !!appt.isRescheduledGhost;
              const startTime = toTime12(toTime24(appt.start));
              const endTime = toTime12(toTime24(appt.end));
              const isOnline = appt.title?.toLowerCase().includes("online");
              const clinicType = isOnline ? "Online Clinic" : "Physical Clinic";
              const cardDate = format(new Date(appt.start), "MMMM dd, yyyy");

              const svc = appt.serviceType || appt.visitType || "";
              const isAssessment = isPsychAssessment(svc);
              const isEsa = isESA(svc);
              const isIntern = isInternship(svc);
              const purpose = isAssessment ? getPurpose(appt) : null;
              const dotColor = getDotColor(appt);

              const serviceLabel = getServiceLabel(appt);

              const displayPurpose =
                purpose === PURPOSES.VAWC
                  ? isFemalePatient(appt)
                    ? purpose
                    : null
                  : purpose;

              return (
                <div key={appt.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardHeaderLeft}>
                      <span
                        className={styles.clinicDot}
                        style={{ backgroundColor: dotColor }}
                      />
                      {isGhost
                        ? "Rescheduled Appointment"
                        : "Appointment Information"}
                    </span>
                    <span className={styles.badgeGroup}>
                      {displayPurpose && (
                        <Badge
                          style={{
                            ...purposeInlineStyle(displayPurpose),
                            fontSize: 11,
                            padding: "2px 10px",
                          }}
                        >
                          {displayPurpose}
                        </Badge>
                      )}
                      {!displayPurpose && (isEsa || isIntern) && (
                        <Badge
                          style={{
                            ...serviceTypeInlineStyle(svc),
                            fontSize: 11,
                            padding: "2px 10px",
                          }}
                        >
                          {isEsa ? "ESA" : "Internship"}
                        </Badge>
                      )}
                      {isGhost && (
                        <span className={styles.newScheduleBadge}>
                          New Schedule
                        </span>
                      )}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardFields}>
                      <InfoRow
                        label="Patient Name"
                        value={appt.patientName || "—"}
                      />
                      <InfoRow label="Date of Appointment" value={cardDate} />
                      <InfoRow
                        label="Time"
                        value={`${startTime} – ${endTime}`}
                      />
                      <InfoRow label="Clinic Type" value={clinicType} />
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>
                          Type of Service:
                        </span>
                        <Badge
                          style={{
                            ...serviceTypeInlineStyle(svc),
                            fontSize: 11,
                          }}
                        >
                          {serviceLabel}
                        </Badge>
                      </div>
                      {displayPurpose && (
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Purpose:</span>
                          <Badge
                            style={{
                              ...purposeInlineStyle(displayPurpose),
                              fontSize: 11,
                            }}
                          >
                            {displayPurpose}
                          </Badge>
                        </div>
                      )}
                      <InfoRow
                        label="Reason for Consultation"
                        value={appt.reason || "Not specified"}
                      />
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Status:</span>
                        <StatusBadge
                          status={isGhost ? "Rescheduled" : appt.status}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <button
                      className={styles.btnPurple}
                      onClick={() => setActiveAppt({ appt, isGhost })}
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default DayAppointmentsModal;

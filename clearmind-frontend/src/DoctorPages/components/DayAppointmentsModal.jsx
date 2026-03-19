import { useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import {
  FiX,
  FiDownload,
  FiChevronDown,
  FiFile,
  FiPaperclip,
} from "react-icons/fi";
import { EVENT_COLORS } from "../data/appointmentsData";
import styles from "../DoctorStyle/DayAppointmentsModal.module.css";
import CompleteAppointmentModal from "./CompleteAppointmentModal";

// ── Helpers ────────────────────────────────────────────────────────────────
const toTime24 = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

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
  // Counseling / Therapy
  return {
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
  };
};

// ── Dot color for modal header / list cards ────────────────────────────────
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

// ✅ UPDATED: Reusable accordion with scrollable content area
function Accordion({ titleLeft, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef(null);
  const contentRef = useRef(null);

  const handleToggle = () => {
    setOpen((o) => !o);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 0);
  };

  return (
    <section className={styles.card} ref={ref}>
      <button
        className={`${styles.accordionHeader} ${open ? styles.open : ""}`}
        onClick={handleToggle}
      >
        <span className={styles.cardHeaderLeft}>{titleLeft}</span>
        <FiChevronDown
          size={16}
          className={`${styles.accordionChevron} ${open ? styles.rotated : ""}`}
        />
      </button>
      {/* ✅ NEW: Scrollable content area for each accordion */}
      {open && (
        <div className={styles.accordionBodyWrapper} ref={contentRef}>
          <div className={styles.accordionBody}>{children}</div>
        </div>
      )}
    </section>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────
const ModalHeader = ({ title, dateLabel, onClose }) => (
  <div className={styles.modalHeader}>
    <h3 className={styles.modalTitle}>{title}</h3>
    <div className={styles.modalHeaderRight}>
      <span className={styles.dateBadge}>{dateLabel}</span>
      <button className={styles.closeBtn} onClick={onClose}>
        <FiX />
      </button>
    </div>
  </div>
);

const InfoRow = ({ label, value, minWidth = 190 }) => (
  <div className={styles.infoRow}>
    <span className={styles.infoLabel} style={{ minWidth }}>
      {label}:
    </span>
    <span className={styles.infoValue}>{value}</span>
  </div>
);

// ── Inline badge helper ────────────────────────────────────────────────────
const Badge = ({ style, children }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 12px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
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
            <button className={styles.pdfViewerClose} onClick={onClose}>
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* ✅ Scrollable content area */}
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

        {/* ✅ Fixed toolbar at bottom */}
        <div className={styles.pdfToolbar}>
          <div className={styles.pdfPagination}>
            <button
              className={styles.pdfNavBtn}
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
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
      <button className={styles.pdfChip} onClick={() => setOpen(true)}>
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

// ══════════════════════════════════════════════════════════════════════════
// PURPOSE / SERVICE-SPECIFIC SECTIONS
// ══════════════════════════════════════════════════════════════════════════

const VawcSection = ({ appt }) => (
  <Accordion
    defaultOpen={false}
    titleLeft={
      <span className={styles.cardHeaderLeft}>
        <span className={styles.vawcDot} />
        VAWC — Initial Complaint
      </span>
    }
  >
    <ComplaintBox text={appt.initialComplaint} />
    <div className={styles.docsSection}>
      <div className={styles.docsSectionLabel}>Supporting Documents:</div>
      <div className={styles.docsChipRow}>
        <PdfFileChip
          label="Barangay Blotter"
          filename="VAWC_Barangay_Blotter.pdf"
        />
        <PdfFileChip label="Police Report" filename="VAWC_Police_Report.pdf" />
      </div>
    </div>
  </Accordion>
);

const LegalSection = ({ appt }) => (
  <Accordion
    defaultOpen={false}
    titleLeft={<span>Adoption / Legal — Initial Complaint</span>}
  >
    <ComplaintBox text={appt.initialComplaint} />
    <div className={styles.docsSection}>
      <div className={styles.docsSectionLabel}>Attached Documents:</div>
      <div className={styles.docsChipRow}>
        <PdfFileChip
          label="PACO Referral Document"
          filename="PACO_CSWD_Referral_Document.pdf"
        />
        <PdfFileChip
          label="CSWD Referral Document"
          filename="PACO_CSWD_Referral_Document.pdf"
        />
      </div>
    </div>
  </Accordion>
);

const SchoolSection = ({ appt }) => {
  const docs = appt.schoolDocuments || [];
  if (docs.length === 0) return null;
  return (
    <Accordion
      defaultOpen={false}
      titleLeft={<span>School / Academic — Supporting Documents</span>}
    >
      <div className={styles.docsSection}>
        <div
          className={styles.docsChipRow}
          style={{ flexWrap: "wrap", gap: 8 }}
        >
          {docs.map((doc, i) => (
            <PdfFileChip key={i} label={doc.label} filename={doc.filename} />
          ))}
        </div>
      </div>
    </Accordion>
  );
};

const WorkSection = ({ appt }) => (
  <Accordion
    defaultOpen={false}
    titleLeft={<span>Work-Related — Reason for Assessment</span>}
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
  </Accordion>
);

const PreEmploymentSection = ({ appt }) => (
  <Accordion
    defaultOpen={true}
    titleLeft={
      <span className={styles.cardHeaderLeft}>
        <Badge
          style={{
            background: "#fef3c7",
            color: "#92400e",
            border: "1px solid #fde68a",
          }}
        >
          Pre-Employment Assessment
        </Badge>
      </span>
    }
  >
    <div className={styles.sessionBox}>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel} style={{ minWidth: 190 }}>
          Name of Employer:
        </span>
        <span className={styles.infoValue}>
          {appt.employerName || (
            <span className={styles.complaintEmpty}>Not specified</span>
          )}
        </span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel} style={{ minWidth: 190 }}>
          Purpose of Assessment:
        </span>
        <span className={styles.infoValue} style={{ lineHeight: 1.6 }}>
          {appt.purposeOfAssessment || (
            <span className={styles.complaintEmpty}>Not specified</span>
          )}
        </span>
      </div>
    </div>
  </Accordion>
);

const ESASection = ({ appt }) => {
  const isInternational = appt.placeOfTravel === "International";
  const hasDocs = appt.diagnosisDocuments?.length > 0;

  return (
    <Accordion
      defaultOpen={true}
      titleLeft={
        <span className={styles.cardHeaderLeft}>
          <Badge
            style={{
              background: "#cffafe",
              color: "#0e7490",
              border: "1px solid #a5f3fc",
            }}
          >
            Emotional Support Animal (ESA)
          </Badge>
        </span>
      }
    >
      <div className={styles.sessionBox}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel} style={{ minWidth: 190 }}>
            Place of Travel:
          </span>
          <span className={styles.infoValue}>
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
          </span>
        </div>

        {appt.travelDestination && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel} style={{ minWidth: 190 }}>
              Destination:
            </span>
            <span className={styles.infoValue}>{appt.travelDestination}</span>
          </div>
        )}

        <div className={styles.infoRow}>
          <span className={styles.infoLabel} style={{ minWidth: 190 }}>
            Existing Clinical Diagnosis:
          </span>
          <span className={styles.infoValue}>
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
          </span>
        </div>

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
              Attached Diagnosis Documents:
            </div>
            <div className={styles.docsChipRow}>
              {appt.diagnosisDocuments.map((doc, i) => (
                <PdfFileChip
                  key={i}
                  label={doc.label}
                  filename={doc.filename}
                />
              ))}
            </div>
          </div>
        )}

        {!appt.hasExistingDiagnosis && (
          <div
            style={{
              marginTop: 10,
              padding: "10px 14px",
              borderRadius: 8,
              background: "#f9fafb",
              border: "1px dashed #d1d5db",
              fontSize: 13,
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FiFile size={14} style={{ flexShrink: 0 }} />
            No supporting document attached — patient has no existing clinical
            diagnosis.
          </div>
        )}
      </div>
    </Accordion>
  );
};

const InternshipSection = ({ appt }) => (
  <Accordion
    defaultOpen={true}
    titleLeft={
      <span className={styles.cardHeaderLeft}>
        <Badge
          style={{
            background: "#ede9fe",
            color: "#5b21b6",
            border: "1px solid #ddd6fe",
          }}
        >
          Mental Health for Internship
        </Badge>
      </span>
    }
  >
    <div className={styles.sessionBox}>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel} style={{ minWidth: 190 }}>
          School / University:
        </span>
        <span className={styles.infoValue}>
          {appt.schoolName || (
            <span className={styles.complaintEmpty}>Not specified</span>
          )}
        </span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel} style={{ minWidth: 190 }}>
          Program / Course:
        </span>
        <span className={styles.infoValue}>
          {appt.program || (
            <span className={styles.complaintEmpty}>Not specified</span>
          )}
        </span>
      </div>
      {appt.internshipStartDate && (
        <div className={styles.infoRow}>
          <span className={styles.infoLabel} style={{ minWidth: 190 }}>
            Internship Start Date:
          </span>
          <span className={styles.infoValue}>{appt.internshipStartDate}</span>
        </div>
      )}
    </div>
  </Accordion>
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
    <Accordion
      defaultOpen={true}
      titleLeft={
        <span className={styles.cardHeaderLeft}>
          <Badge
            style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}
          >
            {session.sessionType}
          </Badge>
        </span>
      }
    >
      <div className={styles.sessionBox}>
        <InfoRow minWidth={160} label="Type" value={session.sessionType} />
        {isCertRelease && (
          <>
            <InfoRow minWidth={160} label="Release Date" value={releaseDate} />
            <div className={styles.certReminderBox}>
              <span className={styles.certReminderIcon}>⚠️</span>
              <span className={styles.certReminderText}>
                The certificate must be claimed <strong>in person</strong> at
                the clinic. Please bring a valid government-issued ID upon
                release.
              </span>
            </div>
          </>
        )}
      </div>
    </Accordion>
  );
};

const RescheduleSection = ({ appt }) => (
  <Accordion
    defaultOpen={false}
    titleLeft={
      <span className={styles.cardHeaderLeft}>
        Reschedule Status
        <span
          className={styles.rescheduledStatusBadge}
          style={{ marginLeft: 8 }}
        >
          Rescheduled
        </span>
      </span>
    }
  >
    <div className={styles.rescheduleBox}>
      <InfoRow
        minWidth={130}
        label="New Date"
        value={format(new Date(appt.rescheduledTo.date), "MMMM dd, yyyy")}
      />
      <InfoRow
        minWidth={130}
        label="New Time"
        value={`${toTime12(appt.rescheduledTo.startTime)} – ${toTime12(appt.rescheduledTo.endTime)}`}
      />
      <InfoRow
        minWidth={130}
        label="Reason"
        value={appt.rescheduledTo.reason || "Not specified"}
      />
    </div>
  </Accordion>
);

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
  const displayDateShort = format(new Date(appt.start), "MMMM dd, yyyy");  /* ✅ Changed from MM/dd/yyyy to text format */

  const serviceType = appt.serviceType || appt.visitType || "";
  const isAssessment = isPsychAssessment(serviceType);
  const isEsa = isESA(serviceType);
  const isIntern = isInternship(serviceType);
  const purpose = isAssessment ? getPurpose(appt) : null;

  const serviceLabel = isAssessment
    ? "Psychological Assessment and Evaluation"
    : isEsa
      ? "Emotional Support Animal (ESA)"
      : isIntern
        ? "Mental Health for Internship"
        : "Counseling / Therapy";

  const clinicColor = getDotColor(appt);
  const showVawc =
    isAssessment && purpose === PURPOSES.VAWC && isFemalePatient(appt);

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <ModalHeader
            title={
              <>
                <span
                  className={styles.clinicDot}
                  style={{ backgroundColor: clinicColor }}
                />
                {isGhost ? "↪ " : ""}
                {startTime} — {clinicType}
                {isGhost && (
                  <span className={styles.rescheduledBadge}>Rescheduled</span>
                )}
              </>
            }
            dateLabel={displayDateShort}
            onClose={onClose}
          />

          <div className={styles.scrollBody}>
            {/* ── Appointment Info card ── */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                {isGhost
                  ? "Rescheduled Appointment Information"
                  : "Appointment Information"}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardFields}>
                  <InfoRow label="Name" value={appt.patientName || "—"} />
                  <InfoRow label="Visit Type" value={appt.visitType || "—"} />

                  {/* Type of Service — colored badge */}
                  <div className={styles.infoRow}>
                    <span
                      className={styles.infoLabel}
                      style={{ minWidth: 190 }}
                    >
                      Type of Service:
                    </span>
                    <Badge style={serviceTypeInlineStyle(serviceType)}>
                      {serviceLabel}
                    </Badge>
                  </div>

                  {/* Purpose — colored badge */}
                  {isAssessment && purpose && (
                    <div className={styles.infoRow}>
                      <span
                        className={styles.infoLabel}
                        style={{ minWidth: 190 }}
                      >
                        Purpose:
                      </span>
                      <Badge style={purposeInlineStyle(purpose)}>
                        {purpose}
                      </Badge>
                    </div>
                  )}

                  <InfoRow
                    label="Status"
                    value={isGhost ? "Rescheduled" : appt.status || "—"}
                  />
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

                <div className={styles.paymentWrap}>
                  <span className={styles.paymentLabel}>Payment:</span>
                  <span
                    className={
                      appt.payment === "Paid"
                        ? styles.paymentPaid
                        : styles.paymentUnpaid
                    }
                  >
                    {appt.payment || "—"}
                  </span>
                </div>
              </div>

              {(!isRescheduled || isGhost) && (
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

            {/* ── Purpose / service-specific sections ── */}
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

  // Week / Day view → jump straight to detail
  if (singleEventId && !activeAppt) {
    const target = events.find((e) => e.id === singleEventId);
    if (target) {
      return (
        <DetailView
          appt={target}
          isGhost={!!target.isRescheduledGhost}
          onClose={onClose}
          allEvents={events}
        />
      );
    }
  }

  // "View More" → show detail
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

  // Month view / "+X more" → full list
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          title="Appointments"
          dateLabel={formattedDate}
          onClose={onClose}
        />

        <div className={styles.scrollBody}>
          {dayAppointments.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#aaa",
                fontSize: 14,
                padding: "40px 0",
                margin: 0,
              }}
            >
              No appointments scheduled for this day.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                padding: "0 20px",
              }}
            >
              {dayAppointments.map((appt) => {
                const isGhost = !!appt.isRescheduledGhost;
                const startTime = toTime12(toTime24(appt.start));
                const endTime = toTime12(toTime24(appt.end));
                const isOnline = appt.title?.toLowerCase().includes("online");
                const clinicType = isOnline
                  ? "Online Clinic"
                  : "Physical Clinic";
                const cardDate = format(new Date(appt.start), "MMMM dd, yyyy");

                const svc = appt.serviceType || appt.visitType || "";
                const isAssessment = isPsychAssessment(svc);
                const isEsa = isESA(svc);
                const isIntern = isInternship(svc);
                const purpose = isAssessment ? getPurpose(appt) : null;
                const dotColor = getDotColor(appt);

                const serviceLabel = isAssessment
                  ? "Psychological Assessment and Evaluation"
                  : isEsa
                    ? "Emotional Support Animal (ESA)"
                    : isIntern
                      ? "Mental Health for Internship"
                      : "Counseling / Therapy";

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
                        {/* Purpose badge — colored */}
                        {displayPurpose && (
                          <Badge
                            style={{
                              ...purposeInlineStyle(displayPurpose),
                              fontSize: 11,
                              padding: "3px 10px",
                            }}
                          >
                            {displayPurpose}
                          </Badge>
                        )}
                        {/* Service type badge for ESA / Internship */}
                        {!displayPurpose && (isEsa || isIntern) && (
                          <Badge
                            style={{
                              ...serviceTypeInlineStyle(svc),
                              fontSize: 11,
                              padding: "3px 10px",
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

                    <div
                      className={styles.cardFields}
                      style={{ padding: "16px 20px" }}
                    >
                      <InfoRow
                        minWidth={180}
                        label="Name"
                        value={appt.patientName || "—"}
                      />
                      <InfoRow
                        minWidth={180}
                        label="Date of Appointment"
                        value={cardDate}
                      />
                      <InfoRow
                        minWidth={180}
                        label="Time"
                        value={`${startTime} – ${endTime}`}
                      />
                      <InfoRow
                        minWidth={180}
                        label="Clinic Type"
                        value={clinicType}
                      />

                      {/* Type of Service — colored badge */}
                      <div className={styles.infoRow}>
                        <span
                          className={styles.infoLabel}
                          style={{ minWidth: 180 }}
                        >
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

                      {/* Purpose — colored badge */}
                      {displayPurpose && (
                        <div className={styles.infoRow}>
                          <span
                            className={styles.infoLabel}
                            style={{ minWidth: 180 }}
                          >
                            Purpose:
                          </span>
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
                        minWidth={180}
                        label="Reason of Consultation"
                        value={appt.reason || "Not specified"}
                      />
                      <InfoRow
                        minWidth={180}
                        label="Status"
                        value={isGhost ? "Rescheduled" : appt.status || "—"}
                      />
                    </div>

                    <div
                      className={styles.cardFooter}
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <button
                        className={styles.btnPurple}
                        onClick={() => setActiveAppt({ appt, isGhost })}
                      >
                        View More
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DayAppointmentsModal;
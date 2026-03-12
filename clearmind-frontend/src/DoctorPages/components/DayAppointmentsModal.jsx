import { useState } from "react";
import { format } from "date-fns";
import { FiX, FiDownload, FiChevronDown, FiFile } from "react-icons/fi";
import { EVENT_COLORS } from "../data/appointmentsData";
import styles from "../DoctorStyle/DayAppointmentsModal.module.css";

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

// ── Service / Purpose helpers ──────────────────────────────────────────────
const isPsychAssessment = (serviceType) =>
  serviceType?.toLowerCase().includes("psychological assessment") ||
  serviceType?.toLowerCase().includes("assessment and evaluation");

const PURPOSES = {
  VAWC: "VAWC",
  LEGAL: "Adoption or Legal",
  SCHOOL: "School / Academic Support",
  WORK: "Work-Related",
};

const getPurpose = (appt) => appt?.assessmentPurpose || null;
const isFemalePatient = (appt) =>
  appt?.gender?.toLowerCase() === "female" ||
  appt?.gender?.toLowerCase() === "f";

const purposeClass = (purpose) => {
  switch (purpose) {
    case PURPOSES.VAWC:
      return styles.purposeVawc;
    case PURPOSES.LEGAL:
      return styles.purposeLegal;
    case PURPOSES.SCHOOL:
      return styles.purposeSchool;
    case PURPOSES.WORK:
      return styles.purposeWork;
    default:
      return "";
  }
};

// ── Reusable accordion wrapper ─────────────────────────────────────────────
function Accordion({ title, titleLeft, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={styles.card}>
      <button
        className={`${styles.accordionHeader} ${open ? styles.open : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.cardHeaderLeft}>{titleLeft || title}</span>
        <FiChevronDown
          size={16}
          className={`${styles.accordionChevron} ${open ? styles.rotated : ""}`}
        />
      </button>
      {open && <div className={styles.accordionBody}>{children}</div>}
    </section>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
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

// ── react-pdf setup ────────────────────────────────────────────────────────
// Import Document + Page from react-pdf (must be installed: npm i react-pdf)
// pdfjs worker is set to the CDN copy that ships with pdfjs-dist.
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// ── Full-screen PDF Viewer Modal (react-pdf) ───────────────────────────────
function PdfViewerModal({ label, filename, onClose }) {
  const src = `/forms/${filename}`;
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const prev = () => setPageNumber((p) => Math.max(1, p - 1));
  const next = () => setPageNumber((p) => Math.min(numPages, p + 1));

  return (
    <div className={styles.pdfViewerOverlay} onClick={onClose}>
      <div
        className={styles.pdfViewerModal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className={styles.pdfViewerHeader}>
          <span className={styles.pdfViewerTitle}>
            <FiFile size={15} />
            {label}
          </span>
          <div className={styles.pdfViewerActions}>
            <a
              href={src}
              download={filename}
              className={styles.pdfViewerDownload}
            >
              <FiDownload size={14} />
              Download
            </a>
            <button className={styles.pdfViewerClose} onClick={onClose}>
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* ── Toolbar: pagination + zoom ───────────────────────────────── */}
        <div className={styles.pdfToolbar}>
          <div className={styles.pdfPagination}>
            <button
              className={styles.pdfNavBtn}
              onClick={prev}
              disabled={pageNumber <= 1}
            >
              ‹
            </button>
            <span className={styles.pdfPageInfo}>
              {numPages ? `${pageNumber} / ${numPages}` : "—"}
            </span>
            <button
              className={styles.pdfNavBtn}
              onClick={next}
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

        {/* ── Document canvas ─────────────────────────────────────────── */}
        <div className={styles.pdfViewerBody}>
          <Document
            file={src}
            onLoadSuccess={onDocumentLoadSuccess}
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
      </div>
    </div>
  );
}

// ── PDF File Chip ──────────────────────────────────────────────────────────
// Renders as a clickable file pill. Clicking opens the full viewer modal.
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

// ── VAWC Section — collapsible, female patients only ──────────────────────
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

// ── Adoption or Legal Section — collapsible ───────────────────────────────
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

// ── School / Academic Section — collapsible ───────────────────────────────
// Only rendered when schoolDocuments array has entries. Hidden when empty.
const SchoolSection = ({ appt }) => {
  const docs = appt.schoolDocuments || [];
  if (docs.length === 0) return null; // ← no section at all if nothing uploaded

  return (
    <Accordion
      defaultOpen={false}
      titleLeft={<span>School / Academic — Supporting Documents</span>}
    >
      <div className={styles.docsSection}>
        <div className={styles.docsSectionLabel}>
          Patient-Uploaded Documents:
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
    </Accordion>
  );
};

// ── Work-Related Section — collapsible ────────────────────────────────────
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

// ── Assessment Session Section — collapsible ──────────────────────────────
const SESSION_TYPE_COLORS = {
  "Discussion of Psychological Assessment Results": {
    bg: "#e0f2fe",
    color: "#0369a1",
  },
  "Release of Certificate": { bg: "#dcfce7", color: "#15803d" },
};

const AssessmentSessionSection = ({ appt, allEvents }) => {
  const session = appt.assessmentSession;
  if (!session) return null;

  const isCertRelease = session.sessionType === "Release of Certificate";
  const badgeStyle = SESSION_TYPE_COLORS[session.sessionType] || {
    bg: "#f3f4f6",
    color: "#374151",
  };

  // Date of this appointment = certificate release date
  const releaseDate = format(new Date(appt.start), "MMMM dd, yyyy");

  return (
    <Accordion
      defaultOpen={true}
      titleLeft={
        <span className={styles.cardHeaderLeft}>
          <span
            className={styles.sessionTypeBadge}
            style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}
          >
            {session.sessionType}
          </span>
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

// ── Detail View ────────────────────────────────────────────────────────────
function DetailView({ appt, isGhost, onClose, allEvents = [] }) {
  const startTime = toTime12(toTime24(appt.start));
  const endTime = toTime12(toTime24(appt.end));
  const isOnline = appt.title?.toLowerCase().includes("online");
  const clinicType = isOnline ? "Online Clinic" : "Physical Clinic";
  const clinicColor = isOnline ? EVENT_COLORS.online : EVENT_COLORS.physical;

  const isRescheduled = appt.status === "Rescheduled" || isGhost;
  const displayDate = format(new Date(appt.start), "MMMM dd, yyyy");
  const displayDateShort = format(new Date(appt.start), "MM/dd/yyyy");

  const serviceType = appt.serviceType || appt.visitType || "";
  const isAssessment = isPsychAssessment(serviceType);
  const serviceLabel = isAssessment
    ? "Psychological Assessment and Evaluation"
    : "Counseling / Therapy";
  const purpose = isAssessment ? getPurpose(appt) : null;

  // VAWC only for female patients
  const showVawc =
    isAssessment && purpose === PURPOSES.VAWC && isFemalePatient(appt);

  return (
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
          {/* ── Appointment Info (always visible, not a dropdown) ───────── */}
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
                <InfoRow label="Type of Service" value={serviceLabel} />

                {isAssessment && purpose && (
                  <div className={styles.purposeRow}>
                    <span
                      className={styles.infoLabel}
                      style={{ minWidth: 190 }}
                    >
                      Purpose:
                    </span>
                    <span
                      className={`${styles.purposeBadge} ${purposeClass(purpose)}`}
                    >
                      {purpose}
                    </span>
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

            {/* Completed button always visible here */}
            {(!isRescheduled || isGhost) && (
              <div className={styles.cardFooter}>
                <button className={styles.btnGreen}>Completed</button>
              </div>
            )}
          </section>

          {/* ── VAWC — collapsible dropdown ──────────────────────────────── */}
          {showVawc && <VawcSection appt={appt} />}

          {/* ── Adoption / Legal — collapsible dropdown ──────────────────── */}
          {isAssessment && purpose === PURPOSES.LEGAL && (
            <LegalSection appt={appt} />
          )}

          {/* ── School / Academic — only shown when docs exist ───────────── */}
          {isAssessment && purpose === PURPOSES.SCHOOL && (
            <SchoolSection appt={appt} />
          )}

          {/* ── Work-Related — reason for assessment ─────────────────────── */}
          {isAssessment && purpose === PURPOSES.WORK && (
            <WorkSection appt={appt} />
          )}

          {/* ── Session info (Session 2 / Release of Certificate) ────────── */}
          {isAssessment && appt.assessmentSession && (
            <AssessmentSessionSection appt={appt} allEvents={allEvents} />
          )}

          {/* ── Reschedule Status — collapsible dropdown ─────────────────── */}
          {!isGhost && isRescheduled && appt.rescheduledTo && (
            <RescheduleSection appt={appt} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
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

  // ── Week / Day view: jump straight to the clicked event's detail ──────────
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

  // ── "View More" inside list → show detail ─────────────────────────────────
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

  // ── Month view / "+X more" → show full list for the day ───────────────────
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
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {dayAppointments.map((appt) => {
                const isGhost = !!appt.isRescheduledGhost;
                const startTime = toTime12(toTime24(appt.start));
                const endTime = toTime12(toTime24(appt.end));
                const isOnline = appt.title?.toLowerCase().includes("online");
                const clinicType = isOnline
                  ? "Online Clinic"
                  : "Physical Clinic";
                const dotColor = isOnline
                  ? EVENT_COLORS.online
                  : EVENT_COLORS.physical;
                const cardDate = format(new Date(appt.start), "MMMM dd, yyyy");

                const serviceType = appt.serviceType || appt.visitType || "";
                const isAssessment = isPsychAssessment(serviceType);
                const serviceLabel = isAssessment
                  ? "Psychological Assessment and Evaluation"
                  : "Counseling / Therapy";
                const purpose = isAssessment ? getPurpose(appt) : null;

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
                          <span
                            className={`${styles.listPurposeBadge} ${purposeClass(displayPurpose)}`}
                          >
                            {displayPurpose}
                          </span>
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
                      <InfoRow
                        minWidth={180}
                        label="Type of Service"
                        value={serviceLabel}
                      />
                      {displayPurpose && (
                        <InfoRow
                          minWidth={180}
                          label="Purpose"
                          value={displayPurpose}
                        />
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

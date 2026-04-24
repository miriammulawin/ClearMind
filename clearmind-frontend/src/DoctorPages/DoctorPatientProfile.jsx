import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import styles from "./DoctorStyle/DoctorPatient.module.css";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiClipboard,
  FiHeart,
  FiFileText,
  FiX,
  FiClock,
  FiActivity,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCheck,
  FiChevronRight,
} from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */
const API_BASE = "http://localhost:8000";
const API_PREFIX = `${API_BASE}/api`;
const getToken = () => localStorage.getItem("token");

/* ─────────────────────────────────────────────────────────
   Receipt URL resolver
───────────────────────────────────────────────────────── */
const resolveReceiptUrl = (appt) => {
  if (!appt) return null;
  if (Array.isArray(appt.receipt_urls) && appt.receipt_urls.length > 0)
    return appt.receipt_urls[0];
  if (Array.isArray(appt.receipt_paths) && appt.receipt_paths.length > 0) {
    const p = appt.receipt_paths[0];
    return p.startsWith("http") ? p : `${API_BASE}/storage/${p}`;
  }
  return null;
};

/* ─────────────────────────────────────────────────────────
   Status badge style
───────────────────────────────────────────────────────── */
const getStatusBadgeStyle = (status) => {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
      return {
        background: "#dcfce7",
        color: "#16a34a",
        border: "1px solid #bbf7d0",
      };
    case "confirmed":
    case "scheduled":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      };
    case "cancelled":
      return {
        background: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      };
    case "pending":
      return {
        background: "#fef9c3",
        color: "#b45309",
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

/* ════════════════════════════════════════════════════════════
   ClinicalNotesSection  — fully wired to API (per appointment)
════════════════════════════════════════════════════════════ */
function ClinicalNotesSection({ appointments = [] }) {
  const [selectedApptId, setSelectedApptId] = useState(
    appointments[0]?.appointment_id ?? null,
  );
  const [activeTab, setActiveTab] = useState("intake");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formValue, setFormValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notes, setNotes] = useState({
    intake: [],
    progress: [],
    recommendation: [],
  });
  const [progressionNote, setProgressionNote] = useState(null);
  const isProgressTab = activeTab === "progress";
  const hasProgressionNote = progressionNote?.assessment;
  const tabConfig = [
    {
      key: "intake",
      label: "Medical Intake",
      icon: <FiClipboard size={13} />,
      color: "#4D227C",
      light: "#f0e8ff",
      activeClass: styles.clinicalTabActiveIntake,
    },
    {
      key: "progress",
      label: "Progress Note",
      icon: <FiActivity size={13} />,
      color: "#1d6fa4",
      light: "#e8f4ff",
      activeClass: styles.clinicalTabActiveProgress,
    },
    {
      key: "recommendation",
      label: "Recommendation",
      icon: <FiFileText size={13} />,
      color: "#15803d",
      light: "#e8faf0",
      activeClass: styles.clinicalTabActiveRec,
    },
  ];
  const currentTab = tabConfig.find((t) => t.key === activeTab);

  /* ── Fetch notes whenever selected appointment changes ── */

  const fetchProgressionNote = useCallback(async (apptId) => {
    if (!apptId) return;

    try {
      const res = await fetch(
        `${API_PREFIX}/appointments/${apptId}`, // reuse existing endpoint
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      const data = await res.json();

      if (res.ok) {
        // find the correct appointment
        const appt = data.data?.appointments?.find(
          (a) => a.appointment_id === apptId,
        );

        if (appt?.progression_note) {
          setProgressionNote(appt.progression_note);
        } else {
          setProgressionNote(null);
        }
      }
    } catch (err) {
      console.error("Failed to load progression note", err);
      setProgressionNote(null);
    }
  }, []);

  const fetchNotes = useCallback(async (apptId) => {
    if (!apptId) return;
    setLoadingNotes(true);
    try {
      const res = await fetch(
        `${API_PREFIX}/appointments/${apptId}/clinical-notes`,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      const data = await res.json();
      if (res.ok && data.notes) {
        setNotes(data.notes);
      } else {
        setNotes({ intake: [], progress: [], recommendation: [] });
      }
    } catch (err) {
      console.error("Failed to load notes", err);
      setNotes({ intake: [], progress: [], recommendation: [] });
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes(selectedApptId);
    fetchProgressionNote(selectedApptId); // ✅ ADD THIS
  }, [selectedApptId, fetchNotes, fetchProgressionNote]);

  useEffect(() => {
    if (appointments.length > 0 && !selectedApptId) {
      setSelectedApptId(appointments[0].appointment_id);
    }
  }, [appointments]);

  /* ── ADD ── */
  const handleAdd = async () => {
    if (!formValue.trim() || !selectedApptId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API_PREFIX}/appointments/${selectedApptId}/clinical-notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ type: activeTab, content: formValue.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNotes((prev) => ({
        ...prev,
        [activeTab]: [data.note, ...prev[activeTab]],
      }));
      closeForm();
    } catch (err) {
      alert("Failed to save note: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── EDIT (save) ── */
  const handleSaveEdit = async () => {
    if (!formValue.trim() || !editingEntry || !selectedApptId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API_PREFIX}/appointments/${selectedApptId}/clinical-notes/${editingEntry.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ type: activeTab, content: formValue.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNotes((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((e) =>
          e.id === editingEntry.id ? { ...e, content: formValue.trim() } : e,
        ),
      }));
      closeForm();
    } catch (err) {
      alert("Failed to update note: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── DELETE ── */
  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?") || !selectedApptId) return;
    setDeleting(noteId);
    try {
      const res = await fetch(
        `${API_PREFIX}/appointments/${selectedApptId}/clinical-notes/${noteId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ type: activeTab }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNotes((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((e) => e.id !== noteId),
      }));
    } catch (err) {
      alert("Failed to delete note: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const openAdd = () => {
    setEditingEntry(null);
    setFormValue("");
    setShowAddModal(true);
  };
  const openEdit = (entry) => {
    setEditingEntry(entry);
    setFormValue(entry.content);
    setShowAddModal(true);
  };
  const closeForm = () => {
    setShowAddModal(false);
    setEditingEntry(null);
    setFormValue("");
  };

  const apptLabel = (a) =>
    `${a.date ?? a.raw_date ?? "—"} · ${a.service_type ?? a.type ?? "—"} · ${a.status ?? "—"}`;

  const hasAppointments = appointments.length > 0;

  return (
    <div className={styles.clinicalSection}>
      {/* ── Section Header ── */}
      <div className={styles.clinicalSectionHeader}>
        {/* Title row */}
        <div className={styles.clinicalTitleRow}>
          <div className={styles.clinicalTitleLeft}>
            <div className={styles.clinicalTitleIcon}>
              <FiClipboard size={14} color="#fff" />
            </div>
            <h3 className={styles.clinicalTitleText}>Clinical Notes</h3>
          </div>
        </div>

        {/* Appointment selector */}
        {hasAppointments && (
          <div className={styles.cnApptSelectorRow}>
            <span className={styles.cnApptLabel}>Viewing notes for</span>
            <div className={styles.cnApptSelectWrap}>
              <select
                className={styles.cnApptSelect}
                value={selectedApptId ?? ""}
                onChange={(e) => {
                  setSelectedApptId(Number(e.target.value));
                  setNotes({ intake: [], progress: [], recommendation: [] });
                }}
              >
                {appointments.map((a) => (
                  <option key={a.appointment_id} value={a.appointment_id}>
                    {apptLabel(a)}
                  </option>
                ))}
              </select>
              <FiChevronDown size={13} className={styles.cnApptCaret} />
            </div>
          </div>
        )}

        {/* Tab bar */}
        {hasAppointments && (
          <div className={styles.clinicalTabsRow}>
            {tabConfig.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  className={`${styles.clinicalTabBtn} ${isActive ? tab.activeClass : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    className={styles.clinicalTabCount}
                    style={
                      isActive
                        ? {
                            background: "rgba(255,255,255,0.22)",
                            color: "#fff",
                          }
                        : { background: tab.light, color: tab.color }
                    }
                  >
                    {notes[tab.key].length}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Tab Body ── */}
      <div className={styles.clinicalTabBody}>
        {!hasAppointments ? (
          <div className={styles.clinicalNoAppts}>
            No appointments found for this patient.
          </div>
        ) : loadingNotes ? (
          <div className={styles.clinicalLoading}>Loading notes…</div>
        ) : (
          <>
            {/* Toolbar: Add button */}
            <div className={styles.clinicalToolbar}>
              <button
                className={styles.clinicalAddBtn}
                style={{ background: currentTab.color }}
                onClick={openAdd}
                disabled={!selectedApptId}
              >
                <FiPlus size={13} /> Add {currentTab.label}
              </button>
            </div>

            {/* Entries */}
            <div className={styles.clinicalEntries}>
              {/* ✅ SHOW PROGRESSION NOTE FIRST (ONLY FOR PROGRESS TAB) */}
              {activeTab === "progress" && progressionNote && (
                <div
                  className={styles.clinicalEntryCard}
                  style={{ borderLeftColor: "#1d6fa4" }}
                >
                  <div className={styles.clinicalEntryHeader}>
                    <div className={styles.clinicalEntryMeta}>
                      <span className={styles.clinicalEntryBadge}>
                        <FiActivity size={12} /> Progression Note
                      </span>
                      <span className={styles.clinicalEntryDate}>
                        <FiCalendar size={11} />{" "}
                        {progressionNote.updated_at || "—"}
                      </span>
                      <span className={styles.clinicalEntryAuthor}>
                        <FiUser size={11} /> Doctor
                      </span>
                    </div>
                  </div>

                  <p className={styles.clinicalEntryContent}>
                    {progressionNote.assessment}
                  </p>
                </div>
              )}

              {/* ✅ EMPTY STATE */}
              {notes[activeTab].length === 0 &&
              !(activeTab === "progress" && progressionNote) ? (
                <div className={styles.clinicalEmpty}>
                  <div
                    className={styles.clinicalEmptyIcon}
                    style={{ color: currentTab.color }}
                  >
                    <FiClipboard size={22} />
                  </div>
                  <p className={styles.clinicalEmptyText}>
                    No {currentTab.label} entries yet for this appointment.
                  </p>
                  <button
                    className={styles.clinicalAddBtn}
                    style={{ background: currentTab.color }}
                    onClick={openAdd}
                    disabled={!selectedApptId}
                  >
                    <FiPlus size={13} /> Add First Entry
                  </button>
                </div>
              ) : (
                /* ✅ NORMAL NOTES */
                notes[activeTab].map((entry, index) => (
                  <div
                    key={entry.id}
                    className={styles.clinicalEntryCard}
                    style={{
                      borderLeftColor: currentTab.color,
                      opacity: deleting === entry.id ? 0.5 : 1,
                      pointerEvents: deleting === entry.id ? "none" : "auto",
                    }}
                  >
                    <div className={styles.clinicalEntryHeader}>
                      <div className={styles.clinicalEntryMeta}>
                        <span
                          className={styles.clinicalEntryBadge}
                          style={{
                            background: currentTab.light,
                            color: currentTab.color,
                            border: `0.5px solid ${currentTab.color}33`,
                          }}
                        >
                          {currentTab.icon} {currentTab.label} #
                          {notes[activeTab].length - index}
                        </span>

                        <span className={styles.clinicalEntryDate}>
                          <FiCalendar size={11} /> {entry.date}
                        </span>

                        <span className={styles.clinicalEntryAuthor}>
                          <FiUser size={11} /> {entry.author}
                        </span>
                      </div>

                      <div className={styles.clinicalEntryActions}>
                        <button
                          className={`${styles.clinicalActionBtn} ${styles.clinicalEditBtn}`}
                          onClick={() => openEdit(entry)}
                          title="Edit"
                        >
                          <FiEdit3 size={12} />
                        </button>

                        <button
                          className={`${styles.clinicalActionBtn} ${styles.clinicalDeleteBtn}`}
                          onClick={() => handleDelete(entry.id)}
                          title="Delete"
                          disabled={!!deleting}
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <p className={styles.clinicalEntryContent}>
                      {entry.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showAddModal && (
        <div className={styles.clinicalModalOverlay} onClick={closeForm}>
          <div
            className={styles.clinicalModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={styles.clinicalModalHeader}
              style={{ background: currentTab.color }}
            >
              <div className={styles.clinicalModalHeaderLeft}>
                {currentTab.icon}
                <h3>
                  {editingEntry ? "Edit" : "Add"} {currentTab.label}
                </h3>
              </div>
              <button
                className={styles.clinicalModalCloseBtn}
                onClick={closeForm}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.clinicalModalBody}>
              <label className={styles.clinicalFormLabel}>
                {currentTab.label} Entry
              </label>
              <textarea
                className={styles.clinicalTextarea}
                placeholder={`Write your ${currentTab.label.toLowerCase()} notes here…`}
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                rows={7}
                autoFocus
              />
            </div>
            <div className={styles.clinicalModalFooter}>
              <button
                className={styles.clinicalCancelBtn}
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className={styles.clinicalSaveBtn}
                style={{ background: currentTab.color }}
                onClick={editingEntry ? handleSaveEdit : handleAdd}
                disabled={saving}
              >
                <FiCheck size={14} />{" "}
                {saving
                  ? "Saving…"
                  : editingEntry
                    ? "Save Changes"
                    : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   AppointmentDetailModal
════════════════════════════════════════════ */
function AppointmentDetailModal({ appt, patientName, onClose }) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const receiptUrl = resolveReceiptUrl(appt);

  return (
    <>
      <div className={styles.patientModalOverlay} onClick={onClose}>
        <div
          className={styles.patientModalLg}
          style={{ maxWidth: "560px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.modalProfileHeader}>
            <button
              className={`${styles.closeBtn} ${styles.profileCloseBtn}`}
              onClick={onClose}
            >
              <FiX />
            </button>
            <div className={styles.modalProfileRow}>
              <div className={styles.patientProfileInfo}>
                <h3 className={styles.patientProfileName}>
                  Appointment Details
                </h3>
                <p className={styles.patientProfileContact}>{patientName}</p>
                <div className={styles.patientProfileMeta}>
                  <span className={styles.profileMetaChip}>{appt.date}</span>
                  <span className={styles.profileMetaChip}>{appt.time}</span>
                  <span
                    className={styles.profileMetaChip}
                    style={{
                      border: "1px solid rgba(255,255,255,0.4)",
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                    }}
                  >
                    {appt.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalBody}>
            {/* Appointment Info */}
            <div
              className={styles.modalContentCard}
              style={{ marginBottom: "12px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #ede9f6",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #7341A8, #4D227C)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FaCalendarAlt size={13} color="#fff" />
                </div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "17px",
                    fontWeight: 800,
                    color: "#3b1f6e",
                  }}
                >
                  Appointment Info
                </h4>
              </div>
              <div className={styles.modalTwoCol}>
                {[
                  { icon: <FiCalendar />, label: "Date", value: appt.date },
                  { icon: <FiClock />, label: "Time", value: appt.time },
                  {
                    icon: <FiClipboard />,
                    label: "Visit Type",
                    value: appt.type ?? appt.visit_type ?? "—",
                  },
                  {
                    icon: <FiClipboard />,
                    label: "Mode",
                    value:
                      appt.consultationMode ??
                      (appt.visit_type === "virtual" ? "Virtual" : "On-Site"),
                  },
                  {
                    icon: <FiFileText />,
                    label: "Service",
                    value: appt.service_type ?? "—",
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className={styles.modalInfoItem}>
                    <div className={styles.modalInfoIcon}>{icon}</div>
                    <div>
                      <span className={styles.modalInfoLabel}>{label}</span>
                      <span className={styles.modalInfoValue}>{value}</span>
                    </div>
                  </div>
                ))}
                <div className={styles.modalInfoItem}>
                  <div className={styles.modalInfoIcon}>
                    <FiUser />
                  </div>
                  <div>
                    <span className={styles.modalInfoLabel}>Status</span>
                    <span
                      className={styles.statusBadge}
                      style={{
                        ...getStatusBadgeStyle(appt.raw_status ?? appt.status),
                        marginTop: "2px",
                      }}
                    >
                      {appt.status}
                    </span>
                  </div>
                </div>
                {appt.notes && (
                  <div
                    className={styles.modalInfoItem}
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <div className={styles.modalInfoIcon}>
                      <FiFileText />
                    </div>
                    <div>
                      <span className={styles.modalInfoLabel}>
                        Notes / Reason
                      </span>
                      <span className={styles.modalInfoValue}>
                        {appt.notes}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {appt.appointment_ref && (
                <div
                  style={{
                    marginTop: "14px",
                    paddingTop: "12px",
                    borderTop: "1px dashed #e5e7eb",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#9b7ec8",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Ref #:&nbsp;
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#4D227C",
                    }}
                  >
                    {appt.appointment_ref}
                  </span>
                </div>
              )}
            </div>

            {/* Progression Notes (completed) */}
            {(appt.raw_status === "completed" ||
              (appt.status ?? "").toLowerCase() === "completed") &&
              appt.notes && (
                <div
                  className={styles.modalContentCard}
                  style={{ marginBottom: "12px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "14px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #ede9f6",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #7341A8, #4D227C)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FiActivity size={14} color="#fff" />
                    </div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "17px",
                        fontWeight: 800,
                        color: "#3b1f6e",
                      }}
                    >
                      Progression Notes
                    </h4>
                  </div>
                  <div
                    style={{
                      background: "#faf7ff",
                      border: "1px solid #ede9f6",
                      borderRadius: "10px",
                      padding: "16px 18px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "13.5px",
                        color: "#374151",
                        margin: 0,
                        lineHeight: "1.75",
                      }}
                    >
                      {appt.notes}
                    </p>
                  </div>
                </div>
              )}

            {/* Payment Details */}
            <div className={styles.modalContentCard}>
              <button
                className={styles.paymentCollapseToggle}
                onClick={() => setPaymentOpen(!paymentOpen)}
              >
                <span
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #7341A8, #4D227C)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FiFileText size={13} color="#fff" />
                  </div>
                  <span
                    className={styles.modalSectionTitle}
                    style={{ margin: 0, padding: 0, border: "none" }}
                  >
                    Payment Details
                  </span>
                </span>
                <span className={styles.paymentToggleIcon}>
                  {paymentOpen ? (
                    <FiChevronUp size={18} />
                  ) : (
                    <FiChevronDown size={18} />
                  )}
                  <span style={{ fontSize: 12, marginLeft: 4 }}>
                    {paymentOpen ? "Hide" : "View"}
                  </span>
                </span>
              </button>

              {paymentOpen && (
                <div className={styles.paymentCollapseBody}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "14px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9b7ec8",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      Payment Status
                    </span>
                    <span
                      style={
                        appt.payment_status === "paid"
                          ? {
                              background: "#dcfce7",
                              color: "#16a34a",
                              border: "1px solid #bbf7d0",
                              padding: "3px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 700,
                            }
                          : {
                              background: "#fef9c3",
                              color: "#b45309",
                              border: "1px solid #fde68a",
                              padding: "3px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 700,
                            }
                      }
                    >
                      {appt.payment_status === "paid"
                        ? "Paid"
                        : appt.payment_status === "probono"
                          ? "Pro Bono"
                          : "Not Paid"}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#9b7ec8",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: "10px",
                    }}
                  >
                    Payment Proof
                  </p>

                  {receiptUrl ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "110px",
                          flexShrink: 0,
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "2px solid #d8ccf0",
                          boxShadow: "0 2px 8px rgba(77,34,124,0.12)",
                          cursor: "zoom-in",
                        }}
                        onClick={() => setZoomImage(receiptUrl)}
                      >
                        <img
                          src={receiptUrl}
                          alt="Payment Proof Thumbnail"
                          style={{
                            width: "100%",
                            display: "block",
                            objectFit: "cover",
                            objectPosition: "top",
                          }}
                          onError={(e) => {
                            e.target.parentElement.style.display = "none";
                          }}
                        />
                      </div>
                      <div
                        style={{
                          flex: 1,
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1.5px solid #d8ccf0",
                          boxShadow: "0 4px 16px rgba(77,34,124,0.13)",
                          background: "#faf7ff",
                          maxHeight: "320px",
                          overflowY: "auto",
                        }}
                      >
                        <img
                          src={receiptUrl}
                          alt="Payment Proof Full"
                          style={{
                            width: "100%",
                            display: "block",
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            e.target.parentElement.style.display = "none";
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#aaa",
                        fontSize: "13px",
                        background: "#f9f9f9",
                        borderRadius: "8px",
                        border: "1px dashed #e5e7eb",
                      }}
                    >
                      No payment proof uploaded
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "10px",
                background: "#f3f4f6",
                color: "#374151",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Zoom */}
      {zoomImage && (
        <div
          className={styles.patientModalOverlay}
          onClick={() => setZoomImage(null)}
          style={{ cursor: "zoom-out", zIndex: 9999 }}
        >
          <div
            style={{ maxWidth: "90vw", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomImage}
              alt="Zoomed"
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════
   DoctorPatientProfile  (main component)
════════════════════════════════════════════ */
function DoctorPatientProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeMenu, setActiveMenu] = useState("Patients");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.replace("#", ""));
      if (el)
        setTimeout(
          () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
          150,
        );
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_PREFIX}/doctor/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
          },
        });
        const json = await res.json();
        if (!res.ok)
          throw new Error(json.message || "Failed to fetch patient.");

        const raw = json.data;
        setPatient({
          patient_id: raw.patient_id,
          name: raw.name,
          firstName: raw.firstName,
          lastName: raw.lastName,
          middleInitial: raw.middleInitial,
          dob: raw.dob,
          age: raw.age ?? "—",
          sex: raw.sex,
          genderIdentity: raw.genderIdentity,
          civilStatus: raw.civilStatus ?? "—",
          patientType: raw.patientType,
          classification: raw.classification ?? "Regular",
          totalVisits: raw.totalVisits ?? 0,
          address: raw.address ?? "—",
          contact: raw.contact ?? "—",
          email: raw.email ?? "—",
          profilePicture: raw.profile_picture ?? null,
          appointments: (raw.appointments || []).map((a) => ({
            appointment_id: a.appointment_id,
            appointment_ref: a.appointment_ref,
            date: a.date,
            raw_date: a.raw_date,
            time: a.time,
            visit_type: a.visit_type,
            consultationMode: a.consultationMode,
            type: a.type,
            status: a.status,
            raw_status: a.raw_status,
            service_type: a.service_type ?? "—",
            payment_status: a.payment_status ?? "—",
            notes: a.notes,
            receipt_urls: a.receipt_urls ?? [],
            receipt_paths: a.receipt_paths ?? [],
          })),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div className="doctor-layout">
        <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="doctor-main">
          <DoctorTopNavbar activeMenu={activeMenu} />
          <div style={{ padding: "40px", color: "#7341A8", fontWeight: 500 }}>
            Loading patient profile…
          </div>
        </div>
      </div>
    );

  if (error || !patient)
    return (
      <div className="doctor-layout">
        <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="doctor-main">
          <DoctorTopNavbar activeMenu={activeMenu} />
          <div style={{ padding: "40px" }}>
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "16px",
                borderRadius: "10px",
                marginBottom: "16px",
              }}
            >
              ⚠ {error || "Patient not found or not under your care."}
            </div>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "10px 20px",
                background: "#4D227C",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );

  const appointments = patient.appointments || [];

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className={`doctor-content ${styles.patientProfileContainer}`}>
          <button
            onClick={() => navigate(-1)}
            className={styles.patientBackBtn}
          >
            <FiArrowLeft style={{ marginRight: "6px" }} /> Back
          </button>

          {/* ── PATIENT INFO CARD ── */}
          <div className={styles.patientProfileCard}>
            <div className={styles.patientProfileLayout}>
              <div className={styles.patientAvatarLarge}>
                {patient.profilePicture ? (
                  <img
                    src={
                      patient.profilePicture.startsWith("http")
                        ? patient.profilePicture
                        : `${API_BASE}/storage/${patient.profilePicture}`
                    }
                    alt="Patient Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <FiUser size={80} />
                )}
              </div>

              <div className={styles.patientDetailsSection}>
                <h2 className={styles.patientProfileTitle}>{patient.name}</h2>

                <p className={styles.sectionSubLabel}>Personal Information</p>
                <div
                  className={styles.modalTwoCol}
                  style={{ marginBottom: "20px" }}
                >
                  {[
                    {
                      icon: <FiCalendar />,
                      label: "Age",
                      value: `${patient.age} yrs`,
                    },
                    {
                      icon: <FiCalendar />,
                      label: "Date of Birth",
                      value: patient.dob ?? "—",
                    },
                    {
                      icon: <FiUsers />,
                      label: "Sex",
                      value: patient.genderIdentity ?? patient.sex ?? "—",
                    },
                    {
                      icon: <FiHeart />,
                      label: "Civil Status",
                      value: patient.civilStatus,
                    },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className={styles.modalInfoItem}>
                      <div className={styles.modalInfoIcon}>{icon}</div>
                      <div>
                        <span className={styles.modalInfoLabel}>{label}</span>
                        <span className={styles.modalInfoValue}>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.sectionDivider} />

                <p className={styles.sectionSubLabel}>Contact Information</p>
                <div
                  className={styles.modalTwoCol}
                  style={{ marginBottom: "20px" }}
                >
                  <div className={styles.modalInfoItem}>
                    <div className={styles.modalInfoIcon}>
                      <FiPhone />
                    </div>
                    <div>
                      <span className={styles.modalInfoLabel}>Contact</span>
                      <span className={styles.modalInfoValue}>
                        {patient.contact}
                      </span>
                    </div>
                  </div>
                  <div className={styles.modalInfoItem}>
                    <div className={styles.modalInfoIcon}>
                      <FiMail />
                    </div>
                    <div>
                      <span className={styles.modalInfoLabel}>Email</span>
                      <span className={styles.modalInfoValue}>
                        {patient.email}
                      </span>
                    </div>
                  </div>
                  <div
                    className={styles.modalInfoItem}
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <div className={styles.modalInfoIcon}>
                      <FiMapPin />
                    </div>
                    <div>
                      <span className={styles.modalInfoLabel}>Address</span>
                      <span className={styles.modalInfoValue}>
                        {patient.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.sectionDivider} />

                <p className={styles.sectionSubLabel}>Patient Details</p>
                <div className={styles.modalTwoCol}>
                  {[
                    { label: "Patient Type", value: patient.patientType },
                    { label: "Total Visits", value: patient.totalVisits },
                    { label: "Classification", value: patient.classification },
                  ].map(({ label, value }) => (
                    <div key={label} className={styles.modalInfoItem}>
                      <div className={styles.modalInfoIcon}>
                        <FiClipboard />
                      </div>
                      <div>
                        <span className={styles.modalInfoLabel}>{label}</span>
                        <span className={styles.modalInfoValue}>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── CLINICAL NOTES ── */}
          <ClinicalNotesSection appointments={appointments} />

          {/* ── APPOINTMENT HISTORY ── */}
          <div
            id="appointment-history"
            className={styles.appointmentHistoryCard}
          >
            <h3 className={styles.appointmentHistoryTitle}>
              Appointment History
            </h3>
            {appointments.length === 0 ? (
              <p
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#aaa",
                  fontStyle: "italic",
                }}
              >
                No appointment history found.
              </p>
            ) : (
              <table className={styles.appointmentTable}>
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Date &amp; Time</th>
                    <th>Service / Type</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.appointment_id}>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: "#7341A8",
                          }}
                        >
                          {appt.appointment_ref ?? "—"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "#2e104e" }}>
                          {appt.date}
                        </span>
                        <br />
                        <small style={{ color: "#9ca3af" }}>{appt.time}</small>
                      </td>
                      <td style={{ color: "#2e104e" }}>
                        <span style={{ fontWeight: 600 }}>
                          {appt.service_type}
                        </span>
                        {appt.type && appt.type !== appt.service_type && (
                          <>
                            <br />
                            <small style={{ color: "#7341A8" }}>
                              {appt.type}
                            </small>
                          </>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: "20px",
                            background:
                              appt.consultationMode === "Virtual"
                                ? "#dbeafe"
                                : "#ede9f6",
                            color:
                              appt.consultationMode === "Virtual"
                                ? "#1d4ed8"
                                : "#4D227C",
                            border:
                              appt.consultationMode === "Virtual"
                                ? "1px solid #bfdbfe"
                                : "1px solid #d8ccf0",
                          }}
                        >
                          {appt.consultationMode}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            ...getStatusBadgeStyle(
                              appt.raw_status ?? appt.status,
                            ),
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: "20px",
                            background:
                              appt.payment_status === "paid"
                                ? "#dcfce7"
                                : "#fef9c3",
                            color:
                              appt.payment_status === "paid"
                                ? "#16a34a"
                                : "#b45309",
                            border:
                              appt.payment_status === "paid"
                                ? "1px solid #bbf7d0"
                                : "1px solid #fde68a",
                          }}
                        >
                          {appt.payment_status === "paid"
                            ? "Paid"
                            : appt.payment_status === "probono"
                              ? "Pro Bono"
                              : "Not Paid"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={styles.btnView}
                          style={{
                            width: "70px",
                            height: "30px",
                            fontSize: "12px",
                          }}
                          onClick={() => setSelectedAppointment(appt)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentDetailModal
          appt={selectedAppointment}
          patientName={patient.name}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}

export default DoctorPatientProfile;

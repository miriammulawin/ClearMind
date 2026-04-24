import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  FiX,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCheck,
  FiCalendar,
  FiUser,
  FiClipboard,
  FiActivity,
  FiFileText,
  FiClock,
} from "react-icons/fi";
import styles from "../DoctorStyle/DayAppointmentsModal.module.css";

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
const API_BASE = "http://localhost:8000/api";
const getToken = () => localStorage.getItem("token");

const toTime12 = (timeStr) => {
  if (!timeStr) return "—";
  const clean = timeStr.replace(/\s?(am|pm)$/i, "");
  if (!clean.includes(":")) return "—";
  const [h, m] = clean.split(":");
  const hour = parseInt(h, 10);
  if (isNaN(hour)) return "—";
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const formatApptDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr + "T00:00:00"), "MMMM d, yyyy");
  } catch {
    return dateStr;
  }
};

const visitTypeLabel = (visitType) =>
  visitType === "virtual" ? "Virtual Consultation" : "Onsite Consultation";

/**
 * Resolve the best receipt URL from an appointment data object.
 * The backend model appends `receipt_urls` (full URLs via $appends).
 * Falls back to building from `receipt_paths` if needed.
 */
const resolveReceiptUrl = (data) => {
  if (!data) return null;

  // 1. FULL URL from backend (BEST)
  if (Array.isArray(data.receipt_urls) && data.receipt_urls.length) {
    return data.receipt_urls[0];
  }

  // 2. single URL
  if (data.receiptUrl) {
    return data.receiptUrl.startsWith("http")
      ? data.receiptUrl
      : `http://localhost:8000/storage/${data.receiptUrl}`;
  }

  // 3. fallback path
  if (Array.isArray(data.receipt_paths) && data.receipt_paths.length) {
    return data.receipt_paths[0].startsWith("http")
      ? data.receipt_paths[0]
      : `http://localhost:8000/storage/${data.receipt_paths[0]}`;
  }

  return null;
};

/* ─────────────────────────────────────────────────────────
   ClinicalNotesSection
───────────────────────────────────────────────────────── */
function ClinicalNotesSection({ appointmentId }) {
  const [activeTab, setActiveTab] = useState("intake");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formValue, setFormValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null); // noteId being deleted
  const [notes, setNotes] = useState({
    intake: [],
    progress: [],
    recommendation: [],
  });

  const tabConfig = [
    {
      key: "intake",
      label: "Medical Intake",
      icon: <FiClipboard size={14} />,
      color: "#4D227C",
      light: "#f0e8ff",
    },
    {
      key: "progress",
      label: "Progress Note",
      icon: <FiActivity size={14} />,
      color: "#1d6fa4",
      light: "#e8f4ff",
    },
    {
      key: "recommendation",
      label: "Recommendation",
      icon: <FiFileText size={14} />,
      color: "#15803d",
      light: "#e8faf0",
    },
  ];

  const currentTab = tabConfig.find((t) => t.key === activeTab);

  // ── Fetch on mount / when appointmentId changes ──
  useEffect(() => {
    if (!appointmentId) return;
    fetchNotes();
  }, [appointmentId]);

  const fetchNotes = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/appointments/${appointmentId}/clinical-notes`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      const data = await res.json();
      if (res.ok && data.notes) setNotes(data.notes);
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  };

  // ── ADD ──
  const handleAdd = async () => {
    if (!formValue.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API_BASE}/appointments/${appointmentId}/clinical-notes`,
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

      // Prepend the server-returned note (has UUID id + server date/author)
      setNotes((prev) => ({
        ...prev,
        [activeTab]: [data.note, ...prev[activeTab]],
      }));
      closeForm();
    } catch (err) {
      console.error(err);
      alert("Failed to save note: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── EDIT (save) ──
  const handleSaveEdit = async () => {
    if (!formValue.trim() || !editingEntry) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API_BASE}/appointments/${appointmentId}/clinical-notes/${editingEntry.id}`,
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
      console.error(err);
      alert("Failed to update note: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    setDeleting(noteId);
    try {
      const res = await fetch(
        `${API_BASE}/appointments/${appointmentId}/clinical-notes/${noteId}`,
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
      console.error(err);
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        .cn-tabs{display:flex;gap:8px;flex-wrap:wrap;width:100%}
        .cn-tab-btn{flex:1;min-width:clamp(80px,20vw,120px);display:flex;align-items:center;justify-content:center;gap:6px;padding:clamp(6px,1.2vw,8px) clamp(8px,1.5vw,12px);border-radius:10px;border:1.5px solid #e2d5f5;background:#faf7ff;color:#777;font-size:clamp(11px,1.4vw,12.5px);font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.2s;font-family:'Poppins',sans-serif}
        .cn-tab-btn:hover{border-color:#9b6bbf;color:#4D227C}
        .cn-tab-count{padding:1px 8px;border-radius:20px;font-size:11px;font-weight:700;font-family:'Poppins',sans-serif}
        .cn-add-btn{display:inline-flex;align-items:center;gap:6px;padding:clamp(7px,1.2vw,8px) clamp(12px,2vw,16px);border-radius:10px;border:none;color:#fff;font-size:clamp(11px,1.4vw,13px);font-weight:600;cursor:pointer;white-space:nowrap;transition:filter 0.15s,transform 0.1s;font-family:'Poppins',sans-serif;text-transform:uppercase;letter-spacing:.4px}
        .cn-add-btn:hover{filter:brightness(1.1)}
        .cn-add-btn:active{transform:translateY(1px)}
        .cn-entries{display:flex;flex-direction:column;gap:10px;max-height:340px;overflow-y:auto;overflow-x:hidden;padding-right:4px}
        .cn-entries::-webkit-scrollbar{width:5px}
        .cn-entries::-webkit-scrollbar-track{background:#f0eaf8;border-radius:10px}
        .cn-entries::-webkit-scrollbar-thumb{background:#4D227C;border-radius:10px}
        .cn-entries{scrollbar-color:#4D227C #f0eaf8;scrollbar-width:thin}
        .cn-entry-card{border-radius:12px;border:1px solid #ede5f7;border-left-width:4px;padding:14px 16px;background:#fdfcff;flex-shrink:0;box-shadow:0 1px 6px rgba(77,34,124,0.05)}
        .cn-entry-card.cn-deleting{opacity:0.5;pointer-events:none}
        .cn-entry-header{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:10px}
        .cn-entry-meta{display:flex;flex-wrap:wrap;gap:7px;align-items:center}
        .cn-entry-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;font-family:'Poppins',sans-serif}
        .cn-entry-date,.cn-entry-author{display:flex;align-items:center;gap:4px;font-size:11px;color:#9ca3af;font-family:'Poppins',sans-serif}
        .cn-entry-actions{display:flex;gap:5px;flex-shrink:0}
        .cn-action-btn{padding:5px 7px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;transition:background 0.14s}
        .cn-edit-btn{background:#f0e8ff;color:#4D227C}
        .cn-edit-btn:hover{background:#e0d4f5}
        .cn-delete-btn{background:#fff0f0;color:#e53e3e}
        .cn-delete-btn:hover{background:#ffe0e0}
        .cn-entry-content{font-size:13px;color:#374151;line-height:1.7;margin:0;white-space:pre-wrap;font-family:'Poppins',sans-serif}
        .cn-empty{text-align:center;padding:32px 20px;color:#bbb;border:1.5px dashed #e0d4f5;border-radius:12px;display:flex;flex-direction:column;align-items:center;gap:12px}
        .cn-empty p{margin:0;font-size:13px;font-family:'Poppins',sans-serif}
        .cn-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.60);display:flex;align-items:center;justify-content:center;z-index:12000;padding:20px;box-sizing:border-box}
        .cn-modal{background:#fff;border-radius:16px;width:100%;max-width:520px;box-shadow:0 24px 64px rgba(77,34,124,0.25);overflow:hidden;display:flex;flex-direction:column;animation:cnModalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)}
        @keyframes cnModalIn{from{opacity:0;transform:translateY(-20px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        .cn-modal-header{padding:18px 22px;display:flex;align-items:center;justify-content:space-between}
        .cn-modal-header-title{margin:0;color:#fff;font-size:16px;font-weight:700;font-family:'Poppins',sans-serif;display:flex;align-items:center;gap:10px}
        .cn-modal-close{background:rgba(255,255,255,0.18);border:none;color:#fff;border-radius:8px;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
        .cn-modal-close:hover{background:rgba(255,255,255,0.30)}
        .cn-modal-body{padding:20px 24px;background:#f5f0fb}
        .cn-form-label{display:block;font-size:11px;font-weight:700;color:#4D227C;text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;font-family:'Poppins',sans-serif}
        .cn-textarea{width:100%;min-height:140px;padding:12px 14px;border:1.5px solid #e2d5f5;border-radius:10px;font-size:13.5px;color:#333;line-height:1.6;resize:vertical;box-sizing:border-box;outline:none;font-family:'Poppins',sans-serif;transition:border-color 0.2s,box-shadow 0.2s;background:#fff}
        .cn-textarea:focus{border-color:#4D227C;box-shadow:0 0 0 3px rgba(77,34,124,0.1)}
        .cn-modal-footer{padding:14px 22px;border-top:2px solid #ede5f7;background:#fff;display:flex;justify-content:flex-end;gap:10px}
        .cn-cancel-btn{padding:9px 20px;border-radius:10px;border:1.5px solid #e2d5f5;background:#f0ebf7;color:#4D227C;font-weight:600;font-size:13px;cursor:pointer;font-family:'Poppins',sans-serif;transition:background 0.2s,color 0.2s}
        .cn-cancel-btn:hover{background:#4D227C;color:#fff}
        .cn-save-btn{display:flex;align-items:center;gap:6px;padding:9px 20px;border-radius:10px;border:none;color:#fff;font-weight:700;font-size:13px;cursor:pointer;font-family:'Poppins',sans-serif;transition:filter 0.15s,transform 0.1s;text-transform:uppercase;letter-spacing:.4px}
        .cn-save-btn:hover{filter:brightness(1.1)}
        .cn-save-btn:active{transform:translateY(1px)}
        .cn-save-btn:disabled{opacity:0.6;cursor:not-allowed}
        .cam-footer{flex-shrink:0;border-top:2px solid #ede5f7;padding:16px 24px;background:#fff;display:flex;justify-content:flex-end;align-items:center;gap:10px;border-radius:0 0 16px 16px;font-family:'Poppins',sans-serif}
        .cam-cancel-btn{background:#f0ebf7;color:#4D227C;border:2px solid #c9b8f0;padding:11px 22px;border-radius:10px;font-size:14px;font-weight:600;font-family:'Poppins',sans-serif;cursor:pointer;transition:background 0.2s,color 0.2s,border-color 0.2s}
        .cam-cancel-btn:hover{background:#4D227C;color:#fff;border-color:#4D227C}
        .cam-confirm-btn{display:flex;align-items:center;gap:8px;padding:11px 26px;border-radius:10px;border:2px solid #15803d;background:#15803d;color:#fff;font-weight:700;font-size:14px;cursor:pointer;font-family:'Poppins',sans-serif;transition:background 0.2s,color 0.2s;text-transform:uppercase;letter-spacing:.5px;box-shadow:0 4px 14px rgba(21,128,61,0.3)}
        .cam-confirm-btn:hover{background:#fff;color:#15803d}
        .cam-confirm-btn:active{transform:translateY(1px)}
        .cam-confirm-btn:disabled{opacity:0.6;cursor:not-allowed}
        .cam-payment-label{font-size:11px;font-weight:700;color:#4D227C;text-transform:uppercase;letter-spacing:.6px;font-family:'Poppins',sans-serif;display:block;margin-bottom:6px}
        .cam-payment-status-badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700;font-family:'Poppins',sans-serif}
        .cam-receipt-wrap{width:100%;margin-top:6px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;background:#f9f9f9;cursor:zoom-in}
        .cam-receipt-img{width:100%;max-height:260px;object-fit:contain;display:block}
        .cam-receipt-empty{padding:20px;text-align:center;color:#aaa;font-size:13px;background:#f9f9f9;border-radius:8px;border:1px dashed #e5e7eb;margin-top:6px;font-family:'Poppins',sans-serif}
        .cam-zoom-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.78);display:flex;align-items:center;justify-content:center;z-index:13000;cursor:zoom-out;padding:20px;box-sizing:border-box}
        .cam-zoom-img{max-width:90vw;max-height:90vh;object-fit:contain;border-radius:12px;box-shadow:0 4px 32px rgba(0,0,0,0.5)}
      `}</style>

      {/* Add button */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: 10,
        }}
      >
        <button
          className="cn-add-btn"
          style={{ background: currentTab.color }}
          onClick={openAdd}
        >
          <FiPlus size={14} /> Add {currentTab.label}
        </button>
      </div>

      {/* Tab Bar */}
      <div className="cn-tabs" style={{ marginBottom: 14 }}>
        {tabConfig.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="cn-tab-btn"
              style={
                isActive
                  ? {
                      background: tab.color,
                      color: "#fff",
                      borderColor: tab.color,
                    }
                  : {}
              }
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className="cn-tab-count"
                style={{
                  background: isActive ? "rgba(255,255,255,0.25)" : tab.light,
                  color: isActive ? "#fff" : tab.color,
                }}
              >
                {notes[tab.key].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Entries */}
      <div className="cn-entries">
        {notes[activeTab].length === 0 ? (
          <div className="cn-empty">
            <span style={{ fontSize: 36, opacity: 0.25 }}>📋</span>
            <p>No {currentTab.label} entries yet.</p>
            <button
              className="cn-add-btn"
              style={{ background: currentTab.color }}
              onClick={openAdd}
            >
              <FiPlus size={13} /> Add First Entry
            </button>
          </div>
        ) : (
          notes[activeTab].map((entry, index) => (
            <div
              key={entry.id}
              className={`cn-entry-card${deleting === entry.id ? " cn-deleting" : ""}`}
              style={{ borderLeftColor: currentTab.color }}
            >
              <div className="cn-entry-header">
                <div className="cn-entry-meta">
                  <span
                    className="cn-entry-badge"
                    style={{
                      background: currentTab.light,
                      color: currentTab.color,
                    }}
                  >
                    {currentTab.icon} {currentTab.label} #
                    {notes[activeTab].length - index}
                  </span>
                  <span className="cn-entry-date">
                    <FiCalendar size={11} /> {entry.date}
                  </span>
                  <span className="cn-entry-author">
                    <FiUser size={11} /> {entry.author}
                  </span>
                </div>
                <div className="cn-entry-actions">
                  <button
                    className="cn-action-btn cn-edit-btn"
                    onClick={() => openEdit(entry)}
                    title="Edit"
                  >
                    <FiEdit3 size={13} />
                  </button>
                  <button
                    className="cn-action-btn cn-delete-btn"
                    onClick={() => handleDelete(entry.id)}
                    title="Delete"
                    disabled={deleting === entry.id}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="cn-entry-content">{entry.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit sub-modal */}
      {showAddModal && (
        <div className="cn-modal-overlay" onClick={closeForm}>
          <div className="cn-modal" onClick={(e) => e.stopPropagation()}>
            <div
              className="cn-modal-header"
              style={{ background: currentTab.color }}
            >
              <h3 className="cn-modal-header-title">
                {currentTab.icon}
                {editingEntry ? "Edit" : "Add"} {currentTab.label}
              </h3>
              <button
                className="cn-modal-close"
                onClick={closeForm}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="cn-modal-body">
              <label className="cn-form-label">{currentTab.label} Entry</label>
              <textarea
                className="cn-textarea"
                placeholder={`Write your ${currentTab.label.toLowerCase()} notes here…`}
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                rows={7}
                autoFocus
              />
            </div>
            <div className="cn-modal-footer">
              <button
                className="cn-cancel-btn"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="cn-save-btn"
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
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   CompleteAppointmentModal
───────────────────────────────────────────────────────── */
function CompleteAppointmentModal({ isOpen, onClose, appt, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [zoomReceipt, setZoomReceipt] = useState(null);

  /* Fetch full appointment data so we always have receipt_urls from the model */
  useEffect(() => {
    if (!isOpen || !appt?.appointment_id) return;

    const fetchAppointment = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/appointments/${appt.appointment_id}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              Accept: "application/json",
            },
          },
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to fetch");
        setAppointment(json.data || json);
      } catch (err) {
        console.error("Fetch appointment error:", err);
        setAppointment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [isOpen, appt?.appointment_id]);

  if (!isOpen || !appt) return null;

  if (loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "#7341A8",
              fontFamily: "'Poppins', sans-serif",
              fontSize: 14,
            }}
          >
            Loading appointment details…
          </div>
        </div>
      </div>
    );
  }

  /*
   * Merge: prop data first (camelCase fields from DoctorPatient.jsx),
   * then overlay with fetched API data (snake_case + receipt_urls from $appends).
   * resolveReceiptUrl checks both shapes.
   */
  const data = { ...(appt || {}), ...(appointment || {}) };

  /* Derived display values */
  const clinicType = visitTypeLabel(data.visitType ?? data.visit_type);
  const dateDisplay = formatApptDate(
    data.appointmentDate ?? data.appointment_date ?? data.raw_date,
  );
  const start = toTime12(data.startTime ?? data.start_time);
  const end = toTime12(data.endTime ?? data.end_time);
  const timeDisplay =
    start !== "—" && end !== "—"
      ? `${start} – ${end}`
      : start !== "—"
        ? start
        : end !== "—"
          ? end
          : "—";

  let dateBadge = "—";
  try {
    const rawDate =
      data.appointmentDate ?? data.appointment_date ?? data.raw_date;
    if (rawDate)
      dateBadge = format(new Date(rawDate + "T00:00:00"), "MMM d, yyyy");
  } catch {
    /* no-op */
  }

  /* ✅ Use the unified resolver — works for receipt_urls[], receiptUrl, receipt_paths[] */
  const receiptUrl = resolveReceiptUrl(data);

  /* Payment */
  const rawPayment = data.paymentStatus ?? data.payment_status ?? "";
  const isPaid = rawPayment === "paid";
  const paymentStatusLabel =
    rawPayment === "paid"
      ? "Paid"
      : rawPayment === "probono"
        ? "Pro Bono"
        : "Not Paid";

  /* Mark as Completed */
  const handleConfirm = async () => {
    setSubmitting(true);

    try {
      const res = await fetch(
        `${API_BASE}/appointments/${appt.appointment_id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "completed" }),
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed");

      onConfirm?.(); // refresh parent list
      onClose();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Zoomed receipt overlay */}
      {zoomReceipt && (
        <div className="cam-zoom-overlay" onClick={() => setZoomReceipt(null)}>
          <img
            src={zoomReceipt}
            alt="Zoomed Receipt"
            className="cam-zoom-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Add Clinical Notes</h3>
            <div className={styles.modalHeaderRight}>
              <span className={styles.dateBadge}>{dateBadge}</span>
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
            {/* Appointment Information */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardHeaderLeft}>
                  Appointment Information
                </span>
                {data.referenceNumber && (
                  <span className={styles.referenceNumber}>
                    {data.referenceNumber}
                  </span>
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardFields}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Patient:</span>
                    <span
                      className={styles.infoValue}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FiUser size={12} style={{ color: "#9c7dd4" }} />
                      {data.patientName ?? data.patient_name ?? "—"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Date:</span>
                    <span
                      className={styles.infoValue}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FiCalendar size={12} style={{ color: "#9c7dd4" }} />
                      {dateDisplay}
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
                      <FiClock size={12} style={{ color: "#9c7dd4" }} />
                      {timeDisplay}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Visit Type:</span>
                    <span className={styles.infoValue}>{clinicType}</span>
                  </div>
                  {(data.serviceType ?? data.service_type) && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Service:</span>
                      <span className={styles.infoValue}>
                        {data.serviceType ?? data.service_type}
                      </span>
                    </div>
                  )}
                  {(data.assessmentPurpose ?? data.pae_purpose) && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Purpose:</span>
                      <span className={styles.infoValue}>
                        {data.assessmentPurpose ?? data.pae_purpose}
                      </span>
                    </div>
                  )}
                  {(data.doctorName ?? data.doctor_name) && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Doctor:</span>
                      <span className={styles.infoValue}>
                        {data.doctorName ?? data.doctor_name}
                      </span>
                    </div>
                  )}
                  {(data.reason ?? data.reason_for_consultation) && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Reason:</span>
                      <span className={styles.infoValue}>
                        {data.reason ?? data.reason_for_consultation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Payment Details */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardHeaderLeft}>Payment Details</span>
              </div>
              <div
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="cam-payment-label" style={{ margin: 0 }}>
                    Payment Status:
                  </span>
                  <span
                    className="cam-payment-status-badge"
                    style={
                      isPaid
                        ? {
                            background: "#dcfce7",
                            color: "#16a34a",
                            border: "1px solid #bbf7d0",
                          }
                        : {
                            background: "#fef9c3",
                            color: "#b45309",
                            border: "1px solid #fde68a",
                          }
                    }
                  >
                    {paymentStatusLabel}
                  </span>
                </div>

                {/* ✅ Payment proof */}
                <div>
                  <span className="cam-payment-label">Payment Proof</span>
                  {receiptUrl ? (
                    <div
                      className="cam-receipt-wrap"
                      onClick={() => setZoomReceipt(receiptUrl)}
                    >
                      <img
                        src={receiptUrl}
                        alt="Payment Proof"
                        className="cam-receipt-img"
                        onError={(e) => {
                          e.target.parentElement.style.display = "none";
                          const empty = e.target.parentElement.nextSibling;
                          if (empty) empty.style.display = "block";
                        }}
                      />
                    </div>
                  ) : null}
                  <div
                    className="cam-receipt-empty"
                    style={{ display: receiptUrl ? "none" : "block" }}
                  >
                    No payment proof uploaded
                  </div>
                </div>
              </div>
            </section>

            {/* Clinical Notes */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardHeaderLeft}>Clinical Notes</span>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <ClinicalNotesSection appointmentId={appt.appointment_id} />
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="cam-footer">
            <button
              className="cam-cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="cam-confirm-btn"
              onClick={handleConfirm}
              disabled={submitting}
            >
              <FiCheck size={15} />
              {submitting ? "Saving…" : "Mark as Completed"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompleteAppointmentModal;

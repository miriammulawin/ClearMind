import { useState } from "react";
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
} from "react-icons/fi";
import styles from "../DoctorStyle/DayAppointmentsModal.module.css";

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */
const toTime12 = (date) => {
  const d = new Date(date);
  const h = d.getHours(),
    m = String(d.getMinutes()).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
};

/* ─────────────────────────────────────────────────────────────────
   ClinicalNotesSection
───────────────────────────────────────────────────────────────── */
function ClinicalNotesSection() {
  const [activeTab, setActiveTab] = useState("intake");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formValue, setFormValue] = useState("");

  const [notes, setNotes] = useState({
    intake: [],
    progress: [],
    recommendation: [],
  });

  const tabConfig = [
    {
      key: "intake",
      label: "Medical Intake",
      icon: <FiClipboard size={15} />,
      color: "#4D227C",
      light: "#f0e8ff",
    },
    {
      key: "progress",
      label: "Progress Note",
      icon: <FiActivity size={15} />,
      color: "#1d6fa4",
      light: "#e8f4ff",
    },
    {
      key: "recommendation",
      label: "Recommendation",
      icon: <FiFileText size={15} />,
      color: "#15803d",
      light: "#e8faf0",
    },
  ];

  const currentTab = tabConfig.find((t) => t.key === activeTab);

  const handleAdd = () => {
    if (!formValue.trim()) return;
    setNotes((prev) => ({
      ...prev,
      [activeTab]: [
        {
          id: Date.now(),
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          author: "Dr. Admin",
          content: formValue.trim(),
        },
        ...prev[activeTab],
      ],
    }));
    closeForm();
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormValue(entry.content);
    setShowAddModal(true);
  };
  const handleSaveEdit = () => {
    if (!formValue.trim()) return;
    setNotes((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((e) =>
        e.id === editingEntry.id ? { ...e, content: formValue.trim() } : e,
      ),
    }));
    closeForm();
  };
  const handleDelete = (id) =>
    setNotes((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((e) => e.id !== id),
    }));
  const openAdd = () => {
    setEditingEntry(null);
    setFormValue("");
    setShowAddModal(true);
  };
  const closeForm = () => {
    setShowAddModal(false);
    setEditingEntry(null);
    setFormValue("");
  };

  return (
    <div className="clinical-notes-section">
      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: 8,
          }}
        >
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1.5px solid #e0d4f5",
                background: activeTab === tab.key ? tab.color : "#faf7ff",
                color: activeTab === tab.key ? "#fff" : "#666",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>

              <span
                style={{
                  padding: "1px 7px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  background:
                    activeTab === tab.key
                      ? "rgba(255,255,255,0.25)"
                      : tab.light,
                  color: activeTab === tab.key ? "#fff" : tab.color,
                }}
              >
                {notes[tab.key].length}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={openAdd}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: currentTab.color,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <FiPlus size={14} /> Add {currentTab.label}
        </button>
      </div>

      {/* Entries */}
      <div className="clinical-entries">
        {notes[activeTab].length === 0 ? (
          <div className="clinical-empty">
            <span style={{ fontSize: 34, opacity: 0.22 }}>📋</span>
            <p>No {currentTab.label} entries yet.</p>
            <button
              className="clinical-add-btn"
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
              className="clinical-entry-card"
              style={{ borderLeftColor: currentTab.color }}
            >
              <div className="clinical-entry-header">
                <div className="clinical-entry-meta">
                  <span
                    className="clinical-entry-badge"
                    style={{
                      background: currentTab.light,
                      color: currentTab.color,
                    }}
                  >
                    {currentTab.icon} {currentTab.label} #
                    {notes[activeTab].length - index}
                  </span>
                  <span className="clinical-entry-date">
                    <FiCalendar size={11} /> {entry.date}
                  </span>
                  <span className="clinical-entry-author">
                    <FiUser size={11} /> {entry.author}
                  </span>
                </div>
                <div className="clinical-entry-actions">
                  <button
                    className="clinical-action-btn clinical-edit-btn"
                    onClick={() => handleEdit(entry)}
                    title="Edit"
                  >
                    <FiEdit3 size={13} />
                  </button>
                  <button
                    className="clinical-action-btn clinical-delete-btn"
                    onClick={() => handleDelete(entry.id)}
                    title="Delete"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="clinical-entry-content">{entry.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit sub-modal */}
      {showAddModal && (
        <div className="clinical-modal-overlay" onClick={closeForm}>
          <div className="clinical-modal" onClick={(e) => e.stopPropagation()}>
            <div
              className="clinical-modal-header"
              style={{ background: currentTab.color }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {currentTab.icon}
                <h3
                  style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {editingEntry ? "Edit" : "Add"} {currentTab.label}
                </h3>
              </div>
              <button
                onClick={closeForm}
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "none",
                  color: "#fff",
                  borderRadius: 6,
                  padding: "5px 7px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="clinical-modal-body">
              <label className="clinical-form-label">
                {currentTab.label} Entry
              </label>
              <textarea
                className="clinical-textarea"
                placeholder={`Write your ${currentTab.label.toLowerCase()} notes here…`}
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                rows={7}
                autoFocus
              />
            </div>
            <div className="clinical-modal-footer">
              <button className="clinical-cancel-btn" onClick={closeForm}>
                Cancel
              </button>
              <button
                className="clinical-save-btn"
                style={{ background: currentTab.color }}
                onClick={editingEntry ? handleSaveEdit : handleAdd}
              >
                <FiCheck size={14} />{" "}
                {editingEntry ? "Save Changes" : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CompleteAppointmentModal
   ✅ FIXED: Proper flex layout, removed conflicting inline styles
───────────────────────────────────────────────────────────────── */
function CompleteAppointmentModal({ isOpen, onClose, appt, onConfirm }) {
  if (!isOpen || !appt) return null;

  const isOnline = appt.title?.toLowerCase().includes("online");
  const clinicType = isOnline ? "Online Clinic" : "Physical Clinic";
  const startTime = toTime12(appt.start);
  const endTime = toTime12(appt.end);
  const apptDate = format(new Date(appt.start), "MMMM dd, yyyy");
  const apptDateShort = format(new Date(appt.start), "MM/dd/yyyy");

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <>
      <style>{`
        /* ── Clinical notes styles (only needed inside this modal) ── */
        .clinical-notes-section { margin: 0; }

        .clinical-tabs-bar {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px; margin-bottom: 14px;
        }
        .clinical-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .clinical-tab-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 13px; border-radius: 8px;
          border: 1.5px solid #e0d4f5; background: #faf7ff;
          color: #666; font-size: 12.5px; font-weight: 600;
          cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .clinical-tab-btn:hover { border-color: #9b6bbf; color: #4D227C; }
        .clinical-tab-count {
          padding: 1px 7px; border-radius: 10px; font-size: 11px; font-weight: 700;
        }
        .clinical-add-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 8px; border: none;
          color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: filter 0.15s; font-family: inherit; white-space: nowrap;
        }
        .clinical-add-btn:hover { filter: brightness(1.1); }

        .clinical-entries { display: flex; flex-direction: column; gap: 10px; }
        .clinical-entry-card {
          border-radius: 10px; border: 1px solid #e5e7eb;
          border-left-width: 4px; padding: 12px 14px; background: #fdfcff;
        }
        .clinical-entry-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 8px; margin-bottom: 8px;
        }
        .clinical-entry-meta { display: flex; flex-wrap: wrap; gap: 7px; align-items: center; }
        .clinical-entry-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700;
        }
        .clinical-entry-date,
        .clinical-entry-author {
          display: flex; align-items: center; gap: 4px; font-size: 11px; color: #9ca3af;
        }
        .clinical-entry-actions { display: flex; gap: 5px; flex-shrink: 0; }
        .clinical-action-btn {
          padding: 5px 6px; border-radius: 6px; border: none;
          cursor: pointer; display: flex; align-items: center; transition: background 0.14s;
        }
        .clinical-edit-btn   { background: #f0e8ff; color: #4D227C; }
        .clinical-edit-btn:hover   { background: #e0d4f5; }
        .clinical-delete-btn { background: #fff0f0; color: #e53e3e; }
        .clinical-delete-btn:hover { background: #ffe0e0; }
        .clinical-entry-content {
          font-size: 13px; color: #374151; line-height: 1.7; margin: 0; white-space: pre-wrap;
        }
        .clinical-empty {
          text-align: center; padding: 30px 20px; color: #aaa;
          border: 1.5px dashed #e0d4f5; border-radius: 10px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .clinical-empty p { margin: 0; font-size: 13px; }

        /* sub-modal — z above parent (11000) */
        .clinical-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.60);
          display: flex; align-items: center; justify-content: center;
          z-index: 12000; padding: 20px; box-sizing: border-box;
        }
        .clinical-modal {
          background: #fff; border-radius: 12px; width: 100%; max-width: 500px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.22);
          overflow: hidden; display: flex; flex-direction: column;
        }
        .clinical-modal-header {
          padding: 15px 18px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .clinical-modal-body { padding: 18px 20px; }
        .clinical-form-label {
          display: block; font-size: 11.5px; font-weight: 700; color: #555;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
        }
        .clinical-textarea {
          width: 100%; min-height: 130px; padding: 10px 12px;
          border: 1.5px solid #ddd; border-radius: 8px;
          font-size: 13.5px; color: #333; line-height: 1.6;
          resize: vertical; box-sizing: border-box; outline: none;
          font-family: inherit; transition: border-color 0.18s;
        }
        .clinical-textarea:focus { border-color: #9b6bbf; }
        .clinical-modal-footer {
          padding: 12px 18px; border-top: 1px solid #f0f0f0;
          display: flex; justify-content: flex-end; gap: 8px;
        }
        .clinical-cancel-btn {
          padding: 8px 18px; border-radius: 8px; border: 1.5px solid #ddd;
          background: #fff; color: #555; font-weight: 600; font-size: 13px;
          cursor: pointer; font-family: inherit;
        }
        .clinical-save-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 8px; border: none;
          color: #fff; font-weight: 700; font-size: 13px;
          cursor: pointer; font-family: inherit; transition: filter 0.15s;
        }
        .clinical-save-btn:hover { filter: brightness(1.1); }

        /* ✅ FIXED: Proper footer styling without conflicting inline styles */
        .cam-footer {
          padding: 14px 20px;
          border-top: 1px solid #ede7f6;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          background: #faf7ff;
          flex-shrink: 0;  /* ✅ Footer doesn't shrink */
        }

        /* confirm button in footer */
        .cam-confirm-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 22px; border-radius: 8px; border: none;
          background: #15803d; color: #fff; font-weight: 700; font-size: 13px;
          cursor: pointer; font-family: inherit; transition: background 0.18s;
        }
        .cam-confirm-btn:hover { background: #166534; }

        .cam-cancel-btn {
          padding: 9px 20px; border-radius: 8px; border: 1.5px solid #ddd;
          background: #fff; color: #555; font-weight: 600; font-size: 13px;
          cursor: pointer; font-family: inherit;
        }
      `}</style>

      {/* ── Overlay — same as DayAppointmentsModal ── */}
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* ── Header — matches DayAppointmentsModal header exactly ── */}
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Add Clinical Notes</h3>
            <div className={styles.modalHeaderRight}>
              <span className={styles.dateBadge}>{apptDateShort}</span>
              <button className={styles.closeBtn} onClick={onClose}>
                <FiX />
              </button>
            </div>
          </div>

          {/* ── Scroll body ✅ FIXED: Proper flex layout ── */}
          <div className={styles.scrollBody}>
            {/* Appointment info card — same card style as DayAppointmentsModal */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>Appointment Information</div>
              <div className={styles.cardBody}>
                <div className={styles.cardFields}>
                  <div className={styles.infoRow}>
                    <span
                      className={styles.infoLabel}
                      style={{ minWidth: 190 }}
                    >
                      Name:
                    </span>
                    <span className={styles.infoValue}>
                      {appt.patientName || "—"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span
                      className={styles.infoLabel}
                      style={{ minWidth: 190 }}
                    >
                      Appointment Date:
                    </span>
                    <span className={styles.infoValue}>
                      {apptDate} | {startTime} – {endTime}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span
                      className={styles.infoLabel}
                      style={{ minWidth: 190 }}
                    >
                      Clinic:
                    </span>
                    <span className={styles.infoValue}>{clinicType}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Clinical notes section */}
            <section className={styles.card} style={{ padding: "16px 20px" }}>
              <ClinicalNotesSection />
            </section>
          </div>

          {/* ── Footer ✅ FIXED: Proper CSS class instead of inline styles ── */}
          <div className="cam-footer">
            <button className="cam-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="cam-confirm-btn" onClick={handleConfirm}>
              <FiCheck size={14} /> Mark as Completed
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompleteAppointmentModal;
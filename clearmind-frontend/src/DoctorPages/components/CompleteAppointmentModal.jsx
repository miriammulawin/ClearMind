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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        /* ── Tab Bar ── */
        .cn-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          width: 100%;
        }
        .cn-tab-btn {
          flex: 1;
          min-width: clamp(80px, 20vw, 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: clamp(6px, 1.2vw, 8px) clamp(8px, 1.5vw, 12px);
          border-radius: 10px;
          border: 1.5px solid #e2d5f5;
          background: #faf7ff;
          color: #777;
          font-size: clamp(11px, 1.4vw, 12.5px);
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          font-family: 'Poppins', sans-serif;
        }
        .cn-tab-btn:hover {
          border-color: #9b6bbf;
          color: #4D227C;
        }
        .cn-tab-count {
          padding: 1px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
        }
        .cn-add-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: clamp(7px, 1.2vw, 8px) clamp(12px, 2vw, 16px);
          border-radius: 10px;
          border: none;
          color: #fff;
          font-size: clamp(11px, 1.4vw, 13px);
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: filter 0.15s, transform 0.1s;
          font-family: 'Poppins', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .cn-add-btn:hover {
          filter: brightness(1.1);
        }
        .cn-add-btn:active {
          transform: translateY(1px);
        }

        /* ── Entries Container ── */
        .cn-entries {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 340px;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 4px;
        }
        .cn-entries::-webkit-scrollbar { width: 5px; }
        .cn-entries::-webkit-scrollbar-track { background: #f0eaf8; border-radius: 10px; }
        .cn-entries::-webkit-scrollbar-thumb { background: #4D227C; border-radius: 10px; }
        .cn-entries { scrollbar-color: #4D227C #f0eaf8; scrollbar-width: thin; }

        /* ── Entry Card ── */
        .cn-entry-card {
          border-radius: 12px;
          border: 1px solid #ede5f7;
          border-left-width: 4px;
          padding: 14px 16px;
          background: #fdfcff;
          flex-shrink: 0;
          box-shadow: 0 1px 6px rgba(77,34,124,0.05);
        }
        .cn-entry-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 10px;
        }
        .cn-entry-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          align-items: center;
        }
        .cn-entry-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
        }
        .cn-entry-date,
        .cn-entry-author {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #9ca3af;
          font-family: 'Poppins', sans-serif;
        }
        .cn-entry-actions {
          display: flex;
          gap: 5px;
          flex-shrink: 0;
        }
        .cn-action-btn {
          padding: 5px 7px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background 0.14s;
        }
        .cn-edit-btn   { background: #f0e8ff; color: #4D227C; }
        .cn-edit-btn:hover   { background: #e0d4f5; }
        .cn-delete-btn { background: #fff0f0; color: #e53e3e; }
        .cn-delete-btn:hover { background: #ffe0e0; }

        .cn-entry-content {
          font-size: 13px;
          color: #374151;
          line-height: 1.7;
          margin: 0;
          white-space: pre-wrap;
          font-family: 'Poppins', sans-serif;
        }

        /* ── Empty State ── */
        .cn-empty {
          text-align: center;
          padding: 32px 20px;
          color: #bbb;
          border: 1.5px dashed #e0d4f5;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .cn-empty p { margin: 0; font-size: 13px; font-family: 'Poppins', sans-serif; }

        /* ── Add/Edit sub-modal ── */
        .cn-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.60);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 12000;
          padding: 20px;
          box-sizing: border-box;
        }
        .cn-modal {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 520px;
          box-shadow: 0 24px 64px rgba(77,34,124,0.25);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: cnModalIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes cnModalIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cn-modal-header {
          padding: 18px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cn-modal-header-title {
          margin: 0;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          font-family: 'Poppins', sans-serif;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .cn-modal-close {
          background: rgba(255,255,255,0.18);
          border: none;
          color: #fff;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .cn-modal-close:hover { background: rgba(255,255,255,0.30); }
        .cn-modal-body {
          padding: 20px 24px;
          background: #f5f0fb;
        }
        .cn-form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #4D227C;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 8px;
          font-family: 'Poppins', sans-serif;
        }
        .cn-textarea {
          width: 100%;
          min-height: 140px;
          padding: 12px 14px;
          border: 1.5px solid #e2d5f5;
          border-radius: 10px;
          font-size: 13.5px;
          color: #333;
          line-height: 1.6;
          resize: vertical;
          box-sizing: border-box;
          outline: none;
          font-family: 'Poppins', sans-serif;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #fff;
        }
        .cn-textarea:focus {
          border-color: #4D227C;
          box-shadow: 0 0 0 3px rgba(77,34,124,0.1);
        }
        .cn-modal-footer {
          padding: 14px 22px;
          border-top: 2px solid #ede5f7;
          background: #fff;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .cn-cancel-btn {
          padding: 9px 20px;
          border-radius: 10px;
          border: 1.5px solid #e2d5f5;
          background: #f0ebf7;
          color: #4D227C;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          transition: background 0.2s, color 0.2s;
        }
        .cn-cancel-btn:hover { background: #4D227C; color: #fff; }
        .cn-save-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 20px;
          border-radius: 10px;
          border: none;
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          transition: filter 0.15s, transform 0.1s;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .cn-save-btn:hover { filter: brightness(1.1); }
        .cn-save-btn:active { transform: translateY(1px); }

        @media (max-width: 480px) {
          .cn-tabs { flex-direction: column; }
          .cn-tab-btn { flex: none; width: 100%; }
          .cn-add-btn { width: 100%; justify-content: center; }
        }
        @media (max-width: 360px) {
          .cn-tab-btn span:not(.cn-tab-count) { display: none; }
        }
      `}</style>

      {/* Add button — above tabs, left-aligned */}
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
              className="cn-entry-card"
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
                    onClick={() => handleEdit(entry)}
                    title="Edit"
                  >
                    <FiEdit3 size={13} />
                  </button>
                  <button
                    className="cn-action-btn cn-delete-btn"
                    onClick={() => handleDelete(entry.id)}
                    title="Delete"
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
              <button className="cn-cancel-btn" onClick={closeForm}>
                Cancel
              </button>
              <button
                className="cn-save-btn"
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
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CompleteAppointmentModal
   ✅ Fully matches CreateAppointmentModal design language
───────────────────────────────────────────────────────────────── */
function CompleteAppointmentModal({ isOpen, onClose, appt, onConfirm }) {
  if (!isOpen || !appt) return null;

  const isOnline = appt.title?.toLowerCase().includes("online");
  const clinicType = isOnline ? "Online Clinic" : "Physical Clinic";
  const startTime = toTime12(appt.start);
  const endTime = toTime12(appt.end);
  const apptDate = format(new Date(appt.start), "MMMM dd, yyyy");
  const apptDateShort = format(new Date(appt.start), "MMMM dd, yyyy");

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        /* ── CAM Footer ── */
        .cam-footer {
          flex-shrink: 0;
          border-top: 2px solid #ede5f7;
          padding: 16px 24px;
          background: #fff;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          border-radius: 0 0 16px 16px;
          font-family: 'Poppins', sans-serif;
        }
        .cam-cancel-btn {
          background: #f0ebf7;
          color: #4D227C;
          border: 2px solid #c9b8f0;
          padding: 11px 22px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .cam-cancel-btn:hover {
          background: #4D227C;
          color: #fff;
          border-color: #4D227C;
        }
        .cam-confirm-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 26px;
          border-radius: 10px;
          border: 2px solid #15803d;
          background: #15803d;
          color: #fff;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          transition: background 0.2s, color 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 14px rgba(21,128,61,0.3);
        }
        .cam-confirm-btn:hover {
          background: #fff;
          color: #15803d;
        }
        .cam-confirm-btn:active { transform: translateY(1px); }

        @media (max-width: 768px) {
          .cam-footer {
            padding: 14px 16px;
            border-radius: 0 0 12px 12px;
            flex-direction: column-reverse;
            gap: 8px;
          }
          .cam-cancel-btn,
          .cam-confirm-btn {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
        }
      `}</style>

      {/* Overlay — matches DayAppointmentsModal */}
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header — purple, Poppins, matches CreateAppointmentModal exactly */}
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Add Clinical Notes</h3>
            <div className={styles.modalHeaderRight}>
              <span className={styles.dateBadge}>{apptDateShort}</span>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* Scrollable body — purple #f5f0fb bg */}
          <div className={styles.scrollBody}>
            {/* ── Appointment info card ── */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>Appointment Information</div>
              <div className={styles.cardBody}>
                <div className={styles.cardFields}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Patient Name:</span>
                    <span className={styles.infoValue}>
                      {appt.patientName || "—"}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Appointment Date:</span>
                    <span className={styles.infoValue}>
                      {apptDate} | {startTime} – {endTime}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Clinic:</span>
                    <span className={styles.infoValue}>{clinicType}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Clinical Notes card ── */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>Clinical Notes</div>
              <div style={{ padding: "16px 20px" }}>
                <ClinicalNotesSection />
              </div>
            </section>
          </div>

          {/* Footer — matches CreateAppointmentModal footer */}
          <div className="cam-footer">
            <button className="cam-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="cam-confirm-btn" onClick={handleConfirm}>
              <FiCheck size={15} /> Mark as Completed
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompleteAppointmentModal;

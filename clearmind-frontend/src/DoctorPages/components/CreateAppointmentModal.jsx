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

<<<<<<< HEAD
/* ── Patient Dropdown ── */
function PatientDropdown({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  const filtered = PATIENT_LIST.filter((p) =>
    `${p.firstName} ${p.mi}. ${p.lastName}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (patient) => {
    setSelected(patient);
    setQuery("");
    setOpen(false);
    if (onSelect) onSelect(patient);
  };

  const displayName = selected
    ? `${selected.firstName} ${selected.mi}. ${selected.lastName}`
    : "";

  const triggerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 13px",
    borderRadius: "9px",
    border: open ? "1.5px solid #4D227C" : "1.5px solid #e2d5f5",
    fontSize: "13px",
    backgroundColor: "#fff",
    cursor: "pointer",
    color: selected ? "#333" : "#aaa",
    boxSizing: "border-box",
    userSelect: "none",
    fontFamily: "inherit",
    boxShadow: open ? "0 0 0 3px rgba(77,34,124,0.1)" : "none",
    transition: "border 0.2s, box-shadow 0.2s",
  };

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div onClick={() => setOpen((o) => !o)} style={triggerStyle}>
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayName || "Select Patient Name"}
        </span>
        <FiChevronDown
          style={{
            flexShrink: 0,
            marginLeft: 8,
            color: "#4D227C",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #e0d4f5",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(77,34,124,0.14)",
            zIndex: 99999,
            overflow: "hidden",
            fontFamily: "inherit",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid #f0eaf8",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FiSearch style={{ color: "#aaa", flexShrink: 0 }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient…"
              style={{
                border: "none",
                outline: "none",
                fontSize: "13px",
                width: "100%",
                color: "#333",
                backgroundColor: "transparent",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "14px 16px",
                  color: "#aaa",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                No patients found
              </div>
            ) : (
              filtered.map((p) => {
                const isActive = selected?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    style={{
                      padding: "10px 16px",
                      fontSize: "13px",
                      cursor: "pointer",
                      color: isActive ? "#4D227C" : "#333",
                      fontWeight: isActive ? "600" : "400",
                      backgroundColor: isActive ? "#f3ecfc" : "transparent",
                      transition: "background 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.backgroundColor = "#faf7ff";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "#4D227C",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "700",
                        flexShrink: 0,
                      }}
                    >
                      {p.firstName[0]}
                      {p.lastName[0]}
                    </div>
                    <span style={{ lineHeight: 1.3 }}>
                      {p.firstName} {p.mi}. {p.lastName}
                    </span>
                    {isActive && (
                      <span
                        style={{
                          marginLeft: "auto",
                          color: "#4D227C",
                          fontSize: "16px",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   Receipt Full-View Modal
══════════════════════════════════════ */
function ReceiptModal({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        className="appointment-modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "480px", width: "100%" }}
      >
        <div className="modal-header">
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FiX />
          </button>
        </div>

        <div style={{ overflowY: "auto", maxHeight: "65vh" }}>
          <img
            src={src}
            alt="Payment Receipt"
            style={{
              width: "100%",
              display: "block",
              objectFit: "contain",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
          <div
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "10px",
              padding: "48px 24px",
              backgroundColor: "#f3ecfc",
              color: "#4D227C",
            }}
          >
            <span style={{ fontSize: "40px" }}>🧾</span>
            <span style={{ fontWeight: "600" }}>Receipt image not found</span>
            <span style={{ fontSize: "12px", color: "#aaa" }}>
              Check assets/payment/images.png
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-add" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   Main CreateAppointmentModal Component
══════════════════════════════════════ */
function CreateAppointmentModal({ isOpen, onClose, onAdd }) {
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [dob, setDob] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [assessmentPurpose, setAssessmentPurpose] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showReceiptDropdown, setShowReceiptDropdown] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const receiptInputRef = useRef(null);
=======
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
>>>>>>> c74f280d2ba6540f658a249cc8ef59ef48257997

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

<<<<<<< HEAD
  /* ── Shared styles ── */
  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    color: "#333",
    backgroundColor: "#fff",
  };

  const selectStyle = { ...inputStyle, cursor: "pointer" };

  const sectionLabelStyle = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#4D227C",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: "0 0 8px 0",
  };

  const radioGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  };

  const radioLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#444",
    cursor: "pointer",
    margin: 0,
  };

  const radioInputStyle = {
    width: "15px",
    height: "15px",
    accentColor: "#4D227C",
    cursor: "pointer",
    margin: 0,
    flexShrink: 0,
  };

  const LabeledInput = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "#4D227C",
          marginBottom: "4px",
          textTransform: "uppercase",
          letterSpacing: "0.4px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
=======
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormValue(entry.content);
    setShowAddModal(true);
  };
>>>>>>> c74f280d2ba6540f658a249cc8ef59ef48257997

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
<<<<<<< HEAD
      {/* ── Appointment Modal Backdrop ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <div className="appointment-modal-lg">
          {/* ── Header ── */}
          <div className="modal-header">
            <h2>New Appointment</h2>
            <span className="modal-date">
              {newEvent.date
                ? format(new Date(newEvent.date), "MMMM d, yyyy")
                : format(new Date(), "MMMM d, yyyy")}
            </span>
            <button
              className="close-btn"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FiX />
            </button>
          </div>

          <div className="modal-body">
            {/* ── PATIENT INFORMATION ── */}
            <div className="modal-section">
              <h4>Patient Information</h4>

              <div className={styles.fieldRow}>
                <input
                  className={styles.input}
                  placeholder="Reason for Consultation"
                />
              </div>

              <div className={styles.fieldRow}>
                <PatientDropdown
                  onSelect={(p) => console.log("Selected:", p)}
                />
              </div>

              <div className={styles.grid2}>
                <input
                  className={styles.input}
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                <input
                  style={{
                    ...inputStyle,
                    cursor: "not-allowed",
                    transition: "all 0.3s ease",
                  }}
                  type="text"
                  disabled
                  readOnly
                  value={computedAge !== "" ? `${computedAge} years old` : ""}
                  placeholder="Age"
                />
              </div>

              <div className={styles.grid3}>
                <select className={styles.select}>
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input
                  className={styles.input}
                  placeholder="Patient Contact No."
                />
                <select className={styles.select}>
                  <option value="">Civil Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="annulled">Annulled</option>
                  <option value="separated">Separated</option>
                  <option value="widow">Widow / Widower</option>
                  <option value="living-in">Living-In</option>
                </select>
              </div>

              <div className={styles.grid2}>
                <input
                  className={styles.input}
                  placeholder="Full Name of Informant (if not the client)"
                />
                <input
                  className={styles.input}
                  placeholder="Relation to the Patient"
                />
              </div>

              <div className={styles.fieldRow}>
                <input className={styles.input} placeholder="Address" />
              </div>

              {/* Radio groups */}
              <div style={{ display: "flex", gap: "48px" }}>
                <div className="mt-2">
                  <p style={sectionLabelStyle}>Patient Type</p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "20px",
                    }}
                  >
                    <label style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="ptype"
                        value="existing"
                        style={radioInputStyle}
                      />
                      Existing Patient
                    </label>
                    <label style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="ptype"
                        value="new"
                        style={radioInputStyle}
                      />
                      New Patient
                    </label>
                  </div>
                </div>
                <div className="mt-2">
                  <p style={sectionLabelStyle}>Patient Classification</p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "20px",
                    }}
                  >
                    <label style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="class"
                        value="pwd"
                        style={radioInputStyle}
                      />
                      PWD
                    </label>
                    <label style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="class"
                        value="senior"
                        style={radioInputStyle}
                      />
                      Senior Citizen
                    </label>
                    <label style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="class"
                        value="regular"
                        style={radioInputStyle}
                      />
                      Regular
                    </label>
=======
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        /* ── Tab Bar ── */
        .cn-tab-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .cn-tabs {
          display: flex;
          flex: 1;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cn-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1.5px solid #e2d5f5;
          background: #faf7ff;
          color: #777;
          font-size: 12.5px;
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
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 10px;
          border: none;
          color: #fff;
          font-size: 13px;
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
          .cn-tab-bar { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      {/* Tab Bar */}
      <div className="cn-tab-bar">
        <div className="cn-tabs">
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

        <button
          className="cn-add-btn"
          style={{ background: currentTab.color }}
          onClick={openAdd}
        >
          <FiPlus size={14} /> Add {currentTab.label}
        </button>
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
>>>>>>> c74f280d2ba6540f658a249cc8ef59ef48257997
                  </div>
                </div>
              </div>
            </section>

<<<<<<< HEAD
            {/* ▸ Consultation Schedule */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Consultation Schedule</h4>

              <div className={styles.grid3}>
                <LabeledInput label="Date">
                  <input
                    className={styles.input}
                    type="date"
                    value={newEvent.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                </LabeledInput>
                <LabeledInput label="Start Time">
                  <input
                    className={styles.input}
                    type="time"
                    value={newEvent.startTime}
                    onChange={handleStartTimeChange}
                  />
                </LabeledInput>
                <LabeledInput label="End Time">
                  <input
                    style={{
                      ...inputStyle,
                      cursor: "not-allowed",
                      transition: "all 0.3s ease",
                    }}
                    type="time"
                    value={newEvent.endTime}
                    readOnly
                    placeholder="--:--"
                  />
                </LabeledInput>
              </div>

              <div
                className={styles.radioGroup}
                style={{ marginBottom: "14px" }}
              >
                <p className={styles.radioGroupLabel}>Consultation Mode</p>
                <div className={styles.radioRow}>
                  <label style={radioLabelStyle}>
                    <input
                      type="radio"
                      name="visit"
                      value="onsite"
                      style={radioInputStyle}
                    />
                    Onsite Consultation
                  </label>
                  <label style={radioLabelStyle}>
                    <input
                      type="radio"
                      name="visit"
                      value="virtual"
                      style={radioInputStyle}
                    />
                    Virtual Consultation
                  </label>
                </div>
              </div>

              <hr className={styles.divider} />

              {/* Service Type Selection */}
              <div
                className={styles.radioGroup}
                style={{ marginBottom: "14px" }}
              >
                <p style={sectionLabelStyle}>Service Type</p>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="serviceType"
                    value="counseling"
                    style={radioInputStyle}
                    checked={serviceType === "counseling"}
                    onChange={() => setServiceType("counseling")}
                  />
                  Counseling / Therapy
                </label>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="serviceType"
                    value="assessment"
                    style={radioInputStyle}
                    checked={serviceType === "assessment"}
                    onChange={() => setServiceType("assessment")}
                  />
                  Psychological Assessment and Evaluation
                </label>
              </div>

              <LabeledInput label="Purpose of Assessment">
                <select
                  className={styles.select}
                  disabled={serviceType !== "assessment"}
                  value={assessmentPurpose}
                  onChange={(e) => setAssessmentPurpose(e.target.value)}
                  style={{
                    opacity: serviceType === "assessment" ? 1 : 0.4,
                    cursor:
                      serviceType === "assessment" ? "pointer" : "not-allowed",
                  }}
                >
                  <option value="">Select Purpose of Assessment</option>
                  <option value="VAWC">VAWC</option>
                  <option value="Adoption or Legal">Adoption or Legal</option>
                  <option value="School / Academic Support">
                    School / Academic Support
                  </option>
                  <option value="Work-Related">Work-Related</option>
                </select>
              </LabeledInput>
            </div>

            {/* ▸ Payment Status */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Payment Status</h4>

              <div className={styles.fieldRow}>
                <select className={styles.select}>
                  <option value="">Select Payment Status</option>
                  <option value="paid">Paid</option>
                  <option value="not_paid">Not Paid</option>
                  <option value="probono">Probono</option>
                </select>
              </div>

              {/* ── Upload Receipt ── */}
              {showReceipt && (
                <>
                  <div className={styles.uploadLabel}>Upload Receipt</div>
                  <div
                    className={styles.uploadZone}
                    onClick={() => receiptInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) setReceiptFile(file);
                    }}
                  >
                    <input
                      ref={receiptInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setReceiptFile(file);
                      }}
                    />
                    {receiptFile ? (
                      <div className={styles.uploadedFile}>
                        <FiFile className={styles.uploadedFileIcon} />
                        <span className={styles.uploadedFileName}>
                          {receiptFile.name}
                        </span>
                        <button
                          className={styles.uploadedFileRemove}
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptFile(null);
                            if (receiptInputRef.current)
                              receiptInputRef.current.value = "";
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ) : (
                      <div className={styles.uploadPlaceholder}>
                        <FiUpload className={styles.uploadIcon} />
                        <span className={styles.uploadText}>
                          Click or drag &amp; drop to upload receipt
                        </span>
                        <span className={styles.uploadHint}>
                          Supports JPG, PNG, PDF
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="modal-footer">
            <button className="btn-add" onClick={handleAdd}>
              Add Appointment
=======
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
>>>>>>> c74f280d2ba6540f658a249cc8ef59ef48257997
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CompleteAppointmentModal;

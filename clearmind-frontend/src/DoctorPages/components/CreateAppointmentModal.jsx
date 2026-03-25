import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  FiX,
  FiChevronDown,
  FiSearch,
  FiUpload,
  FiFile,
  FiTrash2,
  FiCheck,
  FiChevronRight,
} from "react-icons/fi";
import styles from "../DoctorStyle/CreateAppointmentModal.module.css";

/* ─────────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────────── */
const PATIENT_LIST = [
  { id: 1, firstName: "Maria", lastName: "Santos", mi: "C" },
  { id: 2, firstName: "Juan", lastName: "dela Cruz", mi: "R" },
  { id: 3, firstName: "Ana", lastName: "Reyes", mi: "L" },
  { id: 4, firstName: "Carlo", lastName: "Mendoza", mi: "B" },
  { id: 5, firstName: "Lucia", lastName: "Garcia", mi: "T" },
  { id: 6, firstName: "Mark", lastName: "Torres", mi: "A" },
  { id: 7, firstName: "Sofia", lastName: "Flores", mi: "M" },
  { id: 8, firstName: "Jose", lastName: "Villanueva", mi: "P" },
];

const SERVICES = [
  {
    id: "0",
    title: "Psychotherapy and Counseling",
    description: "",
  },
  {
    id: "1",
    title: "Psychological Assessment and Evaluation",
    description: "",
  },
];

const PAE_SERVICES = [
  { id: "0", title: "VAWC Purpose", description: "", available: true },
  {
    id: "1",
    title: "Adoption or Other Legal Purposes",
    description: "",
    available: true,
  },
  {
    id: "2",
    title: "School / Academic Support",
    description: "",
    available: true,
  },
  { id: "3", title: "Work-related Purpose", description: "", available: true },
  {
    id: "4",
    title: "Pre-Employment Purpose",
    description: "",
    available: true,
  },
  {
    id: "5",
    title: "Emotional Support Animal (ESA) Certification",
    description: "",
    available: true,
  },
  {
    id: "6",
    title: "Mental Health Certification",
    description: "",
    available: true,
  },
];

/* ─────────────────────────────────────────────────────────────────
   PatientDropdown
───────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────
   ServiceCard — matches screenshot design exactly
───────────────────────────────────────────────────────────────── */
function ServiceCard({ service, selected, onClick, accent = "#4D227C" }) {
  const isSelected = selected === service.id;
  return (
    <div
      onClick={() => onClick(service.id)}
      style={{
        border: isSelected ? `2px solid ${accent}` : "1.5px solid #ddd",
        borderRadius: "10px",
        padding: "14px 16px",
        cursor: "pointer",
        background: isSelected ? "#f5f0fb" : "#fff",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        position: "relative",
      }}
    >
      {/* Radio circle */}
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: isSelected ? `6px solid ${accent}` : "2px solid #bbb",
          flexShrink: 0,
          background: "#fff",
          transition: "all 0.15s",
          boxSizing: "border-box",
        }}
      />

      {/* Title only */}
      <span
        style={{
          fontSize: "13.5px",
          fontWeight: "400",
          color: "#555",
          fontFamily: "inherit",
          flex: 1,
        }}
      >
        {service.title}
      </span>

      {/* Check badge — only when selected */}
      {isSelected && (
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FiCheck size={12} color="#fff" />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CreateAppointmentModal
───────────────────────────────────────────────────────────────── */
function CreateAppointmentModal({
  isOpen,
  onClose,
  onAdd,
  showReceipt = false,
}) {
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [dob, setDob] = useState("");
  const [selectedService, setSelectedService] = useState(null); // "0" | "1"
  const [selectedPAE, setSelectedPAE] = useState(null); // PAE sub id
  const [showPAEPanel, setShowPAEPanel] = useState(false); // collapse after selection
  const [receiptFile, setReceiptFile] = useState(null);
  const receiptInputRef = useRef(null);

  const isPAE = selectedService === "1";

  /* Auto-compute age */
  const computedAge = (() => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : "";
  })();

  /* Auto end time = start + 1 hr */
  const handleStartTimeChange = (e) => {
    const startTime = e.target.value;
    let endTime = "";
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number);
      endTime = `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    setNewEvent({ ...newEvent, startTime, endTime });
  };

  const handleServiceSelect = (id) => {
    setSelectedService(id);
    if (id !== "1") {
      setSelectedPAE(null);
      setShowPAEPanel(false);
    } else {
      setShowPAEPanel(true); // open panel when PAE selected
    }
  };

  const handlePAESelect = (id) => {
    setSelectedPAE(id);
    setShowPAEPanel(false); // close panel after selection
  };

  const handleAdd = () => {
    if (
      !newEvent.title ||
      !newEvent.date ||
      !newEvent.startTime ||
      !newEvent.endTime
    ) {
      alert("Please complete all required fields");
      return;
    }
    const start = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const end = new Date(`${newEvent.date}T${newEvent.endTime}`);
    onAdd({ title: newEvent.title, start, end, allDay: false });
    onClose();
    setNewEvent({ title: "", date: "", startTime: "", endTime: "" });
    setDob("");
    setSelectedService(null);
    setSelectedPAE(null);
    setShowPAEPanel(false);
    setReceiptFile(null);
  };

  const LabeledInput = ({ label, disabled, children }) => (
    <div className={styles.labeledField}>
      <span
        className={`${styles.fieldLabel} ${disabled ? styles.fieldLabelDisabled : ""}`}
      >
        {label}
      </span>
      {children}
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .tos-label {
          font-size: 11px;
          font-weight: 700;
          color: #4D227C;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          margin: 0 0 10px;
          font-family: inherit;
        }
        .tos-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        /* PAE sub-panel — matches screenshot light blue box */
        .tos-pae-panel {
          margin-top: 10px;
          padding: 14px;
          background: #e8f4fb;
          border: 1.5px solid #c5dff0;
          border-radius: 10px;
          animation: paeSlideIn 0.2s ease;
        }
        @keyframes paeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tos-pae-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          color: #1d6fa4;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          margin: 0 0 10px;
          font-family: inherit;
        }
        .tos-pae-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 280px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .tos-pae-cards::-webkit-scrollbar { width: 6px; }
        .tos-pae-cards::-webkit-scrollbar-track { background: #d0e8f5; border-radius: 10px; }
        .tos-pae-cards::-webkit-scrollbar-thumb { background: #4D227C; border-radius: 10px; }
        .tos-pae-cards { scrollbar-color: #4D227C #d0e8f5; scrollbar-width: thin; }
        /* PAE cards get white bg inside the blue panel */
        .tos-pae-cards > div {
          background: #fff !important;
        }
      `}</style>

      <div className={styles.backdrop}>
        <div className={styles.modal}>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.headerTitle}>Create Appointment</h2>
            <div className={styles.headerRight}>
              <span className={styles.headerDate}>
                {newEvent.date
                  ? format(new Date(newEvent.date + "T00:00:00"), "MMM d, yyyy")
                  : format(new Date(), "MMM d, yyyy")}
              </span>
              <button className={styles.closeBtn} onClick={onClose}>
                <FiX />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className={styles.body}>
            {/* ▸ Patient Information */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Patient Information</h4>

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
                  className={styles.input}
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
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <input
                  className={styles.input}
                  placeholder="Patient Contact No."
                />
                <select className={styles.select}>
                  <option value="">Civil Status</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Annulled</option>
                  <option>Separated</option>
                  <option>Widow / Widower</option>
                  <option>Living-In</option>
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

              <div className={styles.radioSection}>
                <div className={styles.radioGroup}>
                  <p className={styles.radioGroupLabel}>Patient Type</p>
                  <div className={styles.radioRow}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="ptype"
                        value="existing"
                        className={styles.radioInput}
                      />{" "}
                      Existing Patient
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="ptype"
                        value="new"
                        className={styles.radioInput}
                      />{" "}
                      New Patient
                    </label>
                  </div>
                </div>
                <div className={styles.radioGroup}>
                  <p className={styles.radioGroupLabel}>
                    Patient Classification
                  </p>
                  <div className={styles.radioRow}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="class"
                        value="pwd"
                        className={styles.radioInput}
                      />{" "}
                      PWD
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="class"
                        value="senior"
                        className={styles.radioInput}
                      />{" "}
                      Senior Citizen
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="class"
                        value="regular"
                        className={styles.radioInput}
                      />{" "}
                      Regular
                    </label>
                  </div>
                </div>
              </div>
            </div>

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
                <LabeledInput label="End Time" disabled>
                  <input
                    className={styles.input}
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
                <p className={styles.radioGroupLabel}>Visit Type</p>
                <div className={styles.radioRow}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="visit"
                      value="onsite"
                      className={styles.radioInput}
                    />{" "}
                    Onsite Consultation
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="visit"
                      value="virtual"
                      className={styles.radioInput}
                    />{" "}
                    Virtual Consultation
                  </label>
                </div>
              </div>

              <hr className={styles.divider} />

              {/* ── Type of Service ── */}
              <p className="tos-label">Type of Service</p>
              <div className="tos-cards">
                {SERVICES.map((svc) => (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    selected={selectedService}
                    onClick={handleServiceSelect}
                    accent="#4D227C"
                  />
                ))}
              </div>

              {/* ── PAE Purpose sub-panel (animated slide-in) ── */}
              {isPAE && showPAEPanel && (
                <div className="tos-pae-panel">
                  <p className="tos-pae-header">
                    <FiChevronRight size={13} /> Purpose of Assessment
                  </p>
                  <div className="tos-pae-cards">
                    {PAE_SERVICES.map((pae) => (
                      <ServiceCard
                        key={pae.id}
                        service={pae}
                        selected={selectedPAE}
                        onClick={handlePAESelect}
                        accent="#1d6fa4"
                      />
                    ))}
                  </div>
                </div>
              )}
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

          {/* Footer */}
          <div className={styles.footer}>
            <button className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.btnAdd} onClick={handleAdd}>
              Add Appointment
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateAppointmentModal;

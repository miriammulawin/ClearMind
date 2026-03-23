import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  FiX,
  FiChevronDown,
  FiSearch,
  FiUpload,
  FiFile,
  FiTrash2,
} from "react-icons/fi";
import styles from "../DoctorStyle/CreateAppointmentModal.module.css";

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

  /* Auto-compute age from DOB */
  const computedAge = (() => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : "";
  })();

  /* Auto-set end time to start + 1 hour */
  const handleStartTimeChange = (e) => {
    const startTime = e.target.value;
    let endTime = "";
    if (startTime) {
      const [h, m] = startTime.split(":").map(Number);
      endTime = `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    setNewEvent({ ...newEvent, startTime, endTime });
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
    setServiceType("");
    setAssessmentPurpose("");
    setReceiptFile(null);
  };

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

  if (!isOpen) return null;

  return (
    <>
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
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateAppointmentModal;

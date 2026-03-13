import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { FiX, FiChevronDown, FiSearch } from "react-icons/fi";
import receiptImage from "../../assets/payment/images.png";

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

/* ── Patient Dropdown ─────────────────────────────────────────────────────── */
function PatientDropdown({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  const filtered = PATIENT_LIST.filter((p) => {
    const full = `${p.firstName} ${p.mi}. ${p.lastName}`.toLowerCase();
    return full.includes(query.toLowerCase());
  });

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

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 12px",
          borderRadius: "8px",
          border: open ? "1.5px solid #4D227C" : "1px solid #ddd",
          fontSize: "13px",
          backgroundColor: "#fff",
          cursor: "pointer",
          color: selected ? "#333" : "#999",
          boxSizing: "border-box",
          userSelect: "none",
          transition: "border 0.2s",
        }}
      >
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
            boxShadow: "0 8px 24px rgba(77,34,124,0.12)",
            zIndex: 99999,
            overflow: "hidden",
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
                    <div>
                      <div style={{ lineHeight: 1.3 }}>
                        {p.firstName} {p.mi}. {p.lastName}
                      </div>
                    </div>
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

/* ── Receipt Full-View Modal ──────────────────────────────────────────────── */
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
      }}
    >
      <div
        className="appointment-modal-lg"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
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
        <div style={{ overflowY: "auto", flex: 1 }}>
          <img
            src={src}
            alt="Payment Receipt"
            style={{ width: "100%", display: "block", objectFit: "contain" }}
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

/* ── Main CreateAppointmentModal ──────────────────────────────────────────── */
function CreateAppointmentModal({ isOpen, onClose, onAdd }) {
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [dob, setDob] = useState("");
  const [showReceiptDropdown, setShowReceiptDropdown] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [serviceType, setServiceType] = useState(""); // "counseling" | "assessment"
  const [assessmentPurpose, setAssessmentPurpose] = useState("");

  const receiptImageSrc = receiptImage;

  const computedAge = (() => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : "";
  })();

  const handleAdd = () => {
    if (
      !newEvent.title ||
      !newEvent.date ||
      !newEvent.startTime ||
      !newEvent.endTime
    ) {
      alert("Please complete all fields");
      return;
    }
    const start = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const end = new Date(`${newEvent.date}T${newEvent.endTime}`);
    onAdd({ title: newEvent.title, start, end, allDay: false });
    onClose();
    setNewEvent({ title: "", date: "", startTime: "", endTime: "" });
    setDob("");
    setShowReceiptDropdown(false);
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
      {/* ── Backdrop: fixed full-screen, centers the modal ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding:
            "32px 16px" /* 32px top & bottom = visible space above/below modal */,
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        {/* ── Modal shell: never taller than viewport minus the 64px padding ── */}
        <div
          className="appointment-modal-lg"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "800px",
            maxHeight:
              "calc(100vh - 64px)" /* viewport - (32px top + 32px bottom) */,
            overflow: "hidden",
            flexShrink: 0,
            margin:
              "auto" /* keeps it centered inside the scrollable backdrop */,
          }}
        >
          {/* ── Sticky header ────────────────────────────────────────────── */}
          <div className="modal-header" style={{ flexShrink: 0 }}>
            <h2 style={{ margin: 0, flex: 1, minWidth: 0 }}>
              Create Appointment
            </h2>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
              }}
            >
              <span
                className="modal-date"
                style={{
                  whiteSpace: "nowrap",
                  fontSize: "12px",
                  flexShrink: 0,
                }}
              >
                {newEvent.date
                  ? format(
                      new Date(newEvent.date + "T00:00:00"),
                      "MMMM d, yyyy",
                    )
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
                  flexShrink: 0,
                }}
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* ── Scrollable body ──────────────────────────────────────────── */}
          <div
            className="modal-body"
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              minHeight: 0 /* critical — lets flex child shrink */,
            }}
          >
            {/* ── PATIENT INFORMATION ── */}
            <div className="modal-section">
              <h4>Patient Information</h4>

              <div style={{ marginBottom: "8px" }}>
                <input
                  style={inputStyle}
                  placeholder="Reason for Consultation"
                />
              </div>

              <div style={{ marginBottom: "8px" }}>
                <PatientDropdown
                  onSelect={(patient) => console.log("Selected:", patient)}
                />
              </div>

              {/* DOB | Age */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <input
                  style={inputStyle}
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
                <input
                  style={{ ...inputStyle, cursor: "not-allowed" }}
                  type="text"
                  disabled
                  readOnly
                  value={computedAge !== "" ? `${computedAge} years old` : ""}
                  placeholder="Age"
                />
              </div>

              {/* Sex | Contact | Civil Status */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <select style={selectStyle}>
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input style={inputStyle} placeholder="Patient Contact No." />
                <select style={selectStyle}>
                  <option value="">Civil Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="annulled">Annulled</option>
                  <option value="separated">Separated</option>
                  <option value="widow">Widow / Widower</option>
                  <option value="living-in">Living-In</option>
                </select>
              </div>

              {/* Informant | Relation */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <input
                  style={inputStyle}
                  placeholder="Full Name of Informant (if not the client)"
                />
                <input
                  style={inputStyle}
                  placeholder="Relation to the Patient"
                />
              </div>

              {/* Address */}
              <div style={{ marginBottom: "12px" }}>
                <input style={inputStyle} placeholder="Address" />
              </div>

              {/* Radio groups — Patient Type & Classification */}
              <div
                style={{
                  display: "flex",
                  gap: "48px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                <div>
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
                      />{" "}
                      Existing Patient
                    </label>
                    <label style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="ptype"
                        value="new"
                        style={radioInputStyle}
                      />{" "}
                      New Patient
                    </label>
                  </div>
                </div>
                <div>
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
                      />{" "}
                      PWD
                    </label>
                    <label style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="class"
                        value="senior"
                        style={radioInputStyle}
                      />{" "}
                      Senior Citizen
                    </label>
                    <label style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="class"
                        value="regular"
                        style={radioInputStyle}
                      />{" "}
                      Regular
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Type of Service ── */}
              <div
                style={{ borderTop: "1px solid #f0eaf8", paddingTop: "14px" }}
              >
                <p style={sectionLabelStyle}>Type of Service</p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "24px",
                    marginBottom: "12px",
                  }}
                >
                  <label style={radioLabelStyle}>
                    <input
                      type="radio"
                      name="serviceType"
                      value="counseling"
                      style={radioInputStyle}
                      checked={serviceType === "counseling"}
                      onChange={() => {
                        setServiceType("counseling");
                        setAssessmentPurpose("");
                      }}
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

                {/* Purpose of Assessment — only enabled when assessment is selected */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: serviceType === "assessment" ? "#4D227C" : "#bbb",
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                      transition: "color 0.2s",
                    }}
                  >
                    Purpose of Assessment
                  </label>
                  <select
                    disabled={serviceType !== "assessment"}
                    value={assessmentPurpose}
                    onChange={(e) => setAssessmentPurpose(e.target.value)}
                    style={{
                      ...selectStyle,
                      opacity: serviceType === "assessment" ? 1 : 0.4,
                      cursor:
                        serviceType === "assessment"
                          ? "pointer"
                          : "not-allowed",
                      border:
                        serviceType === "assessment"
                          ? "1.5px solid #4D227C"
                          : "1px solid #ddd",
                      color: assessmentPurpose ? "#333" : "#999",
                      transition: "opacity 0.2s, border 0.2s",
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
                </div>
              </div>
            </div>

            {/* ── CONSULTATION SCHEDULE ── */}
            <div className="modal-section">
              <h4>Consultation Schedule</h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <LabeledInput label="Date">
                  <input
                    style={inputStyle}
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
                    style={inputStyle}
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => {
                      const startTime = e.target.value;
                      let endTime = "";
                      if (startTime) {
                        const [hours, minutes] = startTime
                          .split(":")
                          .map(Number);
                        const endHour = (hours + 1) % 24;
                        endTime = `${String(endHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
                      }
                      setNewEvent({ ...newEvent, startTime, endTime });
                    }}
                  />
                </LabeledInput>
                <LabeledInput label="End Time">
                  <input
                    style={{ ...inputStyle, cursor: "not-allowed" }}
                    type="time"
                    value={newEvent.endTime}
                    readOnly
                    placeholder="--:-- --"
                  />
                </LabeledInput>
              </div>

              <div>
                <p style={sectionLabelStyle}>Consultation Mode</p>
                <div style={{ display: "flex", gap: "24px" }}>
                  <label style={radioLabelStyle}>
                    <input
                      type="radio"
                      name="visit"
                      value="schedule"
                      style={radioInputStyle}
                    />{" "}
                    Onsite Consultation
                  </label>
                  <label style={radioLabelStyle}>
                    <input
                      type="radio"
                      name="visit"
                      value="virtual"
                      style={radioInputStyle}
                    />{" "}
                    Virtual Consultation
                  </label>
                </div>
              </div>
            </div>

            {/* ── PAYMENT STATUS ── */}
            <div className="modal-section">
              <h4>Payment Status</h4>

              {/* Receipt Dropdown Toggle */}
              <div style={{ marginBottom: "12px" }}>
                <div
                  onClick={() => setShowReceiptDropdown((prev) => !prev)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: showReceiptDropdown
                      ? "1.5px solid #4D227C"
                      : "1px solid #ddd",
                    fontSize: "13px",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    color: showReceiptDropdown ? "#4D227C" : "#999",
                    fontWeight: showReceiptDropdown ? "600" : "400",
                    boxSizing: "border-box",
                    userSelect: "none",
                    transition: "border 0.2s, color 0.2s",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    View Payment Receipt
                  </span>
                  <FiChevronDown
                    style={{
                      color: "#4D227C",
                      transform: showReceiptDropdown
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </div>

                {showReceiptDropdown && (
                  <div
                    style={{
                      marginTop: "8px",
                      borderRadius: "10px",
                      border: "1px solid #e0d4f5",
                      overflow: "hidden",
                      boxShadow: "0 4px 16px rgba(77,34,124,0.10)",
                      backgroundColor: "#faf7ff",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        maxHeight: "160px",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={receiptImageSrc}
                        alt="Receipt Preview"
                        style={{
                          width: "100%",
                          display: "block",
                          objectFit: "cover",
                          objectPosition: "top",
                          filter: "blur(1.5px) brightness(0.7)",
                          transform: "scale(1.03)",
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          onClick={() => setShowReceiptModal(true)}
                          style={{
                            padding: "8px 20px",
                            borderRadius: "20px",
                            border: "2px solid #fff",
                            backgroundColor: "rgba(77,34,124,0.85)",
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#4D227C";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "rgba(77,34,124,0.85)";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          View Full Receipt
                        </button>
                        <span
                          style={{
                            color: "rgba(255,255,255,0.75)",
                            fontSize: "11px",
                          }}
                        >
                          Click to view in full size
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Status Select */}
              <div>
                <select style={{ ...selectStyle, width: "100%" }}>
                  <option value="">Select Payment Status</option>
                  <option value="paid">Paid</option>
                  <option value="not_paid">Not Paid</option>
                  <option value="probono">Probono</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Sticky footer ─────────────────────────────────────────────── */}
          <div className="modal-footer" style={{ flexShrink: 0 }}>
            <button className="btn-add" onClick={handleAdd}>
              Add Appointment
            </button>
          </div>
        </div>
      </div>

      {/* ── Receipt Full-View Modal ── */}
      {showReceiptModal && (
        <ReceiptModal
          src={receiptImageSrc}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </>
  );
}

export default CreateAppointmentModal;

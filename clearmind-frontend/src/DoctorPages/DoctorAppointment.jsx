import { useState, useRef, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import "./DoctorStyle/DoctorAppointment.css";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiSearch,
  FiZoomIn,
} from "react-icons/fi";
import receiptImage from "../assets/payment/images.png";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/* ── Sample patient list ── */
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

/* ── Patient Dropdown Component ── */
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
      {/* Trigger */}
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

      {/* Dropdown panel */}
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
          {/* Search box */}
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

          {/* List */}
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
                    {/* Avatar */}
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

/* ── Image Lightbox ── */
function ImageLightbox({ src, onClose }) {
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes scaleIn{from{transform:scale(0.85);opacity:0}to{transform:scale(1);opacity:1}}`}</style>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "24px",
          background: "rgba(255,255,255,0.15)",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          color: "#fff",
          fontSize: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(4px)",
        }}
      >
        <FiX />
      </button>

      {/* Image */}
      <img
        src={src}
        alt="Payment Receipt"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          borderRadius: "16px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          objectFit: "contain",
          animation: "scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />

      <p
        style={{
          position: "absolute",
          bottom: "20px",
          color: "rgba(255,255,255,0.5)",
          fontSize: "12px",
          margin: 0,
        }}
      >
        Press ESC or click outside to close
      </p>
    </div>
  );
}

function DoctorAppointment() {
  const [activeMenu, setActiveMenu] = useState("Appointment");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [dob, setDob] = useState("");

  const computedAge = (() => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : "";
  })();

  const [events, setEvents] = useState([
    {
      title: "Online Clinic",
      start: new Date(2026, 0, 1, 9, 0),
      end: new Date(2026, 0, 1, 10, 0),
      allDay: false,
    },
    {
      title: "New Year's Day",
      start: new Date(2026, 0, 1),
      end: new Date(2026, 0, 1),
      allDay: true,
    },
    {
      title: "Physical Clinic",
      start: new Date(2026, 0, 5, 9, 0),
      end: new Date(2026, 0, 5, 10, 0),
      allDay: false,
    },
  ]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const [weeklySchedule, setWeeklySchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const [selectedDay, setSelectedDay] = useState("Monday");

  const handleAddEvent = () => {
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
    setEvents([
      ...events,
      { title: newEvent.title, start, end, allDay: false },
    ]);
    setShowModal(false);
    setNewEvent({ title: "", date: "", startTime: "", endTime: "" });
  };

  const handleAddTimeSlot = () => {
    setWeeklySchedule({
      ...weeklySchedule,
      [selectedDay]: [
        ...weeklySchedule[selectedDay],
        { startTime: "", endTime: "", clinicType: "" },
      ],
    });
  };

  const handleRemoveTimeSlot = (dayName, index) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [dayName]: weeklySchedule[dayName].filter((_, i) => i !== index),
    });
  };

  const handleTimeSlotChange = (dayName, index, field, value) => {
    const updatedSlots = [...weeklySchedule[dayName]];
    updatedSlots[index][field] = value;
    setWeeklySchedule({ ...weeklySchedule, [dayName]: updatedSlots });
  };

  const handleSaveSchedule = () => {
    for (const day of DAYS_OF_WEEK) {
      for (const slot of weeklySchedule[day]) {
        if (!slot.startTime || !slot.endTime) {
          alert("Please fill in all time slots or remove empty ones");
          return;
        }
        if (!slot.clinicType) {
          alert("Please select a clinic type for all time slots");
          return;
        }
      }
    }
    alert("Schedule saved successfully!");
    setShowScheduleModal(false);
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

  /* Payment receipt image path */
  const receiptImageSrc = receiptImage;

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />
        <div className="doctor-content" style={{ padding: "20px" }}>
          <br />
          <div className="appointment-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3>Appointments Calendar</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-create"
                  onClick={() => setShowScheduleModal(true)}
                  style={{
                    backgroundColor: "#8B4545",
                    color: "#fff",
                    border: "2px solid #8B4545",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#8B4545";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#8B4545";
                    e.target.style.color = "#fff";
                  }}
                >
                  + Add Schedule
                </button>
                <button
                  className="btn-create"
                  onClick={() => setShowModal(true)}
                >
                  + Create Appointment
                </button>
              </div>
            </div>

            <Calendar
              localizer={localizer}
              events={events}
              date={currentDate}
              view={currentView}
              onNavigate={setCurrentDate}
              onView={setCurrentView}
              views={["month", "week", "day", "agenda"]}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600, marginTop: 20, borderRadius: "12px" }}
              eventPropGetter={(event) => {
                let backgroundColor = "#4D227C";
                if (event.title.includes("New Year's Day"))
                  backgroundColor = "#7A92D1";
                return {
                  style: {
                    backgroundColor,
                    color: "#fff",
                    borderRadius: "16px",
                    padding: "4px 8px",
                    fontWeight: 500,
                    marginBottom: "4px",
                    fontSize: "13px",
                  },
                };
              }}
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          Create Appointment Modal
      ══════════════════════════════════════ */}
      {showModal && (
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
            {/* Header */}
            <div className="modal-header">
              <h2>New Appointment</h2>
              <span className="modal-date">
                {newEvent.date
                  ? format(new Date(newEvent.date), "MMMM d, yyyy")
                  : format(new Date(), "MMMM d, yyyy")}
              </span>
              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
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

                {/* Reason for Consultation */}
                <div style={{ marginBottom: "8px" }}>
                  <input
                    style={inputStyle}
                    placeholder="Reason for Consultation"
                  />
                </div>

                {/* ── Patient Name Dropdown (replaces 3 separate fields) ── */}
                <div style={{ marginBottom: "8px" }}>
                  <PatientDropdown
                    onSelect={(patient) => {
                      /* You can lift patient state here if needed */
                      console.log("Selected patient:", patient);
                    }}
                  />
                </div>

                {/* Row 2: Date of Birth | Age (auto-computed) */}
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
                    style={{
                      ...inputStyle,
                      backgroundColor:
                        computedAge !== "" ? "#f3ecfc" : "#f9f9f9",
                      color: computedAge !== "" ? "#4D227C" : "#aaa",
                      fontWeight: computedAge !== "" ? "700" : "400",
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

                {/* Row 3: Sex | Contact No. | Civil Status */}
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

                {/* Row 4: Informant | Relation */}
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

                {/* Radio groups */}
                <div style={{ display: "flex", gap: "48px" }}>
                  <div>
                    <p style={sectionLabelStyle}>Patient Type</p>
                    <div style={radioGroupStyle}>
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
                    <div style={radioGroupStyle}>
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
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                    />
                  </LabeledInput>
                  <LabeledInput label="End Time">
                    <input
                      style={inputStyle}
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                    />
                  </LabeledInput>
                </div>

                <div>
                  <p style={sectionLabelStyle}>Schedule Visit</p>
                  <div style={{ display: "flex", gap: "24px" }}>
                    <label style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="visit"
                        value="schedule"
                        style={radioInputStyle}
                      />{" "}
                      Schedule Visit
                    </label>
                    <label style={radioLabelStyle}>
                      <input
                        type="radio"
                        name="visit"
                        value="virtual"
                        style={radioInputStyle}
                      />{" "}
                      Virtual Consult
                    </label>
                  </div>
                </div>
              </div>

              {/* ── PAYMENT STATUS ── */}
              <div className="modal-section">
                <h4>Payment Status</h4>

                {/* Payment Receipt Display — image only, no wrapper card */}
                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "12px",
                      overflow: "hidden",
                      cursor: "pointer",
                      boxShadow: "0 2px 12px rgba(77,34,124,0.12)",
                      border: "1px solid #e0d4f5",
                    }}
                    onClick={() => setShowLightbox(true)}
                    title="Click to enlarge"
                  >
                    <img
                      src={receiptImageSrc}
                      alt="Payment Receipt"
                      style={{
                        width: "100%",
                        display: "block",
                        objectFit: "cover",
                        objectPosition: "top",
                        transition: "transform 0.3s ease, filter 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.filter = "brightness(0.88)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.filter = "brightness(1)";
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextSibling.style.display = "flex";
                      }}
                    />
                    {/* Fallback */}
                    <div
                      style={{
                        display: "none",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "8px",
                        padding: "32px 16px",
                        backgroundColor: "#f3ecfc",
                        color: "#4D227C",
                        fontSize: "13px",
                        minHeight: "120px",
                      }}
                    >
                      <span style={{ fontSize: "32px" }}>🧾</span>
                      <span>Receipt image not found</span>
                      <span style={{ fontSize: "11px", color: "#aaa" }}>
                        Check assets/payment/images.png
                      </span>
                    </div>

                    {/* Zoom hint */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        right: "8px",
                        backgroundColor: "rgba(77,34,124,0.80)",
                        color: "#fff",
                        borderRadius: "6px",
                        padding: "4px 10px",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        backdropFilter: "blur(4px)",
                        pointerEvents: "none",
                      }}
                    >
                      <FiZoomIn size={12} /> Click to enlarge
                    </div>
                  </div>
                </div>

                {/* Payment Status Dropdown */}
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

            <div className="modal-footer">
              <button className="btn-add" onClick={handleAddEvent}>
                Add Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          Add Schedule Modal
      ══════════════════════════════════════ */}
      {showScheduleModal && (
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
            <div className="modal-header">
              <h2>Add Weekly Schedule</h2>
              <button
                className="close-btn"
                onClick={() => setShowScheduleModal(false)}
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
              <div className="modal-section">
                <h4>Select Day of the Week</h4>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                  }}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border:
                          selectedDay === day
                            ? "2px solid #4D227C"
                            : "1px solid #ddd",
                        backgroundColor:
                          selectedDay === day ? "#4D227C" : "#fff",
                        color: selectedDay === day ? "#fff" : "#333",
                        cursor: "pointer",
                        fontWeight: selectedDay === day ? "600" : "400",
                        transition: "all 0.2s",
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <h4>Time Slots for {selectedDay}</h4>
                    <button
                      onClick={handleAddTimeSlot}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#4D227C",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontWeight: "500",
                      }}
                    >
                      <FiPlus /> Add Time Slot
                    </button>
                  </div>

                  {weeklySchedule[selectedDay].length === 0 ? (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#666",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                      }}
                    >
                      No time slots added for {selectedDay}. Click "Add Time
                      Slot" to get started.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {weeklySchedule[selectedDay].map((slot, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            padding: "16px",
                            backgroundColor: "#f9f9f9",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{ fontWeight: "500", minWidth: "80px" }}
                            >
                              Slot {index + 1}:
                            </span>
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                handleTimeSlotChange(
                                  selectedDay,
                                  index,
                                  "startTime",
                                  e.target.value,
                                )
                              }
                              style={{
                                padding: "10px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                fontSize: "14px",
                                minWidth: "150px",
                              }}
                            />
                            <span style={{ fontWeight: "500" }}>to</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) =>
                                handleTimeSlotChange(
                                  selectedDay,
                                  index,
                                  "endTime",
                                  e.target.value,
                                )
                              }
                              style={{
                                padding: "10px 12px",
                                borderRadius: "6px",
                                border: "1px solid #ddd",
                                fontSize: "14px",
                                minWidth: "150px",
                              }}
                            />
                            <button
                              onClick={() =>
                                handleRemoveTimeSlot(selectedDay, index)
                              }
                              style={{
                                padding: "8px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#ff4444",
                                color: "#fff",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FiTrash2 />
                            </button>
                          </div>

                          <div style={{ paddingLeft: "90px" }}>
                            <h5
                              style={{
                                marginBottom: "10px",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#333",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Clinic Type
                            </h5>
                            <div style={{ display: "flex", gap: "20px" }}>
                              {["online", "physical"].map((type) => (
                                <label
                                  key={type}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                    color: "#555",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`clinicType-${selectedDay}-${index}`}
                                    value={type}
                                    checked={slot.clinicType === type}
                                    onChange={(e) =>
                                      handleTimeSlotChange(
                                        selectedDay,
                                        index,
                                        "clinicType",
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      accentColor: "#4D227C",
                                      cursor: "pointer",
                                    }}
                                  />
                                  <span>
                                    {type === "online"
                                      ? "Online Clinic"
                                      : "Physical Clinic"}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "8px",
                  }}
                >
                  <h4 style={{ marginBottom: "10px" }}>Schedule Summary</h4>
                  {DAYS_OF_WEEK.map(
                    (day) =>
                      weeklySchedule[day].length > 0 && (
                        <div key={day} style={{ marginBottom: "8px" }}>
                          <strong>{day}:</strong>{" "}
                          {weeklySchedule[day].map((slot, idx) => {
                            const formatTime = (time) => {
                              if (!time) return "";
                              const [hours, minutes] = time.split(":");
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? "PM" : "AM";
                              const displayHour = hour % 12 || 12;
                              return `${displayHour}:${minutes} ${ampm}`;
                            };
                            const clinicTypeLabel =
                              slot.clinicType === "online"
                                ? " (Online Clinic)"
                                : slot.clinicType === "physical"
                                  ? " (Physical Clinic)"
                                  : "";
                            return (
                              <span key={idx}>
                                {formatTime(slot.startTime)} –{" "}
                                {formatTime(slot.endTime)}
                                {clinicTypeLabel}
                                {idx < weeklySchedule[day].length - 1
                                  ? ", "
                                  : ""}
                              </span>
                            );
                          })}
                        </div>
                      ),
                  )}
                  {DAYS_OF_WEEK.every(
                    (day) => weeklySchedule[day].length === 0,
                  ) && (
                    <div style={{ color: "#666" }}>No schedules added yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-add" onClick={handleSaveSchedule}>
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          Image Lightbox
      ══════════════════════════════════════ */}
      {showLightbox && (
        <ImageLightbox
          src={receiptImageSrc}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  );
}

export default DoctorAppointment;
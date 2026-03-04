import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import DoctorSideBar from "./DoctorSideBar";
import DoctorTopNavbar from "./DoctorTopNavbar";
import "./DoctorStyle/DoctorAppointment.css";
import { FiX, FiPlus, FiTrash2 } from "react-icons/fi";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

function DoctorAppointment() {
  const [activeMenu, setActiveMenu] = useState("Appointment");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

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
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
    Friday: [], Saturday: [], Sunday: [],
  });

  const [selectedDay, setSelectedDay] = useState("Monday");

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) {
      alert("Please complete all fields");
      return;
    }
    const start = new Date(`${newEvent.date}T${newEvent.startTime}`);
    const end = new Date(`${newEvent.date}T${newEvent.endTime}`);
    setEvents([...events, { title: newEvent.title, start, end, allDay: false }]);
    setShowModal(false);
    setNewEvent({ title: "", date: "", startTime: "", endTime: "" });
  };

  const handleAddTimeSlot = () => {
    setWeeklySchedule({
      ...weeklySchedule,
      [selectedDay]: [...weeklySchedule[selectedDay], { startTime: "", endTime: "", clinicType: "" }],
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

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
  };

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

  /* Labelled input wrapper (label on top) */
  const LabeledInput = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={{ fontSize: "11px", fontWeight: "600", color: "#4D227C", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="admin-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <DoctorTopNavbar activeMenu={activeMenu} />
        <div className="admin-content" style={{ padding: "20px" }}>
          <br />
          <div className="appointment-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Appointments Calendar</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-create"
                  onClick={() => setShowScheduleModal(true)}
                  style={{ backgroundColor: "#8B4545", color: "#fff", border: "2px solid #8B4545", transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#8B4545"; }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = "#8B4545"; e.target.style.color = "#fff"; }}
                >
                  + Add Schedule
                </button>
                <button className="btn-create" onClick={() => setShowModal(true)}>
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
                if (event.title.includes("New Year's Day")) backgroundColor = "#7A92D1";
                return {
                  style: {
                    backgroundColor, color: "#fff", borderRadius: "16px",
                    padding: "4px 8px", fontWeight: 500, marginBottom: "4px", fontSize: "13px",
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
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: "20px", overflowY: "auto",
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
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center" }}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">

              {/* ── PATIENT INFORMATION ── */}
              <div className="modal-section">
                <h4>Patient Information</h4>

                {/* Reason for Consultation — full width, topmost */}
                <div style={{ marginBottom: "8px" }}>
                  <input style={inputStyle} placeholder="Reason for Consultation" />
                </div>

                {/* Row 1: First Name | Last Name | Middle Initial */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "8px" }}>
                  <input style={inputStyle} placeholder="Patient First Name" />
                  <input style={inputStyle} placeholder="Patient Last Name" />
                  <input style={inputStyle} placeholder="Patient Middle Initial" />
                </div>

                {/* Row 2: Date of Birth | Email */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "8px" }}>
                  <input style={inputStyle} type="date" title="Date of Birth" />
                  <input style={inputStyle} type="email" placeholder="Email" />
                </div>

                {/* Row 3: Sex | Contact No. | Civil Status */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "8px" }}>
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

                {/* Row 4: Full Name of Informant | Relation to Patient (2 columns) */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "8px" }}>
                  <input style={inputStyle} placeholder="Full Name of Informant (if not the client)" />
                  <input style={inputStyle} placeholder="Relation to the Patient" />
                </div>

                {/* Row 5: Address full width */}
                <div style={{ marginBottom: "12px" }}>
                  <input style={inputStyle} placeholder="Address" />
                </div>

                {/* Radio groups — side by side, compact spacing */}
                <div style={{ display: "flex", gap: "48px" }}>
                  {/* Patient Type */}
                  <div>
                    <p style={sectionLabelStyle}>Patient Type</p>
                    <div style={radioGroupStyle}>
                      <label style={radioLabelStyle}>
                        <input type="radio" name="ptype" value="existing" style={radioInputStyle} />
                        Existing Patient
                      </label>
                      <label style={radioLabelStyle}>
                        <input type="radio" name="ptype" value="new" style={radioInputStyle} />
                        New Patient
                      </label>
                    </div>
                  </div>

                  {/* Patient Classification */}
                  <div>
                    <p style={sectionLabelStyle}>Patient Classification</p>
                    <div style={radioGroupStyle}>
                      <label style={radioLabelStyle}>
                        <input type="radio" name="class" value="pwd" style={radioInputStyle} />
                        PWD
                      </label>
                      <label style={radioLabelStyle}>
                        <input type="radio" name="class" value="senior" style={radioInputStyle} />
                        Senior Citizen
                      </label>
                      <label style={radioLabelStyle}>
                        <input type="radio" name="class" value="regular" style={radioInputStyle} />
                        Regular
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CONSULTATION SCHEDULE ── */}
              <div className="modal-section">
                <h4>Consultation Schedule</h4>

                {/* Date | Start Time | End Time — labels on top */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
                  <LabeledInput label="Date">
                    <input
                      style={inputStyle}
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </LabeledInput>

                  <LabeledInput label="Start Time">
                    <input
                      style={inputStyle}
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                  </LabeledInput>

                  <LabeledInput label="End Time">
                    <input
                      style={inputStyle}
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    />
                  </LabeledInput>
                </div>

                {/* Schedule Visit radio */}
                <div>
                  <p style={sectionLabelStyle}>Schedule Visit</p>
                  <div style={{ display: "flex", gap: "24px" }}>
                    <label style={radioLabelStyle}>
                      <input type="radio" name="visit" value="schedule" style={radioInputStyle} />
                      Schedule Visit
                    </label>
                    <label style={radioLabelStyle}>
                      <input type="radio" name="visit" value="virtual" style={radioInputStyle} />
                      Virtual Consult
                    </label>
                  </div>
                </div>
              </div>

              {/* ── PAYMENT STATUS ── */}
              <div className="modal-section">
                <h4>Payment Status</h4>

                {/* Payment Receipt Display */}
                <div style={{ marginBottom: "12px" }}>
                  <p style={sectionLabelStyle}>Payment Receipt</p>
                  <div
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                      border: "1px solid #e8daf5",
                      backgroundColor: "#faf7ff",
                      overflow: "hidden",
                    }}
                  >
                    {/* Receipt Header */}
                    <div
                      style={{
                        backgroundColor: "#4D227C",
                        padding: "14px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ color: "#fff", fontSize: "14px", fontWeight: "600" }}>Payment</span>
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>Receipt</span>
                    </div>

                    {/* Wavy divider */}
                    <div style={{ backgroundColor: "#4D227C", lineHeight: 0 }}>
                      <svg viewBox="0 0 400 20" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }}>
                        <path d="M0,10 C20,0 40,20 60,10 C80,0 100,20 120,10 C140,0 160,20 180,10 C200,0 220,20 240,10 C260,0 280,20 300,10 C320,0 340,20 360,10 C380,0 400,20 400,10 L400,20 L0,20 Z" fill="#faf7ff"/>
                      </svg>
                    </div>

                    {/* Receipt Body */}
                    <div style={{ padding: "16px 24px 20px" }}>
                      {/* Icon + Merchant */}
                      <div style={{ textAlign: "center", marginBottom: "14px" }}>
                        <div
                          style={{
                            width: "48px", height: "48px", borderRadius: "50%",
                            backgroundColor: "#e8daf5", display: "flex",
                            alignItems: "center", justifyContent: "center",
                            margin: "0 auto 8px",
                            fontSize: "18px", fontWeight: "700", color: "#4D227C",
                          }}
                        >
                          W
                        </div>
                        <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>Successfully Paid To</p>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: "700", color: "#333" }}>CLINIC NAME</p>
                      </div>

                      {/* Amount */}
                      <div style={{ textAlign: "center", marginBottom: "16px" }}>
                        <p style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#2d2d2d", letterSpacing: "-0.5px" }}>
                          php —
                        </p>
                      </div>

                      {/* Details rows */}
                      {[
                        { label: "Amount Due", value: "—" },
                        { label: "Payment Method", value: "—" },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", padding: "7px 0",
                            borderBottom: "1px solid #f0eaf8",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#888" }}>{label}</span>
                          <span style={{ fontSize: "12px", color: "#444", fontWeight: "500" }}>{value}</span>
                        </div>
                      ))}

                      {/* Ref No */}
                      <div style={{ textAlign: "center", marginTop: "14px" }}>
                        <p style={{ margin: 0, fontSize: "11px", color: "#aaa", letterSpacing: "1px" }}>
                          Ref. No. ··········
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#aaa" }}>
                          Date & Time will appear here
                        </p>
                      </div>
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
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: "20px", overflowY: "auto",
          }}
        >
          <div className="appointment-modal-lg">
            <div className="modal-header">
              <h2>Add Weekly Schedule</h2>
              <button
                className="close-btn"
                onClick={() => setShowScheduleModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center" }}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>Select Day of the Week</h4>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      style={{
                        padding: "8px 16px", borderRadius: "8px",
                        border: selectedDay === day ? "2px solid #4D227C" : "1px solid #ddd",
                        backgroundColor: selectedDay === day ? "#4D227C" : "#fff",
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h4>Time Slots for {selectedDay}</h4>
                    <button
                      onClick={handleAddTimeSlot}
                      style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#4D227C", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: "500" }}
                    >
                      <FiPlus /> Add Time Slot
                    </button>
                  </div>

                  {weeklySchedule[selectedDay].length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#666", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                      No time slots added for {selectedDay}. Click "Add Time Slot" to get started.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {weeklySchedule[selectedDay].map((slot, index) => (
                        <div key={index} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <span style={{ fontWeight: "500", minWidth: "80px" }}>Slot {index + 1}:</span>
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleTimeSlotChange(selectedDay, index, "startTime", e.target.value)}
                              style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", minWidth: "150px" }}
                            />
                            <span style={{ fontWeight: "500" }}>to</span>
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleTimeSlotChange(selectedDay, index, "endTime", e.target.value)}
                              style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", minWidth: "150px" }}
                            />
                            <button
                              onClick={() => handleRemoveTimeSlot(selectedDay, index)}
                              style={{ padding: "8px", borderRadius: "6px", border: "none", backgroundColor: "#ff4444", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <FiTrash2 />
                            </button>
                          </div>

                          <div style={{ paddingLeft: "90px" }}>
                            <h5 style={{ marginBottom: "10px", fontSize: "12px", fontWeight: "600", color: "#333", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                              Clinic Type
                            </h5>
                            <div style={{ display: "flex", gap: "20px" }}>
                              {["online", "physical"].map((type) => (
                                <label key={type} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#555" }}>
                                  <input
                                    type="radio"
                                    name={`clinicType-${selectedDay}-${index}`}
                                    value={type}
                                    checked={slot.clinicType === type}
                                    onChange={(e) => handleTimeSlotChange(selectedDay, index, "clinicType", e.target.value)}
                                    style={{ width: "16px", height: "16px", accentColor: "#4D227C", cursor: "pointer" }}
                                  />
                                  <span>{type === "online" ? "Online Clinic" : "Physical Clinic"}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
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
                              slot.clinicType === "online" ? " (Online Clinic)"
                              : slot.clinicType === "physical" ? " (Physical Clinic)" : "";
                            return (
                              <span key={idx}>
                                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}{clinicTypeLabel}
                                {idx < weeklySchedule[day].length - 1 ? ", " : ""}
                              </span>
                            );
                          })}
                        </div>
                      )
                  )}
                  {DAYS_OF_WEEK.every((day) => weeklySchedule[day].length === 0) && (
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
    </div>
  );
}

export default DoctorAppointment;
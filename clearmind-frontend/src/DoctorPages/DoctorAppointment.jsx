import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import DoctorSideBar from "./DoctorSideBar";
import DoctorTopNavbar from "./DoctorTopNavbar";
import "./DoctorStyle/DoctorAppointment.css"; // reuse the same CSS
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
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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

  // Schedule state: each day can have multiple time slots
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
        { startTime: "", endTime: "" },
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
    setWeeklySchedule({
      ...weeklySchedule,
      [dayName]: updatedSlots,
    });
  };

  const handleSaveSchedule = () => {
    // Validate that all time slots are filled
    for (const day of DAYS_OF_WEEK) {
      for (const slot of weeklySchedule[day]) {
        if (!slot.startTime || !slot.endTime) {
          alert("Please fill in all time slots or remove empty ones");
          return;
        }
      }
    }

    alert("Schedule saved successfully!");
    setShowScheduleModal(false);
  };

  return (
    <div className="admin-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <DoctorTopNavbar activeMenu={activeMenu} />
        <div className="admin-content" style={{ padding: "20px" }}>
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
                let backgroundColor;
                if (event.title.includes("Online Clinic"))
                  backgroundColor = "#4D227C";
                else if (event.title.includes("New Year's Day"))
                  backgroundColor = "#7A92D1";
                else backgroundColor = "#4D227C";

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

      {/* Create Appointment Modal */}
      {showModal && (
        <div className="appointment-modal-overlay">
          <div className="appointment-modal-lg">
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
                  justifyContent: "center",
                }}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>Patient Information</h4>
                <div className="form-grid">
                  <input placeholder="Patient First Name" />
                  <input placeholder="Patient Last Name" />
                  <input placeholder="Patient Middle Initial" />
                  <input placeholder="Patient Age" />
                  <input placeholder="Patient Sex" />
                  <input placeholder="Patient Contact No." />
                </div>

                <div className="radio-group">
                  <div>
                    <strong>Patient Type</strong>
                    <br />
                    <label>
                      <input type="radio" name="ptype" /> Existing Patient
                    </label>
                    <label>
                      <input type="radio" name="ptype" /> New Patient
                    </label>
                  </div>
                  <div>
                    <strong>Patient Classification</strong>
                    <br />
                    <label>
                      <input type="radio" name="class" /> PWD
                    </label>
                    <label>
                      <input type="radio" name="class" /> Senior Citizen
                    </label>
                    <label>
                      <input type="radio" name="class" /> Regular
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Consultation Schedule</h4>
                <div className="schedule-row">
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                  />
                  <div className="time-input-wrapper">
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                    />
                    <label>Start Time</label>
                  </div>
                  <div className="time-input-wrapper">
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                    />
                    <label>End Time</label>
                  </div>
                </div>
                <div className="radio-group" style={{ marginTop: "15px" }}>
                  <div>
                    <strong>Schedule Visit</strong>
                    <br />
                    <label>
                      <input type="radio" name="visit" /> Schedule Visit
                    </label>
                    <label>
                      <input type="radio" name="visit" /> Virtual Consult
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Payment Details</h4>
                <div className="payment-form-grid">
                  <input placeholder="Paid Amount" />
                  <input placeholder="Reference Number" />
                  <input placeholder="Payment Option" />
                  <input type="file" />
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

      {/* Add Schedule Modal */}
      {showScheduleModal && (
        <div className="appointment-modal-overlay">
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
                  justifyContent: "center",
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
                            gap: "10px",
                            alignItems: "center",
                            padding: "12px",
                            backgroundColor: "#f9f9f9",
                            borderRadius: "8px",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          <span style={{ fontWeight: "500", minWidth: "80px" }}>
                            Slot {index + 1}:
                          </span>
                          <input
                            type="time"
                            value={slot.startTime}
                            placeholder="- Start Time"
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
                            placeholder="- End Time"
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
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary of all days with schedules */}
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
                            // Convert 24-hour format to 12-hour format with AM/PM
                            const formatTime = (time) => {
                              if (!time) return "";
                              const [hours, minutes] = time.split(":");
                              const hour = parseInt(hours);
                              const ampm = hour >= 12 ? "PM" : "AM";
                              const displayHour = hour % 12 || 12;
                              return `${displayHour}:${minutes} ${ampm}`;
                            };

                            return (
                              <span key={idx}>
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
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
    </div>
  );
}

export default DoctorAppointment;

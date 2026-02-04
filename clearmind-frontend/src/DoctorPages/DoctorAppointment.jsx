import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import DoctorSideBar from "./DoctorSideBar";
import DoctorTopNavbar from "./DoctorTopNavbar";
import AccountSetupModal from "./AccountSetUpModal";
import "./DoctorStyle/DoctorAppointment.css";
import { FiX } from "react-icons/fi";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function DoctorAppointment() {
  const [activeMenu, setActiveMenu] = useState("Appointment");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState("month");
  const [showModal, setShowModal] = useState(false);
  const [showAccountSetup, setShowAccountSetup] = useState(false);

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

  const [patientSex, setPatientSex] = useState("");

  // useEffect(() => {
  //   const completed = localStorage.getItem("accountSetupCompleted");
  //   if (!completed) setShowAccountSetup(true);
  // }, []);

  useEffect(() => {
  setShowAccountSetup(true);
}, []);


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
    setPatientSex("");
  };

  const handleAccountSetupClose = () => {
    localStorage.setItem("accountSetupCompleted", "true");
    setShowAccountSetup(false);
  };

  return (
    <div className="admin-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="admin-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="admin-content" style={{ padding: "20px" }}>
          <div className="appointment-card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>Appointments Calendar</h3>
              <button className="btn-create" onClick={() => setShowModal(true)}>
                + Create Appointment
              </button>
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
              style={{ height: 600, marginTop: 20 }}
            />
          </div>
        </div>
      </div>

      {/* CREATE APPOINTMENT MODAL */}
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

              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {/* PATIENT INFO */}
              <div className="modal-section">
                <h4>Patient Information</h4>

                <div className="form-grid">
                  <input placeholder="Patient First Name" />
                  <input placeholder="Patient Last Name" />
                  <input placeholder="Patient Middle Initial" />
                  <input placeholder="Patient Age" />

                  {/* ✅ FIXED SELECT */}
                  <select
                    className="form-select"
                    value={patientSex}
                    onChange={(e) => setPatientSex(e.target.value)}
                    required
                  >
                    <option value="" disabled hidden>
                      Patient Sex
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>

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

              {/* SCHEDULE */}
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
                        setNewEvent({
                          ...newEvent,
                          startTime: e.target.value,
                        })
                      }
                    />
                    <label>Start Time</label>
                  </div>

                  <div className="time-input-wrapper">
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          endTime: e.target.value,
                        })
                      }
                    />
                    <label>End Time</label>
                  </div>
                </div>
              </div>

              {/* PAYMENT */}
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

      {/* ACCOUNT SETUP MODAL */}
      <AccountSetupModal
        showModal={showAccountSetup}
        onClose={handleAccountSetupClose}
      />
    </div>
  );
}

export default DoctorAppointment;

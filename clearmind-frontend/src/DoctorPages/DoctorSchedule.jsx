import { useState } from "react";
import { FiPlus, FiTrash2, FiClock, FiCalendar } from "react-icons/fi";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import AddScheduleModal from "./components/AddScheduleModal";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const INITIAL_SCHEDULE = {
  Monday: [
    { startTime: "09:00", endTime: "12:00", clinicType: "physical" },
    { startTime: "13:00", endTime: "17:00", clinicType: "online" },
  ],
  Tuesday: [{ startTime: "10:00", endTime: "13:00", clinicType: "physical" }],
  Wednesday: [
    { startTime: "09:00", endTime: "12:00", clinicType: "physical" },
    { startTime: "14:00", endTime: "17:00", clinicType: "online" },
  ],
  Thursday: [{ startTime: "10:00", endTime: "14:00", clinicType: "physical" }],
  Friday: [
    { startTime: "09:00", endTime: "12:00", clinicType: "online" },
    { startTime: "13:00", endTime: "15:00", clinicType: "physical" },
  ],
  Saturday: [{ startTime: "09:00", endTime: "12:00", clinicType: "physical" }],
  Sunday: [],
};

const formatTime = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

function SlotBadge({ clinicType }) {
  const isOnline = clinicType === "online";
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 10px",
        borderRadius: 10,
        backgroundColor: isOnline ? "#e0f0ff" : "#ede7f6",
        color: isOnline ? "#1e6091" : "#4D227C",
        whiteSpace: "nowrap",
      }}
    >
      {isOnline ? "Online" : "Physical"}
    </span>
  );
}

function DoctorSchedule() {
  // Locked to "Appointment" — sidebar always highlights it on this page.
  // Passing a no-op setter prevents sidebar clicks from unhighlighting it.
  const activeMenu = "Appointment";
  const setActiveMenu = () => {};

  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDeleteSlot = (day, slotIdx) =>
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== slotIdx),
    }));

  const handleScheduleSave = (mergedSchedule) => setSchedule(mergedSchedule);

  const daysWithSlots = DAYS_OF_WEEK.filter((d) => schedule[d]?.length > 0);
  const totalSlots = DAYS_OF_WEEK.reduce(
    (acc, d) => acc + (schedule[d]?.length ?? 0),
    0,
  );

  return (
    <>
      <style>{`
        .schedule-page {
          background: #f7f4fc;
          padding: 32px 24px;
          box-sizing: border-box;
          min-height: 100%;
        }
        .schedule-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 28px;
        }
        .schedule-header h1 {
          margin: 0; font-size: clamp(20px, 3vw, 28px);
          font-weight: 800; color: #4D227C;
        }
        .btn-add-schedule {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 20px; border-radius: 8px; border: none;
          background: #4D227C; color: #fff; font-weight: 700;
          font-size: clamp(13px, 1.8vw, 14px); cursor: pointer;
          transition: background 0.2s; font-family: inherit; white-space: nowrap;
        }
        .btn-add-schedule:hover { background: #3a1860; }

        .stats-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 28px; }
        .stat-card {
          display: flex; align-items: center; gap: 12px;
          background: #fff; border-radius: 10px; padding: 14px 20px;
          border: 1px solid #e0d4f5; flex: 1; min-width: 140px;
          box-shadow: 0 2px 8px rgba(77,34,124,0.06);
        }
        .stat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: #ede7f6; display: flex; align-items: center;
          justify-content: center; color: #4D227C; flex-shrink: 0;
        }
        .stat-label { font-size: 12px; color: #888; font-weight: 500; margin-bottom: 2px; }
        .stat-value { font-size: 22px; font-weight: 800; color: #4D227C; }

        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .day-card {
          background: #fff; border-radius: 12px; overflow: hidden;
          border: 1px solid #e0d4f5;
          box-shadow: 0 2px 8px rgba(77,34,124,0.06);
          transition: box-shadow 0.2s;
        }
        .day-card:hover { box-shadow: 0 6px 20px rgba(77,34,124,0.12); }
        .day-card-header {
          background: #4D227C; color: #fff; padding: 12px 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .day-card-header span { font-weight: 700; font-size: clamp(13px,1.8vw,15px); }
        .day-card-body { padding: 12px 16px; }

        .slot-row {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: nowrap; gap: 8px; padding: 8px 10px;
          border-radius: 8px; margin-bottom: 6px;
          background: #faf7ff; border: 1px solid #ede7f6; transition: background 0.15s;
        }
        .slot-row:last-child { margin-bottom: 0; }
        .slot-row:hover { background: #f3ecff; }
        .slot-info {
          display: flex; align-items: center; flex-wrap: wrap;
          gap: 6px; min-width: 0; flex: 1;
        }
        .slot-time { font-size: clamp(12px,1.6vw,13px); font-weight: 500; color: #333; white-space: nowrap; }

        .empty-day {
          padding: 16px; text-align: center; color: #bbb;
          font-size: 13px; font-style: italic;
        }
        .delete-slot-btn {
          padding: 4px 7px; border-radius: 6px; border: none;
          background: #fff0f0; color: #e53e3e; cursor: pointer;
          display: flex; align-items: center; flex-shrink: 0;
          transition: background 0.15s;
        }
        .delete-slot-btn:hover { background: #ffe0e0; }

        .empty-state { text-align: center; padding: 60px 20px; color: #999; }
        .empty-state h3 { color: #4D227C; margin-bottom: 8px; font-size: 20px; }
        .empty-state p  { font-size: 14px; margin: 0 0 20px; }

        @media (max-width: 600px) {
          .schedule-page  { padding: 20px 14px; }
          .schedule-grid  { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="doctor-layout">
        <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

        <div className="doctor-main">
          <DoctorTopNavbar activeMenu={activeMenu} />

          <div className="doctor-content" style={{ padding: "20px" }}>
            <div className="schedule-page">
              {/* Page Header — subtitle removed */}
              <div className="schedule-header">
                <h1>Weekly Schedule</h1>
                <button
                  className="btn-add-schedule"
                  onClick={() => setModalOpen(true)}
                >
                  <FiPlus size={16} /> Add Schedule
                </button>
              </div>

              {/* Stats */}
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiCalendar size={18} />
                  </div>
                  <div>
                    <div className="stat-label">Active Days</div>
                    <div className="stat-value">{daysWithSlots.length}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiClock size={18} />
                  </div>
                  <div>
                    <div className="stat-label">Total Slots</div>
                    <div className="stat-value">{totalSlots}</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div
                    className="stat-icon"
                    style={{ background: "#e0f0ff", color: "#1e6091" }}
                  >
                    <FiClock size={18} />
                  </div>
                  <div>
                    <div className="stat-label">Online Slots</div>
                    <div className="stat-value" style={{ color: "#1e6091" }}>
                      {DAYS_OF_WEEK.reduce(
                        (acc, d) =>
                          acc +
                          (schedule[d]?.filter((s) => s.clinicType === "online")
                            .length ?? 0),
                        0,
                      )}
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiClock size={18} />
                  </div>
                  <div>
                    <div className="stat-label">Physical Slots</div>
                    <div className="stat-value">
                      {DAYS_OF_WEEK.reduce(
                        (acc, d) =>
                          acc +
                          (schedule[d]?.filter(
                            (s) => s.clinicType === "physical",
                          ).length ?? 0),
                        0,
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Grid */}
              {totalSlots === 0 ? (
                <div className="empty-state">
                  <FiCalendar
                    size={48}
                    style={{ color: "#c4b5e8", marginBottom: 16 }}
                  />
                  <h3>No Schedule Yet</h3>
                  <p>
                    Click "Add Schedule" to set up your weekly availability.
                  </p>
                  <button
                    className="btn-add-schedule"
                    onClick={() => setModalOpen(true)}
                  >
                    <FiPlus size={16} /> Add Schedule
                  </button>
                </div>
              ) : (
                <div className="schedule-grid">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="day-card">
                      <div className="day-card-header">
                        <span>{day}</span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            opacity: 0.85,
                            background: "rgba(255,255,255,0.15)",
                            padding: "2px 10px",
                            borderRadius: 20,
                          }}
                        >
                          {schedule[day]?.length ?? 0} slot
                          {schedule[day]?.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="day-card-body">
                        {!schedule[day]?.length ? (
                          <div className="empty-day">No slots scheduled</div>
                        ) : (
                          schedule[day].map((slot, idx) => (
                            <div key={idx} className="slot-row">
                              <div className="slot-info">
                                <span className="slot-time">
                                  {formatTime(slot.startTime)} –{" "}
                                  {formatTime(slot.endTime)}
                                </span>
                                <SlotBadge clinicType={slot.clinicType} />
                              </div>
                              {/* Delete button — always beside, never wraps below */}
                              <button
                                className="delete-slot-btn"
                                onClick={() => handleDeleteSlot(day, idx)}
                                title="Remove slot"
                                style={{ flexShrink: 0 }}
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      <AddScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        savedSchedule={schedule}
        onSave={handleScheduleSave}
      />
    </>
  );
}

export default DoctorSchedule;

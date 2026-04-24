import { useState, useEffect, useCallback } from "react";
import {
  FiPlus,
  FiTrash2,
  FiClock,
  FiCalendar,
  FiAlertCircle,
  FiEdit2,
} from "react-icons/fi";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import SetScheduleModal from "./components/SetScheduleModal";
import axios from "../axiosClient";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_NAME_TO_NUM = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const DAY_NUM_TO_NAME = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const buildScheduleState = (data = []) => {
  const state = {};
  DAYS_OF_WEEK.forEach((d) => (state[d] = null));
  data.forEach((s) => {
    const dayName = DAY_NUM_TO_NAME[s.day_num];
    if (!dayName || !Object.prototype.hasOwnProperty.call(state, dayName))
      return;
    state[dayName] = {
      id: s.schedule_id,
      startTime: s.start_time?.slice(0, 5),
      endTime: s.end_time?.slice(0, 5),
      slotType: s.slot_type,
    };
  });
  return state;
};

const buildBulkPayload = (schedule) => {
  const schedules = [];
  DAYS_OF_WEEK.forEach((dayName) => {
    const entry = schedule[dayName];
    if (!entry || !entry.startTime || !entry.endTime) return;
    schedules.push({
      day_of_week: DAY_NAME_TO_NUM[dayName],
      start_time: entry.startTime,
      end_time: entry.endTime,
      slot_type: entry.slotType || "physical",
    });
  });
  return { schedules };
};

const formatTime = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

const slotTypeLabel = (type) => {
  if (type === "both") return "Online & Physical";
  if (type === "online") return "Online";
  return "Physical";
};

const slotTypeColor = (type) => {
  if (type === "both")
    return { bg: "#e8f4fd", color: "#1a6091", border: "#bee3f8" };
  if (type === "online")
    return { bg: "#e0f0ff", color: "#1e6091", border: "#bee3f8" };
  return { bg: "#ede7f6", color: "#4D227C", border: "#d8c8f0" };
};

// ── Slot type icon ────────────────────────────────────────────────────────────
const SlotIcon = ({ type }) => {
  if (type === "online") return <span style={{ fontSize: 13 }}>🎥</span>;
  if (type === "physical") return <span style={{ fontSize: 13 }}>🏥</span>;
  if (type === "both") return <span style={{ fontSize: 13 }}>🎥🏥</span>;
  return null;
};

function DoctorSchedule() {
  const activeMenu = "Appointment";
  const setActiveMenu = () => {};

  const [schedule, setSchedule] = useState(() => {
    const s = {};
    DAYS_OF_WEEK.forEach((d) => (s[d] = null));
    return s;
  });
  const [doctorId, setDoctorId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingDay, setDeletingDay] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const authHeaders = {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  };

  const fetchSchedule = useCallback(async (dId) => {
    try {
      setError(null);
      const res = await axios.get(`/doctors/${dId}/schedules`, authHeaders);
      const grouped = res.data?.data?.schedule ?? [];
      setSchedule(buildScheduleState(grouped));
    } catch (err) {
      setError("Failed to load schedule. Please refresh.");
      console.error("Schedule fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await fetch(
          "http://localhost:8000/api/doctor/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );
        if (!profileRes.ok) throw new Error("Failed to fetch profile");

        const json = await profileRes.json();
        const profileData = json.data;

        const id =
          profileData?.doctor_id ?? profileData?.doctor?.doctor_id ?? null;

        if (!id) throw new Error("doctor_id not found in profile response");

        setDoctorId(id);
        await fetchSchedule(id);
      } catch (err) {
        setError(
          err.message.includes("doctor_id not found")
            ? "Doctor profile is not set up yet. Please complete your profile first."
            : "Failed to load doctor profile. Please refresh.",
        );
        setLoading(false);
      }
    };
    init();
  }, [fetchSchedule]);

  // ── Delete one day ────────────────────────────────────────────────────────
  const handleDeleteDay = async (dayName) => {
    const entry = schedule[dayName];
    if (!entry?.id || !doctorId) return;
    if (!window.confirm(`Remove schedule for ${dayName}?`)) return;

    const backup = entry;
    setSchedule((prev) => ({ ...prev, [dayName]: null }));
    setDeletingDay(dayName);

    try {
      // ── FIX: use full URL just like fetch/save ────────────────────────────
      await axios.delete(
        `/doctors/${doctorId}/schedules/${entry.id}`,
        authHeaders,
      );
    } catch (err) {
      setSchedule((prev) => ({ ...prev, [dayName]: backup }));
      setError("Failed to remove schedule. Please try again.");
      console.error("Delete error:", err);
    } finally {
      setDeletingDay(null);
    }
  };

  const handleScheduleSave = async (mergedSchedule) => {
    if (!doctorId) {
      setError("Doctor profile not loaded.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload = buildBulkPayload(mergedSchedule);
    if (!payload.schedules.length) {
      setSaving(false);
      return;
    }

    try {
      await axios.post(
        `/doctors/${doctorId}/schedules/bulk`,
        payload,
        authHeaders,
      );
      await fetchSchedule(doctorId);
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  const activeDays = DAYS_OF_WEEK.filter((d) => schedule[d] !== null);
  const onlineDays = activeDays.filter((d) =>
    ["online", "both"].includes(schedule[d]?.slotType),
  );
  const physicalDays = activeDays.filter((d) =>
    ["physical", "both"].includes(schedule[d]?.slotType),
  );

  return (
    <>
      <style>{`
        .schedule-page { background:#f9f7ff; min-height:100%; padding:24px; box-sizing:border-box; }
        .schedule-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:24px; }
        .schedule-header-left h1 { margin:0 0 2px; font-size:clamp(20px,3vw,26px); font-weight:800; color:#4D227C; }
        .schedule-header-left p  { margin:0; font-size:13px; color:#9e84c2; }
        .btn-add-schedule {
          display:flex; align-items:center; gap:6px; padding:10px 22px;
          border-radius:10px; border:none; background:#4D227C; color:#fff;
          font-weight:700; font-size:14px; cursor:pointer;
          transition:background 0.2s, transform 0.15s; font-family:inherit;
          white-space:nowrap; box-shadow:0 4px 14px rgba(77,34,124,0.3);
        }
        .btn-add-schedule:hover:not(:disabled) { background:#3a1860; transform:translateY(-1px); }
        .btn-add-schedule:disabled { background:#9e84c2; cursor:not-allowed; box-shadow:none; }
        .error-banner {
          display:flex; align-items:center; gap:8px; background:#fff0f0;
          border:1px solid #fca5a5; border-radius:10px; padding:12px 16px;
          margin-bottom:20px; color:#b91c1c; font-size:13px; font-weight:500;
        }
        .error-dismiss { margin-left:auto; background:none; border:none; color:#b91c1c; cursor:pointer; font-weight:700; font-size:16px; }
        .stats-row { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:24px; }
        .stat-card {
          display:flex; align-items:center; gap:14px; background:#fff;
          border-radius:12px; padding:16px 20px; border:1.5px solid #e8dff5;
          flex:1; min-width:130px; box-shadow:0 2px 8px rgba(77,34,124,0.06); transition:box-shadow 0.2s;
        }
        .stat-card:hover { box-shadow:0 6px 20px rgba(77,34,124,0.12); }
        .stat-icon { width:42px; height:42px; border-radius:12px; background:#ede7f6; display:flex; align-items:center; justify-content:center; color:#4D227C; flex-shrink:0; }
        .stat-label { font-size:11px; color:#999; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px; }
        .stat-value { font-size:26px; font-weight:800; color:#4D227C; line-height:1; }
        .schedule-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
        .day-card { background:#fff; border-radius:14px; overflow:hidden; border:1.5px solid #e8dff5; box-shadow:0 2px 8px rgba(77,34,124,0.06); transition:box-shadow 0.2s,transform 0.15s; }
        .day-card:hover { box-shadow:0 8px 24px rgba(77,34,124,0.12); transform:translateY(-2px); }
        .day-card-header { background-color:#4D227C; color:#fff; padding:14px 18px; display:flex; align-items:center; justify-content:space-between; }
        .day-card-header-left { display:flex; align-items:center; gap:10px; }
        .day-name { font-weight:800; font-size:15px; }
        .day-card-body { padding:16px 18px; }
        .hours-row { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
        .hours-icon { width:36px; height:36px; border-radius:10px; background:#f4f0fd; display:flex; align-items:center; justify-content:center; color:#4D227C; flex-shrink:0; }
        .hours-text { font-size:18px; font-weight:800; color:#2d2040; }
        .hours-sub  { font-size:11px; color:#9e84c2; font-weight:500; margin-top:1px; }
        .type-badge { display:inline-flex; align-items:center; gap:5px; font-size:12px; font-weight:700; padding:4px 12px; border-radius:20px; border:1.5px solid; }
        .day-actions { display:flex; gap:8px; }
        .btn-icon { padding:6px 8px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; transition:all 0.15s; font-size:14px; }
        .btn-edit   { background:rgba(255,255,255,0.2); color:#fff; }
        .btn-edit:hover   { background:rgba(255,255,255,0.35); }
        .btn-delete { background:rgba(255,255,255,0.15); color:#fecaca; }
        .btn-delete:hover { background:rgba(239,68,68,0.3); color:#fff; }
        .btn-delete:disabled { opacity:0.4; cursor:not-allowed; }
        .empty-day-card { background:#fff; border-radius:14px; overflow:hidden; border:1.5px dashed #d8c8f0; transition:all 0.2s; cursor:pointer; }
        .empty-day-card:hover { border-color:#4D227C; background:#faf7ff; box-shadow:0 4px 16px rgba(77,34,124,0.1); }
        .empty-day-inner { padding:24px 18px; text-align:center; color:#b8a8d8; font-size:13px; }
        .empty-day-name  { font-weight:800; font-size:15px; color:#9e84c2; margin-bottom:8px; }
        .empty-day-hint  { font-size:12px; color:#c4b5e8; margin-top:6px; }
        .loading-state { text-align:center; padding:60px 20px; color:#9e84c2; }
        .loading-spinner { width:36px; height:36px; border:3px solid #ede7f6; border-top-color:#4D227C; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 16px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .empty-state    { text-align:center; padding:60px 20px; color:#999; }
        .empty-state h3 { color:#4D227C; margin-bottom:8px; font-size:20px; }
        .empty-state p  { font-size:14px; margin:0 0 20px; }
        @media (max-width:600px) {
          .schedule-page { padding:16px; }
          .schedule-grid { grid-template-columns:1fr; }
          .stats-row     { flex-direction:column; }
        }
      `}</style>

      <div className="doctor-layout">
        <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="doctor-main">
          <DoctorTopNavbar activeMenu={activeMenu} />
          <div className="doctor-content">
            <div className="schedule-page">
              {/* Header */}
              <div className="schedule-header">
                <div className="schedule-header-left">
                  <h1>Weekly Schedule</h1>
                  <p>Set your available working hours for each day</p>
                </div>
                <button
                  className="btn-add-schedule"
                  onClick={() => setModalOpen(true)}
                  disabled={loading || saving || !doctorId}
                >
                  <FiPlus size={15} />
                  {saving
                    ? "Saving…"
                    : activeDays.length > 0
                      ? "Edit Schedule"
                      : "Set Schedule"}
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="error-banner">
                  <FiAlertCircle size={16} />
                  {error}
                  <button
                    className="error-dismiss"
                    onClick={() => setError(null)}
                  >
                    ✕
                  </button>
                </div>
              )}

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner" />
                  Loading your schedule…
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="stats-row">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FiCalendar size={18} />
                      </div>
                      <div>
                        <div className="stat-label">Active Days</div>
                        <div className="stat-value">{activeDays.length}</div>
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
                        <div className="stat-label">Online</div>
                        <div
                          className="stat-value"
                          style={{ color: "#1e6091" }}
                        >
                          {onlineDays.length}
                        </div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">
                        <FiClock size={18} />
                      </div>
                      <div>
                        <div className="stat-label">Physical</div>
                        <div className="stat-value">{physicalDays.length}</div>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div
                        className="stat-icon"
                        style={{ background: "#e8f4e8", color: "#276749" }}
                      >
                        <FiClock size={18} />
                      </div>
                      <div>
                        <div className="stat-label">Days Off</div>
                        <div
                          className="stat-value"
                          style={{ color: "#276749" }}
                        >
                          {7 - activeDays.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Empty state */}
                  {activeDays.length === 0 ? (
                    <div className="empty-state">
                      <FiCalendar
                        size={48}
                        style={{ color: "#c4b5e8", marginBottom: 16 }}
                      />
                      <h3>No Schedule Yet</h3>
                      <p>
                        Set your working hours so patients know when you're
                        available.
                      </p>
                      <button
                        className="btn-add-schedule"
                        onClick={() => setModalOpen(true)}
                        disabled={!doctorId}
                      >
                        <FiPlus size={15} /> Set Schedule
                      </button>
                    </div>
                  ) : (
                    <div className="schedule-grid">
                      {DAYS_OF_WEEK.map((day) => {
                        const entry = schedule[day];
                        const colors = entry
                          ? slotTypeColor(entry.slotType)
                          : null;

                        if (!entry) {
                          return (
                            <div
                              key={day}
                              className="empty-day-card"
                              onClick={() => setModalOpen(true)}
                            >
                              <div className="empty-day-inner">
                                <div className="empty-day-name">{day}</div>
                                <FiPlus
                                  size={20}
                                  style={{ color: "#c4b5e8" }}
                                />
                                <div className="empty-day-hint">
                                  Click to add hours
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={day} className="day-card">
                            <div className="day-card-header">
                              <div className="day-card-header-left">
                                <span className="day-name">{day}</span>
                              </div>
                              <div className="day-actions">
                                <button
                                  className="btn-icon btn-edit"
                                  onClick={() => setModalOpen(true)}
                                  title="Edit"
                                >
                                  <FiEdit2 size={13} />
                                </button>
                                <button
                                  className="btn-icon btn-delete"
                                  onClick={() => handleDeleteDay(day)}
                                  disabled={deletingDay === day}
                                  title="Remove"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <div className="day-card-body">
                              <div className="hours-row">
                                <div className="hours-icon">
                                  <FiClock size={16} />
                                </div>
                                <div>
                                  <div className="hours-text">
                                    {formatTime(entry.startTime)} –{" "}
                                    {formatTime(entry.endTime)}
                                  </div>
                                  <div className="hours-sub">
                                    Available hours
                                  </div>
                                </div>
                              </div>

                              {/* ── FIX: was rendering booleans, now renders icon + label ── */}
                              <span
                                className="type-badge"
                                style={{
                                  background: colors.bg,
                                  color: colors.color,
                                  borderColor: colors.border,
                                }}
                              >
                                <SlotIcon type={entry.slotType} />
                                {slotTypeLabel(entry.slotType)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <SetScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        savedSchedule={schedule}
        onSave={handleScheduleSave}
        saving={saving}
      />
    </>
  );
}

export default DoctorSchedule;

import { useState, useEffect } from "react";
import {
  FiX,
  FiCheck,
  FiClock,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";

// ──────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_START = "09:00";
const DEFAULT_END = "17:00";

const emptySchedule = () => {
  const s = {};
  DAYS_OF_WEEK.forEach((d) => (s[d] = null));
  return s;
};

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

const formatTime = (time) => {
  if (!time) return "—";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

const isValidRange = (start, end) => !!start && !!end && start < end;

// ──────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────

/**
 * SetScheduleModal
 *
 * Each day has ONE working-hours window:
 *   - Toggle to enable/disable a day
 *   - Start time picker
 *   - End time picker
 *   - Consultation type: physical | online | both
 */
function SetScheduleModal({
  isOpen,
  onClose,
  savedSchedule,
  onSave,
  saving = false,
}) {
  const [local, setLocal] = useState(emptySchedule);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);

  // Sync with parent when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const clone = {};
    DAYS_OF_WEEK.forEach((d) => {
      const entry = savedSchedule?.[d];
      clone[d] = entry ? { ...entry } : null;
    });
    setLocal(clone);
    setErrors({});
    setAttempted(false);
  }, [isOpen, savedSchedule]);

  if (!isOpen) return null;

  // ── Toggle day on/off ──────────────────────────────────────────────
  const toggleDay = (day) => {
    setLocal((prev) => ({
      ...prev,
      [day]: prev[day]
        ? null
        : {
            startTime: DEFAULT_START,
            endTime: DEFAULT_END,
            slotType: "physical",
          },
    }));
  };

  // ── Update a field for a day ───────────────────────────────────────
  const updateDay = (day, field, value) => {
    setLocal((prev) => ({
      ...prev,
      [day]: prev[day] ? { ...prev[day], [field]: value } : prev[day],
    }));
    if (attempted)
      validate({ ...local, [day]: { ...local[day], [field]: value } });
  };

  // ── Validation ─────────────────────────────────────────────────────
  const validate = (state = local) => {
    const errs = {};
    DAYS_OF_WEEK.forEach((day) => {
      const entry = state[day];
      if (!entry) return;
      if (!entry.startTime || !entry.endTime) {
        errs[day] = "Both times are required.";
      } else if (!isValidRange(entry.startTime, entry.endTime)) {
        errs[day] = "End time must be after start time.";
      }
    });
    setErrors(errs);
    return errs;
  };

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSave = () => {
    setAttempted(true);
    const errs = validate();
    if (Object.keys(errs).length > 0) return;
    onSave(local);
  };

  const enabledDays = DAYS_OF_WEEK.filter((d) => local[d] !== null);
  const hasErrors = Object.keys(errors).length > 0;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .sm-overlay {
          position: fixed; inset: 0; background: rgba(4, 4, 4, 0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .sm-container {
          background: #fff; border-radius: 20px; width: 100%;
          max-width: 620px; max-height: 92vh; display: flex;
          flex-direction: column; box-shadow: 0 24px 64px rgba(77,34,124,0.25);
          overflow: hidden; animation: smIn 0.3s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes smIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Header */
        .sm-header {
          background-color: #4D227C;
          color: #fff; padding: 22px 28px;
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-shrink: 0;
        }
        .sm-header h2 { margin: 0 0 4px; font-size: 20px; font-weight: 800; }
        .sm-header p  { margin: 0; font-size: 13px; opacity: 0.75; }
        .sm-close {
          background: rgba(255,255,255,0.15); border: none; color: #fff;
          width: 34px; height: 34px; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s; flex-shrink: 0;
        }
        .sm-close:hover { background: rgba(255,255,255,0.25); }

        /* Body */
        .sm-body { overflow-y: auto; padding: 20px 28px; flex: 1; }

        /* Day row */
        .sm-day-row {
          margin-bottom: 12px; border-radius: 14px; overflow: hidden;
          border: 1.5px solid #e8dff5; transition: border-color 0.2s;
        }
        .sm-day-row.active { border-color: #4D227C; }
        .sm-day-row.has-error { border-color: #fca5a5; }

        .sm-day-toggle {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; background: #faf7ff; cursor: pointer;
          user-select: none; transition: background 0.15s;
        }
        .sm-day-row.active .sm-day-toggle { background: #f0eafa; }
        .sm-day-toggle:hover { background: #ede7f6; }

        .sm-day-name-wrap { display: flex; align-items: center; gap: 10px; }
        .sm-day-dot {
          width: 10px; height: 10px; border-radius: 50%;
          background: #d0c0ee; transition: background 0.2s;
          flex-shrink: 0;
        }
        .sm-day-row.active .sm-day-dot { background: #4D227C; }
        .sm-day-name { font-weight: 700; font-size: 14px; color: #2d2040; }
        .sm-day-preview { font-size: 12px; color: #9e84c2; }

        .sm-toggle-btn {
          background: none; border: none; cursor: pointer;
          color: #d0c0ee; transition: color 0.2s;
          display: flex; align-items: center;
        }
        .sm-day-row.active .sm-toggle-btn { color: #4D227C; }

        /* Expanded fields */
        .sm-day-fields {
          padding: 16px 18px 18px; border-top: 1.5px solid #e8dff5;
          display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;
          background: #fff;
        }
        .sm-field { display: flex; flex-direction: column; gap: 5px; }
        .sm-label {
          font-size: 11px; font-weight: 700; color: #9e84c2;
          text-transform: uppercase; letter-spacing: 0.6px;
        }
        .sm-input {
          padding: 9px 12px; border-radius: 9px;
          border: 1.5px solid #d8c8f0; font-size: 13px;
          font-family: inherit; color: #2d2040; background: #faf7ff;
          transition: border-color 0.15s; outline: none; width: 100%;
          box-sizing: border-box;
        }
        .sm-input:focus { border-color: #4D227C; background: #fff; }

        /* Type selector */
        .sm-type-grid { display: flex; gap: 6px; }
        .sm-type-btn {
          flex: 1; padding: 8px 4px; border-radius: 8px;
          border: 1.5px solid #d8c8f0; background: #faf7ff;
          color: #9e84c2; font-size: 11px; font-weight: 700;
          cursor: pointer; transition: all 0.15s; text-align: center;
          font-family: inherit; white-space: nowrap;
        }
        .sm-type-btn:hover { border-color: #4D227C; color: #4D227C; }
        .sm-type-btn.selected {
          background: #4D227C; border-color: #4D227C; color: #fff;
        }

        .sm-error-msg {
          font-size: 11px; color: #e53e3e; font-weight: 500;
          padding: 0 18px 12px; background: #fff;
        }

        /* Quick apply */
        .sm-quick {
          margin-bottom: 20px; padding: 14px 16px;
          background: #faf7ff; border-radius: 12px;
          border: 1.5px dashed #d8c8f0;
        }
        .sm-quick-label {
          font-size: 11px; font-weight: 700; color: #9e84c2;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;
        }
        .sm-quick-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .sm-quick-btn {
          padding: 6px 14px; border-radius: 20px;
          border: 1.5px solid #d8c8f0; background: #fff;
          color: #6b38a8; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .sm-quick-btn:hover { background: #4D227C; color: #fff; border-color: #4D227C; }

        /* Footer */
        .sm-footer {
          padding: 16px 28px; border-top: 1.5px solid #f0ebfa;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px; flex-shrink: 0; background: #fff;
        }
        .sm-footer-info { font-size: 12px; color: #9e84c2; }
        .sm-footer-info strong { color: #4D227C; }
        .sm-footer-actions { display: flex; gap: 10px; }
        .btn-cancel {
          padding: 10px 20px; border-radius: 10px;
          border: 1.5px solid #e0d4f5; background: #fff; color: #6b38a8;
          font-weight: 700; font-size: 13px; cursor: pointer; font-family: inherit;
          transition: all 0.15s;
        }
        .btn-cancel:hover { border-color: #4D227C; background: #faf7ff; }
        .btn-save {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 24px; border-radius: 10px; border: none;
          background: #4D227C; color: #fff; font-weight: 700;
          font-size: 13px; cursor: pointer; font-family: inherit;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(77,34,124,0.3);
        }
        .btn-save:hover:not(:disabled) { background: #3a1860; transform: translateY(-1px); }
        .btn-save:disabled { background: #9e84c2; cursor: not-allowed; box-shadow: none; }

        @media (max-width: 520px) {
          .sm-day-fields { grid-template-columns: 1fr 1fr; }
          .sm-body { padding: 16px 16px; }
          .sm-header, .sm-footer { padding: 18px 16px; }
        }
      `}</style>

      <div
        className="sm-overlay"
        onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
      >
        <div className="sm-container">
          {/* Header */}
          <div className="sm-header">
            <div>
              <h2>Set Working Hours</h2>
              <p>
                Choose which days you're available and your hours for each day
              </p>
            </div>
            <button className="sm-close" onClick={onClose} disabled={saving}>
              <FiX size={16} />
            </button>
          </div>

          <div className="sm-body">
            {/* Quick presets */}
            <div className="sm-quick">
              <div className="sm-quick-label">Quick Presets</div>
              <div className="sm-quick-btns">
                <button
                  className="sm-quick-btn"
                  onClick={() => {
                    const next = {};
                    DAYS_OF_WEEK.forEach((d) => {
                      next[d] = [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                      ].includes(d)
                        ? {
                            startTime: "09:00",
                            endTime: "17:00",
                            slotType: "physical",
                          }
                        : null;
                    });
                    setLocal(next);
                  }}
                >
                  Mon–Fri (9–5)
                </button>

                <button
                  className="sm-quick-btn"
                  onClick={() => {
                    const next = {};
                    DAYS_OF_WEEK.forEach((d) => {
                      next[d] = [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                      ].includes(d)
                        ? {
                            startTime: "08:00",
                            endTime: "18:00",
                            slotType: "physical",
                          }
                        : null;
                    });
                    setLocal(next);
                  }}
                >
                  Mon–Fri (8–6)
                </button>

                <button
                  className="sm-quick-btn"
                  onClick={() => {
                    const next = {};
                    DAYS_OF_WEEK.forEach((d) => {
                      next[d] =
                        d !== "Sunday"
                          ? {
                              startTime: "09:00",
                              endTime: "17:00",
                              slotType: "physical",
                            }
                          : null;
                    });
                    setLocal(next);
                  }}
                >
                  Mon–Sat (9–5)
                </button>

                <button
                  className="sm-quick-btn"
                  onClick={() => {
                    const next = {};
                    DAYS_OF_WEEK.forEach((d) => {
                      next[d] = null;
                    });
                    setLocal(next);
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Day rows */}
            {DAYS_OF_WEEK.map((day) => {
              const entry = local[day];
              const isActive = entry !== null;
              const err = errors[day];

              return (
                <div
                  key={day}
                  className={`sm-day-row${isActive ? " active" : ""}${err ? " has-error" : ""}`}
                >
                  {/* Toggle row */}
                  <div className="sm-day-toggle" onClick={() => toggleDay(day)}>
                    <div className="sm-day-name-wrap">
                      <div className="sm-day-dot" />
                      <span className="sm-day-name">{day}</span>
                      {isActive && entry.startTime && entry.endTime && (
                        <span className="sm-day-preview">
                          {formatTime(entry.startTime)} –{" "}
                          {formatTime(entry.endTime)}
                        </span>
                      )}
                    </div>
                    <button className="sm-toggle-btn" tabIndex={-1}>
                      {isActive ? (
                        <FiToggleRight size={24} />
                      ) : (
                        <FiToggleLeft size={24} />
                      )}
                    </button>
                  </div>

                  {/* Expanded fields */}
                  {isActive && (
                    <>
                      <div className="sm-day-fields">
                        {/* Start time */}
                        <div className="sm-field">
                          <label className="sm-label">Start Time</label>
                          <input
                            type="time"
                            className="sm-input"
                            value={entry.startTime}
                            onChange={(e) =>
                              updateDay(day, "startTime", e.target.value)
                            }
                          />
                        </div>

                        {/* End time */}
                        <div className="sm-field">
                          <label className="sm-label">End Time</label>
                          <input
                            type="time"
                            className="sm-input"
                            value={entry.endTime}
                            onChange={(e) =>
                              updateDay(day, "endTime", e.target.value)
                            }
                          />
                        </div>

                        {/* Consultation type */}
                        <div className="sm-field">
                          <label className="sm-label">Type</label>
                          <div className="sm-type-grid">
                            {[
                              { value: "physical", label: "Physical" },
                              { value: "online", label: "Online" },
                              { value: "both", label: "Both" },
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                className={`sm-type-btn${entry.slotType === opt.value ? " selected" : ""}`}
                                onClick={() =>
                                  updateDay(day, "slotType", opt.value)
                                }
                                type="button"
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {err && <div className="sm-error-msg">⚠ {err}</div>}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="sm-footer">
            <span className="sm-footer-info">
              <strong>{enabledDays.length}</strong> day
              {enabledDays.length !== 1 ? "s" : ""} enabled
              {hasErrors && attempted && (
                <span style={{ color: "#e53e3e", marginLeft: 8 }}>
                  · Fix errors before saving
                </span>
              )}
            </span>
            <div className="sm-footer-actions">
              <button
                className="btn-cancel"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={saving || enabledDays.length === 0}
              >
                {saving ? (
                  "Saving…"
                ) : (
                  <>
                    <FiCheck size={14} /> Save Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SetScheduleModal;

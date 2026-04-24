import { useState, useRef, useEffect, useCallback } from "react";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
} from "date-fns";
import {
  FiX,
  FiChevronDown,
  FiSearch,
  FiUpload,
  FiFile,
  FiTrash2,
  FiCheck,
  FiChevronRight,
  FiEye,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiPlus,
  FiDollarSign,
  FiChevronLeft,
  FiClock,
  FiCalendar,
} from "react-icons/fi";
import styles from "../DoctorStyle/CreateAppointmentModal.module.css";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  "";

/* ─── Formatters ─── */
function formatTimePH(time24) {
  if (!time24) return "—";
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${period}`;
}

function formatDatePH(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(
    typeof dateStr === "string" && dateStr.length === 10
      ? dateStr + "T00:00:00"
      : dateStr,
  );
  if (isNaN(d.getTime())) return "—";
  return format(d, "MMMM d, yyyy");
}

function formatPeso(amount) {
  if (amount === null || amount === undefined || amount === "") return "—";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

const toastError = {
  duration: 1500,
  style: {
    background: "#FDECEA",
    border: "1px solid #F5C6CB",
    color: "#C62828",
    fontWeight: 600,
    fontSize: "0.9rem",
    textAlign: "center",
    maxWidth: "320px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
  },
  iconTheme: { primary: "#C62828", secondary: "#FDECEA" },
};

/* ─── Day name map ─── */
const DAY_NAMES = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};
const DAY_ABBR = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

/* ─────────────────────────────────────────────────────────
   Helper: check if a time slot overlaps any booked slot.

   Each selectable slot represents a 1-HOUR appointment
   (e.g. picking 11:00 AM means 11:00–12:00).
   A slot is considered unavailable if selecting it would
   cause ANY overlap with an existing confirmed booking:

     newStart < bookedEnd  AND  newEnd > bookedStart

   This correctly hides:
     • 11:00 AM  → new end 12:00  overlaps 11:30–12:30 ✓
     • 10:30 AM  → new end 11:30  overlaps 11:00–12:00 ✓
     • 11:30 AM  → new end 12:30  overlaps 11:00–12:00 ✓
───────────────────────────────────────────────────────── */
const APPOINTMENT_DURATION_MINS = 60; // 1-hour appointments

function isSlotBooked(slotTime, bookedSlots) {
  if (!bookedSlots || bookedSlots.length === 0) return false;
  const [sh, sm] = slotTime.split(":").map(Number);
  const slotStart = sh * 60 + sm;
  const slotEnd = slotStart + APPOINTMENT_DURATION_MINS; // 60-min appointment

  return bookedSlots.some((b) => {
    const [bsh, bsm] = b.start_time.split(":").map(Number);
    const [beh, bem] = b.end_time.split(":").map(Number);
    const bookedStart = bsh * 60 + bsm;
    // If backend end_time is missing or equal to start, derive it too
    const bookedEnd =
      beh * 60 + bem > bookedStart
        ? beh * 60 + bem
        : bookedStart + APPOINTMENT_DURATION_MINS;
    // Overlap: new slot starts before booked ends AND new slot ends after booked starts
    return slotStart < bookedEnd && slotEnd > bookedStart;
  });
}

/* ─────────────────────────────────────────────────────────
   Helper: build every selectable start-time slot within a
   schedule window.  Slots are 30-min apart but each slot
   represents a 60-min appointment, so the last valid start
   is  scheduleEnd − APPOINTMENT_DURATION_MINS.
───────────────────────────────────────────────────────── */
function buildAllSlotsForSchedule(schedEntry) {
  if (!schedEntry) return [];
  const startH = parseInt(schedEntry.start_time.split(":")[0]);
  const startM = parseInt(schedEntry.start_time.split(":")[1]);
  const endH = parseInt(schedEntry.end_time.split(":")[0]);
  const endM = parseInt(schedEntry.end_time.split(":")[1]);
  const schedEndMins = endH * 60 + endM;

  const slots = [];
  for (let h = startH; h <= endH; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === startH && m < startM) continue;
      const slotStart = h * 60 + m;
      const slotEnd = slotStart + APPOINTMENT_DURATION_MINS;
      // only include if the full 60-min appointment fits inside the schedule
      if (slotEnd > schedEndMins) continue;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

/* ─────────────────────────────────────────────────────────
   Helper: true when EVERY slot on a given date is taken.
   bookedSlotsForDate — [{start_time, end_time}, ...]
   doctorSchedule     — full weekly schedule array
   dateStr            — "yyyy-MM-dd"
───────────────────────────────────────────────────────── */
function isDateFullyBooked(dateStr, bookedSlotsForDate, doctorSchedule) {
  if (!bookedSlotsForDate || bookedSlotsForDate.length === 0) return false;
  if (!doctorSchedule || doctorSchedule.length === 0) return false;
  const dayNum = new Date(dateStr + "T00:00:00").getDay();
  const schedEntry = doctorSchedule.find((s) => s.day_num === dayNum);
  if (!schedEntry) return false; // not a scheduled day — already greyed by availableDayNums
  const allSlots = buildAllSlotsForSchedule(schedEntry);
  if (allSlots.length === 0) return false;
  return allSlots.every((t) => isSlotBooked(t, bookedSlotsForDate));
}

/* ─────────────────────────────────────────────────────────
   ImagePreviewModal
───────────────────────────────────────────────────────── */
function ImagePreviewModal({ file, src, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const contentRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 4));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.5));
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      setZoom((z) => Math.max(0.5, Math.min(4, z - e.deltaY * 0.001)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const isPdf = file?.type === "application/pdf";
  const toolbarBtn = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "6px",
    color: "#ccc",
    cursor: "pointer",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        backgroundColor: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "52px",
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiFile style={{ color: "#aaa", flexShrink: 0 }} />
          <span
            style={{
              color: "#fff",
              fontSize: "13px",
              fontWeight: "600",
              maxWidth: "280px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file?.name}
          </span>
          <span style={{ color: "#666", fontSize: "11px" }}>
            {file?.size ? `(${(file.size / 1024).toFixed(1)} KB)` : ""}
          </span>
        </div>
        {!isPdf && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              style={toolbarBtn}
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            >
              <FiZoomOut size={15} />
            </button>
            <span
              style={{
                color: "#ccc",
                fontSize: "12px",
                minWidth: "38px",
                textAlign: "center",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              style={toolbarBtn}
              onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
            >
              <FiZoomIn size={15} />
            </button>
            <button
              style={toolbarBtn}
              onClick={() => {
                setZoom(1);
                setPos({ x: 0, y: 0 });
              }}
            >
              <FiMaximize2 size={15} />
            </button>
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            color: "#fff",
            cursor: "pointer",
            padding: "7px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FiX size={17} />
        </button>
      </div>
      <div
        ref={contentRef}
        style={{
          marginTop: "52px",
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "default",
          userSelect: "none",
        }}
        onMouseDown={(e) => {
          if (zoom <= 1) return;
          setDragging(true);
          setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
        }}
        onMouseMove={(e) => {
          if (!dragging) return;
          setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
        }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
      >
        {isPdf ? (
          <iframe
            src={src}
            style={{
              width: "90vw",
              height: "calc(100vh - 76px)",
              border: "none",
              borderRadius: "8px",
            }}
            title="PDF preview"
          />
        ) : (
          <img
            src={src}
            alt={file?.name}
            draggable={false}
            style={{
              maxWidth: zoom <= 1 ? "90vw" : `${zoom * 90}vw`,
              maxHeight: zoom <= 1 ? "calc(100vh - 76px)" : "none",
              transform: `translate(${pos.x}px,${pos.y}px)`,
              borderRadius: "6px",
              boxShadow: "0 0 40px rgba(0,0,0,0.5)",
              transition: dragging ? "none" : "max-width .15s",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
      {!isPdf && (
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(255,255,255,0.3)",
            fontSize: "11px",
            pointerEvents: "none",
          }}
        >
          Scroll to zoom · Drag to pan · Esc to close
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PatientSearchDropdown
───────────────────────────────────────────────────────── */
function PatientSearchDropdown({ onSelect, value }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchPatients = useCallback(async (q, signal) => {
    setLoading(true);
    try {
      const qs = q.trim() ? `&search=${encodeURIComponent(q)}` : "";
      const res = await fetch(`${API_BASE}/admin/patients?per_page=20${qs}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
        signal,
      });
      const json = await res.json();
      setPatients(json.data || []);
    } catch (e) {
      if (e.name !== "AbortError") console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    fetchPatients(query, ctrl.signal);
    return () => ctrl.abort();
  }, [open, query, fetchPatients]);

  const displayName = value
    ? `${value.firstName}${value.middleInitial ? " " + value.middleInitial + "." : ""} ${value.lastName}`
    : "";

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 13px",
          borderRadius: "9px",
          border: open ? "1.5px solid #4D227C" : "1.5px solid #e2d5f5",
          fontSize: "13px",
          backgroundColor: "#fff",
          cursor: "pointer",
          color: value ? "#333" : "#aaa",
          boxShadow: open ? "0 0 0 3px rgba(77,34,124,0.1)" : "none",
          transition: "border .2s,box-shadow .2s",
          userSelect: "none",
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
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
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
            boxShadow: "0 8px 24px rgba(77,34,124,.14)",
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
              placeholder="Search by name, email, or contact…"
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
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            {loading ? (
              <div
                style={{
                  padding: "14px",
                  color: "#aaa",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                Loading…
              </div>
            ) : patients.length === 0 ? (
              <div
                style={{
                  padding: "14px",
                  color: "#aaa",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                No patients found
              </div>
            ) : (
              patients.map((p) => {
                const isActive = value?.patient_id === p.patient_id;
                const name = `${p.firstName}${p.middleInitial ? " " + p.middleInitial + "." : ""} ${p.lastName}`;
                return (
                  <div
                    key={p.patient_id}
                    onClick={() => {
                      onSelect(p);
                      setOpen(false);
                      setQuery("");
                    }}
                    style={{
                      padding: "10px 16px",
                      fontSize: "13px",
                      cursor: "pointer",
                      color: isActive ? "#4D227C" : "#333",
                      fontWeight: isActive ? "600" : "400",
                      backgroundColor: isActive ? "#f3ecfc" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "background .15s",
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
                        width: "32px",
                        height: "32px",
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
                      {(p.firstName || " ")[0]}
                      {(p.lastName || " ")[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "600" }}>{name}</div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          marginTop: "2px",
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {p.contactNo && <span>{p.contactNo}</span>}
                        {p.email && <span>✉ {p.email}</span>}
                      </div>
                    </div>
                    {isActive && (
                      <FiCheck style={{ color: "#4D227C", flexShrink: 0 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div
            style={{
              padding: "7px 14px",
              borderTop: "1px solid #f0eaf8",
              fontSize: "11px",
              color: "#bbb",
              textAlign: "center",
            }}
          >
            Top 20 results — type to search more
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PatientInfoCard
───────────────────────────────────────────────────────── */
function Row({ label, value }) {
  return value ? (
    <div>
      <span style={{ color: "#888", fontSize: "12px" }}>{label}: </span>
      <strong style={{ fontSize: "12px" }}>{value}</strong>
    </div>
  ) : null;
}

function PatientInfoCard({ patient, onClear }) {
  const age = (() => {
    if (!patient.dob) return null;
    const b = new Date(patient.dob),
      t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) a--;
    return a >= 0 ? a : null;
  })();

  return (
    <div
      style={{
        background: "#f5f0fb",
        border: "1.5px solid #d4bbf0",
        borderRadius: "10px",
        padding: "14px 16px",
        marginTop: "10px",
        position: "relative",
      }}
    >
      <button
        onClick={onClear}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "none",
          border: "1px solid #c4a8e8",
          borderRadius: "6px",
          cursor: "pointer",
          color: "#7c3aed",
          fontSize: "11px",
          padding: "3px 8px",
          fontWeight: "600",
        }}
      >
        Change
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#4D227C",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "700",
            flexShrink: 0,
          }}
        >
          {(patient.firstName || " ")[0]}
          {(patient.lastName || " ")[0]}
        </div>
        <div>
          <div
            style={{ fontWeight: "700", color: "#2d1254", fontSize: "14px" }}
          >
            {patient.firstName}
            {patient.middleInitial
              ? " " + patient.middleInitial + "."
              : ""}{" "}
            {patient.lastName}
          </div>
          <div style={{ fontSize: "11px", color: "#7c3aed" }}>
            Patient ID #{patient.patient_id}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "5px 20px",
        }}
      >
        <Row label="Age" value={age !== null ? `${age} years old` : null} />
        <Row
          label="DOB"
          value={patient.dob ? formatDatePH(patient.dob) : null}
        />
        <Row label="Sex" value={patient.sex} />
        <Row label="Civil Status" value={patient.civilStatus} />
        <Row label="Contact" value={patient.contactNo} />
        <Row label="Classification" value={patient.patientClassification} />
        {patient.email && (
          <div style={{ gridColumn: "1/-1" }}>
            <Row label="Email" value={patient.email} />
          </div>
        )}
        {patient.address && (
          <div style={{ gridColumn: "1/-1" }}>
            <Row label="Address" value={patient.address} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ScheduleBadge
───────────────────────────────────────────────────────── */
function ScheduleBadge({ schedule }) {
  if (!schedule || schedule.length === 0)
    return (
      <div
        style={{
          marginTop: "10px",
          padding: "10px 14px",
          background: "#fff8f0",
          border: "1px solid #fed7aa",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#9a3412",
        }}
      >
        ⚠ No schedule set for this doctor.
      </div>
    );

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "12px 14px",
        background: "#f1e8fbc2",
        border: "1px solid #bbf7d0",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: "#4D227C",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <FiClock size={12} /> Available Schedule
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {schedule.map((s) => {
          const slotColor =
            s.slot_type === "online"
              ? { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" }
              : s.slot_type === "physical"
                ? { bg: "#f5f0fb", border: "#d4b8f0", text: "#4D227C" }
                : { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" };
          return (
            <div
              key={s.schedule_id || s.day_num}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                }}
              >
                <span
                  style={{
                    width: "32px",
                    height: "22px",
                    borderRadius: "5px",
                    background: "#4D227C",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {DAY_ABBR[s.day_num]}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#374151",
                    fontWeight: "500",
                  }}
                >
                  {formatTimePH(s.start_time)} – {formatTimePH(s.end_time)}
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  padding: "2px 8px",
                  borderRadius: "20px",
                  background: slotColor.bg,
                  border: `1px solid ${slotColor.border}`,
                  color: slotColor.text,
                  textTransform: "capitalize",
                  whiteSpace: "nowrap",
                }}
              >
                {s.slot_type === "both" ? "Online & Physical" : s.slot_type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DoctorDropdown
───────────────────────────────────────────────────────── */
function DoctorDropdown({ onSelect, value, onScheduleLoad }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const ref = useRef(null);

  const onScheduleLoadRef = useRef(onScheduleLoad);
  useEffect(() => {
    onScheduleLoadRef.current = onScheduleLoad;
  }, [onScheduleLoad]);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/doctors/list`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });
      const json = await res.json();
      setDoctors(json.data || []);
    } catch (e) {
      console.error("Failed to load doctors:", e);
    }
  }, []);

  useEffect(() => {
    if (open) fetchDoctors();
  }, [open, fetchDoctors]);

  const fetchSchedule = useCallback(async (doctor) => {
    const doctorTableId = doctor.doctor_id ?? doctor.id;
    if (!doctorTableId) {
      setSchedule([]);
      onScheduleLoadRef.current?.([]);
      return;
    }
    setScheduleLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/doctors/${doctorTableId}/schedules`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
          },
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const sched = json.data?.schedule || [];
      setSchedule(sched);
      onScheduleLoadRef.current?.(sched);
    } catch (e) {
      console.error("Failed to fetch doctor schedule:", e);
      setSchedule([]);
      onScheduleLoadRef.current?.([]);
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (value) {
      fetchSchedule(value);
    } else {
      setSchedule([]);
      onScheduleLoadRef.current?.([]);
    }
  }, [value, fetchSchedule]);

  const filtered = doctors.filter((d) =>
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(query.toLowerCase()),
  );

  const displayName = value
    ? `${value.firstName}${value.middleInitial ? " " + value.middleInitial + "." : ""} ${value.lastName}`
    : "";

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: "#4D227C",
          textTransform: "uppercase",
          letterSpacing: "0.7px",
          marginBottom: "8px",
          display: "block",
        }}
      >
        Assigned Doctor
      </label>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 13px",
          borderRadius: "9px",
          border: open ? "1.5px solid #4D227C" : "1.5px solid #e2d5f5",
          fontSize: "13px",
          backgroundColor: "#fff",
          cursor: "pointer",
          color: value ? "#333" : "#aaa",
          boxShadow: open ? "0 0 0 3px rgba(77,34,124,.1)" : "none",
          transition: "all .2s",
          userSelect: "none",
        }}
      >
        <span>{displayName || "Select Assigned Doctor"}</span>
        <FiChevronDown
          style={{
            color: "#4D227C",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
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
            boxShadow: "0 8px 24px rgba(77,34,124,.14)",
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
            <FiSearch style={{ color: "#aaa" }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctor…"
              style={{
                border: "none",
                outline: "none",
                fontSize: "13px",
                width: "100%",
                backgroundColor: "transparent",
              }}
            />
          </div>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "14px",
                  color: "#aaa",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                No doctors found
              </div>
            ) : (
              filtered.map((d) => {
                const isActive = value?.id === d.id;
                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      onSelect(d);
                      setOpen(false);
                      setQuery("");
                    }}
                    style={{
                      padding: "10px 16px",
                      fontSize: "13px",
                      cursor: "pointer",
                      color: isActive ? "#4D227C" : "#333",
                      fontWeight: isActive ? "600" : "400",
                      backgroundColor: isActive ? "#f3ecfc" : "transparent",
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
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        backgroundColor: "#4D227C",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "700",
                      }}
                    >
                      {(d.firstName || " ")[0]}
                      {(d.lastName || " ")[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      {d.firstName}
                      {d.middleInitial ? " " + d.middleInitial + ". " : " "}
                      {d.lastName}
                      {d.doctor_id && (
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#aaa",
                            marginLeft: "6px",
                          }}
                        >
                          (Dr ID: {d.doctor_id})
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <FiCheck
                        style={{ marginLeft: "auto", color: "#4D227C" }}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {value &&
        (scheduleLoading ? (
          <div
            style={{
              marginTop: "10px",
              padding: "10px 14px",
              background: "#f9f5ff",
              border: "1px solid #e9d8fd",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                border: "2px solid #4D227C",
                borderTop: "2px solid transparent",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }}
            />
            Loading schedule…
          </div>
        ) : (
          <ScheduleBadge schedule={schedule} />
        ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CalendarDatePicker
───────────────────────────────────────────────────────── */
function CalendarDatePicker({
  value,
  onChange,
  availableDayNums = null,
  minDate = new Date(),
}) {
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = [];
  let cur = calStart;
  while (cur <= calEnd) {
    days.push(new Date(cur));
    cur = addDays(cur, 1);
  }

  const prevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const isDisabled = (d) => {
    if (isBefore(d, today)) return true;
    if (availableDayNums && availableDayNums.length > 0)
      return !availableDayNums.includes(d.getDay());
    return false;
  };

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  const handleSelect = (d) => {
    if (isDisabled(d)) return;
    onChange(format(d, "yyyy-MM-dd"));
    setOpen(false);
  };

  const displayValue = value ? formatDatePH(value) : null;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 13px",
          borderRadius: "9px",
          border: open
            ? "1.5px solid #4D227C"
            : value
              ? "1.5px solid #d4b8f0"
              : "1.5px solid #e2d5f5",
          background: value ? "#faf7ff" : "#fff",
          cursor: "pointer",
          transition: "all .2s",
          boxShadow: open ? "0 0 0 3px rgba(77,34,124,0.1)" : "none",
          userSelect: "none",
        }}
      >
        <FiCalendar
          size={15}
          style={{ color: value ? "#4D227C" : "#aaa", flexShrink: 0 }}
        />
        <span
          style={{
            fontSize: "13px",
            color: value ? "#2d1254" : "#aaa",
            fontWeight: value ? "600" : "400",
            flex: 1,
          }}
        >
          {displayValue || "Select date"}
        </span>
        <FiChevronDown
          size={14}
          style={{
            color: "#4D227C",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .2s",
            flexShrink: 0,
          }}
        />
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 99999,
            background: "#fff",
            border: "1px solid #e0d4f5",
            borderRadius: "14px",
            boxShadow: "0 16px 48px rgba(77,34,124,.18)",
            overflow: "hidden",
            minWidth: "300px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px 10px",
              borderBottom: "1px solid #f0eaf8",
            }}
          >
            <button
              onClick={prevMonth}
              style={{
                background: "none",
                border: "1px solid #e2d5f5",
                borderRadius: "7px",
                cursor: "pointer",
                padding: "6px 8px",
                color: "#4D227C",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f0fb")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <FiChevronLeft size={14} />
            </button>
            <span
              style={{
                fontWeight: "700",
                fontSize: "14px",
                color: "#2d1254",
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              {format(viewDate, "MMMM yyyy")}
            </span>
            <button
              onClick={nextMonth}
              style={{
                background: "none",
                border: "1px solid #e2d5f5",
                borderRadius: "7px",
                cursor: "pointer",
                padding: "6px 8px",
                color: "#4D227C",
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f0fb")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <FiChevronRight size={14} />
            </button>
          </div>

          {availableDayNums && availableDayNums.length > 0 && (
            <div
              style={{
                padding: "8px 14px",
                background: "#f0f9fd",
                borderBottom: "1px solid #d1fae5",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "#056696",
                  fontWeight: "700",
                }}
              >
                Available:
              </span>
              {availableDayNums.sort().map((n) => (
                <span
                  key={n}
                  style={{
                    fontSize: "10px",
                    background: "#4D227C",
                    color: "#fff",
                    padding: "2px 7px",
                    borderRadius: "20px",
                    fontWeight: "600",
                  }}
                >
                  {DAY_ABBR[n]}
                </span>
              ))}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              padding: "10px 12px 4px",
            }}
          >
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "#9c7dd4",
                  padding: "4px 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7,1fr)",
              padding: "0 12px 12px",
              gap: "2px",
            }}
          >
            {days.map((d, i) => {
              const disabled = isDisabled(d);
              const inMonth = isSameMonth(d, viewDate);
              const isSelected = selectedDate && isSameDay(d, selectedDate);
              const isTodayD = isToday(d);
              const isAvail =
                availableDayNums &&
                availableDayNums.includes(d.getDay()) &&
                !isBefore(d, today);

              return (
                <div
                  key={i}
                  onClick={() => handleSelect(d)}
                  style={{
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: isSelected ? "700" : "400",
                    cursor: disabled || !inMonth ? "default" : "pointer",
                    color: !inMonth
                      ? "#e5d9f5"
                      : isSelected
                        ? "#fff"
                        : disabled
                          ? "#d1d5db"
                          : isTodayD
                            ? "#4D227C"
                            : "#374151",
                    background: isSelected
                      ? "#4D227C"
                      : isTodayD && !isSelected
                        ? "#f3ecfc"
                        : "transparent",
                    border:
                      isTodayD && !isSelected
                        ? "1.5px solid #d4b8f0"
                        : "1.5px solid transparent",
                    position: "relative",
                    transition: "background .12s",
                    opacity: !inMonth ? 0.3 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled && inMonth && !isSelected)
                      e.currentTarget.style.background = "#f5f0fb";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.background =
                        isTodayD && !isSelected ? "#f3ecfc" : "transparent";
                  }}
                >
                  {d.getDate()}
                  {isAvail && !isSelected && inMonth && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "3px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "#056696",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: "8px 14px",
              borderTop: "1px solid #f0eaf8",
              fontSize: "10px",
              color: "#bbb",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            {availableDayNums && availableDayNums.length > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#056696",
                    display: "inline-block",
                  }}
                />
                Available day
              </span>
            )}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "4px",
                  background: "#4D227C",
                  display: "inline-block",
                }}
              />
              Selected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TimePicker
   FIX: slots are only shown if the full 60-min session
   fits within the schedule window (slotStart + 60 <= schedEnd).
   This correctly hides 4:30 PM and 5:00 PM when schedule
   ends at 5:00 PM — last valid start is 4:00 PM.
───────────────────────────────────────────────────────── */
function TimePicker({
  value,
  onChange,
  label,
  disabled = false,
  scheduleForDate = null,
  bookedSlots = [],
  loadingSlots = false,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const slotRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── BUILD SLOTS ──────────────────────────────────────────────────
  // Only include a slot if the full APPOINTMENT_DURATION_MINS session
  // fits entirely within the schedule window (strict: slotEnd <= schedEnd).
  const allSlots = [];
  if (scheduleForDate) {
    const startH = parseInt(scheduleForDate.start_time.split(":")[0]);
    const startM = parseInt(scheduleForDate.start_time.split(":")[1]);
    const endH = parseInt(scheduleForDate.end_time.split(":")[0]);
    const endM = parseInt(scheduleForDate.end_time.split(":")[1]);
    const schedEndMins = endH * 60 + endM;

    for (let h = startH; h <= endH; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === startH && m < startM) continue;
        const slotStartMins = h * 60 + m;
        const slotEndMins = slotStartMins + APPOINTMENT_DURATION_MINS;
        // ✅ FIX: skip if the 60-min session overflows the schedule end
        if (slotEndMins > schedEndMins) continue;
        allSlots.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        );
      }
    }
  }

  // Filter out booked slots — they simply won't appear in the list
  const availableSlots = allSlots.filter((t) => !isSlotBooked(t, bookedSlots));

  useEffect(() => {
    if (open && value && slotRef.current) {
      const el = slotRef.current.querySelector(`[data-time="${value}"]`);
      if (el) el.scrollIntoView({ block: "center" });
    }
  }, [open, value]);

  const displayValue = value ? formatTimePH(value) : null;
  const bookedCount = allSlots.length - availableSlots.length;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => {
          if (!disabled && !loadingSlots) setOpen((o) => !o);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 13px",
          borderRadius: "9px",
          border: open
            ? "1.5px solid #4D227C"
            : value
              ? "1.5px solid #d4b8f0"
              : "1.5px solid #e2d5f5",
          background: disabled ? "#f9f7fd" : value ? "#faf7ff" : "#fff",
          cursor: disabled || loadingSlots ? "not-allowed" : "pointer",
          transition: "all .2s",
          boxShadow: open ? "0 0 0 3px rgba(77,34,124,0.1)" : "none",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {loadingSlots ? (
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              border: "2px solid #4D227C",
              borderTop: "2px solid transparent",
              animation: "spin 0.8s linear infinite",
              flexShrink: 0,
            }}
          />
        ) : (
          <FiClock
            size={15}
            style={{ color: value ? "#4D227C" : "#aaa", flexShrink: 0 }}
          />
        )}
        <span
          style={{
            fontSize: "13px",
            color: loadingSlots ? "#aaa" : value ? "#2d1254" : "#aaa",
            fontWeight: value ? "600" : "400",
            flex: 1,
          }}
        >
          {loadingSlots ? "Loading slots…" : displayValue || "Select time"}
        </span>
        {!disabled && !loadingSlots && (
          <FiChevronDown
            size={14}
            style={{
              color: "#4D227C",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform .2s",
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Show how many slots are already taken */}
      {!disabled && bookedCount > 0 && !loadingSlots && (
        <div
          style={{
            marginTop: "4px",
            fontSize: "10px",
            color: "#9a3412",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#ef4444",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          {bookedCount} slot{bookedCount > 1 ? "s" : ""} already booked on this
          date
        </div>
      )}

      {open && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 99999,
            background: "#fff",
            border: "1px solid #e0d4f5",
            borderRadius: "12px",
            boxShadow: "0 12px 32px rgba(77,34,124,.16)",
            overflow: "hidden",
            width: "200px",
          }}
        >
          {scheduleForDate && (
            <div
              style={{
                padding: "8px 12px",
                background: "#f5f0fb",
                borderBottom: "1px solid #e9d8fd",
                fontSize: "10px",
                color: "#4D227C",
                fontWeight: "700",
              }}
            >
              Schedule: {formatTimePH(scheduleForDate.start_time)} –{" "}
              {formatTimePH(scheduleForDate.end_time)}
            </div>
          )}
          {bookedCount > 0 && (
            <div
              style={{
                padding: "6px 12px",
                background: "#fef2f2",
                borderBottom: "1px solid #fecaca",
                fontSize: "10px",
                color: "#991b1b",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {bookedCount} booked slot{bookedCount > 1 ? "s" : ""} hidden
            </div>
          )}
          <div ref={slotRef} style={{ maxHeight: "220px", overflowY: "auto" }}>
            {availableSlots.length === 0 ? (
              <div
                style={{
                  padding: "18px 14px",
                  color: "#9a3412",
                  fontSize: "12px",
                  textAlign: "center",
                  background: "#fff8f0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "20px" }}>📅</span>
                <span style={{ fontWeight: "600" }}>No available slots</span>
                <span style={{ color: "#aaa", fontSize: "11px" }}>
                  All time slots are booked for this date
                </span>
              </div>
            ) : (
              availableSlots.map((t) => {
                const isSelected = value === t;
                return (
                  <div
                    key={t}
                    data-time={t}
                    onClick={() => {
                      onChange(t);
                      setOpen(false);
                    }}
                    style={{
                      padding: "9px 14px",
                      fontSize: "13px",
                      cursor: "pointer",
                      color: isSelected ? "#fff" : "#374151",
                      fontWeight: isSelected ? "700" : "400",
                      background: isSelected ? "#4D227C" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background .12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "#f5f0fb";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <FiClock
                      size={12}
                      style={{
                        color: isSelected ? "#c4a8e8" : "#aaa",
                        flexShrink: 0,
                      }}
                    />
                    {formatTimePH(t)}
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

/* ─────────────────────────────────────────────────────────
   ServiceCard
───────────────────────────────────────────────────────── */
function ServiceCard({
  service,
  selected,
  onClick,
  accent = "#4D227C",
  subtitle = null,
}) {
  const isSel = selected === service.id;
  return (
    <div
      onClick={() => onClick(service.id)}
      style={{
        border: isSel ? `2px solid ${accent}` : "1.5px solid #ddd",
        borderRadius: "10px",
        padding: "14px 16px",
        cursor: "pointer",
        background: isSel ? "#f5f0fb" : "#fff",
        transition: "all .15s",
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: isSel ? `6px solid ${accent}` : "2px solid #bbb",
          flexShrink: 0,
          background: "#fff",
          transition: "all .15s",
          boxSizing: "border-box",
          marginTop: "2px",
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <span style={{ fontSize: "13.5px", color: "#555" }}>
          {service.title}
        </span>
        {service.fee !== null && service.fee !== undefined && (
          <span
            style={{ fontSize: "12px", color: "#059669", fontWeight: "600" }}
          >
            Default fee: {formatPeso(service.fee)}
          </span>
        )}
        {subtitle && (
          <span
            style={{ fontSize: "12px", fontWeight: "600", color: "#1d6fa4" }}
          >
            ✓ {subtitle}
          </span>
        )}
      </div>
      {isSel && (
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

/* ─────────────────────────────────────────────────────────
   ReceiptItem
───────────────────────────────────────────────────────── */
function ReceiptItem({ entry, onRemove, onPreview }) {
  const isImage = entry.file.type.startsWith("image/");
  return (
    <div className="receipt-preview-wrap" style={{ marginBottom: "8px" }}>
      {isImage ? (
        <img
          src={entry.url}
          alt="receipt preview"
          className="receipt-thumb-img"
          onClick={() => onPreview(entry)}
        />
      ) : (
        <div className="receipt-thumb-pdf">
          <FiFile size={22} color="#9c7dd4" />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#333",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.file.name}
        </div>
        <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>
          {(entry.file.size / 1024).toFixed(1)} KB
        </div>
      </div>
      <button className="receipt-view-btn" onClick={() => onPreview(entry)}>
        <FiEye size={13} /> View
      </button>
      <button
        className="receipt-remove-btn"
        onClick={() => onRemove(entry.id)}
        title="Remove file"
      >
        <FiTrash2 size={14} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   EMPTY FORM
───────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  informant_name: "",
  informant_relation: "",
  appointment_date: "",
  start_time: "",
  end_time: "",
  visit_type: "onsite",
  reason_for_consultation: "",
  service_type: "",
  pae_purpose: "",
  payment_status: "not_paid",
  payment_reference: "",
  bill_amount: "",
};

/* ─────────────────────────────────────────────────────────
   CreateAppointmentModal — MAIN
───────────────────────────────────────────────────────── */
function CreateAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  onAdd,
  showReceipt = false,
  showAssignedDoctor = false,
  isAdmin = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [showPAEPanel, setShowPAEPanel] = useState(false);
  const [receiptEntries, setReceiptEntries] = useState([]);
  const [previewEntry, setPreviewEntry] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [services, setServices] = useState([]);
  const [paePurposes, setPaePurposes] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [billManuallyEdited, setBillManuallyEdited] = useState(false);

  // ── booked slots state ───────────────────────────────────────────
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookedSlotsLoading, setBookedSlotsLoading] = useState(false);

  const receiptInputRef = useRef(null);
  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const availableDayNums = doctorSchedule.map((s) => s.day_num);
  const scheduleForDate = (() => {
    if (!form.appointment_date || doctorSchedule.length === 0) return null;
    const d = new Date(form.appointment_date + "T00:00:00");
    const dayNum = d.getDay();
    return doctorSchedule.find((s) => s.day_num === dayNum) || null;
  })();

  // ── Fetch booked slots whenever doctor + date both selected ───────
  useEffect(() => {
    if (!selectedDoctor || !form.appointment_date) {
      setBookedSlots([]);
      return;
    }

    const doctorUserId = selectedDoctor.id;
    if (!doctorUserId) return;

    const ctrl = new AbortController();
    setBookedSlotsLoading(true);

    const url = isAdmin
      ? `${API_BASE}/admin/appointments/booked-slots?doctor_user_id=${doctorUserId}&date=${form.appointment_date}`
      : `${API_BASE}/appointments/booked-slots?doctor_user_id=${doctorUserId}&date=${form.appointment_date}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        Accept: "application/json",
      },
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        setBookedSlots(json.data || []);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          console.error("Failed to fetch booked slots:", e);
          setBookedSlots([]);
        }
      })
      .finally(() => setBookedSlotsLoading(false));

    return () => ctrl.abort();
  }, [selectedDoctor, form.appointment_date, isAdmin]);

  useEffect(() => {
    return () => {
      receiptEntries.forEach((e) => URL.revokeObjectURL(e.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addReceiptFiles = (files) => {
    const entries = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setReceiptEntries((prev) => [...prev, ...entries]);
  };

  const removeReceiptEntry = (id) => {
    setReceiptEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) URL.revokeObjectURL(entry.url);
      if (previewEntry?.id === id) setPreviewEntry(null);
      return prev.filter((e) => e.id !== id);
    });
  };

  const clearAllReceipts = () => {
    receiptEntries.forEach((e) => URL.revokeObjectURL(e.url));
    setReceiptEntries([]);
    setPreviewEntry(null);
    if (receiptInputRef.current) receiptInputRef.current.value = "";
  };

  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/services`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });
      const json = await res.json();
      const data = json.data || [];
      const mapped = data
        .filter((s) => s.is_available === 1 || s.is_available === true)
        .map((s) => ({
          id: s.service_name,
          title: s.service_name,
          fee: s.fee ?? s.price ?? s.amount ?? s.default_fee ?? null,
          isPsych: s.service_name
            .toLowerCase()
            .includes("psychological assessment"),
          purposes: (s.purposes || [])
            .filter((p) => p.is_active === 1 || p.is_active === true)
            .map((p) => p.purpose_name),
        }));
      setServices(mapped);
      const psych = mapped.find((s) => s.isPsych);
      if (psych) setPaePurposes(psych.purposes);
    } catch (e) {
      console.error("Failed to fetch services:", e);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchServices();
  }, [isOpen, fetchServices]);

  const handleScheduleLoad = useCallback((sched) => {
    setDoctorSchedule(sched);
  }, []);

  const handleDateChange = (dateStr) => {
    set("appointment_date", dateStr);
    set("start_time", "");
    set("end_time", "");
  };

  const handleStartTimeChange = (t) => {
    let end = "";
    if (t) {
      const [h, m] = t.split(":").map(Number);
      const totalEndMins = h * 60 + m + APPOINTMENT_DURATION_MINS;
      const endH = Math.floor(totalEndMins / 60) % 24;
      const endM = totalEndMins % 60;

      if (scheduleForDate) {
        const schEndH = parseInt(scheduleForDate.end_time.split(":")[0]);
        const schEndM = parseInt(scheduleForDate.end_time.split(":")[1]);
        const endMinutes = endH * 60 + endM;
        const schEndMinutes = schEndH * 60 + schEndM;
        end =
          endMinutes > schEndMinutes
            ? scheduleForDate.end_time.substring(0, 5)
            : `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
      } else {
        end = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
      }
    }
    setForm((f) => ({ ...f, start_time: t, end_time: end }));
  };

  const handleServiceSelect = (id) => {
    setSelectedService(id);
    set("service_type", id);
    const svc = services.find((s) => s.id === id);
    if (
      isAdmin &&
      !billManuallyEdited &&
      svc?.fee !== null &&
      svc?.fee !== undefined
    ) {
      set("bill_amount", String(svc.fee));
    }
    if (!svc?.isPsych) {
      set("pae_purpose", "");
      setShowPAEPanel(false);
    } else setShowPAEPanel(true);
  };

  async function handleSubmit() {
    setErrors({});
    const errs = {};
    if (!selectedPatient) errs.patient = "Please select a patient.";
    if (!form.appointment_date) errs.appointment_date = "Date is required.";
    if (!form.start_time) errs.start_time = "Start time is required.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fill out all required fields.", toastError);
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append("patient_id", selectedPatient.patient_id);
    if (form.informant_name.trim()) {
      fd.append("informant_name", form.informant_name.trim());
      fd.append("informant_relation", form.informant_relation.trim());
    }
    fd.append("appointment_date", form.appointment_date);
    fd.append("start_time", form.start_time);
    fd.append("end_time", form.end_time);
    fd.append("visit_type", form.visit_type);
    fd.append("reason_for_consultation", form.reason_for_consultation);
    fd.append("service_type", form.service_type);
    if (form.pae_purpose) fd.append("pae_purpose", form.pae_purpose);
    if (isAdmin) {
      fd.append("payment_status", form.payment_status);
      if (form.payment_status === "paid" && form.payment_reference.trim())
        fd.append("payment_reference", form.payment_reference.trim());
      if (form.bill_amount !== "" && form.bill_amount !== null)
        fd.append("bill_amount", form.bill_amount);
      receiptEntries.forEach((entry) => fd.append("receipts[]", entry.file));
    }
    if (selectedDoctor) fd.append("doctor_user_id", selectedDoctor.id);

    const url = isAdmin
      ? `${API_BASE}/admin/appointments`
      : `${API_BASE}/appointments`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
        body: fd,
      });
      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        toast.error(`Server error ${res.status}`, toastError);
        return;
      }

      if (!res.ok) {
        if (result.errors) setErrors(result.errors);
        else alert(result.message || `Error ${res.status}`);
        return;
      }

      setSuccessData(result.data);
      if (onSuccess) onSuccess(result.data);
      if (onAdd) onAdd(result.data);
    } catch (e) {
      toast.error("Network error. Please try again.", toastError);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setSelectedPatient(null);
    setSelectedDoctor(null);
    setDoctorSchedule([]);
    setSelectedService("");
    setShowPAEPanel(false);
    clearAllReceipts();
    setErrors({});
    setSuccessData(null);
    setBillManuallyEdited(false);
    setBookedSlots([]);
    onClose();
  }

  const Err = ({ field }) =>
    errors[field] ? (
      <span
        style={{
          fontSize: "11px",
          color: "#e53e3e",
          marginTop: "3px",
          display: "block",
        }}
      >
        {errors[field]}
      </span>
    ) : null;

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

  const isPAE =
    services.find((s) => s.id === selectedService)?.isPsych ?? false;
  const showReceiptSection = showReceipt || form.payment_status === "paid";
  const selectedServiceObj = services.find((s) => s.id === selectedService);
  const headerDateDisplay = form.appointment_date
    ? formatDatePH(form.appointment_date)
    : formatDatePH(new Date());

  return (
    <>
      <style>{`
        .tos-label{font-size:11px;font-weight:700;color:#4D227C;text-transform:uppercase;letter-spacing:.7px;margin:0 0 10px}
        .tos-cards{display:flex;flex-direction:column;gap:8px}
        .tos-pae-panel{margin-top:8px;padding:14px;background:#e8f4fb;border:1.5px solid #c5dff0;border-radius:10px;animation:paeIn .2s ease}
        @keyframes paeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .tos-pae-header{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#1d6fa4;text-transform:uppercase;letter-spacing:.7px;margin:0 0 10px}
        .tos-pae-cards{display:flex;flex-direction:column;gap:7px;max-height:260px;overflow-y:auto;padding-right:4px}
        .tos-pae-cards::-webkit-scrollbar{width:6px}
        .tos-pae-cards::-webkit-scrollbar-track{background:#d0e8f5;border-radius:10px}
        .tos-pae-cards::-webkit-scrollbar-thumb{background:#4D227C;border-radius:10px}
        .tos-pae-item{padding:11px 14px;border-radius:9px;cursor:pointer;font-size:13px;color:#333;background:#fff;border:1.5px solid #dde;transition:all .15s;display:flex;align-items:center;gap:10px}
        .tos-pae-item:hover{border-color:#1d6fa4;background:#f0f8ff}
        .tos-pae-item.sel{border-color:#1d6fa4;background:#e0f2fe;color:#1d6fa4;font-weight:600}
        .receipt-preview-wrap{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid #e2d5f5;border-radius:10px;background:#faf7ff;width:100%;box-sizing:border-box}
        .receipt-thumb-img{width:52px;height:52px;object-fit:cover;border-radius:7px;border:1px solid #ddd;flex-shrink:0;cursor:zoom-in}
        .receipt-thumb-pdf{width:52px;height:52px;border-radius:7px;border:1px solid #ddd;background:#f0ebfa;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .receipt-view-btn{display:flex;align-items:center;gap:5px;font-size:12px;color:#4D227C;background:none;border:1px solid #c4a8e8;border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:600;white-space:nowrap;transition:background .15s}
        .receipt-view-btn:hover{background:#f3ecfc}
        .receipt-remove-btn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;flex-shrink:0;background:none;border:1px solid #f0d0d0;border-radius:6px;cursor:pointer;color:#e53e3e;transition:background .15s}
        .receipt-remove-btn:hover{background:#fff0f0}
        .receipt-add-more-btn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:9px;border:1.5px dashed #c4a8e8;border-radius:10px;background:none;color:#4D227C;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;margin-top:4px}
        .receipt-add-more-btn:hover{background:#f5f0fb;border-color:#4D227C}
        .bill-input-wrap{position:relative;display:flex;align-items:center}
        .bill-peso-sign{position:absolute;left:13px;font-size:14px;font-weight:700;color:#059669;pointer-events:none;z-index:1}
        .bill-input{width:100%;padding:10px 13px 10px 28px;border-radius:9px;border:1.5px solid #a7f3d0;font-size:15px;font-weight:700;color:#065f46;background:#f0fdf4;box-sizing:border-box;outline:none;transition:border .2s,box-shadow .2s;font-family:'Poppins',sans-serif}
        .bill-input:focus{border-color:#059669;box-shadow:0 0 0 3px rgba(5,150,105,0.12)}
        .bill-input::placeholder{color:#9ca3af;font-weight:400}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {previewEntry && (
        <ImagePreviewModal
          file={previewEntry.file}
          src={previewEntry.url}
          onClose={() => setPreviewEntry(null)}
        />
      )}

      {/* ── SUCCESS MODAL ── */}
      {successData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999998,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px 28px",
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 24px 64px rgba(77,34,124,0.25)",
              textAlign: "center",
              animation: "paeIn .25s ease",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#dcfce7",
                border: "2px solid #bbf7d0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <FiCheck size={26} color="#15803d" />
            </div>
            <h3
              style={{
                margin: "0 0 6px",
                fontSize: "18px",
                fontWeight: 700,
                color: "#1a1a2e",
                fontFamily: "Poppins,sans-serif",
              }}
            >
              Appointment Created!
            </h3>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: "13px",
                color: "#666",
                fontFamily: "Poppins,sans-serif",
              }}
            >
              The appointment has been successfully saved.
            </p>

            <div
              style={{
                background: "#f5f0fb",
                border: "1.5px solid #d4b8f0",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#4D227C",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "8px",
                  fontFamily: "Poppins,sans-serif",
                }}
              >
                Appointment Reference No.
              </div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#4D227C",
                  letterSpacing: "0.05em",
                  fontFamily: "'Courier New',monospace",
                }}
              >
                {successData.appointment_ref || "—"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#888",
                  marginTop: "6px",
                  fontFamily: "Poppins,sans-serif",
                }}
              >
                {successData.appointment_ref?.startsWith("PAE")
                  ? "Psychological Assessment & Evaluation"
                  : "Psychotherapy & Counseling"}
              </div>
            </div>

            {isAdmin &&
              successData.bill_amount !== null &&
              successData.bill_amount !== undefined && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1.5px solid #a7f3d0",
                    borderRadius: "12px",
                    padding: "14px 20px",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#059669",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: "4px",
                        fontFamily: "Poppins,sans-serif",
                      }}
                    >
                      Bill Amount
                    </div>
                    <div
                      style={{
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#065f46",
                        fontFamily: "'Courier New',monospace",
                      }}
                    >
                      {formatPeso(successData.bill_amount)}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiDollarSign size={20} color="#059669" />
                  </div>
                </div>
              )}

            {isAdmin && successData.payment_reference && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  marginBottom: "16px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#15803d",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "4px",
                    fontFamily: "Poppins,sans-serif",
                  }}
                >
                  Payment Reference
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#166534",
                    fontFamily: "'Courier New',monospace",
                  }}
                >
                  {successData.payment_reference}
                </div>
              </div>
            )}

            <div
              style={{
                textAlign: "left",
                background: "#faf7ff",
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#555",
                  fontFamily: "Poppins,sans-serif",
                }}
              >
                <strong>Patient:</strong>{" "}
                {[successData.patient?.firstName, successData.patient?.lastName]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#555",
                  fontFamily: "Poppins,sans-serif",
                }}
              >
                <strong>Date:</strong>{" "}
                {formatDatePH(successData?.appointment_date)}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#555",
                  fontFamily: "Poppins,sans-serif",
                }}
              >
                <strong>Time:</strong> {formatTimePH(successData.start_time)} –{" "}
                {formatTimePH(successData.end_time)}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#555",
                  fontFamily: "Poppins,sans-serif",
                }}
              >
                <strong>Service:</strong> {successData.service_type || "—"}
              </div>
            </div>

            <button
              onClick={handleClose}
              style={{
                width: "100%",
                padding: "11px",
                background: "#4D227C",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "Poppins,sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#3d1870")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#4D227C")
              }
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className={styles.backdrop}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.headerTitle}>Create Appointment</h2>
            <div className={styles.headerRight}>
              <span className={styles.headerDate}>{headerDateDisplay}</span>
              <button className={styles.closeBtn} onClick={handleClose}>
                <FiX />
              </button>
            </div>
          </div>

          <div className={styles.body}>
            {/* ══ PATIENT ══ */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Patient Information</h4>
              <div className={styles.fieldRow}>
                <input
                  className={styles.input}
                  placeholder="Reason for Consultation"
                  value={form.reason_for_consultation}
                  onChange={(e) =>
                    set("reason_for_consultation", e.target.value)
                  }
                />
              </div>
              <div className={styles.fieldRow}>
                {!selectedPatient ? (
                  <>
                    <PatientSearchDropdown
                      value={selectedPatient}
                      onSelect={(p) => {
                        setSelectedPatient(p);
                        setErrors((e) => ({ ...e, patient: null }));
                      }}
                    />
                    <Err field="patient" />
                  </>
                ) : (
                  <PatientInfoCard
                    patient={selectedPatient}
                    onClear={() => setSelectedPatient(null)}
                  />
                )}
              </div>
            </div>

            {/* ══ SCHEDULE ══ */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Consultation Schedule</h4>

              <div className={styles.fieldRow} style={{ marginBottom: "20px" }}>
                <DoctorDropdown
                  value={selectedDoctor}
                  onSelect={(d) => {
                    setSelectedDoctor(d);
                    setForm((f) => ({
                      ...f,
                      appointment_date: "",
                      start_time: "",
                      end_time: "",
                    }));
                    setBookedSlots([]);
                  }}
                  onScheduleLoad={handleScheduleLoad}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <LabeledInput label="Date">
                  <CalendarDatePicker
                    value={form.appointment_date}
                    onChange={handleDateChange}
                    availableDayNums={
                      availableDayNums.length > 0 ? availableDayNums : null
                    }
                    minDate={new Date()}
                  />
                  <Err field="appointment_date" />
                </LabeledInput>
                <LabeledInput label="Start Time">
                  <TimePicker
                    value={form.start_time}
                    onChange={handleStartTimeChange}
                    scheduleForDate={scheduleForDate}
                    disabled={!form.appointment_date}
                    bookedSlots={bookedSlots}
                    loadingSlots={bookedSlotsLoading}
                  />
                  <Err field="start_time" />
                </LabeledInput>
                <LabeledInput label="End Time" disabled>
                  <TimePicker
                    value={form.end_time}
                    onChange={(t) => set("end_time", t)}
                    scheduleForDate={scheduleForDate}
                    disabled={true}
                  />
                </LabeledInput>
              </div>

              {form.appointment_date &&
                doctorSchedule.length > 0 &&
                !scheduleForDate && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "#fff8f0",
                      border: "1px solid #fed7aa",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#9a3412",
                      marginBottom: "14px",
                    }}
                  >
                    ⚠ The doctor is not available on{" "}
                    {format(
                      new Date(form.appointment_date + "T00:00:00"),
                      "EEEE",
                    )}
                    s. Please choose a different date.
                  </div>
                )}

              <div
                className={styles.radioGroup}
                style={{ marginBottom: "14px" }}
              >
                <p className={styles.radioGroupLabel}>Visit Type</p>
                <div className={styles.radioRow}>
                  {[
                    ["onsite", "Onsite Consultation"],
                    ["virtual", "Virtual Consultation"],
                  ].map(([val, lbl]) => (
                    <label key={val} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="visit_type"
                        value={val}
                        className={styles.radioInput}
                        checked={form.visit_type === val}
                        onChange={() => set("visit_type", val)}
                      />{" "}
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>

              <hr className={styles.divider} />

              <p className="tos-label">Type of Service</p>
              {servicesLoading ? (
                <p
                  style={{ color: "#aaa", fontSize: "13px", padding: "10px 0" }}
                >
                  Loading services…
                </p>
              ) : services.length === 0 ? (
                <p
                  style={{ color: "#aaa", fontSize: "13px", padding: "10px 0" }}
                >
                  No services available.
                </p>
              ) : (
                <div className="tos-cards">
                  {services.map((svc) => (
                    <div key={svc.id}>
                      <ServiceCard
                        service={svc}
                        selected={selectedService}
                        onClick={handleServiceSelect}
                        accent="#4D227C"
                        subtitle={
                          svc.isPsych && form.pae_purpose
                            ? form.pae_purpose
                            : null
                        }
                      />
                      {svc.isPsych && isPAE && showPAEPanel && (
                        <div className="tos-pae-panel">
                          <p className="tos-pae-header">
                            <FiChevronRight size={13} /> Purpose of Assessment
                          </p>
                          <div className="tos-pae-cards">
                            {paePurposes.length === 0 ? (
                              <p style={{ color: "#aaa", fontSize: "13px" }}>
                                No purposes available.
                              </p>
                            ) : (
                              paePurposes.map((title) => (
                                <div
                                  key={title}
                                  className={`tos-pae-item ${form.pae_purpose === title ? "sel" : ""}`}
                                  onClick={() => {
                                    set("pae_purpose", title);
                                    setShowPAEPanel(false);
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "18px",
                                      height: "18px",
                                      borderRadius: "50%",
                                      border:
                                        form.pae_purpose === title
                                          ? "6px solid #1d6fa4"
                                          : "2px solid #bbb",
                                      flexShrink: 0,
                                      boxSizing: "border-box",
                                    }}
                                  />
                                  {title}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      {svc.isPsych && isPAE && !showPAEPanel && (
                        <button
                          onClick={() => setShowPAEPanel(true)}
                          style={{
                            marginTop: "8px",
                            fontSize: "12px",
                            color: "#1d6fa4",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          {form.pae_purpose
                            ? "Change purpose of assessment"
                            : "Select purpose of assessment"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ══ PAYMENT — ADMIN ONLY ══ */}
            {isAdmin && (
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Payment & Billing</h4>

                <div className={styles.fieldRow}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#059669",
                      textTransform: "uppercase",
                      letterSpacing: "0.7px",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Bill Amount
                    {selectedServiceObj?.fee !== null &&
                      selectedServiceObj?.fee !== undefined &&
                      !billManuallyEdited && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11px",
                            color: "#6b7280",
                            fontWeight: "400",
                            textTransform: "none",
                            letterSpacing: 0,
                          }}
                        >
                          (auto-filled: {formatPeso(selectedServiceObj.fee)})
                        </span>
                      )}
                    {billManuallyEdited && (
                      <button
                        onClick={() => {
                          const fee = selectedServiceObj?.fee;
                          if (fee !== null && fee !== undefined)
                            set("bill_amount", String(fee));
                          setBillManuallyEdited(false);
                        }}
                        style={{
                          marginLeft: "8px",
                          fontSize: "10px",
                          color: "#4D227C",
                          background: "none",
                          border: "1px solid #d4b8f0",
                          borderRadius: "4px",
                          padding: "1px 6px",
                          cursor: "pointer",
                          fontWeight: "600",
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        Reset to default
                      </button>
                    )}
                  </label>
                  <div className="bill-input-wrap">
                    <span className="bill-peso-sign">₱</span>
                    <input
                      className="bill-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.bill_amount}
                      onChange={(e) => {
                        set("bill_amount", e.target.value);
                        setBillManuallyEdited(true);
                      }}
                    />
                  </div>
                  {form.bill_amount !== "" &&
                    !isNaN(parseFloat(form.bill_amount)) && (
                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "13px",
                          color: "#059669",
                          fontWeight: "600",
                        }}
                      >
                        = {formatPeso(parseFloat(form.bill_amount))}
                      </div>
                    )}
                  <Err field="bill_amount" />
                </div>

                <div className={styles.fieldRow} style={{ marginTop: "14px" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#4D227C",
                      textTransform: "uppercase",
                      letterSpacing: "0.7px",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Payment Status
                  </label>
                  <select
                    className={styles.select}
                    value={form.payment_status}
                    onChange={(e) => {
                      set("payment_status", e.target.value);
                      if (e.target.value !== "paid")
                        set("payment_reference", "");
                    }}
                  >
                    <option value="">Select Payment Status</option>
                    <option value="paid">Paid</option>
                    <option value="not_paid">Not Paid</option>
                    <option value="probono">Probono</option>
                  </select>
                </div>

                {form.payment_status === "paid" && (
                  <div
                    style={{
                      background: "#fff8e1",
                      border: "1.5px solid #fde68a",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      marginTop: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#92400e",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "8px",
                      }}
                    >
                      Payment Reference Number
                    </div>
                    <input
                      type="text"
                      placeholder="GCash / bank transaction reference (optional)"
                      value={form.payment_reference}
                      onChange={(e) => set("payment_reference", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 13px",
                        borderRadius: "8px",
                        border: "1.5px solid #fde68a",
                        fontSize: "13px",
                        color: "#333",
                        boxSizing: "border-box",
                        background: "#fffdf0",
                        outline: "none",
                        transition: "border .2s",
                      }}
                      onFocus={(e) => {
                        e.target.style.border = "1.5px solid #f59e0b";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(245,158,11,0.15)";
                      }}
                      onBlur={(e) => {
                        e.target.style.border = "1.5px solid #fde68a";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                  </div>
                )}

                {showReceiptSection && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                        marginTop: "12px",
                      }}
                    >
                      <div className={styles.uploadLabel} style={{ margin: 0 }}>
                        Upload Receipt{receiptEntries.length > 1 ? "s" : ""}
                      </div>
                      {receiptEntries.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "#888" }}>
                            {receiptEntries.length} file
                            {receiptEntries.length > 1 ? "s" : ""} selected
                          </span>
                          <button
                            onClick={clearAllReceipts}
                            style={{
                              fontSize: "11px",
                              color: "#e53e3e",
                              background: "none",
                              border: "1px solid #f0d0d0",
                              borderRadius: "6px",
                              padding: "2px 8px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            Remove all
                          </button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={receiptInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files?.length)
                          addReceiptFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    {receiptEntries.length > 0 && (
                      <div style={{ marginBottom: "4px" }}>
                        {receiptEntries.map((entry) => (
                          <ReceiptItem
                            key={entry.id}
                            entry={entry}
                            onRemove={removeReceiptEntry}
                            onPreview={setPreviewEntry}
                          />
                        ))}
                      </div>
                    )}
                    {receiptEntries.length === 0 ? (
                      <div
                        className={styles.uploadZone}
                        onClick={() => receiptInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files?.length)
                            addReceiptFiles(e.dataTransfer.files);
                        }}
                      >
                        <div className={styles.uploadPlaceholder}>
                          <FiUpload className={styles.uploadIcon} />
                          <span className={styles.uploadText}>
                            Click or drag &amp; drop to upload receipt
                          </span>
                          <span className={styles.uploadHint}>
                            Supports JPG, PNG, PDF · Multiple files allowed
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="receipt-add-more-btn"
                        onClick={() => receiptInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files?.length)
                            addReceiptFiles(e.dataTransfer.files);
                        }}
                      >
                        <FiPlus size={14} /> Add more receipts
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button
              className={styles.btnCancel}
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className={styles.btnAdd}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Add Appointment"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateAppointmentModal;

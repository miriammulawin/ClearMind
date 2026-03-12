import { useState, useRef, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import "./DoctorStyle/DoctorAppointment.css";
import { FiX, FiPlus, FiTrash2, FiChevronDown, FiSearch, FiZoomIn } from "react-icons/fi";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const DAYS_OF_WEEK = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ── Status badge colors ───────────────────────────────────────────────────────
const STATUS_COLORS = {
  Pending:   "#F59E0B",
  Scheduled: "#4D227C",
  Completed: "#10B981",
  Cancelled: "#EF4444",
};

/* ── Patient Dropdown — now fetches from API ────────────────────────────────── */
function PatientDropdown({ patients = [], selected, onSelect }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const ref               = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = patients.filter((p) => {
    const full = `${p.first_name} ${p.mi ? p.mi + "." : ""} ${p.last_name}`.toLowerCase();
    return full.includes(query.toLowerCase());
  });

  const handleSelect = (patient) => {
    setQuery("");
    setOpen(false);
    if (onSelect) onSelect(patient);
  };

  const displayName = selected
    ? `${selected.first_name} ${selected.mi ? selected.mi + ". " : ""}${selected.last_name}`
    : "";

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: "8px", border: open ? "1.5px solid #4D227C" : "1px solid #ddd", fontSize: "13px", backgroundColor: "#fff", cursor: "pointer", color: selected ? "#333" : "#999", boxSizing: "border-box", userSelect: "none", transition: "border 0.2s" }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName || "Select Patient Name"}
        </span>
        <FiChevronDown style={{ flexShrink: 0, marginLeft: 8, color: "#4D227C", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
      </div>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, backgroundColor: "#fff", border: "1px solid #e0d4f5", borderRadius: "10px", boxShadow: "0 8px 24px rgba(77,34,124,0.12)", zIndex: 99999, overflow: "hidden" }}>
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #f0eaf8", display: "flex", alignItems: "center", gap: "8px" }}>
            <FiSearch style={{ color: "#aaa", flexShrink: 0 }} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patient…"
              style={{ border: "none", outline: "none", fontSize: "13px", width: "100%", color: "#333", backgroundColor: "transparent" }}
            />
          </div>
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "14px 16px", color: "#aaa", fontSize: "13px", textAlign: "center" }}>
                {patients.length === 0 ? "Loading patients…" : "No patients found"}
              </div>
            ) : (
              filtered.map((p) => {
                const isActive = selected?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    style={{ padding: "10px 16px", fontSize: "13px", cursor: "pointer", color: isActive ? "#4D227C" : "#333", fontWeight: isActive ? "600" : "400", backgroundColor: isActive ? "#f3ecfc" : "transparent", transition: "background 0.15s", display: "flex", alignItems: "center", gap: "10px" }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "#faf7ff"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#4D227C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>
                      {(p.first_name?.[0] ?? "")}{(p.last_name?.[0] ?? "")}
                    </div>
                    <div>
                      <div style={{ lineHeight: 1.3 }}>{p.first_name} {p.mi ? p.mi + ". " : ""}{p.last_name}</div>
                      {p.email && <div style={{ fontSize: "11px", color: "#aaa" }}>{p.email}</div>}
                    </div>
                    {isActive && <span style={{ marginLeft: "auto", color: "#4D227C", fontSize: "16px" }}>✓</span>}
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

/* ── Image Lightbox ─────────────────────────────────────────────────────────── */
function ImageLightbox({ src, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
      <button onClick={onClose} style={{ position: "absolute", top: "20px", right: "24px", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "40px", height: "40px", color: "#fff", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FiX />
      </button>
      <img src={src} alt="Payment Receipt" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "16px", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", objectFit: "contain" }} />
      <p style={{ position: "absolute", bottom: "20px", color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: 0 }}>Press ESC or click outside to close</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════════ */
function DoctorAppointment() {
  const [activeMenu, setActiveMenu]           = useState("Appointment");
  const [currentDate, setCurrentDate]         = useState(new Date());
  const [currentView, setCurrentView]         = useState("month");
  const [showModal, setShowModal]             = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showLightbox, setShowLightbox]       = useState(false);
  const [lightboxSrc, setLightboxSrc]         = useState(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [saving, setSaving]                   = useState(false);

  // ── Calendar events (from API) ────────────────────────────────────────────
  const [events, setEvents] = useState([]);

  // ── Patient list (from API) ───────────────────────────────────────────────
  const [patients, setPatients]           = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ── New appointment form ──────────────────────────────────────────────────
  const [dob, setDob]           = useState("");
  const [newAppt, setNewAppt]   = useState({
    date:       "",
    startTime:  "",
    endTime:    "",
    visitType:  "Physical",  // Online | Physical
    patientType: "existing", // existing | new
    classification: "regular",
    reason:     "",
    informant:  "",
    relation:   "",
    address:    "",
    sex:        "",
    contactNo:  "",
    civilStatus: "",
    paymentStatus: "",
    paymentReceipt: null,
  });

  const computedAge = (() => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? age : "";
  })();

  // ── Weekly schedule (local UI state — wire to backend later if needed) ───
  const [weeklySchedule, setWeeklySchedule] = useState(
    Object.fromEntries(DAYS_OF_WEEK.map((d) => [d, []]))
  );
  const [selectedDay, setSelectedDay] = useState("Monday");

  // ── Fetch appointments from backend ──────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoadingAppointments(true);
    try {
      const res = await axiosClient.get("/doctor/appointments");
      const raw = res.data.data || [];

      // Convert ISO strings → Date objects for react-big-calendar
      const calEvents = raw.map((e) => ({
        ...e,
        start: new Date(e.start),
        end:   new Date(e.end),
      }));
      setEvents(calEvents);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  // ── Fetch patients list for dropdown ────────────────────────────────────
  const fetchPatients = useCallback(async () => {
    try {
      const res = await axiosClient.get("/doctor/patients-list");
      setPatients(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch patients list:", err);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, [fetchAppointments, fetchPatients]);

  // ── When a patient is selected, auto-fill their info ────────────────────
  useEffect(() => {
    if (!selectedPatient) return;
    setDob(selectedPatient.dob || "");
    setNewAppt((prev) => ({
      ...prev,
      sex:       selectedPatient.sex       || "",
      contactNo: selectedPatient.contact_no || "",
    }));
  }, [selectedPatient]);

  // ── Create Appointment ───────────────────────────────────────────────────
  const handleAddEvent = async () => {
    if (!selectedPatient)   return toast.error("Please select a patient.");
    if (!newAppt.date)      return toast.error("Please select a date.");
    if (!newAppt.startTime) return toast.error("Please select a start time.");
    if (!newAppt.visitType) return toast.error("Please select a visit type.");

    setSaving(true);
    try {
      const res = await axiosClient.post("/doctor/appointments", {
        client_id:        selectedPatient.id,
        appointment_date: newAppt.date,
        appointment_time: newAppt.startTime,
        visit_type:       newAppt.visitType,
        status:           "Pending",
      });

      const evt = res.data.event;
      setEvents((prev) => [
        ...prev,
        { ...evt, start: new Date(evt.start), end: new Date(evt.end) },
      ]);

      toast.success("Appointment created!");
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create appointment");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setDob("");
    setNewAppt({
      date: "", startTime: "", endTime: "", visitType: "Physical",
      patientType: "existing", classification: "regular",
      reason: "", informant: "", relation: "", address: "",
      sex: "", contactNo: "", civilStatus: "", paymentStatus: "", paymentReceipt: null,
    });
  };

  // ── Update appointment status from calendar click ───────────────────────
  const handleEventClick = async (event) => {
    const next = {
      Pending:   "Scheduled",
      Scheduled: "Completed",
      Completed: "Completed",
      Cancelled: "Cancelled",
    }[event.status] ?? "Scheduled";

    if (event.status === "Completed" || event.status === "Cancelled") {
      toast(`This appointment is already ${event.status}.`);
      return;
    }

    try {
      await axiosClient.patch(`/doctor/appointments/${event.id}/status`, { status: next });
      setEvents((prev) =>
        prev.map((e) => e.id === event.id ? { ...e, status: next } : e)
      );
      toast.success(`Marked as ${next}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // ── Weekly schedule helpers ──────────────────────────────────────────────
  const handleAddTimeSlot    = () => setWeeklySchedule((prev) => ({ ...prev, [selectedDay]: [...prev[selectedDay], { startTime: "", endTime: "", clinicType: "" }] }));
  const handleRemoveTimeSlot = (day, i) => setWeeklySchedule((prev) => ({ ...prev, [day]: prev[day].filter((_, idx) => idx !== i) }));
  const handleTimeSlotChange = (day, i, field, val) => {
    const slots = [...weeklySchedule[day]];
    slots[i] = { ...slots[i], [field]: val };
    setWeeklySchedule((prev) => ({ ...prev, [day]: slots }));
  };
  const handleSaveSchedule = () => {
    for (const day of DAYS_OF_WEEK) {
      for (const slot of weeklySchedule[day]) {
        if (!slot.startTime || !slot.endTime) return toast.error("Please fill all time slots");
        if (!slot.clinicType) return toast.error("Please select clinic type for all slots");
      }
    }
    toast.success("Schedule saved!");
    setShowScheduleModal(false);
  };

  /* ── Shared styles ── */
  const inputStyle   = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#333", backgroundColor: "#fff" };
  const selectStyle  = { ...inputStyle, cursor: "pointer" };
  const sectionLabel = { fontSize: "11px", fontWeight: "700", color: "#4D227C", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0" };
  const radioGroup   = { display: "flex", flexDirection: "column", gap: "6px" };
  const radioLabel   = { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#444", cursor: "pointer", margin: 0 };
  const radioInput   = { width: "15px", height: "15px", accentColor: "#4D227C", cursor: "pointer", margin: 0, flexShrink: 0 };

  const LabeledInput = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={{ fontSize: "11px", fontWeight: "600", color: "#4D227C", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</label>
      {children}
    </div>
  );

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />
        <div className="doctor-content" style={{ padding: "20px" }}>
          <br />
          <div className="appointment-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Appointments Calendar {loadingAppointments && <span style={{ fontSize: "13px", color: "#aaa", fontWeight: 400 }}>Loading…</span>}</h3>
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

            {/* Status legend */}
            <div style={{ display: "flex", gap: "16px", marginTop: "8px", flexWrap: "wrap" }}>
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#555" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color }} />
                  {status}
                </div>
              ))}
              <span style={{ fontSize: "12px", color: "#aaa", marginLeft: "auto" }}>Click an event to advance its status</span>
            </div>

            <Calendar
              localizer={localizer}
              events={events}
              date={currentDate}
              view={currentView}
              onNavigate={setCurrentDate}
              onView={setCurrentView}
              onSelectEvent={handleEventClick}
              views={["month", "week", "day", "agenda"]}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600, marginTop: 20, borderRadius: "12px" }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: STATUS_COLORS[event.status] ?? "#4D227C",
                  color: "#fff",
                  borderRadius: "16px",
                  padding: "4px 8px",
                  fontWeight: 500,
                  marginBottom: "4px",
                  fontSize: "13px",
                  cursor: "pointer",
                },
              })}
            />
          </div>
        </div>
      </div>

      {/* ══ Create Appointment Modal ══════════════════════════════════════════ */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px", overflowY: "auto" }}>
          <div className="appointment-modal-lg">
            {/* Header */}
            <div className="modal-header">
              <h2>New Appointment</h2>
              <span className="modal-date">
                {newAppt.date ? format(new Date(newAppt.date + "T00:00:00"), "MMMM d, yyyy") : format(new Date(), "MMMM d, yyyy")}
              </span>
              <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center" }}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              {/* ── PATIENT INFORMATION ── */}
              <div className="modal-section">
                <h4>Patient Information</h4>

                <div style={{ marginBottom: "8px" }}>
                  <input style={inputStyle} placeholder="Reason for Consultation" value={newAppt.reason} onChange={(e) => setNewAppt({ ...newAppt, reason: e.target.value })} />
                </div>

                {/* Patient dropdown — fetched from API */}
                <div style={{ marginBottom: "8px" }}>
                  <PatientDropdown patients={patients} selected={selectedPatient} onSelect={setSelectedPatient} />
                </div>

                {/* DOB + Age */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "8px" }}>
                  <input style={inputStyle} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                  <input
                    style={{ ...inputStyle, backgroundColor: computedAge !== "" ? "#f3ecfc" : "#f9f9f9", color: computedAge !== "" ? "#4D227C" : "#aaa", fontWeight: computedAge !== "" ? "700" : "400", cursor: "not-allowed" }}
                    type="text" disabled readOnly
                    value={computedAge !== "" ? `${computedAge} years old` : ""}
                    placeholder="Age (auto-filled)"
                  />
                </div>

                {/* Sex | Contact | Civil Status */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "8px" }}>
                  <select style={selectStyle} value={newAppt.sex} onChange={(e) => setNewAppt({ ...newAppt, sex: e.target.value })}>
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input style={inputStyle} placeholder="Patient Contact No." value={newAppt.contactNo} onChange={(e) => setNewAppt({ ...newAppt, contactNo: e.target.value })} />
                  <select style={selectStyle} value={newAppt.civilStatus} onChange={(e) => setNewAppt({ ...newAppt, civilStatus: e.target.value })}>
                    <option value="">Civil Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Annulled">Annulled</option>
                    <option value="Separated">Separated</option>
                    <option value="Widow">Widow / Widower</option>
                    <option value="Living-In">Living-In</option>
                  </select>
                </div>

                {/* Informant | Relation */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "8px" }}>
                  <input style={inputStyle} placeholder="Full Name of Informant (if not the client)" value={newAppt.informant} onChange={(e) => setNewAppt({ ...newAppt, informant: e.target.value })} />
                  <input style={inputStyle} placeholder="Relation to the Patient" value={newAppt.relation} onChange={(e) => setNewAppt({ ...newAppt, relation: e.target.value })} />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <input style={inputStyle} placeholder="Address" value={newAppt.address} onChange={(e) => setNewAppt({ ...newAppt, address: e.target.value })} />
                </div>

                {/* Radio groups */}
                <div style={{ display: "flex", gap: "48px" }}>
                  <div>
                    <p style={sectionLabel}>Patient Type</p>
                    <div style={radioGroup}>
                      {["existing","new"].map((t) => (
                        <label key={t} style={radioLabel}>
                          <input type="radio" name="ptype" value={t} style={radioInput} checked={newAppt.patientType === t} onChange={(e) => setNewAppt({ ...newAppt, patientType: e.target.value })} />
                          {t === "existing" ? "Existing Patient" : "New Patient"}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={sectionLabel}>Patient Classification</p>
                    <div style={radioGroup}>
                      {[["pwd","PWD"],["senior","Senior Citizen"],["regular","Regular"]].map(([val, label]) => (
                        <label key={val} style={radioLabel}>
                          <input type="radio" name="class" value={val} style={radioInput} checked={newAppt.classification === val} onChange={(e) => setNewAppt({ ...newAppt, classification: e.target.value })} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CONSULTATION SCHEDULE ── */}
              <div className="modal-section">
                <h4>Consultation Schedule</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
                  <LabeledInput label="Date">
                    <input style={inputStyle} type="date" value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })} />
                  </LabeledInput>
                  <LabeledInput label="Start Time">
                    <input style={inputStyle} type="time" value={newAppt.startTime} onChange={(e) => setNewAppt({ ...newAppt, startTime: e.target.value })} />
                  </LabeledInput>
                  <LabeledInput label="End Time">
                    <input style={inputStyle} type="time" value={newAppt.endTime} onChange={(e) => setNewAppt({ ...newAppt, endTime: e.target.value })} />
                  </LabeledInput>
                </div>

                <div>
                  <p style={sectionLabel}>Visit Type</p>
                  <div style={{ display: "flex", gap: "24px" }}>
                    {[["Physical","Physical Clinic"],["Online","Virtual Consult"]].map(([val, label]) => (
                      <label key={val} style={radioLabel}>
                        <input type="radio" name="visit" value={val} style={radioInput} checked={newAppt.visitType === val} onChange={(e) => setNewAppt({ ...newAppt, visitType: e.target.value })} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── PAYMENT STATUS ── */}
              <div className="modal-section">
                <h4>Payment Status</h4>

                {/* Receipt upload */}
                {newAppt.paymentReceipt ? (
                  <div style={{ marginBottom: "12px", position: "relative", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 12px rgba(77,34,124,0.12)", border: "1px solid #e0d4f5", cursor: "pointer" }}
                    onClick={() => { setLightboxSrc(URL.createObjectURL(newAppt.paymentReceipt)); setShowLightbox(true); }}
                  >
                    <img src={URL.createObjectURL(newAppt.paymentReceipt)} alt="Receipt" style={{ width: "100%", maxHeight: "180px", objectFit: "cover", objectPosition: "top", display: "block" }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setNewAppt({ ...newAppt, paymentReceipt: null }); }}
                      style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: "28px", height: "28px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    ><FiX size={14} /></button>
                    <div style={{ position: "absolute", bottom: "8px", right: "8px", backgroundColor: "rgba(77,34,124,0.80)", color: "#fff", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <FiZoomIn size={12} /> Click to enlarge
                    </div>
                  </div>
                ) : (
                  <label style={{ display: "block", marginBottom: "12px", padding: "24px", border: "2px dashed #e0d4f5", borderRadius: "12px", textAlign: "center", cursor: "pointer", color: "#aaa", fontSize: "13px" }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) setNewAppt({ ...newAppt, paymentReceipt: f }); }} />
                    📎 Upload Payment Receipt (optional)
                  </label>
                )}

                <select style={{ ...selectStyle, width: "100%" }} value={newAppt.paymentStatus} onChange={(e) => setNewAppt({ ...newAppt, paymentStatus: e.target.value })}>
                  <option value="">Select Payment Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Not Paid">Not Paid</option>
                  <option value="Probono">Probono</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-add" onClick={handleAddEvent} disabled={saving}>
                {saving ? "Saving…" : "Add Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Add Schedule Modal ════════════════════════════════════════════════ */}
      {showScheduleModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px", overflowY: "auto" }}>
          <div className="appointment-modal-lg">
            <div className="modal-header">
              <h2>Add Weekly Schedule</h2>
              <button className="close-btn" onClick={() => setShowScheduleModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center" }}><FiX /></button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>Select Day of the Week</h4>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
                  {DAYS_OF_WEEK.map((day) => (
                    <button key={day} onClick={() => setSelectedDay(day)} style={{ padding: "8px 16px", borderRadius: "8px", border: selectedDay === day ? "2px solid #4D227C" : "1px solid #ddd", backgroundColor: selectedDay === day ? "#4D227C" : "#fff", color: selectedDay === day ? "#fff" : "#333", cursor: "pointer", fontWeight: selectedDay === day ? "600" : "400", transition: "all 0.2s" }}>
                      {day}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h4>Time Slots for {selectedDay}</h4>
                    <button onClick={handleAddTimeSlot} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "#4D227C", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: "500" }}>
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
                            <input type="time" value={slot.startTime} onChange={(e) => handleTimeSlotChange(selectedDay, index, "startTime", e.target.value)} style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", minWidth: "150px" }} />
                            <span style={{ fontWeight: "500" }}>to</span>
                            <input type="time" value={slot.endTime} onChange={(e) => handleTimeSlotChange(selectedDay, index, "endTime", e.target.value)} style={{ padding: "10px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", minWidth: "150px" }} />
                            <button onClick={() => handleRemoveTimeSlot(selectedDay, index)} style={{ padding: "8px", borderRadius: "6px", border: "none", backgroundColor: "#ff4444", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FiTrash2 /></button>
                          </div>
                          <div style={{ paddingLeft: "90px" }}>
                            <h5 style={{ marginBottom: "10px", fontSize: "12px", fontWeight: "600", color: "#333", textTransform: "uppercase", letterSpacing: "0.5px" }}>Clinic Type</h5>
                            <div style={{ display: "flex", gap: "20px" }}>
                              {["online","physical"].map((type) => (
                                <label key={type} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#555" }}>
                                  <input type="radio" name={`clinicType-${selectedDay}-${index}`} value={type} checked={slot.clinicType === type} onChange={(e) => handleTimeSlotChange(selectedDay, index, "clinicType", e.target.value)} style={{ width: "16px", height: "16px", accentColor: "#4D227C", cursor: "pointer" }} />
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

                {/* Schedule Summary */}
                <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
                  <h4 style={{ marginBottom: "10px" }}>Schedule Summary</h4>
                  {DAYS_OF_WEEK.map((day) =>
                    weeklySchedule[day].length > 0 && (
                      <div key={day} style={{ marginBottom: "8px" }}>
                        <strong>{day}:</strong>{" "}
                        {weeklySchedule[day].map((slot, idx) => {
                          const fmt = (t) => { if (!t) return ""; const [h, m] = t.split(":"); const hr = parseInt(h); return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`; };
                          return <span key={idx}>{fmt(slot.startTime)} – {fmt(slot.endTime)}{slot.clinicType === "online" ? " (Online)" : slot.clinicType === "physical" ? " (Physical)" : ""}{idx < weeklySchedule[day].length - 1 ? ", " : ""}</span>;
                        })}
                      </div>
                    )
                  )}
                  {DAYS_OF_WEEK.every((d) => weeklySchedule[d].length === 0) && <div style={{ color: "#666" }}>No schedules added yet.</div>}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-add" onClick={handleSaveSchedule}>Save Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Lightbox ═══════════════════════════════════════════════════════════ */}
      {showLightbox && lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => { setShowLightbox(false); setLightboxSrc(null); }} />
      )}
    </div>
  );
}

export default DoctorAppointment;
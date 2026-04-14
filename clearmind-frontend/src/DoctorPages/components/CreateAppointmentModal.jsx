import { useState, useRef, useEffect, useCallback } from "react";
import { format } from "date-fns";
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
} from "react-icons/fi";
import styles from "../DoctorStyle/CreateAppointmentModal.module.css";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://localhost:8000/api";
const getToken = () => localStorage.getItem("token");

/* ─── Toast Styles ─── */
const toastSuccess = {
  duration: 1500,
  style: {
    background: "#E2F7E3",
    border: "1px solid #91C793",
    color: "#2E7D32",
    fontWeight: 600,
    fontSize: "0.95rem",
    textAlign: "center",
    maxWidth: "320px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
  },
  iconTheme: { primary: "#2E7D32", secondary: "#E2F7E3" },
};

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
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
  },
  iconTheme: { primary: "#C62828", secondary: "#FDECEA" },
};

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
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 4));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.5));
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      setZoom((z) => Math.max(0.5, Math.min(4, z - e.deltaY * 0.001)));
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setDragging(true);
    setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };
  const handleMouseUp = () => setDragging(false);
  const resetView = () => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  const isPdf = file?.type === "application/pdf";

  const toolbarBtnStyle = {
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
              style={toolbarBtnStyle}
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              title="Zoom out (-)"
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
              style={toolbarBtnStyle}
              onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              title="Zoom in (+)"
            >
              <FiZoomIn size={15} />
            </button>
            <button
              style={toolbarBtnStyle}
              onClick={resetView}
              title="Reset view"
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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
              transform: `translate(${pos.x}px, ${pos.y}px)`,
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

  const fetchPatients = useCallback(async (searchQuery, signal) => {
    setLoading(true);
    try {
      const qs = searchQuery.trim()
        ? `&search=${encodeURIComponent(searchQuery)}`
        : "";
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
    const b = new Date(patient.dob);
    const t = new Date();
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
        <Row label="DOB" value={patient.dob} />
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
   DoctorDropdown
───────────────────────────────────────────────────────── */
function DoctorDropdown({ onSelect, value }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const ref = useRef(null);

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
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchDoctors();
  }, [open, fetchDoctors]);

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
                    <div>
                      {d.firstName}{" "}
                      {d.middleInitial ? d.middleInitial + ". " : ""}
                      {d.lastName}
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
  reference_number: "",
};

/* ─────────────────────────────────────────────────────────
   CreateAppointmentModal
───────────────────────────────────────────────────────── */
function CreateAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  showReceipt = false,
  showAssignedDoctor = false,
  isAdmin = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [showPAEPanel, setShowPAEPanel] = useState(false);
  const [receiptEntries, setReceiptEntries] = useState([]);
  const [previewEntry, setPreviewEntry] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [services, setServices] = useState([]);
  const [paePurposes, setPaePurposes] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const receiptInputRef = useRef(null);
  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  useEffect(() => {
    return () => {
      receiptEntries.forEach((e) => URL.revokeObjectURL(e.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addReceiptFiles = (files) => {
    const newEntries = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setReceiptEntries((prev) => [...prev, ...newEntries]);
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

  const handleStartTime = (e) => {
    const t = e.target.value;
    let end = "";
    if (t) {
      const [h, m] = t.split(":").map(Number);
      end = `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
    setForm((f) => ({ ...f, start_time: t, end_time: end }));
  };

  const handleServiceSelect = (id) => {
    setSelectedService(id);
    set("service_type", id);
    const svc = services.find((s) => s.id === id);
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
    if (form.payment_status === "paid" && !form.reference_number.trim()) {
      errs.reference_number =
        "Reference number is required when payment is paid.";
    }

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
    fd.append("payment_status", form.payment_status);
    if (form.reference_number.trim())
      fd.append("reference_number", form.reference_number.trim());
    if (selectedDoctor) fd.append("doctor_user_id", selectedDoctor.id);
    receiptEntries.forEach((entry) => {
      fd.append("receipts[]", entry.file);
    });

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
      if (onSuccess) onSuccess(result.data);

      toast.success("Appointment created successfully!", toastSuccess);

      handleClose();
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
    setSelectedService("");
    setShowPAEPanel(false);
    clearAllReceipts();
    setErrors({});
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

        /* Reference number box */
        .ref-box{background:#fff8e1;border:1.5px solid #fde68a;border-radius:10px;padding:14px 16px;margin-top:12px;animation:paeIn .2s ease}
        .ref-box-label{font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.5px;margin:0 0 8px;display:block}
        .ref-box-input{width:100%;padding:10px 13px;border-radius:8px;border:1.5px solid #fde68a;font-size:13px;font-family:inherit;color:#333;box-sizing:border-box;background:#fffdf0;outline:none;transition:border .2s}
        .ref-box-input:focus{border-color:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,0.15)}
        .ref-box-hint{font-size:11px;color:#b45309;margin-top:5px;display:block}
      `}</style>

      {previewEntry && (
        <ImagePreviewModal
          file={previewEntry.file}
          src={previewEntry.url}
          onClose={() => setPreviewEntry(null)}
        />
      )}

      <div className={styles.backdrop}>
        <div className={styles.modal}>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.headerTitle}>Create Appointment</h2>
            <div className={styles.headerRight}>
              <span className={styles.headerDate}>
                {form.appointment_date
                  ? format(
                      new Date(form.appointment_date + "T00:00:00"),
                      "MMM d, yyyy",
                    )
                  : format(new Date(), "MMM d, yyyy")}
              </span>
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
              <div className={styles.grid3}>
                <LabeledInput label="Date">
                  <input
                    className={styles.input}
                    type="date"
                    value={form.appointment_date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => set("appointment_date", e.target.value)}
                  />
                  <Err field="appointment_date" />
                </LabeledInput>
                <LabeledInput label="Start Time">
                  <input
                    className={styles.input}
                    type="time"
                    value={form.start_time}
                    onChange={handleStartTime}
                  />
                  <Err field="start_time" />
                </LabeledInput>
                <LabeledInput label="End Time" disabled>
                  <input
                    className={styles.input}
                    type="time"
                    value={form.end_time}
                    readOnly
                    placeholder="--:--"
                  />
                </LabeledInput>
              </div>

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

              {(showAssignedDoctor || isAdmin) && (
                <div className={styles.fieldRow} style={{ marginTop: "16px" }}>
                  <DoctorDropdown
                    value={selectedDoctor}
                    onSelect={setSelectedDoctor}
                  />
                </div>
              )}
            </div>

            {/* ══ PAYMENT ══ */}
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Payment Status</h4>
              <div className={styles.fieldRow}>
                <select
                  className={styles.select}
                  value={form.payment_status}
                  onChange={(e) => {
                    set("payment_status", e.target.value);
                    if (e.target.value !== "paid") set("reference_number", "");
                  }}
                >
                  <option value="">Select Payment Status</option>
                  <option value="paid">Paid</option>
                  <option value="not_paid">Not Paid</option>
                  <option value="probono">Probono</option>
                </select>
              </div>

              {/* ── Reference Number — only shown when Paid ── */}
              {form.payment_status === "paid" && (
                <div className="ref-box">
                  <span className="ref-box-label">🔖 Reference Number</span>
                  <input
                    className="ref-box-input"
                    type="text"
                    placeholder="e.g. GCash ref: 1234567890"
                    value={form.reference_number}
                    onChange={(e) => set("reference_number", e.target.value)}
                  />
                  {errors.reference_number && <Err field="reference_number" />}
                  <span className="ref-box-hint">
                    Enter the GCash / bank transaction reference number.
                  </span>
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
          </div>

          {/* Footer */}
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

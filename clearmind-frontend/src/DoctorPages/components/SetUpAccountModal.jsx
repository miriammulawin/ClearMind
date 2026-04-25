import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FiX,
  FiPlus,
  FiChevronDown,
  FiFile,
  FiTrash2,
  FiUser,
  FiCheck,
  FiEye,
  FiChevronRight,
  FiChevronLeft,
  FiStar,
  FiAward,
  FiShield,
  FiBriefcase,
  FiCamera,
  FiLock,
  FiEyeOff,
  FiAlertCircle,
} from "react-icons/fi";
import styles from "../DoctorStyle/AccountSetupModal.module.css";
import axiosClient from "../../axiosClient";

/* ─────────────────────────────────────────────
   Config
───────────────────────────────────────────── */
const STORAGE_BASE = "http://localhost:8000/storage/";

/* ─────────────────────────────────────────────
   Steps
───────────────────────────────────────────── */
const STEPS = [
  { key: "profile", label: "Profile", icon: <FiUser size={12} /> },
  { key: "practice", label: "Practice", icon: <FiBriefcase size={12} /> },
  { key: "certs", label: "Credentials", icon: <FiAward size={12} /> },
  { key: "services", label: "Services", icon: <FiStar size={12} /> },
  { key: "docs", label: "Documents", icon: <FiShield size={12} /> },
  { key: "security", label: "Password", icon: <FiLock size={12} /> },
];

/* ─────────────────────────────────────────────
   Static dropdown options
───────────────────────────────────────────── */
const STATIC_OPTIONS = {
  specialization: ["Psychologist", "Psychiatrist", "Psychometrician"],
  subSpecialization: [
    "Cognitive Behavioral Therapy (CBT)",
    "Dialectical Behavior Therapy (DBT)",
    "Psychodynamic Therapy",
    "Trauma-Focused Therapy",
    "Play Therapy",
    "Adolescent Mental Health",
    "Autism Spectrum Disorder",
    "ADHD Assessment & Management",
    "Anxiety & Mood Disorders",
    "Post-Traumatic Stress Disorder (PTSD)",
    "Eating Disorders",
    "Substance Use & Addiction",
    "Couples & Family Therapy",
    "Grief & Bereavement Counseling",
    "Occupational / Work-Related Stress",
    "School Psychology",
    "Geriatric Mental Health",
    "Neuropsychological Assessment",
    "Child Developmental Assessment",
    "Crisis Intervention",
  ],
  boardCertificate: [
    "Professional Regulation Commission (PRC) — Psychologist",
    "Professional Regulation Commission (PRC) — Psychiatrist",
    "Professional Regulation Commission (PRC) — Physician",
    "Philippine Board of Psychology (PBP)",
    "Philippine Psychiatric Association (PPA) Board",
    "Philippine Pediatric Society (PPS) Board",
    "Philippine Neurological Association (PNA) Board",
    "Philippine Academy of Family Physicians (PAFP) Board",
    "Philippine College of Surgeons (PCS) Board",
    "Philippine College of Physicians (PCP) Board",
    "Philippine Obstetrical and Gynecological Society (POGS) Board",
    "Philippine Society of Otolaryngology (PSO) Board",
    "American Board of Psychiatry and Neurology (ABPN)",
    "American Board of Pediatrics (ABP)",
    "Royal College of Psychiatrists (RCPsych)",
  ],
};

/* ─────────────────────────────────────────────
   Lightbox
───────────────────────────────────────────── */
function Lightbox({ src, name, onClose }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const isPdf = src?.toLowerCase().endsWith(".pdf");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50px",
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            maxWidth: "300px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            color: "#fff",
            cursor: "pointer",
            padding: "6px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FiX size={17} />
        </button>
      </div>
      <div
        style={{
          marginTop: "50px",
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isPdf ? (
          <iframe
            src={src}
            style={{
              width: "90vw",
              height: "80vh",
              border: "none",
              borderRadius: "8px",
            }}
            title={name}
          />
        ) : (
          <img
            src={src}
            alt={name}
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: "8px",
              boxShadow: "0 0 40px rgba(0,0,0,0.5)",
              objectFit: "contain",
            }}
          />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          color: "rgba(255,255,255,0.3)",
          fontSize: "11px",
          pointerEvents: "none",
        }}
      >
        Esc to close
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DropdownListInput
───────────────────────────────────────────── */
function DropdownListInput({
  label,
  options: propOptions = [],
  selected,
  onAdd,
  onRemove,
}) {
  const [options, setOptions] = useState(propOptions);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setOptions(propOptions);
  }, [propOptions]);

  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const trimmed = search.trim();
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase()),
  );
  const exactMatch = options.some(
    (o) => o.toLowerCase() === trimmed.toLowerCase(),
  );
  const showAdd = trimmed.length > 0 && !exactMatch;

  const handleSelect = (item) => {
    if (selected.includes(item)) onRemove(selected.indexOf(item));
    else onAdd(item);
    setSearch("");
    inputRef.current?.focus();
  };

  const handleAddNew = () => {
    if (!trimmed) return;
    if (!options.includes(trimmed)) setOptions((p) => [...p, trimmed]);
    if (!selected.includes(trimmed)) onAdd(trimmed);
    setSearch("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const unsel = filtered.filter((o) => !selected.includes(o));
      if (unsel.length === 1) handleSelect(unsel[0]);
      else if (showAdd) handleAddNew();
    }
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  const baseInputSt = {
    width: "100%",
    height: "42px",
    padding: "0 36px 0 14px",
    border: "1.5px solid #e2d5f5",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "Poppins, sans-serif",
    color: "#333",
    outline: "none",
    boxSizing: "border-box",
    transition: "border .2s, box-shadow .2s",
    background: "#fff",
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#4d227c",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "6px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder={
              selected.length
                ? `${selected.length} selected — type to add more`
                : "Search or add…"
            }
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={(e) => {
              setOpen(true);
              e.target.style.border = "1.5px solid #4d227c";
              e.target.style.boxShadow = "0 0 0 3px rgba(77,34,124,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1.5px solid #e2d5f5";
              e.target.style.boxShadow = "none";
            }}
            onKeyDown={handleKeyDown}
            style={baseInputSt}
          />
          <FiChevronDown
            size={15}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: open
                ? "translateY(-50%) rotate(180deg)"
                : "translateY(-50%)",
              transition: "transform 0.2s",
              color: "#4d227c",
              pointerEvents: "none",
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            inputRef.current?.focus();
          }}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "8px",
            border: "none",
            background: "#4d227c",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#3d1870")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#4d227c")}
        >
          <FiPlus size={17} />
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: "52px",
            background: "#fff",
            border: "1.5px solid #ede5f7",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(77,34,124,0.14)",
            zIndex: 2000,
            overflow: "hidden",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "6px 0",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {showAdd && (
              <li
                onClick={handleAddNew}
                style={{
                  padding: "9px 16px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "Poppins, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#f8f4fd",
                  borderBottom: "1px solid #ede5f7",
                  color: "#4d227c",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#ede5f7")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#f8f4fd")
                }
              >
                <FiPlus size={13} /> Add{" "}
                <strong style={{ marginLeft: 2 }}>"{trimmed}"</strong>
              </li>
            )}
            {filtered.length > 0
              ? filtered.map((item) => {
                  const isSel = selected.includes(item);
                  return (
                    <li
                      key={item}
                      onClick={() => handleSelect(item)}
                      style={{
                        padding: "8px 16px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontFamily: "Poppins, sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: isSel ? "#f0eaff" : "transparent",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = isSel
                          ? "#e8e0fa"
                          : "#f8f4fd")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isSel
                          ? "#f0eaff"
                          : "transparent")
                      }
                    >
                      <span>{item}</span>
                      {isSel && (
                        <FiCheck
                          size={13}
                          style={{ color: "#4d227c", flexShrink: 0 }}
                        />
                      )}
                    </li>
                  );
                })
              : !showAdd && (
                  <li
                    style={{
                      padding: "10px 16px",
                      fontSize: "13px",
                      color: "#aaa",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    No results — type to add a new entry
                  </li>
                )}
          </ul>
        </div>
      )}

      {selected.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          {selected.map((item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#4d227c",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "11.5px",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(i)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiX size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ServicesDropdown — uses axiosClient
───────────────────────────────────────────── */
function ServicesDropdown({ selected, onAdd, onRemove }) {
  const [apiOptions, setApiOptions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: json } = await axiosClient.get("/services");
        setApiOptions(json.data || []);
      } catch (e) {
        setFetchError("Could not load services. Please refresh.");
        console.error("Services fetch error:", e);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = apiOptions.filter((s) =>
    s.service_name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (serviceName) => {
    if (selected.includes(serviceName)) onRemove(selected.indexOf(serviceName));
    else onAdd(serviceName);
    setSearch("");
    inputRef.current?.focus();
  };

  const baseInputSt = {
    width: "100%",
    height: "42px",
    padding: "0 36px 0 14px",
    border: "1.5px solid #e2d5f5",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "Poppins, sans-serif",
    color: "#333",
    outline: "none",
    boxSizing: "border-box",
    transition: "border .2s, box-shadow .2s",
    background: "#fff",
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#4d227c",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "6px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        My Services *
      </div>

      {fetchError && (
        <div
          style={{
            fontSize: "12px",
            color: "#e53e3e",
            background: "#fff0f0",
            border: "1px solid #fca5a5",
            borderRadius: "8px",
            padding: "8px 12px",
            marginBottom: "8px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <FiAlertCircle size={13} /> {fetchError}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder={
              fetching
                ? "Loading services…"
                : selected.length
                  ? `${selected.length} selected — search to add more`
                  : "Search services…"
            }
            disabled={fetching || !!fetchError}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={(e) => {
              setOpen(true);
              e.target.style.border = "1.5px solid #4d227c";
              e.target.style.boxShadow = "0 0 0 3px rgba(77,34,124,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1.5px solid #e2d5f5";
              e.target.style.boxShadow = "none";
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                setSearch("");
              }
              if (e.key === "Enter") {
                e.preventDefault();
                const unsel = filtered.filter(
                  (s) => !selected.includes(s.service_name),
                );
                if (unsel.length === 1) handleSelect(unsel[0].service_name);
              }
            }}
            style={{ ...baseInputSt, opacity: fetching ? 0.6 : 1 }}
          />
          {fetching ? (
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "13px",
                height: "13px",
                borderRadius: "50%",
                border: "2px solid #e2d5f5",
                borderTopColor: "#4d227c",
                animation: "spin .7s linear infinite",
                display: "inline-block",
              }}
            />
          ) : (
            <FiChevronDown
              size={15}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: open
                  ? "translateY(-50%) rotate(180deg)"
                  : "translateY(-50%)",
                transition: "transform 0.2s",
                color: "#4d227c",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            inputRef.current?.focus();
          }}
          disabled={fetching || !!fetchError}
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "8px",
            border: "none",
            background: fetching ? "#c4a8e8" : "#4d227c",
            color: "#fff",
            cursor: fetching ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!fetching) e.currentTarget.style.background = "#3d1870";
          }}
          onMouseLeave={(e) => {
            if (!fetching) e.currentTarget.style.background = "#4d227c";
          }}
        >
          <FiPlus size={17} />
        </button>
      </div>

      {open && !fetching && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: "52px",
            background: "#fff",
            border: "1.5px solid #ede5f7",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(77,34,124,0.14)",
            zIndex: 2000,
            overflow: "hidden",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "6px 0",
              maxHeight: "220px",
              overflowY: "auto",
            }}
          >
            {filtered.length > 0 ? (
              filtered.map((svc) => {
                const isSel = selected.includes(svc.service_name);
                return (
                  <li
                    key={svc.service_id}
                    onClick={() => handleSelect(svc.service_name)}
                    style={{
                      padding: "10px 16px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontFamily: "Poppins, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isSel ? "#f0eaff" : "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = isSel
                        ? "#e8e0fa"
                        : "#f8f4fd")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = isSel
                        ? "#f0eaff"
                        : "transparent")
                    }
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#2d2040" }}>
                        {svc.service_name}
                      </div>
                      {svc.description && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#9e84c2",
                            marginTop: "1px",
                          }}
                        >
                          {svc.description.length > 60
                            ? svc.description.slice(0, 60) + "…"
                            : svc.description}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexShrink: 0,
                        marginLeft: "12px",
                      }}
                    >
                      {isSel && (
                        <FiCheck size={14} style={{ color: "#4d227c" }} />
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <li
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#aaa",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {search
                  ? "No matching services found."
                  : "No services available."}
              </li>
            )}
          </ul>
        </div>
      )}

      {selected.length > 0 && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          {selected.map((name, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#4d227c",
                color: "#fff",
                padding: "5px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 500,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {name}
              <button
                type="button"
                onClick={() => onRemove(i)}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.8)",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FiX size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MultiFileInput
───────────────────────────────────────────── */
function MultiFileInput({
  label,
  files,
  existingUrls = [],
  onFileAdd,
  onFileRemove,
  onExistingRemove,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const objUrls = useMemo(
    () => files.map((f) => URL.createObjectURL(f)),
    [files],
  );
  useEffect(() => {
    return () => objUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [objUrls]);

  const isImg = (src) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(src) || src?.startsWith("blob:");

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.border = "2px dashed #4d227c";
    e.currentTarget.style.background = "rgba(77,34,124,0.04)";
  };
  const handleDragLeave = (e) => {
    e.currentTarget.style.border = "2px dashed #d4b8f0";
    e.currentTarget.style.background = "#f8f4fd";
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.border = "2px dashed #d4b8f0";
    e.currentTarget.style.background = "#f8f4fd";
    Array.from(e.dataTransfer.files).forEach((f) => onFileAdd(f));
  };

  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#4d227c",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "8px",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {label}
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: "2px dashed #d4b8f0",
          borderRadius: "10px",
          background: "#f8f4fd",
          padding: "14px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(77,34,124,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FiCamera size={17} color="#4d227c" />
        </div>
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#4d227c",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Click to upload or drag &amp; drop
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#aaa",
              marginTop: "1px",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            JPG, PNG, PDF — multiple files allowed
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            Array.from(e.target.files).forEach((f) => onFileAdd(f));
            e.target.value = "";
          }}
        />
      </div>
      {(existingUrls.length > 0 || files.length > 0) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "10px",
          }}
        >
          {existingUrls.map((url, i) => (
            <Thumb
              key={`e${i}`}
              src={url}
              name={`File ${i + 1}`}
              isNew={false}
              onView={() => setPreview({ src: url, name: `File ${i + 1}` })}
              onRemove={() => onExistingRemove && onExistingRemove(i)}
              isImg={isImg}
            />
          ))}
          {files.map((file, i) => {
            const src = objUrls[i] || null;
            return (
              <Thumb
                key={`n${i}`}
                src={src}
                name={file.name}
                isNew={true}
                onView={() => src && setPreview({ src, name: file.name })}
                onRemove={() => onFileRemove(i)}
                isImg={isImg}
              />
            );
          })}
        </div>
      )}
      {preview && (
        <Lightbox
          src={preview.src}
          name={preview.name}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

function Thumb({ src, name, isNew, onView, onRemove, isImg }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        position: "relative",
        width: "72px",
        height: "72px",
        borderRadius: "10px",
        overflow: "hidden",
        border: `1.5px solid ${isNew ? "#c5b0e8" : "#d4bbf0"}`,
        background: "#f8f4fd",
        flexShrink: 0,
        cursor: "pointer",
      }}
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isImg(src) && src ? (
        <img
          src={src}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}
        >
          <FiFile size={22} color="#9c7dd4" />
          <span
            style={{
              fontSize: "9px",
              color: "#888",
              padding: "0 4px",
              textAlign: "center",
            }}
          >
            PDF
          </span>
        </div>
      )}
      {isNew && (
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: "3px",
            background: "#4d227c",
            color: "#fff",
            fontSize: "8px",
            fontWeight: 700,
            padding: "1px 5px",
            borderRadius: "6px",
            pointerEvents: "none",
          }}
        >
          NEW
        </span>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered ? "rgba(77,34,124,0.55)" : "rgba(0,0,0,0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          transition: "background .15s",
        }}
      >
        {hovered && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "none",
                borderRadius: "5px",
                width: "26px",
                height: "26px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4d227c",
              }}
            >
              <FiEye size={13} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "none",
                borderRadius: "5px",
                width: "26px",
                height: "26px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#e53e3e",
              }}
            >
              <FiTrash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ProfilePictureInput
───────────────────────────────────────────── */
function ProfilePictureInput({ file, existingUrl, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const [hovered, setHovered] = useState(false);
  const objUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [objUrl]);
  const src = objUrl || (existingUrl ? STORAGE_BASE + existingUrl : null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <div
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "76px",
          height: "76px",
          borderRadius: "50%",
          border: hovered ? "2px solid #4d227c" : "2px solid #e2d5f5",
          overflow: "hidden",
          background: "#f8f4fd",
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "border .2s",
          boxShadow: "0 2px 10px rgba(77,34,124,0.12)",
        }}
      >
        {src ? (
          <img
            src={src}
            alt="profile"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <FiUser size={28} color="#c4a8e8" />
        )}
        {hovered && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(77,34,124,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            <FiCamera size={18} color="#fff" />
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#333",
            fontFamily: "Poppins, sans-serif",
            marginBottom: "4px",
          }}
        >
          {src ? (file ? file.name : "Current photo") : "No photo uploaded"}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#aaa",
            fontFamily: "Poppins, sans-serif",
            marginBottom: "8px",
          }}
        >
          JPG or PNG · Max 5 MB
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "7px",
              border: "1.5px solid #e2d5f5",
              background: "#f8f4fd",
              color: "#4d227c",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Poppins, sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ede5f7";
              e.currentTarget.style.border = "1.5px solid #c4a8e8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f8f4fd";
              e.currentTarget.style.border = "1.5px solid #e2d5f5";
            }}
          >
            <FiCamera size={13} /> Browse
          </button>
          {src && (
            <button
              type="button"
              onClick={() => setPreview(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "7px",
                border: "1.5px solid #e2d5f5",
                background: "none",
                color: "#888",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Poppins, sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8f4fd";
                e.currentTarget.style.color = "#4d227c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "#888";
              }}
            >
              <FiEye size={13} /> Preview
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files[0];
          if (f) onChange(f);
          e.target.value = "";
        }}
      />
      {preview && src && (
        <Lightbox
          src={src}
          name="Profile Picture"
          onClose={() => setPreview(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Field
───────────────────────────────────────────── */
function Field({ label, required, children, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#4d227c",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {label}
        {required && (
          <span style={{ color: "#e53e3e", marginLeft: "3px" }}>*</span>
        )}
      </label>
      {children}
      {error && (
        <span
          style={{
            fontSize: "11px",
            color: "#e53e3e",
            fontFamily: "Poppins, sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "2px",
          }}
        >
          <FiAlertCircle size={11} />
          {Array.isArray(error) ? error[0] : error}
        </span>
      )}
    </div>
  );
}

const inputSt = {
  width: "100%",
  height: "40px",
  padding: "0 13px",
  border: "1.5px solid #e2d5f5",
  borderRadius: "8px",
  fontSize: "13px",
  fontFamily: "Poppins, sans-serif",
  color: "#333",
  outline: "none",
  transition: "border .2s, box-shadow .2s",
  boxSizing: "border-box",
  background: "#fff",
};
const onFocusInput = (e) => {
  e.target.style.border = "1.5px solid #4d227c";
  e.target.style.boxShadow = "0 0 0 3px rgba(77,34,124,0.1)";
};
const onBlurInput = (e) => {
  e.target.style.border = "1.5px solid #e2d5f5";
  e.target.style.boxShadow = "none";
};

/* ─────────────────────────────────────────────
   PasswordInput
───────────────────────────────────────────── */
function PasswordInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ ...inputSt, paddingRight: "40px" }}
        onFocus={onFocusInput}
        onBlur={onBlurInput}
        autoComplete="new-password"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#aaa",
          display: "flex",
          alignItems: "center",
          padding: "2px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#4d227c")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
      >
        {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PasswordStrength
───────────────────────────────────────────── */
function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Uppercase letter (A–Z)", ok: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a–z)", ok: /[a-z]/.test(password) },
    { label: "Number (0–9)", ok: /\d/.test(password) },
    { label: "Special character (!@#…)", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = [
    "#e2d5f5",
    "#e53e3e",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#15803d",
  ];
  const labels = ["", "Too weak", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background: n <= score ? colors[score] : "#e2d5f5",
              transition: "background .3s",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: colors[score],
          fontFamily: "Poppins, sans-serif",
          marginBottom: "8px",
        }}
      >
        {labels[score]}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {checks.map((c) => (
          <div
            key={c.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11.5px",
              fontFamily: "Poppins, sans-serif",
              color: c.ok ? "#15803d" : "#aaa",
            }}
          >
            <FiCheck size={11} style={{ opacity: c.ok ? 1 : 0.3 }} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

const Spinner = () => (
  <span
    style={{
      width: "13px",
      height: "13px",
      borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.4)",
      borderTopColor: "#fff",
      animation: "spin .7s linear infinite",
      display: "inline-block",
      flexShrink: 0,
    }}
  />
);

/* ═════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════ */
function AccountSetupModal({ showModal, onClose }) {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompleted] = useState(new Set());

  const [formData, setFormData] = useState({
    description: "",
    professionalTitle: "",
    yearsOfExperience: "",
    practicingSince: "",
    licenseNumber: "",
    prcNumber: "",
  });

  const [_doctorName, setDoctorName] = useState("");
  const [_doctorEmail, setDoctorEmail] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(false);

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [boardCertFiles, setBoardCertFiles] = useState([]);
  const [idPicFiles, setIdPicFiles] = useState([]);

  const [existingProfilePic, setExistingProfilePic] = useState(null);
  const [existingBoardCerts, setExistingBoardCerts] = useState([]);
  const [existingIdPics, setExistingIdPics] = useState([]);

  const [specializationList, setSpecializationList] = useState([]);
  const [subSpecializationList, setSubSpecializationList] = useState([]);
  const [boardCertificateList, setBoardCertificateList] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileSaved, setProfileSaved] = useState(false);

  const set = (f, v) => setFormData((p) => ({ ...p, [f]: v }));
  const setPw = (f, v) => setPwForm((p) => ({ ...p, [f]: v }));

  /* ── Load profile ── */
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { data: d = {} },
      } = await axiosClient.get("/doctor/profile");

      setDoctorName(
        `${d.firstName || ""} ${d.middleInitial ? d.middleInitial + ". " : ""}${d.lastName || ""}`.trim(),
      );
      setDoctorEmail(d.email || "");
      setProfileCompleted(!!d.profile_completed);

      setFormData({
        description: d.description || "",
        professionalTitle: d.professional_title || "",
        yearsOfExperience:
          d.years_of_experience != null ? String(d.years_of_experience) : "",
        practicingSince: d.practicing_since || "",
        licenseNumber: d.license_number || "",
        prcNumber: d.prc_number || "",
      });

      setSpecializationList(d.specializations || []);
      setSubSpecializationList(d.sub_specializations || []);
      setBoardCertificateList(d.board_cert_names || []);
      setServicesList(d.services || []);
      setExistingProfilePic(d.profile_picture || null);
      setExistingBoardCerts(d.board_cert_images || []);
      setExistingIdPics(d.id_pictures || []);
    } catch (e) {
      console.error("loadProfile error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showModal) {
      setStep(0);
      setCompleted(new Set());
      setProfileSaved(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwErrors({});
      setPwSuccess("");
      loadProfile();
    }
  }, [showModal, loadProfile]);

  /* ── Remove server file — uses axiosClient ── */
  const removeExistingFile = async (field, index, setter) => {
    const paths =
      field === "board_cert_images" ? existingBoardCerts : existingIdPics;
    try {
      await axiosClient.delete("/doctor/profile/files", {
        data: { field, path: paths[index] },
      });
    } catch (e) {
      console.error("removeExistingFile error:", e);
    }
    setter((p) => p.filter((_, i) => i !== index));
  };

  const goNext = () => {
    setCompleted((p) => new Set([...p, step]));
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  /* ── Save profile — uses axiosClient ── */
  async function handleUpload() {
    setErrors({});
    setSubmitting(true);
    const fd = new FormData();
    fd.append("professional_title", formData.professionalTitle);
    fd.append("description", formData.description);
    fd.append("years_of_experience", formData.yearsOfExperience);
    fd.append("license_number", formData.licenseNumber);
    fd.append("practicing_since", formData.practicingSince);
    fd.append("prc_number", formData.prcNumber);
    fd.append("specializations", JSON.stringify(specializationList));
    fd.append("sub_specializations", JSON.stringify(subSpecializationList));
    fd.append("board_cert_names", JSON.stringify(boardCertificateList));
    fd.append("services", JSON.stringify(servicesList));
    if (profilePicFile) fd.append("profile_picture", profilePicFile);
    boardCertFiles.forEach((f) => fd.append("board_cert_images[]", f));
    idPicFiles.forEach((f) => fd.append("id_pictures[]", f));

    try {
      const { data: json } = await axiosClient.post(
        "/doctor/profile/setup",
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setProfileSaved(true);
      setBoardCertFiles([]);
      setIdPicFiles([]);
      setProfilePicFile(null);
      setCompleted((p) => new Set([...p, step]));
      await loadProfile();

      // Refresh sidebar cache
      const {
        data: { data },
      } = await axiosClient.get("/doctor/profile");
      window.dispatchEvent(
        new CustomEvent("doctorProfileUpdated", {
          detail: {
            firstName: data.firstName || data.first_name || "",
            lastName: data.lastName || data.last_name || "",
            middleInitial: data.middleInitial || data.middle_initial || "",
            prcLicenseNo: data.prcLicenseNo || data.prc_number || "",
            profilePicture: data.profilePicture || data.profile_picture || null,
          },
        }),
      );

      setStep(STEPS.findIndex((s) => s.key === "security"));
    } catch (e) {
      // Axios wraps validation errors in e.response.data
      const json = e.response?.data || {};
      if (json.errors) {
        setErrors(json.errors);
        alert(
          `Validation failed:\n\n${Object.entries(json.errors)
            .map(([f, m]) => `• ${f}: ${Array.isArray(m) ? m[0] : m}`)
            .join("\n")}`,
        );
      } else {
        alert(json.message || `Error ${e.response?.status ?? "unknown"}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Change password — uses axiosClient ── */
  async function handleChangePassword() {
    setPwErrors({});
    setPwSuccess("");
    setPwSubmitting(true);

    const errs = {};
    if (!pwForm.currentPassword)
      errs.currentPassword = "Current password is required.";
    if (!pwForm.newPassword) errs.newPassword = "New password is required.";
    if (pwForm.newPassword && pwForm.newPassword.length < 8)
      errs.newPassword = "Password must be at least 8 characters.";
    if (pwForm.newPassword !== pwForm.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    if (Object.keys(errs).length) {
      setPwErrors(errs);
      setPwSubmitting(false);
      return;
    }

    try {
      await axiosClient.put("/doctor/change-password", {
        current_password: pwForm.currentPassword,
        password: pwForm.newPassword,
        password_confirmation: pwForm.confirmPassword,
      });

      setPwSuccess(
        "Password changed successfully! You can now close this setup.",
      );
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setCompleted((p) => new Set([...p, step]));
    } catch (e) {
      const json = e.response?.data || {};
      if (json.errors) setPwErrors(json.errors);
      else
        setPwErrors({
          currentPassword:
            json.message || `Error ${e.response?.status ?? "unknown"}`,
        });
    } finally {
      setPwSubmitting(false);
    }
  }

  if (!showModal) return null;

  const currentStepKey = STEPS[step].key;
  const isDocsStep = currentStepKey === "docs";
  const isSecurityStep = currentStepKey === "security";

  const renderStep = () => {
    if (loading) {
      return (
        <div className={styles.section}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                height: "42px",
                borderRadius: "8px",
                background:
                  "linear-gradient(90deg,#f8f4fd 0%,#ede5f7 50%,#f8f4fd 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s infinite",
              }}
            />
          ))}
          <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      );
    }

    switch (currentStepKey) {
      case "profile":
        return (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Personal Identity</p>
            <ProfilePictureInput
              file={profilePicFile}
              existingUrl={existingProfilePic}
              onChange={setProfilePicFile}
            />
            <Field label="Description">
              <textarea
                placeholder="Brief bio visible to patients…"
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                style={{
                  ...inputSt,
                  height: "auto",
                  minHeight: "72px",
                  padding: "10px 13px",
                  resize: "vertical",
                }}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
              />
            </Field>
            <Field
              label="Professional Title"
              required
              error={errors.professional_title}
            >
              <input
                type="text"
                placeholder="e.g. Licensed Psychologist"
                value={formData.professionalTitle}
                onChange={(e) => set("professionalTitle", e.target.value)}
                style={inputSt}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
              />
            </Field>
          </div>
        );

      case "practice":
        return (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Practice Details</p>
            <div className={styles.grid2}>
              <Field
                label="Years of Experience"
                required
                error={errors.years_of_experience}
              >
                <input
                  type="number"
                  placeholder="e.g. 8"
                  value={formData.yearsOfExperience}
                  onChange={(e) => set("yearsOfExperience", e.target.value)}
                  style={inputSt}
                  min="0"
                  max="70"
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </Field>
              <Field label="Practicing Since (Year)">
                <input
                  type="number"
                  placeholder={`e.g. ${new Date().getFullYear() - 8}`}
                  value={formData.practicingSince}
                  onChange={(e) => set("practicingSince", e.target.value)}
                  style={inputSt}
                  min="1900"
                  max={new Date().getFullYear()}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </Field>
              <Field
                label="License Number"
                required
                error={errors.license_number}
              >
                <input
                  type="text"
                  placeholder="e.g. 0012345"
                  value={formData.licenseNumber}
                  onChange={(e) => set("licenseNumber", e.target.value)}
                  style={inputSt}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </Field>
              <Field label="PRC Number" error={errors.prc_number}>
                <input
                  type="text"
                  placeholder="e.g. 0098765"
                  value={formData.prcNumber}
                  onChange={(e) => set("prcNumber", e.target.value)}
                  style={inputSt}
                  onFocus={onFocusInput}
                  onBlur={onBlurInput}
                />
              </Field>
            </div>
            <DropdownListInput
              label="Specializations *"
              options={STATIC_OPTIONS.specialization}
              selected={specializationList}
              onAdd={(item) => {
                if (!specializationList.includes(item))
                  setSpecializationList((p) => [...p, item]);
              }}
              onRemove={(i) =>
                setSpecializationList((p) => p.filter((_, idx) => idx !== i))
              }
            />
            <DropdownListInput
              label="Sub-specializations"
              options={STATIC_OPTIONS.subSpecialization}
              selected={subSpecializationList}
              onAdd={(item) => {
                if (!subSpecializationList.includes(item))
                  setSubSpecializationList((p) => [...p, item]);
              }}
              onRemove={(i) =>
                setSubSpecializationList((p) => p.filter((_, idx) => idx !== i))
              }
            />
          </div>
        );

      case "certs":
        return (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Board Credentials</p>
            <DropdownListInput
              label="Board Certificate Names"
              options={STATIC_OPTIONS.boardCertificate}
              selected={boardCertificateList}
              onAdd={(item) => {
                if (!boardCertificateList.includes(item))
                  setBoardCertificateList((p) => [...p, item]);
              }}
              onRemove={(i) =>
                setBoardCertificateList((p) => p.filter((_, idx) => idx !== i))
              }
            />
            <hr
              style={{
                border: "none",
                borderTop: "1px solid #ede5f7",
                margin: "4px 0",
              }}
            />
            <MultiFileInput
              label="Board Certificate Images"
              files={boardCertFiles}
              existingUrls={existingBoardCerts.map((p) => STORAGE_BASE + p)}
              onFileAdd={(f) => setBoardCertFiles((p) => [...p, f])}
              onFileRemove={(i) =>
                setBoardCertFiles((p) => p.filter((_, idx) => idx !== i))
              }
              onExistingRemove={(i) =>
                removeExistingFile(
                  "board_cert_images",
                  i,
                  setExistingBoardCerts,
                )
              }
            />
          </div>
        );

      case "services":
        return (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Services Offered</p>
            <p
              style={{
                fontSize: "12.5px",
                color: "#888",
                fontFamily: "Poppins, sans-serif",
                margin: "0 0 4px",
              }}
            >
              Select all services you provide — patients will see these on your
              profile.
            </p>
            <ServicesDropdown
              selected={servicesList}
              onAdd={(name) => {
                if (!servicesList.includes(name))
                  setServicesList((p) => [...p, name]);
              }}
              onRemove={(i) =>
                setServicesList((p) => p.filter((_, idx) => idx !== i))
              }
            />
          </div>
        );

      case "docs":
        return (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Identification Documents</p>
            <MultiFileInput
              label="Government / Professional ID Pictures"
              files={idPicFiles}
              existingUrls={existingIdPics.map((p) => STORAGE_BASE + p)}
              onFileAdd={(f) => setIdPicFiles((p) => [...p, f])}
              onFileRemove={(i) =>
                setIdPicFiles((p) => p.filter((_, idx) => idx !== i))
              }
              onExistingRemove={(i) =>
                removeExistingFile("id_pictures", i, setExistingIdPics)
              }
            />
            <div
              style={{
                background: "#f0e8ff",
                border: "1px solid #d4b8f0",
                borderRadius: "10px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                marginTop: "4px",
              }}
            >
              <FiAlertCircle
                size={15}
                color="#4d227c"
                style={{ flexShrink: 0, marginTop: "1px" }}
              />
              <div
                style={{
                  fontSize: "12px",
                  color: "#4d227c",
                  fontFamily: "Poppins, sans-serif",
                  lineHeight: 1.55,
                }}
              >
                After clicking <strong>Next</strong>, your complete profile (all
                steps) will be saved and you'll be taken to set your password.
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>Change Password</p>
            <div
              style={{
                background: "#f0e8ff",
                border: "1px solid #d4b8f0",
                borderRadius: "10px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <FiAlertCircle
                size={16}
                color="#4d227c"
                style={{ flexShrink: 0, marginTop: "1px" }}
              />
              <div
                style={{
                  fontSize: "12.5px",
                  color: "#4d227c",
                  fontFamily: "Poppins, sans-serif",
                  lineHeight: 1.55,
                }}
              >
                Your initial password was set by your administrator. Change it
                to something only you know.
                {profileSaved && (
                  <div
                    style={{
                      marginTop: "6px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "#15803d",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    <FiCheck size={12} /> Profile saved successfully!
                  </div>
                )}
              </div>
            </div>
            <Field label="Current Password" error={pwErrors.currentPassword}>
              <PasswordInput
                placeholder="Enter your current (admin-set) password"
                value={pwForm.currentPassword}
                onChange={(e) => setPw("currentPassword", e.target.value)}
              />
            </Field>
            <Field label="New Password" error={pwErrors.newPassword}>
              <PasswordInput
                placeholder="Create a strong new password"
                value={pwForm.newPassword}
                onChange={(e) => setPw("newPassword", e.target.value)}
              />
              <PasswordStrength password={pwForm.newPassword} />
            </Field>
            <Field
              label="Confirm New Password"
              error={pwErrors.confirmPassword}
            >
              <PasswordInput
                placeholder="Repeat your new password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPw("confirmPassword", e.target.value)}
              />
            </Field>
            {pwForm.newPassword && pwForm.confirmPassword && (
              <div
                style={{
                  fontSize: "12px",
                  fontFamily: "Poppins, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color:
                    pwForm.newPassword === pwForm.confirmPassword
                      ? "#15803d"
                      : "#e53e3e",
                }}
              >
                {pwForm.newPassword === pwForm.confirmPassword ? (
                  <>
                    <FiCheck size={12} /> Passwords match
                  </>
                ) : (
                  <>
                    <FiAlertCircle size={12} /> Passwords do not match
                  </>
                )}
              </div>
            )}
            {pwSuccess && (
              <div
                style={{
                  background: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  color: "#15803d",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "Poppins, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FiCheck size={15} /> {pwSuccess}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.headerTitle}>Account Setup</h2>
            <p className={styles.headerSubtitle}>
              Complete your professional profile
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {profileCompleted && (
              <span
                style={{
                  fontSize: "11px",
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "20px",
                  padding: "3px 10px",
                  fontWeight: 700,
                  fontFamily: "Poppins, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <FiCheck size={11} /> Profile Complete
              </span>
            )}
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Step bar */}
        <div className={styles.stepsBar}>
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => !loading && setStep(i)}
              className={`${styles.stepBtn} ${i === step ? styles.stepActive : ""} ${completedSteps.has(i) ? styles.stepDone : ""}`}
            >
              <span className={styles.stepNum}>
                {completedSteps.has(i) && i !== step ? (
                  <FiCheck size={10} />
                ) : (
                  i + 1
                )}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={styles.body}>{renderStep()}</div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {step > 0 && (
              <button
                type="button"
                className={styles.btnPrev}
                onClick={goPrev}
                disabled={submitting || pwSubmitting}
              >
                <FiChevronLeft size={14} /> Back
              </button>
            )}
            <span className={styles.stepPill}>
              {step + 1} / {STEPS.length}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className={styles.btnSkip}
              onClick={onClose}
              disabled={submitting || pwSubmitting}
            >
              Skip for now
            </button>
            {isSecurityStep ? (
              <button
                type="button"
                className={styles.btnUpload}
                onClick={handleChangePassword}
                disabled={pwSubmitting}
              >
                {pwSubmitting ? (
                  <>
                    <Spinner /> Saving…
                  </>
                ) : (
                  <>
                    <FiLock size={14} /> Change Password
                  </>
                )}
              </button>
            ) : isDocsStep ? (
              <button
                type="button"
                className={styles.btnUpload}
                onClick={handleUpload}
                disabled={submitting || loading}
              >
                {submitting ? (
                  <>
                    <Spinner /> Saving…
                  </>
                ) : (
                  <>
                    Save &amp; Continue <FiChevronRight size={14} />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnNext}
                onClick={goNext}
                disabled={loading}
              >
                Next <FiChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSetupModal;

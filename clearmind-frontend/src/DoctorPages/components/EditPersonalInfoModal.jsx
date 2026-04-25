import { useState, useEffect, useRef, useMemo } from "react";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiChevronDown,
  FiCamera,
  FiUser,
  FiEye,
  FiFile,
  FiAlertCircle,
  FiUpload,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "../DoctorStyle/Modal.module.css";
import axiosClient from "../../axiosClient";

const STORAGE_BASE = "http://localhost:8000/storage/";

/* ─────────────────────────────────────────────
   STATIC OPTIONS
───────────────────────────────────────────── */
const STATIC_SPECIALIZATIONS = [
  "Psychologist",
  "Psychiatrist",
  "Psychometrician",
];

const STATIC_SUB_SPECIALIZATIONS = [
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
];

const STATIC_BOARD_CERTS = [
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
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const isValidContact = (v) => /^09\d{9}$/.test(v);
const isNumericOnly = (v) => /^\d+$/.test(v);
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];
const isValidFile = (file) => file && ALLOWED_TYPES.includes(file.type);

const calculateAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

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
    boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
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
    boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
  },
  iconTheme: { primary: "#C62828", secondary: "#FDECEA" },
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

  const isPdf =
    typeof src === "string" &&
    (src.toLowerCase().endsWith(".pdf") ||
      src.startsWith("data:application/pdf"));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.88)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 50,
          background: "rgba(0,0,0,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            maxWidth: 300,
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
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            padding: 6,
            display: "flex",
            alignItems: "center",
          }}
        >
          <FiX size={17} />
        </button>
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: 50,
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          boxSizing: "border-box",
        }}
      >
        {isPdf ? (
          <iframe
            src={src}
            style={{
              width: "90vw",
              height: "80vh",
              border: "none",
              borderRadius: 8,
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
              borderRadius: 8,
              objectFit: "contain",
            }}
          />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 12,
          color: "rgba(255,255,255,0.3)",
          fontSize: 11,
          pointerEvents: "none",
        }}
      >
        Esc to close
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

  const src =
    objUrl ||
    (existingUrl
      ? existingUrl.startsWith("http")
        ? existingUrl
        : STORAGE_BASE + existingUrl
      : null);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "4px 0",
      }}
    >
      {/* Avatar */}
      <div
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 76,
          height: 76,
          borderRadius: "50%",
          border: hovered ? "2.5px solid #4d227c" : "2.5px solid #e2d5f5",
          overflow: "hidden",
          background: "#f8f4fd",
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "border 0.2s",
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

      {/* Info + actions */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#333",
            marginBottom: 3,
          }}
        >
          {src ? (file ? file.name : "Current photo") : "No photo uploaded"}
        </div>
        <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>
          JPG or PNG · Max 5 MB
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 7,
              border: "1.5px solid #e2d5f5",
              background: "#f8f4fd",
              color: "#4d227c",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ede5f7";
              e.currentTarget.style.borderColor = "#c4a8e8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f8f4fd";
              e.currentTarget.style.borderColor = "#e2d5f5";
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
                gap: 6,
                padding: "6px 14px",
                borderRadius: 7,
                border: "1.5px solid #e2d5f5",
                background: "none",
                color: "#888",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
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
   DropdownListInput — searchable, add-new, no duplicates
   (mirrors AccountSetupModal's DropdownListInput)
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

  const inputSt = {
    width: "100%",
    height: 40,
    padding: "0 36px 0 12px",
    border: "1.5px solid #e2d5f5",
    borderRadius: 8,
    fontSize: 13,
    color: "#333",
    outline: "none",
    boxSizing: "border-box",
    transition: "border .2s, box-shadow .2s",
    background: "#fff",
    fontFamily: "inherit",
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      {label && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#4d227c",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {label}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder={
              selected.length
                ? `${selected.length} selected — type to add more`
                : "Search or type to add…"
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
            style={inputSt}
          />
          <FiChevronDown
            size={14}
            style={{
              position: "absolute",
              right: 11,
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
            width: 40,
            height: 40,
            borderRadius: 8,
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
          <FiPlus size={16} />
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 50,
            background: "#fff",
            border: "1.5px solid #ede5f7",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(77,34,124,0.14)",
            zIndex: 2000,
            overflow: "hidden",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "5px 0",
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {showAdd && (
              <li
                onClick={handleAddNew}
                style={{
                  padding: "9px 14px",
                  cursor: "pointer",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
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
                        padding: "8px 14px",
                        cursor: "pointer",
                        fontSize: 13,
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
                      padding: "10px 14px",
                      fontSize: 13,
                      color: "#aaa",
                    }}
                  >
                    No results — type to add a new entry
                  </li>
                )}
          </ul>
        </div>
      )}

      {/* Pills */}
      {selected.length > 0 && (
        <div
          style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}
        >
          {selected.map((item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#4d227c",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 500,
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
   ServicesDropdown — fetches from API
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
    axiosClient
      .get("/services")
      .then(({ data: json }) => setApiOptions(json.data || []))
      .catch((e) => {
        setFetchError("Could not load services. Please refresh.");
        console.error(e);
      })
      .finally(() => setFetching(false));
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

  const handleSelect = (name) => {
    if (selected.includes(name)) onRemove(selected.indexOf(name));
    else onAdd(name);
    setSearch("");
    inputRef.current?.focus();
  };

  const inputSt = {
    width: "100%",
    height: 40,
    padding: "0 36px 0 12px",
    border: "1.5px solid #e2d5f5",
    borderRadius: 8,
    fontSize: 13,
    color: "#333",
    outline: "none",
    boxSizing: "border-box",
    transition: "border .2s, box-shadow .2s",
    background: "#fff",
    fontFamily: "inherit",
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
      {fetchError && (
        <div
          style={{
            fontSize: 12,
            color: "#e53e3e",
            background: "#fff0f0",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FiAlertCircle size={13} /> {fetchError}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder={
              fetching
                ? "Loading services…"
                : selected.length
                  ? `${selected.length} selected — "search to select"`
                  : "Select from available services..."
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
            style={{ ...inputSt, opacity: fetching ? 0.6 : 1 }}
          />
          {fetching ? (
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 13,
                height: 13,
                borderRadius: "50%",
                border: "2px solid #e2d5f5",
                borderTopColor: "#4d227c",
                animation: "spin .7s linear infinite",
                display: "inline-block",
              }}
            />
          ) : (
            <FiChevronDown
              size={14}
              style={{
                position: "absolute",
                right: 11,
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
            width: 40,
            height: 40,
            borderRadius: 8,
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
          <FiChevronDown size={16} />
        </button>
      </div>

      {open && !fetching && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 50,
            background: "#fff",
            border: "1.5px solid #ede5f7",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(77,34,124,0.14)",
            zIndex: 2000,
            overflow: "hidden",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "5px 0",
              maxHeight: 220,
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
                      padding: "10px 14px",
                      cursor: "pointer",
                      fontSize: 13,
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
                            fontSize: 11,
                            color: "#9e84c2",
                            marginTop: 1,
                          }}
                        >
                          {svc.description.length > 60
                            ? svc.description.slice(0, 60) + "…"
                            : svc.description}
                        </div>
                      )}
                    </div>
                    {isSel && (
                      <FiCheck
                        size={14}
                        style={{
                          color: "#4d227c",
                          flexShrink: 0,
                          marginLeft: 12,
                        }}
                      />
                    )}
                  </li>
                );
              })
            ) : (
              <li style={{ padding: "12px 14px", fontSize: 13, color: "#aaa" }}>
                {search
                  ? "No matching services found. Please choose from available list."
                  : "No services available."}
              </li>
            )}
          </ul>
        </div>
      )}

      {selected.length > 0 && (
        <div
          style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}
        >
          {selected.map((name, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#4d227c",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 500,
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
   DocThumb — single thumbnail for doc carousel
───────────────────────────────────────────── */
function DocThumb({ src, name, isNew, onView, onRemove }) {
  const [hovered, setHovered] = useState(false);
  const isPdf =
    (src instanceof File && src.type === "application/pdf") ||
    (typeof src === "string" &&
      (src.toLowerCase().endsWith(".pdf") ||
        src.startsWith("data:application/pdf")));

  const imgSrc = src instanceof File ? URL.createObjectURL(src) : src;

  return (
    <div
      style={{
        position: "relative",
        width: 72,
        height: 72,
        borderRadius: 10,
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
      {isPdf ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <FiFile size={22} color="#9c7dd4" />
          <span
            style={{
              fontSize: 9,
              color: "#888",
              padding: "0 4px",
              textAlign: "center",
            }}
          >
            PDF
          </span>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
      {isNew && (
        <span
          style={{
            position: "absolute",
            top: 3,
            left: 3,
            background: "#4d227c",
            color: "#fff",
            fontSize: 8,
            fontWeight: 700,
            padding: "1px 5px",
            borderRadius: 6,
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
          gap: 4,
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
                borderRadius: 5,
                width: 26,
                height: 26,
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
                borderRadius: 5,
                width: 26,
                height: 26,
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
   MultiDocInput — drag-drop upload zone + thumbnails
───────────────────────────────────────────── */
function MultiDocInput({
  label,
  newFiles,
  existingUrls = [],
  onFileAdd,
  onFileRemove,
  onExistingRemove,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const getSrc = (item) => {
    if (item instanceof File) return URL.createObjectURL(item);
    return item.startsWith("http") ? item : STORAGE_BASE + item;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "#4d227c";
  };
  const handleDragLeave = (e) => {
    e.currentTarget.style.borderColor = "#d4b8f0";
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = "#d4b8f0";
    Array.from(e.dataTransfer.files).forEach((f) => {
      if (!isValidFile(f)) {
        toast.error("Only JPG, PNG, PDF allowed.", toastError);
        return;
      }
      onFileAdd(f);
    });
  };

  return (
    <div className={styles["modal-section"]}>
      <h4>{label}</h4>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: "2px dashed #d4b8f0",
          borderRadius: 10,
          background: "#f8f4fd",
          padding: "14px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          transition: "border-color 0.15s",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgba(77,34,124,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FiUpload size={17} color="#4d227c" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#4d227c" }}>
            Click to upload or drag &amp; drop
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>
            JPG, PNG, PDF — multiple files allowed
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            Array.from(e.target.files).forEach((f) => {
              if (!isValidFile(f)) {
                toast.error("Only JPG, PNG, PDF allowed.", toastError);
                return;
              }
              onFileAdd(f);
            });
            e.target.value = "";
          }}
        />
      </div>

      {/* Thumbnails */}
      {(existingUrls.length > 0 || newFiles.length > 0) && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}
        >
          {existingUrls.map((url, i) => {
            const src = url.startsWith("http") ? url : STORAGE_BASE + url;
            return (
              <DocThumb
                key={`e${i}`}
                src={src}
                name={`File ${i + 1}`}
                isNew={false}
                onView={() => setPreview({ src, name: `File ${i + 1}` })}
                onRemove={() => onExistingRemove(i)}
              />
            );
          })}
          {newFiles.map((file, i) => (
            <DocThumb
              key={`n${i}`}
              src={file}
              name={file.name}
              isNew={true}
              onView={() =>
                setPreview({ src: URL.createObjectURL(file), name: file.name })
              }
              onRemove={() => onFileRemove(i)}
            />
          ))}
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

/* ═════════════════════════════════════════════
   MAIN MODAL
═════════════════════════════════════════════ */
function EditPersonalInfoModal({ show, onClose, doctorData, onSave }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    contactNumber: "",
    address: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    specialty: "",
    practicingSince: "",
    credentials: "",
    licenseNo: "",
    prcNumber: "",
  });

  const [subspecialty, setSubspecialty] = useState([]);
  const [services, setServices] = useState([]);
  const [certifications, setCertifications] = useState([]);

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [existingProfilePic, setExistingProfilePic] = useState(null);

  const [newBoardCertFiles, setNewBoardCertFiles] = useState([]);
  const [existingBoardCerts, setExistingBoardCerts] = useState([]);

  const [newIdPicFiles, setNewIdPicFiles] = useState([]);
  const [existingIdPics, setExistingIdPics] = useState([]);

  const [subSpecOptions, setSubSpecOptions] = useState([
    ...STATIC_SUB_SPECIALIZATIONS,
  ]);
  const [boardCertOpts, setBoardCertOpts] = useState([...STATIC_BOARD_CERTS]);
  const [saving, setSaving] = useState(false);

  const originalData = doctorData || {};

  useEffect(() => {
    if (!doctorData || !show) return;

    setFormData({
      firstName: doctorData.firstName || "",
      lastName: doctorData.lastName || "",
      middleInitial: doctorData.middleInitial || "",
      contactNumber: doctorData.contactNumber || "",
      address: doctorData.address || "",
      dateOfBirth: doctorData.dateOfBirth || "",
      age: doctorData.age || "",
      gender: doctorData.gender || "",
      specialty: doctorData.specialty || "",
      practicingSince: doctorData.practicingSince || "",
      credentials: doctorData.credentials || "",
      licenseNo: doctorData.licenseNo || "",
      prcNumber: doctorData.prcNumber || "",
    });

    setSubspecialty(doctorData.subspecialty || []);
    setServices(doctorData.services || []);
    setCertifications(doctorData.certifications || []);

    setExistingProfilePic(doctorData.profilePicture || null);
    setExistingBoardCerts(doctorData.certificateImages || []);
    setExistingIdPics(doctorData.idImages || []);

    setNewBoardCertFiles([]);
    setNewIdPicFiles([]);
    setProfilePicFile(null);

    // Merge doctor's custom items into option pools
    if (doctorData.subspecialty?.length) {
      setSubSpecOptions((prev) => {
        const merged = [...prev];
        doctorData.subspecialty.forEach((s) => {
          if (!merged.includes(s)) merged.push(s);
        });
        return merged;
      });
    }
    if (doctorData.certifications?.length) {
      setBoardCertOpts((prev) => {
        const merged = [...prev];
        doctorData.certifications.forEach((c) => {
          if (!merged.includes(c)) merged.push(c);
        });
        return merged;
      });
    }
  }, [doctorData, show]);

  if (!show) return null;

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleDOBChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: value,
      age: value ? calculateAge(value) : "",
    }));
  };
  const handleSave = async () => {
    if (saving) return; // prevent double click

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Session expired. Please login again.", toastError);
        return;
      }

      /* ───────── VALIDATIONS ───────── */
      if (
        formData.contactNumber &&
        formData.contactNumber !== originalData.contactNumber
      ) {
        if (!isValidContact(formData.contactNumber)) {
          toast.error(
            "Contact number must start with 09 and be 11 digits.",
            toastError,
          );
          return;
        }
      }

      if (formData.licenseNo && formData.licenseNo !== originalData.licenseNo) {
        if (!isNumericOnly(formData.licenseNo)) {
          toast.error("License Number must be numbers only.", toastError);
          return;
        }
      }
      if (formData.prcNumber && formData.prcNumber !== originalData.prcNumber) {
        if (!isNumericOnly(formData.prcNumber)) {
          toast.error("PRC Number must be numbers only.", toastError);
          return;
        }
      }
      /* ───────── HEADERS ───────── */
      const authHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      /* ───────── 1. UPDATE USER ───────── */
      const userRes = await fetch("http://localhost:8000/api/me", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleInitial: formData.middleInitial,
          contactNo: formData.contactNumber,
          address: formData.address,
          gender: formData.gender,
          dob: formData.dateOfBirth,
          age: formData.age,
          email: originalData.email,
        }),
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        throw new Error(userData.message || "User update failed");
      }

      /* ───────── 2. UPDATE DOCTOR ───────── */
      const doctorRes = await fetch(
        "http://localhost:8000/api/doctor/update-doctor",
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            professional_title: formData.credentials,
            license_number: formData.licenseNo,
            prc_number: formData.prcNumber,
            main_specialty: formData.specialty,
            practicing_since: formData.practicingSince,
            sub_specializations: subspecialty,
            services: services,
            board_cert_names: certifications,
          }),
        },
      );

      const doctorJson = await doctorRes.json();

      if (!doctorRes.ok) {
        throw new Error(doctorJson.message || "Doctor update failed");
      }

      /* ───────── 3. PROFILE PICTURE ───────── */
      if (profilePicFile) {
        const fd = new FormData();
        fd.append("profilePicture", profilePicFile);

        const res = await fetch(
          "http://localhost:8000/api/doctor/profile-picture",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            body: fd,
          },
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Upload failed");

        setExistingProfilePic(data.data.profilePicture);
      }

      /* ───────── 4. DOCUMENTS ───────── */
      if (newBoardCertFiles.length || newIdPicFiles.length) {
        const fd = new FormData();

        newBoardCertFiles.forEach((f) => fd.append("board_cert_images[]", f));

        newIdPicFiles.forEach((f) => fd.append("id_pictures[]", f));

        const res = await fetch(
          "http://localhost:8000/api/doctor/upload-documents",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: fd,
          },
        );

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          console.error("Upload error response:", data);
          throw new Error(
            data?.message || data?.error || "Document upload failed",
          );
        }

        console.log("Upload success:", data);
      }

      /* ───────── SUCCESS ───────── */
      toast.success("Profile updated successfully!", toastSuccess);

      onSave?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong.", toastError);
    } finally {
      setSaving(false); // always stop loading
    }
  };

  /* ── CSS keyframes for spinner ── */
  const spinKeyframes = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;

  return (
    <>
      <style>{spinKeyframes}</style>

      <div className={styles["profile-modal-overlay"]} onClick={onClose}>
        <div
          className={styles["profile-modal-lg"]}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className={styles["modal-header"]}>
            <h2>Edit Personal Information</h2>
            <button className={styles["close-btn"]} onClick={onClose}>
              <FiX />
            </button>
          </div>

          {/* BODY */}
          <div className={styles["modal-body"]}>
            {/* ── PROFILE PICTURE ── */}
            <div className={styles["modal-section"]}>
              <h4>Profile Picture</h4>
              <ProfilePictureInput
                file={profilePicFile}
                existingUrl={existingProfilePic}
                onChange={setProfilePicFile}
              />
            </div>

            {/* ── PERSONAL INFORMATION ── */}
            <div className={styles["modal-section"]}>
              <h4>Personal Information</h4>

              <div className={styles["grid-3"]}>
                {[
                  ["First Name", "firstName"],
                  ["Last Name", "lastName"],
                  ["Middle Initial", "middleInitial"],
                ].map(([label, key]) => (
                  <div key={key} className={styles["input-group"]}>
                    <p className={styles["modal-label"]}>{label}</p>
                    <input
                      className={styles["modal-input"]}
                      value={formData[key]}
                      maxLength={key === "middleInitial" ? 3 : undefined}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className={styles["grid-2"]}>
                <div className={styles["input-group"]}>
                  <p className={styles["modal-label"]}>Credentials</p>
                  <input
                    className={styles["modal-input"]}
                    value={formData.credentials}
                    onChange={(e) =>
                      handleChange("credentials", e.target.value)
                    }
                  />
                </div>
                <div className={styles["input-group"]}>
                  <p className={styles["modal-label"]}>PRC License</p>
                  <input
                    className={styles["modal-input"]}
                    value={formData.licenseNo}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || /^\d+$/.test(v))
                        handleChange("licenseNo", v);
                    }}
                  />
                </div>
                <div className={styles["input-group"]}>
                  <p className={styles["modal-label"]}>PRC Number</p>
                  <input
                    className={styles["modal-input"]}
                    value={formData.prcNumber}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || isNumericOnly(v))
                        handleChange("prcNumber", v);
                    }}
                  />
                </div>
              </div>

              <div className={styles["grid-2"]}>
                <div className={styles["input-group"]}>
                  <p className={styles["modal-label"]}>Specialty</p>
                  <select
                    className={styles["modal-input"]}
                    value={formData.specialty}
                    onChange={(e) => handleChange("specialty", e.target.value)}
                  >
                    <option value="">Select Specialty</option>
                    {STATIC_SPECIALIZATIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles["input-group"]}>
                  <p className={styles["modal-label"]}>Practicing Since</p>
                  <input
                    type="number"
                    className={styles["modal-input"]}
                    value={formData.practicingSince}
                    min={1950}
                    max={new Date().getFullYear()}
                    onChange={(e) =>
                      handleChange("practicingSince", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className={styles["grid-4"]}>
                <div className={styles["input-group"]}>
                  <p className={styles["modal-label"]}>Contact Number</p>
                  <input
                    className={styles["modal-input"]}
                    value={formData.contactNumber}
                    maxLength={11}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      if (v.length <= 11) handleChange("contactNumber", v);
                    }}
                  />
                </div>
                <div className={styles["input-group"]}>
                  <p className={styles["modal-label"]}>Age</p>
                  <input
                    className={styles["modal-input"]}
                    value={formData.age}
                    readOnly
                    style={{ background: "#f8f4fd", color: "#999" }}
                  />
                </div>
                <div className={styles["input-group"]}>
                  <p className={styles["modal-label"]}>Gender</p>
                  <select
                    className={styles["modal-input"]}
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className={styles["input-group"]}>
                  <p className={styles["modal-label"]}>Date of Birth</p>
                  <input
                    type="date"
                    className={styles["modal-input"]}
                    value={formData.dateOfBirth}
                    onChange={handleDOBChange}
                  />
                </div>
              </div>

              <div className={styles["grid-1"]}>
                <div className={styles["input-group"]}>
                  <p className={styles["modal-label"]}>Address</p>
                  <input
                    className={styles["modal-input"]}
                    placeholder="Street, Barangay, City, Province"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ── SUB-SPECIALIZATIONS ── */}
            <div className={styles["modal-section"]}>
              <h4>Sub-Specializations</h4>
              <DropdownListInput
                options={subSpecOptions}
                selected={subspecialty}
                onAdd={(item) => {
                  setSubspecialty((prev) =>
                    prev.includes(item) ? prev : [...prev, item],
                  );
                  setSubSpecOptions((prev) =>
                    prev.includes(item) ? prev : [...prev, item],
                  );
                }}
                onRemove={(i) =>
                  setSubspecialty((prev) => prev.filter((_, idx) => idx !== i))
                }
              />
            </div>

            {/* ── SERVICES ── */}
            <div className={styles["modal-section"]}>
              <h4>Services Offered</h4>
              <ServicesDropdown
                selected={services}
                onAdd={(item) =>
                  setServices((prev) =>
                    prev.includes(item) ? prev : [...prev, item],
                  )
                }
                onRemove={(i) =>
                  setServices((prev) => prev.filter((_, idx) => idx !== i))
                }
              />
            </div>

            {/* ── BOARD CERTIFICATIONS (names) ── */}
            <div className={styles["modal-section"]}>
              <h4>Board Certifications</h4>
              <DropdownListInput
                options={boardCertOpts}
                selected={certifications}
                onAdd={(item) => {
                  setCertifications((prev) =>
                    prev.includes(item) ? prev : [...prev, item],
                  );
                  setBoardCertOpts((prev) =>
                    prev.includes(item) ? prev : [...prev, item],
                  );
                }}
                onRemove={(i) =>
                  setCertifications((prev) =>
                    prev.filter((_, idx) => idx !== i),
                  )
                }
              />
            </div>

            {/* ── BOARD CERTIFICATION DOCUMENTS ── */}
            <MultiDocInput
              label="Board Certification Documents"
              newFiles={newBoardCertFiles}
              existingUrls={existingBoardCerts}
              onFileAdd={(f) => setNewBoardCertFiles((prev) => [...prev, f])}
              onFileRemove={(i) =>
                setNewBoardCertFiles((prev) =>
                  prev.filter((_, idx) => idx !== i),
                )
              }
              onExistingRemove={(i) =>
                setExistingBoardCerts((prev) =>
                  prev.filter((_, idx) => idx !== i),
                )
              }
            />

            {/* ── ID PICTURES ── */}
            <MultiDocInput
              label="ID / Government Identification"
              newFiles={newIdPicFiles}
              existingUrls={existingIdPics}
              onFileAdd={(f) => setNewIdPicFiles((prev) => [...prev, f])}
              onFileRemove={(i) =>
                setNewIdPicFiles((prev) => prev.filter((_, idx) => idx !== i))
              }
              onExistingRemove={(i) =>
                setExistingIdPics((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
          </div>

          {/* FOOTER */}
          <div className={styles["modal-footer"]}>
            <button
              className={styles["btn-completed"]}
              onClick={handleSave}
              disabled={saving}
              style={{
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditPersonalInfoModal;

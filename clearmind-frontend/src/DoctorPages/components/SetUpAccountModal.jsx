import { useState, useRef, useEffect } from "react";
import { FiX, FiPlus, FiChevronDown } from "react-icons/fi";

// ─── Default saved options per field ───────────────────────────────────────
const DEFAULT_OPTIONS = {
  specialization: [
    "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
    "General Surgery", "Geriatrics", "Hematology", "Infectious Disease",
    "Internal Medicine", "Nephrology", "Neurology", "Obstetrics & Gynecology",
    "Oncology", "Ophthalmology", "Orthopedics", "Otolaryngology (ENT)",
    "Pediatrics", "Psychiatry", "Pulmonology", "Radiology",
    "Rheumatology", "Urology",
  ],
  subSpecialization: [
    "Interventional Cardiology", "Pediatric Cardiology", "Cosmetic Dermatology",
    "Pediatric Dermatology", "Bariatric Surgery", "Colorectal Surgery",
    "Pediatric Gastroenterology", "Neuro-oncology", "Pediatric Neurology",
    "Maternal-Fetal Medicine", "Gynecologic Oncology", "Pediatric Oncology",
    "Retinal Surgery", "Glaucoma", "Sports Medicine Orthopedics",
    "Spine Surgery", "Child & Adolescent Psychiatry", "Geriatric Psychiatry",
    "Pediatric Pulmonology", "Critical Care Medicine",
  ],
  boardCertificate: [
    "American Board of Internal Medicine (ABIM)",
    "American Board of Surgery (ABS)",
    "American Board of Pediatrics (ABP)",
    "American Board of Psychiatry and Neurology (ABPN)",
    "American Board of Radiology (ABR)",
    "American Board of Obstetrics and Gynecology (ABOG)",
    "American Board of Orthopedic Surgery (ABOS)",
    "American Board of Dermatology (ABD)",
    "American Board of Emergency Medicine (ABEM)",
    "American Board of Family Medicine (ABFM)",
    "American Board of Anesthesiology (ABA)",
    "American Board of Ophthalmology (ABO)",
    "American Board of Urology (ABU)",
    "Royal College of Physicians (RCP)",
    "Royal College of Surgeons (RCS)",
  ],
  myServices: [
    "General Consultation", "Telemedicine / Online Consultation",
    "Physical Examination", "Diagnostic Testing", "Lab Test Interpretation",
    "Prescription & Medication Management", "Chronic Disease Management",
    "Post-operative Care", "Preventive Health Screening",
    "Vaccination / Immunization", "Mental Health Counseling",
    "Nutrition & Lifestyle Counseling", "Pediatric Wellness Checkup",
    "Geriatric Assessment", "Wound Care & Dressing",
    "Minor Surgical Procedures", "Second Opinion",
    "Health Certification / Medical Clearance",
  ],
};

// ─── DropdownListInput ──────────────────────────────────────────────────────
const DropdownListInput = ({ label, fieldKey, selected, onAdd, onRemove }) => {
  const [options, setOptions] = useState(DEFAULT_OPTIONS[fieldKey] || []);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const trimmed = search.trim();
  // Show all options filtered by search (including already-selected, shown with checkmark)
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );
  const exactMatch = options.some((o) => o.toLowerCase() === trimmed.toLowerCase());
  const showAddPrompt = trimmed.length > 0 && !exactMatch;

  const handleSelect = (item) => {
    if (selected.includes(item)) {
      onRemove(selected.indexOf(item));
    } else {
      onAdd(item);
    }
    setSearch("");
    inputRef.current?.focus();
  };

  const handleAddNew = () => {
    if (!trimmed) return;
    const newItem = trimmed;
    if (!options.includes(newItem)) setOptions((prev) => [...prev, newItem]);
    if (!selected.includes(newItem)) onAdd(newItem);
    setSearch("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const unselected = filtered.filter((o) => !selected.includes(o));
      if (unselected.length === 1) {
        handleSelect(unselected[0]);
      } else if (showAddPrompt) {
        handleAddNew();
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  return (
    <div className="col-12" ref={dropdownRef} style={{ position: "relative" }}>
      <div className="d-flex gap-2 align-items-center">
        <div className="position-relative flex-grow-1">
          <input
            ref={inputRef}
            type="text"
            placeholder={selected.length ? `${selected.length} selected — type to add more` : `${label}`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className="form-control"
            style={{ borderRadius: "12px", height: "40px", paddingRight: "36px" }}
          />
          <FiChevronDown
            size={16}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%) rotate(0deg)",
              transition: "transform 0.2s",
              color: "#4D227C",
              pointerEvents: "none",
            }}
          />
        </div>
        <button
          type="button"
          className="btn text-white flex-shrink-0 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "#4D227C", width: "40px", height: "40px", borderRadius: "12px" }}
          onClick={() => { setOpen((v) => !v); inputRef.current?.focus(); }}
        >
          <FiPlus size={18} />
        </button>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: "50px",
            background: "#fff",
            border: "1.5px solid #e0d6f0",
            borderRadius: "14px",
            boxShadow: "0 8px 24px rgba(77,34,124,0.13)",
            zIndex: 2000,
            overflow: "hidden",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: "6px 0", maxHeight: "200px", overflowY: "auto" }}>
            {/* "Add new" prompt at the top when typed text isn't in list */}
            {showAddPrompt && (
              <li
                onClick={handleAddNew}
                style={{
                  padding: "9px 16px",
                  cursor: "pointer",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#f7f2ff",
                  borderBottom: "1px solid #ede6f8",
                  color: "#4D227C",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#ede6f8")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f7f2ff")}
              >
                <FiPlus size={14} />
                Add <strong style={{ marginLeft: 2 }}>"{trimmed}"</strong>
              </li>
            )}

            {filtered.length > 0 ? (
              filtered.map((item) => {
                const isSelected = selected.includes(item);
                return (
                  <li
                    key={item}
                    onClick={() => handleSelect(item)}
                    style={{
                      padding: "8px 16px",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isSelected ? "#f0eaff" : "transparent",
                      transition: "background 0.12s",
                      color: "#212529",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = isSelected ? "#e8e0fa" : "#f3eeff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isSelected ? "#f0eaff" : "transparent")}
                  >
                    <span>{item}</span>
                  </li>
                );
              })
            ) : !showAddPrompt ? (
              <li style={{ padding: "10px 16px", fontSize: "0.85rem", color: "#999" }}>
                No results — type to add a new entry
              </li>
            ) : null}
          </ul>
        </div>
      )}

      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="mt-2 d-flex flex-wrap gap-2">
          {selected.map((item, i) => (
            <span
              key={i}
              className="badge d-inline-flex align-items-center gap-2"
              style={{ backgroundColor: "#4D227C", padding: "6px 12px", fontSize: "0.88rem", fontWeight: "400", borderRadius: "20px" }}
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(i)}
                style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "0", lineHeight: "1", display: "flex", alignItems: "center" }}
                aria-label="Remove"
              >
                <FiX size={13} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── FileInput ──────────────────────────────────────────────────────────────
const FileInput = ({ label, file, onFileChange }) => {
  const inputId = label.replace(/\s+/g, "") + "Input";
  return (
    <div className="col-12">
      <div className="position-relative">
        <input
          type="text"
          placeholder={`Upload ${label}`}
          readOnly
          value={file ? file.name : ""}
          className="form-control"
          style={{ borderRadius: "12px", paddingRight: "90px", height: "40px" }}
        />
        <input
          type="file"
          accept="image/*"
          id={inputId}
          className="d-none"
          onChange={(e) => onFileChange(e.target.files[0])}
        />
        <button
          type="button"
          className="btn position-absolute"
          style={{
            backgroundColor: "#C4B5D6",
            top: "0",
            right: "0",
            height: "40px",
            borderRadius: "0 12px 12px 0",
            border: "none",
            padding: "0 15px",
          }}
          onClick={() => document.getElementById(inputId).click()}
        >
          Browse
        </button>
      </div>
    </div>
  );
};

// ─── MultiFileInput ─────────────────────────────────────────────────────────
const MultiFileInput = ({ label, files, fieldKey, onFileAdd, onFileRemove }) => {
  const inputId = fieldKey + "MultiInput";
  return (
    <div className="col-12">
      <div className="d-flex gap-2 align-items-center">
        <div className="position-relative flex-grow-1">
          <input
            type="text"
            placeholder={`Upload ${label}`}
            readOnly
            value={files.length > 0 ? `${files.length} file(s) selected` : ""}
            className="form-control"
            style={{ borderRadius: "12px", paddingRight: "90px", height: "40px", cursor: "default" }}
          />
          <input
            type="file"
            accept="image/*"
            id={inputId}
            className="d-none"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) { onFileAdd(file); e.target.value = ""; }
            }}
          />
          <button
            type="button"
            className="btn position-absolute"
            style={{
              backgroundColor: "#C4B5D6",
              top: "0", right: "0",
              height: "40px",
              borderRadius: "0 12px 12px 0",
              border: "none",
              padding: "0 15px",
            }}
            onClick={() => document.getElementById(inputId).click()}
          >
            Browse
          </button>
        </div>
        <button
          type="button"
          className="btn text-white flex-shrink-0 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "#4D227C", width: "40px", height: "40px", borderRadius: "12px" }}
          onClick={() => document.getElementById(inputId).click()}
        >
          <FiPlus size={18} />
        </button>
      </div>
      {files.length > 0 && (
        <div className="mt-2 d-flex flex-wrap gap-2">
          {files.map((file, i) => (
            <span key={i} className="badge d-inline-flex align-items-center gap-2"
              style={{ backgroundColor: "#4D227C", padding: "6px 12px", fontSize: "0.85rem", fontWeight: "400", maxWidth: "220px" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }} title={file.name}>
                {file.name}
              </span>
              <button type="button" onClick={() => onFileRemove(i)}
                style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "0", lineHeight: "1", display: "flex", alignItems: "center" }}
                aria-label="Remove">
                <FiX size={14} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── AccountSetupModal ──────────────────────────────────────────────────────
function AccountSetupModal({ showModal, onClose }) {
  const [formData, setFormData] = useState({
    profilePicture: null,
    description: "",
    professionalTitle: "",
    yearsOfExperience: "",
    practicingSince: "",
    mainSpecialty: "",
    licenseNumber: "",
    certificateImages: [],
    idPictures: [],
  });

  const [specializationList, setSpecializationList] = useState([]);
  const [subSpecializationList, setSubSpecializationList] = useState([]);
  const [boardCertificateList, setBoardCertificateList] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  const handleInputChange = (field, value) =>
    setFormData({ ...formData, [field]: value });

  const handleFileChange = (field, file) =>
    setFormData({ ...formData, [field]: file });

  const handleMultiFileAdd = (field, file) => {
    if (file) setFormData({ ...formData, [field]: [...formData[field], file] });
  };

  const handleMultiFileRemove = (field, index) =>
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });

  const handleUpload = () => {
    console.log("Form Data:", {
      ...formData,
      specializationList,
      subSpecializationList,
      boardCertificateList,
      servicesList,
    });
    onClose();
  };

  if (!showModal) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-2"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div
        className="bg-white d-flex flex-column"
        style={{
          width: "95%",
          maxWidth: "800px",
          height: "90vh",
          maxHeight: "900px",
          borderRadius: "24px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div className="position-relative px-4 py-3 border-bottom flex-shrink-0"
          style={{ borderTopLeftRadius: "24px", borderTopRightRadius: "24px", backgroundColor: "#fff" }}>
          <h3 className="m-0 fw-bold text-center" style={{ color: "#4D227C" }}>Account Setup</h3>
          <button type="button" className="btn btn-link text-secondary p-1 position-absolute"
            style={{ top: "12px", right: "12px", fontSize: "24px" }} onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex-grow-1" style={{ overflowY: "auto" }}>
          <div className="row g-3">
            <FileInput label="Profile Picture" file={formData.profilePicture}
              onFileChange={(file) => handleFileChange("profilePicture", file)} />

            <div className="col-12">
              <textarea placeholder="Description" value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", minHeight: "60px", resize: "none" }} />
            </div>

            <div className="col-12">
              <input type="text" placeholder="Professional Title *" value={formData.professionalTitle}
                onChange={(e) => handleInputChange("professionalTitle", e.target.value)}
                className="form-control" style={{ borderRadius: "12px", height: "40px" }} />
            </div>

            <div className="col-12 col-sm-6">
              <input type="number" placeholder="Years of Experience *" value={formData.yearsOfExperience}
                onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                className="form-control" style={{ borderRadius: "12px", height: "40px" }} min="0" max="70" />
            </div>
            <div className="col-12 col-sm-6">
              <input type="text" placeholder="License Number *" value={formData.licenseNumber}
                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                className="form-control" style={{ borderRadius: "12px", height: "40px" }} />
            </div>

            <div className="col-12 col-sm-6">
              <input type="number" placeholder="Practicing Since (Year)" value={formData.practicingSince}
                onChange={(e) => handleInputChange("practicingSince", e.target.value)}
                className="form-control" style={{ borderRadius: "12px", height: "40px" }}
                min="1900" max={new Date().getFullYear()} />
            </div>
            <div className="col-12 col-sm-6">
              <input type="text" placeholder="Main Specialty" value={formData.mainSpecialty}
                onChange={(e) => handleInputChange("mainSpecialty", e.target.value)}
                className="form-control" style={{ borderRadius: "12px", height: "40px" }} />
            </div>

            {/* ── Dropdown list fields ── */}
            <DropdownListInput
              label="Specialization *"
              fieldKey="specialization"
              selected={specializationList}
              onAdd={(item) => {
                if (!specializationList.includes(item))
                  setSpecializationList((p) => [...p, item]);
              }}
              onRemove={(i) => setSpecializationList((p) => p.filter((_, idx) => idx !== i))}
            />

            <DropdownListInput
              label="Sub-specialization"
              fieldKey="subSpecialization"
              selected={subSpecializationList}
              onAdd={(item) => {
                if (!subSpecializationList.includes(item))
                  setSubSpecializationList((p) => [...p, item]);
              }}
              onRemove={(i) => setSubSpecializationList((p) => p.filter((_, idx) => idx !== i))}
            />

            <DropdownListInput
              label="Board Certificate"
              fieldKey="boardCertificate"
              selected={boardCertificateList}
              onAdd={(item) => {
                if (!boardCertificateList.includes(item))
                  setBoardCertificateList((p) => [...p, item]);
              }}
              onRemove={(i) => setBoardCertificateList((p) => p.filter((_, idx) => idx !== i))}
            />

            <DropdownListInput
              label="My Services"
              fieldKey="myServices"
              selected={servicesList}
              onAdd={(item) => {
                if (!servicesList.includes(item))
                  setServicesList((p) => [...p, item]);
              }}
              onRemove={(i) => setServicesList((p) => p.filter((_, idx) => idx !== i))}
            />

            <MultiFileInput label="Certificate Image" files={formData.certificateImages} fieldKey="certImg"
              onFileAdd={(file) => handleMultiFileAdd("certificateImages", file)}
              onFileRemove={(i) => handleMultiFileRemove("certificateImages", i)} />

            <MultiFileInput label="Upload ID Card Picture" files={formData.idPictures} fieldKey="idPic"
              onFileAdd={(file) => handleMultiFileAdd("idPictures", file)}
              onFileRemove={(i) => handleMultiFileRemove("idPictures", i)} />
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-center px-4 py-3 border-top flex-shrink-0 position-relative">
          <button type="button" className="btn text-white fw-semibold px-4 py-2"
            style={{ backgroundColor: "#4D227C", borderRadius: "12px" }} onClick={handleUpload}>
            Upload
          </button>
          <button type="button" className="btn btn-link text-decoration-none position-absolute"
            style={{ right: "20px", color: "#4D227C" }} onClick={onClose}>
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountSetupModal;
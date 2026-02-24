import { useState, useEffect } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

// ── Helper: read user safely ────────────────────────────────────────
const getUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const safeParse = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
};

function SetUpAccountModal({ showModal, onClose }) {
  // ── Pre-fill from localStorage ───────────────────────────────────
  const buildInitialForm = () => {
    const u = getUser();
    return {
      profilePicture:    null,
      description:       u?.description       || "",
      professionalTitle: u?.professionalTitle  || u?.credentials || "",
      yearsOfExperience: u?.yearsOfExperience  || "",
      licenseNumber:     u?.prcNumber          || "",
      specialization:    "",   // text input buffer
      subSpecialization: "",
      boardCertificate:  "",
      myServices:        "",
      certificateImage:  null,
    };
  };

  const buildInitialLists = () => {
    const u = getUser();
    return {
      specializationList:    safeParse(u?.specializations)    || (u?.specialty ? [u.specialty] : []),
      subSpecializationList: safeParse(u?.subSpecializations) || [],
      boardCertificateList:  safeParse(u?.boardCertificates)  || [],
      servicesList:          safeParse(u?.services)           || [],
    };
  };

  const [formData, setFormData] = useState(buildInitialForm);
  const [lists,    setLists]    = useState(buildInitialLists);
  const [loading,  setLoading]  = useState(false);

  // Re-sync when modal opens
  useEffect(() => {
    if (showModal) {
      setFormData(buildInitialForm());
      setLists(buildInitialLists());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (field, file) =>
    setFormData((prev) => ({ ...prev, [field]: file }));

  // Explicit map — avoids "myServices" → "myServicesList" (wrong key) crash
  const FIELD_TO_LIST_KEY = {
    specialization:    "specializationList",
    subSpecialization: "subSpecializationList",
    boardCertificate:  "boardCertificateList",
    myServices:        "servicesList",
  };

  const addToList = (field) => {
    const val    = formData[field]?.trim();
    const listKey = FIELD_TO_LIST_KEY[field];
    if (!val || !listKey) return;
    setLists((prev) => ({ ...prev, [listKey]: [...prev[listKey], val] }));
    setFormData((prev) => ({ ...prev, [field]: "" }));
  };

  const removeFromList = (listKey, index) => {
    setLists((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!formData.professionalTitle.trim()) {
      toast.error("Professional Title is required.");
      return;
    }
    if (!formData.licenseNumber.trim()) {
      toast.error("License Number is required.");
      return;
    }
    if (lists.specializationList.length === 0) {
      toast.error("Please add at least one Specialization.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();

      if (formData.profilePicture)   payload.append("profile_picture",   formData.profilePicture);
      if (formData.certificateImage) payload.append("certificate_image",  formData.certificateImage);

      payload.append("description",         formData.description);
      payload.append("professional_title",  formData.professionalTitle);
      payload.append("years_of_experience", formData.yearsOfExperience);
      payload.append("license_number",      formData.licenseNumber);
      payload.append("specializations",     JSON.stringify(lists.specializationList));
      payload.append("sub_specializations", JSON.stringify(lists.subSpecializationList));
      payload.append("board_certificates",  JSON.stringify(lists.boardCertificateList));
      payload.append("services",            JSON.stringify(lists.servicesList));

      const res = await axiosClient.post("/doctor/setup", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ── Sync back to localStorage so sidebar + profile update instantly ──
      const u       = getUser();
      const updated = {
        ...u,
        description:        formData.description,
        professionalTitle:  formData.professionalTitle,
        credentials:        formData.professionalTitle,
        yearsOfExperience:  formData.yearsOfExperience,
        prcNumber:          formData.licenseNumber,
        specialty:          lists.specializationList[0] || u?.specialty || "",
        specializations:    JSON.stringify(lists.specializationList),
        subSpecializations: JSON.stringify(lists.subSpecializationList),
        boardCertificates:  JSON.stringify(lists.boardCertificateList),
        services:           JSON.stringify(lists.servicesList),
        // Merge any server response fields if available
        ...(res?.data?.user || {}),
      };
      localStorage.setItem("user", JSON.stringify(updated));

      // Save profile picture preview if a file was chosen
      if (formData.profilePicture) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          localStorage.setItem("profile_image", ev.target.result);
          window.dispatchEvent(new Event("profileUpdated"));
        };
        reader.readAsDataURL(formData.profilePicture);
      } else {
        // Dispatch even without image change so sidebar refreshes text
        window.dispatchEvent(new Event("profileUpdated"));
      }

      toast.success("Profile setup complete!", {
        duration: 2000,
        style: {
          background:   "#E2F7E3",
          border:       "1px solid #91C793",
          color:        "#2E7D32",
          fontWeight:   600,
          borderRadius: "10px",
        },
      });

      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  const { specializationList, subSpecializationList, boardCertificateList, servicesList } = lists;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-2"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div
        className="bg-white d-flex flex-column"
        style={{
          width:       "95%",
          maxWidth:    "800px",
          height:      "90vh",
          maxHeight:   "900px",
          borderRadius:"24px",
          boxShadow:   "0 8px 30px rgba(0,0,0,0.2)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="position-relative px-4 py-3 border-bottom flex-shrink-0"
          style={{ borderTopLeftRadius: "24px", borderTopRightRadius: "24px", backgroundColor: "#fff" }}
        >
          <h3 className="m-0 fw-bold text-center" style={{ color: "#4D227C" }}>
            Account Setup
          </h3>
          <button
            type="button"
            className="btn btn-link text-secondary p-1 position-absolute"
            style={{ top: "12px", right: "12px", fontSize: "24px" }}
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-4 py-3 flex-grow-1" style={{ overflowY: "auto" }}>
          <div className="row g-3">

            {/* Profile Picture */}
            <FileInput
              label="Profile Picture"
              file={formData.profilePicture}
              onFileChange={(file) => handleFileChange("profilePicture", file)}
            />

            {/* Description */}
            <div className="col-12">
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", minHeight: "60px", resize: "none" }}
              />
            </div>

            {/* Professional Title */}
            <div className="col-12">
              <input
                type="text"
                placeholder="Professional Title *"
                value={formData.professionalTitle}
                onChange={(e) => handleInputChange("professionalTitle", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
              />
            </div>

            {/* Years of Experience + License Number */}
            <div className="col-12 col-sm-6">
              <input
                type="number"
                placeholder="Years of Experience"
                value={formData.yearsOfExperience}
                onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
                min="0"
                max="70"
              />
            </div>
            <div className="col-12 col-sm-6">
              <input
                type="text"
                placeholder="License Number *"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
              />
            </div>

            {/* Specialization */}
            <ListInput
              label="Specialization *"
              value={formData.specialization}
              onChange={(val) => handleInputChange("specialization", val)}
              list={specializationList}
              add={() => addToList("specialization")}
              remove={(i) => removeFromList("specializationList", i)}
            />

            {/* Sub-specialization */}
            <ListInput
              label="Sub-specialization"
              value={formData.subSpecialization}
              onChange={(val) => handleInputChange("subSpecialization", val)}
              list={subSpecializationList}
              add={() => addToList("subSpecialization")}
              remove={(i) => removeFromList("subSpecializationList", i)}
            />

            {/* Board Certificate */}
            <ListInput
              label="Board Certificate"
              value={formData.boardCertificate}
              onChange={(val) => handleInputChange("boardCertificate", val)}
              list={boardCertificateList}
              add={() => addToList("boardCertificate")}
              remove={(i) => removeFromList("boardCertificateList", i)}
            />

            {/* My Services */}
            <ListInput
              label="My Services"
              value={formData.myServices}
              onChange={(val) => handleInputChange("myServices", val)}
              list={servicesList}
              add={() => addToList("myServices")}
              remove={(i) => removeFromList("servicesList", i)}
            />

            {/* Certificate Image */}
            <FileInput
              label="Certificate Image"
              file={formData.certificateImage}
              onFileChange={(file) => handleFileChange("certificateImage", file)}
            />

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="d-flex align-items-center justify-content-center px-4 py-3 border-top flex-shrink-0 position-relative">
          <button
            type="button"
            className="btn text-white fw-semibold px-4 py-2"
            style={{ backgroundColor: "#4D227C", borderRadius: "12px", minWidth: "120px" }}
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="btn btn-link text-decoration-none position-absolute"
            style={{ right: "20px", color: "#4D227C" }}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default SetUpAccountModal;

// ── Helper Components ──────────────────────────────────────────────

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
            top: "0", right: "0",
            height:       "40px",
            borderRadius: "0 12px 12px 0",
            border:       "none",
            padding:      "0 15px",
          }}
          onClick={() => document.getElementById(inputId).click()}
        >
          Browse
        </button>
      </div>
    </div>
  );
};

const ListInput = ({ label, value, onChange, list, add, remove }) => (
  <div className="col-12">
    <div className="d-flex gap-2">
      <input
        type="text"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        className="form-control"
        style={{ borderRadius: "12px", height: "40px" }}
      />
      <button
        type="button"
        className="btn text-white flex-shrink-0 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#4D227C", width: "40px", height: "40px", borderRadius: "12px" }}
        onClick={add}
      >
        <FiPlus size={18} />
      </button>
    </div>
    {list.length > 0 && (
      <div className="mt-2 d-flex flex-wrap gap-2">
        {list.map((item, i) => (
          <span
            key={i}
            className="badge d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: "#4D227C", padding: "6px 12px", fontSize: "0.9rem", fontWeight: "400" }}
          >
            {item}
            <button
              type="button"
              onClick={() => remove(i)}
              style={{
                background:  "none",
                border:      "none",
                color:       "white",
                cursor:      "pointer",
                display:     "flex",
                alignItems:  "center",
                justifyContent: "center",
                padding:     "0",
                lineHeight:  "1",
              }}
              aria-label="Remove"
            >
              <FiX size={16} strokeWidth={2} />
            </button>
          </span>
        ))}
      </div>
    )}
  </div>
);
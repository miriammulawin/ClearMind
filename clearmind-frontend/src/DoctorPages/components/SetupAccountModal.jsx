import { useState, useEffect, useRef } from "react";
import { FiX, FiPlus, FiChevronDown } from "react-icons/fi";
import axiosClient from "../../axiosClient";
import toast from "react-hot-toast";

const resolveImageUrl = (raw) => {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const clean = raw.replace(/^\/+/, "");
  if (clean.startsWith("storage/")) return `http://127.0.0.1:8000/${clean}`;
  return `http://127.0.0.1:8000/storage/${clean}`;
};

function SetUpAccountModal({ showModal, onClose }) {
  const [formData, setFormData] = useState({
    profilePicture:    null,
    description:       "",
    professionalTitle: "",
    yearsOfExperience: "",
    practicingSince:   "",
    mainSpecialty:     "",
    prcNumber:         "",
    licenseNumber:     "",
    specialization:    "",
    subSpecialization: "",
    boardCertificate:  "",
    myServices:        "",
    certificateImages: [],
    idPictures:        [],
  });

  const [lists, setLists] = useState({
    mainSpecialtyList:     [],
    specializationList:    [],
    subSpecializationList: [],
    boardCertificateList:  [],
    servicesList:          [],
  });

  const [options, setOptions] = useState({
    specializations:    [],
    subSpecializations: [],
    boardCertificates:  [],
    services:           [],
  });

  const [loading, setLoading] = useState(false);

  // ── Fetch lookup tables once on mount ───────────────────────────
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axiosClient.get("/lookup");
        setOptions({
          specializations:    res.data.specializations    || [],
          subSpecializations: res.data.sub_specializations || [],
          boardCertificates:  res.data.board_certificates  || [],
          services:           res.data.services            || [],
        });
      } catch (err) {
        console.error("[SetUpModal] Failed to load lookup options:", err);
      }
    };
    fetchOptions();
  }, []);

  // ── Fetch existing profile when modal opens ──────────────────────
  useEffect(() => {
    if (!showModal) return;

    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get("/profile");
        const user        = res.data.user    || {};
        const profileData = res.data.profile || {};

        setFormData((prev) => ({
          ...prev,
          profilePicture:    null,
          certificateImages: [],
          idPictures:        [],
          description:       profileData.description        || user.description       || "",
          professionalTitle: profileData.professional_title || user.professionalTitle  || "",
          yearsOfExperience: profileData.years_of_experience != null
            ? String(profileData.years_of_experience)
            : (user.yearsOfExperience != null ? String(user.yearsOfExperience) : ""),
          practicingSince:   profileData.practicing_since   || user.practicingSince    || "",
          prcNumber:         profileData.prc_number         || user.prcNumber          || "",
          licenseNumber:     profileData.license_number     || user.licenseNumber      || "",
        }));

        const extractNames = (arr) =>
          Array.isArray(arr)
            ? arr.map((s) => (typeof s === "object" && s.name ? s.name : s)).filter(Boolean)
            : [];

        const mainSpecialtyList = Array.isArray(profileData.specializations)
          ? profileData.specializations
              .filter((s) => s?.pivot?.is_main === 1 || s?.pivot?.is_main === true)
              .map((s) => s.name)
              .filter(Boolean)
          : [];

        setLists({
          mainSpecialtyList,
          specializationList:    extractNames(profileData.specializations    || user.specializations),
          subSpecializationList: extractNames(profileData.sub_specializations || user.subSpecializations),
          boardCertificateList:  extractNames(profileData.board_certificates  || user.boardCertificates),
          servicesList:          extractNames(profileData.services            || user.services),
        });

        const rawImage = profileData.profile_picture || user.profilePictureUrl || null;
        const imageUrl = resolveImageUrl(rawImage);
        if (imageUrl) localStorage.setItem("profile_image", imageUrl);

      } catch (error) {
        console.error("[SetUpModal] Error fetching profile:", error);
        toast.error("Failed to load profile data");
      }
    };

    fetchProfile();
  }, [showModal]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (field, file) =>
    setFormData((prev) => ({ ...prev, [field]: file }));

  const handleMultiFileAdd = (field, file) => {
    if (file) setFormData((prev) => ({ ...prev, [field]: [...prev[field], file] }));
  };

  const handleMultiFileRemove = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const FIELD_TO_LIST_KEY = {
    mainSpecialty:     "mainSpecialtyList",
    specialization:    "specializationList",
    subSpecialization: "subSpecializationList",
    boardCertificate:  "boardCertificateList",
    myServices:        "servicesList",
  };

  const addToList = (field) => {
    const val     = formData[field]?.trim();
    const listKey = FIELD_TO_LIST_KEY[field];
    if (!val || !listKey) return;
    if (lists[listKey].includes(val)) {
      toast.error(`${val} is already added`);
      return;
    }
    setLists((prev) => ({ ...prev, [listKey]: [...prev[listKey], val] }));
    handleInputChange(field, "");
  };

  const removeFromList = (listKey, index) => {
    setLists((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  };

  // ── Save ─────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!formData.professionalTitle.trim())    return toast.error("Professional Title is required.");
    if (!formData.prcNumber.trim())            return toast.error("PRC License Number is required.");
    if (lists.specializationList.length === 0) return toast.error("Please add at least one Specialization.");

    setLoading(true);
    try {
      const payload = new FormData();

      if (formData.profilePicture) payload.append("profile_picture", formData.profilePicture);
      formData.certificateImages.forEach((f) => payload.append("certificate_images[]", f));
      formData.idPictures.forEach((f)        => payload.append("id_pictures[]", f));

      payload.append("description",         formData.description);
      payload.append("professional_title",  formData.professionalTitle);
      payload.append("years_of_experience", formData.yearsOfExperience || "");
      payload.append("practicing_since",    formData.practicingSince   || "");
      payload.append("prc_number",          formData.prcNumber);
      payload.append("license_number",      formData.licenseNumber);
      payload.append("main_specialties",    JSON.stringify(lists.mainSpecialtyList));
      payload.append("specializations",     JSON.stringify(lists.specializationList));
      payload.append("sub_specializations", JSON.stringify(lists.subSpecializationList));
      payload.append("board_certificates",  JSON.stringify(lists.boardCertificateList));
      payload.append("services",            JSON.stringify(lists.servicesList));

      const res = await axiosClient.post("/doctor/setup", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser    = res.data.user    || {};
      const updatedProfile = res.data.profile || {};

      // ── Merge existing localStorage user with updated fields ──
      // This ensures sidebar immediately reflects new prc_number,
      // professional title, and profile picture after saving.
      const existingUser = (() => {
        try { return JSON.parse(localStorage.getItem("user") || "{}"); }
        catch { return {}; }
      })();

      const mergedUser = {
        ...existingUser,
        ...updatedUser,
        // Explicitly set every field the sidebar reads
        prcNumber:         updatedUser.prc_number        || updatedUser.prcNumber        || formData.prcNumber,
        prc_number:        updatedUser.prc_number        || updatedUser.prcNumber        || formData.prcNumber,
        licenseNumber:     updatedUser.license_number    || updatedUser.licenseNumber    || formData.licenseNumber,
        professionalTitle: updatedUser.professional_title|| updatedUser.professionalTitle|| formData.professionalTitle,
        profilePictureUrl: updatedProfile.profile_picture || updatedUser.profilePictureUrl || null,
      };

      localStorage.setItem("user", JSON.stringify(mergedUser));

      // ── Update profile image in localStorage ──────────────────
      const rawImage = updatedProfile.profile_picture || updatedUser.profilePictureUrl || null;
      const imageUrl = resolveImageUrl(rawImage);
      if (imageUrl) localStorage.setItem("profile_image", imageUrl);

      // ── Notify sidebar and other components to re-read ────────
      window.dispatchEvent(new Event("profileUpdated"));
      toast.success("Profile setup complete!");
      onClose();

    } catch (err) {
      console.error("[SetUpModal] Save error:", err);
      toast.error(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  const { mainSpecialtyList, specializationList, subSpecializationList, boardCertificateList, servicesList } = lists;
  const savedImage = localStorage.getItem("profile_image");

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-2"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div
        className="bg-white d-flex flex-column"
        style={{
          width: "95%", maxWidth: "800px",
          height: "90vh", maxHeight: "900px",
          borderRadius: "24px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="position-relative px-4 py-3 border-bottom flex-shrink-0"
          style={{ borderTopLeftRadius: "24px", borderTopRightRadius: "24px", backgroundColor: "#fff" }}
        >
          <h3 className="m-0 fw-bold text-center" style={{ color: "#4D227C" }}>Account Setup</h3>
          <button
            className="btn btn-link text-secondary p-1 position-absolute"
            style={{ top: "12px", right: "12px", fontSize: "24px" }}
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex-grow-1" style={{ overflowY: "auto" }}>
          <div className="row g-3">

            {/* Profile Picture */}
            <div className="col-12">
              {savedImage && !formData.profilePicture && (
                <div className="mb-2 d-flex align-items-center gap-3">
                  <img
                    src={savedImage}
                    alt="Current profile"
                    onError={(e) => { e.target.style.display = "none"; }}
                    style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover", border: "2px solid #4D227C" }}
                  />
                  <small className="text-muted">Current profile picture. Upload a new one to replace it.</small>
                </div>
              )}
              <FileInput
                label="Profile Picture"
                file={formData.profilePicture}
                onFileChange={(file) => handleFileChange("profilePicture", file)}
              />
            </div>

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
                min="0" max="70"
              />
            </div>
            <div className="col-12 col-sm-6">
              <input
                type="text"
                placeholder="License Number"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
              />
            </div>

            {/* Practicing Since + PRC Number */}
            <div className="col-12 col-sm-6">
              <input
                type="text"
                placeholder="Practicing Since (e.g. 2011)"
                value={formData.practicingSince}
                onChange={(e) => handleInputChange("practicingSince", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
              />
            </div>
            <div className="col-12 col-sm-6">
              <input
                type="text"
                placeholder="PRC License No. * (e.g. PSY-0123456)"
                value={formData.prcNumber}
                onChange={(e) => handleInputChange("prcNumber", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
              />
            </div>

            {/* Tag Lists with Dropdowns */}
            <DropdownListInput
              label="Main Specialty"
              value={formData.mainSpecialty}
              onChange={(val) => handleInputChange("mainSpecialty", val)}
              list={mainSpecialtyList}
              add={() => addToList("mainSpecialty")}
              remove={(i) => removeFromList("mainSpecialtyList", i)}
              options={options.specializations.map((s) => s.name || s)}
              excludeList={mainSpecialtyList}
            />

            <DropdownListInput
              label="Specialization *"
              value={formData.specialization}
              onChange={(val) => handleInputChange("specialization", val)}
              list={specializationList}
              add={() => addToList("specialization")}
              remove={(i) => removeFromList("specializationList", i)}
              options={options.specializations.map((s) => s.name || s)}
              excludeList={specializationList}
            />

            <DropdownListInput
              label="Sub-specialization"
              value={formData.subSpecialization}
              onChange={(val) => handleInputChange("subSpecialization", val)}
              list={subSpecializationList}
              add={() => addToList("subSpecialization")}
              remove={(i) => removeFromList("subSpecializationList", i)}
              options={options.subSpecializations.map((s) => s.name || s)}
              excludeList={subSpecializationList}
            />

            <DropdownListInput
              label="Board Certificate"
              value={formData.boardCertificate}
              onChange={(val) => handleInputChange("boardCertificate", val)}
              list={boardCertificateList}
              add={() => addToList("boardCertificate")}
              remove={(i) => removeFromList("boardCertificateList", i)}
              options={options.boardCertificates.map((s) => s.name || s)}
              excludeList={boardCertificateList}
            />

            <DropdownListInput
              label="My Services"
              value={formData.myServices}
              onChange={(val) => handleInputChange("myServices", val)}
              list={servicesList}
              add={() => addToList("myServices")}
              remove={(i) => removeFromList("servicesList", i)}
              options={options.services.map((s) => s.name || s)}
              excludeList={servicesList}
            />

            {/* Certificate Images */}
            <MultiFileInput
              label="Certificate Image"
              files={formData.certificateImages}
              fieldKey="certImg"
              onFileAdd={(file) => handleMultiFileAdd("certificateImages", file)}
              onFileRemove={(i) => handleMultiFileRemove("certificateImages", i)}
            />

            {/* ID Pictures */}
            <MultiFileInput
              label="Upload ID Card Picture"
              files={formData.idPictures}
              fieldKey="idPic"
              onFileAdd={(file) => handleMultiFileAdd("idPictures", file)}
              onFileRemove={(i) => handleMultiFileRemove("idPictures", i)}
            />

          </div>
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-center px-4 py-3 border-top flex-shrink-0 position-relative">
          <button
            className="btn text-white fw-semibold px-4 py-2"
            style={{ backgroundColor: "#4D227C", borderRadius: "12px", minWidth: "120px" }}
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Save Changes"}
          </button>
          <button
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

// ── DropdownListInput ─────────────────────────────────────────────────────────
const DropdownListInput = ({ label, value, onChange, list, add, remove, options = [], excludeList = [] }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(
    (opt) => !excludeList.includes(opt) && opt.toLowerCase().includes(value.toLowerCase())
  );

  const select = (opt) => { onChange(opt); setOpen(false); };

  return (
    <div className="col-12" ref={ref}>
      <div className="d-flex gap-2">
        <div className="position-relative flex-grow-1">
          <input
            type="text"
            placeholder={label}
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter")  { e.preventDefault(); add(); setOpen(false); }
              if (e.key === "Escape") setOpen(false);
            }}
            className="form-control"
            style={{ borderRadius: "12px", height: "40px", paddingRight: "36px" }}
          />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", padding: 0, cursor: "pointer", color: "#4D227C", display: "flex", alignItems: "center" }}
            tabIndex={-1}
          >
            <FiChevronDown size={16} style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>

          {open && filtered.length > 0 && (
            <div style={{ position: "absolute", top: "44px", left: 0, right: 0, backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 9999, maxHeight: "200px", overflowY: "auto" }}>
              {filtered.map((opt) => (
                <div
                  key={opt}
                  onMouseDown={(e) => { e.preventDefault(); select(opt); }}
                  style={{ padding: "10px 16px", cursor: "pointer", fontSize: "0.9rem", color: "#2D3748", borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3EEFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {opt}
                </div>
              ))}
              {value.trim() && !options.includes(value.trim()) && (
                <div
                  onMouseDown={(e) => { e.preventDefault(); add(); setOpen(false); }}
                  style={{ padding: "10px 16px", cursor: "pointer", fontSize: "0.9rem", color: "#4D227C", fontStyle: "italic", borderTop: "1px solid #e2e8f0" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F3EEFF")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  + Add &quot;{value.trim()}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn text-white flex-shrink-0 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "#4D227C", width: "40px", height: "40px", borderRadius: "12px" }}
          onClick={() => { add(); setOpen(false); }}
        >
          <FiPlus size={18} />
        </button>
      </div>

      {list.length > 0 && (
        <div className="mt-2 d-flex flex-wrap gap-2">
          {list.map((item, i) => (
            <span key={i} className="badge d-inline-flex align-items-center gap-2" style={{ backgroundColor: "#4D227C", padding: "6px 12px", fontSize: "0.9rem", fontWeight: "400" }}>
              {item}
              <button type="button" onClick={() => remove(i)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", padding: "0", lineHeight: "1" }} aria-label="Remove">
                <FiX size={16} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ── FileInput ────────────────────────────────────────────────────────────────
const FileInput = ({ label, file, onFileChange }) => {
  const inputId = label.replace(/\s+/g, "") + "Input";
  return (
    <div className="col-12">
      <div className="position-relative">
        <input type="text" placeholder={`Upload ${label}`} readOnly value={file ? file.name : ""} className="form-control" style={{ borderRadius: "12px", paddingRight: "90px", height: "40px" }} />
        <input type="file" accept="image/*" id={inputId} className="d-none" onChange={(e) => onFileChange(e.target.files[0])} />
        <button type="button" className="btn position-absolute" style={{ backgroundColor: "#C4B5D6", top: "0", right: "0", height: "40px", borderRadius: "0 12px 12px 0", border: "none", padding: "0 15px" }} onClick={() => document.getElementById(inputId).click()}>Browse</button>
      </div>
    </div>
  );
};

// ── MultiFileInput ───────────────────────────────────────────────────────────
const MultiFileInput = ({ label, files, fieldKey, onFileAdd, onFileRemove }) => {
  const inputId = fieldKey + "MultiInput";
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) { onFileAdd(file); e.target.value = ""; }
  };
  return (
    <div className="col-12">
      <div className="d-flex gap-2 align-items-center">
        <div className="position-relative flex-grow-1">
          <input type="text" placeholder={`Upload ${label}`} readOnly value={files.length > 0 ? `${files.length} file(s) selected` : ""} className="form-control" style={{ borderRadius: "12px", paddingRight: "90px", height: "40px", cursor: "default" }} />
          <input type="file" accept="image/*" id={inputId} className="d-none" onChange={handleChange} />
          <button type="button" className="btn position-absolute" style={{ backgroundColor: "#C4B5D6", top: "0", right: "0", height: "40px", borderRadius: "0 12px 12px 0", border: "none", padding: "0 15px" }} onClick={() => document.getElementById(inputId).click()}>Browse</button>
        </div>
        <button type="button" className="btn text-white flex-shrink-0 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#4D227C", width: "40px", height: "40px", borderRadius: "12px" }} onClick={() => document.getElementById(inputId).click()}>
          <FiPlus size={18} />
        </button>
      </div>
      {files.length > 0 && (
        <div className="mt-2 d-flex flex-wrap gap-2">
          {files.map((file, i) => (
            <span key={i} className="badge d-inline-flex align-items-center gap-2" style={{ backgroundColor: "#4D227C", padding: "6px 12px", fontSize: "0.85rem", fontWeight: "400", maxWidth: "220px" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }} title={file.name}>{file.name}</span>
              <button type="button" onClick={() => onFileRemove(i)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0", lineHeight: "1", flexShrink: 0 }} aria-label="Remove">
                <FiX size={14} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SetUpAccountModal;
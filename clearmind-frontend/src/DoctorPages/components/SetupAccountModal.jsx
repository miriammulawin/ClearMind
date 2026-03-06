import { useState, useEffect } from "react";
import { FiX, FiPlus } from "react-icons/fi";
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

  const [loading, setLoading] = useState(false);

  // ── Fetch existing profile when modal opens ──────────────────────
  useEffect(() => {
    if (!showModal) return;

    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get("/profile");
        const user = res.data.user || {};
        const profileData = res.data.profile || {};

        console.log("========== SETUP MODAL DATA DEBUG ==========");
        console.log("[SetUpModal] Full API response:", res.data);
        console.log("[SetUpModal] Profile data keys:", Object.keys(profileData));
        console.log("[SetUpModal] Specializations:", profileData.specializations);
        console.log("[SetUpModal] Services:", profileData.services);
        console.log("[SetUpModal] Sub-Specializations:", profileData.sub_specializations);
        console.log("[SetUpModal] Board Certificates:", profileData.board_certificates);
        console.log("==========================================");

        // Update basic form data
        setFormData((prev) => ({
          ...prev,
          profilePicture:    null,
          certificateImages: [],
          idPictures:        [],
          description:       profileData.description || "",
          professionalTitle: profileData.professional_title || "",
          yearsOfExperience: profileData.years_of_experience != null
            ? String(profileData.years_of_experience) : "",
          practicingSince:   profileData.practicing_since || "",
          prcNumber:         profileData.prc_number || "",
          licenseNumber:     profileData.license_number || "",
        }));

        // ── SAFE DATA EXTRACTION ──────────────────────────────────────
        // Handle specializations - check if it's array of objects with name property
        let specializationList = [];
        if (Array.isArray(profileData.specializations)) {
          specializationList = profileData.specializations
            .map(s => {
              // Handle both {name: "..."} and {name: "...", pivot: {...}}
              if (typeof s === 'object' && s.name) {
                return s.name;
              }
              // Fallback for string values
              if (typeof s === 'string') {
                return s;
              }
              return null;
            })
            .filter(Boolean);
        }
        console.log("[SetUpModal] Final Specialization List:", specializationList);

        // Handle services
        let servicesList = [];
        if (Array.isArray(profileData.services)) {
          servicesList = profileData.services
            .map(s => {
              if (typeof s === 'object' && s.name) {
                return s.name;
              }
              if (typeof s === 'string') {
                return s;
              }
              return null;
            })
            .filter(Boolean);
        }
        console.log("[SetUpModal] Final Services List:", servicesList);

        // Handle sub-specializations
        let subSpecializationList = [];
        if (Array.isArray(profileData.sub_specializations)) {
          subSpecializationList = profileData.sub_specializations
            .map(s => {
              if (typeof s === 'object' && s.name) {
                return s.name;
              }
              if (typeof s === 'string') {
                return s;
              }
              return null;
            })
            .filter(Boolean);
        }
        console.log("[SetUpModal] Final Sub-Specialization List:", subSpecializationList);

        // Handle board certificates
        let boardCertificateList = [];
        if (Array.isArray(profileData.board_certificates)) {
          boardCertificateList = profileData.board_certificates
            .map(c => {
              if (typeof c === 'object' && c.name) {
                return c.name;
              }
              if (typeof c === 'string') {
                return c;
              }
              return null;
            })
            .filter(Boolean);
        }
        console.log("[SetUpModal] Final Board Certificate List:", boardCertificateList);

        // Handle main specialties - filter by is_main pivot
        let mainSpecialtyList = [];
        if (Array.isArray(profileData.specializations)) {
          mainSpecialtyList = profileData.specializations
            .filter(s => s.pivot && s.pivot.is_main === 1 || s.pivot?.is_main === true)
            .map(s => s.name)
            .filter(Boolean);
        }
        console.log("[SetUpModal] Final Main Specialty List:", mainSpecialtyList);

        // Set all lists
        setLists({
          mainSpecialtyList,
          specializationList,
          subSpecializationList,
          boardCertificateList,
          servicesList,
        });

        // Save to localStorage
        const merged = { ...user, ...profileData };
        localStorage.setItem("user", JSON.stringify(merged));

        // Save profile image
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
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: [...prev[field], file] }));
    }
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
    
    // Check for duplicates
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

      // Append multiple certificate images
      formData.certificateImages.forEach((file) => {
        payload.append("certificate_images[]", file);
      });

      // Append multiple ID pictures
      formData.idPictures.forEach((file) => {
        payload.append("id_pictures[]", file);
      });

      payload.append("description",         formData.description);
      payload.append("professional_title",  formData.professionalTitle);
      payload.append("years_of_experience", formData.yearsOfExperience || "");
      payload.append("practicing_since",    formData.practicingSince   || "");
      payload.append("prc_number",          formData.prcNumber);
      payload.append("license_number",      formData.licenseNumber);

      // Send as JSON strings
      payload.append("main_specialties",    JSON.stringify(lists.mainSpecialtyList));
      payload.append("specializations",     JSON.stringify(lists.specializationList));
      payload.append("sub_specializations", JSON.stringify(lists.subSpecializationList));
      payload.append("board_certificates",  JSON.stringify(lists.boardCertificateList));
      payload.append("services",            JSON.stringify(lists.servicesList));

      const res = await axiosClient.post("/doctor/setup", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("[SetUpModal] Setup successful:", res.data);

      const updatedUser = res.data.user || {};
      const updatedProfile = res.data.profile || {};

      localStorage.setItem("user", JSON.stringify(updatedUser));

      const rawImage = updatedProfile.profile_picture || updatedUser.profilePictureUrl || null;
      const imageUrl = resolveImageUrl(rawImage);
      if (imageUrl) localStorage.setItem("profile_image", imageUrl);

      window.dispatchEvent(new Event("profileUpdated"));
      toast.success("Profile setup complete!");
      onClose();

    } catch (err) {
      console.error("[SetUpModal] Save error:", err);
      const msg = err.response?.data?.message || "Upload failed. Please try again.";
      toast.error(msg);
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

            {/* Profile Picture Preview + Upload */}
            <div className="col-12">
              {savedImage && !formData.profilePicture && (
                <div className="mb-2 d-flex align-items-center gap-3">
                  <img
                    src={savedImage}
                    alt="Current profile"
                    onError={(e) => { e.target.style.display = "none"; }}
                    style={{
                      width: "56px", height: "56px",
                      borderRadius: "10px", objectFit: "cover",
                      border: "2px solid #4D227C",
                    }}
                  />
                  <small className="text-muted">
                    Current profile picture. Upload a new one to replace it.
                  </small>
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

            {/* ── Tag Lists ── */}
            <ListInput
              label="Main Specialty"
              value={formData.mainSpecialty}
              onChange={(val) => handleInputChange("mainSpecialty", val)}
              list={mainSpecialtyList}
              add={() => addToList("mainSpecialty")}
              remove={(i) => removeFromList("mainSpecialtyList", i)}
            />

            <ListInput
              label="Specialization *"
              value={formData.specialization}
              onChange={(val) => handleInputChange("specialization", val)}
              list={specializationList}
              add={() => addToList("specialization")}
              remove={(i) => removeFromList("specializationList", i)}
            />
            
            <ListInput
              label="Sub-specialization"
              value={formData.subSpecialization}
              onChange={(val) => handleInputChange("subSpecialization", val)}
              list={subSpecializationList}
              add={() => addToList("subSpecialization")}
              remove={(i) => removeFromList("subSpecializationList", i)}
            />
            
            <ListInput
              label="Board Certificate"
              value={formData.boardCertificate}
              onChange={(val) => handleInputChange("boardCertificate", val)}
              list={boardCertificateList}
              add={() => addToList("boardCertificate")}
              remove={(i) => removeFromList("boardCertificateList", i)}
            />
            
            <ListInput
              label="My Services"
              value={formData.myServices}
              onChange={(val) => handleInputChange("myServices", val)}
              list={servicesList}
              add={() => addToList("myServices")}
              remove={(i) => removeFromList("servicesList", i)}
            />

            {/* Certificate Images — multi-upload */}
            <MultiFileInput
              label="Certificate Image"
              files={formData.certificateImages}
              fieldKey="certImg"
              onFileAdd={(file) => handleMultiFileAdd("certificateImages", file)}
              onFileRemove={(i) => handleMultiFileRemove("certificateImages", i)}
            />

            {/* ID Pictures — multi-upload */}
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

// ── Helper Components ────────────────────────────────────────────────────────

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
            backgroundColor: "#C4B5D6", top: "0", right: "0",
            height: "40px", borderRadius: "0 12px 12px 0",
            border: "none", padding: "0 15px",
          }}
          onClick={() => document.getElementById(inputId).click()}
        >
          Browse
        </button>
      </div>
    </div>
  );
};

const MultiFileInput = ({ label, files, fieldKey, onFileAdd, onFileRemove }) => {
  const inputId = fieldKey + "MultiInput";

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileAdd(file);
      e.target.value = "";
    }
  };

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
            onChange={handleChange}
          />
          <button
            type="button"
            className="btn position-absolute"
            style={{
              backgroundColor: "#C4B5D6", top: "0", right: "0",
              height: "40px", borderRadius: "0 12px 12px 0",
              border: "none", padding: "0 15px",
            }}
            onClick={() => document.getElementById(inputId).click()}
          >
            Browse
          </button>
        </div>

        <button
          type="button"
          className="btn text-white flex-shrink-0 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "#4D227C",
            width: "40px", height: "40px",
            borderRadius: "12px",
          }}
          onClick={() => document.getElementById(inputId).click()}
        >
          <FiPlus size={18} />
        </button>
      </div>

      {files.length > 0 && (
        <div className="mt-2 d-flex flex-wrap gap-2">
          {files.map((file, i) => (
            <span
              key={i}
              className="badge d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: "#4D227C",
                padding: "6px 12px",
                fontSize: "0.85rem",
                fontWeight: "400",
                maxWidth: "220px",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "160px",
                }}
                title={file.name}
              >
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => onFileRemove(i)}
                style={{
                  background: "none", border: "none", color: "white",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", padding: "0", lineHeight: "1", flexShrink: 0,
                }}
                aria-label="Remove"
              >
                <FiX size={14} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
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
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
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
                background: "none", border: "none", color: "white",
                cursor: "pointer", display: "flex", alignItems: "center",
                padding: "0", lineHeight: "1",
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

export default SetUpAccountModal;
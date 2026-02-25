import { useState, useEffect } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

const safeParse = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
};

function SetUpAccountModal({ showModal, onClose }) {
  const [formData, setFormData] = useState({
    profilePicture:    null,
    certificateImage:  null,
    description:       "",
    professionalTitle: "",
    yearsOfExperience: "",
    licenseNumber:     "",
    specialization:    "",
    subSpecialization: "",
    boardCertificate:  "",
    myServices:        "",
  });

  const [lists, setLists] = useState({
    specializationList:    [],
    subSpecializationList: [],
    boardCertificateList:  [],
    servicesList:          [],
  });

  const [loading, setLoading] = useState(false);

  // ── Fetch & pre-populate form when modal opens ──────────────────
  useEffect(() => {
    if (!showModal) return;

    const fetchProfile = async () => {
      try {
        const res     = await axiosClient.get("/profile");
        const user    = res.data.user    || {};
        const profile = res.data.profile || {};

        // Pre-fill text inputs
        setFormData({
          profilePicture:    null,   // can't pre-fill File input, but show current image separately
          certificateImage:  null,
          description:       profile.description       || "",
          professionalTitle: profile.professional_title || "",
          yearsOfExperience: profile.years_of_experience != null ? String(profile.years_of_experience) : "",
          licenseNumber:     profile.license_number    || profile.prc_number || "",
          specialization:    "",
          subSpecialization: "",
          boardCertificate:  "",
          myServices:        "",
        });

        // Pre-fill tag lists
        setLists({
          specializationList:    safeParse(profile.specializations),
          subSpecializationList: safeParse(profile.sub_specializations),
          boardCertificateList:  safeParse(profile.board_certificates),
          servicesList:          safeParse(profile.services),
        });

        // Store merged data in localStorage
        const merged = { ...user, ...profile };
        localStorage.setItem("user", JSON.stringify(merged));
        if (profile.profile_picture) {
          localStorage.setItem("profile_image", profile.profile_picture);
        }

      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [showModal]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (field, file) =>
    setFormData((prev) => ({ ...prev, [field]: file }));

  const FIELD_TO_LIST_KEY = {
    specialization:    "specializationList",
    subSpecialization: "subSpecializationList",
    boardCertificate:  "boardCertificateList",
    myServices:        "servicesList",
  };

  const addToList = (field) => {
    const val     = formData[field]?.trim();
    const listKey = FIELD_TO_LIST_KEY[field];
    if (!val || !listKey) return;
    setLists((prev) => ({ ...prev, [listKey]: [...prev[listKey], val] }));
    handleInputChange(field, "");
  };

  const removeFromList = (listKey, index) => {
    setLists((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  };

  // ── Save ────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!formData.professionalTitle.trim()) return toast.error("Professional Title is required.");
    if (!formData.licenseNumber.trim())     return toast.error("License Number is required.");
    if (lists.specializationList.length === 0) return toast.error("Please add at least one Specialization.");

    setLoading(true);

    try {
      const payload = new FormData();

      if (formData.profilePicture)   payload.append("profile_picture",   formData.profilePicture);
      if (formData.certificateImage) payload.append("certificate_image",  formData.certificateImage);

      payload.append("description",         formData.description);
      payload.append("professional_title",  formData.professionalTitle);
      payload.append("years_of_experience", formData.yearsOfExperience || "");
      payload.append("license_number",      formData.licenseNumber);

      payload.append("specializations",    JSON.stringify(lists.specializationList));
      payload.append("sub_specializations",JSON.stringify(lists.subSpecializationList));
      payload.append("board_certificates", JSON.stringify(lists.boardCertificateList));
      payload.append("services",           JSON.stringify(lists.servicesList));

      const res = await axiosClient.post("/doctor/setup", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // The setup endpoint returns { user: {...} } — sync localStorage
      const updatedUser = res.data.user || {};
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (updatedUser.profilePictureUrl) {
        localStorage.setItem("profile_image", updatedUser.profilePictureUrl);
      }

      // Tell DoctorProfile (and DoctorSideBar) to re-fetch
      window.dispatchEvent(new Event("profileUpdated"));

      toast.success("Profile setup complete!");
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        "Upload failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  const { specializationList, subSpecializationList, boardCertificateList, servicesList } = lists;

  // Show current saved profile picture as a preview (read-only hint)
  const savedImage = localStorage.getItem("profile_image");

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-2"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div
        className="bg-white d-flex flex-column"
        style={{ width: "95%", maxWidth: "800px", height: "90vh", maxHeight: "900px", borderRadius: "24px", boxShadow: "0 8px 30px rgba(0,0,0,0.2)" }}
      >
        {/* Header */}
        <div
          className="position-relative px-4 py-3 border-bottom flex-shrink-0"
          style={{ borderTopLeftRadius: "24px", borderTopRightRadius: "24px", backgroundColor: "#fff" }}
        >
          <h3 className="m-0 fw-bold text-center" style={{ color: "#4D227C" }}>
            Account Setup
          </h3>
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

            {/* Profile Picture — show current image as preview */}
            <div className="col-12">
              {savedImage && !formData.profilePicture && (
                <div className="mb-2 d-flex align-items-center gap-3">
                  <img
                    src={savedImage}
                    alt="Current profile"
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

            <div className="col-12">
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", minHeight: "60px", resize: "none" }}
              />
            </div>

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
                placeholder="License Number *"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
              />
            </div>

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

            <FileInput
              label="Certificate Image"
              file={formData.certificateImage}
              onFileChange={(file) => handleFileChange("certificateImage", file)}
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
          style={{ backgroundColor: "#C4B5D6", top: "0", right: "0", height: "40px", borderRadius: "0 12px 12px 0", border: "none", padding: "0 15px" }}
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
              style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0", lineHeight: "1" }}
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
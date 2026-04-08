import { useState, useRef } from "react";
import "../ClientStyle/EditProfileModal.css";
import ProfileAvatar from "./ProfileAvatar";
import { FaCamera } from "react-icons/fa";

const PRONOUN_OPTIONS = [
  { label: "She/Her", value: "she/her" },
  { label: "He/Him", value: "he/him" },
  { label: "They/Them", value: "they/them" },
  { label: "Other (specify)", value: "other" },
];

const GENDER_OPTIONS = [
  "Woman",
  "Man",
  "Transgender",
  "Trans woman",
  "Trans man",
  "Non-binary",
  "Genderqueer",
  "Gender fluid",
  "Agender",
  "Bigender",
  "Two-spirit",
  "Intersex",
  "Pangender",
  "Prefer not to say",
  "Other (specify)",
];

function EditProfileModal({ isOpen, onClose, userData, onSave }) {
  const [form, setForm] = useState({
    firstName: userData?.firstName || "",
    middleName: userData?.middleName || "",
    lastName: userData?.lastName || "",
    civilStatus: userData?.civilStatus || "",
    dateOfBirth: userData?.dateOfBirth || "",
    sex: userData?.sex || "",
    genderIdentity: userData?.genderIdentity || "",
    contactNo: userData?.contactNo || "",
    email: userData?.email || "",
    preferredPronouns: userData?.preferredPronouns || "",
    homeAddress: userData?.homeAddress || "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  // --- Profile picture state ---
  const [profilePic, setProfilePic] = useState(userData?.profilePic || "");
  const fileInputRef = useRef(null);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfilePic(previewUrl);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePic("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Pronouns state ---
  const isPresetPronoun = PRONOUN_OPTIONS.some(
    (p) => p.value === userData?.preferredPronouns,
  );
  const [pronounSelect, setPronounSelect] = useState(
    isPresetPronoun ? userData?.preferredPronouns || "" : "other",
  );
  const [customPronoun, setCustomPronoun] = useState(
    !isPresetPronoun && userData?.preferredPronouns
      ? userData.preferredPronouns
      : "",
  );

  // --- Gender Identity state ---
  const isPresetGender = GENDER_OPTIONS.includes(userData?.genderIdentity);
  const [genderSelect, setGenderSelect] = useState(
    isPresetGender ? userData?.genderIdentity || "" : "Other (specify)",
  );
  const [customGender, setCustomGender] = useState(
    !isPresetGender && userData?.genderIdentity ? userData.genderIdentity : "",
  );

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePronounChange = (e) => {
    const value = e.target.value;
    setPronounSelect(value);
    if (value !== "other") {
      setCustomPronoun("");
      setForm((prev) => ({ ...prev, preferredPronouns: value }));
    } else {
      setForm((prev) => ({ ...prev, preferredPronouns: customPronoun }));
    }
    setErrors((prev) => ({ ...prev, preferredPronouns: "" }));
  };

  const handleCustomPronounChange = (e) => {
    const value = e.target.value;
    setCustomPronoun(value);
    setForm((prev) => ({ ...prev, preferredPronouns: value }));
  };

  const handleGenderChange = (e) => {
    const value = e.target.value;
    setGenderSelect(value);
    if (value !== "Other (specify)") {
      setCustomGender("");
      setForm((prev) => ({ ...prev, genderIdentity: value }));
    } else {
      setForm((prev) => ({ ...prev, genderIdentity: customGender }));
    }
  };

  const handleCustomGenderChange = (e) => {
    const value = e.target.value;
    setCustomGender(value);
    setForm((prev) => ({ ...prev, genderIdentity: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
    if (!form.sex) newErrors.sex = "Sex is required.";
    if (!form.civilStatus) newErrors.civilStatus = "Civil status is required.";
    if (!form.contactNo.trim())
      newErrors.contactNo = "Contact number is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (form.password && form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave({ ...form, profilePic });
    onClose();
  };

  return (
    <div className="epm-overlay" onClick={onClose}>
      <div className="epm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="epm-header">
          {/* Clickable avatar — opens file picker */}
          <div
            className="epm-avatar-wrapper"
            onClick={() => fileInputRef.current.click()}
          >
            <ProfileAvatar
              firstName={form.firstName}
              lastName={form.lastName}
              profilePic={profilePic}
              size={52}
            />
            <div className="epm-avatar-camera">
              <FaCamera size={10} />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleProfilePicChange}
            />
          </div>

          <div className="epm-header-text">
            <h2 className="epm-title">Edit Profile</h2>
            <p className="epm-subtitle">
              Change/Upload your profile picture here.
            </p>
            {/* Remove photo link — only shows if a photo is set */}
            {profilePic && (
              <button
                type="button"
                className="epm-remove-photo"
                onClick={handleRemovePhoto}
              >
                Remove photo
              </button>
            )}
          </div>

          <button className="epm-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="epm-form" onSubmit={handleSubmit}>
          {/* Name Row */}
          <div className="epm-row">
            <div className="epm-field">
              <label className="epm-label">
                First Name <span className="epm-req">*</span>
              </label>
              <input
                className={`epm-input ${errors.firstName ? "epm-input-error" : ""}`}
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <span className="epm-error-msg">{errors.firstName}</span>
              )}
            </div>
            {/* Middle Name */}
            <div className="epm-field">
              <label className="epm-label">Middle Name</label>
              <input
                className="epm-input"
                type="text"
                name="middleName"
                placeholder="Middle Name"
                value={form.noMiddleName ? "" : form.middleName}
                onChange={handleChange}
                disabled={form.noMiddleName}
                style={{ opacity: form.noMiddleName ? 0.5 : 1 }}
              />
              <label className="epm-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.noMiddleName || false}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      noMiddleName: e.target.checked,
                      middleName: e.target.checked ? "" : prev.middleName,
                    }));
                  }}
                />
                <span>I don't have a middle name</span>
              </label>
            </div>

            <div className="epm-field">
              <label className="epm-label">
                Last Name <span className="epm-req">*</span>
              </label>
              <input
                className={`epm-input ${errors.lastName ? "epm-input-error" : ""}`}
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <span className="epm-error-msg">{errors.lastName}</span>
              )}
            </div>
          </div>

          {/* Date of Birth & Sex */}
          <div className="epm-row">
            <div className="epm-field">
              <label className="epm-label">
                Date of Birth <span className="epm-req">*</span>
              </label>
              <input
                className={`epm-input ${errors.dateOfBirth ? "epm-input-error" : ""}`}
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
              {errors.dateOfBirth && (
                <span className="epm-error-msg">{errors.dateOfBirth}</span>
              )}
            </div>
            <div className="epm-field">
              <label className="epm-label">
                Sex <span className="epm-req">*</span>
              </label>
              <select
                className={`epm-input epm-select ${errors.sex ? "epm-input-error" : ""}`}
                name="sex"
                value={form.sex}
                onChange={handleChange}
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.sex && (
                <span className="epm-error-msg">{errors.sex}</span>
              )}
            </div>
          </div>

          {/* Civil Status */}
          <div className="epm-field">
            <label className="epm-label">Civil Status</label>
            <select
              className="epm-input epm-select"
              name="civilStatus"
              value={form.civilStatus}
              onChange={handleChange}
            >
              <option value="">Select Civil Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
              <option value="Annulled">Annulled</option>
            </select>
          </div>

          {/* Gender Identity */}
          <div className="epm-field">
            <label className="epm-label">Gender Identity</label>
            <select
              className="epm-input epm-select"
              value={genderSelect}
              onChange={handleGenderChange}
            >
              <option value="">Select gender identity...</option>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {genderSelect === "Other (specify)" && (
              <input
                className="epm-input"
                type="text"
                placeholder="Describe your gender identity..."
                value={customGender}
                onChange={handleCustomGenderChange}
                style={{ marginTop: "0.5rem" }}
              />
            )}
          </div>

          {/* Preferred Pronouns */}
          <div className="epm-field">
            <label className="epm-label">Preferred Pronoun/s</label>
            <select
              className="epm-input epm-select"
              value={pronounSelect}
              onChange={handlePronounChange}
            >
              <option value="">Select pronouns...</option>
              {PRONOUN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {pronounSelect === "other" && (
              <input
                className="epm-input"
                type="text"
                placeholder="e.g. xe/xem, fae/faer..."
                value={customPronoun}
                onChange={handleCustomPronounChange}
                style={{ marginTop: "0.5rem" }}
              />
            )}
          </div>

          {/* Contact No. */}
          <div className="epm-field">
            <label className="epm-label">
              Contact No. <span className="epm-req">*</span>
            </label>
            <input
              className={`epm-input ${errors.contactNo ? "epm-input-error" : ""}`}
              type="tel"
              name="contactNo"
              placeholder="Contact Number"
              value={form.contactNo}
              onChange={handleChange}
            />
            {errors.contactNo && (
              <span className="epm-error-msg">{errors.contactNo}</span>
            )}
          </div>

          {/* Email */}
          <div className="epm-field">
            <label className="epm-label">
              Email <span className="epm-req">*</span>
            </label>
            <input
              className={`epm-input ${errors.email ? "epm-input-error" : ""}`}
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="epm-error-msg">{errors.email}</span>
            )}
          </div>

          {/* Home Address */}
          <div className="epm-field">
            <label className="epm-label">
              Home Address <span className="epm-req">*</span>
            </label>
            <textarea
              className="epm-input epm-textarea"
              name="homeAddress"
              placeholder="House No., Street, Barangay, City/Municipality, Province, ZIP Code"
              value={form.homeAddress}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* Change Password */}
          <div className="epm-divider">
            <span>Change Password (optional)</span>
          </div>
          <div className="epm-row">
            <div className="epm-field">
              <label className="epm-label">New Password</label>
              <input
                className={`epm-input ${errors.password ? "epm-input-error" : ""}`}
                type="password"
                name="password"
                placeholder="New Password"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && (
                <span className="epm-error-msg">{errors.password}</span>
              )}
            </div>
            <div className="epm-field">
              <label className="epm-label">Confirm Password</label>
              <input
                className={`epm-input ${errors.confirmPassword ? "epm-input-error" : ""}`}
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <span className="epm-error-msg">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="epm-actions">
            <button type="button" className="epm-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="epm-btn-save">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;

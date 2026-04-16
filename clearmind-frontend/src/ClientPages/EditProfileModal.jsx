import { useState, useRef, useEffect } from "react";
import "./ClientStyle/EditProfileModal.css";
import ProfileAvatar from "../ClientPages/ClientComponents/ProfileAvatar";
import { FaCamera } from "react-icons/fa";
import axiosClient from "../axiosClient";

const PRONOUN_OPTIONS = [
  { label: "She/Her", value: "she_her" },
  { label: "He/Him", value: "he_him" },
  { label: "They/Them", value: "they_them" },
  { label: "Other (specify)", value: "other" },
];

const GENDER_OPTIONS = [
  "Female",
  "Male",
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

const normalizeGender = (val) => {
  if (!val) return "";
  const map = {
    female: "Female",
    male: "Male",
    transgender: "Transgender",
    trans_woman: "Trans woman",
    trans_man: "Trans man",
    non_binary: "Non-binary",
    genderqueer: "Genderqueer",
    gender_fluid: "Gender fluid",
    agender: "Agender",
    bigender: "Bigender",
    two_spirit: "Two-spirit",
    intersex: "Intersex",
    pangender: "Pangender",
    prefer_not: "Prefer not to say",
  };
  return map[val] || val;
};

const GENDER_TO_BACKEND = {
  Female: "female",
  Male: "male",
  Transgender: "transgender",
  "Trans woman": "trans_woman",
  "Trans man": "trans_man",
  "Non-binary": "non_binary",
  Genderqueer: "genderqueer",
  "Gender fluid": "gender_fluid",
  Agender: "agender",
  Bigender: "bigender",
  "Two-spirit": "two_spirit",
  Intersex: "intersex",
  Pangender: "pangender",
  "Prefer not to say": "prefer_not",
};

const capitalizeSex = (val) => {
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
};

function EditProfileModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: "",
    middleInitial: "",
    lastName: "",
    dob: "",
    sex: "",
    genderIdentity: "",
    contactNo: "",
    email: "",
    preferredPronoun: "",
    address: "",
    civilStatus: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // profilePicture = URL string shown in the avatar (either from server or a local blob URL)
  const [profilePicture, setProfilePicture] = useState("");
  // profilePicFile = the actual File object selected by the user (null if not changed)
  const [profilePicFile, setProfilePicFile] = useState(null);
  // profilePicRemoved = true when the user clicked "Remove photo"
  const [profilePicRemoved, setProfilePicRemoved] = useState(false);

  const [pronounSelect, setPronounSelect] = useState("");
  const [customPronoun, setCustomPronoun] = useState("");
  const [genderSelect, setGenderSelect] = useState("");
  const [customGender, setCustomGender] = useState("");
  const fileInputRef = useRef(null);

  // ─── Load profile when modal opens ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    axiosClient
      .get("/me")
      .then((response) => {
        if (response.data.success) {
          const u = response.data.data;

          const normalizedGender = normalizeGender(u.genderIdentity);
          const isPresetGender = GENDER_OPTIONS.includes(normalizedGender);
          const isPresetPronoun = PRONOUN_OPTIONS.some(
            (p) => p.value === u.preferredPronoun,
          );

          setForm({
            firstName: u.firstName || "",
            middleInitial: u.middleInitial || "",
            lastName: u.lastName || "",
            dob: u.dob || "",
            sex: capitalizeSex(u.sex),
            genderIdentity: isPresetGender
              ? normalizedGender
              : u.genderIdentity || "",
            contactNo: u.contactNo || "",
            email: u.email || "",
            preferredPronoun: u.preferredPronoun || "",
            address: u.address || "",
            civilStatus: u.civilStatus || "",
            password: "",
            confirmPassword: "",
          });

          // ← use profilePicture from the API response
          setProfilePicture(u.profilePicture || "");
          setProfilePicFile(null);
          setProfilePicRemoved(false);

          setPronounSelect(
            isPresetPronoun
              ? u.preferredPronoun
              : u.preferredPronoun
                ? "other"
                : "",
          );
          setCustomPronoun(
            !isPresetPronoun && u.preferredPronoun ? u.preferredPronoun : "",
          );
          setGenderSelect(
            isPresetGender
              ? normalizedGender
              : u.genderIdentity
                ? "Other (specify)"
                : "",
          );
          setCustomGender(
            !isPresetGender && u.genderIdentity ? u.genderIdentity : "",
          );
          setErrors({});
        }
      })
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  // ─── Field handlers ───────────────────────────────────────────────────────────
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
      setForm((prev) => ({ ...prev, preferredPronoun: value }));
    } else {
      setForm((prev) => ({ ...prev, preferredPronoun: customPronoun }));
    }
    setErrors((prev) => ({ ...prev, preferredPronoun: "" }));
  };

  const handleCustomPronounChange = (e) => {
    const value = e.target.value;
    setCustomPronoun(value);
    setForm((prev) => ({ ...prev, preferredPronoun: value }));
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

  // ─── Profile picture handlers ─────────────────────────────────────────────────
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Show a local preview immediately
    setProfilePicture(URL.createObjectURL(file));
    setProfilePicFile(file);
    setProfilePicRemoved(false);
  };

  const handleRemovePhoto = () => {
    setProfilePicture("");
    setProfilePicFile(null);
    setProfilePicRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.dob) newErrors.dob = "Date of birth is required.";
    if (!form.sex) newErrors.sex = "Sex is required.";
    if (!form.civilStatus) newErrors.civilStatus = "Civil status is required.";
    if (!form.contactNo.trim())
      newErrors.contactNo = "Contact number is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (form.password && form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    return newErrors;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const resolvedPronoun =
      pronounSelect === "other" ? customPronoun : form.preferredPronoun;

    // Use FormData so we can send the file as multipart
    const formData = new FormData();
    formData.append("_method", "PUT"); // Laravel method spoofing
    formData.append("firstName", form.firstName);
    formData.append("middleInitial", form.middleInitial || "");
    formData.append("lastName", form.lastName);
    formData.append("dob", form.dob);
    formData.append("sex", form.sex.toLowerCase());
    formData.append(
      "genderIdentity",
      GENDER_TO_BACKEND[form.genderIdentity] ?? form.genderIdentity ?? "",
    );
    formData.append("civilStatus", form.civilStatus);
    formData.append("preferredPronoun", resolvedPronoun || "");
    formData.append("contactNo", form.contactNo);
    formData.append("email", form.email);
    formData.append("address", form.address || "");

    if (form.password) {
      formData.append("password", form.password);
      formData.append("password_confirmation", form.confirmPassword);
    }

    if (profilePicFile) {
      // New image selected — attach the raw File
      formData.append("profilePicture", profilePicFile);
    } else if (profilePicRemoved) {
      // User clicked "Remove photo" — tell backend to clear it
      formData.append("removeProfilePicture", "1");
    }
    // If neither: no change to the picture, backend keeps existing value

    setSaving(true);
    try {
      // POST + _method=PUT because multipart doesn't work with axios PUT directly
      const response = await axiosClient.post("/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        onSave && onSave(response.data.data);
        onClose();
      }
    } catch (err) {
      if (err.response?.status === 422) {
        console.error(
          "422 Validation errors:",
          JSON.stringify(err.response.data, null, 2),
        );
        const laravelErrors = err.response.data.errors || {};
        const mapped = {};
        Object.keys(laravelErrors).forEach((key) => {
          const keyMap = { password_confirmation: "confirmPassword" };
          mapped[keyMap[key] || key] = laravelErrors[key][0];
        });
        setErrors(mapped);
      } else {
        console.error("Failed to save profile:", err);
        // Log more detail to help debug 500s
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="epm-overlay" onClick={onClose}>
      <div className="epm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="epm-header">
          <div
            className="epm-avatar-wrapper"
            onClick={() => fileInputRef.current.click()}
          >
            <ProfileAvatar
              firstName={form.firstName}
              lastName={form.lastName}
              profilePic={profilePicture}
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
            <p className="epm-subtitle">Update your personal information</p>
            {profilePicture && (
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

        {loading ? (
          <div
            className="epm-form"
            style={{ textAlign: "center", padding: "2rem" }}
          >
            <p className="text-muted">Loading your profile...</p>
          </div>
        ) : (
          <form className="epm-form" onSubmit={handleSubmit}>
            {/* ── Name Row ── */}
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

              <div className="epm-field">
                <label className="epm-label">Middle Initial</label>
                <input
                  className="epm-input"
                  type="text"
                  name="middleInitial"
                  placeholder="M.I."
                  value={form.middleInitial}
                  onChange={handleChange}
                />
                <span className="epm-helper">
                  Type <b>N/A</b> if you do not have a middle name
                </span>
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

            {/* ── DOB & Sex ── */}
            <div className="epm-row">
              <div className="epm-field">
                <label className="epm-label">
                  Date of Birth <span className="epm-req">*</span>
                </label>
                <input
                  className={`epm-input ${errors.dob ? "epm-input-error" : ""}`}
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                />
                {errors.dob && (
                  <span className="epm-error-msg">{errors.dob}</span>
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

            {/* ── Civil Status ── */}
            <div className="epm-field">
              <label className="epm-label">
                Civil Status <span className="epm-req">*</span>
              </label>
              <select
                className={`epm-input epm-select ${errors.civilStatus ? "epm-input-error" : ""}`}
                name="civilStatus"
                value={form.civilStatus}
                onChange={handleChange}
              >
                <option value="">Select Civil Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
                <option value="Separated">Separated</option>
              </select>
              {errors.civilStatus && (
                <span className="epm-error-msg">{errors.civilStatus}</span>
              )}
            </div>

            {/* ── Gender Identity ── */}
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

            {/* ── Preferred Pronouns ── */}
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

            {/* ── Contact No. ── */}
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

            {/* ── Email ── */}
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

            {/* ── Home Address ── */}
            <div className="epm-field">
              <label className="epm-label">Home Address</label>
              <textarea
                className="epm-input epm-textarea"
                name="address"
                placeholder="House No., Street, Barangay, City/Municipality, Province, ZIP Code"
                value={form.address}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* ── Change Password ── */}
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
                  <span className="epm-error-msg">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>

            <div className="epm-actions">
              <button
                type="button"
                className="epm-btn-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="epm-btn-save" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditProfileModal;

  import { useState, useRef, useEffect } from "react";
  import "../ClientStyle/EditProfileModal.css";
  import ProfileAvatar from "./ProfileAvatar";
  import { FaCamera } from "react-icons/fa";
  import axiosClient from "../../axiosClient";

  const PRONOUN_OPTIONS = [
    { label: "She/Her", value: "she_her" },
    { label: "He/Him", value: "he_him" },
    { label: "They/Them", value: "they_them" },
    { label: "Other (specify)", value: "other" },
  ];

  const GENDER_OPTIONS = [
    { label: "Woman", value: "female" },
    { label: "Man", value: "male" },
    { label: "Transgender", value: "transgender" },
    { label: "Trans woman", value: "trans_woman" },
    { label: "Trans man", value: "trans_man" },
    { label: "Non-binary", value: "non_binary" },
    { label: "Genderqueer", value: "genderqueer" },
    { label: "Gender fluid", value: "gender_fluid" },
    { label: "Agender", value: "agender" },
    { label: "Bigender", value: "bigender" },
    { label: "Two-spirit", value: "two_spirit" },
    { label: "Intersex", value: "intersex" },
    { label: "Pangender", value: "pangender" },
    { label: "Prefer not to say", value: "prefer_not" },
  ];

  const EMPTY_FORM = {
    firstName: "",
    middleInitial: "",
    lastName: "",
    civilStatus: "",
    dob: "",
    sex: "",
    genderIdentity: "",
    customGender: "",
    contactNo: "",
    email: "",
    preferredPronoun: "",
    customPronoun: "",
    address: "",
    password: "",
    confirmPassword: "",
    noMiddleName: false,
  };

  function EditProfileModal({ isOpen, onClose, onSave }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profilePic, setProfilePic] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
      if (!isOpen) return;

      setLoading(true);
      axiosClient
        .get("/me")
        .then((response) => {
          if (response.data.success) {
            const u = response.data.data;

            const isPresetGender = GENDER_OPTIONS.some(
              (g) => g.value === u.genderIdentity,
            );
            const isPresetPronoun = PRONOUN_OPTIONS.some(
              (p) => p.value === u.preferredPronoun,
            );

            setForm({
              firstName: u.firstName || "",
              middleInitial: u.middleInitial || "",
              lastName: u.lastName || "",
              civilStatus: u.civilStatus || "",
              dob: u.dob || "",
              sex: u.sex || "",
              genderIdentity: isPresetGender ? u.genderIdentity : "other",
              customGender: !isPresetGender ? u.genderIdentity : "",
              preferredPronoun: isPresetPronoun ? u.preferredPronoun : "other",
              customPronoun: !isPresetPronoun ? u.customPronoun || "" : "",
              contactNo: u.contactNo || "",
              email: u.email || "",
              address: u.address || "",
              password: "",
              confirmPassword: "",
              noMiddleName: !u.middleInitial,
            });

            setProfilePic(u.profilePic || "");
          }
        })
        .catch((err) => console.error("Failed to load profile:", err))
        .finally(() => setLoading(false));
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handlePronounChange = (e) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        preferredPronoun: value,
        customPronoun: value !== "other" ? "" : prev.customPronoun,
      }));
      setErrors((prev) => ({ ...prev, preferredPronoun: "" }));
    };

    const handleGenderChange = (e) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        genderIdentity: value,
        customGender: value !== "other" ? "" : prev.customGender,
      }));
    };

    const handleProfilePicChange = (e) => {
      const file = e.target.files[0];
      if (file) setProfilePic(URL.createObjectURL(file));
    };

    const handleRemovePhoto = () => {
      setProfilePic("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

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

    const handleSubmit = async (e) => {
      e.preventDefault();
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const payload = {
        firstName: form.firstName,
        middleInitial: form.noMiddleName ? null : form.middleInitial,
        lastName: form.lastName,
        dob: form.dob,
        sex: form.sex,
        genderIdentity:
          form.genderIdentity === "other"
            ? form.customGender
            : form.genderIdentity,
        civilStatus: form.civilStatus,
        preferredPronoun:
          form.preferredPronoun === "other" ? "other" : form.preferredPronoun,
        customPronoun:
          form.preferredPronoun === "other" ? form.customPronoun : null,
        contactNo: form.contactNo,
        email: form.email,
        address: form.address,
        ...(form.password && {
          password: form.password,
          password_confirmation: form.confirmPassword,
        }),
      };

      setSaving(true);
      try {
        const response = await axiosClient.put("/me", payload);
        if (response.data.success) {
          onSave && onSave(response.data.data);
          onClose();
        }
      } catch (err) {
        if (err.response?.status === 422) {
          const laravelErrors = err.response.data.errors || {};
          const mapped = {};
          Object.keys(laravelErrors).forEach((key) => {
            mapped[key] = laravelErrors[key][0];
          });
          setErrors(mapped);
        } else {
          console.error("Failed to save profile:", err);
        }
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="epm-overlay" onClick={onClose}>
        <div className="epm-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="epm-header">
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

          {loading ? (
            <div
              className="epm-form"
              style={{ textAlign: "center", padding: "2rem" }}
            >
              <p className="text-muted">Loading your profile...</p>
            </div>
          ) : (
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

                <div className="epm-field">
                  <label className="epm-label">Middle Initial</label>
                  <input
                    className="epm-input"
                    type="text"
                    name="middleInitial"
                    placeholder="M.I."
                    value={form.noMiddleName ? "" : form.middleInitial}
                    onChange={handleChange}
                    disabled={form.noMiddleName}
                    style={{ opacity: form.noMiddleName ? 0.5 : 1 }}
                  />
                  <label className="epm-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.noMiddleName || false}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          noMiddleName: e.target.checked,
                          middleInitial: e.target.checked
                            ? ""
                            : prev.middleInitial,
                        }))
                      }
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

              {/* DOB & Sex */}
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
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.sex && (
                    <span className="epm-error-msg">{errors.sex}</span>
                  )}
                </div>
              </div>

              {/* Civil Status */}
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

              {/* Gender Identity */}
              <div className="epm-field">
                <label className="epm-label">Gender Identity</label>
                <select
                  className="epm-input epm-select"
                  value={form.genderIdentity}
                  onChange={handleGenderChange}
                  name="genderIdentity"
                >
                  <option value="">Select gender identity...</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  <option value="other">Other (specify)</option>
                </select>
                {form.genderIdentity === "other" && (
                  <input
                    className="epm-input"
                    type="text"
                    name="customGender"
                    placeholder="Describe your gender identity..."
                    value={form.customGender || ""}
                    onChange={handleChange}
                    style={{ marginTop: "0.5rem" }}
                  />
                )}
              </div>

              {/* Preferred Pronouns */}
              <div className="epm-field">
                <label className="epm-label">Preferred Pronoun/s</label>
                <select
                  className="epm-input epm-select"
                  value={form.preferredPronoun}
                  onChange={handlePronounChange}
                >
                  <option value="">Select pronouns...</option>
                  {PRONOUN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {form.preferredPronoun === "other" && (
                  <input
                    className="epm-input"
                    type="text"
                    name="customPronoun"
                    placeholder="e.g. xe/xem, fae/faer..."
                    value={form.customPronoun}
                    onChange={handleChange}
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

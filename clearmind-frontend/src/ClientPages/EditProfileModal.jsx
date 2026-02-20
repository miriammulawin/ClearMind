import { useState } from "react";
import "./ClientStyle/EditProfileModal.css";

function EditProfileModal({ isOpen, onClose, userData, onSave }) {
  const [form, setForm] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    dateOfBirth: userData?.dateOfBirth || "",
    sex: userData?.sex || "",
    contactNo: userData?.contactNo || "",
    email: userData?.email || "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
    if (!form.sex) newErrors.sex = "Sex is required.";
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
    onSave(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="epm-overlay" onClick={onClose}>
      <div className="epm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="epm-header">
          <div className="epm-avatar">
            {form.firstName?.[0]?.toUpperCase() || ""}
            {form.lastName?.[0]?.toUpperCase() || ""}
          </div>
          <div>
            <h2 className="epm-title">Edit Profile</h2>
            <p className="epm-subtitle">Update your personal information</p>
          </div>
          <button className="epm-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="epm-form" onSubmit={handleSubmit}>
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

          <div className="epm-row">
            <div className="epm-field">
              <label className="epm-label">
                Date of Birth <span className="epm-req">*</span>
              </label>
              <div className="epm-input-icon-wrap">
                <input
                  className={`epm-input ${errors.dateOfBirth ? "epm-input-error" : ""}`}
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
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

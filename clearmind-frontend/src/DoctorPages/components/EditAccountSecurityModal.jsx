import { useState } from "react";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import "../DoctorStyle/Modal.css";

function EditAccountSecurityModal({ show, onClose, doctorData, onSave }) {
  const [formData, setFormData] = useState({
    email: doctorData?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});

  const toggleVisibility = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email.";
    if (formData.newPassword && formData.newPassword.length < 8)
      newErrors.newPassword = "New password must be at least 8 characters.";
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    )
      newErrors.confirmPassword = "Passwords do not match.";
    if (formData.newPassword && !formData.currentPassword)
      newErrors.currentPassword = "Please enter your current password.";
    return newErrors;
  };

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (onSave) onSave({ email: formData.email });
    onClose();
  };

  if (!show) return null;

  /* ── password strength ── */
  const strength =
    formData.newPassword.length >= 12
      ? { label: "✓ Strong password", color: "#16a34a" }
      : formData.newPassword.length >= 8
        ? { label: "⚠ Medium strength — try adding symbols", color: "#ca8a04" }
        : { label: "✗ Too short — minimum 8 characters", color: "#ef4444" };

  /* ── reusable password field ── */
  const renderPasswordField = (label, field, visKey) => (
    <div className="input-group">
      <p className="modal-label">{label}</p>
      <div style={{ position: "relative" }}>
        <input
          type={showPasswords[visKey] ? "text" : "password"}
          className="modal-input"
          style={{
            paddingRight: "44px",
            borderColor: errors[field] ? "#ef4444" : undefined,
            width: "100%",
            boxSizing: "border-box",
          }}
          value={formData[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={() => toggleVisibility(visKey)}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#7B4A50",
            fontSize: "16px",
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {showPasswords[visKey] ? <FiEye /> : <FiEyeOff />}
        </button>
      </div>
      {errors[field] && (
        <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
          {errors[field]}
        </span>
      )}
    </div>
  );

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div
        className="profile-modal-lg"
        style={{ maxWidth: "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="modal-header">
          <h2>Account Security</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX style={{ color: "#fff", fontSize: "20px" }} />
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          {/* Email */}
          <div className="modal-section">
            <h4>Account Details</h4>
            <div className="input-group">
              <p className="modal-label">Email Address</p>
              <input
                type="email"
                className="modal-input"
                style={{ borderColor: errors.email ? "#ef4444" : undefined }}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
              />
              {errors.email && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#ef4444",
                    marginTop: "4px",
                  }}
                >
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ position: "relative", margin: "4px 0 24px" }}>
            <div style={{ borderTop: "1px dashed #dcdfe3" }} />
            <span
              style={{
                position: "absolute",
                top: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#fff",
                padding: "0 12px",
                fontSize: "11px",
                color: "#9ca3af",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
              }}
            >
              Change Password
            </span>
          </div>

          {/* Password fields */}
          <div className="modal-section">
            <h4>Password</h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {renderPasswordField(
                "Current Password",
                "currentPassword",
                "current",
              )}
              {renderPasswordField("New Password", "newPassword", "newPass")}

              {/* Strength indicator */}
              {formData.newPassword && (
                <span
                  style={{
                    fontSize: "11px",
                    color: strength.color,
                    marginTop: "-8px",
                  }}
                >
                  {strength.label}
                </span>
              )}

              {renderPasswordField(
                "Confirm New Password",
                "confirmPassword",
                "confirm",
              )}

              {/* Match indicator */}
              {formData.confirmPassword &&
                !errors.confirmPassword &&
                formData.newPassword === formData.confirmPassword && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#16a34a",
                      marginTop: "-8px",
                    }}
                  >
                    ✓ Passwords match
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="btn-completed" onClick={handleSave}>
            Save 
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditAccountSecurityModal;

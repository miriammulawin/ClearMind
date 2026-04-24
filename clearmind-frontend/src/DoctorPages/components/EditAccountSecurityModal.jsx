import { useState, useEffect } from "react";
import {
  FiX,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiAlertCircle,
  FiLock,
} from "react-icons/fi";
import styles from "../DoctorStyle/Modal.module.css";
import toast from "react-hot-toast";
import axiosClient from "../../axiosClient"; // ✅ same as AccountSetupModal

// ... keep toastSuccess / toastError constants unchanged ...
const toastSuccess = {
  duration: 1500,
  style: {
    background: "#E2F7E3",
    border: "1px solid #91C793",
    color: "#2E7D32",
    fontWeight: 600,
    fontSize: "0.95rem",
    textAlign: "center",
    maxWidth: "320px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
  },
  iconTheme: { primary: "#2E7D32", secondary: "#E2F7E3" },
};

const toastError = {
  duration: 1500,
  style: {
    background: "#FDECEA",
    border: "1px solid #F5C6CB",
    color: "#C62828",
    fontWeight: 600,
    fontSize: "0.9rem",
    textAlign: "center",
    maxWidth: "320px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
  },
  iconTheme: { primary: "#C62828", secondary: "#FDECEA" },
};

function EditAccountSecurityModal({ show, onClose, doctorData, onSave }) {
  if (!show) return null;

  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  const [pwSubmitting, setPwSubmitting] = useState(false); // ✅ added

  useEffect(() => {
    if (doctorData && show) {
      setFormData({
        email: doctorData?.data?.email || doctorData?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [doctorData, show]);

  const toggleVisibility = (key) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // ✅ Same password validation as AccountSetupModal (PasswordStrength checks)
  const password = formData.newPassword || "";
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Uppercase letter (A–Z)", ok: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a–z)", ok: /[a-z]/.test(password) },
    { label: "Number (0–9)", ok: /\d/.test(password) },
    { label: "Special character (!@#…)", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const strengthColors = [
    "#e2d5f5",
    "#e53e3e",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#15803d",
  ];
  const strengthLabels = ["", "Too weak", "Weak", "Fair", "Good", "Strong"];

  // ✅ Matches handleChangePassword() in AccountSetupModal exactly
  const handleSave = async () => {
    if (!isValidEmail(formData.email)) {
      return toast.error("Invalid email format", toastError);
    }

    // Email-only update (no password fields filled)
    if (!formData.newPassword && !formData.currentPassword) {
      try {
        setPwSubmitting(true);
        await axiosClient.put("/doctor/change-password", {
          email: formData.email,
        });
        toast.success("Account updated successfully", toastSuccess);
        window.dispatchEvent(new Event("doctorProfileUpdated"));
        onSave?.();
        onClose();
      } catch (e) {
        const json = e.response?.data || {};
        toast.error(json.message || "Update failed", toastError);
      } finally {
        setPwSubmitting(false);
      }
      return;
    }

    // ✅ Same validation order as AccountSetupModal
    if (!formData.currentPassword) {
      return toast.error("Current password is required.", toastError);
    }
    if (!formData.newPassword) {
      return toast.error("New password is required.", toastError);
    }
    if (formData.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters.", toastError);
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match.", toastError);
    }

    try {
      setPwSubmitting(true);

      // ✅ Same endpoint + same payload field names as AccountSetupModal
      await axiosClient.put("/doctor/change-password", {
        current_password: formData.currentPassword,
        password: formData.newPassword,
        password_confirmation: formData.confirmPassword,
      });

      toast.success("Password changed successfully!", toastSuccess);
      window.dispatchEvent(new Event("doctorProfileUpdated"));
      setFormData((p) => ({
        ...p,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      onSave?.();
      onClose();
    } catch (e) {
      const json = e.response?.data || {};
      // ✅ Same error handling as AccountSetupModal
      if (json.errors) {
        const firstError = Object.values(json.errors)[0];
        toast.error(
          Array.isArray(firstError) ? firstError[0] : firstError,
          toastError,
        );
      } else {
        toast.error(
          json.message || `Error ${e.response?.status ?? "unknown"}`,
          toastError,
        );
      }
    } finally {
      setPwSubmitting(false);
    }
  };

  const renderPasswordField = (label, field, visKey) => (
    <div className={styles["input-group"]}>
      <p className={styles["modal-label"]}>{label}</p>
      <div style={{ position: "relative" }}>
        <input
          type={showPasswords[visKey] ? "text" : "password"}
          className={styles["modal-input"]}
          style={{ paddingRight: "44px" }}
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
            color: "#4d227c",
          }}
        >
          {showPasswords[visKey] ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles["profile-modal-overlay"]} onClick={onClose}>
      <div
        className={styles["profile-modal-lg"]}
        style={{ maxWidth: "520px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles["modal-header"]}>
          <h2>Account Security</h2>
          <button className={styles["close-btn"]} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles["modal-body"]}>
          {/* Email */}
          <div className={styles["modal-section"]}>
            <h4>Account Details</h4>
            <input
              type="email"
              className={styles["modal-input"]}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* Password */}
          <div className={styles["modal-section"]}>
            <h4>Change Password</h4>
            {renderPasswordField(
              "Current Password",
              "currentPassword",
              "current",
            )}
            <br></br>
            {renderPasswordField("New Password", "newPassword", "newPass")}

            {/* ✅ Same strength meter as AccountSetupModal */}
            {formData.newPassword && (
              <div style={{ marginTop: "8px" }}>
                <div
                  style={{ display: "flex", gap: "4px", marginBottom: "6px" }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      style={{
                        flex: 1,
                        height: "4px",
                        borderRadius: "2px",
                        background:
                          n <= score ? strengthColors[score] : "#e2d5f5",
                        transition: "background .3s",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: strengthColors[score],
                    marginBottom: "8px",
                  }}
                >
                  {strengthLabels[score]}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {checks.map((c) => (
                    <div
                      key={c.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11.5px",
                        color: c.ok ? "#15803d" : "#aaa",
                      }}
                    >
                      <FiCheck size={11} style={{ opacity: c.ok ? 1 : 0.3 }} />
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <br></br>
            {renderPasswordField(
              "Confirm New Password",
              "confirmPassword",
              "confirm",
            )}

            {/* ✅ Match indicator like AccountSetupModal */}
            {formData.newPassword && formData.confirmPassword && (
              <div
                style={{
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "6px",
                  color:
                    formData.newPassword === formData.confirmPassword
                      ? "#15803d"
                      : "#e53e3e",
                }}
              >
                {formData.newPassword === formData.confirmPassword ? (
                  <>
                    <FiCheck size={12} /> Passwords match
                  </>
                ) : (
                  <>
                    <FiAlertCircle size={12} /> Passwords do not match
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles["modal-footer"]}>
          <button
            className={styles["btn-completed"]}
            onClick={handleSave}
            disabled={pwSubmitting}
          >
            {pwSubmitting ? (
              "Saving…"
            ) : (
              <>
                <FiLock size={13} style={{ marginRight: 6 }} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditAccountSecurityModal;

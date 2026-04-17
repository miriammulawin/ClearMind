import { useState, useEffect } from "react";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import styles from "../DoctorStyle/Modal.module.css";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:8000/api";

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
    setShowPasswords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const isStrongPassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:"<>?\[\]\\;',./]).{6,}$/.test(
      password,
    );

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      if (!isValidEmail(formData.email)) {
        return toast.error("Invalid email format", toastError);
      }

      const payload = {
        email: formData.email,
      };

      if (formData.newPassword?.length > 0) {
        if (formData.newPassword !== formData.confirmPassword) {
          return toast.error("Passwords do not match", toastError);
        }

        if (!formData.currentPassword) {
          return toast.error("Current password required", toastError);
        }

        if (!isStrongPassword(formData.newPassword)) {
          return toast.error(
            "Password must contain 1 capital letter, 1 number, 1 special character, and 6+ characters",
            toastError,
          );
        }

        payload.current_password = formData.currentPassword;
        payload.password = formData.newPassword;
        payload.password_confirmation = formData.confirmPassword;
      }

      const res = await fetch(`${API_BASE}/doctor/account-security`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        return toast.error(data.message || "Update failed", toastError);
      }

      toast.success("Account updated successfully", toastSuccess);

      window.dispatchEvent(new Event("doctorProfileUpdated"));

      onSave?.(data);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Server error", toastError);
    }
  };

  const password = formData.newPassword || "";

  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+{}|:"<>?\[\]\\;',./]/.test(password);
  const hasMinLength = password.length >= 6;

  const strength = {
    hasUppercase,
    hasNumber,
    hasSpecialChar,
    hasMinLength,
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
          <div className={styles["modal-section"]}>
            <h4>Account Details</h4>
            <input
              type="email"
              className={styles["modal-input"]}
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className={styles["modal-section"]}>
            <h4>Change Password</h4>

            {renderPasswordField(
              "Current Password",
              "currentPassword",
              "current",
            )}
            {renderPasswordField("New Password", "newPassword", "newPass")}

            {formData.newPassword && (
              <div style={{ fontSize: "11px", marginTop: "6px" }}>
                <p
                  style={{
                    color: strength.hasUppercase ? "#16a34a" : "#ef4444",
                  }}
                >
                  {strength.hasUppercase ? "✓" : "✗"} At least 1 uppercase
                  letter
                </p>

                <p
                  style={{ color: strength.hasNumber ? "#16a34a" : "#ef4444" }}
                >
                  {strength.hasNumber ? "✓" : "✗"} At least 1 number
                </p>

                <p
                  style={{
                    color: strength.hasSpecialChar ? "#16a34a" : "#ef4444",
                  }}
                >
                  {strength.hasSpecialChar ? "✓" : "✗"} At least 1 special
                  character
                </p>

                <p
                  style={{
                    color: strength.hasMinLength ? "#16a34a" : "#ef4444",
                  }}
                >
                  {strength.hasMinLength ? "✓" : "✗"} Minimum 6 characters
                </p>
              </div>
            )}

            {renderPasswordField(
              "Confirm New Password",
              "confirmPassword",
              "confirm",
            )}
          </div>
        </div>

        <div className={styles["modal-footer"]}>
          <button className={styles["btn-completed"]} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditAccountSecurityModal;

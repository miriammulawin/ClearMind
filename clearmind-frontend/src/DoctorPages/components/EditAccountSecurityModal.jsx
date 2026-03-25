import { useState } from "react";
import { FiX, FiEye, FiEyeOff } from "react-icons/fi";
import styles from "../DoctorStyle/Modal.module.css";

function EditAccountSecurityModal({ show, onClose, doctorData, onSave }) {
  const [formData, setFormData] = useState({
    firstName: doctorData?.firstName || "",
    lastName: doctorData?.lastName || "",
    middleInitial: doctorData?.middleInitial || "",
    contactNumber: doctorData?.contactNumber || "",
    address: doctorData?.address || "",
    dateOfBirth: doctorData?.dateOfBirth || "",
    age: doctorData?.age || "",
    gender: doctorData?.gender || "",
    specialty: doctorData?.specialty || "",
    practicingSince: doctorData?.practicingSince || "",
    credentials: doctorData?.credentials || "",
    licenseNo: doctorData?.licenseNo || "",
    subspecialty: doctorData?.subspecialty || [],
    services: doctorData?.services || [],
    certifications: doctorData?.certifications || [],
    boardCertImages: doctorData?.certificateImages || [],
    idPictures: doctorData?.idImages || [],
  });

  const [boardIndex, setBoardIndex] = useState(0);
  const [idIndex, setIdIndex] = useState(0);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleAddItem = (field) =>
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));

  const handleRemoveItem = (field, index) =>
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email.";
    if (formData.newPassword && formData.newPassword.length < 8)
      newErrors.newPassword = "New password must be at least 8 characters.";
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (formData.newPassword && !formData.currentPassword)
      newErrors.currentPassword = "Please enter your current password.";
    return newErrors;
  };

  const handleSave = () => {
    onSave && onSave(formData);
    onClose();
  };

  if (!show) return null;

  const strength =
    formData.newPassword.length >= 12
      ? { label: "✓ Strong password", color: "#16a34a" }
      : formData.newPassword.length >= 8
        ? { label: "⚠ Medium strength — try adding symbols", color: "#ca8a04" }
        : { label: "✗ Too short — minimum 8 characters", color: "#ef4444" };

  const renderPasswordField = (label, field, visKey) => (
    <div className={styles["input-group"]}>
      <p className={styles["modal-label"]}>{label}</p>
      <div style={{ position: "relative" }}>
        <input
          type={showPasswords[visKey] ? "text" : "password"}
          className={styles["modal-input"]}
          style={{
            paddingRight: "44px",
            borderColor: errors[field] ? "#ef4444" : undefined,
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
            color: "#4d227c",
            fontSize: "16px",
            padding: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <FiPlus /> Add
        </button>
      </div>
    </div>
  );

  const renderCarousel = (field, index, setIndex, label) => (
    <div className={styles["modal-section"]}>
      <h4>{label}</h4>
      <div className={styles["carousel-box"]}>
        {formData[field].length > 0 && formData[field][index] ? (
          <img src={formData[field][index]} alt="" />
        ) : (
          <span>No Images</span>
        )}
        {formData[field].length > 0 && (
          <>
            <button
              className={`${styles["carousel-btn"]} ${styles["left"]}`}
              onClick={() => prevImage(field, setIndex, index)}
            >
              <FiChevronLeft />
            </button>
            <button
              className={`${styles["carousel-btn"]} ${styles["right"]}`}
              onClick={() => nextImage(field, setIndex, index)}
            >
              <FiChevronRight />
            </button>
            <label
              className={`${styles["carousel-btn"]} ${styles["edit"]}`}
              style={{ cursor: "pointer" }}
            >
              <FiEdit />
              <input
                type="file"
                hidden
                onChange={(e) =>
                  handleImageChange(field, index, e.target.files[0])
                }
              />
            </label>
            <button
              className={`${styles["carousel-btn"]} ${styles["delete"]}`}
              style={{
                bottom: "10px",
                right: "10px",
                top: "auto",
                transform: "none",
              }}
              onClick={() => handleRemoveImage(field, index, setIndex)}
            >
              <FiTrash2 />
            </button>
          </>
        )}
      </div>
      <button
        onClick={() => handleAddImage(field, setIndex)}
        className={styles["add-btn"]}
        style={{ marginTop: "12px" }}
      >
        <FiPlus /> Add Image
      </button>
    </div>
  );

  return (
    <div className={styles["profile-modal-overlay"]} onClick={onClose}>
      <div
        className={styles["profile-modal-lg"]}
        style={{ maxWidth: "520px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={styles["modal-header"]}>
          <h2>Account Security</h2>
          <button className={styles["close-btn"]} onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* BODY */}
        <div className={styles["modal-body"]}>

          {/* Email section */}
          <div className={styles["modal-section"]}>
            <h4>Account Details</h4>
            <div className={styles["input-group"]}>
              <p className={styles["modal-label"]}>Email Address</p>
              <input
                type="email"
                className={styles["modal-input"]}
                style={{ borderColor: errors.email ? "#ef4444" : undefined }}
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
              />
              {errors.email && (
                <span style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px" }}>
                  {errors.email}
                </span>
              )}
            </div>
          </div>

          {/* Password section */}
          <div className={styles["modal-section"]}>
            <h4>Change Password</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {renderPasswordField("Current Password", "currentPassword", "current")}
              {renderPasswordField("New Password", "newPassword", "newPass")}

              {formData.newPassword && (
                <span style={{ fontSize: "11px", color: strength.color, marginTop: "-6px" }}>
                  {strength.label}
                </span>
              )}

              {renderPasswordField("Confirm New Password", "confirmPassword", "confirm")}

              {formData.confirmPassword &&
                !errors.confirmPassword &&
                formData.newPassword === formData.confirmPassword && (
                  <span style={{ fontSize: "11px", color: "#16a34a", marginTop: "-6px" }}>
                    ✓ Passwords match
                  </span>
                )}
            </div>
          </div>

          {renderCarousel(
            "boardCertImages",
            boardIndex,
            setBoardIndex,
            "Board Certifications",
          )}
          {renderCarousel("idPictures", idIndex, setIdIndex, "ID Cards")}
          {renderDynamicField("subspecialty", "Subspecialty")}
          {renderDynamicField("services", "Services")}
          {renderDynamicField("certifications", "Certifications")}
        </div>

        {/* FOOTER */}
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
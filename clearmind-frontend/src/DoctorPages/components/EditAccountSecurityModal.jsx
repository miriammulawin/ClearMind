import { useState } from "react";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
} from "react-icons/fi";
import styles from "../DoctorStyle/Modal.module.css";

function EditPersonalInfoModal({ show, onClose, doctorData, onSave }) {
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

  const handleImageChange = (field, index, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const updated = [...formData[field]];
      updated[index] = reader.result;
      setFormData((prev) => ({ ...prev, [field]: updated }));
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleAddImage = (field, setIndex) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], null] }));
    setIndex(formData[field].length);
  };

  const handleRemoveImage = (field, index, setIndex) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: updated }));
    setIndex((prev) => Math.max(0, prev - 1));
  };

  const prevImage = (field, setIndex, currentIndex) =>
    setIndex(
      currentIndex === 0 ? formData[field].length - 1 : currentIndex - 1,
    );

  const nextImage = (field, setIndex, currentIndex) =>
    setIndex(
      currentIndex === formData[field].length - 1 ? 0 : currentIndex + 1,
    );

  const handleSave = () => {
    onSave && onSave(formData);
    onClose();
  };

  if (!show) return null;

  const renderDynamicField = (field, label) => (
    <div className={styles["modal-section"]}>
      <h4>{label}</h4>
      <div className={styles["dynamic-box"]}>
        {formData[field].map((item, i) => (
          <div key={i} className={styles["dynamic-item"]}>
            <span className={styles["dot"]} />
            <input
              type="text"
              className={styles["modal-input"]}
              value={item}
              onChange={(e) => {
                const updated = [...formData[field]];
                updated[i] = e.target.value;
                handleChange(field, updated);
              }}
            />
            <button
              onClick={() => handleRemoveItem(field, i)}
              className={`${styles["icon-btn"]} ${styles["delete"]}`}
            >
              <FiTrash2 />
            </button>
          </div>
        ))}
        <button
          onClick={() => handleAddItem(field)}
          className={styles["add-btn"]}
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
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className={styles["modal-header"]}>
          <h2>Edit Personal Information</h2>
          <button className={styles["close-btn"]} onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* BODY */}
        <div className={styles["modal-body"]}>
          {/* Personal Information section */}
          <div className={styles["modal-section"]}>
            <h4>Personal Information</h4>

            <div className={styles["grid-3"]}>
              {["First Name", "Last Name", "Middle Initial"].map((label, i) => {
                const keys = ["firstName", "lastName", "middleInitial"];
                return (
                  <div key={i} className={styles["input-group"]}>
                    <p className={styles["modal-label"]}>{label}</p>
                    <input
                      className={styles["modal-input"]}
                      value={formData[keys[i]]}
                      onChange={(e) => handleChange(keys[i], e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            <div className={styles["grid-2"]}>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>Credentials</p>
                <input
                  className={styles["modal-input"]}
                  value={formData.credentials}
                  onChange={(e) => handleChange("credentials", e.target.value)}
                />
              </div>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>License Number</p>
                <input
                  className={styles["modal-input"]}
                  value={formData.licenseNo}
                  onChange={(e) => handleChange("licenseNo", e.target.value)}
                />
              </div>
            </div>

            <div className={styles["grid-4"]}>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>Contact Number</p>
                <input
                  className={styles["modal-input"]}
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handleChange("contactNumber", e.target.value)
                  }
                />
              </div>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>Age</p>
                <input
                  className={styles["modal-input"]}
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                />
              </div>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>Gender</p>
                <select
                  className={styles["modal-input"]}
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>Date of Birth</p>
                <input
                  type="date"
                  className={styles["modal-input"]}
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </div>
            </div>

            <div className={styles["grid-1"]}>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>Address</p>
                <input
                  className={styles["modal-input"]}
                  placeholder="Street, Barangay, City, Province"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
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

export default EditPersonalInfoModal;

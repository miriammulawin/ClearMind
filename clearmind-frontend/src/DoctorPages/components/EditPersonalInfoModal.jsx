import { useState, useEffect } from "react";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
} from "react-icons/fi";
import toast from "react-hot-toast";
import styles from "../DoctorStyle/Modal.module.css";

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

const isValidContact = (value) => /^09\d{9}$/.test(value);
const isNumericOnly = (value) => /^\d+$/.test(value);

const isValidFile = (file) => {
  if (!file) return false;
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  return allowed.includes(file.type);
};

const calculateAge = (dob) => {
  const today = new Date();
  const birth = new Date(dob);

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

function EditPersonalInfoModal({ show, onClose, doctorData, onSave }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    contactNumber: "",
    address: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    specialty: "",
    practicingSince: "",
    credentials: "",
    licenseNo: "",
    prcNumber: "",
    subspecialty: [],
    services: [],
    certifications: [],
    boardCertImages: [],
    idPictures: [],
  });

  const [boardIndex, setBoardIndex] = useState(0);
  const [idIndex, setIdIndex] = useState(0);
  const originalData = doctorData || {};

  useEffect(() => {
    if (!doctorData) return;
    setFormData({
      firstName: doctorData.firstName || "",
      lastName: doctorData.lastName || "",
      middleInitial: doctorData.middleInitial || "",
      contactNumber: doctorData.contactNumber || "",
      address: doctorData.address || "",
      dateOfBirth: doctorData.dateOfBirth || "",
      age: doctorData.age || "",
      gender: doctorData.gender || "",
      specialty: doctorData.specialty || "",
      practicingSince: doctorData.practicingSince || "",
      credentials: doctorData.credentials || "",
      licenseNo: doctorData.licenseNo || "",
      prcNumber: doctorData.prcNumber || "",
      subspecialty: doctorData.subspecialty || [],
      services: doctorData.services || [],
      certifications: doctorData.certifications || [],
      boardCertImages: doctorData.certificateImages || [],
      idPictures: doctorData.idImages || [],
    });
  }, [doctorData, show]); // 👈 added `show` so it re-syncs when modal opens

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
    setFormData((prev) => {
      const updated = [...(prev[field] || []), null];
      setIndex(updated.length - 1);
      return { ...prev, [field]: updated };
    });
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

  const handleDOBChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      dateOfBirth: value,
      age: calculateAge(value),
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      // VALIDATION
      if (
        formData.contactNumber &&
        formData.contactNumber !== originalData.contactNumber
      ) {
        if (!isValidContact(formData.contactNumber)) {
          toast.error(
            "Contact number must start with 09 and be 11 digits.",
            toastError,
          );
          return;
        }
      }

      if (formData.licenseNo && formData.licenseNo !== originalData.licenseNo) {
        if (!isNumericOnly(formData.licenseNo)) {
          toast.error("License Number must be numbers only.", toastError);
          return;
        }
      }

      if (formData.prcNumber && formData.prcNumber !== originalData.prcNumber) {
        if (!isNumericOnly(formData.prcNumber)) {
          toast.error("PRC Number must be numbers only.", toastError);
          return;
        }
      }

      const newBoardFile = formData.boardCertImages?.[boardIndex];

      if (newBoardFile && !isValidFile(newBoardFile)) {
        toast.error("Invalid Board Certification file type.", toastError);
        return;
      }

      const newIdFile = formData.idPictures?.[idIndex];

      if (newIdFile && !isValidFile(newIdFile)) {
        toast.error("Invalid ID Card file type.", toastError);
        return;
      }
      const userPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleInitial: formData.middleInitial,
        contactNo: formData.contactNumber,
        address: formData.address,
        gender: formData.gender,
        dob: formData.dateOfBirth,
        age: formData.age,
        email: originalData.email,
      };

      const doctorPayload = {
        professional_title: formData.credentials,
        license_number: formData.licenseNo,
        prc_number: formData.prcNumber,
        main_specialty: formData.specialty,
        practicing_since: formData.practicingSince,
        sub_specializations: formData.subspecialty,
        services: formData.services,
        board_cert_names: formData.certifications,
      };

      if (!token) {
        toast.error("Session expired. Please login again.", toastError);
        return;
      }

      // ── 1. UPDATE USER ─────────────────────
      const userRes = await fetch("http://localhost:8000/api/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userPayload),
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        console.log("USER ERROR:", userData);
        toast.error(userData.message || "User update failed", toastError);
        return;
      }

      // ── 2. UPDATE DOCTOR ───────────────────
      const doctorRes = await fetch(
        "http://localhost:8000/api/doctor/update-doctor",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(doctorPayload),
        },
      );

      const doctorData = await doctorRes.json();

      if (!doctorRes.ok) {
        console.log("DOCTOR ERROR:", doctorData);
        toast.error(doctorData.message || "Doctor update failed", toastError);
        return;
      }

      toast.success("Profile updated successfully!", toastSuccess);

      onSave?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.", toastError);
    }
  };

  // ✅ Guard: don't render anything if show is false
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
        {formData[field]?.length > 0 && formData[field][index] ? (
          <img src={formData[field][index]} alt="" />
        ) : (
          <span>No Images</span>
        )}
        {formData[field]?.length > 0 && (
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
                <p className={styles["modal-label"]}>PRC License</p>
                <input
                  className={styles["modal-input"]}
                  value={formData.licenseNo}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d+$/.test(value)) {
                      handleChange("licenseNo", value);
                    }
                  }}
                />
              </div>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>PRC Number</p>
                <input
                  className={styles["modal-input"]}
                  value={formData.prcNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || isNumericOnly(value)) {
                      handleChange("prcNumber", value);
                    }
                  }}
                />
              </div>
            </div>

            {/* ✅ Added missing specialty + practicingSince fields */}
            <div className={styles["grid-2"]}>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>Specialty</p>
                <input
                  className={styles["modal-input"]}
                  value={formData.specialty}
                  onChange={(e) => handleChange("specialty", e.target.value)}
                />
              </div>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>Practicing Since</p>
                <input
                  type="number"
                  className={styles["modal-input"]}
                  value={formData.practicingSince}
                  onChange={(e) =>
                    handleChange("practicingSince", e.target.value)
                  }
                />
              </div>
            </div>

            <div className={styles["grid-4"]}>
              <div className={styles["input-group"]}>
                <p className={styles["modal-label"]}>Contact Number</p>
                <input
                  className={styles["modal-input"]}
                  value={formData.contactNumber}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, ""); // numbers only

                    if (value.length <= 11) {
                      handleChange("contactNumber", value);
                    }
                  }}
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
                  onChange={handleDOBChange}
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

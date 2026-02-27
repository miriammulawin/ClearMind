import { useState } from "react";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
} from "react-icons/fi";
import "./DoctorStyle/Modal.css";

/* ── Shared button style matching the "+ Add Schedule" reference image ── */
const addBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 18px",
  backgroundColor: "#7B4A50",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  marginTop: "8px",
  transition: "background-color 0.2s",
};

/* Icon colours depending on context */
const iconClose = { color: "#fff", fontSize: "18px", fontWeight: "bold" }; // red for list delete
const iconCarouselAction = { color: "#fff", fontSize: "16px" }; // dark for carousel edit/delete
const iconEdit = { color: "#fff", fontSize: "16px" };
const iconNav = { color: "#fff", fontSize: "18px" };

function EditPersonalInfoModal({ show, onClose, doctorData, onSave }) {
  const [formData, setFormData] = useState({
    firstName: doctorData?.firstName || "",
    lastName: doctorData?.lastName || "",
    middleInitial: doctorData?.middleInitial || "",
    contactNumber: doctorData?.contactNumber || "",
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

  /* ─── Dynamic field ─── */
  const renderDynamicField = (field, label) => (
    <div className="modal-section">
      <h4>{label}</h4>
      <div className="dynamic-box">
        {formData[field].map((item, i) => (
          <div key={i} className="dynamic-item">
            <span className="dot" />
            <input
              type="text"
              className="modal-input"
              value={item}
              onChange={(e) => {
                const updated = [...formData[field]];
                updated[i] = e.target.value;
                handleChange(field, updated);
              }}
            />
            <button
              onClick={() => handleRemoveItem(field, i)}
              className="icon-btn delete"
            >
              <FiTrash2 />
            </button>
          </div>
        ))}
        <button onClick={() => handleAddItem(field)} className="add-btn">
          <FiPlus /> Add
        </button>
      </div>
    </div>
  );

  /* ─── Carousel ─── */
  const renderCarousel = (field, index, setIndex, label) => (
    <div className="modal-section">
      <h4>{label}</h4>

      <div className="carousel-box">
        {formData[field].length > 0 && formData[field][index] ? (
          <img src={formData[field][index]} alt="" />
        ) : (
          <span>No Images</span>
        )}

        {formData[field].length > 0 && (
          <>
            <button
              className="carousel-btn left"
              onClick={() => prevImage(field, setIndex, index)}
            >
              <FiChevronLeft style={iconNav} />
            </button>
            <button
              className="carousel-btn right"
              onClick={() => nextImage(field, setIndex, index)}
            >
              <FiChevronRight style={iconNav} />
            </button>

            <label className="carousel-btn edit" style={{ cursor: "pointer" }}>
              <FiEdit style={iconEdit} />
              <input
                type="file"
                hidden
                onChange={(e) =>
                  handleImageChange(field, index, e.target.files[0])
                }
              />
            </label>

            <button
              className="carousel-btn delete"
              onClick={() => handleRemoveImage(field, index, setIndex)}
            >
              <FiTrash2 style={iconCarouselAction} />
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => handleAddImage(field, setIndex)}
        className="add-btn"
      >
        <FiPlus /> Add Image
      </button>
    </div>
  );

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="modal-header">
          <h2>Edit Personal Information</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX style={iconClose} />
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          <div className="modal-section">
            <h4>Personal Information</h4>

            <div className="grid-3">
              {["First Name", "Last Name", "Middle Initial"].map((label, i) => {
                const keys = ["firstName", "lastName", "middleInitial"];
                return (
                  <div key={i} className="input-group">
                    <p className="modal-label">{label}</p>
                    <input
                      className="modal-input"
                      value={formData[keys[i]]}
                      onChange={(e) => handleChange(keys[i], e.target.value)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="grid-2">
              <div className="input-group">
                <p className="modal-label">Credentials</p>
                <input
                  className="modal-input"
                  value={formData.credentials}
                  onChange={(e) => handleChange("credentials", e.target.value)}
                />
              </div>

              <div className="input-group">
                <p className="modal-label">License Number</p>
                <input
                  className="modal-input"
                  value={formData.licenseNo}
                  onChange={(e) => handleChange("licenseNo", e.target.value)}
                />
              </div>
            </div>

            <div className="grid-4">
              <div className="input-group">
                <p className="modal-label">Contact Number</p>
                <input
                  className="modal-input"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handleChange("contactNumber", e.target.value)
                  }
                />
              </div>

              <div className="input-group">
                <p className="modal-label">Age</p>
                <input
                  className="modal-input"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                />
              </div>

              <div className="input-group">
                <p className="modal-label">Gender</p>
                <select
                  className="modal-input"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="input-group">
                <p className="modal-label">Date of Birth</p>
                <input
                  type="date"
                  className="modal-input"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
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
        <div className="modal-footer">
          <button className="btn-completed" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPersonalInfoModal;

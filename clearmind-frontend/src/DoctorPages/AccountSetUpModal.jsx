import { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

function AccountSetupModal({ showModal, onClose, onComplete }) {
  const [formData, setFormData] = useState({
    profilePicture: null,
    description: "",
    professionalTitle: "",
    yearsOfExperience: "",
    licenseNumber: "",
    specialization: "",
    subSpecialization: "",
    boardCertificate: "",
    myServices: "",
    certificateImage: null,
  });

  const [specializationList, setSpecializationList] = useState([]);
  const [subSpecializationList, setSubSpecializationList] = useState([]);
  const [boardCertificateList, setBoardCertificateList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError(null);
  };

  const handleFileChange = (field, file) => {
    setFormData({ ...formData, [field]: file });
  };

  const addToList = (field, listSetter, currentList) => {
    if (formData[field].trim()) {
      listSetter([...currentList, formData[field].trim()]);
      setFormData({ ...formData, [field]: "" });
    }
  };

  const removeFromList = (listSetter, currentList, index) => {
    const newList = currentList.filter((_, i) => i !== index);
    listSetter(newList);
  };

  const handleUpload = async () => {
    // Validation
    if (!formData.professionalTitle.trim()) {
      setError("Professional title is required");
      return;
    }
    if (!formData.yearsOfExperience.trim() || isNaN(formData.yearsOfExperience)) {
      setError("Valid years of experience is required");
      return;
    }
    if (!formData.licenseNumber.trim()) {
      setError("License number is required");
      return;
    }
    if (specializationList.length === 0) {
      setError("At least one specialization is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = new FormData();

      if (formData.profilePicture) data.append("profile_pic", formData.profilePicture);
      if (formData.certificateImage) data.append("cert_image", formData.certificateImage);

      data.append("description", formData.description);
      data.append("professional_title", formData.professionalTitle);
      data.append("years_of_experience", formData.yearsOfExperience);
      data.append("license_number", formData.licenseNumber);

      specializationList.forEach((item) => data.append("specialization[]", item));
      subSpecializationList.forEach((item) => data.append("sub_spec_id[]", item));
      boardCertificateList.forEach((item) => data.append("board_cert_id[]", item));
      servicesList.forEach((item) => data.append("service_id[]", item));

      const response = await fetch(
        "http://localhost/ClearMind/clearmind-backend/setup_doctor_profile.php",
        {
          method: "POST",
          body: data,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Profile updated successfully!", {
          duration: 1500,
          position: "top-center",
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
        });
        
        // Pass updated profile data back to parent component - NO REFRESH NEEDED!
        if (onComplete) {
          const profileData = {
            description: formData.description,
            professionalTitle: formData.professionalTitle,
            yearsOfExperience: formData.yearsOfExperience,
            licenseNumber: formData.licenseNumber,
            specialization: result.data?.specializations || specializationList,
            subSpecialization: result.data?.sub_specializations || subSpecializationList,
            boardCertificate: result.data?.board_certificates || boardCertificateList,
            services: result.data?.services || servicesList,
            profilePicture: result.data?.profile_pic_path || null,
            certificateImage: result.data?.certificate_path || null,
          };
          onComplete(profileData);
        }
        
        onClose();
      } else {
        setError(result.message || (result.errors ? result.errors.join(", ") : "Failed to update profile"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => onClose();

  if (!showModal) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-2"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div
        className="bg-white d-flex flex-column"
        style={{
          width: "95%",
          maxWidth: "800px",
          height: "90vh",
          maxHeight: "900px",
          borderRadius: "24px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="position-relative px-4 py-3 border-bottom flex-shrink-0"
          style={{ borderTopLeftRadius: "24px", borderTopRightRadius: "24px", backgroundColor: "#fff" }}
        >
          <h3 className="m-0 fw-bold text-center" style={{ color: "#4D227C" }}>
            Account Setup
          </h3>
          <button
            type="button"
            className="btn btn-link text-secondary p-1 position-absolute"
            style={{ top: "12px", right: "12px", fontSize: "24px" }}
            onClick={onClose}
            disabled={isLoading}
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 flex-grow-1" style={{ overflowY: "auto" }}>
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
            </div>
          )}

          <div className="row g-3">
            {/* Profile Picture */}
            <FileInput
              label="Profile Picture"
              file={formData.profilePicture}
              onFileChange={(file) => handleFileChange("profilePicture", file)}
              isLoading={isLoading}
            />

            {/* Certificate */}
            <FileInput
              label="Certificate Image"
              file={formData.certificateImage}
              onFileChange={(file) => handleFileChange("certificateImage", file)}
              isLoading={isLoading}
            />

            {/* Description */}
            <div className="col-12">
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", minHeight: "60px", resize: "none" }}
                disabled={isLoading}
              />
            </div>

            {/* Professional Title */}
            <div className="col-12">
              <input
                type="text"
                placeholder="Professional Title *"
                value={formData.professionalTitle}
                onChange={(e) => handleInputChange("professionalTitle", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
                disabled={isLoading}
              />
            </div>

            {/* Years of Experience and License Number */}
            <div className="col-12 col-sm-6">
              <input
                type="number"
                placeholder="Years of Experience *"
                value={formData.yearsOfExperience}
                onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
                min="0"
                max="70"
                disabled={isLoading}
              />
            </div>
            <div className="col-12 col-sm-6">
              <input
                type="text"
                placeholder="License Number *"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
                disabled={isLoading}
              />
            </div>

            {/* Specialization Lists */}
            <ListInput
              label="Specialization *"
              value={formData.specialization}
              onChange={(val) => handleInputChange("specialization", val)}
              list={specializationList}
              add={() => addToList("specialization", setSpecializationList, specializationList)}
              remove={(i) => removeFromList(setSpecializationList, specializationList, i)}
              isLoading={isLoading}
            />

            <ListInput
              label="Sub-specialization"
              value={formData.subSpecialization}
              onChange={(val) => handleInputChange("subSpecialization", val)}
              list={subSpecializationList}
              add={() => addToList("subSpecialization", setSubSpecializationList, subSpecializationList)}
              remove={(i) => removeFromList(setSubSpecializationList, subSpecializationList, i)}
              isLoading={isLoading}
            />

            <ListInput
              label="Board Certificate"
              value={formData.boardCertificate}
              onChange={(val) => handleInputChange("boardCertificate", val)}
              list={boardCertificateList}
              add={() => addToList("boardCertificate", setBoardCertificateList, boardCertificateList)}
              remove={(i) => removeFromList(setBoardCertificateList, boardCertificateList, i)}
              isLoading={isLoading}
            />

            <ListInput
              label="My Services"
              value={formData.myServices}
              onChange={(val) => handleInputChange("myServices", val)}
              list={servicesList}
              add={() => addToList("myServices", setServicesList, servicesList)}
              remove={(i) => removeFromList(setServicesList, servicesList, i)}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-center px-4 py-3 border-top flex-shrink-0 position-relative">
          <button
            type="button"
            className="btn text-white fw-semibold px-4 py-2"
            style={{ backgroundColor: "#4D227C", borderRadius: "12px" }}
            onClick={handleUpload}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </button>
          <button
            type="button"
            className="btn btn-link text-decoration-none position-absolute"
            style={{ right: "20px", color: "#4D227C" }}
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountSetupModal;

// ================== Helper Components ==================

const FileInput = ({ label, file, onFileChange, isLoading }) => {
  const inputId = label.replace(/\s+/g, "") + "Input";
  return (
    <div className="col-12">
      <div className="position-relative">
        <input
          type="text"
          placeholder={`Upload ${label}`}
          readOnly
          value={file ? file.name : ""}
          className="form-control"
          style={{ borderRadius: "12px", paddingRight: "90px", height: "40px" }}
        />
        <input
          type="file"
          accept="image/*"
          id={inputId}
          className="d-none"
          onChange={(e) => onFileChange(e.target.files[0])}
        />
        <button
          type="button"
          className="btn position-absolute"
          style={{ backgroundColor: "#C4B5D6", top: "0", right: "0", height: "40px", borderRadius: "0 12px 12px 0", border: "none", padding: "0 15px" }}
          onClick={() => document.getElementById(inputId).click()}
          disabled={isLoading}
        >
          Browse
        </button>
      </div>
    </div>
  );
};

const ListInput = ({ label, value, onChange, list, add, remove, isLoading }) => (
  <div className="col-12">
    <div className="d-flex gap-2">
      <input
        type="text"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        className="form-control"
        style={{ borderRadius: "12px", height: "40px" }}
        disabled={isLoading}
      />
      <button
        type="button"
        className="btn text-white flex-shrink-0 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#4D227C", width: "40px", height: "40px", borderRadius: "12px" }}
        onClick={add}
        disabled={isLoading}
      >
        <FiPlus size={18} />
      </button>
    </div>
    {list.length > 0 && (
      <div className="mt-2 d-flex flex-wrap gap-2">
        {list.map((item, i) => (
          <span
            key={i}
            className="badge d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: "#4D227C", padding: "6px 12px", fontSize: "0.9rem", fontWeight: "400" }}
          >
            {item}
            <button
              type="button"
              onClick={() => remove(i)}
              style={{ 
                background: "none", 
                border: "none", 
                color: "white", 
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0",
                lineHeight: "1"
              }}
              aria-label="Remove"
            >
              <FiX size={16} strokeWidth={2} />
            </button>
          </span>
        ))}
      </div>
    )}
  </div>
);
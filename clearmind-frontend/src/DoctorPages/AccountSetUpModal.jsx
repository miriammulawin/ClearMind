import { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";

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
      
      if (formData.profilePicture) {
        data.append('profile_pic', formData.profilePicture);
      }
      if (formData.certificateImage) {
        data.append('cert_image', formData.certificateImage);
      }

      data.append('description', formData.description);
      data.append('professional_title', formData.professionalTitle);
      data.append('years_of_experience', formData.yearsOfExperience);
      data.append('license_number', formData.licenseNumber);

      specializationList.forEach(item => {
        data.append('specialization[]', item);
      });

      subSpecializationList.forEach(item => {
        data.append('sub_spec_id[]', item);
      });

      boardCertificateList.forEach(item => {
        data.append('board_cert_id[]', item);
      });

      servicesList.forEach(item => {
        data.append('service_id[]', item);
      });

      // UPDATE THIS URL TO YOUR ACTUAL PATH
      const response = await fetch('http://localhost/ClearMind/clearmind-backend/setup_doctor_profile.php', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Success:', result);
        alert('Profile updated successfully!');
        
        if (onComplete) {
          onComplete();
        }
        
        onClose();
      } else {
        setError(result.message || 'Failed to update profile');
        if (result.errors) {
          setError(result.errors.join(', '));
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!showModal) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-2 p-sm-3"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1050,
      }}
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
        {/* Header - Fixed */}
        <div
          className="position-relative px-3 px-sm-4 py-3 border-bottom flex-shrink-0"
          style={{
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            backgroundColor: "#fff",
          }}
        >
          <h3
            className="m-0 fw-bold text-center"
            style={{ color: "#4D227C", paddingTop: "12px", fontSize: "clamp(1.25rem, 4vw, 1.75rem)" }}
          >
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

        {/* Body - Scrollable */}
        <div 
          className="px-3 px-sm-4 py-3 flex-grow-1" 
          style={{ 
            overflowY: "auto",
            overflowX: "hidden"
          }}
        >
          {/* Error Display */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError(null)}
                aria-label="Close"
              ></button>
            </div>
          )}

          <div className="row g-3">
            {/* Profile Picture Upload */}
            <div className="col-12">
              <div className="position-relative">
                <input
                  type="text"
                  placeholder="Upload Profile Picture"
                  readOnly
                  value={formData.profilePicture ? formData.profilePicture.name : ""}
                  className="form-control"
                  style={{
                    borderColor: "#d1d5db",
                    borderRadius: "12px",
                    paddingRight: "90px",
                    height: "40px",
                    fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("profilePicture", e.target.files[0])}
                  className="d-none"
                  id="profilePictureInput"
                />
                <button
                  type="button"
                  className="btn position-absolute"
                  style={{
                    backgroundColor: "#C4B5D6",
                    color: "#000000",
                    top: "0",
                    right: "0",
                    height: "40px",
                    borderRadius: "0 12px 12px 0",
                    border: "none",
                    padding: "0 15px",
                    fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  }}
                  onClick={() => document.getElementById("profilePictureInput").click()}
                  disabled={isLoading}
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="col-12">
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="form-control"
                style={{ 
                  borderColor: "#d1d5db", 
                  borderRadius: "12px", 
                  minHeight: "60px",
                  resize: "none",
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                }}
                rows="2"
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
                style={{ 
                  borderColor: "#d1d5db", 
                  borderRadius: "12px", 
                  height: "40px",
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                }}
                required
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
                style={{ 
                  borderColor: "#d1d5db", 
                  borderRadius: "12px", 
                  height: "40px",
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                }}
                required
                disabled={isLoading}
                min="0"
                max="70"
              />
            </div>
            <div className="col-12 col-sm-6">
              <input
                type="text"
                placeholder="License Number *"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                className="form-control"
                style={{ 
                  borderColor: "#d1d5db", 
                  borderRadius: "12px", 
                  height: "40px",
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                }}
                required
                disabled={isLoading}
              />
            </div>

            {/* Specialization */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Specialization *"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange("specialization", e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToList("specialization", setSpecializationList, specializationList);
                    }
                  }}
                  className="form-control"
                  style={{ 
                    borderColor: "#d1d5db", 
                    borderRadius: "12px", 
                    height: "40px",
                    fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  }}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn text-white flex-shrink-0"
                  style={{
                    backgroundColor: "#4D227C",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => addToList("specialization", setSpecializationList, specializationList)}
                  disabled={isLoading}
                >
                  <FiPlus size={18} />
                </button>
              </div>
              {specializationList.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {specializationList.map((item, index) => (
                    <span
                      key={index}
                      className="badge d-inline-flex align-items-center gap-2"
                      style={{ 
                        backgroundColor: "#4D227C", 
                        fontSize: "clamp(0.813rem, 2vw, 0.938rem)", 
                        padding: "6px 12px",
                        fontWeight: "400",
                      }}
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeFromList(setSpecializationList, specializationList, index)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "0",
                          cursor: "pointer",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: "1",
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

            {/* Sub-specialization */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Sub-specialization"
                  value={formData.subSpecialization}
                  onChange={(e) => handleInputChange("subSpecialization", e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToList("subSpecialization", setSubSpecializationList, subSpecializationList);
                    }
                  }}
                  className="form-control"
                  style={{ 
                    borderColor: "#d1d5db", 
                    borderRadius: "12px", 
                    height: "40px",
                    fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn text-white flex-shrink-0"
                  style={{
                    backgroundColor: "#4D227C",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => addToList("subSpecialization", setSubSpecializationList, subSpecializationList)}
                  disabled={isLoading}
                >
                  <FiPlus size={18} />
                </button>
              </div>
              {subSpecializationList.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {subSpecializationList.map((item, index) => (
                    <span
                      key={index}
                      className="badge d-inline-flex align-items-center gap-2"
                      style={{ 
                        backgroundColor: "#4D227C", 
                        fontSize: "clamp(0.813rem, 2vw, 0.938rem)", 
                        padding: "6px 12px",
                        fontWeight: "400",
                      }}
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeFromList(setSubSpecializationList, subSpecializationList, index)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "0",
                          cursor: "pointer",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: "1",
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

            {/* Board Certificate */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Board Certificate"
                  value={formData.boardCertificate}
                  onChange={(e) => handleInputChange("boardCertificate", e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToList("boardCertificate", setBoardCertificateList, boardCertificateList);
                    }
                  }}
                  className="form-control"
                  style={{ 
                    borderColor: "#d1d5db", 
                    borderRadius: "12px", 
                    height: "40px",
                    fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn text-white flex-shrink-0"
                  style={{
                    backgroundColor: "#4D227C",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => addToList("boardCertificate", setBoardCertificateList, boardCertificateList)}
                  disabled={isLoading}
                >
                  <FiPlus size={18} />
                </button>
              </div>
              {boardCertificateList.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {boardCertificateList.map((item, index) => (
                    <span
                      key={index}
                      className="badge d-inline-flex align-items-center gap-2"
                      style={{ 
                        backgroundColor: "#4D227C", 
                        fontSize: "clamp(0.813rem, 2vw, 0.938rem)", 
                        padding: "6px 12px",
                        fontWeight: "400",
                      }}
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeFromList(setBoardCertificateList, boardCertificateList, index)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "0",
                          cursor: "pointer",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: "1",
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

            {/* My Services */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="My Services"
                  value={formData.myServices}
                  onChange={(e) => handleInputChange("myServices", e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToList("myServices", setServicesList, servicesList);
                    }
                  }}
                  className="form-control"
                  style={{ 
                    borderColor: "#d1d5db", 
                    borderRadius: "12px", 
                    height: "40px",
                    fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="btn text-white flex-shrink-0"
                  style={{
                    backgroundColor: "#4D227C",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => addToList("myServices", setServicesList, servicesList)}
                  disabled={isLoading}
                >
                  <FiPlus size={18} />
                </button>
              </div>
              {servicesList.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {servicesList.map((item, index) => (
                    <span
                      key={index}
                      className="badge d-inline-flex align-items-center gap-2"
                      style={{ 
                        backgroundColor: "#4D227C", 
                        fontSize: "clamp(0.813rem, 2vw, 0.938rem)", 
                        padding: "6px 12px",
                        fontWeight: "400",
                      }}
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeFromList(setServicesList, servicesList, index)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "0",
                          cursor: "pointer",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: "1",
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

            {/* Upload Certificate Image */}
            <div className="col-12">
              <div className="position-relative">
                <input
                  type="text"
                  placeholder="Upload Certificate Image"
                  readOnly
                  value={formData.certificateImage ? formData.certificateImage.name : ""}
                  className="form-control"
                  style={{
                    borderColor: "#d1d5db",
                    borderRadius: "12px",
                    paddingRight: "90px",
                    height: "40px",
                    fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("certificateImage", e.target.files[0])}
                  className="d-none"
                  id="certificateImageInput"
                />
                <button
                  type="button"
                  className="btn position-absolute"
                  style={{
                    backgroundColor: "#C4B5D6",
                    color: "#000000",
                    top: "0",
                    right: "0",
                    height: "40px",
                    borderRadius: "0 12px 12px 0",
                    border: "none",
                    padding: "0 15px",
                    fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  }}
                  onClick={() => document.getElementById("certificateImageInput").click()}
                  disabled={isLoading}
                >
                  Browse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div
          className="d-flex align-items-center justify-content-center px-3 px-sm-4 py-3 border-top flex-shrink-0 position-relative"
          style={{
            borderBottomLeftRadius: "24px",
            borderBottomRightRadius: "24px",
            backgroundColor: "#fff",
          }}
        >
          <button
            type="button"
            className="btn text-white fw-semibold px-4 px-sm-5 py-2 d-flex align-items-center justify-content-center gap-2"
            style={{
              backgroundColor: "#4D227C",
              borderRadius: "12px",
              fontSize: "clamp(0.875rem, 2vw, 1rem)",
            }}
            onClick={handleUpload}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </button>
          <button
            type="button"
            className="btn btn-link text-decoration-none position-absolute"
            style={{
              color: "#4D227C",
              padding: "0",
              fontSize: "clamp(0.875rem, 2vw, 1rem)",
              whiteSpace: "nowrap",
              right: "20px",
            }}
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
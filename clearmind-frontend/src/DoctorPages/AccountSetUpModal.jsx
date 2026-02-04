import { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";

function AccountSetupModal({ showModal, onClose }) {
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

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileChange = (field, file) => {
    setFormData({ ...formData, [field]: file });
  };

  const addToList = (field, listSetter, currentList) => {
    if (formData[field].trim()) {
      listSetter([...currentList, formData[field]]);
      setFormData({ ...formData, [field]: "" });
    }
  };

  const handleUpload = () => {
    console.log("Form data:", formData);
    console.log("Specialization:", specializationList);
    console.log("Sub-specialization:", subSpecializationList);
    console.log("Board Certificate:", boardCertificateList);
    console.log("Services:", servicesList);
  };

  const handleSkip = () => {
    onClose();
  };

  if (!showModal) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-2 p-md-3"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1050,
      }}
    >
      <div
        className="bg-white"
        style={{
          maxWidth: "600px",
          maxHeight: "95vh",
          borderRadius: "24px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="position-relative px-4 py-3 border-bottom"
          style={{
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            backgroundColor: "#fff",
          }}
        >
          <h3
            className="m-0 fw-bold text-center"
            style={{ color: "#4D227C", paddingTop: "12px" }}
          >
            Account Setup
          </h3>
          <button
            type="button"
            className="btn btn-link text-secondary p-1 position-absolute"
            style={{ top: "12px", right: "12px", fontSize: "24px" }}
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <div className="row g-3">
            {/* Profile Picture Upload */}
            <div className="col-12">
              <div className="position-relative">
                <input
                  type="text"
                  placeholder="Upload Profile Picture"
                  readOnly
                  value={
                    formData.profilePicture ? formData.profilePicture.name : ""
                  }
                  className="form-control"
                  style={{
                    borderColor: "#d1d5db",
                    borderRadius: "12px",
                    paddingRight: "90px",
                    height: "40px",
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange("profilePicture", e.target.files[0])
                  }
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
                    padding: "0 20px",
                  }}
                  onClick={() =>
                    document.getElementById("profilePictureInput").click()
                  }
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="col-12">
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="form-control"
                style={{ borderColor: "#d1d5db", borderRadius: "12px", height: "40px" }}
              />
            </div>

            {/* Professional Title */}
            <div className="col-12">
              <input
                type="text"
                placeholder="Professional Title *"
                value={formData.professionalTitle}
                onChange={(e) =>
                  handleInputChange("professionalTitle", e.target.value)
                }
                className="form-control"
                style={{ borderColor: "#d1d5db", borderRadius: "12px", height: "40px" }}
                required
              />
            </div>

            {/* Years of Experience and License Number */}
            <div className="col-12 col-sm-6">
              <input
                type="text"
                placeholder="Years of Experience *"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  handleInputChange("yearsOfExperience", e.target.value)
                }
                className="form-control"
                style={{ borderColor: "#d1d5db", borderRadius: "12px", height: "40px" }}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <input
                type="text"
                placeholder="License Number *"
                value={formData.licenseNumber}
                onChange={(e) =>
                  handleInputChange("licenseNumber", e.target.value)
                }
                className="form-control"
                style={{ borderColor: "#d1d5db", borderRadius: "12px", height: "40px" }}
                required
              />
            </div>

            {/* Specialization */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Specialization *"
                  value={formData.specialization}
                  onChange={(e) =>
                    handleInputChange("specialization", e.target.value)
                  }
                  className="form-control"
                  style={{ borderColor: "#d1d5db", borderRadius: "12px", height: "40px" }}
                  required
                />
                <button
                  type="button"
                  className="btn text-white flex-shrink-0"
                  style={{
                    backgroundColor: "#4D227C",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                  }}
                  onClick={() =>
                    addToList(
                      "specialization",
                      setSpecializationList,
                      specializationList,
                    )
                  }
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Sub-specialization */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Sub-specialization *"
                  value={formData.subSpecialization}
                  onChange={(e) =>
                    handleInputChange("subSpecialization", e.target.value)
                  }
                  className="form-control"
                  style={{ borderColor: "#d1d5db", borderRadius: "12px", height: "40px" }}
                  required
                />
                <button
                  type="button"
                  className="btn text-white flex-shrink-0"
                  style={{
                    backgroundColor: "#4D227C",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                  }}
                  onClick={() =>
                    addToList(
                      "subSpecialization",
                      setSubSpecializationList,
                      subSpecializationList,
                    )
                  }
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Board Certificate */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Board Certificate *"
                  value={formData.boardCertificate}
                  onChange={(e) =>
                    handleInputChange("boardCertificate", e.target.value)
                  }
                  className="form-control"
                  style={{ borderColor: "#d1d5db", borderRadius: "12px", height: "40px" }}
                  required
                />
                <button
                  type="button"
                  className="btn text-white flex-shrink-0"
                  style={{
                    backgroundColor: "#4D227C",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                  }}
                  onClick={() =>
                    addToList(
                      "boardCertificate",
                      setBoardCertificateList,
                      boardCertificateList,
                    )
                  }
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* My Services */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="My Services *"
                  value={formData.myServices}
                  onChange={(e) =>
                    handleInputChange("myServices", e.target.value)
                  }
                  className="form-control"
                  style={{ borderColor: "#d1d5db", borderRadius: "12px", height: "40px" }}
                  required
                />
                <button
                  type="button"
                  className="btn text-white flex-shrink-0"
                  style={{
                    backgroundColor: "#4D227C",
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                  }}
                  onClick={() =>
                    addToList("myServices", setServicesList, servicesList)
                  }
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Upload Certificate Image */}
            <div className="col-12">
              <div className="position-relative">
                <input
                  type="text"
                  placeholder="Upload Certificate Image"
                  readOnly
                  value={
                    formData.certificateImage ? formData.certificateImage.name : ""
                  }
                  className="form-control"
                  style={{
                    borderColor: "#d1d5db",
                    borderRadius: "12px",
                    paddingRight: "90px",
                    height: "40px",
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileChange("certificateImage", e.target.files[0])
                  }
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
                    padding: "0 20px",
                  }}
                  onClick={() =>
                    document.getElementById("certificateImageInput").click()
                  }
                >
                  Browse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="d-flex align-items-center justify-content-center position-relative px-4 py-3 border-top"
          style={{
            borderBottomLeftRadius: "24px",
            borderBottomRightRadius: "24px",
            backgroundColor: "#fff",
          }}
        >
          <button
            type="button"
            className="btn text-white fw-semibold px-5 py-2"
            style={{
              backgroundColor: "#4D227C",
              borderRadius: "12px",
            }}
            onClick={handleUpload}
          >
            Upload
          </button>
          <button
            type="button"
            className="btn btn-link text-decoration-none position-absolute"
            style={{
              color: "#4D227C",
              right: "20px",
              padding: "0",
            }}
            onClick={handleSkip}
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountSetupModal;
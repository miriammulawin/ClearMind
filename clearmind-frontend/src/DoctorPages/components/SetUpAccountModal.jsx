import { useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";

function AccountSetupModal({ showModal, onClose }) {
  const [formData, setFormData] = useState({
    profilePicture: null,
    description: "",
    professionalTitle: "",
    yearsOfExperience: "",
    practicingSince: "",
    mainSpecialty: "",
    licenseNumber: "",
    specialization: "",
    subSpecialization: "",
    boardCertificate: "",
    myServices: "",
    certificateImages: [],
    idPictures: [],
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

  const handleMultiFileAdd = (field, file) => {
    if (file) {
      setFormData({ ...formData, [field]: [...formData[field], file] });
    }
  };

  const handleMultiFileRemove = (field, index) => {
    const updated = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: updated });
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

  const handleUpload = () => {
    console.log("Upload clicked - Form Data:", {
      ...formData,
      specializationList,
      subSpecializationList,
      boardCertificateList,
      servicesList,
    });
    onClose();
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
          style={{
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            backgroundColor: "#fff",
          }}
        >
          <h3 className="m-0 fw-bold text-center" style={{ color: "#4D227C" }}>
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
        <div className="px-4 py-3 flex-grow-1" style={{ overflowY: "auto" }}>
          <div className="row g-3">
            {/* Profile Picture */}
            <FileInput
              label="Profile Picture"
              file={formData.profilePicture}
              onFileChange={(file) => handleFileChange("profilePicture", file)}
            />

            {/* Description */}
            <div className="col-12">
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="form-control"
                style={{
                  borderRadius: "12px",
                  minHeight: "60px",
                  resize: "none",
                }}
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
                style={{ borderRadius: "12px", height: "40px" }}
              />
            </div>

            {/* Years of Experience and License Number */}
            <div className="col-12 col-sm-6">
              <input
                type="number"
                placeholder="Years of Experience *"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  handleInputChange("yearsOfExperience", e.target.value)
                }
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
                min="0"
                max="70"
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
                style={{ borderRadius: "12px", height: "40px" }}
              />
            </div>

            {/* Practicing Since and Main Specialty */}
            <div className="col-12 col-sm-6">
              <input
                type="number"
                placeholder="Practicing Since (Year)"
                value={formData.practicingSince}
                onChange={(e) =>
                  handleInputChange("practicingSince", e.target.value)
                }
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="col-12 col-sm-6">
              <input
                type="text"
                placeholder="Main Specialty"
                value={formData.mainSpecialty}
                onChange={(e) =>
                  handleInputChange("mainSpecialty", e.target.value)
                }
                className="form-control"
                style={{ borderRadius: "12px", height: "40px" }}
              />
            </div>

            {/* Specialization Lists */}
            <ListInput
              label="Specialization *"
              value={formData.specialization}
              onChange={(val) => handleInputChange("specialization", val)}
              list={specializationList}
              add={() =>
                addToList(
                  "specialization",
                  setSpecializationList,
                  specializationList,
                )
              }
              remove={(i) =>
                removeFromList(setSpecializationList, specializationList, i)
              }
            />

            <ListInput
              label="Sub-specialization"
              value={formData.subSpecialization}
              onChange={(val) => handleInputChange("subSpecialization", val)}
              list={subSpecializationList}
              add={() =>
                addToList(
                  "subSpecialization",
                  setSubSpecializationList,
                  subSpecializationList,
                )
              }
              remove={(i) =>
                removeFromList(
                  setSubSpecializationList,
                  subSpecializationList,
                  i,
                )
              }
            />

            <ListInput
              label="Board Certificate"
              value={formData.boardCertificate}
              onChange={(val) => handleInputChange("boardCertificate", val)}
              list={boardCertificateList}
              add={() =>
                addToList(
                  "boardCertificate",
                  setBoardCertificateList,
                  boardCertificateList,
                )
              }
              remove={(i) =>
                removeFromList(setBoardCertificateList, boardCertificateList, i)
              }
            />

            <ListInput
              label="My Services"
              value={formData.myServices}
              onChange={(val) => handleInputChange("myServices", val)}
              list={servicesList}
              add={() => addToList("myServices", setServicesList, servicesList)}
              remove={(i) => removeFromList(setServicesList, servicesList, i)}
            />

            {/* Certificate Images — multi-upload */}
            <MultiFileInput
              label="Certificate Image"
              files={formData.certificateImages}
              fieldKey="certImg"
              onFileAdd={(file) => handleMultiFileAdd("certificateImages", file)}
              onFileRemove={(i) => handleMultiFileRemove("certificateImages", i)}
            />

            {/* ID Picture — multi-upload */}
            <MultiFileInput
              label="Upload ID Card Picture"
              files={formData.idPictures}
              fieldKey="idPic"
              onFileAdd={(file) => handleMultiFileAdd("idPictures", file)}
              onFileRemove={(i) => handleMultiFileRemove("idPictures", i)}
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
          >
            Upload
          </button>
          <button
            type="button"
            className="btn btn-link text-decoration-none position-absolute"
            style={{ right: "20px", color: "#4D227C" }}
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

// ================== Helper Components ==================

const FileInput = ({ label, file, onFileChange }) => {
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
          style={{
            backgroundColor: "#C4B5D6",
            top: "0",
            right: "0",
            height: "40px",
            borderRadius: "0 12px 12px 0",
            border: "none",
            padding: "0 15px",
          }}
          onClick={() => document.getElementById(inputId).click()}
        >
          Browse
        </button>
      </div>
    </div>
  );
};

const MultiFileInput = ({ label, files, fieldKey, onFileAdd, onFileRemove }) => {
  const inputId = fieldKey + "MultiInput";

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileAdd(file);
      // Reset so same file can be re-selected if removed
      e.target.value = "";
    }
  };

  return (
    <div className="col-12">
      <div className="d-flex gap-2 align-items-center">
        {/* Browse input */}
        <div className="position-relative flex-grow-1">
          <input
            type="text"
            placeholder={`Upload ${label}`}
            readOnly
            value={files.length > 0 ? `${files.length} file(s) selected` : ""}
            className="form-control"
            style={{ borderRadius: "12px", paddingRight: "90px", height: "40px", cursor: "default" }}
          />
          <input
            type="file"
            accept="image/*"
            id={inputId}
            className="d-none"
            onChange={handleChange}
          />
          <button
            type="button"
            className="btn position-absolute"
            style={{
              backgroundColor: "#C4B5D6",
              top: "0",
              right: "0",
              height: "40px",
              borderRadius: "0 12px 12px 0",
              border: "none",
              padding: "0 15px",
            }}
            onClick={() => document.getElementById(inputId).click()}
          >
            Browse
          </button>
        </div>

        {/* Plus button */}
        <button
          type="button"
          className="btn text-white flex-shrink-0 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "#4D227C",
            width: "40px",
            height: "40px",
            borderRadius: "12px",
          }}
          onClick={() => document.getElementById(inputId).click()}
        >
          <FiPlus size={18} />
        </button>
      </div>

      {/* File list pills */}
      {files.length > 0 && (
        <div className="mt-2 d-flex flex-wrap gap-2">
          {files.map((file, i) => (
            <span
              key={i}
              className="badge d-inline-flex align-items-center gap-2"
              style={{
                backgroundColor: "#4D227C",
                padding: "6px 12px",
                fontSize: "0.85rem",
                fontWeight: "400",
                maxWidth: "220px",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "160px",
                }}
                title={file.name}
              >
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => onFileRemove(i)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0",
                  lineHeight: "1",
                  flexShrink: 0,
                }}
                aria-label="Remove"
              >
                <FiX size={14} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ListInput = ({ label, value, onChange, list, add, remove }) => (
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
      />
      <button
        type="button"
        className="btn text-white flex-shrink-0 d-flex align-items-center justify-content-center"
        style={{
          backgroundColor: "#4D227C",
          width: "40px",
          height: "40px",
          borderRadius: "12px",
        }}
        onClick={add}
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
            style={{
              backgroundColor: "#4D227C",
              padding: "6px 12px",
              fontSize: "0.9rem",
              fontWeight: "400",
            }}
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
);
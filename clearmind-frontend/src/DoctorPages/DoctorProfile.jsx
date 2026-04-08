import { useState, useEffect } from "react";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import EditPersonalInfoModal from "./components/EditPersonalInfoModal";
import EditAccountSecurityModal from "./components/EditAccountSecurityModal";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function DoctorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState("My Profile");
  const [profileTab, setProfileTab] = useState("Personal Information");
  const [certIndex, setCertIndex] = useState(0);
  const [idIndex, setIdIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [fullscreenType, setFullscreenType] = useState(null);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  useEffect(() => {
    setActiveMenu("My Profile");
    setProfileTab("Personal Information");
  }, []);

  const openFullscreen = (type, index) => {
    setFullscreenType(type);
    if (type === "cert") {
      setFullscreenImage(doctorData.certificateImages[index]);
    } else {
      setFullscreenImage(doctorData.idImages[index]);
    }
  };

  const nextFullscreenImage = () => {
    if (fullscreenType === "cert") {
      const newIndex =
        certIndex === doctorData.certificateImages.length - 1
          ? 0
          : certIndex + 1;
      setCertIndex(newIndex);
      setFullscreenImage(doctorData.certificateImages[newIndex]);
    } else {
      const newIndex =
        idIndex === doctorData.idImages.length - 1 ? 0 : idIndex + 1;
      setIdIndex(newIndex);
      setFullscreenImage(doctorData.idImages[newIndex]);
    }
  };

  const prevFullscreenImage = () => {
    if (fullscreenType === "cert") {
      const newIndex =
        certIndex === 0
          ? doctorData.certificateImages.length - 1
          : certIndex - 1;
      setCertIndex(newIndex);
      setFullscreenImage(doctorData.certificateImages[newIndex]);
    } else {
      const newIndex =
        idIndex === 0 ? doctorData.idImages.length - 1 : idIndex - 1;
      setIdIndex(newIndex);
      setFullscreenImage(doctorData.idImages[newIndex]);
    }
  };

  const getCurrentIndex = () =>
    fullscreenType === "cert" ? certIndex : idIndex;
  const getTotalImages = () =>
    fullscreenType === "cert"
      ? doctorData.certificateImages.length
      : doctorData.idImages.length;

  const doctorData = {
    name: "Jinky C. Malabanan",
    credentials: "PhD, BPsy, RPm, CHRM, CSHE, CBP",
    licenseNo: "PRF License No.: PSY-0132455",
    specialty: "Cognitive Behavioral Therapy",
    practicingSince: "2011",
    email: "Example@gmail.com",
    password: "************************",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    firstName: "Example",
    lastName: "Example",
    middleInitial: "Example",
    contactNumber: "09406929293",
    address: "123 Rizal Street, Brgy. San Antonio, Quezon City, Metro Manila",
    dateOfBirth: "Example",
    age: "45",
    gender: "Female",
    subspecialty: [
      "Psychological First Aid",
      "Workplace Mental Health (Burn-out and Stress)",
      "Psychoeducation",
      "Wellness | Stress Management",
      "Anxiety | Depression",
    ],
    services: [
      "Family Counseling",
      "Cognitive Behavioral Therapy",
      "Neuropsychological Testing",
      "Psychotherapy",
      "Psychosocial Counseling",
    ],
    certifications: [
      "Certified Human Resource, Association",
      "Registered Psychometrician",
      "Registered Psychologist",
    ],
    certificateImages: [
      "https://via.placeholder.com/600x400/4D227C/FFFFFF?text=Board+Certificate+1",
      "https://via.placeholder.com/600x400/4D227C/FFFFFF?text=Board+Certificate+2",
      "https://via.placeholder.com/600x400/4D227C/FFFFFF?text=Board+Certificate+3",
    ],
    idImages: [
      "https://via.placeholder.com/600x400/4D227C/FFFFFF?text=ID+Card+1",
      "https://via.placeholder.com/600x400/4D227C/FFFFFF?text=ID+Card+2",
    ],
  };

  const nextCert = () =>
    setCertIndex((prev) =>
      prev === doctorData.certificateImages.length - 1 ? 0 : prev + 1,
    );
  const prevCert = () =>
    setCertIndex((prev) =>
      prev === 0 ? doctorData.certificateImages.length - 1 : prev - 1,
    );
  const nextId = () =>
    setIdIndex((prev) =>
      prev === doctorData.idImages.length - 1 ? 0 : prev + 1,
    );
  const prevId = () =>
    setIdIndex((prev) =>
      prev === 0 ? doctorData.idImages.length - 1 : prev - 1,
    );

  const carrowBtn = (fn, side, Icon) => (
    <button
      key={side}
      onClick={fn}
      style={{
        position: "absolute",
        [side]: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "rgba(77,34,124,0.8)",
        border: "none",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "white",
      }}
    >
      <Icon />
    </button>
  );

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="doctor-content" style={{ padding: "20px" }}>
          <div className="myprofile-container">
            <div className="container-fluid">
              <div className="row g-4">
                {/* Left Column */}
                <div className="col-lg-4 col-md-5">
                  <div
                    className="card shadow-sm border-0 mb-4"
                    style={{ borderRadius: "12px", minHeight: "300px" }}
                  >
                    <div className="card-body text-center">
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "200px",
                          height: "200px",
                          border: "3px solid #4D227C",
                          borderRadius: "12px",
                          backgroundColor: "#F8F9FA",
                        }}
                      >
                        <i
                          className="bi bi-person"
                          style={{ fontSize: "100px", color: "#4D227C" }}
                        ></i>
                      </div>
                      <h5 className="fw-bold mb-1" style={{ color: "#2D3748" }}>
                        {doctorData.name}
                      </h5>
                      <p
                        className="text-muted small mb-1"
                        style={{ color: "#4D227C" }}
                      >
                        {doctorData.credentials}
                      </p>
                      <p className="text-muted small mb-0">
                        {doctorData.licenseNo}
                      </p>
                    </div>
                  </div>

                  <div
                    className="card shadow-sm border-0"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="card-body p-3">
                      <div className="mb-3">
                        <small className="text-muted fw-semibold">MENU</small>
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {[
                          "Personal Information",
                          "Account Security",
                          "Terms & Conditions",
                        ].map((tab) => (
                          <button
                            key={tab}
                            className="btn d-flex align-items-center py-3 px-3 border-0"
                            style={{
                              backgroundColor:
                                profileTab === tab ? "#4D227C" : "transparent",
                              color: profileTab === tab ? "white" : "#2D3748",
                              borderRadius: "8px",
                              textAlign: "left",
                            }}
                            onClick={() => setProfileTab(tab)}
                          >
                            <i
                              className={`bi ${tab === "Personal Information" ? "bi-person" : "bi-shield-check"} me-3`}
                              style={{
                                color: profileTab === tab ? "white" : "#4D227C",
                              }}
                            ></i>
                            {tab}
                          </button>
                        ))}
                        <button
                          className="btn d-flex align-items-center py-3 px-3 border-0"
                          style={{
                            backgroundColor: "transparent",
                            color: "#2D3748",
                            borderRadius: "8px",
                            textAlign: "left",
                          }}
                        >
                          <i
                            className="bi bi-box-arrow-right me-3"
                            style={{ color: "#4D227C" }}
                          ></i>
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-lg-8 col-md-7">
                  {/* Bio Card */}
                  <div
                    className="card shadow-sm border-0 mb-4"
                    style={{ borderRadius: "12px" }}
                  >
                    <div className="card-body p-4">
                      <p
                        className="text-muted mb-4"
                        style={{ lineHeight: "1.8", textAlign: "justify" }}
                      >
                        {doctorData.bio}
                      </p>
                      <div className="row">
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <div className="border-end pe-3">
                            <small
                              className="text-muted d-block mb-1"
                              style={{ color: "#4D227C" }}
                            >
                              MAIN SPECIALTY
                            </small>
                            <p
                              className="fw-semibold mb-0"
                              style={{ color: "#2D3748" }}
                            >
                              {doctorData.specialty}
                            </p>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="ps-sm-3">
                            <small
                              className="text-muted d-block mb-1"
                              style={{ color: "#4D227C" }}
                            >
                              PRACTICING SINCE
                            </small>
                            <p
                              className="fw-semibold mb-0"
                              style={{ color: "#2D3748" }}
                            >
                              {doctorData.practicingSince}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {profileTab === "Personal Information" ? (
                    <div
                      className="card shadow-sm border-0"
                      style={{ borderRadius: "12px" }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5
                            className="fw-bold mb-0"
                            style={{ color: "#4D227C" }}
                          >
                            Personal Information
                          </h5>
                          <button
                            className="btn btn-link text-decoration-none p-0"
                            onClick={() => setShowPersonalModal(true)}
                          >
                            <i
                              className="bi bi-pencil-square"
                              style={{ fontSize: "20px", color: "#4D227C" }}
                            ></i>
                          </button>
                        </div>

                        {/* Name Row */}
                        <div className="row mb-3">
                          {[
                            ["First Name", "firstName"],
                            ["Last Name", "lastName"],
                            ["Middle Initial", "middleInitial"],
                          ].map(([label, key]) => (
                            <div className="col-md-4 mb-3 mb-md-0" key={key}>
                              <label className="form-label text-muted small mb-2">
                                {label}
                              </label>
                              <input
                                type="text"
                                className="form-control border-0 bg-light"
                                style={{ borderRadius: "8px" }}
                                value={doctorData[key]}
                                disabled={!isEditing}
                                readOnly
                              />
                            </div>
                          ))}
                        </div>

                        {/* Contact / DOB / Age / Gender Row */}
                        <div className="row mb-3">
                          <div className="col-md-3 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2">
                              Contact Number
                            </label>
                            <input
                              type="text"
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.contactNumber}
                              disabled={!isEditing}
                              readOnly
                            />
                          </div>
                          <div className="col-md-3 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2">
                              Date of Birth
                            </label>
                            <input
                              type="text"
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.dateOfBirth}
                              disabled={!isEditing}
                              readOnly
                            />
                          </div>
                          <div className="col-md-3 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2">
                              Age
                            </label>
                            <input
                              type="text"
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.age}
                              disabled={!isEditing}
                              readOnly
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label text-muted small mb-2">
                              Gender
                            </label>
                            <input
                              type="text"
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.gender}
                              disabled={!isEditing}
                              readOnly
                            />
                          </div>
                        </div>

                        {/* Address Row */}
                        <div className="row mb-4">
                          <div className="col-12">
                            <label className="form-label text-muted small mb-2">
                              Address
                            </label>
                            <input
                              type="text"
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.address}
                              disabled={!isEditing}
                              readOnly
                            />
                          </div>
                        </div>

                        {/* Subspecialty & Services */}
                        <div className="row mb-4">
                          <div className="col-md-6 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2 fw-semibold">
                              SUBSPECIALTY
                            </label>
                            <div
                              className="bg-light p-3"
                              style={{ borderRadius: "8px" }}
                            >
                              {doctorData.subspecialty.map((item, i) => (
                                <div key={i} className="mb-1 small text-muted">
                                  • {item}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted small mb-2 fw-semibold">
                              MY SERVICES
                            </label>
                            <div
                              className="bg-light p-3"
                              style={{ borderRadius: "8px" }}
                            >
                              {doctorData.services.map((item, i) => (
                                <div key={i} className="mb-1 small text-muted">
                                  • {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Board Certifications */}
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2 fw-semibold">
                            BOARD CERTIFICATIONS
                          </label>
                          <div
                            className="bg-light p-3"
                            style={{ borderRadius: "8px" }}
                          >
                            {doctorData.certifications.map((item, i) => (
                              <div key={i} className="mb-1 small text-muted">
                                • {item}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Image Carousels */}
                        <div className="row mb-4">
                          <div className="col-md-6 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2 fw-semibold">
                              BOARD CERTIFICATE
                            </label>
                            <div
                              className="position-relative bg-light d-flex align-items-center justify-content-center"
                              style={{
                                borderRadius: "8px",
                                height: "280px",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={doctorData.certificateImages[certIndex]}
                                alt={`Certificate ${certIndex + 1}`}
                                onClick={() =>
                                  openFullscreen("cert", certIndex)
                                }
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                  cursor: "pointer",
                                  transition: "transform 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.transform = "scale(1.02)")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.transform = "scale(1)")
                                }
                              />
                              {carrowBtn(prevCert, "left", FaChevronLeft)}
                              {carrowBtn(nextCert, "right", FaChevronRight)}
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "10px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  background: "rgba(0,0,0,0.6)",
                                  color: "white",
                                  padding: "4px 12px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                }}
                              >
                                {certIndex + 1} /{" "}
                                {doctorData.certificateImages.length}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted small mb-2 fw-semibold">
                              ID CARDS
                            </label>
                            <div
                              className="position-relative bg-light d-flex align-items-center justify-content-center"
                              style={{
                                borderRadius: "8px",
                                height: "280px",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={doctorData.idImages[idIndex]}
                                alt={`ID ${idIndex + 1}`}
                                onClick={() => openFullscreen("id", idIndex)}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  objectFit: "contain",
                                  cursor: "pointer",
                                  transition: "transform 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.transform = "scale(1.02)")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.transform = "scale(1)")
                                }
                              />
                              {carrowBtn(prevId, "left", FaChevronLeft)}
                              {carrowBtn(nextId, "right", FaChevronRight)}
                              <div
                                style={{
                                  position: "absolute",
                                  bottom: "10px",
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  background: "rgba(0,0,0,0.6)",
                                  color: "white",
                                  padding: "4px 12px",
                                  borderRadius: "12px",
                                  fontSize: "12px",
                                }}
                              >
                                {idIndex + 1} / {doctorData.idImages.length}
                              </div>
                            </div>
                          </div>
                        </div>

                        {isEditing && (
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              className="btn btn-outline-secondary"
                              style={{ borderRadius: "8px" }}
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn text-white"
                              style={{
                                backgroundColor: "#4D227C",
                                borderRadius: "8px",
                              }}
                              onClick={() => setIsEditing(false)}
                            >
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : profileTab === "Account Security" ? (
                    <div
                      className="card shadow-sm border-0"
                      style={{ borderRadius: "12px", minHeight: "400px" }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5
                            className="fw-bold mb-0"
                            style={{ color: "#4D227C" }}
                          >
                            Account Security
                          </h5>
                          <button
                            className="btn btn-link text-decoration-none p-0"
                            onClick={() => setShowSecurityModal(true)}
                          >
                            <i
                              className="bi bi-pencil-square"
                              style={{ fontSize: "20px", color: "#4D227C" }}
                            ></i>
                          </button>
                        </div>

                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            className="form-control border-0 bg-light"
                            style={{ borderRadius: "8px" }}
                            value={doctorData.email}
                            readOnly
                          />
                        </div>

                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            className="form-control border-0 bg-light"
                            style={{ borderRadius: "8px" }}
                            value={doctorData.password}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="card p-4 shadow-sm"
                      style={{ borderRadius: "12px" }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 style={{ color: "#4D227C" }} className="fw-bold">
                          Terms & Conditions
                        </h5>
                      </div>

                      {/* IMPORTANT NOTICE */}
                      <div
                        className="p-3 mb-4"
                        style={{
                          background:
                            "linear-gradient(135deg, #4D227C, #6B46C1)",
                          color: "white",
                          borderRadius: "10px",
                          fontSize: "clamp(0.85rem, 1vw, 0.95rem)",
                        }}
                      >
                        By using this platform, you agree to all terms below.
                        Please read carefully before proceeding.
                      </div>

                      {/* SCROLLABLE CONTENT */}
                      <div
                        style={{
                          maxHeight: "500px",
                          overflowY: "auto",
                          paddingRight: "5px",
                        }}
                      >
                        {/* SECTION */}
                        <div className="mb-4">
                          <h6
                            className="fw-semibold mb-2"
                            style={{ color: "#4D227C" }}
                          >
                            1. User Responsibilities
                          </h6>
                          <p className="text-muted small mb-0">
                            You must provide accurate, complete, and updated
                            information at all times. Any false or misleading
                            data may result in account suspension.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h6
                            className="fw-semibold mb-2"
                            style={{ color: "#4D227C" }}
                          >
                            2. Data Privacy & Confidentiality
                          </h6>
                          <p className="text-muted small mb-0">
                            All patient information must remain confidential.
                            Unauthorized sharing, duplication, or misuse of
                            sensitive data is strictly prohibited and may lead
                            to legal action.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h6
                            className="fw-semibold mb-2"
                            style={{ color: "#4D227C" }}
                          >
                            3. System Usage
                          </h6>
                          <p className="text-muted small mb-0">
                            The platform must only be used for professional and
                            authorized purposes. Any attempt to exploit, hack,
                            or disrupt the system will result in immediate
                            account termination.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h6
                            className="fw-semibold mb-2"
                            style={{ color: "#4D227C" }}
                          >
                            4. Account Security
                          </h6>
                          <p className="text-muted small mb-0">
                            You are responsible for maintaining the
                            confidentiality of your account credentials. Do not
                            share your login details with others.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h6
                            className="fw-semibold mb-2"
                            style={{ color: "#4D227C" }}
                          >
                            5. Updates to Terms
                          </h6>
                          <p className="text-muted small mb-0">
                            The system reserves the right to update or modify
                            these terms at any time. Continued use of the
                            platform constitutes acceptance of any changes made.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h6
                            className="fw-semibold mb-2"
                            style={{ color: "#4D227C" }}
                          >
                            6. Violations & Penalties
                          </h6>
                          <p className="text-muted small mb-0">
                            Any violation of these terms may result in temporary
                            suspension or permanent termination of your account
                            depending on the severity of the offense.
                          </p>
                        </div>

                        <div className="mb-4">
                          <h6
                            className="fw-semibold mb-2"
                            style={{ color: "#4D227C" }}
                          >
                            7. Legal Compliance
                          </h6>
                          <p className="text-muted small mb-0">
                            Users must comply with all applicable laws,
                            regulations, and ethical standards when using the
                            system.
                          </p>
                        </div>

                        {/* FINAL AGREEMENT */}
                        <div
                          className="mt-4 p-3"
                          style={{
                            backgroundColor: "#F3F0FF",
                            borderLeft: "5px solid #4D227C",
                            borderRadius: "8px",
                          }}
                        >
                          <p className="mb-0 small text-muted">
                            By continuing to use this system, you acknowledge
                            that you have read, understood, and agreed to all
                            Terms & Conditions stated above.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div
          onClick={() => {
            setFullscreenImage(null);
            setFullscreenType(null);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "20px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <button
              onClick={() => {
                setFullscreenImage(null);
                setFullscreenType(null);
              }}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "#f3f4f6",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "24px",
                color: "#374151",
                zIndex: 10,
              }}
            >
              ×
            </button>
            <div
              style={{
                marginBottom: "15px",
                textAlign: "center",
                color: "#4D227C",
                fontWeight: "600",
                fontSize: "18px",
              }}
            >
              {fullscreenType === "cert" ? "Board Certificate" : "ID Card"}
            </div>
            <div
              style={{
                position: "relative",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                borderRadius: "12px",
                backgroundColor: "#f9fafb",
                minHeight: "500px",
              }}
            >
              <img
                src={fullscreenImage}
                alt="View"
                style={{
                  maxWidth: "90%",
                  maxHeight: "90%",
                  objectFit: "contain",
                  border: "4px solid #4D227C",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(77,34,124,0.2)",
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevFullscreenImage();
                }}
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(77,34,124,0.9)",
                  border: "none",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextFullscreenImage();
                }}
                style={{
                  position: "absolute",
                  right: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(77,34,124,0.9)",
                  border: "none",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                <FaChevronRight />
              </button>
              <div
                style={{
                  position: "absolute",
                  bottom: "15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0,0,0,0.7)",
                  color: "white",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {getCurrentIndex() + 1} / {getTotalImages()}
              </div>
            </div>
          </div>
        </div>
      )}

      <EditPersonalInfoModal
        show={showPersonalModal}
        onClose={() => setShowPersonalModal(false)}
        doctorData={doctorData}
        onSave={(updated) => console.log("Saved:", updated)}
      />
      <EditAccountSecurityModal
        show={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        doctorData={doctorData}
        onSave={(updated) => console.log("Saved:", updated)}
      />
    </div>
  );
}

export default DoctorProfile;

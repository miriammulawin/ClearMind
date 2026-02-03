import { useState, useEffect } from "react";
import DoctorSideBar from "./DoctorSideBar";
import DoctorTopNavbar from "./DoctorTopNavbar";

function DoctorProfile() {
  const [activeMenu, setActiveMenu] = useState("Account Security");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setActiveMenu("My Profile");
  }, []);

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
    dateOfBirth: "Example",
    age: "45",
    gender: "Female",
    subspecialty: [
      "Psychological First Aid",
      "Workplace Mental Health (Burn-out and Stress)",
      "Psychoeducation",
      "Wellness | Stress Management",
      "Anxiety | Depression"
    ],
    services: [
      "Family Counseling",
      "Cognitive Behavioral Therapy",
      "Neuropsychological Testing",
      "Psychotherapy",
      "Psychosocial Counseling"
    ],
    certifications: [
      "Certified Human Resource, Association",
      "Registered Psychometrician",
      "Registered Psychologist"
    ]
  };

  return (
    <div className="admin-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="admin-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="admin-content" style={{ padding: "20px" }}>
          <div className="myprofile-container">
            <div className="container-fluid">
              <div className="row g-4">
                {/* Left Column - Profile Card & Menu */}
                <div className="col-lg-4 col-md-5">
                  <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
                    <div className="card-body text-center">
                      {/* Profile Picture Placeholder */}
                      <div 
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center" 
                        style={{
                          width: "200px",
                          height: "200px",
                          border: "3px solid #4D227C",
                          borderRadius: "12px",
                          backgroundColor: "#F8F9FA"
                        }}
                      >
                        <i className="bi bi-person" style={{ fontSize: "100px", color: "#4D227C" }}></i>
                      </div>

                      {/* Doctor Name & Credentials */}
                      <h5 className="fw-bold mb-1" style={{ color: "#2D3748" }}>
                        {doctorData.name}
                      </h5>
                      <p className="text-muted small mb-1" style={{ color: "#4D227C"}}>{doctorData.credentials}</p>
                      <p className="text-muted small mb-0">{doctorData.licenseNo}</p>
                    </div>
                  </div>

                  {/* Menu Card */}
                  <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
                    <div className="card-body p-3">
                      <div className="mb-3">
                        <small className="text-muted fw-semibold">MENU</small>
                      </div>
                      <div className="d-flex flex-column gap-2">
                        <button 
                          className="btn d-flex align-items-center py-3 px-3 border-0"
                          style={{
                            backgroundColor: activeMenu === "Personal Information" ? "#4D227C" : "transparent",
                            color: activeMenu === "Personal Information" ? "white" : "#2D3748",
                            borderRadius: "8px",
                            textAlign: "left"
                          }}
                          onClick={() => setActiveMenu("Personal Information")}
                        >
                          <i className="bi bi-person me-3" style={{ color: activeMenu === "Personal Information" ? "white" : "#4D227C" }}></i>
                          Personal Information
                        </button>
                        <button 
                          className="btn d-flex align-items-center py-3 px-3 border-0"
                          style={{
                            backgroundColor: activeMenu === "Account Security" ? "#4D227C" : "transparent",
                            color: activeMenu === "Account Security" ? "white" : "#2D3748",
                            borderRadius: "8px",
                            textAlign: "left"
                          }}
                          onClick={() => setActiveMenu("Account Security")}
                        >
                          <i className="bi bi-shield-check me-3" style={{ color: activeMenu === "Account Security" ? "white" : "#4D227C" }}></i>
                          Account Security
                        </button>
                        <button 
                          className="btn d-flex align-items-center py-3 px-3 border-0"
                          style={{
                            backgroundColor: "transparent",
                            color: "#2D3748",
                            borderRadius: "8px",
                            textAlign: "left"
                          }}
                        >
                          <i className="bi bi-box-arrow-right me-3" style={{ color: "#4D227C" }}></i>
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Profile Details */}
                <div className="col-lg-8 col-md-7">
                  {/* Bio Section */}
                  <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
                    <div className="card-body p-4">
                      <p className="text-muted mb-4" style={{ lineHeight: "1.8", textAlign: "justify" }}>
                        {doctorData.bio}
                      </p>

                      <div className="row">
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <div className="border-end pe-3">
                            <small className="text-muted d-block mb-1" style={{ color: "#4D227C"}}>MAIN SPECIALTY</small>
                            <p className="fw-semibold mb-0" style={{ color: "#2D3748" }}>
                              {doctorData.specialty}
                            </p>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="ps-sm-3">
                            <small className="text-muted d-block mb-1" style={{ color: "#4D227C"}}>PRACTICING SINCE</small>
                            <p className="fw-semibold mb-0" style={{ color: "#2D3748" }}>
                              {doctorData.practicingSince}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conditional Rendering based on Active Menu */}
                  {activeMenu === "Personal Information" ? (
                    /* Personal Information Section */
                    <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0" style={{ color: "#4D227C" }}>
                            Personal Information
                          </h5>
                          <button 
                            className="btn btn-link text-decoration-none p-0"
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            <i className="bi bi-pencil-square" style={{ fontSize: "20px", color: "#4D227C" }}></i>
                          </button>
                        </div>

                        {/* Name Fields */}
                        <div className="row mb-3">
                          <div className="col-md-4 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2">First Name</label>
                            <input 
                              type="text" 
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.firstName}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="col-md-4 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2">Last Name</label>
                            <input 
                              type="text" 
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.lastName}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label text-muted small mb-2">Middle Initial</label>
                            <input 
                              type="text" 
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.middleInitial}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        {/* Contact, DOB, Age, Gender */}
                        <div className="row mb-4">
                          <div className="col-md-3 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2">Contact Number</label>
                            <input 
                              type="text" 
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.contactNumber}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="col-md-3 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2">Date of Birth</label>
                            <input 
                              type="text" 
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.dateOfBirth}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="col-md-3 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2">Age</label>
                            <input 
                              type="text" 
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.age}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label text-muted small mb-2">Gender</label>
                            <input 
                              type="text" 
                              className="form-control border-0 bg-light"
                              style={{ borderRadius: "8px" }}
                              value={doctorData.gender}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        {/* Subspecialty and Services */}
                        <div className="row mb-4">
                          <div className="col-md-6 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2 fw-semibold">SUBSPECIALTY</label>
                            <div className="bg-light p-3" style={{ borderRadius: "8px" }}>
                              {doctorData.subspecialty.map((item, index) => (
                                <div key={index} className="mb-1 small text-muted">• {item}</div>
                              ))}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted small mb-2 fw-semibold">MY SERVICES</label>
                            <div className="bg-light p-3" style={{ borderRadius: "8px" }}>
                              {doctorData.services.map((item, index) => (
                                <div key={index} className="mb-1 small text-muted">• {item}</div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Board Certifications */}
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2 fw-semibold">BOARD CERTIFICATIONS</label>
                          <div className="bg-light p-3" style={{ borderRadius: "8px" }}>
                            {doctorData.certifications.map((item, index) => (
                              <div key={index} className="mb-1 small text-muted">• {item}</div>
                            ))}
                          </div>
                        </div>

                        {/* Save Button */}
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
                              style={{ backgroundColor: "#4D227C", borderRadius: "8px" }}
                              onClick={() => setIsEditing(false)}
                            >
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Account Security Section */
                    <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0" style={{ color: "#4D227C" }}>
                            Account Security
                          </h5>
                          <button 
                            className="btn btn-link text-decoration-none p-0"
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            <i className="bi bi-pencil-square" style={{ fontSize: "20px", color: "#4D227C" }}></i>
                          </button>
                        </div>

                        {/* Email Field */}
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2">Email</label>
                          <input 
                            type="email" 
                            className="form-control border-0 bg-light"
                            style={{ borderRadius: "8px" }}
                            value={doctorData.email}
                            disabled={!isEditing}
                          />
                        </div>

                        {/* Password Field */}
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2">Password</label>
                          <input 
                            type="password" 
                            className="form-control border-0 bg-light"
                            style={{ borderRadius: "8px" }}
                            value={doctorData.password}
                            disabled={!isEditing}
                          />
                        </div>

                        {/* Save Button */}
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
                              style={{ backgroundColor: "#4D227C", borderRadius: "8px" }}
                              onClick={() => setIsEditing(false)}
                            >
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
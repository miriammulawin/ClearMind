import { useState, useEffect, useRef } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import DoctorSideBar from "./DoctorSideBar";
import DoctorTopNavbar from "./DoctorTopNavbar";

function DoctorProfile() {
  const [activeMenu, setActiveMenu] = useState("My Profile");
  const [isEditing, setIsEditing]   = useState(false);
  const fileInputRef                = useRef(null);

  // ── Read user from localStorage ─────────────────────────────────
  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  // ── Helpers ─────────────────────────────────────────────────────
  const computeAge = (dob) => {
    if (!dob) return "";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return String(age);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const parts = String(dateStr).split("T")[0].split("-");
      if (parts.length !== 3) return "";
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch { return ""; }
  };

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const safeParse = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  // ── Initialize form state from localStorage ──────────────────────
  const initForm = () => {
    const u = getUser();
    return {
      profileImage:    localStorage.getItem("profile_image") || null,
      firstName:       u?.firstName       || "",
      lastName:        u?.lastName        || "",
      middleInitial:   u?.middleInitial   || "",
      email:           u?.email           || "",
      contactNumber:   u?.contactNo       || "",
      dateOfBirth:     formatDate(u?.dob) || "",
      age:             computeAge(u?.dob) || "",
      gender:          capitalize(u?.sex) || "",
      prcNumber:       u?.prcNumber       || "Not set",
      bio:             u?.description     || "",
      specialty:       u?.specialty       || "",
      practicingSince: u?.practicingSince || "",
      credentials:     u?.credentials     || "",
      // list fields
      subspecialty:    safeParse(u?.subSpecializations),
      services:        safeParse(u?.services),
      certifications:  safeParse(u?.boardCertificates),
      // temp input fields for adding items
      newSubspecialty:   "",
      newService:        "",
      newCertification:  "",
      // password
      currentPassword: "",
      newPassword:     "",
      confirmPassword: "",
    };
  };

  const [form, setForm]           = useState(initForm);
  const [previewImage, setPreviewImage] = useState(localStorage.getItem("profile_image") || null);

  useEffect(() => {
    setForm(initForm());
    setPreviewImage(localStorage.getItem("profile_image") || null);
  }, []);

  const user     = getUser();
  const fullName = user?.fullName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Doctor";
  const initials = ((user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "")).toUpperCase() || "DR";

  // ── Handlers ────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewImage(ev.target.result);
      setForm(prev => ({ ...prev, profileImage: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const addToList = (field, inputField) => {
    const val = form[inputField]?.trim();
    if (!val) return;
    setForm(prev => ({
      ...prev,
      [field]:     [...prev[field], val],
      [inputField]: "",
    }));
  };

  const removeFromList = (field, index) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

 const handleSave = () => {
  const u = getUser();
  const updated = {
    ...u,
    description:        form.bio,
    specialty:          form.specialty,
    practicingSince:    form.practicingSince,
    credentials:        form.credentials,
    subSpecializations: JSON.stringify(form.subspecialty),
    services:           JSON.stringify(form.services),
    boardCertificates:  JSON.stringify(form.certifications),
    // also keep name fields in sync
    firstName:          form.firstName,
    lastName:           form.lastName,
    middleInitial:      form.middleInitial,
    contactNo:          form.contactNumber,
    email:              form.email,
  };
  localStorage.setItem("user", JSON.stringify(updated));

  if (form.profileImage) {
    localStorage.setItem("profile_image", form.profileImage);
  }

  // Tell the sidebar to re-read localStorage immediately
  window.dispatchEvent(new Event("profileUpdated"));

  setIsEditing(false);
};

  const handleCancel = () => {
    setForm(initForm());
    setPreviewImage(localStorage.getItem("profile_image") || null);
    setIsEditing(false);
  };

  // ── Reusable tag list ────────────────────────────────────────────
  const TagList = ({ items, field, inputField, placeholder }) => (
    <div>
      {isEditing && (
        <div className="d-flex gap-2 mb-2">
          <input
            type="text"
            className="form-control border-0 bg-light"
            style={{ borderRadius: "8px", height: "38px" }}
            placeholder={placeholder}
            value={form[inputField]}
            onChange={(e) => handleChange(inputField, e.target.value)}
            onKeyPress={(e) => { if (e.key === "Enter") { e.preventDefault(); addToList(field, inputField); }}}
          />
          <button
            type="button"
            className="btn text-white d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ backgroundColor: "#4D227C", width: "38px", height: "38px", borderRadius: "8px" }}
            onClick={() => addToList(field, inputField)}
          >
            <FiPlus size={16} />
          </button>
        </div>
      )}
      <div className="bg-light p-3" style={{ borderRadius: "8px", minHeight: "50px" }}>
        {items.length > 0 ? (
          <div className="d-flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span
                key={i}
                className="badge d-inline-flex align-items-center gap-1"
                style={{ backgroundColor: "#4D227C", padding: "6px 10px", fontSize: "0.82rem", fontWeight: "400", borderRadius: "20px" }}
              >
                {item}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => removeFromList(field, i)}
                    style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "0", lineHeight: 1, display: "flex" }}
                  >
                    <FiX size={13} />
                  </button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <span className="small text-muted">Not set</span>
        )}
      </div>
    </div>
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

                {/* ── Left Column ── */}
                <div className="col-lg-4 col-md-5">

                  {/* Profile Card */}
                  <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
                    <div className="card-body text-center p-4">

                      {/* Profile Image / Avatar */}
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center position-relative"
                        style={{
                          width: "180px", height: "180px",
                          border: "3px solid #4D227C",
                          borderRadius: "12px",
                          backgroundColor: "#e9d8f5",
                          overflow: "hidden",
                          cursor: isEditing ? "pointer" : "default",
                        }}
                        onClick={() => isEditing && fileInputRef.current?.click()}
                      >
                        {previewImage ? (
                          <img
                            src={previewImage}
                            alt="Profile"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontSize: "56px", fontWeight: "700", color: "#4D227C" }}>
                            {initials}
                          </span>
                        )}
                        {/* Overlay when editing */}
                        {isEditing && (
                          <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
                            style={{ backgroundColor: "rgba(77,34,124,0.55)", color: "white" }}
                          >
                            <i className="bi bi-camera" style={{ fontSize: "28px" }} />
                            <small style={{ fontSize: "11px", marginTop: "4px" }}>Change Photo</small>
                          </div>
                        )}
                      </div>

                      {/* Hidden file input */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="d-none"
                        onChange={handleImageChange}
                      />

                      <h5 className="fw-bold mb-1" style={{ color: "#2D3748" }}>{fullName}</h5>
                      {form.credentials && (
                        <p className="text-muted small mb-1">{form.credentials}</p>
                      )}
                      <p className="text-muted small mb-0">
                        PRC License No.: {form.prcNumber}
                      </p>
                    </div>
                  </div>

                  {/* Menu Card */}
                  <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
                    <div className="card-body p-3">
                      <div className="mb-3">
                        <small className="text-muted fw-semibold">MENU</small>
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {["Personal Information", "Account Security"].map((menu) => (
                          <button
                            key={menu}
                            className="btn d-flex align-items-center py-3 px-3 border-0"
                            style={{
                              backgroundColor: activeMenu === menu ? "#4D227C" : "transparent",
                              color:           activeMenu === menu ? "white"   : "#2D3748",
                              borderRadius: "8px", textAlign: "left",
                            }}
                            onClick={() => { setActiveMenu(menu); setIsEditing(false); }}
                          >
                            <i
                              className={`bi ${menu === "Personal Information" ? "bi-person" : "bi-shield-check"} me-3`}
                              style={{ color: activeMenu === menu ? "white" : "#4D227C" }}
                            />
                            {menu}
                          </button>
                        ))}
                        <button
                          className="btn d-flex align-items-center py-3 px-3 border-0"
                          style={{ backgroundColor: "transparent", color: "#DC2626", borderRadius: "8px", textAlign: "left" }}
                          onClick={() => { localStorage.clear(); window.location.href = "/"; }}
                        >
                          <i className="bi bi-box-arrow-right me-3" style={{ color: "#DC2626" }} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right Column ── */}
                <div className="col-lg-8 col-md-7">

                  {/* Bio + Specialty Card */}
                  <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
                    <div className="card-body p-4">
                      {isEditing && activeMenu === "Personal Information" ? (
                        <textarea
                          className="form-control border-0 bg-light mb-4"
                          style={{ borderRadius: "8px", minHeight: "80px", resize: "none" }}
                          placeholder="Write your bio..."
                          value={form.bio}
                          onChange={(e) => handleChange("bio", e.target.value)}
                        />
                      ) : (
                        <p className="text-muted mb-4" style={{ lineHeight: "1.8", textAlign: "justify" }}>
                          {form.bio || "No bio provided yet."}
                        </p>
                      )}

                      <div className="row">
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <div className="border-end pe-3">
                            <small className="text-muted d-block mb-1">MAIN SPECIALTY</small>
                            {isEditing && activeMenu === "Personal Information" ? (
                              <input
                                type="text"
                                className="form-control border-0 bg-light"
                                style={{ borderRadius: "8px" }}
                                value={form.specialty}
                                onChange={(e) => handleChange("specialty", e.target.value)}
                                placeholder="e.g. Cognitive Behavioral Therapy"
                              />
                            ) : (
                              <p className="fw-semibold mb-0" style={{ color: "#2D3748" }}>
                                {form.specialty || "Not set"}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="ps-sm-3">
                            <small className="text-muted d-block mb-1">PRACTICING SINCE</small>
                            {isEditing && activeMenu === "Personal Information" ? (
                              <input
                                type="text"
                                className="form-control border-0 bg-light"
                                style={{ borderRadius: "8px" }}
                                value={form.practicingSince}
                                onChange={(e) => handleChange("practicingSince", e.target.value)}
                                placeholder="e.g. 2011"
                              />
                            ) : (
                              <p className="fw-semibold mb-0" style={{ color: "#2D3748" }}>
                                {form.practicingSince || "Not set"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Personal Information ── */}
                  {activeMenu === "Personal Information" ? (
                    <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0" style={{ color: "#4D227C" }}>Personal Information</h5>
                          <button className="btn btn-link text-decoration-none p-0" onClick={() => setIsEditing(!isEditing)}>
                            <i className="bi bi-pencil-square" style={{ fontSize: "20px", color: "#4D227C" }} />
                          </button>
                        </div>

                        {/* Name */}
                        <div className="row mb-3">
                          <div className="col-md-4 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-1">First Name</label>
                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                              value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} disabled={!isEditing} />
                          </div>
                          <div className="col-md-4 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-1">Last Name</label>
                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                              value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} disabled={!isEditing} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label text-muted small mb-1">Middle Initial</label>
                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                              value={form.middleInitial} onChange={(e) => handleChange("middleInitial", e.target.value)} disabled={!isEditing} />
                          </div>
                        </div>

                        {/* Contact, DOB, Age, Gender */}
                        <div className="row mb-4">
                          <div className="col-md-3 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-1">Contact Number</label>
                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                              value={form.contactNumber} onChange={(e) => handleChange("contactNumber", e.target.value)} disabled={!isEditing} />
                          </div>
                          <div className="col-md-3 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-1">Date of Birth</label>
                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                              value={form.dateOfBirth} disabled />
                          </div>
                          <div className="col-md-3 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-1">Age</label>
                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                              value={form.age} disabled />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label text-muted small mb-1">Gender</label>
                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                              value={form.gender} disabled />
                          </div>
                        </div>

                        {/* Credentials */}
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-1 fw-semibold">CREDENTIALS</label>
                          <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                            placeholder="e.g. PhD, BPsy, RPm"
                            value={form.credentials} onChange={(e) => handleChange("credentials", e.target.value)} disabled={!isEditing} />
                        </div>

                        {/* Subspecialty */}
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2 fw-semibold">SUBSPECIALTY</label>
                          <TagList
                            items={form.subspecialty}
                            field="subspecialty"
                            inputField="newSubspecialty"
                            placeholder="Add subspecialty..."
                          />
                        </div>

                        {/* Services */}
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2 fw-semibold">MY SERVICES</label>
                          <TagList
                            items={form.services}
                            field="services"
                            inputField="newService"
                            placeholder="Add service..."
                          />
                        </div>

                        {/* Board Certifications */}
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2 fw-semibold">BOARD CERTIFICATIONS</label>
                          <TagList
                            items={form.certifications}
                            field="certifications"
                            inputField="newCertification"
                            placeholder="Add certification..."
                          />
                        </div>

                        {isEditing && (
                          <div className="d-flex gap-2 justify-content-end">
                            <button className="btn btn-outline-secondary" style={{ borderRadius: "8px" }} onClick={handleCancel}>Cancel</button>
                            <button className="btn text-white" style={{ backgroundColor: "#4D227C", borderRadius: "8px" }} onClick={handleSave}>Save Changes</button>
                          </div>
                        )}
                      </div>
                    </div>

                  ) : (
                    /* ── Account Security ── */
                    <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0" style={{ color: "#4D227C" }}>Account Security</h5>
                          <button className="btn btn-link text-decoration-none p-0" onClick={() => setIsEditing(!isEditing)}>
                            <i className="bi bi-pencil-square" style={{ fontSize: "20px", color: "#4D227C" }} />
                          </button>
                        </div>

                        <div className="mb-4">
                          <label className="form-label text-muted small mb-1">Email</label>
                          <input type="email" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                            value={form.email} onChange={(e) => handleChange("email", e.target.value)} disabled={!isEditing} />
                        </div>

                        {isEditing && (
                          <>
                            <div className="mb-3">
                              <label className="form-label text-muted small mb-1">Current Password</label>
                              <input type="password" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                                placeholder="Enter current password"
                                value={form.currentPassword} onChange={(e) => handleChange("currentPassword", e.target.value)} />
                            </div>
                            <div className="mb-3">
                              <label className="form-label text-muted small mb-1">New Password</label>
                              <input type="password" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                                placeholder="Enter new password"
                                value={form.newPassword} onChange={(e) => handleChange("newPassword", e.target.value)} />
                            </div>
                            <div className="mb-4">
                              <label className="form-label text-muted small mb-1">Confirm New Password</label>
                              <input type="password" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                                placeholder="Confirm new password"
                                value={form.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} />
                            </div>
                          </>
                        )}

                        {!isEditing && (
                          <div className="mb-4">
                            <label className="form-label text-muted small mb-1">Password</label>
                            <input type="password" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                              value="************************" disabled />
                          </div>
                        )}

                        {isEditing && (
                          <div className="d-flex gap-2 justify-content-end">
                            <button className="btn btn-outline-secondary" style={{ borderRadius: "8px" }} onClick={handleCancel}>Cancel</button>
                            <button className="btn text-white" style={{ backgroundColor: "#4D227C", borderRadius: "8px" }} onClick={handleSave}>Save Changes</button>
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
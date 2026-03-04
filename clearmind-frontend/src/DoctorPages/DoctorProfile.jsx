import { useState, useEffect, useRef } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import DoctorSideBar from "./DoctorSideBar";
import DoctorTopNavbar from "./DoctorTopNavbar";
import Swal from "sweetalert2";
import axiosClient from "../axiosClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// ── Resolves any image path/URL the backend returns into a full URL ──
const resolveImageUrl = (raw) => {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const clean = raw.replace(/^\/+/, "");
  if (clean.startsWith("storage/")) return `http://127.0.0.1:8000/${clean}`;
  return `http://127.0.0.1:8000/storage/${clean}`;
};

function DoctorProfile() {
  const [activeMenu,  setActiveMenu]  = useState("My Profile");
  const [isEditing,   setIsEditing]   = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const fileInputRef                  = useRef(null);
  const navigate                      = useNavigate();
  const [profileFile, setProfileFile] = useState(null);

  // ── Fetch fresh profile from API ─────────────────────────────────
  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get("/profile");
      const user    = res.data.user    || {};
      const profile = res.data.profile || {};

      // ── FIX: image lives in res.data.profile.profile_picture ──
      const rawImage = profile.profile_picture || user.profilePictureUrl || null;
      const imageUrl = resolveImageUrl(rawImage);

      if (imageUrl) localStorage.setItem("profile_image", imageUrl);
      setPreviewImage(imageUrl || localStorage.getItem("profile_image") || null);

      // Sync full user to localStorage
      localStorage.setItem("user", JSON.stringify({ ...user, ...profile }));

      setForm({
        profileImage:    imageUrl || null,
        firstName:       user.firstName     || "",
        lastName:        user.lastName      || "",
        middleInitial:   user.middleInitial || "",
        email:           user.email         || "",
        contactNumber:   user.contactNo     || "",
        dateOfBirth:     formatDate(user.dob) || "",
        age:             computeAge(user.dob) || "",
        gender:          capitalize(user.sex) || "",

        // ── FIX: read from profile (snake_case) not user ──
        prcNumber:       profile.prc_number        || profile.license_number || "Not set",
        bio:             profile.description        || "",
        specialty:       safeParse(profile.specializations)[0] || "",
        practicingSince: profile.practicing_since   || "",
        credentials:     profile.professional_title || "",

        subspecialty:   safeParse(profile.sub_specializations),
        services:        safeParse(profile.services),
        certifications:  safeParse(profile.board_certificates),

        newSubspecialty:  "",
        newService:       "",
        newCertification: "",
        currentPassword:  "",
        newPassword:      "",
        confirmPassword:  "",
      });

      // Notify sidebar to refresh
      window.dispatchEvent(new Event("profileUpdated"));

    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────
  const handleLogout = async () => {
    const result = await Swal.fire({
      title:             "Are you sure?",
      text:              "You will be logged out.",
      icon:              "warning",
      showCancelButton:  true,
      confirmButtonText: "Yes, logout",
      cancelButtonText:  "Cancel",
      reverseButtons:    true,
      confirmButtonColor:"#a276d0",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await axiosClient.post("/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("profile_image");

      Swal.fire({
        icon:              "success",
        title:             "Logged out successfully!",
        showConfirmButton: false,
        timer:             1500,
        toast:             true,
        position:          "top-end",
      });

      setTimeout(() => navigate("/"), 1500);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const getUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

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

  // ── Initialize form from localStorage (before API responds) ──────
  const initForm = () => {
    const u = getUser();
    return {
      profileImage:    resolveImageUrl(localStorage.getItem("profile_image")),
      firstName:       u?.firstName       || u?.first_name        || "",
      lastName:        u?.lastName        || u?.last_name         || "",
      middleInitial:   u?.middleInitial   || "",
      email:           u?.email           || "",
      contactNumber:   u?.contactNo       || "",
      dateOfBirth:     formatDate(u?.dob) || "",
      age:             computeAge(u?.dob) || "",
      gender:          capitalize(u?.sex) || "",

      // Support both camelCase and snake_case from merged localStorage
      prcNumber:       u?.prc_number          || u?.prcNumber       || u?.license_number || u?.licenseNumber || "Not set",
      bio:             u?.description         || "",
      specialty:       u?.specialty           || safeParse(u?.specializations)[0] || "",
      practicingSince: u?.practicing_since    || u?.practicingSince || "",
      credentials:     u?.professional_title  || u?.professionalTitle || u?.credentials || "",

      subspecialty:    safeParse(u?.sub_specializations || u?.subSpecializations),
      services:        safeParse(u?.services),
      certifications:  safeParse(u?.board_certificates  || u?.boardCertificates),

      newSubspecialty:  "",
      newService:       "",
      newCertification: "",
      currentPassword:  "",
      newPassword:      "",
      confirmPassword:  "",
    };
  };

  const [form,         setForm]         = useState(initForm);
  const [previewImage, setPreviewImage] = useState(
    () => resolveImageUrl(localStorage.getItem("profile_image"))
  );

  useEffect(() => {
    fetchProfile();

    const handleProfileUpdated = () => {
      setPreviewImage(resolveImageUrl(localStorage.getItem("profile_image")));
    };
    window.addEventListener("profileUpdated", handleProfileUpdated);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdated);
  }, []);

  const user     = getUser();
  const firstName = user?.firstName || user?.first_name || "";
  const lastName  = user?.lastName  || user?.last_name  || "";
  const fullName  = user?.fullName  || `${firstName}${user?.middleInitial ? " " + user.middleInitial + "." : ""} ${lastName}`.trim() || "Doctor";
  const initials  = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "DR";

  // ── Handlers ─────────────────────────────────────────────────────
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileFile(file);
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
      [field]:      [...prev[field], val],
      [inputField]: "",
    }));
  };

  const removeFromList = (field, index) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // ── Save profile ─────────────────────────────────────────────────
  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const payload = new FormData();

      if (profileFile) payload.append("profile_picture", profileFile);

      payload.append("professional_title",  form.credentials || form.specialty || "");
      payload.append("description",         form.bio || "");
      payload.append("years_of_experience", form.yearsOfExperience || "");
      payload.append("license_number",      form.prcNumber === "Not set" ? "" : form.prcNumber || "");
      payload.append("prc_number",          form.prcNumber === "Not set" ? "" : form.prcNumber || "");
      payload.append("practicing_since",    form.practicingSince || "");
      payload.append("first_name",          form.firstName);
      payload.append("last_name",           form.lastName);
      payload.append("middle_initial",      form.middleInitial);
      payload.append("contact_no",          form.contactNumber);

      payload.append("specializations",     JSON.stringify(Array.isArray(form.subspecialty)    ? form.subspecialty    : []));
      payload.append("sub_specializations", JSON.stringify(Array.isArray(form.subspecialty)    ? form.subspecialty    : []));
      payload.append("board_certificates",  JSON.stringify(Array.isArray(form.certifications)  ? form.certifications  : []));
      payload.append("services",            JSON.stringify(Array.isArray(form.services)        ? form.services        : []));

      const res = await axiosClient.post("/doctor/setup", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ── FIX: read image from res.data.profile first, then fallback ──
      const updatedProfile = res.data.profile || {};
      const updatedUser    = res.data.user    || {};

      const rawImage =
        updatedProfile.profile_picture  ||
        updatedUser.profilePictureUrl   ||
        updatedUser.profile_picture     ||
        null;

      const imageUrl = resolveImageUrl(rawImage);
      if (imageUrl) {
        localStorage.setItem("profile_image", imageUrl);
        setPreviewImage(imageUrl);
      }

      localStorage.setItem("user", JSON.stringify({ ...updatedUser, ...updatedProfile }));

      window.dispatchEvent(new Event("profileUpdated"));
      setProfileFile(null);
      toast.success("Profile saved!");
      setIsEditing(false);

      // Re-fetch to sync all fields cleanly
      await fetchProfile();

    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        "Failed to save. Please try again.";
      toast.error(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Save password ─────────────────────────────────────────────────
  const handleSavePassword = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSaveLoading(true);
    try {
      await axiosClient.post("/change-password", {
        current_password:          form.currentPassword,
        new_password:              form.newPassword,
        new_password_confirmation: form.confirmPassword,
      });
      toast.success("Password updated successfully!", {
        duration: 2000,
        style: { background: "#E2F7E3", border: "1px solid #91C793", color: "#2E7D32", fontWeight: 600, borderRadius: "10px" },
      });
      setForm(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      setIsEditing(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password.";
      toast.error(msg);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(initForm());
    setPreviewImage(resolveImageUrl(localStorage.getItem("profile_image")));
    setProfileFile(null);
    setIsEditing(false);
  };

  // ── Reusable tag list ─────────────────────────────────────────────
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
                            onError={() => setPreviewImage(null)}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span style={{ fontSize: "56px", fontWeight: "700", color: "#4D227C" }}>
                            {initials}
                          </span>
                        )}
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
                          onClick={handleLogout}
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

                        <div className="mb-4">
                          <label className="form-label text-muted small mb-1 fw-semibold">CREDENTIALS</label>
                          <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }}
                            placeholder="e.g. PhD, BPsy, RPm"
                            value={form.credentials} onChange={(e) => handleChange("credentials", e.target.value)} disabled={!isEditing} />
                        </div>

                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2 fw-semibold">SUBSPECIALTY</label>
                          <TagList items={form.subspecialty} field="subspecialty" inputField="newSubspecialty" placeholder="Add subspecialty..." />
                        </div>

                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2 fw-semibold">MY SERVICES</label>
                          <TagList items={form.services} field="services" inputField="newService" placeholder="Add service..." />
                        </div>

                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2 fw-semibold">BOARD CERTIFICATIONS</label>
                          <TagList items={form.certifications} field="certifications" inputField="newCertification" placeholder="Add certification..." />
                        </div>

                        {isEditing && (
                          <div className="d-flex gap-2 justify-content-end">
                            <button className="btn btn-outline-secondary" style={{ borderRadius: "8px" }} onClick={handleCancel} disabled={saveLoading}>
                              Cancel
                            </button>
                            <button className="btn text-white" style={{ backgroundColor: "#4D227C", borderRadius: "8px", minWidth: "110px" }} onClick={handleSave} disabled={saveLoading}>
                              {saveLoading ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  ) : (
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
                            value={form.email} disabled />
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
                            <button className="btn btn-outline-secondary" style={{ borderRadius: "8px" }} onClick={handleCancel} disabled={saveLoading}>
                              Cancel
                            </button>
                            <button className="btn text-white" style={{ backgroundColor: "#4D227C", borderRadius: "8px", minWidth: "110px" }} onClick={handleSavePassword} disabled={saveLoading}>
                              {saveLoading ? "Saving..." : "Save Changes"}
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
import { useState, useEffect, useCallback } from "react";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import EditPersonalInfoModal from "./components/EditPersonalInfoModal";
import EditAccountSecurityModal from "./components/EditAccountSecurityModal";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axiosClient from "../axiosClient";

// ── Resolve image URLs from backend ─────────────────────────────────────────
const resolveImageUrl = (raw) => {
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const clean = raw.replace(/^\/+/, "");
  if (clean.startsWith("storage/")) return `http://127.0.0.1:8000/${clean}`;
  return `http://127.0.0.1:8000/storage/${clean}`;
};

// ── Extract helpers (replaces dataHelpers imports) ───────────────────────────
const extractNames = (arr) =>
  Array.isArray(arr)
    ? arr.map((s) => (typeof s === "object" && s.name ? s.name : s)).filter(Boolean)
    : [];

const extractMainSpecialty = (specializations) => {
  if (!Array.isArray(specializations)) return "";
  const main = specializations.find((s) => s?.pivot?.is_main === 1 || s?.pivot?.is_main === true);
  return main?.name || "";
};

function DoctorProfile() {
  const [activeMenu, setActiveMenu] = useState("My Profile");
  const [profileTab, setProfileTab] = useState("Personal Information");
  const [certIndex, setCertIndex] = useState(0);
  const [idIndex, setIdIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [fullscreenType, setFullscreenType] = useState(null);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // ── Live profile state ──────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await axiosClient.get("/profile");
      // Support both shapes: { user, profile } or flat { user } where profile fields live on user
      const userData = res.data.user || {};
      const profileData = res.data.profile || {};
      setUser(userData);
      // Merge profile-level fields — prefer dedicated profile object, fall back to user object
      setProfile({
        description:       profileData.description       ?? userData.description,
        professional_title: profileData.professional_title ?? userData.professionalTitle,
        prc_number:        profileData.prc_number        ?? userData.prcNumber,
        license_number:    profileData.license_number    ?? userData.licenseNumber,
        practicing_since:  profileData.practicing_since  ?? userData.practicingSince,
        years_of_experience: profileData.years_of_experience ?? userData.yearsOfExperience,
        profile_picture:   profileData.profile_picture   ?? userData.profilePictureUrl,
        specializations:   profileData.specializations   ?? userData.specializations   ?? [],
        sub_specializations: profileData.sub_specializations ?? userData.subSpecializations ?? [],
        board_certificates: profileData.board_certificates ?? userData.boardCertificates ?? [],
        services:          profileData.services          ?? userData.services           ?? [],
        certificate_images: profileData.certificate_images ?? (userData.certificateImageUrl ? [userData.certificateImageUrl] : []),
        id_pictures:       profileData.id_pictures       ?? [],
        ...profileData, // keep any extra fields from profile
      });
    } catch (err) {
      console.error("[DoctorProfile] Failed to fetch profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    setActiveMenu("My Profile");
    fetchProfile();
  }, [fetchProfile]);

  // Re-fetch whenever the setup/edit modal fires profileUpdated
  useEffect(() => {
    const handler = () => fetchProfile();
    window.addEventListener("profileUpdated", handler);
    return () => window.removeEventListener("profileUpdated", handler);
  }, [fetchProfile]);

  // ── Derived display values ───────────────────────────────────────────────
  const profileImageUrl =
    resolveImageUrl(profile?.profile_picture) ||
    localStorage.getItem("profile_image") ||
    null;

  const specializations  = extractNames(profile?.specializations);
  const subSpecializations = extractNames(profile?.sub_specializations);
  const services         = extractNames(profile?.services);
  const boardCerts       = extractNames(profile?.board_certificates);
  const mainSpecialty    = extractMainSpecialty(profile?.specializations);

  const certificateImages = Array.isArray(profile?.certificate_images)
    ? profile.certificate_images.map(resolveImageUrl).filter(Boolean)
    : [];

  const idImages = Array.isArray(profile?.id_pictures)
    ? profile.id_pictures.map(resolveImageUrl).filter(Boolean)
    : [];

  // ── Carousel helpers ────────────────────────────────────────────────────
  const nextCert = () => setCertIndex((p) => (p === certificateImages.length - 1 ? 0 : p + 1));
  const prevCert = () => setCertIndex((p) => (p === 0 ? certificateImages.length - 1 : p - 1));
  const nextId   = () => setIdIndex((p) => (p === idImages.length - 1 ? 0 : p + 1));
  const prevId   = () => setIdIndex((p) => (p === 0 ? idImages.length - 1 : p - 1));

  const openFullscreen = (type, index) => {
    setFullscreenType(type);
    setFullscreenImage(type === "cert" ? certificateImages[index] : idImages[index]);
  };

  const nextFullscreenImage = () => {
    if (fullscreenType === "cert") {
      const i = certIndex === certificateImages.length - 1 ? 0 : certIndex + 1;
      setCertIndex(i);
      setFullscreenImage(certificateImages[i]);
    } else {
      const i = idIndex === idImages.length - 1 ? 0 : idIndex + 1;
      setIdIndex(i);
      setFullscreenImage(idImages[i]);
    }
  };

  const prevFullscreenImage = () => {
    if (fullscreenType === "cert") {
      const i = certIndex === 0 ? certificateImages.length - 1 : certIndex - 1;
      setCertIndex(i);
      setFullscreenImage(certificateImages[i]);
    } else {
      const i = idIndex === 0 ? idImages.length - 1 : idIndex - 1;
      setIdIndex(i);
      setFullscreenImage(idImages[i]);
    }
  };

  const getCurrentIndex = () => (fullscreenType === "cert" ? certIndex : idIndex);
  const getTotalImages  = () => (fullscreenType === "cert" ? certificateImages.length : idImages.length);

  const carrowBtn = (fn, side, Icon) => (
    <button
      key={side}
      onClick={fn}
      style={{
        position: "absolute", [side]: "10px", top: "50%",
        transform: "translateY(-50%)", background: "rgba(77,34,124,0.8)",
        border: "none", borderRadius: "50%", width: "40px", height: "40px",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "white",
      }}
    >
      <Icon />
    </button>
  );

  // ── Loading state ────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="doctor-layout">
        <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        <div className="doctor-main">
          <DoctorTopNavbar activeMenu={activeMenu} />
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
            <div className="spinner-border" style={{ color: "#4D227C" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Friendly display values ──────────────────────────────────────────────
  const displayName = user
    ? [user.firstName, user.middleInitial ? user.middleInitial + "." : "", user.lastName]
        .filter(Boolean).join(" ")
    : "—";

  const displayCredentials = profile?.professional_title || user?.professionalTitle || "—";
  const displayLicense     = (profile?.prc_number || user?.prcNumber)
    ? `PRC License No.: ${profile?.prc_number || user?.prcNumber}`
    : "—";

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className="doctor-content" style={{ padding: "20px" }}>
          <div className="myprofile-container">
            <div className="container-fluid">
              <div className="row g-4">

                {/* ── Left Column ─────────────────────────────────────── */}
                <div className="col-lg-4 col-md-5">
                  <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px", minHeight: "300px" }}>
                    <div className="card-body text-center">
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center overflow-hidden"
                        style={{ width: "200px", height: "200px", border: "3px solid #4D227C", borderRadius: "12px", backgroundColor: "#F8F9FA" }}
                      >
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt="Profile"
                            onError={(e) => { e.target.style.display = "none"; }}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <i className="bi bi-person" style={{ fontSize: "100px", color: "#4D227C" }}></i>
                        )}
                      </div>
                      <h5 className="fw-bold mb-1" style={{ color: "#2D3748" }}>{displayName}</h5>
                      <p className="text-muted small mb-1" style={{ color: "#4D227C" }}>{displayCredentials}</p>
                      <p className="text-muted small mb-0">{displayLicense}</p>
                    </div>
                  </div>

                  <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
                    <div className="card-body p-3">
                      <div className="mb-3">
                        <small className="text-muted fw-semibold">MENU</small>
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {["Personal Information", "Account Security"].map((tab) => (
                          <button
                            key={tab}
                            className="btn d-flex align-items-center py-3 px-3 border-0"
                            style={{
                              backgroundColor: profileTab === tab ? "#4D227C" : "transparent",
                              color: profileTab === tab ? "white" : "#2D3748",
                              borderRadius: "8px", textAlign: "left",
                            }}
                            onClick={() => setProfileTab(tab)}
                          >
                            <i
                              className={`bi ${tab === "Personal Information" ? "bi-person" : "bi-shield-check"} me-3`}
                              style={{ color: profileTab === tab ? "white" : "#4D227C" }}
                            />
                            {tab}
                          </button>
                        ))}
                        <button
                          className="btn d-flex align-items-center py-3 px-3 border-0"
                          style={{ backgroundColor: "transparent", color: "#2D3748", borderRadius: "8px", textAlign: "left" }}
                        >
                          <i className="bi bi-box-arrow-right me-3" style={{ color: "#4D227C" }} />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right Column ─────────────────────────────────────── */}
                <div className="col-lg-8 col-md-7">

                  {/* Bio Card */}
                  <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "12px" }}>
                    <div className="card-body p-4">
                      <p className="text-muted mb-4" style={{ lineHeight: "1.8", textAlign: "justify" }}>
                        {profile?.description || "No description provided."}
                      </p>
                      <div className="row">
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <div className="border-end pe-3">
                            <small className="text-muted d-block mb-1" style={{ color: "#4D227C" }}>MAIN SPECIALTY</small>
                            <p className="fw-semibold mb-0" style={{ color: "#2D3748" }}>
                              {mainSpecialty || "Not set"}
                            </p>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="ps-sm-3">
                            <small className="text-muted d-block mb-1" style={{ color: "#4D227C" }}>PRACTICING SINCE</small>
                            <p className="fw-semibold mb-0" style={{ color: "#2D3748" }}>
                              {profile?.practicing_since || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Personal Information Tab ─────────────────────── */}
                  {profileTab === "Personal Information" ? (
                    <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0" style={{ color: "#4D227C" }}>Personal Information</h5>
                          <button className="btn btn-link text-decoration-none p-0" onClick={() => setShowPersonalModal(true)}>
                            <i className="bi bi-pencil-square" style={{ fontSize: "20px", color: "#4D227C" }} />
                          </button>
                        </div>

                        {/* Name Row */}
                        <div className="row mb-3">
                          {[["First Name", user?.firstName], ["Last Name", user?.lastName], ["Middle Initial", user?.middleInitial]].map(([label, val]) => (
                            <div className="col-md-4 mb-3 mb-md-0" key={label}>
                              <label className="form-label text-muted small mb-2">{label}</label>
                              <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }} value={val || "—"} readOnly />
                            </div>
                          ))}
                        </div>

                        {/* Contact / DOB / Age / Gender Row */}
                        <div className="row mb-3">
                          {[
                            ["Contact Number", user?.contactNo],
                            ["Date of Birth",  user?.dob],
                            ["Gender",         user?.sex],
                            ["Email",          user?.email],
                          ].map(([label, val]) => (
                            <div className="col-md-3 mb-3 mb-md-0" key={label}>
                              <label className="form-label text-muted small mb-2">{label}</label>
                              <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }} value={val || "—"} readOnly />
                            </div>
                          ))}
                        </div>

                        {/* Address */}
                        <div className="row mb-4">
                          <div className="col-12">
                            <label className="form-label text-muted small mb-2">Address</label>
                            <input type="text" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }} value={user?.address || "—"} readOnly />
                          </div>
                        </div>

                        {/* Specializations & Services */}
                        <div className="row mb-4">
                          <div className="col-md-6 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2 fw-semibold">SPECIALIZATIONS</label>
                            <div className="bg-light p-3" style={{ borderRadius: "8px" }}>
                              {specializations.length > 0
                                ? specializations.map((item, i) => <div key={i} className="mb-1 small text-muted">• {item}</div>)
                                : <div className="small text-muted">No specializations added</div>}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted small mb-2 fw-semibold">MY SERVICES</label>
                            <div className="bg-light p-3" style={{ borderRadius: "8px" }}>
                              {services.length > 0
                                ? services.map((item, i) => <div key={i} className="mb-1 small text-muted">• {item}</div>)
                                : <div className="small text-muted">No services added</div>}
                            </div>
                          </div>
                        </div>

                        {/* Sub-Specializations */}
                        {subSpecializations.length > 0 && (
                          <div className="mb-4">
                            <label className="form-label text-muted small mb-2 fw-semibold">SUB-SPECIALIZATIONS</label>
                            <div className="bg-light p-3" style={{ borderRadius: "8px" }}>
                              {subSpecializations.map((item, i) => (
                                <div key={i} className="mb-1 small text-muted">• {item}</div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Board Certifications */}
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2 fw-semibold">BOARD CERTIFICATIONS</label>
                          <div className="bg-light p-3" style={{ borderRadius: "8px" }}>
                            {boardCerts.length > 0
                              ? boardCerts.map((cert, i) => (
                                  <div key={i} className="mb-1 small text-muted">• {cert}</div>
                                ))
                              : <div className="small text-muted">No board certifications</div>}
                          </div>
                        </div>

                        {/* Certificate Images Carousel */}
                        <div className="row mb-4">
                          <div className="col-md-6 mb-3 mb-md-0">
                            <label className="form-label text-muted small mb-2 fw-semibold">BOARD CERTIFICATE</label>
                            {certificateImages.length > 0 ? (
                              <div className="position-relative bg-light d-flex align-items-center justify-content-center" style={{ borderRadius: "8px", height: "280px", overflow: "hidden" }}>
                                <img
                                  src={certificateImages[certIndex]}
                                  alt={`Certificate ${certIndex + 1}`}
                                  onClick={() => openFullscreen("cert", certIndex)}
                                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", cursor: "pointer", transition: "transform 0.2s" }}
                                  onMouseEnter={(e) => (e.target.style.transform = "scale(1.02)")}
                                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                                />
                                {certificateImages.length > 1 && (
                                  <>
                                    {carrowBtn(prevCert, "left", FaChevronLeft)}
                                    {carrowBtn(nextCert, "right", FaChevronRight)}
                                  </>
                                )}
                                <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "12px" }}>
                                  {certIndex + 1} / {certificateImages.length}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-light d-flex align-items-center justify-content-center" style={{ borderRadius: "8px", height: "120px" }}>
                                <span className="text-muted small">No certificates uploaded</span>
                              </div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label className="form-label text-muted small mb-2 fw-semibold">ID CARDS</label>
                            {idImages.length > 0 ? (
                              <div className="position-relative bg-light d-flex align-items-center justify-content-center" style={{ borderRadius: "8px", height: "280px", overflow: "hidden" }}>
                                <img
                                  src={idImages[idIndex]}
                                  alt={`ID ${idIndex + 1}`}
                                  onClick={() => openFullscreen("id", idIndex)}
                                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", cursor: "pointer", transition: "transform 0.2s" }}
                                  onMouseEnter={(e) => (e.target.style.transform = "scale(1.02)")}
                                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                                />
                                {idImages.length > 1 && (
                                  <>
                                    {carrowBtn(prevId, "left", FaChevronLeft)}
                                    {carrowBtn(nextId, "right", FaChevronRight)}
                                  </>
                                )}
                                <div style={{ position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "12px" }}>
                                  {idIndex + 1} / {idImages.length}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-light d-flex align-items-center justify-content-center" style={{ borderRadius: "8px", height: "120px" }}>
                                <span className="text-muted small">No ID cards uploaded</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                  ) : (
                    /* ── Account Security Tab ──────────────────────────── */
                    <div className="card shadow-sm border-0" style={{ borderRadius: "12px", minHeight: "400px" }}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 className="fw-bold mb-0" style={{ color: "#4D227C" }}>Account Security</h5>
                          <button className="btn btn-link text-decoration-none p-0" onClick={() => setShowSecurityModal(true)}>
                            <i className="bi bi-pencil-square" style={{ fontSize: "20px", color: "#4D227C" }} />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2">Email</label>
                          <input type="email" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }} value={user?.email || "—"} readOnly />
                        </div>
                        <div className="mb-4">
                          <label className="form-label text-muted small mb-2">Password</label>
                          <input type="password" className="form-control border-0 bg-light" style={{ borderRadius: "8px" }} value="************************" readOnly />
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

      {/* ── Fullscreen Image Modal ─────────────────────────────────────── */}
      {fullscreenImage && (
        <div
          onClick={() => { setFullscreenImage(null); setFullscreenType(null); }}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", maxWidth: "900px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", position: "relative" }}
          >
            <button
              onClick={() => { setFullscreenImage(null); setFullscreenType(null); }}
              style={{ position: "absolute", top: "15px", right: "15px", background: "#f3f4f6", border: "none", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "24px", color: "#374151", zIndex: 10 }}
            >×</button>
            <div style={{ marginBottom: "15px", textAlign: "center", color: "#4D227C", fontWeight: "600", fontSize: "18px" }}>
              {fullscreenType === "cert" ? "Board Certificate" : "ID Card"}
            </div>
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "12px", backgroundColor: "#f9fafb", minHeight: "500px" }}>
              <img src={fullscreenImage} alt="View" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", border: "4px solid #4D227C", borderRadius: "8px", boxShadow: "0 4px 12px rgba(77,34,124,0.2)" }} />
              <button onClick={(e) => { e.stopPropagation(); prevFullscreenImage(); }} style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", background: "rgba(77,34,124,0.9)", border: "none", borderRadius: "50%", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                <FaChevronLeft />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextFullscreenImage(); }} style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", background: "rgba(77,34,124,0.9)", border: "none", borderRadius: "50%", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
                <FaChevronRight />
              </button>
              <div style={{ position: "absolute", bottom: "15px", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", color: "white", padding: "6px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "500" }}>
                {getCurrentIndex() + 1} / {getTotalImages()}
              </div>
            </div>
          </div>
        </div>
      )}

      <EditPersonalInfoModal
        show={showPersonalModal}
        onClose={() => setShowPersonalModal(false)}
        doctorData={{ user, profile }}
        onSave={() => fetchProfile()}
      />
      <EditAccountSecurityModal
        show={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        doctorData={{ user, profile }}
        onSave={() => fetchProfile()}
      />
    </div>
  );
}

export default DoctorProfile;
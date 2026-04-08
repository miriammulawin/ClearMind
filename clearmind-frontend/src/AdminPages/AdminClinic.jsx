import React, { useState, useEffect, useRef } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import {
  FiEdit,
  FiX,
  FiToggleLeft,
  FiToggleRight,
  FiPlus,
  FiTrash2,
  FiImage,
} from "react-icons/fi";
import { FaClinicMedical, FaBrain } from "react-icons/fa";
import { TiVideo } from "react-icons/ti";
import styles from "./AdminStyle/AdminClinic.module.css";

/* ─── Config ─── */
const API_BASE = "http://localhost:8000/api/admin";
const getToken = () => localStorage.getItem("token");

/* ─── Defaults ─── */
const DEFAULT_SCHEDULE = {
  Monday: { start: "09:00", end: "17:00", closed: false },
  Tuesday: { start: "09:00", end: "17:00", closed: false },
  Wednesday: { start: "09:00", end: "17:00", closed: false },
  Thursday: { start: "09:00", end: "17:00", closed: false },
  Friday: { start: "09:00", end: "17:00", closed: false },
  Saturday: { start: "09:00", end: "17:00", closed: true },
  Sunday: { start: "09:00", end: "17:00", closed: true },
};

const EMPTY_FORM = {
  type: "Physical",
  name: "",
  blk: "",
  barangay: "",
  city: "",
  province: "",
  region: "",
  zip: "",
  description: "",
  schedule: DEFAULT_SCHEDULE,
  paymentMethod: "Gcash",
  consultationAmount: "",
  confirm: false,
  // image state
  clinicImageFile: null,
  clinicImagePreview: null,
  existingClinicImage: null,
  qrImageFile: null,
  qrImagePreview: null,
  existingQrImage: null,
};

const INITIAL_SERVICES = [
  {
    id: "0",
    title: "Psychotherapy and Counseling",
    description:
      "Helps individuals understand and manage their thoughts, emotions, and behaviors in a healthy way.",
    price: "",
    available: true,
    subServices: [],
  },
  {
    id: "1",
    title: "Psychological Assessment and Evaluation",
    description:
      "Gathers and integrates data about a person's mental, emotional, cognitive, behavioral, personality, and social functioning.",
    price: "",
    available: true,
    subServices: [
      { id: "1-0", title: "VAWC Purpose", price: "", available: true },
      {
        id: "1-1",
        title: "Adoption or Other Legal Purposes",
        price: "",
        available: true,
      },
      {
        id: "1-2",
        title: "School / Academic Support",
        price: "",
        available: true,
      },
      { id: "1-3", title: "Work-related Purpose", price: "", available: true },
      {
        id: "1-4",
        title: "Pre-Employment Purpose",
        price: "",
        available: true,
      },
      {
        id: "1-5",
        title: "Emotional Support Animal (ESA) Certification",
        price: "",
        available: true,
      },
      {
        id: "1-6",
        title: "Mental Health Certification",
        price: "",
        available: true,
      },
    ],
  },
];

/* ─── Map API → card ─── */
const mapClinic = (s) => ({
  id: s.clinic_id,
  type: s.clinic_type === "Physical" ? "Physical Clinic" : "Online Clinic",
  icon: s.clinic_type === "Physical" ? "physical" : "online",
  days:
    Object.entries(s.clinic_schedule || {})
      .filter(([, v]) => !v.closed)
      .map(([d]) => d)
      .join(", ") || "—",
  fee: s.clinic_fee || "—",
  payment: s.clinic_paymentMethod || "—",
  address: s.clinic_address || "—",
  _raw: s,
});

/* ════════════════════════════════════════════ */
export default function AdminClinic() {
  const [activeMenu, setActiveMenu] = useState("Clinic & Services");

  /* clinics */
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  /* modal */
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  /* file input refs */
  const clinicImgRef = useRef(null);
  const qrImgRef = useRef(null);

  /* services */
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [expandedIds, setExpandedIds] = useState(["1"]);
  const [showAddSvc, setShowAddSvc] = useState(false);
  const [newSvcTitle, setNewSvcTitle] = useState("");
  const [newSvcDesc, setNewSvcDesc] = useState("");
  const [addPurposeFor, setAddPurposeFor] = useState(null);
  const [newPurpose, setNewPurpose] = useState("");

  /* ── fetch on mount ── */
  useEffect(() => {
    fetchClinics();
  }, []);

  async function fetchClinics() {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE}/clinics`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} — ${txt.slice(0, 200)}`);
      }
      const json = await res.json();
      setClinics((json.data || []).map(mapClinic));
    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── open create ── */
  function openCreate() {
    setIsEdit(false);
    setEditId(null);
    setForm({ ...EMPTY_FORM, schedule: { ...DEFAULT_SCHEDULE } });
    if (clinicImgRef.current) clinicImgRef.current.value = "";
    if (qrImgRef.current) qrImgRef.current.value = "";
    setShowModal(true);
  }

  /* ── open edit ── */
  function openEdit(clinic) {
    const r = clinic._raw || {};
    const schedule =
      r.clinic_schedule && typeof r.clinic_schedule === "object"
        ? r.clinic_schedule
        : { ...DEFAULT_SCHEDULE };

    setIsEdit(true);
    setEditId(clinic.id);
    setForm({
      ...EMPTY_FORM,
      type: r.clinic_type === "Online" ? "Online" : "Physical",
      name: r.clinic_name || "",
      blk: r.blk || "",
      barangay: r.barangay || "",
      city: r.city || "",
      province: r.province || "",
      region: r.region || "",
      zip: r.zip_code || "",
      description: r.clinic_description || "",
      paymentMethod: r.clinic_paymentMethod || "Gcash",
      consultationAmount: r.clinic_fee || "",
      schedule,
      confirm: true,
      existingClinicImage: r.clinic_image_url || null,
      existingQrImage: r.qr_image_url || null,
      clinicImageFile: null,
      clinicImagePreview: null,
      qrImageFile: null,
      qrImagePreview: null,
    });
    if (clinicImgRef.current) clinicImgRef.current.value = "";
    if (qrImgRef.current) qrImgRef.current.value = "";
    setShowModal(true);
  }

  /* ── text / select / checkbox ── */
  function handleInput(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  /* ── file with live preview ── */
  function handleFile(e) {
    const { name, files } = e.target;
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (name === "clinicImageFile") {
        setForm((f) => ({
          ...f,
          clinicImageFile: file,
          clinicImagePreview: ev.target.result,
          existingClinicImage: null,
        }));
      } else {
        setForm((f) => ({
          ...f,
          qrImageFile: file,
          qrImagePreview: ev.target.result,
          existingQrImage: null,
        }));
      }
    };
    reader.readAsDataURL(file);
  }

  /* ── schedule toggle / time ── */
  function setSchedule(day, field, value) {
    setForm((f) => ({
      ...f,
      schedule: {
        ...f.schedule,
        [day]: { ...f.schedule[day], [field]: value },
      },
    }));
  }

  /* ── submit ── */
  async function handleSubmit() {
    if (!form.name.trim()) {
      alert("Clinic name is required.");
      return;
    }
    if (!form.confirm) {
      alert("Please tick the confirmation checkbox.");
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append("clinic_name", form.name.trim());
    fd.append("clinic_type", form.type);
    fd.append("blk", form.blk);
    fd.append("barangay", form.barangay);
    fd.append("city", form.city);
    fd.append("province", form.province);
    fd.append("region", form.region);
    fd.append("zip_code", form.zip);
    fd.append("clinic_description", form.description);
    fd.append("clinic_paymentMethod", form.paymentMethod);
    fd.append("clinic_fee", form.consultationAmount);
    fd.append("clinic_schedule", JSON.stringify(form.schedule));
    if (form.clinicImageFile) fd.append("clinic_image", form.clinicImageFile);
    if (form.qrImageFile) fd.append("qr_image", form.qrImageFile);
    if (isEdit) fd.append("_method", "PUT");

    const url = isEdit
      ? `${API_BASE}/clinics/${editId}`
      : `${API_BASE}/clinics`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
          // ⚠️ Do NOT set Content-Type — browser sets multipart boundary automatically
        },
        body: fd,
      });

      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        alert(
          `Server error ${res.status}.\nCheck Laravel logs.\n\n${text.slice(0, 400)}`,
        );
        return;
      }

      if (!res.ok) {
        if (result.errors) {
          alert(
            "Validation errors:\n" +
              Object.values(result.errors).flat().join("\n"),
          );
        } else {
          alert(result.message || `Error ${res.status}`);
        }
        return;
      }

      const mapped = mapClinic(result.data);
      setClinics((p) =>
        isEdit ? p.map((c) => (c.id === editId ? mapped : c)) : [...p, mapped],
      );
      setShowModal(false);
    } catch (e) {
      alert(
        "Network error — make sure Laravel is running on port 8000.\n" +
          e.message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ── delete ── */
  async function handleDelete(id) {
    if (!confirm("Delete this clinic?")) return;
    try {
      const res = await fetch(`${API_BASE}/clinics/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "application/json",
        },
      });
      if (res.ok) {
        setClinics((p) => p.filter((c) => c.id !== id));
      } else {
        const j = await res.json().catch(() => ({}));
        alert(j.message || `Delete failed (${res.status})`);
      }
    } catch {
      alert("Network error during delete.");
    }
  }

  /* ── service helpers ── */
  const updSvc = (id, p) =>
    setServices((s) => s.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const updSub = (sId, subId, p) =>
    setServices((s) =>
      s.map((x) =>
        x.id === sId
          ? {
              ...x,
              subServices: x.subServices.map((b) =>
                b.id === subId ? { ...b, ...p } : b,
              ),
            }
          : x,
      ),
    );
  const delSvc = (id) => setServices((s) => s.filter((x) => x.id !== id));
  const delSub = (sId, subId) =>
    setServices((s) =>
      s.map((x) =>
        x.id === sId
          ? { ...x, subServices: x.subServices.filter((b) => b.id !== subId) }
          : x,
      ),
    );
  const addSvc = () => {
    if (!newSvcTitle.trim()) return;
    setServices((s) => [
      ...s,
      {
        id: String(Date.now()),
        title: newSvcTitle.trim(),
        description: newSvcDesc.trim(),
        price: "",
        available: true,
        subServices: [],
      },
    ]);
    setNewSvcTitle("");
    setNewSvcDesc("");
    setShowAddSvc(false);
  };
  const addPurp = (sId) => {
    if (!newPurpose.trim()) return;
    setServices((s) =>
      s.map((x) =>
        x.id === sId
          ? {
              ...x,
              subServices: [
                ...x.subServices,
                {
                  id: String(Date.now()),
                  title: newPurpose.trim(),
                  price: "",
                  available: true,
                },
              ],
            }
          : x,
      ),
    );
    setNewPurpose("");
    setAddPurposeFor(null);
  };
  const togExp = (id) =>
    setExpandedIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  /* ── small helpers ── */
  const Field = ({ label, children }) => (
    <div className={styles.fieldRow}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );

  const ImgPreview = ({ preview, existing, label }) => {
    const src = preview || existing;
    return (
      <div
        style={{
          width: "100%",
          height: 120,
          borderRadius: 8,
          border: "2px dashed #c4b5d4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f5fc",
          marginBottom: 8,
          overflow: "hidden",
        }}
      >
        {src ? (
          <img
            src={src}
            alt="preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ textAlign: "center", color: "#a78cc2" }}>
            <FiImage size={26} />
            <p style={{ fontSize: 11, marginTop: 4 }}>{label}</p>
          </div>
        )}
      </div>
    );
  };

  /* ════════ RENDER ════════ */
  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className={`admin-content ${styles.clinicPage}`}>
          {/* header */}
          <div className={styles.clinicHeader}>
            <h3>Available Clinics</h3>
            <button className={styles.btnCreate} onClick={openCreate}>
              + Create Clinic
            </button>
          </div>

          {/* states */}
          {loading && (
            <p style={{ color: "#888", marginBottom: 16 }}>Loading clinics…</p>
          )}
          {apiError && (
            <p style={{ color: "red", marginBottom: 16 }}>
              Failed to load clinics: {apiError}.{" "}
              <button
                onClick={fetchClinics}
                style={{
                  background: "none",
                  border: "none",
                  color: "red",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </p>
          )}
          {!loading && !apiError && clinics.length === 0 && (
            <p style={{ color: "#888", marginBottom: 16 }}>
              No clinics yet. Click "+ Create Clinic" to add one.
            </p>
          )}

          {/* cards */}
          <div className={styles.clinicCards}>
            {clinics.map((c) => (
              <div key={c.id} className={styles.clinicCard}>
                <div className={styles.clinicCardHeader}>
                  <h4>
                    {c.type}
                    <span className={styles.clinicIcon}>
                      {c.icon === "physical" ? (
                        <FaClinicMedical />
                      ) : (
                        <TiVideo />
                      )}
                    </span>
                  </h4>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className={styles.editBtn}
                      onClick={() => openEdit(c)}
                    >
                      Edit <FiEdit />
                    </button>
                    <button
                      className={styles.editBtn}
                      style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        borderColor: "#fca5a5",
                      }}
                      onClick={() => handleDelete(c.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1.5px solid #593586",
                    margin: "0 0 14px 0",
                  }}
                />
                <div className={styles.clinicCardBody}>
                  <p>
                    <strong>Clinic Days:</strong> {c.days}
                  </p>
                  <p>
                    <strong>Consultation Fee:</strong> {c.fee}
                  </p>
                  <p>
                    <strong>Payment Mode:</strong> {c.payment}
                  </p>
                  <p>
                    <strong>Address:</strong> {c.address}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ══ SERVICES ══ */}
          <div className={styles.servicesSection}>
            <div className={styles.clinicHeader} style={{ marginBottom: 16 }}>
              <h3>Manage Services &amp; Pricing</h3>
              <button
                className={styles.btnCreate}
                onClick={() => {
                  setShowAddSvc(true);
                  setAddPurposeFor(null);
                }}
              >
                <FiPlus size={14} style={{ marginRight: 5 }} /> Add Service
              </button>
            </div>

            {showAddSvc && (
              <div className={styles.addServiceForm}>
                <p className={styles.addFormTitle}>New Service</p>
                <div className={styles.addServiceInputs}>
                  <input
                    className={styles.addInput}
                    type="text"
                    placeholder="Service title *"
                    value={newSvcTitle}
                    onChange={(e) => setNewSvcTitle(e.target.value)}
                    autoFocus
                  />
                  <input
                    className={styles.addInput}
                    type="text"
                    placeholder="Short description (optional)"
                    value={newSvcDesc}
                    onChange={(e) => setNewSvcDesc(e.target.value)}
                  />
                </div>
                <div className={styles.addFormActions}>
                  <button
                    className={styles.addCancelBtn}
                    onClick={() => {
                      setShowAddSvc(false);
                      setNewSvcTitle("");
                      setNewSvcDesc("");
                    }}
                  >
                    Cancel
                  </button>
                  <button className={styles.addConfirmBtn} onClick={addSvc}>
                    Add Service
                  </button>
                </div>
              </div>
            )}

            <div className={styles.servicesList}>
              {services.map((svc) => {
                const expanded = expandedIds.includes(svc.id);
                const addingPurp = addPurposeFor === svc.id;
                return (
                  <div
                    key={svc.id}
                    className={`${styles.serviceCard} ${!svc.available ? styles.serviceCardDisabled : ""}`}
                  >
                    <div className={styles.serviceCardHeader}>
                      <div className={styles.serviceCardLeft}>
                        <div className={styles.serviceIconBubble}>
                          {svc.id === "0" ? (
                            <FaBrain size={14} color="#fff" />
                          ) : (
                            <FaClinicMedical size={14} color="#fff" />
                          )}
                        </div>
                        <div>
                          <p className={styles.serviceCardTitle}>{svc.title}</p>
                          {svc.description && (
                            <p className={styles.serviceCardDesc}>
                              {svc.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={styles.serviceCardControls}>
                        <div className={styles.priceInputWrap}>
                          <span className={styles.pricePrefix}>₱</span>
                          <input
                            className={styles.priceInput}
                            type="text"
                            placeholder="Set price"
                            value={svc.price}
                            disabled={!svc.available}
                            onChange={(e) =>
                              updSvc(svc.id, { price: e.target.value })
                            }
                          />
                        </div>
                        <button
                          className={`${styles.availableBtn} ${svc.available ? styles.availableBtnOn : styles.availableBtnOff}`}
                          onClick={() =>
                            updSvc(svc.id, { available: !svc.available })
                          }
                        >
                          {svc.available ? (
                            <FiToggleRight size={18} />
                          ) : (
                            <FiToggleLeft size={18} />
                          )}
                          {svc.available ? "Available" : "Unavailable"}
                        </button>
                        <button
                          className={styles.deleteServiceBtn}
                          onClick={() => delSvc(svc.id)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {(svc.subServices.length > 0 || svc.id === "1") && (
                      <>
                        <div className={styles.subToggleBar}>
                          <button
                            className={styles.subToggleBtn}
                            onClick={() => togExp(svc.id)}
                          >
                            {expanded ? "▲" : "▼"}&nbsp;Assessment Purposes (
                            {svc.subServices.length})
                          </button>
                          <button
                            className={styles.addPurposeBtnInline}
                            onClick={() => {
                              setAddPurposeFor(svc.id);
                              setExpandedIds((p) =>
                                p.includes(svc.id) ? p : [...p, svc.id],
                              );
                              setShowAddSvc(false);
                              setNewPurpose("");
                            }}
                          >
                            <FiPlus size={12} /> Add Purpose
                          </button>
                        </div>
                        {expanded && (
                          <div className={styles.subServicesList}>
                            {svc.subServices.map((sub) => (
                              <div
                                key={sub.id}
                                className={`${styles.subServiceRow} ${!sub.available ? styles.subServiceRowDisabled : ""}`}
                              >
                                <span className={styles.subServiceTitle}>
                                  {sub.title}
                                </span>
                                <div className={styles.subServiceControls}>
                                  <div className={styles.priceInputWrap}>
                                    <span className={styles.pricePrefix}>
                                      ₱
                                    </span>
                                    <input
                                      className={styles.priceInput}
                                      type="text"
                                      placeholder="Set price"
                                      value={sub.price}
                                      disabled={
                                        !sub.available || !svc.available
                                      }
                                      onChange={(e) =>
                                        updSub(svc.id, sub.id, {
                                          price: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <button
                                    className={`${styles.availableBtn} ${styles.availableBtnSm} ${sub.available ? styles.availableBtnOn : styles.availableBtnOff}`}
                                    disabled={!svc.available}
                                    onClick={() =>
                                      updSub(svc.id, sub.id, {
                                        available: !sub.available,
                                      })
                                    }
                                  >
                                    {sub.available ? (
                                      <FiToggleRight size={15} />
                                    ) : (
                                      <FiToggleLeft size={15} />
                                    )}
                                    {sub.available ? "On" : "Off"}
                                  </button>
                                  <button
                                    className={styles.deleteSubBtn}
                                    onClick={() => delSub(svc.id, sub.id)}
                                  >
                                    <FiTrash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {addingPurp ? (
                              <div className={styles.addPurposeRow}>
                                <input
                                  className={styles.addInput}
                                  style={{ flex: 1 }}
                                  type="text"
                                  placeholder="Purpose title *"
                                  value={newPurpose}
                                  autoFocus
                                  onChange={(e) =>
                                    setNewPurpose(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") addPurp(svc.id);
                                    if (e.key === "Escape") {
                                      setAddPurposeFor(null);
                                      setNewPurpose("");
                                    }
                                  }}
                                />
                                <div className={styles.addFormActions}>
                                  <button
                                    className={styles.addCancelBtn}
                                    onClick={() => {
                                      setAddPurposeFor(null);
                                      setNewPurpose("");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className={styles.addConfirmBtn}
                                    onClick={() => addPurp(svc.id)}
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className={styles.addPurposeRow}>
                                <button
                                  className={styles.addPurposeBtn}
                                  onClick={() => {
                                    setAddPurposeFor(svc.id);
                                    setShowAddSvc(false);
                                    setNewPurpose("");
                                  }}
                                >
                                  <FiPlus size={13} /> Add Assessment Purpose
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                className={styles.btnSubmit}
                onClick={() => alert("Services saved!")}
              >
                Save Services
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          MODAL
      ══════════════════════════════ */}
      {showModal && (
        <div className={styles.backdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {isEdit ? "Edit Clinic" : "Create Clinic"}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Clinic Type */}
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Clinic Type</p>
                <div className={styles.typeToggle}>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${form.type === "Physical" ? styles.typeBtnActive : ""}`}
                    onClick={() => setForm((f) => ({ ...f, type: "Physical" }))}
                  >
                    <FaClinicMedical /> Physical Clinic
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${form.type === "Online" ? styles.typeBtnActive : ""}`}
                    onClick={() => setForm((f) => ({ ...f, type: "Online" }))}
                  >
                    <TiVideo /> Online Clinic
                  </button>
                </div>
              </div>

              {/* Clinic Info */}
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Clinic Information</p>
                <Field label="Clinic Name *">
                  <input
                    className={styles.input}
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInput}
                    placeholder="e.g. ClearMind Wellness Clinic"
                  />
                </Field>
                <label className={styles.fieldLabel}>Address</label>
                <div className={styles.grid2}>
                  <div className={styles.gridFull}>
                    <input
                      className={styles.input}
                      type="text"
                      name="blk"
                      value={form.blk}
                      onChange={handleInput}
                      placeholder="Blk / Lot / Bldg / Subd."
                    />
                  </div>
                  <input
                    className={styles.input}
                    type="text"
                    name="barangay"
                    value={form.barangay}
                    onChange={handleInput}
                    placeholder="Barangay"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInput}
                    placeholder="City / Municipality"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="province"
                    value={form.province}
                    onChange={handleInput}
                    placeholder="Province"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="region"
                    value={form.region}
                    onChange={handleInput}
                    placeholder="Region"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="zip"
                    value={form.zip}
                    onChange={handleInput}
                    placeholder="ZIP Code"
                  />
                </div>

                {/* Clinic Image */}
                <Field label="Clinic Image">
                  <div>
                    <ImgPreview
                      preview={form.clinicImagePreview}
                      existing={form.existingClinicImage}
                      label="No image selected"
                    />
                    <div className={styles.fileUploadRow}>
                      <input
                        ref={clinicImgRef}
                        className={styles.fileInput}
                        type="file"
                        name="clinicImageFile"
                        accept="image/*"
                        onChange={handleFile}
                      />
                      <button
                        type="button"
                        className={styles.fileAddBtn}
                        onClick={() => clinicImgRef.current?.click()}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Field>

                <Field label="Description (Optional)">
                  <textarea
                    className={styles.textarea}
                    name="description"
                    value={form.description}
                    onChange={handleInput}
                    placeholder="Describe the clinic…"
                    maxLength={1500}
                  />
                </Field>
              </div>

              {/* Schedule */}
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Clinic Schedule</p>
                <table className={styles.scheduleTable}>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th style={{ textAlign: "center" }}>Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(form.schedule).map((day) => {
                      const closed = form.schedule[day].closed;
                      return (
                        <tr key={day} style={{ opacity: closed ? 0.45 : 1 }}>
                          <td className={styles.scheduleDayLabel}>{day}</td>
                          <td>
                            <input
                              className={styles.scheduleInput}
                              type="time"
                              value={form.schedule[day].start}
                              disabled={closed}
                              onChange={(e) =>
                                setSchedule(day, "start", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              className={styles.scheduleInput}
                              type="time"
                              value={form.schedule[day].end}
                              disabled={closed}
                              onChange={(e) =>
                                setSchedule(day, "end", e.target.value)
                              }
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <label className={styles.closedToggle}>
                              <input
                                type="checkbox"
                                checked={closed}
                                onChange={(e) =>
                                  setSchedule(day, "closed", e.target.checked)
                                }
                              />
                              <span
                                className={`${styles.closedSlider} ${closed ? styles.closedSliderOn : ""}`}
                              />
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Payment */}
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Payment Information</p>
                <div className={styles.paymentGrid}>
                  <div>
                    <label className={styles.fieldLabel}>Payment Method</label>
                    <select
                      className={styles.select}
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={handleInput}
                    >
                      <option value="Gcash">GCash</option>
                      <option value="Bank">Bank Payment</option>
                      <option value="Gcash,Bank">GCash &amp; Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>
                      Consultation Fee
                    </label>
                    <input
                      className={styles.input}
                      type="text"
                      name="consultationAmount"
                      value={form.consultationAmount}
                      onChange={handleInput}
                      placeholder="e.g. ₱ 2,000.00 - ₱ 2,500.00"
                    />
                  </div>
                </div>

                {/* QR Code */}
                <Field label="Payment QR Code">
                  <div>
                    <ImgPreview
                      preview={form.qrImagePreview}
                      existing={form.existingQrImage}
                      label="No QR code selected"
                    />
                    <div className={styles.fileUploadRow}>
                      <input
                        ref={qrImgRef}
                        className={styles.fileInput}
                        type="file"
                        name="qrImageFile"
                        accept="image/*"
                        onChange={handleFile}
                      />
                      <button
                        type="button"
                        className={styles.fileAddBtn}
                        onClick={() => qrImgRef.current?.click()}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Field>
              </div>

              {/* Confirmation */}
              <div className={styles.section}>
                <label className={styles.confirmBox}>
                  <input
                    type="checkbox"
                    name="confirm"
                    checked={form.confirm}
                    onChange={handleInput}
                    className={styles.confirmCheckbox}
                  />
                  <span className={styles.confirmText}>
                    I hereby confirm that all the information I have provided is
                    true, complete, and correct.
                  </span>
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancel}
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={styles.btnSubmit}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? "Saving…"
                  : isEdit
                    ? "Save Changes"
                    : "Create Clinic"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

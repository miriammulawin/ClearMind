import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import {
  FiEdit,
  FiX,
  FiToggleLeft,
  FiToggleRight,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { FaClinicMedical, FaBrain } from "react-icons/fa";
import { TiVideo } from "react-icons/ti";
import styles from "./AdminStyle/AdminClinic.module.css";

/* ── Defaults ── */
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
  name: "",
  blk: "",
  barangay: "",
  city: "",
  province: "",
  region: "",
  zip: "",
  clinicImage: null,
  description: "",
  schedule: DEFAULT_SCHEDULE,
  paymentMethod: "Gcash",
  consultationAmount: "",
  qrImages: [],
  confirm: false,
  type: "Physical",
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

function AdminClinic() {
  const [activeMenu, setActiveMenu] = useState("Clinic & Services");

  /* ── Clinic modal state ── */
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [clinicForm, setClinicForm] = useState(EMPTY_FORM);

  /* ── Services state ── */
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [expandedIds, setExpandedIds] = useState(["1"]); // PAE expanded by default

  /* Add service form */
  const [showAddService, setShowAddService] = useState(false);
  const [newSvcTitle, setNewSvcTitle] = useState("");
  const [newSvcDesc, setNewSvcDesc] = useState("");

  /* Add purpose form — keyed by service id */
  const [addPurposeFor, setAddPurposeFor] = useState(null);
  const [newPurposeTitle, setNewPurposeTitle] = useState("");

  const [clinics, setClinics] = useState([
    {
      id: 1,
      type: "Physical Clinic",
      icon: "physical",
      days: "Monday, Friday",
      fee: "₱ 2,000.00 - ₱ 2,500.00",
      payment: "Gcash, Bank Payment",
      address: "123 Main St, City",
    },
    {
      id: 2,
      type: "Online Clinic",
      icon: "online",
      days: "Thursday, Saturday",
      fee: "₱ 2,000.00 - ₱ 2,500.00",
      payment: "Gcash, Bank Payment",
      address: "Virtual / Online",
    },
  ]);

  /* ── Clinic handlers ── */
  const openCreateModal = () => {
    setIsEdit(false);
    setEditId(null);
    setClinicForm({ ...EMPTY_FORM, schedule: { ...DEFAULT_SCHEDULE } });
    setShowModal(true);
  };
  const openEditModal = (clinic) => {
    setIsEdit(true);
    setEditId(clinic.id);
    setClinicForm({
      ...EMPTY_FORM,
      schedule: { ...DEFAULT_SCHEDULE },
      name: clinic.type,
      consultationAmount: clinic.fee,
      paymentMethod: clinic.payment,
      type: clinic.icon === "online" ? "Online" : "Physical",
      confirm: true,
    });
    setShowModal(true);
  };
  const handleInput = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") setClinicForm((f) => ({ ...f, [name]: checked }));
    else if (type === "file") setClinicForm((f) => ({ ...f, [name]: files }));
    else setClinicForm((f) => ({ ...f, [name]: value }));
  };
  const handleScheduleChange = (day, field, value) =>
    setClinicForm((f) => ({
      ...f,
      schedule: {
        ...f.schedule,
        [day]: { ...f.schedule[day], [field]: value },
      },
    }));

  const handleSubmit = () => {
    if (!clinicForm.confirm) {
      alert("Please confirm the information.");
      return;
    }
    const daysString = Object.entries(clinicForm.schedule)
      .filter(([, v]) => v.start && v.end && !v.closed)
      .map(([d]) => d)
      .join(", ");
    const newClinic = {
      id: isEdit ? editId : clinics.length + 1,
      type:
        clinicForm.type === "Physical" ? "Physical Clinic" : "Online Clinic",
      icon: clinicForm.type === "Physical" ? "physical" : "online",
      days: daysString,
      fee: clinicForm.consultationAmount,
      payment: clinicForm.paymentMethod,
      address: `${clinicForm.blk}, ${clinicForm.barangay}, ${clinicForm.city}, ${clinicForm.province}, ${clinicForm.region} ${clinicForm.zip}`,
    };
    if (isEdit)
      setClinics((p) => p.map((c) => (c.id === editId ? newClinic : c)));
    else setClinics((p) => [...p, newClinic]);
    setShowModal(false);
  };

  /* ── Service handlers ── */
  const updateService = (id, patch) =>
    setServices((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const updateSubService = (svcId, subId, patch) =>
    setServices((p) =>
      p.map((s) =>
        s.id === svcId
          ? {
              ...s,
              subServices: s.subServices.map((sub) =>
                sub.id === subId ? { ...sub, ...patch } : sub,
              ),
            }
          : s,
      ),
    );

  const deleteService = (id) =>
    setServices((p) => p.filter((s) => s.id !== id));

  const deleteSubService = (svcId, subId) =>
    setServices((p) =>
      p.map((s) =>
        s.id === svcId
          ? {
              ...s,
              subServices: s.subServices.filter((sub) => sub.id !== subId),
            }
          : s,
      ),
    );

  const addService = () => {
    if (!newSvcTitle.trim()) return;
    setServices((p) => [
      ...p,
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
    setShowAddService(false);
  };

  const addPurpose = (svcId) => {
    if (!newPurposeTitle.trim()) return;
    setServices((p) =>
      p.map((s) =>
        s.id === svcId
          ? {
              ...s,
              subServices: [
                ...s.subServices,
                {
                  id: String(Date.now()),
                  title: newPurposeTitle.trim(),
                  price: "",
                  available: true,
                },
              ],
            }
          : s,
      ),
    );
    setNewPurposeTitle("");
    setAddPurposeFor(null);
  };

  const toggleExpanded = (id) =>
    setExpandedIds((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
    );

  /* ── Labeled input helper ── */
  const Field = ({ label, children }) => (
    <div className={styles.fieldRow}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className={`admin-content ${styles.clinicPage}`}>
          {/* ── Clinics ── */}
          <div className={styles.clinicHeader}>
            <h3>Available Clinics</h3>
            <button className={styles.btnCreate} onClick={openCreateModal}>
              + Create Clinic
            </button>
          </div>

          <div className={styles.clinicCards}>
            {clinics.map((clinic) => (
              <div key={clinic.id} className={styles.clinicCard}>
                <div className={styles.clinicCardHeader}>
                  <h4>
                    {clinic.type}
                    <span className={styles.clinicIcon}>
                      {clinic.icon === "physical" ? (
                        <FaClinicMedical />
                      ) : (
                        <TiVideo />
                      )}
                    </span>
                  </h4>
                  <button
                    className={styles.editBtn}
                    onClick={() => openEditModal(clinic)}
                  >
                    Edit <FiEdit />
                  </button>
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
                    <strong>Clinic Days:</strong> {clinic.days}
                  </p>
                  <p>
                    <strong>Consultation Fee:</strong> {clinic.fee}
                  </p>
                  <p>
                    <strong>Payment Mode:</strong> {clinic.payment}
                  </p>
                  <p>
                    <strong>Address:</strong> {clinic.address}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ══ SERVICES ══ */}
          <div className={styles.servicesSection}>
            <div className={styles.clinicHeader} style={{ marginBottom: 16 }}>
              <h3>Manage Services & Pricing</h3>
              <button
                className={styles.btnCreate}
                onClick={() => {
                  setShowAddService(true);
                  setAddPurposeFor(null);
                }}
              >
                <FiPlus size={14} style={{ marginRight: 5 }} /> Add Service
              </button>
            </div>

            {/* ── Add Service form ── */}
            {showAddService && (
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
                      setShowAddService(false);
                      setNewSvcTitle("");
                      setNewSvcDesc("");
                    }}
                  >
                    Cancel
                  </button>
                  <button className={styles.addConfirmBtn} onClick={addService}>
                    Add Service
                  </button>
                </div>
              </div>
            )}

            {/* ── Service list ── */}
            <div className={styles.servicesList}>
              {services.map((service) => {
                const isExpanded = expandedIds.includes(service.id);
                const hasSubs = service.subServices.length > 0;
                const isAddingPurpose = addPurposeFor === service.id;

                return (
                  <div
                    key={service.id}
                    className={`${styles.serviceCard} ${!service.available ? styles.serviceCardDisabled : ""}`}
                  >
                    {/* Service row */}
                    <div className={styles.serviceCardHeader}>
                      <div className={styles.serviceCardLeft}>
                        <div className={styles.serviceIconBubble}>
                          {service.id === "0" ? (
                            <FaBrain size={14} color="#fff" />
                          ) : (
                            <FaClinicMedical size={14} color="#fff" />
                          )}
                        </div>
                        <div>
                          <p className={styles.serviceCardTitle}>
                            {service.title}
                          </p>
                          {service.description && (
                            <p className={styles.serviceCardDesc}>
                              {service.description}
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
                            value={service.price}
                            disabled={!service.available}
                            onChange={(e) =>
                              updateService(service.id, {
                                price: e.target.value,
                              })
                            }
                          />
                        </div>
                        <button
                          className={`${styles.availableBtn} ${service.available ? styles.availableBtnOn : styles.availableBtnOff}`}
                          onClick={() =>
                            updateService(service.id, {
                              available: !service.available,
                            })
                          }
                        >
                          {service.available ? (
                            <FiToggleRight size={18} />
                          ) : (
                            <FiToggleLeft size={18} />
                          )}
                          {service.available ? "Available" : "Unavailable"}
                        </button>
                        <button
                          className={styles.deleteServiceBtn}
                          onClick={() => deleteService(service.id)}
                          title="Delete service"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Sub-services accordion */}
                    {(hasSubs || service.id === "1") && (
                      <>
                        <div className={styles.subToggleBar}>
                          <button
                            className={styles.subToggleBtn}
                            onClick={() => toggleExpanded(service.id)}
                          >
                            {isExpanded ? "▲" : "▼"}
                            &nbsp; Assessment Purposes (
                            {service.subServices.length})
                          </button>
                          {/* Always-visible add button */}
                          <button
                            className={styles.addPurposeBtnInline}
                            onClick={() => {
                              setAddPurposeFor(service.id);
                              setExpandedIds((p) =>
                                p.includes(service.id) ? p : [...p, service.id],
                              );
                              setShowAddService(false);
                              setNewPurposeTitle("");
                            }}
                          >
                            <FiPlus size={12} /> Add Purpose
                          </button>
                        </div>

                        {isExpanded && (
                          <div className={styles.subServicesList}>
                            {service.subServices.map((sub) => (
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
                                        !sub.available || !service.available
                                      }
                                      onChange={(e) =>
                                        updateSubService(service.id, sub.id, {
                                          price: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <button
                                    className={`${styles.availableBtn} ${styles.availableBtnSm} ${sub.available ? styles.availableBtnOn : styles.availableBtnOff}`}
                                    disabled={!service.available}
                                    onClick={() =>
                                      updateSubService(service.id, sub.id, {
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
                                    onClick={() =>
                                      deleteSubService(service.id, sub.id)
                                    }
                                    title="Remove"
                                  >
                                    <FiTrash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Add purpose inline row */}
                            {isAddingPurpose ? (
                              <div className={styles.addPurposeRow}>
                                <input
                                  className={styles.addInput}
                                  style={{ flex: 1 }}
                                  type="text"
                                  placeholder="Assessment purpose title *"
                                  value={newPurposeTitle}
                                  onChange={(e) =>
                                    setNewPurposeTitle(e.target.value)
                                  }
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      addPurpose(service.id);
                                    if (e.key === "Escape") {
                                      setAddPurposeFor(null);
                                      setNewPurposeTitle("");
                                    }
                                  }}
                                />
                                <div className={styles.addFormActions}>
                                  <button
                                    className={styles.addCancelBtn}
                                    onClick={() => {
                                      setAddPurposeFor(null);
                                      setNewPurposeTitle("");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className={styles.addConfirmBtn}
                                    onClick={() => addPurpose(service.id)}
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
                                    setAddPurposeFor(service.id);
                                    setShowAddService(false);
                                    setNewPurposeTitle("");
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

            {/* Save button */}
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

      {/* ══ CLINIC MODAL ══ */}
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
                    className={`${styles.typeBtn} ${clinicForm.type === "Physical" ? styles.typeBtnActive : ""}`}
                    onClick={() =>
                      setClinicForm((f) => ({ ...f, type: "Physical" }))
                    }
                  >
                    <FaClinicMedical /> Physical Clinic
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${clinicForm.type === "Online" ? styles.typeBtnActive : ""}`}
                    onClick={() =>
                      setClinicForm((f) => ({ ...f, type: "Online" }))
                    }
                  >
                    <TiVideo /> Online Clinic
                  </button>
                </div>
              </div>

              {/* Clinic Information */}
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Clinic Information</p>
                <Field label="Clinic Name *">
                  <input
                    className={styles.input}
                    type="text"
                    name="name"
                    value={clinicForm.name}
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
                      value={clinicForm.blk}
                      onChange={handleInput}
                      placeholder="Blk / Lot / Bldg / Subd."
                    />
                  </div>
                  <input
                    className={styles.input}
                    type="text"
                    name="barangay"
                    value={clinicForm.barangay}
                    onChange={handleInput}
                    placeholder="Barangay"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="city"
                    value={clinicForm.city}
                    onChange={handleInput}
                    placeholder="City / Municipality"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="province"
                    value={clinicForm.province}
                    onChange={handleInput}
                    placeholder="Province"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="region"
                    value={clinicForm.region}
                    onChange={handleInput}
                    placeholder="Region"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="zip"
                    value={clinicForm.zip}
                    onChange={handleInput}
                    placeholder="ZIP Code"
                  />
                </div>
                <Field label="Clinic Image">
                  <div className={styles.fileUploadRow}>
                    <input
                      className={styles.fileInput}
                      type="file"
                      name="clinicImage"
                      onChange={handleInput}
                    />
                    <button type="button" className={styles.fileAddBtn}>
                      +
                    </button>
                  </div>
                </Field>
                <Field label="Description (Optional)">
                  <textarea
                    className={styles.textarea}
                    name="description"
                    value={clinicForm.description}
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
                    {Object.keys(clinicForm.schedule).map((day) => {
                      const isClosed = clinicForm.schedule[day].closed;
                      return (
                        <tr key={day} style={{ opacity: isClosed ? 0.45 : 1 }}>
                          <td className={styles.scheduleDayLabel}>{day}</td>
                          <td>
                            <input
                              className={styles.scheduleInput}
                              type="time"
                              value={clinicForm.schedule[day].start}
                              disabled={isClosed}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day,
                                  "start",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              className={styles.scheduleInput}
                              type="time"
                              value={clinicForm.schedule[day].end}
                              disabled={isClosed}
                              onChange={(e) =>
                                handleScheduleChange(day, "end", e.target.value)
                              }
                            />
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <label className={styles.closedToggle}>
                              <input
                                type="checkbox"
                                checked={isClosed}
                                onChange={(e) =>
                                  handleScheduleChange(
                                    day,
                                    "closed",
                                    e.target.checked,
                                  )
                                }
                              />
                              <span
                                className={`${styles.closedSlider} ${isClosed ? styles.closedSliderOn : ""}`}
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
                      value={clinicForm.paymentMethod}
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
                      value={clinicForm.consultationAmount}
                      onChange={handleInput}
                      placeholder="e.g. ₱ 2,000.00 - ₱ 2,500.00"
                    />
                  </div>
                </div>
                <Field label="Payment QR Code">
                  <div className={styles.fileUploadRow}>
                    <input
                      className={styles.fileInput}
                      type="file"
                      name="qrImages"
                      multiple
                      onChange={handleInput}
                    />
                    <button type="button" className={styles.fileAddBtn}>
                      +
                    </button>
                  </div>
                </Field>
              </div>

              {/* Confirmation */}
              <div className={styles.section}>
                <label className={styles.confirmBox}>
                  <input
                    type="checkbox"
                    name="confirm"
                    checked={clinicForm.confirm}
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
              >
                Cancel
              </button>
              <button className={styles.btnSubmit} onClick={handleSubmit}>
                {isEdit ? "Save Changes" : "Create Clinic"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminClinic;

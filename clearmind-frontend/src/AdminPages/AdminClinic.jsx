import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import { FiEdit, FiX } from "react-icons/fi";
import { FaClinicMedical } from "react-icons/fa";
import { TiVideo } from "react-icons/ti";
import styles from "./AdminStyle/AdminClinic.module.css";

const DEFAULT_SCHEDULE = {
  Monday: { start: "09:00", end: "17:00", note: "Appointment Only" },
  Tuesday: { start: "09:00", end: "17:00", note: "Appointment Only" },
  Wednesday: { start: "09:00", end: "17:00", note: "Appointment Only" },
  Thursday: { start: "09:00", end: "17:00", note: "Appointment Only" },
  Friday: { start: "09:00", end: "17:00", note: "Appointment Only" },
  Saturday: { start: "09:00", end: "17:00", note: "Appointment Only" },
  Sunday: { start: "09:00", end: "17:00", note: "Appointment Only" },
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

function AdminClinic() {
  const [activeMenu, setActiveMenu] = useState("Clinic");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [clinicForm, setClinicForm] = useState(EMPTY_FORM);

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

  /* ── Helpers ── */
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

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setClinicForm((f) => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      setClinicForm((f) => ({ ...f, [name]: files }));
    } else {
      setClinicForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleScheduleChange = (day, field, value) => {
    setClinicForm((f) => ({
      ...f,
      schedule: {
        ...f.schedule,
        [day]: { ...f.schedule[day], [field]: value },
      },
    }));
  };

  const handleSubmit = () => {
    if (!clinicForm.confirm) {
      alert("Please confirm the information.");
      return;
    }

    const daysString = Object.entries(clinicForm.schedule)
      .filter(([, val]) => val.start && val.end)
      .map(([day]) => day)
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

    if (isEdit) {
      setClinics((prev) => prev.map((c) => (c.id === editId ? newClinic : c)));
    } else {
      setClinics((prev) => [...prev, newClinic]);
    }
    setShowModal(false);
  };

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
          {/* ── Page Header ── */}
          <div className={styles.clinicHeader}>
            <h3>Available Clinics</h3>
            <button className={styles.btnCreate} onClick={openCreateModal}>
              + Create Clinic
            </button>
          </div>

          {/* ── Clinic Cards ── */}
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
                    borderTop: "1.5px solid #ede5f7",
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
        </div>
      </div>

      {/* ══ MODAL ══ */}
      {showModal && (
        <div className={styles.backdrop}>
          <div className={styles.modal}>
            {/* ── Header ── */}
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

            {/* ── Scrollable Body ── */}
            <div className={styles.modalBody}>
              {/* ▸ Clinic Type */}
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

              {/* ▸ Clinic Information */}
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Clinic Information</p>

                <Field label="Clinic Name *">
                  <input
                    className={styles.input}
                    type="text"
                    name="name"
                    value={clinicForm.name}
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      placeholder="Blk / Lot / Bldg / Subd."
                    />
                  </div>
                  <input
                    className={styles.input}
                    type="text"
                    name="barangay"
                    value={clinicForm.barangay}
                    onChange={handleInputChange}
                    placeholder="Barangay"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="city"
                    value={clinicForm.city}
                    onChange={handleInputChange}
                    placeholder="City / Municipality"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="province"
                    value={clinicForm.province}
                    onChange={handleInputChange}
                    placeholder="Province"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="region"
                    value={clinicForm.region}
                    onChange={handleInputChange}
                    placeholder="Region"
                  />
                  <input
                    className={styles.input}
                    type="text"
                    name="zip"
                    value={clinicForm.zip}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                  />
                </div>

                <Field label="Clinic Image">
                  <div className={styles.fileUploadRow}>
                    <input
                      className={styles.fileInput}
                      type="file"
                      name="clinicImage"
                      onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    placeholder="Describe the clinic or add notes for patients… (max 1500 characters)"
                    maxLength={1500}
                  />
                </Field>
              </div>

              {/* ▸ Schedule */}
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Clinic Schedule</p>
                <div className={styles.scheduleDays}>
                  {Object.keys(clinicForm.schedule).map((day) => (
                    <div key={day} className={styles.scheduleDay}>
                      <span className={styles.scheduleDayLabel}>{day}</span>
                      <div className={styles.scheduleInputs}>
                        <input
                          className={styles.input}
                          type="time"
                          value={clinicForm.schedule[day].start}
                          onChange={(e) =>
                            handleScheduleChange(day, "start", e.target.value)
                          }
                        />
                        <input
                          className={styles.input}
                          type="time"
                          value={clinicForm.schedule[day].end}
                          onChange={(e) =>
                            handleScheduleChange(day, "end", e.target.value)
                          }
                        />
                        <input
                          className={styles.input}
                          type="text"
                          value={clinicForm.schedule[day].note}
                          onChange={(e) =>
                            handleScheduleChange(day, "note", e.target.value)
                          }
                          placeholder="Appointment Only"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ▸ Payment Information */}
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Payment Information</p>
                <div className={styles.paymentGrid}>
                  <div>
                    <label className={styles.fieldLabel}>Payment Method</label>
                    <select
                      className={styles.select}
                      name="paymentMethod"
                      value={clinicForm.paymentMethod}
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                    />
                    <button type="button" className={styles.fileAddBtn}>
                      +
                    </button>
                  </div>
                </Field>
              </div>

              {/* ▸ Confirmation */}
              <div className={styles.section}>
                <label className={styles.confirmBox}>
                  <input
                    type="checkbox"
                    name="confirm"
                    checked={clinicForm.confirm}
                    onChange={handleInputChange}
                    className={styles.confirmCheckbox}
                  />
                  <span className={styles.confirmText}>
                    I hereby confirm that all the information I have provided is
                    true, complete, and correct.
                  </span>
                </label>
              </div>
            </div>
            {/* /modalBody */}

            {/* ── Footer ── */}
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
          {/* /modal */}
        </div>
      )}
    </div>
  );
}

export default AdminClinic;

import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import { FiEdit, FiX, FiPlus } from "react-icons/fi";
import { FaClinicMedical } from "react-icons/fa";
import { TiVideo } from "react-icons/ti";
import "./AdminStyle/AdminClinic.css";

function AdminClinic() {
  const [activeMenu, setActiveMenu] = useState("Clinic");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // Default schedule
  const defaultSchedule = {
    Monday: { start: "09:00", end: "17:00", note: "Appointment Only" },
    Tuesday: { start: "09:00", end: "17:00", note: "Appointment Only" },
    Wednesday: { start: "09:00", end: "17:00", note: "Appointment Only" },
    Thursday: { start: "09:00", end: "17:00", note: "Appointment Only" },
    Friday: { start: "09:00", end: "17:00", note: "Appointment Only" },
    Saturday: { start: "09:00", end: "17:00", note: "Appointment Only" },
    Sunday: { start: "09:00", end: "17:00", note: "Appointment Only" },
  };

  // Clinics state
  const [clinics, setClinics] = useState([
    {
      id: 1,
      type: "Physical Clinic",
      icon: <FaClinicMedical />,
      days: "Monday, Friday",
      fee: "₱ 2,000.00 - ₱ 2,500.00",
      payment: "Gcash, Bank Payment",
      address: "123 Main St, City",
    },
    {
      id: 2,
      type: "Online Clinic",
      icon: <TiVideo />,
      days: "Thursday, Saturday",
      fee: "₱ 2,000.00 - ₱ 2,500.00",
      payment: "Gcash, Bank Payment",
      address: "Virtual / Online",
    },
  ]);

  // Advanced clinic form
  const [clinicForm, setClinicForm] = useState({
    name: "",
    blk: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    zip: "",
    clinicImage: null,
    description: "",
    schedule: defaultSchedule,
    paymentMethod: "Gcash",
    consultationAmount: "",
    qrImages: [],
    confirm: false,
    type: "Physical",
  });

  const openCreateModal = () => {
    setIsEdit(false);
    setClinicForm({
      name: "",
      blk: "",
      barangay: "",
      city: "",
      province: "",
      region: "",
      zip: "",
      clinicImage: null,
      description: "",
      schedule: defaultSchedule,
      paymentMethod: "Gcash",
      consultationAmount: "",
      qrImages: [],
      confirm: false,
      type: "Physical",
    });
    setShowModal(true);
  };

  const openEditModal = (clinic) => {
    setIsEdit(true);
    setEditId(clinic.id);
    setClinicForm({
      ...clinicForm,
      name: clinic.type,
      consultationAmount: clinic.fee,
      paymentMethod: clinic.payment,
      confirm: true,
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setClinicForm({ ...clinicForm, [name]: checked });
    } else if (type === "file") {
      setClinicForm({ ...clinicForm, [name]: files });
    } else {
      setClinicForm({ ...clinicForm, [name]: value });
    }
  };

  const handleScheduleChange = (day, field, value) => {
    setClinicForm({
      ...clinicForm,
      schedule: {
        ...clinicForm.schedule,
        [day]: { ...clinicForm.schedule[day], [field]: value },
      },
    });
  };

  const handleSubmit = () => {
    if (!clinicForm.confirm) {
      alert("Please confirm the information.");
      return;
    }

    const icon =
      clinicForm.type === "Physical" ? <FaClinicMedical /> : <TiVideo />;
    const daysString = Object.entries(clinicForm.schedule)
      .filter(([_, val]) => val.start && val.end)
      .map(([day, val]) => day)
      .join(", ");

    const newClinic = {
      id: clinics.length + 1,
      type:
        clinicForm.type === "Physical" ? "Physical Clinic" : "Online Clinic",
      icon: icon,
      days: daysString,
      fee: clinicForm.consultationAmount,
      payment: clinicForm.paymentMethod,
      address: `${clinicForm.blk}, ${clinicForm.barangay}, ${clinicForm.city}, ${clinicForm.province}, ${clinicForm.region}, ${clinicForm.zip}`,
    };

    setClinics([...clinics, newClinic]);
    setShowModal(false);

    // Reset form
    setClinicForm({
      name: "",
      blk: "",
      barangay: "",
      city: "",
      province: "",
      region: "",
      zip: "",
      clinicImage: null,
      description: "",
      schedule: defaultSchedule,
      paymentMethod: "Gcash",
      consultationAmount: "",
      qrImages: [],
      confirm: false,
      type: "Physical",
    });
  };

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className="admin-content">
          <div className="clinic-header">
            <h3>Available Clinics</h3>
            <button className="btn-create" onClick={openCreateModal}>
              + Create Clinic
            </button>
          </div>

          <div className="clinic-cards">
            {clinics.map((clinic) => (
              <div key={clinic.id} className="clinic-card">
                <div className="clinic-card-header">
                  <h4>
                    {clinic.type}{" "}
                    <span className="clinic-icon">{clinic.icon}</span>
                  </h4>
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(clinic)}
                  >
                    Edit <FiEdit />
                  </button>
                </div>
                <hr />
                <div className="clinic-card-body">
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

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content modal-create-clinic">
              <div className="modal-header">
                <span>{isEdit ? "Edit Clinic" : "Create Clinic"}</span>
                <FiX
                  className="modal-close-icon"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
         
                <p>
                  Fill out the clinic details: Enter the required information.
                </p>

                <label>Clinic Name *</label>
                <input
                  type="text"
                  name="name"
                  value={clinicForm.name}
                  onChange={handleInputChange}
                  placeholder="Clinic Name"
                />

                <label>Address:</label>
                <div className="address-fields">
                  <input
                    type="text"
                    name="blk"
                    value={clinicForm.blk}
                    onChange={handleInputChange}
                    placeholder="Blk / Lot / Blg / Subd."
                  />
                  <input
                    type="text"
                    name="barangay"
                    value={clinicForm.barangay}
                    onChange={handleInputChange}
                    placeholder="Barangay"
                  />
                  <input
                    type="text"
                    name="city"
                    value={clinicForm.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="province"
                    value={clinicForm.province}
                    onChange={handleInputChange}
                    placeholder="Province"
                  />
                  <input
                    type="text"
                    name="region"
                    value={clinicForm.region}
                    onChange={handleInputChange}
                    placeholder="Region"
                  />
                  <input
                    type="text"
                    name="zip"
                    value={clinicForm.zip}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                  />
                </div>

                <label>Clinic Image:</label>
                <div className="file-upload">
                  <input
                    type="file"
                    name="clinicImage"
                    onChange={handleInputChange}
                  />
                  <button type="button">+</button>
                </div>

             
                <label>Put a description for online clinic? (Optional)</label>
                <textarea
                  name="description"
                  value={clinicForm.description}
                  onChange={handleInputChange}
                  placeholder="Max 1500 characters"
                />

  
                <label>Choose your schedule:</label>
                <div className="schedule-days">
                  {Object.keys(clinicForm.schedule).map((day) => (
                    <div key={day} className="schedule-day">
                      <strong>{day}</strong>
                      <div className="schedule-inputs">
                        <input
                          type="time"
                          value={clinicForm.schedule[day].start}
                          onChange={(e) =>
                            handleScheduleChange(day, "start", e.target.value)
                          }
                        />
                        <input
                          type="time"
                          value={clinicForm.schedule[day].end}
                          onChange={(e) =>
                            handleScheduleChange(day, "end", e.target.value)
                          }
                        />
                        <input
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

                <label>Fill out payment information:</label>
                <div className="payment-info">
                  <select
                    name="paymentMethod"
                    value={clinicForm.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="Gcash">Gcash</option>
                    <option value="Bank">Bank Payment</option>
                  </select>

                  <input
                    type="text"
                    name="consultationAmount"
                    value={clinicForm.consultationAmount}
                    onChange={handleInputChange}
                    placeholder="Consultation Amount"
                  />
                </div>

      
                <div className="qr-upload-row">
                  <label>Payment QR Code:</label>
                  <div className="file-upload qr-upload">
                    <input
                      type="file"
                      name="qrImages"
                      multiple
                      onChange={handleInputChange}
                    />
                    <button type="button">+</button>
                  </div>
                </div>

        
                <label className="confirm-checkbox">
                  <input
                    type="checkbox"
                    name="confirm"
                    checked={clinicForm.confirm}
                    onChange={handleInputChange}
                  />
                  I hereby confirm that all the information I have provided is
                  true, complete, and correct.
                </label>

           
                <div className="modal-buttons">
                  <button className="btn-create" onClick={handleSubmit}>
                    {isEdit ? "Save Changes" : "Create Clinic"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminClinic;

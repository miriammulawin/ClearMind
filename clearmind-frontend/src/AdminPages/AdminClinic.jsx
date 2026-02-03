import React, { useState } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import { FiEdit } from "react-icons/fi";
import { FaHospital, FaVideo } from "react-icons/fa"; // React Icons
import "./AdminStyle/AdminClinic.css";

function AdminClinic() {
  const [activeMenu, setActiveMenu] = useState("Clinic");

  // Clinic data
  const [clinics, setClinics] = useState([
    {
      id: 1,
      type: "Physical Clinic",
      icon: <FaHospital />,
      days: "Monday, Friday",
      fee: "₱ 2,000.00 - ₱ 2,500.00",
      payment: "Gcash, Bank Payment",
    },
    {
      id: 2,
      type: "Online Clinic",
      icon: <FaVideo />,
      days: "Thursday, Saturday",
      fee: "₱ 2,000.00 - ₱ 2,500.00",
      payment: "Gcash, Bank Payment",
    },
    
  ]);

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content">
          <div className="clinic-header">
            <h3>Available Clinics</h3>
            <button
              className="create-btn"
              onClick={() => setShowDoctorModal(true)}
            >
              Create <i className="bi bi-plus-lg" />
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
                  <hr />
                  <button className="edit-btn">
                    Edit <FiEdit />
                  </button>
                </div>
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminClinic;

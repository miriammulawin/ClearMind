import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminPatient.css";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiClipboard,
  FiHeart,
  FiFileText,
  FiX,
  FiClock,
  FiActivity,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

import { FaCalendarAlt, FaUserMd } from "react-icons/fa";

import samplePayment from "../assets/payment/images.png";

function AdminPatientProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const patient = state?.patient;
const [paymentOpen, setPaymentOpen] = useState(false);
const [zoomImage, setZoomImage] = useState(null);
  if (!patient) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Patient not found.</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const appointments = patient.appointments || [
    {
      id: 1,
      date: "January 15, 2026",
      time: "9:00 am",
      psychiatrist: "Dr. Maria Santos, MD",
      specialization: "General Physician",
      reason: "Initial Psychological Assessment",
      status: "Completed",
      consultationMode: "On-Site",
      type: "New Concern",
      notes:
        "Patient was assessed for generalized anxiety disorder. Prescribed escitalopram 10mg once daily. Follow-up in 2 weeks.",
    },
    {
      id: 2,
      date: "February 10, 2026",
      time: "2:00 pm",
      psychiatrist: "Dr. John Cruz, MD",
      specialization: "Psychiatrist",
      reason: "Follow-up Consultation (Anxiety Management)",
      status: "Completed",
      consultationMode: "Virtual",
      type: "Follow Up",
      notes:
        "Patient reports reduced anxiety levels. Medication compliance confirmed. Dosage maintained. Next session in 1 month.",
    },
    {
      id: 3,
      date: "February 25, 2026",
      time: "11:00 am",
      psychiatrist: "Dr. Maria Santos, MD",
      specialization: "General Physician",
      reason: "Cognitive Behavioral Therapy Session",
      status: "Scheduled",
      consultationMode: "On-Site",
      type: "Follow Up",
      notes: "",
    },
  ];

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return {
          background: "#dcfce7",
          color: "#16a34a",
          border: "1px solid #bbf7d0",
        };
      case "scheduled":
        return {
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        };
      case "cancelled":
        return {
          background: "#fee2e2",
          color: "#dc2626",
          border: "1px solid #fecaca",
        };
      case "pending":
        return {
          background: "#fef9c3",
          color: "#b45309",
          border: "1px solid #fde68a",
        };
      default:
        return {
          background: "#f3f4f6",
          color: "#6b7280",
          border: "1px solid #e5e7eb",
        };
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar activeMenu="Patients" />
      <div className="admin-main">
        <AdminTopNavbar activeMenu="Patients" />

        <div className="admin-content patient-profile-container">
          <button onClick={() => navigate(-1)} className="patient-back-btn">
            <FiArrowLeft style={{ marginRight: "6px" }} />
            Back
          </button>

          {/* ── PATIENT INFO CARD ── */}
          <div className="patient-profile-card">
            <div className="patient-profile-layout">
              {/* AVATAR */}
              <div className="patient-avatar-large">
                {patient.profileImage ? (
                  <img src={patient.profileImage} alt="Profile" />
                ) : (
                  <FiUser size={80} />
                )}
              </div>

              {/* DETAILS */}
              <div className="patient-details-section">
                <h2 className="patient-profile-title">{patient.name}</h2>

                {/* ── SECTION: Personal Information ── */}
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#9b7ec8",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "14px",
                    marginTop: "0",
                  }}
                >
                  Personal Information
                </p>
                <div className="modal-two-col" style={{ marginBottom: "20px" }}>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiCalendar />
                    </div>
                    <div>
                      <span className="modal-info-label">Age</span>
                      <span className="modal-info-value">
                        {patient.age} yrs
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiCalendar />
                    </div>
                    <div>
                      <span className="modal-info-label">Date of Birth</span>
                      <span className="modal-info-value">
                        {patient.dateOfBirth || "January 15, 1997"}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiUsers />
                    </div>
                    <div>
                      <span className="modal-info-label">Sex</span>
                      <span className="modal-info-value">{patient.gender}</span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiHeart />
                    </div>
                    <div>
                      <span className="modal-info-label">Civil Status</span>
                      <span className="modal-info-value">
                        {patient.civilStatus || "Single"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── DIVIDER ── */}
                <div
                  style={{
                    borderTop: "1.5px solid #e5d6f5",
                    marginBottom: "20px",
                  }}
                />

                {/* ── SECTION: Contact Information ── */}
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#9b7ec8",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "14px",
                    marginTop: "0",
                  }}
                >
                  Contact Information
                </p>
                <div className="modal-two-col" style={{ marginBottom: "20px" }}>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiPhone />
                    </div>
                    <div>
                      <span className="modal-info-label">Contact</span>
                      <span className="modal-info-value">
                        {patient.contact}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiMail />
                    </div>
                    <div>
                      <span className="modal-info-label">Email</span>
                      <span className="modal-info-value">
                        {patient.email || "—"}
                      </span>
                    </div>
                  </div>
                  <div
                    className="modal-info-item"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <div className="modal-info-icon">
                      <FiMapPin />
                    </div>
                    <div>
                      <span className="modal-info-label">Address</span>
                      <span className="modal-info-value">
                        {patient.address || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── DIVIDER ── */}
                <div
                  style={{
                    borderTop: "1.5px solid #e5d6f5",
                    marginBottom: "20px",
                  }}
                />

                {/* ── SECTION: Patient Details ── */}
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#9b7ec8",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: "14px",
                    marginTop: "0",
                  }}
                >
                  Patient Details
                </p>
                <div className="modal-two-col">
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiClipboard />
                    </div>
                    <div>
                      <span className="modal-info-label">Patient Type</span>
                      <span className="modal-info-value">
                        {patient.patientType || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiClipboard />
                    </div>
                    <div>
                      <span className="modal-info-label">Total Visits</span>
                      <span className="modal-info-value">
                        {patient.totalVisits}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── APPOINTMENT HISTORY CARD ── */}
          <div className="appointment-history-card">
            <h3 className="appointment-history-title">Appointment History</h3>
            <table className="appointment-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Assigned Doctor</th>
                  <th>Reason</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: "#2e104e" }}>
                        {appt.date}
                      </span>
                      <br />
                      <small style={{ color: "#9ca3af" }}>{appt.time}</small>
                    </td>
                    <td>{appt.psychiatrist}</td>
                    <td
                      style={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {appt.reason}
                    </td>
                    <td>{appt.type}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          ...getStatusBadgeStyle(appt.status),
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-view"
                        style={{
                          width: "70px",
                          height: "30px",
                          fontSize: "12px",
                        }}
                        onClick={() => setSelectedAppointment(appt)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          APPOINTMENT DETAIL MODAL
      ══════════════════════════════════════ */}
      {selectedAppointment && (
        <div
          className="patient-modal-overlay"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="patient-modal-lg"
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── HEADER ── */}
            <div className="modal-profile-header">
              <button
                className="close-btn profile-close-btn"
                onClick={() => setSelectedAppointment(null)}
              >
                <FiX />
              </button>
              <div className="modal-profile-row">
               
                <div className="patient-profile-info">
                  <h3 className="patient-profile-name">Appointment Details</h3>
                  <p className="patient-profile-contact">{patient.name}</p>
                  <div className="patient-profile-meta">
                    <span className="profile-meta-chip">
                      {selectedAppointment.date}
                    </span>
                    <span className="profile-meta-chip">
                      {selectedAppointment.time}
                    </span>
                    <span
                      className="profile-meta-chip"
                      style={{
                        ...getStatusBadgeStyle(selectedAppointment.status),
                        border: "1px solid rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.2)",
                        color: "#fff",
                      }}
                    >
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div
                className="modal-content-card"
                style={{ marginBottom: "12px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #ede9f6",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #7341A8, #4D227C)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FaCalendarAlt size={13} color="#fff" />
                  </div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#3b1f6e",
                    }}
                  >
                    Appointment Info
                  </h4>
                </div>
                <div className="modal-two-col">
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiCalendar />
                    </div>
                    <div>
                      <span className="modal-info-label">Date</span>
                      <span className="modal-info-value">
                        {selectedAppointment.date}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiClock />
                    </div>
                    <div>
                      <span className="modal-info-label">Time</span>
                      <span className="modal-info-value">
                        {selectedAppointment.time}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiClipboard />
                    </div>
                    <div>
                      <span className="modal-info-label">Visit Type</span>
                      <span className="modal-info-value">
                        {selectedAppointment.type}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiUser />
                    </div>
                    <div>
                      <span className="modal-info-label">Status</span>
                      <span
                        className="status-badge"
                        style={{
                          ...getStatusBadgeStyle(selectedAppointment.status),
                          marginTop: "2px",
                        }}
                      >
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ASSIGNED DOCTOR */}
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "14px",
                    borderTop: "1px dashed #e5e7eb",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#9b7ec8",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                 
                    Assigned Doctor
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      background: "linear-gradient(135deg, #f3eeff, #ede9f6)",
                      border: "1px solid #d8ccf0",
                      borderRadius: "10px",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #7341A8, #4D227C)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(115,65,168,0.3)",
                      }}
                    >
                      <FaUserMd size={18} color="#fff" />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#3b1f6e",
                          margin: "0 0 2px 0",
                          lineHeight: 1.2,
                        }}
                      >
                        {selectedAppointment.psychiatrist}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#7341A8",
                          margin: 0,
                          fontStyle: "italic",
                        }}
                      >
                        {selectedAppointment.specialization}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CLINICAL NOTES */}
              {selectedAppointment.status === "Completed" &&
                selectedAppointment.notes && (
                  <div className="modal-content-card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "14px",
                        paddingBottom: "12px",
                        borderBottom: "1px solid #ede9f6",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "8px",
                          background:
                            "linear-gradient(135deg, #7341A8, #4D227C)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FiActivity size={14} color="#fff" />
                      </div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "17px",
                          fontWeight: 800,
                          color: "#3b1f6e",
                        }}
                      >
                        Progression Notes
                      </h4>
                    </div>
                    <div
                      style={{
                        background: "#faf7ff",
                        border: "1px solid #ede9f6",
                        borderRadius: "10px",
                        padding: "16px 18px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "13.5px",
                          color: "#374151",
                          margin: 0,
                          lineHeight: "1.75",
                        }}
                      >
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  </div>
                )}

              {/* PAYMENT DETAILS */}
              <div
                className="modal-content-card"
                style={{ marginBottom: "12px" }}
              >
                <button
                  className="payment-collapse-toggle"
                  onClick={() => setPaymentOpen(!paymentOpen)}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #7341A8, #4D227C)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FiFileText size={13} color="#fff" />
                    </div>
                    <span
                      className="modal-section-title"
                      style={{ margin: 0, padding: 0, border: "none" }}
                    >
                      Payment Details
                    </span>
                  </span>
                  <span className="payment-toggle-icon">
                    {paymentOpen ? (
                      <FiChevronUp size={18} />
                    ) : (
                      <FiChevronDown size={18} />
                    )}
                    <span style={{ fontSize: 12, marginLeft: 4 }}>
                      {paymentOpen ? "Hide" : "View"}
                    </span>
                  </span>
                </button>
                {paymentOpen && (
                  <div className="payment-collapse-body">
                    <div className="payment-layout">
                      <div className="payment-fields">
                        <div className="modal-info-item">
                          <div
                            className="modal-info-icon"
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            ₱
                          </div>
                          <div>
                            <span className="modal-info-label">
                              Paid Amount
                            </span>
                            <span className="modal-info-value">—</span>
                          </div>
                        </div>
                        <div className="modal-info-item">
                          <div
                            className="modal-info-icon"
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            #
                          </div>
                          <div>
                            <span className="modal-info-label">
                              Reference No.
                            </span>
                            <span className="modal-info-value">—</span>
                          </div>
                        </div>
                        <div className="modal-info-item">
                          <div
                            className="modal-info-icon"
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            PAY
                          </div>
                          <div>
                            <span className="modal-info-label">
                              Payment Option
                            </span>
                            <span className="modal-info-value">—</span>
                          </div>
                        </div>
                      </div>
                      <div className="payment-proof">
                        <span className="payment-proof-label">
                          Payment Proof
                        </span>
                        <img
                          src={samplePayment}
                          alt="Payment Proof"
                          className="payment-proof-img"
                          onClick={() => setZoomImage(samplePayment)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="modal-footer">
              <button
                style={{
                  padding: "10px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "10px",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPatientProfile;

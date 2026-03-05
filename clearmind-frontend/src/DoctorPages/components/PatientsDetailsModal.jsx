import { useState, useEffect } from "react";
import { FiX, FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

function StarDisplay({ rating }) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar key={star} size={18} style={{ color: star <= rating ? "#f59e0b" : "#e2e8f0" }} />
      ))}
    </div>
  );
}

function PatientDetailsModal({ show, onClose, patient }) {
  const [initialImpression, setInitialImpression] = useState("");
  const [complaints, setComplaints]               = useState("");

  useEffect(() => {
    if (patient) {
      setInitialImpression(patient.initialImpression || "");
      setComplaints(patient.complaints || "");
    }
  }, [patient]);

  if (!show || !patient) return null;

  const isCompleted = patient.status === "Completed";

  const paymentBadge = {
    Paid:     {color: "#16a34a", label: "Paid" },
  }[patient.paymentStatus] || {  color: "#6b7280", label: patient.paymentStatus || "—" };

  return (
    <div className="patient-modal-overlay" onClick={onClose}>
      <div className="patient-modal-lg" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h2>Patient Details</h2>
          <div style={{ display: "flex", gap: "15px" }}>
            <span className="modal-date">{patient.date}</span>
            <button className="close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* ── Patient Information ── */}
          <div className="modal-section">
            <h4>Patient Information</h4>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Date of Birth:</strong> {patient.dob}</p>
            <p><strong>Sex:</strong> {patient.sex}</p>
            <p><strong>Civil Status:</strong> {patient.civilStatus}</p>
            <p><strong>Contact:</strong> {patient.contact}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Address:</strong> {patient.address}</p>
            <p><strong>Patient Type:</strong> {patient.patientType}</p>
            <p><strong>Patient Classification:</strong> {patient.classification}</p>
            <p><strong>Reason for Consultation:</strong> {patient.reason}</p>
            {patient.informant && patient.informant !== "—" && (
              <p><strong>Full Name of Informant:</strong> {patient.informant}</p>
            )}
            {patient.relation && patient.relation !== "—" && (
              <p><strong>Relation to the Client:</strong> {patient.relation}</p>
            )}
            <p>
              <strong>Services:</strong>{" "}
              {(patient.services || []).length > 0 ? (patient.services || []).join(", ") : "—"}
            </p>
            <p>
              <strong>Payment Status:</strong>{" "}
              <span style={{ color: paymentBadge.color }}>
                {paymentBadge.label}
              </span>
            </p>
          </div>

          <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #e0e0e0" }} />

          {/* ── Progress Note ── */}
          <div className="modal-section">
            <h4>Progress Note</h4>

            <div style={{ marginBottom: "15px" }}>
              <p><strong>Initial Impression:</strong></p>
              <textarea
                value={initialImpression}
                onChange={(e) => setInitialImpression(e.target.value)}
                placeholder="Enter initial impression..."
                style={{
                  width: "100%", minHeight: "100px", padding: "12px",
                  borderRadius: "8px", border: "1px solid #ddd",
                  fontSize: "14px", fontFamily: "inherit", resize: "vertical",
                }}
              />
            </div>

            <div>
              <p><strong>Complains:</strong></p>
              <textarea
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                placeholder="Enter patient complaints..."
                style={{
                  width: "100%", minHeight: "100px", padding: "12px",
                  borderRadius: "8px", border: "1px solid #ddd",
                  fontSize: "14px", fontFamily: "inherit", resize: "vertical",
                }}
              />
            </div>
          </div>

          {/* ── Feedback & Rating (completed only) ── */}
          {isCompleted && (
            <>
              <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #e0e0e0" }} />
              <div className="modal-section">
                <h4>Patient Feedback & Rating</h4>
                {patient.feedback ? (
                  <div style={{ backgroundColor: "#faf7ff", borderRadius: "10px", padding: "14px 16px", border: "1px solid #e9ddf8" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <StarDisplay rating={patient.feedback.rating} />
                      <span style={{ fontSize: "20px", fontWeight: "700", color: "#4D227C" }}>{patient.feedback.rating}</span>
                      <span style={{ fontSize: "13px", color: "#888" }}>/ 5</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#444", lineHeight: "1.6", fontStyle: "italic", margin: "0 0 8px 0" }}>
                      "{patient.feedback.comment}"
                    </p>
                    <small style={{ color: "#aaa" }}>Submitted: {patient.feedback.date}</small>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px dashed #ddd" }}>
                    <FiStar size={26} style={{ color: "#ddd", marginBottom: "6px" }} />
                    <p style={{ fontSize: "13px", color: "#aaa", margin: 0 }}>No feedback submitted yet.</p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-completed">Completed</button>
        </div>
      </div>
    </div>
  );
}

export default PatientDetailsModal;
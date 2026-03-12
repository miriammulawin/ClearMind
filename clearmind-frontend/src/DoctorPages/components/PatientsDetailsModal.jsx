import { useState, useEffect } from "react";
import { FiX, FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import axiosClient from "../../axiosClient";

function StarDisplay({ rating }) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar key={star} size={18} style={{ color: star <= rating ? "#f59e0b" : "#e2e8f0" }} />
      ))}
    </div>
  );
}

function PatientDetailsModal({ show, onClose, patient, onSave }) {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialImpression, setInitialImpression] = useState("");
  const [complaints, setComplaints] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // ── Fetch progress notes when modal opens ──────────────────────
  useEffect(() => {
    if (patient && show) {
      loadProgressNotes();
    }
  }, [patient, show]);

  // ── Load progress notes from API ───────────────────────────────
  const loadProgressNotes = async () => {
    if (!patient?.id) return;
    
    setLoading(true);
    try {
      const res = await axiosClient.get(`/doctor/patients/${patient.id}/progress-notes`);
      if (res.data) {
        setInitialImpression(res.data.initialImpression || "");
        setComplaints(res.data.complaints || "");
        setFeedback(res.data.feedback || null);
      }
    } catch (err) {
      console.error("Failed to load progress notes:", err);
      // Fallback to empty if not found
      setInitialImpression("");
      setComplaints("");
      setFeedback(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Track changes ──────────────────────────────────────────────
  const handleImpression = (value) => {
    setInitialImpression(value);
    setHasChanges(true);
  };

  const handleComplaints = (value) => {
    setComplaints(value);
    setHasChanges(true);
  };

  // ── Save progress notes ────────────────────────────────────────
  const handleSaveNotes = async () => {
    if (!patient?.id) {
      alert("Patient ID not found");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        initialImpression,
        complaints,
      };

      await axiosClient.post(`/doctor/patients/${patient.id}/progress-notes`, payload);
      
      setHasChanges(false);
      alert("Progress notes saved successfully!");
      
      // Notify parent component of changes
      if (onSave) {
        onSave({
          ...patient,
          initialImpression,
          complaints,
        });
      }
    } catch (err) {
      console.error("Failed to save progress notes:", err);
      alert("Error saving progress notes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Format date helper ──────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
  };

  if (!show || !patient) return null;

  const isCompleted = patient.appointment_status === "Completed";

  // Payment badge mapping
  const paymentBadge = {
    Paid: { color: "#16a34a", label: "Paid" },
    Pending: { color: "#B45309", label: "Pending" },
    Failed: { color: "#DC2626", label: "Failed" },
  }[patient.payment_status] || { color: "#6b7280", label: patient.payment_status || "—" };

  return (
    <div className="patient-modal-overlay" onClick={onClose}>
      <div className="patient-modal-lg" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h2>Patient Details</h2>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <span className="modal-date">
              {patient.created_at ? formatDate(patient.created_at) : "—"}
            </span>
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
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div>
                <p><strong>First Name:</strong> {patient.first_name || "—"}</p>
                <p><strong>Last Name:</strong> {patient.last_name || "—"}</p>
                <p><strong>Email:</strong> {patient.email || "—"}</p>
                <p><strong>Contact:</strong> {patient.contact_no || "—"}</p>
              </div>
              <div>
                <p><strong>Gender:</strong> {patient.sex || "—"}</p>
                <p><strong>Date of Birth:</strong> {patient.dob ? formatDate(patient.dob) : "—"}</p>
                <p><strong>Status:</strong> 
                  <span style={{ 
                    color: patient.appointment_status === "Completed" ? "#16A34A" : 
                           patient.appointment_status === "Scheduled" ? "#1E3A8A" : 
                           patient.appointment_status === "Pending" ? "#B45309" : "#DC2626",
                    fontWeight: "600",
                    marginLeft: "8px"
                  }}>
                    {patient.appointment_status || "—"}
                  </span>
                </p>
                <p><strong>Payment Status:</strong> 
                  <span style={{ color: paymentBadge.color, fontWeight: "600", marginLeft: "8px" }}>
                    {paymentBadge.label}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #e0e0e0" }} />

          {/* ── Progress Note ── */}
          <div className="modal-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h4 style={{ margin: 0 }}>Progress Note</h4>
              {hasChanges && (
                <span style={{ fontSize: "12px", color: "#B45309", fontWeight: "600" }}>
                  ● Unsaved changes
                </span>
              )}
            </div>

            {loading ? (
              <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>Loading progress notes...</p>
            ) : (
              <>
                <div style={{ marginBottom: "15px" }}>
                  <p><strong>Initial Impression:</strong></p>
                  <textarea
                    value={initialImpression}
                    onChange={(e) => handleImpression(e.target.value)}
                    placeholder="Enter initial impression..."
                    style={{
                      width: "100%", minHeight: "100px", padding: "12px",
                      borderRadius: "8px", border: "1px solid #ddd",
                      fontSize: "14px", fontFamily: "inherit", resize: "vertical",
                    }}
                  />
                </div>

                <div>
                  <p><strong>Complaints:</strong></p>
                  <textarea
                    value={complaints}
                    onChange={(e) => handleComplaints(e.target.value)}
                    placeholder="Enter patient complaints..."
                    style={{
                      width: "100%", minHeight: "100px", padding: "12px",
                      borderRadius: "8px", border: "1px solid #ddd",
                      fontSize: "14px", fontFamily: "inherit", resize: "vertical",
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* ── Feedback & Rating (completed only) ── */}
          {isCompleted && (
            <>
              <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #e0e0e0" }} />
              <div className="modal-section">
                <h4>Patient Feedback & Rating</h4>
                {feedback ? (
                  <div style={{ backgroundColor: "#faf7ff", borderRadius: "10px", padding: "14px 16px", border: "1px solid #e9ddf8" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <StarDisplay rating={feedback.rating} />
                      <span style={{ fontSize: "20px", fontWeight: "700", color: "#4D227C" }}>
                        {feedback.rating}
                      </span>
                      <span style={{ fontSize: "13px", color: "#888" }}>/ 5</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#444", lineHeight: "1.6", fontStyle: "italic", margin: "0 0 8px 0" }}>
                      "{feedback.comment}"
                    </p>
                    <small style={{ color: "#aaa" }}>
                      Submitted: {feedback.date ? formatDate(feedback.date) : "—"}
                    </small>
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
          <button 
            className="btn-completed" 
            onClick={handleSaveNotes}
            disabled={isSaving || loading || !hasChanges}
            style={{
              opacity: !hasChanges ? 0.6 : 1,
              cursor: !hasChanges ? "not-allowed" : "pointer",
            }}
          >
            {isSaving ? "Saving..." : "Save Notes"}
          </button>
          <button 
            className="btn-secondary" 
            onClick={onClose}
            style={{
              background: "#f0e6ff",
              color: "#4D227C",
              border: "1px solid #d1a4de",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientDetailsModal;
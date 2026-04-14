import React from "react";
import { Container, Button, Badge } from "react-bootstrap";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaFileAlt } from "react-icons/fa";
import { getAppointmentById } from "../../../MockData/MockAppointment.js";
import "./styles/AppointmentDetails.css";

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const appointment = getAppointmentById(id);

  const getStatusBadgeVariant = (status) => {
    const variants = {
      Pending: "warning",
      Confirmed: "info",
      Rescheduled: "orange",
      Completed: "success",
      Cancelled: "danger",
    };
    return variants[status] || "secondary";
  };

  const location = useLocation();
  const from = location.state?.from || "upcoming";

  const handleBack = () => navigate(`/client/appointment/${from}`);
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      alert("Appointment cancelled successfully!");
      navigate(-1);
    }
  };
  const handleViewReceipt = () => {
    alert("Receipt viewing will be implemented with backend");
  };

  if (!appointment) {
    return (
      <div className="ad-page">
        <div className="ad-back-row">
          <button className="ad-back-btn" onClick={handleBack}>
            <FaArrowLeft /> Go Back
          </button>
        </div>
        <div className="ad-scroll-body">
          <Container className="ad-container py-4">
            <div className="text-center">
              <h4>Appointment not found</h4>
            </div>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-page">
      {/* ── Back Row ── */}
      <div className="ad-back-row">
        <button className="ad-back-btn" onClick={handleBack}>
          <FaArrowLeft /> Back to Appointments
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="ad-scroll-body">
        <Container className="ad-container py-4">
          {/* ── Header ── */}
          <div className="ad-header">
            <span className="ad-header-title">APPOINTMENT DETAILS</span>
            <Badge
              bg={getStatusBadgeVariant(appointment.status)}
              className="ad-status-badge"
            >
              {appointment.status}
            </Badge>
          </div>

          {/* ── Summary card ── */}
          <div className="ad-summary-card">
            {/* Schedule */}
            <div className="ad-group">
              <div className="ad-group-title">Schedule</div>
              <div className="ad-row">
                <span className="ad-key">Time:</span>
                <span className="ad-val">{appointment.time}</span>
              </div>
              {appointment.date ? (
                <div className="ad-row">
                  <span className="ad-key">Date:</span>
                  <span className="ad-val">{appointment.date}</span>
                </div>
              ) : (
                <div className="ad-row">
                  <span className="ad-key">Date:</span>
                  <span className="ad-val ad-pending">
                    Awaiting confirmation
                  </span>
                </div>
              )}
              <div className="ad-row">
                <span className="ad-key">Assigned Doctor:</span>
                <span className="ad-val">{appointment.doctor}</span>
              </div>
              <div className="ad-row">
                <span className="ad-key">Visit Type:</span>
                <span className="ad-val">{appointment.type}</span>
              </div>
            </div>

            {appointment.doctorHistory?.length > 1 && (
              <>
                <div className="ad-divider" />
                <div className="ad-group">
                  <div className="ad-group-title">Doctor History</div>
                  {appointment.doctorHistory.map((h) => (
                    <div className="ad-row" key={h.sessionNumber}>
                      <span className="ad-key">Session {h.sessionNumber}:</span>
                      <span className="ad-val">
                        {h.doctor}
                        {h.changeReason && (
                          <span className="ad-change-note">
                            {" "}
                            ⚠ {h.changeReason}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="ad-divider" />

            {/* Patient Profile */}
            <div className="ad-group">
              <div className="ad-group-title">Patient Profile</div>
              <div className="ad-row">
                <span className="ad-key">Patient Name:</span>
                <span className="ad-val">{appointment.patientName}</span>
              </div>
              {appointment.classification && (
                <div className="ad-row">
                  <span className="ad-key">Classification:</span>
                  <span className="ad-val">{appointment.classification}</span>
                </div>
              )}
              <div className="ad-row">
                <span className="ad-key">Sex:</span>
                <span className="ad-val">{appointment.sex}</span>
              </div>
              <div className="ad-row">
                <span className="ad-key">Date of Birth:</span>
                <span className="ad-val">{appointment.dateOfBirth}</span>
              </div>
              <div className="ad-row">
                <span className="ad-key">Contact Number:</span>
                <span className="ad-val">{appointment.contactNumber}</span>
              </div>
              <div className="ad-row">
                <span className="ad-key">Email:</span>
                <span className="ad-val">{appointment.email}</span>
              </div>
              <div className="ad-row">
                <span className="ad-key">Home Address:</span>
                <span className="ad-val">{appointment.homeAddress}</span>
              </div>
            </div>

            {/* Reason for Consultation */}
            {appointment.reason && (
              <>
                <div className="ad-divider" />
                <div className="ad-group">
                  <div className="ad-group-title">Reason for Consultation</div>
                  <p className="ad-reason">{appointment.reason}</p>
                </div>
              </>
            )}

            <div className="ad-divider" />

            {/* ── Service-Specific Details ── */}
            {(appointment.employerName || appointment.assessmentPurpose) && (
              <>
                <div className="ad-divider" />
                <div className="ad-group">
                  <div className="ad-group-title">Pre-Employment Details</div>
                  {appointment.employerName && (
                    <div className="ad-row">
                      <span className="ad-key">Employer / Company:</span>
                      <span className="ad-val">{appointment.employerName}</span>
                    </div>
                  )}
                  {appointment.assessmentPurpose && (
                    <div className="ad-row">
                      <span className="ad-key">Purpose of Assessment:</span>
                      <span className="ad-val">
                        {appointment.assessmentPurpose}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {(appointment.travelType || appointment.hasDiagnosis != null) && (
              <>
                <div className="ad-divider" />
                <div className="ad-group">
                  <div className="ad-group-title">ESA / Travel Details</div>
                  {appointment.travelType && (
                    <div className="ad-row">
                      <span className="ad-key">Travel Type:</span>
                      <span className="ad-val">{appointment.travelType}</span>
                    </div>
                  )}
                  <div className="ad-row">
                    <span className="ad-key">Existing Diagnosis:</span>
                    <span className="ad-val">
                      {appointment.hasDiagnosis ? "Yes" : "No"}
                    </span>
                  </div>
                  {appointment.hasDiagnosis && appointment.diagnosisFile && (
                    <div className="ad-row">
                      <span className="ad-key">Diagnosis Document:</span>
                      <Button variant="link" className="ad-receipt-link">
                        <FaFileAlt /> {appointment.diagnosisFile}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {(appointment.schoolName || appointment.program) && (
              <>
                <div className="ad-divider" />
                <div className="ad-group">
                  <div className="ad-group-title">Internship Details</div>
                  {appointment.schoolName && (
                    <div className="ad-row">
                      <span className="ad-key">School / University:</span>
                      <span className="ad-val">{appointment.schoolName}</span>
                    </div>
                  )}
                  {appointment.program && (
                    <div className="ad-row">
                      <span className="ad-key">Program / Course:</span>
                      <span className="ad-val">{appointment.program}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="ad-divider" />

            {/* ── Payment Details ── */}
            <div className="ad-group">
              <div className="ad-group-title">Payment Details</div>
              <div className="ad-row">
                <span className="ad-key">Mode of Payment:</span>
                <span className="ad-val">{appointment.paymentMode || "—"}</span>
              </div>
              <div className="ad-row">
                <span className="ad-key">Reference Number:</span>
                <span className="ad-val">
                  {appointment.referenceNumber || "—"}
                </span>
              </div>

              {/* Fee breakdown for Pre-Employment */}
              {appointment.totalAmount != null && (
                <>
                  {appointment.wantsPrintedReport != null && (
                    <div className="ad-row">
                      <span className="ad-key">Printed Report:</span>
                      <span className="ad-val">
                        {appointment.wantsPrintedReport
                          ? "Yes (+₱1,500)"
                          : "No"}
                      </span>
                    </div>
                  )}
                  <div className="ad-row">
                    <span className="ad-key">Total Amount:</span>
                    <span className="ad-val ad-total">
                      ₱{appointment.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              <div className="ad-row">
                <span className="ad-key">Proof of Payment:</span>
                {appointment.proofFile ? (
                  <Button
                    variant="link"
                    className="ad-receipt-link"
                    onClick={handleViewReceipt}
                  >
                    <FaFileAlt /> {appointment.proofFile}
                  </Button>
                ) : (
                  <span className="ad-val">—</span>
                )}
              </div>

              <div className="ad-row">
                <span className="ad-key">Receipt:</span>
                <Button
                  variant="link"
                  className="ad-receipt-link"
                  onClick={handleViewReceipt}
                >
                  <FaFileAlt /> See attached receipt
                </Button>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="ad-actions">
              {appointment.status === "Confirmed" && (
                <button
                  className="ad-reschedule-btn"
                  onClick={() =>
                    alert("Reschedule will be implemented with backend")
                  }
                >
                  RESCHEDULE
                </button>
              )}
              {(appointment.status === "Pending" ||
                appointment.status === "Confirmed") && (
                <button className="ad-cancel-btn" onClick={handleCancel}>
                  CANCEL
                </button>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AppointmentDetails;

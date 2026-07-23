import React, { useState, useEffect } from "react";
import { Container, Button, Badge } from "react-bootstrap";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaFileAlt } from "react-icons/fa";
import axiosClient from "../../../axiosClient";
import "./styles/AppointmentDetails.css";

// Converts the raw API appointment (with nested patient/doctor) into the
// flat shape this page renders.
const mapAppointmentDetails = (apt) => {
  const patient = apt.patient || {};
  const doctor = apt.doctor;

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  const formatTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${m} ${suffix}`;
  };

  // "2026-07-30" -> "July 30, 2026 (Thursday)"
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const formatted = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    return `${formatted} (${weekday})`;
  };

  // "2000-05-14" -> "May 14, 2000" (no weekday needed for DOB)
  const formatDob = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const receipts = apt.receipt_paths || [];

  return {
    id: apt.appointment_id,
    status: capitalize(apt.status),
    time:
      apt.start_time && apt.end_time
        ? `${formatTime(apt.start_time)} - ${formatTime(apt.end_time)}`
        : formatTime(apt.start_time),
    date: formatDate(apt.appointment_date),
    doctor: doctor
      ? `${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim() ||
        doctor.name
      : "Not yet assigned",
    type: apt.visit_type === "virtual" ? "Virtual" : "Onsite",

    patientName: `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim(),
    classification: patient.patientClassification,
    sex: patient.sex,
    dateOfBirth: formatDob(patient.dob),
    contactNumber: patient.contactNo,
    email: patient.email,
    homeAddress: patient.address,

    reason: apt.reason_for_consultation,

    paymentMode: apt.payment_mode,
    referenceNumber: apt.payment_reference,
    totalAmount: apt.bill_amount != null ? Number(apt.bill_amount) : null,
    proofFile: receipts.length > 0 ? receipts[receipts.length - 1] : null,

    programId: apt.program_id ?? null,
    progressionStatus: apt.progression_status ?? null,
  };
};

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "upcoming";

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get(`/appointments/${id}`)
      .then(({ data }) => {
        setAppointment(mapAppointmentDetails(data.data));
      })
      .catch((e) => console.error("Fetch Appointment Error:", e))
      .finally(() => setLoading(false));
  }, [id]);

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

  const handleBack = () => navigate(`/client/appointment/${from}`);

  const handleCancel = () => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;
    axiosClient
      .delete(`/appointments/${id}`)
      .then(() => {
        navigate(-1);
      })
      .catch((e) => {
        console.error("Cancel Appointment Error:", e);
        alert("Failed to cancel appointment. Please try again.");
      });
  };

  const handleViewReceipt = () => {
    if (!appointment?.proofFile) return;
    window.open(`/storage/${appointment.proofFile}`, "_blank");
  };

  if (loading) {
    return (
      <div className="ad-page">
        <div className="ad-scroll-body">
          <Container className="ad-container py-4">
            <p style={{ color: "#888", textAlign: "center" }}>
              Loading appointment…
            </p>
          </Container>
        </div>
      </div>
    );
  }

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

              {appointment.totalAmount != null && (
                <div className="ad-row">
                  <span className="ad-key">Total Amount:</span>
                  <span className="ad-val ad-total">
                    ₱{appointment.totalAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="ad-row">
                <span className="ad-key">Proof of Payment / Receipt:</span>
                {appointment.proofFile ? (
                  <Button
                    variant="link"
                    className="ad-receipt-link"
                    onClick={handleViewReceipt}
                  >
                    <FaFileAlt /> See attached receipt
                  </Button>
                ) : (
                  <span className="ad-val">—</span>
                )}
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

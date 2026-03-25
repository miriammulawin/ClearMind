import React from 'react';
import { Container, Button, Badge } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { getAppointmentById } from '../../../MockData/MockAppointment.js';
import './styles/AppointmentDetails.css';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const appointment = getAppointmentById(id);

  const getStatusBadgeVariant = (status) => {
    const variants = {
      'Pending':     'warning',
      'Confirmed':   'info',
      'Rescheduled': 'orange',
    };
    return variants[status] || 'secondary';
  };

  const location = useLocation();
  const from = location.state?.from || 'upcoming';

  const handleBack   = () => navigate(`/client/appointment/${from}`);
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      alert('Appointment cancelled successfully!');
      navigate(-1);
    }
  };
  const handleViewReceipt = () => {
    alert('Receipt viewing will be implemented with backend');
  };

  if (!appointment) {
    return (
      <Container className="ad-container py-4">
        <div className="text-center">
          <h4>Appointment not found</h4>
          <Button onClick={() => navigate(-1)} variant="link" className="ad-back-btn">Go Back</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="ad-container py-4">

      {/* ── Back button ── */}
      <Button variant="link" className="ad-back-btn mb-3" onClick={handleBack}>
        <FaArrowLeft /> Back to Appointments
      </Button>

      {/* ── Header ── */}
      <div className="ad-header">
        <span className="ad-header-title">APPOINTMENT DETAILS</span>
        <Badge bg={getStatusBadgeVariant(appointment.status)} className="ad-status-badge">
          {appointment.status}
        </Badge>
      </div>

      {/* ── Summary card — same design as PaymentForm summaryCard ── */}
      <div className="ad-summary-card">

        {/* Schedule */}
        <div className="ad-group">
          <div className="ad-group-title">Schedule</div>
          <div className="ad-row"><span className="ad-key">Time:</span><span className="ad-val">{appointment.time}</span></div>
          <div className="ad-row"><span className="ad-key">Date:</span><span className="ad-val">{appointment.date}</span></div>
          <div className="ad-row"><span className="ad-key">Assigned Doctor:</span><span className="ad-val">{appointment.doctor}</span></div>
          <div className="ad-row"><span className="ad-key">Visit Type:</span><span className="ad-val">{appointment.type}</span></div>
        </div>

        <div className="ad-divider" />

        {/* Patient Profile */}
        <div className="ad-group">
          <div className="ad-group-title">Patient Profile</div>
          <div className="ad-row"><span className="ad-key">Patient Name:</span><span className="ad-val">{appointment.patientName}</span></div>
          {appointment.classification && (
            <div className="ad-row"><span className="ad-key">Classification:</span><span className="ad-val">{appointment.classification}</span></div>
          )}
          <div className="ad-row"><span className="ad-key">Sex:</span><span className="ad-val">{appointment.sex}</span></div>
          <div className="ad-row"><span className="ad-key">Date of Birth:</span><span className="ad-val">{appointment.dateOfBirth}</span></div>
          <div className="ad-row"><span className="ad-key">Contact Number:</span><span className="ad-val">{appointment.contactNumber}</span></div>
          <div className="ad-row"><span className="ad-key">Email:</span><span className="ad-val">{appointment.email}</span></div>
          <div className="ad-row"><span className="ad-key">Home Address:</span><span className="ad-val">{appointment.homeAddress}</span></div>
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

        {/* Payment Details */}
        <div className="ad-group">
          <div className="ad-group-title">Payment Details</div>
          <div className="ad-row">
            <span className="ad-key">Mode of Payment:</span>
            <span className="ad-val">{appointment.paymentMode || '—'}</span>
          </div>
          <div className="ad-row">
            <span className="ad-key">Receipt:</span>
            <Button variant="link" className="ad-receipt-link" onClick={handleViewReceipt}>
              <FaFileAlt /> See attached receipt
            </Button>
          </div>
        </div>
        {/* ── Actions ── Pending: Cancel only | Confirmed: Reschedule + Cancel ── */}
        <div className="ad-actions">
          {appointment.status === 'Confirmed' && (
            <button
              className="ad-reschedule-btn"
              onClick={() => alert('Reschedule will be implemented with backend')}
            >
              RESCHEDULE
            </button>
          )}
          {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
            <button className="ad-cancel-btn" onClick={handleCancel}>
              CANCEL
            </button>
          )}
        </div>
      </div>

    </Container>
  );
};

export default AppointmentDetails;
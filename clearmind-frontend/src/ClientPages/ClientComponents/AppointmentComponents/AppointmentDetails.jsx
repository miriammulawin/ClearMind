import React from 'react';
import { Container, Card, Button, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFileAlt } from 'react-icons/fa';
import { getAppointmentById } from '../../../MockData/MockAppointment.js';
import '../../ClientStyle/AppointmentDetails.css';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get appointment from mock data
  const appointment = getAppointmentById(id);
  
  const getStatusBadgeVariant = (status) => {
    const variants = {
      'Pending': 'warning',
      'Confirmed': 'info',
      'Rescheduled': 'orange'
    };
    return variants[status] || 'secondary';
  };
  
  const handleBack = () => {
  navigate('/client/appointment/upcoming');
  };
  
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      alert('Appointment cancelled successfully!');
      navigate(-1);
    }
  };
  
  const handleViewReceipt = () => {
    alert('Receipt viewing will be implemented with backend');
  };
  
  // If appointment not found
  if (!appointment) {
    return (
      <Container className="appointment-details-container py-4">
        <div className="text-center">
          <h4>Appointment not found</h4>
          <Button onClick={() => navigate(-1)} variant="outline-purple">
            Go Back
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="appointment-details-container py-4">
      <Button 
        variant="link" 
        className="back-button mb-3"
        onClick={handleBack}
      >
        <FaArrowLeft /> Back to Appointments
      </Button>
      
      <Card className="details-card">
        <Card.Header className="details-header">
          <h4>APPOINTMENT DETAILS</h4>
        </Card.Header>
        
        <Card.Body className="details-body">
          <Badge 
            bg={getStatusBadgeVariant(appointment.status)} 
            className="status-badge-details"
          >
            {appointment.status}
          </Badge>
          
          <div className="details-section">
            <div className="detail-row">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{appointment.time}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{appointment.date}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Assigned Doctor:</span>
              <span className="detail-value">{appointment.doctor}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Visit Type:</span>
              <span className="detail-value">{appointment.type}</span>
            </div>
          </div>
          
          <hr className="divider" />
          
          <div className="details-section">
            <div className="detail-row">
              <span className="detail-label">Patient Name:</span>
              <span className="detail-value">{appointment.patientName}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Patient Classification:</span>
              <span className="detail-value">{appointment.classification}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Sex:</span>
              <span className="detail-value">{appointment.sex}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Date of Birth:</span>
              <span className="detail-value">{appointment.dateOfBirth}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Contact Number:</span>
              <span className="detail-value">{appointment.contactNumber}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{appointment.email}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Home Address:</span>
              <span className="detail-value">{appointment.homeAddress}</span>
            </div>
          </div>
          
          <hr className="divider" />
          
          <div className="details-section">
            <div className="section-title">Payment Details:</div>
            
            <div className="detail-row">
              <span className="detail-label">Mode of Payment:</span>
              <span className="detail-value">{appointment.paymentMode}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Receipt:</span>
              <Button 
                variant="link" 
                className="receipt-link"
                onClick={handleViewReceipt}
              >
                <FaFileAlt /> See attached receipt
              </Button>
            </div>
          </div>
          
          <div className="action-buttons">
            <Button 
              variant="danger" 
              className="cancel-button"
              onClick={handleCancel}
            >
              CANCEL
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AppointmentDetails;
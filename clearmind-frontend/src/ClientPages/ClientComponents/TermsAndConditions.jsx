import React from 'react';
import { Container } from 'react-bootstrap';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="info-page-container">
      <Container className="info-container">
        {/* Header */}
        <div className="info-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <IoArrowBack size={24} />
          </button>
          <h4 className="info-title">Terms and Conditions</h4>
        </div>

        {/* Content */}
        <div className="info-content">
          <div className="info-section">
            <p className="last-updated">Last Updated: February 6, 2026</p>
          </div>

          <div className="info-section">
            <h5 className="section-title">1. Acceptance of Terms</h5>
            <p className="section-text">
              By accessing and using the CMPS (Clarity of Mind, Journey to Wellness) mobile application, 
              you accept and agree to be bound by the terms and provision of this agreement. If you do not 
              agree to these terms, please do not use our services.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">2. Use of Services</h5>
            <p className="section-text">
              Our mental health services are designed to provide support and counseling. You agree to use 
              the services for lawful purposes only and in a way that does not infringe upon the rights of 
              others or restrict their use of the services.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">3. User Accounts</h5>
            <p className="section-text">
              You are responsible for maintaining the confidentiality of your account credentials and for 
              all activities that occur under your account. You must notify us immediately of any unauthorized 
              use of your account.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">4. Appointments and Cancellations</h5>
            <p className="section-text">
              Appointments must be cancelled at least 24 hours in advance. Failure to do so may result in 
              cancellation fees. We reserve the right to reschedule or cancel appointments due to unforeseen 
              circumstances.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">5. Payment Terms</h5>
            <p className="section-text">
              All fees must be paid in accordance with our pricing and payment terms. We accept various 
              payment methods as specified in the app. Refunds are subject to our refund policy.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">6. Professional Services</h5>
            <p className="section-text">
              Our services are provided by licensed mental health professionals. However, our services are 
              not a substitute for emergency care. If you are experiencing a mental health emergency, please 
              contact emergency services immediately.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">7. Intellectual Property</h5>
            <p className="section-text">
              All content, features, and functionality of the CMPS app are owned by us and are protected by 
              international copyright, trademark, and other intellectual property laws.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">8. Limitation of Liability</h5>
            <p className="section-text">
              We shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of or inability to use the services.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">9. Changes to Terms</h5>
            <p className="section-text">
              We reserve the right to modify these terms at any time. We will notify users of any significant 
              changes. Your continued use of the services after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">10. Contact Information</h5>
            <p className="section-text">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <p className="section-text">
              Email: support@cmps.com<br />
              Phone: +63 XXX-XXX-XXXX
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
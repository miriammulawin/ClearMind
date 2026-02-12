import React from 'react';
import { Container } from 'react-bootstrap';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="info-page-container">
      <Container className="info-container">
        {/* Header */}
        <div className="info-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <IoArrowBack size={24} />
          </button>
          <h4 className="info-title">Privacy Policy</h4>
        </div>

        {/* Content */}
        <div className="info-content">
          <div className="info-section">
            <p className="last-updated">Last Updated: February 6, 2026</p>
          </div>

          <div className="info-section">
            <h5 className="section-title">1. Information We Collect</h5>
            <p className="section-text">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="section-list">
              <li>Personal identification information (name, email, phone number)</li>
              <li>Health information related to your mental health care</li>
              <li>Payment and billing information</li>
              <li>Communication records between you and your therapist</li>
            </ul>
          </div>

          <div className="info-section">
            <h5 className="section-title">2. How We Use Your Information</h5>
            <p className="section-text">
              We use the information we collect to:
            </p>
            <ul className="section-list">
              <li>Provide, maintain, and improve our services</li>
              <li>Schedule and manage your appointments</li>
              <li>Process payments and billing</li>
              <li>Communicate with you about your care</li>
              <li>Ensure the safety and security of our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div className="info-section">
            <h5 className="section-title">3. Information Sharing and Disclosure</h5>
            <p className="section-text">
              We do not sell or rent your personal information. We may share your information only in the 
              following circumstances:
            </p>
            <ul className="section-list">
              <li>With your mental health care provider for treatment purposes</li>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>In case of emergency to protect your safety or others</li>
            </ul>
          </div>

          <div className="info-section">
            <h5 className="section-title">4. Data Security</h5>
            <p className="section-text">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. All data is encrypted both in 
              transit and at rest.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">5. Your Rights and Choices</h5>
            <p className="section-text">
              You have the right to:
            </p>
            <ul className="section-list">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Export your data in a portable format</li>
            </ul>
          </div>

          <div className="info-section">
            <h5 className="section-title">6. HIPAA Compliance</h5>
            <p className="section-text">
              We comply with the Health Insurance Portability and Accountability Act (HIPAA) and maintain strict 
              confidentiality of your protected health information (PHI).
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">7. Cookies and Tracking</h5>
            <p className="section-text">
              We use cookies and similar tracking technologies to improve your experience, analyze usage patterns, 
              and enhance our services. You can control cookie settings through your browser.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">8. Children's Privacy</h5>
            <p className="section-text">
              Our services are not intended for children under 13 years of age. We do not knowingly collect 
              personal information from children under 13.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">9. Changes to Privacy Policy</h5>
            <p className="section-text">
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">10. Contact Us</h5>
            <p className="section-text">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="section-text">
              Email: privacy@cmps.com<br />
              Phone: +63 XXX-XXX-XXXX
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
import React from "react";
import { Container } from "react-bootstrap";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="tab-content-wrapper">
      <div className="help-page-container">
        <Container className="help-container">
          {/* Header */}
          <div
            className="help-header"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <IoArrowBack
              size={22}
              onClick={() => navigate(-1)}
              style={{ cursor: "pointer", color: "#4a2e8f" }}
            />
            <h4 className="help-title">Terms and Conditions</h4>
          </div>

          {/* Content */}
          <div className="faq-section">
            <div className="info-section" style={{ marginBottom: "1rem" }}>
              <p style={{ color: "#999", fontSize: "0.85rem", margin: 0 }}>
                Last Updated: February 6, 2026
              </p>
            </div>

            {[
              {
                title: "1. Acceptance of Terms",
                text: "By accessing and using the CMPS (Clarity of Mind, Journey to Wellness) mobile application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.",
              },
              {
                title: "2. Use of Services",
                text: "Our mental health services are designed to provide support and counseling. You agree to use the services for lawful purposes only and in a way that does not infringe upon the rights of others or restrict their use of the services.",
              },
              {
                title: "3. User Accounts",
                text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.",
              },
              {
                title: "4. Appointments and Cancellations",
                text: "Appointments must be cancelled at least 24 hours in advance. Failure to do so may result in cancellation fees. We reserve the right to reschedule or cancel appointments due to unforeseen circumstances.",
              },
              {
                title: "5. Payment Terms",
                text: "All fees must be paid in accordance with our pricing and payment terms. We accept various payment methods as specified in the app. Refunds are subject to our refund policy.",
              },
              {
                title: "6. Professional Services",
                text: "Our services are provided by licensed mental health professionals. However, our services are not a substitute for emergency care. If you are experiencing a mental health emergency, please contact emergency services immediately.",
              },
              {
                title: "7. Intellectual Property",
                text: "All content, features, and functionality of the CMPS app are owned by us and are protected by international copyright, trademark, and other intellectual property laws.",
              },
              {
                title: "8. Limitation of Liability",
                text: "We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the services.",
              },
              {
                title: "9. Changes to Terms",
                text: "We reserve the right to modify these terms at any time. We will notify users of any significant changes. Your continued use of the services after changes constitutes acceptance of the new terms.",
              },
              {
                title: "10. Contact Information",
                text: "If you have any questions about these Terms and Conditions, please contact us at:\nEmail: support@cmps.com\nPhone: +63 XXX-XXX-XXXX",
              },
            ].map((section, index) => (
              <div
                key={index}
                style={{
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "0.5rem",
                }}
              >
                <h6
                  style={{
                    color: "#4a2e8f",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                  }}
                >
                  {section.title}
                </h6>
                <p
                  style={{
                    color: "#666",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {section.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
}

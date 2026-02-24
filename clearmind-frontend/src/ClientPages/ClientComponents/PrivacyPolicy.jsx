import React from "react";
import { Container } from "react-bootstrap";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ClientHeader from "./Header";
import ClientFooter from "./Footer";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="client-appointment-container">
      <div className="sticky-header">
        <ClientHeader />
      </div>

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
              <h4 className="help-title">Privacy Policy</h4>
            </div>

            {/* Content */}
            <div className="faq-section">
              <div style={{ marginBottom: "1rem" }}>
                <p style={{ color: "#999", fontSize: "0.85rem", margin: 0 }}>
                  Last Updated: February 6, 2026
                </p>
              </div>

              {[
                {
                  title: "1. Information We Collect",
                  text: "We collect information that you provide directly to us, including:\n\n• Personal identification information (name, email, phone number)\n• Health information related to your mental health care\n• Payment and billing information\n• Communication records between you and your therapist",
                },
                {
                  title: "2. How We Use Your Information",
                  text: "We use the information we collect to:\n\n• Provide, maintain, and improve our services\n• Schedule and manage your appointments\n• Process payments and billing\n• Communicate with you about your care\n• Ensure the safety and security of our platform\n• Comply with legal obligations",
                },
                {
                  title: "3. Information Sharing and Disclosure",
                  text: "We do not sell or rent your personal information. We may share your information only in the following circumstances:\n\n• With your mental health care provider for treatment purposes\n• With your explicit consent\n• To comply with legal obligations\n• In case of emergency to protect your safety or others",
                },
                {
                  title: "4. Data Security",
                  text: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted both in transit and at rest.",
                },
                {
                  title: "5. Your Rights and Choices",
                  text: "You have the right to:\n\n• Access your personal information\n• Correct inaccurate information\n• Request deletion of your information\n• Object to processing of your information\n• Export your data in a portable format",
                },
                {
                  title: "6. HIPAA Compliance",
                  text: "We comply with the Health Insurance Portability and Accountability Act (HIPAA) and maintain strict confidentiality of your protected health information (PHI).",
                },
                {
                  title: "7. Cookies and Tracking",
                  text: "We use cookies and similar tracking technologies to improve your experience, analyze usage patterns, and enhance our services. You can control cookie settings through your browser.",
                },
                {
                  title: "8. Children's Privacy",
                  text: "Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.",
                },
                {
                  title: "9. Changes to Privacy Policy",
                  text: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.',
                },
                {
                  title: "10. Contact Us",
                  text: "If you have questions about this Privacy Policy, please contact us at:\n\nEmail: privacy@cmps.com\nPhone: +63 XXX-XXX-XXXX",
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
<br /><br /><br />
      <div className="sticky-footer">
        <ClientFooter />
      </div>
    </div>
  );
}

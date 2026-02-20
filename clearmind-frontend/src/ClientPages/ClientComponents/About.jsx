import React from "react";
import { Container, Image } from "react-bootstrap";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo_login from "../../assets/CMPS_Logo.png";
import ClientHeader from "./ClientHeader";
import ClientFooter from "./ClientFooter";

export default function About() {
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
              <h4 className="help-title">About</h4>
            </div>

            {/* Logo Section */}
            <div
              className="faq-section"
              style={{ textAlign: "center", marginBottom: "0.5rem" }}
            >
              <Image
                src={logo_login}
                style={{
                  width: "330px",
                  height: "50px",
                  objectFit: "contain",
                
                }}
              />
            
              <p
                style={{
                  color: "#999",
                  fontSize: "0.85rem",
                  marginTop: "0.25rem",
                }}
              >
                Clarity of Mind, Journey to Wellness
              </p>
            </div>

            {/* Content Sections */}
            <div className="faq-section">
              {[
                {
                  title: "Our Mission",
                  text: "CMPS is dedicated to making mental health care accessible, affordable, and stigma-free for everyone. We believe that mental wellness is a fundamental right, and we're committed to providing professional support to help you on your journey to better mental health.",
                },
                {
                  title: "What We Offer",
                  text: "Our platform connects you with licensed mental health professionals who are here to support you through life's challenges. Whether you're dealing with anxiety, depression, relationship issues, or simply seeking personal growth, we're here to help.",
                },
                {
                  title: "Our Approach",
                  text: "We combine evidence-based therapeutic practices with modern technology to deliver convenient, confidential, and effective mental health care. Our approach is:\n• Professional and confidential\n• Accessible from anywhere\n• Personalized to your needs\n• Supported by licensed therapists",
                },
                {
                  title: "Our Team",
                  text: "Our network consists of carefully vetted, licensed mental health professionals including psychologists, therapists, and counselors. Each professional is committed to providing compassionate, effective care tailored to your unique needs.",
                },
                {
                  title: "Why Choose CMPS?",
                  text: "• Convenience: Access therapy from the comfort of your home\n• Privacy: Your information is secure and confidential\n• Flexibility: Schedule sessions that fit your lifestyle\n• Quality: Work with licensed, experienced professionals\n• Support: Get help when you need it most",
                },
                {
                  title: "Founded",
                  text: "Established in 2024",
                },
                {
                  title: "Contact Us",
                  text: "We'd love to hear from you. If you have any questions, feedback, or concerns:\n\nEmail: info@cmps.com\nSupport: support@cmps.com\nPhone: +63 XXX-XXX-XXXX",
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

             <br /><br />
             
            </div>
          </Container>
        </div>
      </div>

      <div className="sticky-footer">
        <ClientFooter />
      </div>
    </div>
  );
}

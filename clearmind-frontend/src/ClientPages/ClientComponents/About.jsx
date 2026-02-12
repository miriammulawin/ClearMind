import React from 'react';
import { Container, Image } from 'react-bootstrap';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo_login from "../../assets/CMPS_Logo.png";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="info-page-container">
      <Container className="info-container">
        {/* Header */}
        <div className="info-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <IoArrowBack size={24} />
          </button>
          <h4 className="info-title">About</h4>
        </div>

        {/* Content */}
        <div className="info-content">
          <div className="about-logo-section">
            <Image src={logo_login} className="about-logo" />
            <h3 className="about-app-name">CMPS</h3>
            <p className="about-tagline">Clarity of Mind, Journey to Wellness</p>
          </div>

          <div className="info-section">
            <h5 className="section-title">Our Mission</h5>
            <p className="section-text">
              CMPS is dedicated to making mental health care accessible, affordable, and stigma-free for everyone. 
              We believe that mental wellness is a fundamental right, and we're committed to providing professional 
              support to help you on your journey to better mental health.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">What We Offer</h5>
            <p className="section-text">
              Our platform connects you with licensed mental health professionals who are here to support you through 
              life's challenges. Whether you're dealing with anxiety, depression, relationship issues, or simply seeking 
              personal growth, we're here to help.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">Our Approach</h5>
            <p className="section-text">
              We combine evidence-based therapeutic practices with modern technology to deliver convenient, 
              confidential, and effective mental health care. Our approach is:
            </p>
            <ul className="section-list">
              <li>Professional and confidential</li>
              <li>Accessible from anywhere</li>
              <li>Personalized to your needs</li>
              <li>Supported by licensed therapists</li>
            </ul>
          </div>

          <div className="info-section">
            <h5 className="section-title">Our Team</h5>
            <p className="section-text">
              Our network consists of carefully vetted, licensed mental health professionals including psychologists, 
              therapists, and counselors. Each professional is committed to providing compassionate, effective care 
              tailored to your unique needs.
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">Why Choose CMPS?</h5>
            <ul className="section-list">
              <li><strong>Convenience:</strong> Access therapy from the comfort of your home</li>
              <li><strong>Privacy:</strong> Your information is secure and confidential</li>
              <li><strong>Flexibility:</strong> Schedule sessions that fit your lifestyle</li>
              <li><strong>Quality:</strong> Work with licensed, experienced professionals</li>
              <li><strong>Support:</strong> Get help when you need it most</li>
            </ul>
          </div>

          <div className="info-section">
            <h5 className="section-title">Founded</h5>
            <p className="section-text">
              Established in 2024
            </p>
          </div>

          <div className="info-section">
            <h5 className="section-title">Contact Us</h5>
            <p className="section-text">
              We'd love to hear from you. If you have any questions, feedback, or concerns:
            </p>
            <p className="section-text">
              Email: info@cmps.com<br />
              Support: support@cmps.com<br />
              Phone: +63 XXX-XXX-XXXX
            </p>
          </div>

          <div className="app-version">
            <p>Version 1.0.0</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
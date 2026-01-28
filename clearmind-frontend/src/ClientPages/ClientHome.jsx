import React from 'react';
import { Container, Row, Col, Card, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ClientHome.css';

const ClearMindPatientPortal = () => {
  return (
    <div className="clearmind-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 12C8 12 10 8 12 8C14 8 14 10 16 10C18 10 18 8 20 8C22 8 24 12 24 12" stroke="#5B2C91" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M8 20C8 20 10 24 12 24C14 24 14 22 16 22C18 22 18 24 20 24C22 24 24 20 24 20" stroke="#5B2C91" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="welcome-text">
              <h1 className="greeting">Hello, Juan!</h1>
              <p className="subtext">Welcome to ClearMind</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="icon-btn notification-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#5B2C91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#5B2C91" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="notification-badge"></span>
            </button>
            <button className="icon-btn info-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#5B2C91" strokeWidth="2"/>
                <line x1="12" y1="16" x2="12" y2="12" stroke="#5B2C91" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="8" r="1" fill="#5B2C91"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <Container fluid className="px-3">
          {/* Appointment Booking Card */}
          <Card className="appointment-card">
            <Card.Body>
              <h2 className="card-title">Book an Appointment<br/>with Our Specialists</h2>
              <div className="carousel-placeholder">
                {/* Carousel content would go here */}
              </div>
              <div className="carousel-dots">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </Card.Body>
          </Card>

          {/* Upcoming Schedule Section */}
          <div className="schedule-section">
            <h3 className="section-title">
              Upcoming schedule <span className="count">(0)</span>
            </h3>
            <Card className="schedule-card">
              <Card.Body className="empty-state">
                <p>You have no scheduled<br/>appointment this time.</p>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-item active">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22" fill="white"/>
          </svg>
          <span>Home</span>
        </button>
        
        <button className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" opacity="0.6"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="2"/>
            <path d="M9 14 L11 16 L15 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span>Appointments</span>
        </button>
        
        <button className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Messages</span>
        </button>
        
        <button className="nav-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>Account</span>
        </button>
      </nav>
    </div>
  );
};

export default ClearMindPatientPortal;

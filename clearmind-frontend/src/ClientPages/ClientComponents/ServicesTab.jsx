import React, { useState } from 'react';
import { Accordion, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../ClientStyle/ServicesTab.css";


const ClientAppointmentServices = () => {
  const [activeKey, setActiveKey] = useState('0');

  const services = [
    {
      id: '0',
      title: 'Psychotherapy and Counseling',
      description: 'The purpose of Psychotherapy and Counseling is to help individuals understand and manage their thoughts, emotions, and behaviors in a healthy way. It aims to promote emotional healing, personal growth, and improved coping skills for dealing with life\'s challenges and mental health concerns.'
    },
    {
      id: '1',
      title: 'Emotional Support Animal (ESA) Certification',
      description: 'ESA certification provides documentation for individuals who benefit from the companionship of an animal for emotional or psychological support. This service includes assessment and certification for those who qualify.'
    },
    {
      id: '2',
      title: 'Psychological Assessment and Evaluation',
      description: 'Comprehensive psychological testing and evaluation to assess cognitive functioning, personality traits, emotional well-being, and behavioral patterns to inform diagnosis and treatment planning.'
    },
    {
      id: '3',
      title: 'Academic Support (Internship and Research)',
      description: 'Guidance and supervision for students and professionals pursuing internships, research projects, and academic development in the field of psychology and mental health.'
    },
    {
      id: '4',
      title: 'Psychiatric Assessment',
      description: 'Professional psychiatric evaluation to diagnose mental health conditions, assess medication needs, and develop comprehensive treatment plans for mental health concerns.'
    },
    {
      id: '5',
      title: 'Mental Health Certification',
      description: 'Certification services for various mental health related documentation, assessments, and professional evaluations required for legal, employment, or personal purposes.'
    }
  ];

  return (
    <div className="appointment-services-container">
      {/* Scrollable Body */}
      <div className="scrollable-body">
        <h5 className="services-heading">
          What services would you be needing?
        </h5>

        <Accordion 
          activeKey={activeKey} 
          onSelect={(key) => setActiveKey(key)}
          flush
        >
          {services.map((service) => (
            <Accordion.Item 
              key={service.id} 
              eventKey={service.id}
              className="accordion-item-custom"
            >
              <Accordion.Header className="accordion-header-custom">
                <span className="accordion-title">
                  {service.title}
                </span>
              </Accordion.Header>
              <Accordion.Body className="accordion-body-custom">
                <p className="service-description">
                  {service.description}
                </p>
                <Button className="continue-button">
                  CONTINUE
                </Button>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-navigation">
        <div className="nav-item-bottom">
          <div className="nav-icon">🏠</div>
          <div className="nav-label">Home</div>
        </div>
        <div className="nav-item-bottom active">
          <div className="nav-icon">📅</div>
          <div className="nav-label active">Appointments</div>
        </div>
        <div className="nav-item-bottom">
          <div className="nav-icon">💬</div>
          <div className="nav-label">Messages</div>
        </div>
        <div className="nav-item-bottom">
          <div className="nav-icon">👤</div>
          <div className="nav-label">Account</div>
        </div>
      </div>
    </div>
  );
};

export default ClientAppointmentServices;

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
      description: 'The purpose of Psychotherapy and Counseling is to help individuals understand and manage their thoughts, emotions, and behaviors in a healthy way. It aims to promote emotional healing, personal growth, and improved coping skills for dealing with life’s challenges and mental health concerns.'
    },
    {
      id: '1',
      title: 'Emotional Support Animal (ESA) Certification',
      description: 'The purpose of ESA certification as prescribed by a mental health professional is for client with animals to provide emotional comfort, relieve anxiety, or help with psychiatric or mental health conditions, even if they are not trained to perform specific tasks.'
    },
    {
      id: '2',
      title: 'Psychological Assessment and Evaluation',
      description: 'The purpose of Psychological Assessment Test  is to gather and integrate data about a person’s mental, emotional, cognitive, behavioral, personality, and social functioning. Tools used include standardized tests, interviews, observations, and other measures.'
    },
    {
      id: '3',
      title: 'Academic Support (Internship and Research)',
      description: 'The purpose of Academic Support (Internship and Research) is to help students apply their academic knowledge in real-life settings and develop essential professional and research skills. Through internships, students gain practical experience, workplace readiness, and career exposure. Through research, they strengthen their critical thinking, problem-solving, and evidence-based decision-making abilities. Together, these support activities enhance learning, academic growth, and preparation for future professional practice.'
    },
    {
      id: '4',
      title: 'Psychiatric Assessment',
      description: 'The purpose of a Psychiatrist Appointment is to provide professional evaluation, diagnosis, and treatment for mental health conditions. During the session, the psychiatrist assesses symptoms, prescribes or adjusts medications if needed, and offers guidance to support the patient’s overall mental well-being and recovery.'
    },
    {
      id: '5',
      title: 'Mental Health Certification',
      description: 'CThe purpose of a Mental Health Certification is to provide an official document issued by a licensed mental health professional confirming an individual’s mental health status. It is often used for employment, academic, legal, or medical purposes to verify psychological fitness, treatment progress, or readiness for certain activities.'
    }
  ];

  return (
    <div className="appointment-services-container">
      <h5 className="services-heading">
          What services would you be needing?
      </h5>
      {/* Scrollable Body */}
      <div className="scrollable-body">
        <Accordion 
          activeKey={activeKey} 
          onSelect={(key) => setActiveKey(key)}
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
    </div>
  );
};

export default ClientAppointmentServices;

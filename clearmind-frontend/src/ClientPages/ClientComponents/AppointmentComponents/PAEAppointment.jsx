// PAEAppointment.jsx
// Sub-services page for Psychological Assessment and Evaluation

import React from 'react';
import { Accordion, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../../ClientStyle/PAEAppointment.module.css';

/* -----------------------------------------------------------------
   Services Data
------------------------------------------------------------------ */
const PAE_SERVICES = [
  {
    id: '0',
    title: 'VAWC Purpose',
    description:
      'The purpose of psychological assessment for VAWC (Violence Against Women and Children) cases is to evaluate the emotional and psychological impact of abuse on the client. The results may support legal proceedings, provide documentation of trauma, and guide appropriate psychological care or intervention.',
    available: false,
  },
  {
    id: '1',
    title: 'Adoption or Other Legal Purposes',
    description:
      "The purpose of psychological assessment for adoption or legal matters is to evaluate an individual's psychological readiness, emotional stability, and overall mental well-being as required by legal processes or court-related documentation.",
    available: false,
  },
  {
    id: '2',
    title: 'Psychological Assessment and Evaluation',
    description:
      "The purpose of psychological assessment and evaluation is to better understand a person's thoughts, emotions, behavior, and cognitive functioning. It helps professionals identify concerns, provide accurate diagnoses, and recommend appropriate support or treatment.",
    available: false,
  },
  {
    id: '3',
    title: 'School / Academic Support',
    description:
      'The purpose of psychological assessment for school or academic support is to identify learning difficulties, behavioral concerns, or developmental needs in order to provide appropriate educational guidance, accommodations, or interventions.',
    available: false,
  },
  {
    id: '4',
    title: 'Work-related Purpose',
    description:
      "The purpose of psychological assessment for work-related concerns is to evaluate an individual's mental and emotional well-being in relation to workplace challenges, stress, or performance in order to recommend appropriate support or interventions.",
    available: false,
  },
  {
    id: '5',
    title: 'Pre-Employment Purpose',
    description:
      "The purpose of psychological assessment for pre-employment is to evaluate a candidate's personality traits, cognitive abilities, and psychological readiness to determine suitability for a specific job role or work environment.",
    available: false,
  },
  {
    id: '6',
    title: 'Emotional Support Animal (ESA) Certification',
    description:
      'The purpose of ESA certification as prescribed by a mental health professional is for clients with animals to provide emotional comfort, relieve anxiety, or help with psychiatric or mental health conditions, even if they are not trained to perform specific tasks.',
    available: false,
  },
  {
    id: '7',
    title: 'Mental Health Certification',
    description:
      "The purpose of mental health certification is to provide professional documentation from a licensed mental health professional regarding an individual's psychological condition, which may be required for medical, workplace, educational, or legal purposes.",
    available: false,
  },
];

/* -----------------------------------------------------------------
   Component
------------------------------------------------------------------ */
const PAEAppointment = () => {
  const navigate = useNavigate();

  const handleContinue = (service) => {
    if (service.available) {
      navigate('/client/appointment/set-appointment', {
        state: { selectedService: service.title },
      });
    } else {
      alert(
        `${service.title} booking will be available soon. This feature is currently under development.`
      );
    }
  };

  return (
    <div className={styles.container}>

      {/* Top row: heading + back button */}
      <div className={styles.topRow}>
        <h5 className={styles.heading}>
          What is the purpose of your assessment?
        </h5>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Services
        </button>
      </div>

      {/* Scrollable Body */}
      <div className={styles.scrollableBody}>
        <Accordion>
          {PAE_SERVICES.map((service) => (
            <Accordion.Item
              key={service.id}
              eventKey={service.id}
              className={styles.accordionItem}
            >
              <Accordion.Header>
                <span className={styles.accordionTitle}>
                  {service.title}
                </span>
              </Accordion.Header>

              <Accordion.Body className={styles.accordionBody}>
                <p className={styles.description}>{service.description}</p>
                <Button
                  className={styles.continueBtn}
                  onClick={() => handleContinue(service)}
                >
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

export default PAEAppointment;
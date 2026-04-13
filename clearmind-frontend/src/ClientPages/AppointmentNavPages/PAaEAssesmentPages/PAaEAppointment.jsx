// PAaEAppointment.jsx
// Navigates to child: psychological-assessment/set-appointment-form

import React from "react";
import { Accordion, Button } from "react-bootstrap";
import { useNavigate, useLocation, Outlet, useMatch } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import ServiceAlert from "../AppointmentComponents/ServiceAlert";
import styles from "./style/PAaEAppointment.module.css";

/* -----------------------------------------------------------------
   Services Data
------------------------------------------------------------------ */
const PAE_SERVICES = [
  {
    id: "0",
    title: "VAWC Purpose",
    description:
      "The purpose of psychological assessment for VAWC (Violence Against Women and Children) cases is to evaluate the emotional and psychological impact of abuse on the client. The results may support legal proceedings, provide documentation of trauma, and guide appropriate psychological care or intervention.",
    available: true,
  },
  {
    id: "1",
    title: "Adoption or Other Legal Purposes",
    description:
      "The purpose of psychological assessment for adoption or legal matters is to evaluate an individual's psychological readiness, emotional stability, and overall mental well-being as required by legal processes or court-related documentation.",
    available: true,
  },
  {
    id: "2",
    title: "School / Academic Support",
    description:
      "The purpose of psychological assessment for school or academic support is to identify learning difficulties, behavioral concerns, or developmental needs in order to provide appropriate educational guidance, accommodations, or interventions.",
    available: true,
  },
  {
    id: "3",
    title: "Work-related Purpose",
    description:
      "The purpose of psychological assessment for work-related concerns is to evaluate an individual's mental and emotional well-being in relation to workplace challenges, stress, or performance in order to recommend appropriate support or interventions.",
    available: true,
  },
  {
    id: "4",
    title: "Pre-Employment Purpose",
    description:
      "The purpose of psychological assessment for pre-employment is to evaluate a candidate's personality traits, cognitive abilities, and psychological readiness to determine suitability for a specific job role or work environment.",
    available: true,
  },
  {
    id: "5",
    title: "Emotional Support Animal (ESA) Certification",
    description:
      "The purpose of ESA certification as prescribed by a mental health professional is for clients with animals to provide emotional comfort, relieve anxiety, or help with psychiatric or mental health conditions, even if they are not trained to perform specific tasks.",
    available: true,
  },
  {
    id: "6",
    title: "Mental Health Certification for Internship",
    description:
      "A Mental Health Certification for Internship is an official document issued by a licensed professional confirming that an individual is mentally fit and ready to participate in an internship, ensuring they can handle responsibilities and adapt to the work environment.",
    available: true,
  },
];

/* -----------------------------------------------------------------
   Component
------------------------------------------------------------------ */
const PAaEAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedService = location.state?.selectedService;

  // Detect when the child route (set-appointment-form) is active
  const isOnForm = useMatch(
    "client/appointment/psychological-assessment/set-appointment-form",
  );

  const handleContinue = (service) => {
    if (service.available) {
      navigate("set-appointment-form", {
        state: { selectedService: service.title },
      });
    } else {
      alert(
        `${service.title} booking will be available soon. This feature is currently under development.`,
      );
    }
  };

  return (
    <div className={styles.container}>
      {/* Child route renders here (PAaEAppointmentForm) */}
      <Outlet />

      {/* Hide accordion when form is active */}
      {!isOnForm && (
        <>
          <div className={styles.topRow}>
            <h5 className={styles.heading}>
              What is the purpose of your assessment?
            </h5>
            <button
              className={styles.backBtn}
              onClick={() => navigate("/client/appointment/services")}
            >
              <FaArrowLeft /> Back to Services
            </button>
          </div>

          <ServiceAlert selectedService={selectedService} />

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
        </>
      )}
    </div>
  );
};

export default PAaEAppointment;

import React from "react";
import { Accordion, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles/ServicesTab.module.css";
import { IHelpTrigger } from "./iHelp";

const ServicesTab = () => {
  const navigate = useNavigate();

  const handleContinue = (serviceTitle) => {
    if (serviceTitle === "Psychotherapy and Counseling") {
      navigate("/client/appointment/psychotherapy-and-counseling", {
        state: { selectedService: serviceTitle },
      });
    } else if (serviceTitle === "Psychological Assessment and Evaluation") {
      navigate("/client/appointment/psychological-assessment", {
        state: { selectedService: serviceTitle },
      });
    } else {
      alert(
        `${serviceTitle} booking will be available soon. This feature is currently under development.`,
      );
    }
  };

  const services = [
    {
      id: "0",
      title: "Psychotherapy and Counseling",
      description:
        "The purpose of Psychotherapy and Counseling is to help individuals understand and manage their thoughts, emotions, and behaviors in a healthy way. It aims to promote emotional healing, personal growth, and improved coping skills for dealing with life's challenges and mental health concerns.",
    },
    {
      id: "1",
      title: "Psychological Assessment and Evaluation",
      description:
        "The purpose of Psychological Assessment Test is to gather and integrate data about a person's mental, emotional, cognitive, behavioral, personality, and social functioning. Tools used include standardized tests, interviews, observations, and other measures.",
    },
  ];

  return (
    <div className={styles.appointmentServicesContainer}>
      <h5 className={styles.servicesHeading}>
        What services would you be needing?
      </h5>

      <IHelpTrigger onSelectService={(title) => handleContinue(title)} />

      <Accordion>
        {services.map((service) => (
          <Accordion.Item
            key={service.id}
            eventKey={service.id}
            className={styles.accordionItemCustom}
          >
            <Accordion.Header className={styles.accordionHeaderCustom}>
              <span className={styles.accordionTitle}>{service.title}</span>
            </Accordion.Header>
            <Accordion.Body className={styles.accordionBodyCustom}>
              <p className={styles.serviceDescription}>{service.description}</p>
              <Button
                className={styles.continueButton}
                onClick={() => handleContinue(service.title)}
              >
                CONTINUE
              </Button>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

export default ServicesTab;

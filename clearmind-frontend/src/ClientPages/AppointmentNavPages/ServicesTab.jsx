import React, { useState, useEffect } from "react";
import { Accordion, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles/ServicesTab.module.css";
import { IHelpTrigger } from "./iHelp";
import axiosClient from "../../axiosClient";

const ServicesTab = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get("/admin/services")
      .then(({ data }) => {
        const available = (data.data || []).filter(
          (s) => s.is_available === true || s.is_available === 1,
        );
        setServices(available);
      })
      .catch((e) => console.error("Fetch Services Error:", e))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num)
      ? null
      : `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
  };

  const handleContinue = (serviceTitle) => {
    const t = serviceTitle.toLowerCase();

    if (t.includes("intake consultation")) {
      navigate("/client/appointment/intake-consultation", {
        state: { selectedService: serviceTitle },
      });
    } else if (t.includes("psychotherapy")) {
      navigate("/client/appointment/psychotherapy-and-counseling", {
        state: { selectedService: serviceTitle },
      });
    } else if (t.includes("psychological assessment")) {
      navigate("/client/appointment/psychological-assessment", {
        state: { selectedService: serviceTitle },
      });
    } else if (t.includes("psychiatric evaluation")) {
      navigate("/client/appointment/psychiatric-evaluation", {
        state: { selectedService: serviceTitle },
      });
    } else {
      alert(
        `${serviceTitle} booking will be available soon. This feature is currently under development.`,
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.appointmentServicesContainer}>
        <p style={{ color: "#888", textAlign: "center" }}>Loading services…</p>
      </div>
    );
  }

  return (
    <div className={styles.appointmentServicesContainer}>
      <h5 className={styles.servicesHeading}>
        What services would you be needing?
      </h5>
      <div className={styles.accordionScroll}>
        <IHelpTrigger onSelectService={(title) => handleContinue(title)} />

        <Accordion>
          {services.map((service) => {
            const isPsych = service.service_name
              .toLowerCase()
              .includes("psychological assessment");
            const activePurposes = (service.purposes || []).filter(
              (p) => p.is_active === true || p.is_active === 1,
            );

            return (
              <Accordion.Item
                key={service.service_id}
                eventKey={String(service.service_id)}
                className={styles.accordionItemCustom}
              >
                <Accordion.Header className={styles.accordionHeaderCustom}>
                  <span className={styles.accordionTitle}>
                    {service.service_name}
                  </span>
                </Accordion.Header>
                <Accordion.Body className={styles.accordionBodyCustom}>
                  <p className={styles.serviceDescription}>
                    {service.description}
                  </p>

                  {/* Consultation fee */}
                  {formatPrice(service.price) && (
                    <div className={styles.servicePriceRow}>
                      <span className={styles.priceLabel}>
                        Consultation Fee:
                      </span>
                      <span className={styles.priceValue}>
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  )}

                  {/* Purposes — only for Psychological Assessment */}
                  {isPsych && activePurposes.length > 0 && (
                    <div className={styles.purposeList}>
                      <p className={styles.purposeListLabel}>
                        Assessment Purposes &amp; Fees:
                      </p>
                      {activePurposes.map((p) => (
                        <div key={p.purpose_id} className={styles.purposeRow}>
                          <span className={styles.purposeName}>
                            {p.purpose_name}
                          </span>
                          <span className={styles.purposePrice}>
                            {formatPrice(p.price) || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    className={styles.continueButton}
                    onClick={() => handleContinue(service.service_name)}
                  >
                    CONTINUE
                  </Button>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default ServicesTab;

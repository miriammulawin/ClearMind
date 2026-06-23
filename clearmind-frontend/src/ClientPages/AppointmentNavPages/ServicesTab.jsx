import React, { useState, useEffect } from "react";
import { Accordion, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles/ServicesTab.module.css";
import { IHelpTrigger } from "./iHelp";
import axiosClient from "../../axiosClient";

// ── Profession config ─────────────────────────────────────────────────────────
const PROFESSION_CONFIG = {
  Psychometrician: { color: "#2e7d8c", bg: "#e8f4f8", icon: "🧪" },
  Psychologist: { color: "#5c6bc0", bg: "#eeeffa", icon: "🧠" },
  Psychiatrist: { color: "#6a4c93", bg: "#f3eefb", icon: "💊" },
};

const PROFESSIONS = Object.keys(PROFESSION_CONFIG);

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (price) => {
  const num = parseFloat(price);
  return isNaN(num)
    ? null
    : `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
};

const resolveRoute = (serviceTitle) => {
  const t = serviceTitle.toLowerCase();

  if (t.includes("psychotherapy"))
    return "/client/appointment/psychotherapy-and-counseling";

  if (t.includes("mental health certification"))
    return "/client/appointment/psychological-assessment";

  // Psychological Assessment and Psychiatric Evaluation now fall through
  // to null, which triggers the "coming soon" alert in handleContinue / onSelectService.

  return null;
};

// ── Sub-components ────────────────────────────────────────────────────────────
const HandledByBadges = ({ professions }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      marginBottom: "10px",
    }}
  >
    {professions.map((prof) => {
      const cfg = PROFESSION_CONFIG[prof] || {};
      return (
        <span
          key={prof}
          style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "20px",
            color: cfg.color || "#555",
            background: cfg.bg || "#f0f0f0",
            border: `1px solid ${cfg.color || "#ccc"}`,
          }}
        >
          {cfg.icon} {prof}
        </span>
      );
    })}
  </div>
);

const PurposeList = ({ purposes }) => {
  const active = purposes.filter(
    (p) => p.is_active === true || p.is_active === 1,
  );
  if (!active.length) return null;
  return (
    <div className={styles.purposeList}>
      <p className={styles.purposeListLabel}>Assessment Purposes &amp; Fees:</p>
      {active.map((p) => (
        <div key={p.purpose_id} className={styles.purposeRow}>
          <span className={styles.purposeName}>{p.purpose_name}</span>
          <span className={styles.purposePrice}>
            {formatPrice(p.price) || "—"}
          </span>
        </div>
      ))}
    </div>
  );
};

const ServiceCard = ({ service, profession, navigate }) => {
  const handledBy = service.handled_by || [];
  const isPsych = service.service_name
    .toLowerCase()
    .includes("psychological assessment");
  const price = formatPrice(service.price);
  const route = resolveRoute(service.service_name);

  const handleContinue = () => {
    if (route) {
      navigate(route, { state: { selectedService: service.service_name } });
    } else {
      alert(
        `${service.service_name} booking will be available soon. This feature is currently under development.`,
      );
    }
  };

  return (
    <Accordion.Item
      eventKey={`${profession}-${service.service_id}`}
      className={styles.accordionItemCustom}
    >
      <Accordion.Header className={styles.accordionHeaderCustom}>
        <span className={styles.accordionTitle}>{service.service_name}</span>
      </Accordion.Header>
      <Accordion.Body className={styles.accordionBodyCustom}>
        {handledBy.length > 0 && <HandledByBadges professions={handledBy} />}

        <p className={styles.serviceDescription}>{service.description}</p>

        {price && (
          <div className={styles.servicePriceRow}>
            <span className={styles.priceLabel}>Consultation Fee:</span>
            <span className={styles.priceValue}>{price}</span>
          </div>
        )}

        {isPsych && <PurposeList purposes={service.purposes || []} />}

        <Button className={styles.continueButton} onClick={handleContinue}>
          CONTINUE
        </Button>
      </Accordion.Body>
    </Accordion.Item>
  );
};

const ProfessionSection = ({ profession, services, navigate }) => {
  const cfg = PROFESSION_CONFIG[profession];
  if (!services.length) return null;

  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 14px",
          borderRadius: "8px",
          background: cfg.bg,
          borderLeft: `4px solid ${cfg.color}`,
          marginBottom: "10px",
        }}
      >
        <span style={{ fontSize: "18px" }}>{cfg.icon}</span>
        <span style={{ fontWeight: 700, fontSize: "14px", color: cfg.color }}>
          {profession}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            color: cfg.color,
            opacity: 0.8,
          }}
        >
          {services.length} service{services.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Accordion>
        {services.map((service) => (
          <ServiceCard
            key={`${profession}-${service.service_id}`}
            service={service}
            profession={profession}
            navigate={navigate}
          />
        ))}
      </Accordion>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ServicesTab = () => {
  const navigate = useNavigate();
  const [groupedServices, setGroupedServices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch once per profession using /admin/services?profession=
    Promise.all(
      PROFESSIONS.map((profession) =>
        axiosClient
          .get("/admin/services", { params: { profession } })
          .then(({ data }) => ({
            profession,
            services: (data.data || []).filter(
              (s) => s.is_available === true || s.is_available === 1,
            ),
          })),
      ),
    )
      .then((results) => {
        const grouped = {};
        results.forEach(({ profession, services }) => {
          grouped[profession] = services;
        });
        setGroupedServices(grouped);
      })
      .catch((e) => console.error("Fetch Services Error:", e))
      .finally(() => setLoading(false));
  }, []);

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
        <IHelpTrigger
          onSelectService={(title) => {
            const route = resolveRoute(title);
            if (route) navigate(route, { state: { selectedService: title } });
            else alert(`${title} booking will be available soon.`);
          }}
        />

        {PROFESSIONS.map((profession) => (
          <ProfessionSection
            key={profession}
            profession={profession}
            services={groupedServices[profession] || []}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
};

export default ServicesTab;

import { useState } from "react";
import styles from "../ClientStyle/ProfessionalsSection.module.css";
import { FaBrain, FaPills, FaClipboardList } from "react-icons/fa";

const professionals = [
  {
    key: "psychologist",
    gradient: "linear-gradient(145deg, #3b1f6e 0%, #6d3bbf 100%)",
    accentLight: "#c9aeef",
    accentBg: "rgba(180,140,255,0.13)",
    badge: "Talk Therapy & Assessment",
    icon: <FaBrain />,
    title: "Psychologist",
    subtitle: "Mental & Emotional Wellness",
    description:
      "Specializes in diagnosing and treating emotional, behavioral, and mental health conditions through evidence-based psychotherapy and psychological testing.",
    tags: ["Therapy Sessions", "Behavioral Health", "Psychological Testing"],
  },
  {
    key: "psychiatrist",
    gradient: "linear-gradient(145deg, #0d3d6b 0%, #1976d2 100%)",
    accentLight: "#90caf9",
    accentBg: "rgba(100,180,255,0.13)",
    badge: "Medical & Medication Management",
    icon: <FaPills />,
    title: "Psychiatrist",
    subtitle: "Medical Mental Health Care",
    description:
      "A licensed medical doctor who evaluates, diagnoses, and treats complex mental health disorders — including prescribing and managing medications when needed.",
    tags: ["Medication Management", "Diagnosis", "Psychiatric Evaluation"],
  },
  {
    key: "psychometrician",
    gradient: "linear-gradient(145deg, #1b4a2e 0%, #2e7d52 100%)",
    accentLight: "#a5d6a7",
    accentBg: "rgba(120,210,140,0.13)",
    badge: "Testing & Assessment",
    icon: <FaClipboardList />,
    title: "Psychometrician",
    subtitle: "Psychological Measurement",
    description:
      "Administers and interprets standardized psychological tests to assess cognitive abilities, personality, and mental functioning for evaluation and planning.",
    tags: ["IQ Testing", "Personality Assessment", "Learning Evaluation"],
  },
];

function ProfCard({ pro }) {
  return (
    <div
      className={styles.card}
      style={{ background: pro.gradient }}
    >
      <div className={styles.circleTopRight} />
      <div className={styles.circleBottomLeft} />

      {/* Top row: icon + badge */}
      <div className={styles.cardTopRow}>
        <div
          className={styles.cardIcon}
          style={{ background: pro.accentBg, color: pro.accentLight }}
        >
          {pro.icon}
        </div>
        <span className={styles.cardBadge} style={{ color: pro.accentLight }}>
          {pro.badge}
        </span>
      </div>

      {/* Title block */}
      <div>
        <h3 className={styles.cardTitle}>{pro.title}</h3>
        <p className={styles.cardSubtitle} style={{ color: pro.accentLight }}>
          {pro.subtitle}
        </p>
      </div>

      {/* Description */}
      <p className={styles.cardDescription}>{pro.description}</p>

      {/* Tags */}
      <div className={styles.tags}>
        {pro.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      {/* Know More button */}
      <button
        className={styles.knowMoreBtn}
        style={{ borderColor: pro.accentLight, color: pro.accentLight }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = pro.accentLight;
          e.currentTarget.style.color = "#1a1a2e";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.12)";
          e.currentTarget.style.color = pro.accentLight;
        }}
      >
        Know More →
      </button>
    </div>
  );
}

export default function ProfessionalsSection() {
  return (
    <section className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerPill}>Our Professionals</span>
        <h2 className={styles.headerTitle}>
          Finding the Right <br />
          <span className={styles.headerGradient}>
            Mental Health Professional
          </span>
        </h2>
        <p className={styles.headerTagline}>
          Understanding your options for a clearer mind and better well-being.
        </p>
      </div>

      {/* Cards */}
      <div className={styles.grid}>
        {professionals.map((pro) => (
          <ProfCard key={pro.key} pro={pro} />
        ))}
      </div>
    </section>
  );
}
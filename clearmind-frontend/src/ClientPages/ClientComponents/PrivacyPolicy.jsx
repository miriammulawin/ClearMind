import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import styles from "../ClientStyle/PrivacyPolicy.module.css";

const SECTIONS = [
  {
    num: 1,
    title: "Information We Collect",
    content: (
      <>
        <p>
          We collect information that you provide directly to us, including:
        </p>
        <ul>
          <li>
            Personal identification information (name, email, phone number)
          </li>
          <li>Health information related to your mental health care</li>
          <li>Payment and billing information</li>
          <li>Communication records between you and your therapist</li>
        </ul>
      </>
    ),
  },
  {
    num: 2,
    title: "How We Use Your Information",
    content: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Schedule and manage your appointments</li>
          <li>Process payments and billing</li>
          <li>Communicate with you about your care</li>
          <li>Ensure the safety and security of our platform</li>
          <li>Comply with legal obligations</li>
        </ul>
      </>
    ),
  },
  {
    num: 3,
    title: "Information Sharing and Disclosure",
    content: (
      <>
        <p>
          We do not sell or rent your personal information. We may share your
          information only in the following circumstances:
        </p>
        <ul>
          <li>With your mental health care provider for treatment purposes</li>
          <li>With your explicit consent</li>
          <li>To comply with legal obligations</li>
          <li>In case of emergency to protect your safety or others</li>
        </ul>
      </>
    ),
  },
  {
    num: 4,
    title: "Data Security",
    content: (
      <>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal information against unauthorized access,
          alteration, disclosure, or destruction.
        </p>
        <div className={styles.noteBox}>
          All data is encrypted both in transit and at rest.
        </div>
      </>
    ),
  },
  {
    num: 5,
    title: "Your Rights and Choices",
    content: (
      <>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Object to processing of your information</li>
          <li>Export your data in a portable format</li>
        </ul>
      </>
    ),
  },
  {
    num: 6,
    title: "HIPAA Compliance",
    content: (
      <p>
        We comply with the Health Insurance Portability and Accountability Act
        (HIPAA) and maintain strict confidentiality of your protected health
        information (PHI).
      </p>
    ),
  },
  {
    num: 7,
    title: "Cookies and Tracking",
    content: (
      <p>
        We use cookies and similar tracking technologies to improve your
        experience, analyze usage patterns, and enhance our services. You can
        control cookie settings through your browser.
      </p>
    ),
  },
  {
    num: 8,
    title: "Children's Privacy",
    content: (
      <p>
        Our services are not intended for children under 13 years of age. We do
        not knowingly collect personal information from children under 13.
      </p>
    ),
  },
  {
    num: 9,
    title: "Changes to Privacy Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. We will notify you
        of any material changes by posting the new policy on this page and
        updating the "Last Updated" date.
      </p>
    ),
  },
  {
    num: 10,
    title: "Contact Us",
    content: (
      <>
        <p>
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <ul>
          <li>Email: privacy@cmps.com</li>
          <li>Phone: +63 XXX-XXX-XXXX</li>
        </ul>
      </>
    ),
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <div className={styles.hero}>
        <div className={styles.heroTitleRow}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <IoArrowBack size={22} />
          </button>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
        </div>
        <p className={styles.heroSub}>Last Updated: February 6, 2026</p>
      </div>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <div key={section.num} className={styles.sectionCard}>
          <div className={styles.sectionNum}>{section.num}</div>
          <p className={styles.sectionTitle}>{section.title}</p>
          <div className={styles.sectionBody}>{section.content}</div>
        </div>
      ))}
    </div>
  );
}

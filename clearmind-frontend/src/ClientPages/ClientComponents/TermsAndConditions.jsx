import React from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import styles from "../ClientStyle/TermsAndConditions.module.css";

const SECTIONS = [
  {
    num: 1,
    title: "Acceptance of Terms",
    content: (
      <p>
        By accessing and using the CMPS (Clarity of Mind, Journey to Wellness)
        mobile application, you accept and agree to be bound by the terms and
        provision of this agreement. If you do not agree to these terms, please
        do not use our services.
      </p>
    ),
  },
  {
    num: 2,
    title: "Use of Services",
    content: (
      <p>
        Our mental health services are designed to provide support and
        counseling. You agree to use the services for lawful purposes only and
        in a way that does not infringe upon the rights of others or restrict
        their use of the services.
      </p>
    ),
  },
  {
    num: 3,
    title: "User Accounts",
    content: (
      <p>
        You are responsible for maintaining the confidentiality of your account
        credentials and for all activities that occur under your account. You
        must notify us immediately of any unauthorized use of your account.
      </p>
    ),
  },
  {
    num: 4,
    title: "Appointments and Cancellations",
    content: (
      <>
        <p>
          Appointments must be cancelled at least{" "}
          <strong>24 hours in advance</strong>. Failure to do so may result in
          cancellation fees.
        </p>
        <div className={styles.noteBox}>
          We reserve the right to reschedule or cancel appointments due to
          unforeseen circumstances.
        </div>
      </>
    ),
  },
  {
    num: 5,
    title: "Payment Terms",
    content: (
      <p>
        All fees must be paid in accordance with our pricing and payment terms.
        We accept various payment methods as specified in the app. Refunds are
        subject to our refund policy.
      </p>
    ),
  },
  {
    num: 6,
    title: "Professional Services",
    content: (
      <>
        <p>
          Our services are provided by licensed mental health professionals.
          However, our services are not a substitute for emergency care.
        </p>
        <div className={styles.noteBox}>
          If you are experiencing a mental health emergency, please contact
          emergency services immediately.
        </div>
      </>
    ),
  },
  {
    num: 7,
    title: "Intellectual Property",
    content: (
      <p>
        All content, features, and functionality of the CMPS app are owned by us
        and are protected by international copyright, trademark, and other
        intellectual property laws.
      </p>
    ),
  },
  {
    num: 8,
    title: "Limitation of Liability",
    content: (
      <p>
        We shall not be liable for any indirect, incidental, special,
        consequential, or punitive damages resulting from your use of or
        inability to use the services.
      </p>
    ),
  },
  {
    num: 9,
    title: "Changes to Terms",
    content: (
      <p>
        We reserve the right to modify these terms at any time. We will notify
        users of any significant changes. Your continued use of the services
        after changes constitutes acceptance of the new terms.
      </p>
    ),
  },
  {
    num: 10,
    title: "Contact Information",
    content: (
      <>
        <p>
          If you have any questions about these Terms and Conditions, please
          contact us at:
        </p>
        <ul>
          <li>Email: clearmind.psychservices@gmail.com</li>
          <li>Phone: +63 992-916-4078</li>
        </ul>
      </>
    ),
  },
];

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <div className={styles.hero}>
        <div className={styles.heroTitleRow}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <IoArrowBack size={22} />
          </button>
          <h1 className={styles.heroTitle}>Terms and Conditions</h1>
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

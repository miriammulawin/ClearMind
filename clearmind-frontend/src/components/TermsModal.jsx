import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import styles from "../components/componentsStyling/TermsModal.module.css";

const SECTIONS = [
  {
    num: "01",
    title: "Acceptance of Terms",
    content: (
      <>
        <p>
          By registering for an account with{" "}
          <span className={styles.highlight}>
            ClearMind Psychological Services
          </span>
          , you confirm that you have read, understood, and agree to be bound by
          these Terms and Conditions, as well as our Privacy Policy. If you do
          not agree to any part of these terms, you must not proceed with
          registration or use our services.
        </p>
        <p>
          These terms constitute a legally binding agreement between you
          ("User") and ClearMind Psychological Services ("ClearMind," "we,"
          "our," or "us"), operating in the Philippines in accordance with
          applicable laws and regulations.
        </p>
      </>
    ),
  },
  {
    num: "02",
    title: "Eligibility",
    content: (
      <>
        <p>To use our services, you must:</p>
        <ul>
          <li>
            Be at least{" "}
            <span className={styles.highlight}>18 years of age</span>, or a
            minor with the express written consent of a parent or legal
            guardian.
          </li>
          <li>
            Provide accurate, complete, and current personal information during
            registration.
          </li>
          <li>
            Not have been previously removed from or restricted by ClearMind for
            violations of these terms.
          </li>
          <li>
            Agree to use the platform solely for lawful, personal mental
            wellness purposes.
          </li>
        </ul>
      </>
    ),
  },
  {
    num: "03",
    title: "Confidentiality & Privacy",
    content: (
      <>
        <p>
          ClearMind is committed to protecting your privacy. All personal and
          health-related information you provide is handled in strict
          confidence, consistent with the{" "}
          <span className={styles.highlight}>
            Data Privacy Act of 2012 (R.A. 10173)
          </span>{" "}
          of the Philippines.
        </p>
        <p>
          Your information will never be sold, shared, or disclosed to third
          parties without your explicit consent, except where required by law or
          in cases of imminent risk to safety. All sessions, records, and
          communications are stored securely and accessed only by authorized
          personnel.
        </p>
      </>
    ),
  },
  {
    num: "04",
    title: "Nature of Services",
    content: (
      <>
        <p>
          ClearMind provides access to licensed psychological professionals
          offering counseling, psychotherapy, and mental wellness support. Our
          platform facilitates appointment scheduling, session management, and
          secure communication between clients and practitioners.
        </p>
        <p>
          <strong>Important:</strong> ClearMind services are{" "}
          <span className={styles.highlight}>
            not a substitute for emergency care
          </span>
          . If you are experiencing a mental health crisis or are in immediate
          danger, please contact emergency services (911) or the National Crisis
          Hotline immediately.
        </p>
      </>
    ),
  },
  {
    num: "05",
    title: "Account Responsibilities",
    content: (
      <>
        <p>You are solely responsible for:</p>
        <ul>
          <li>
            Maintaining the confidentiality of your login credentials and
            password.
          </li>
          <li>All activity that occurs under your account.</li>
          <li>
            Notifying ClearMind immediately of any unauthorized access or
            security breach.
          </li>
          <li>
            Ensuring the accuracy of your profile information and keeping it up
            to date.
          </li>
        </ul>
        <p>
          ClearMind will not be liable for any loss or damage arising from your
          failure to comply with these responsibilities.
        </p>
      </>
    ),
  },
  {
    num: "06",
    title: "Appointment & Cancellation Policy",
    content: (
      <>
        <p>
          Appointments must be cancelled or rescheduled at least{" "}
          <span className={styles.highlight}>24 hours in advance</span>. Late
          cancellations or no-shows may result in a cancellation fee as
          determined by your assigned practitioner. Repeated no-shows may result
          in temporary suspension of booking privileges.
        </p>
        <p>
          ClearMind reserves the right to reschedule or cancel appointments due
          to unforeseen circumstances, in which case users will be notified
          promptly.
        </p>
      </>
    ),
  },
  {
    num: "07",
    title: "Prohibited Conduct",
    content: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Provide false or misleading personal information.</li>
          <li>
            Harass, threaten, or harm any practitioner, staff member, or other
            user.
          </li>
          <li>
            Attempt to gain unauthorized access to other accounts or system
            data.
          </li>
          <li>
            Use the platform for any commercial, advertising, or non-personal
            purpose.
          </li>
          <li>
            Record sessions without the explicit consent of your practitioner.
          </li>
          <li>
            Violate any applicable local, national, or international law or
            regulation.
          </li>
        </ul>
      </>
    ),
  },
  {
    num: "08",
    title: "Termination",
    content: (
      <>
        <p>
          ClearMind reserves the right to suspend or terminate your account at
          any time, with or without notice, if you are found to be in violation
          of these Terms and Conditions or if your conduct is deemed harmful to
          practitioners, other clients, or the integrity of our services.
        </p>
        <p>
          You may also request account deletion at any time by contacting our
          support team at{" "}
          <span className={styles.highlight}>support@clearmindph.com</span>.
        </p>
      </>
    ),
  },
  {
    num: "09",
    title: "Amendments",
    content: (
      <>
        <p>
          ClearMind reserves the right to update or amend these Terms and
          Conditions at any time. Any changes will be posted within the platform
          and take effect immediately upon publication. Your continued use of
          the platform following any amendment constitutes acceptance of the
          revised terms.
        </p>
      </>
    ),
  },
  {
    num: "10",
    title: "Governing Law",
    content: (
      <>
        <p>
          These Terms and Conditions shall be governed by and construed in
          accordance with the laws of the{" "}
          <span className={styles.highlight}>Republic of the Philippines</span>.
          Any disputes arising from these terms shall be subject to the
          exclusive jurisdiction of the courts of the Philippines.
        </p>
        <p>
          For questions or concerns regarding these terms, please reach out to
          us at <span className={styles.highlight}>legal@clearmindph.com</span>.
        </p>
      </>
    ),
  },
];

function TermsModal({ isOpen, onClose, onAccept }) {
  /* Lock body scroll when modal is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* Close on Escape key */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className={styles.modal}>
        {/* ── HEADER ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.headerTitle} id="terms-title">
              Terms &amp; Conditions
            </h2>
            <p className={styles.headerSub}>
              Please read carefully before creating your account.
            </p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* ── DATE BANNER ── */}
        <div className={styles.dateBanner}>
          <span className={styles.dateBannerText}>
            Effective Date: <strong>January 1, 2025</strong> &nbsp;·&nbsp; Last
            Updated: <strong>March 2026</strong>
          </span>
        </div>

        {/* ── BODY ── */}
        <div className={styles.body}>
          <p className={styles.intro}>
            These Terms and Conditions govern your use of ClearMind
            Psychological Services' platform and outline the rights and
            responsibilities of both users and service providers. By proceeding
            with registration, you acknowledge and accept these terms in full.
          </p>

          {SECTIONS.map((sec) => (
            <div key={sec.num} className={styles.section}>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionNum}>{sec.num}</span>
                <span className={styles.sectionTitleText}>{sec.title}</span>
              </div>
              <div className={styles.sectionBody}>{sec.content}</div>
            </div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div className={styles.footer}>
          <p className={styles.footerNote}>
            By clicking <strong>I Agree</strong>, you confirm you have read and
            accept all terms above.
          </p>
          <div className={styles.footerBtns}>
            <button className={styles.declineBtn} onClick={onClose}>
              Decline
            </button>
            <button className={styles.acceptBtn} onClick={handleAccept}>
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;
import { useState } from "react";
import styles from "../ClientStyle/PoliciesPage.module.css";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  {
    num: 1,
    title: "Appointment Scheduling",
    content: (
      <>
        <p>
          All therapy sessions must be scheduled at least{" "}
          <strong>24 hours in advance</strong> through the ClearMind platform.
          Walk-in or same-day bookings are not guaranteed and are subject to
          therapist availability.
        </p>
        <ul>
          <li>
            Sessions are scheduled in 50-minute blocks unless otherwise agreed.
          </li>
          <li>
            You will receive a confirmation notification upon successful
            booking.
          </li>
          <li>
            It is your responsibility to ensure your contact information is up
            to date.
          </li>
        </ul>
      </>
    ),
  },
  {
    num: 2,
    title: "Cancellation Policy",
    content: (
      <>
        <p>
          If you need to cancel an appointment, please do so{" "}
          <strong>at least 24 hours before</strong> your scheduled session to
          avoid a cancellation fee.
        </p>
        <ol>
          <li>
            <strong>24+ hours notice</strong> — No fee. Session credit is
            returned to your account.
          </li>
          <li>
            <strong>Less than 24 hours</strong> — A late cancellation fee of 50%
            of the session rate applies.
          </li>
          <li>
            <strong>No-show</strong> — Full session fee is charged. No credit is
            returned.
          </li>
        </ol>
        <div className={styles.noteBox}>
          Emergencies and medical situations are handled on a case-by-case
          basis. Please contact support as soon as possible.
        </div>
      </>
    ),
  },
  {
    num: 3,
    title: "Rebooking & Rescheduling",
    content: (
      <>
        <p>
          You may reschedule an appointment up to{" "}
          <strong>24 hours before</strong> the session at no extra charge.
          Rescheduling within 24 hours is treated as a late cancellation.
        </p>
        <ul>
          <li>Rebooking must be done through the ClearMind app or platform.</li>
          <li>Rescheduled sessions are subject to therapist availability.</li>
          <li>
            You may only reschedule a session <strong>once</strong> per original
            booking.
          </li>
        </ul>
      </>
    ),
  },
  {
    num: 4,
    title: "Repeated Absences",
    content: (
      <>
        <p>
          Consistent no-shows or repeated late cancellations may affect your
          ability to book future appointments. After{" "}
          <strong>3 consecutive no-shows</strong>, your account may be
          temporarily suspended pending review.
        </p>
        <div className={styles.noteBox}>
          Our therapists dedicate their time exclusively to scheduled clients.
          Missed appointments directly impact others waiting for care.
        </div>
      </>
    ),
  },
  {
    num: 5,
    title: "Therapist-Initiated Changes",
    content: (
      <>
        <p>
          In the rare event that your therapist needs to cancel or reschedule,
          you will be notified at the earliest opportunity and offered the next
          available slot at no additional cost.
        </p>
        <ul>
          <li>
            A full session credit will be returned to your account
            automatically.
          </li>
          <li>
            If a suitable alternative cannot be arranged, a full refund will be
            issued.
          </li>
        </ul>
      </>
    ),
  },
];

function PoliciesPage({ onBack, onConfirm }) {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = () => {
    if (!agreed) return;
    onConfirm?.();
  };

  return (
    <div className={styles.page}>
      {/* Hero Header */}
      <div className={styles.hero}>
        <div className={styles.heroTitleRow}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <IoArrowBack size={22} />
          </button>
          <h1 className={styles.heroTitle}>
            Therapy Appointment, Cancellation & Rebooking Policy
          </h1>
        </div>
        <p className={styles.heroSub}>
          Please read all sections carefully before proceeding.
        </p>
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

export default PoliciesPage;

import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaUserMd, FaHashtag } from 'react-icons/fa';
import styles from './styles/SessionCard.module.css';

/* ── Helpers ─────────────────────────────────────────────── */

const getServiceLabel = (referenceNumber) => {
  if (!referenceNumber) return { prefix: '', label: '' };
  if (referenceNumber.startsWith('PAC')) {
    return { prefix: 'PAC', label: 'Psychotherapy & Counseling' };
  }
  if (referenceNumber.startsWith('PAE')) {
    return { prefix: 'PAE', label: 'Psychological Assessment & Evaluation' };
  }
  return { prefix: '', label: '' };
};

const getStatusVariant = (status) => {
  const map = {
    Pending:     { bg: '#fff5b5', color: '#7a7a00' },
    Confirmed:   { bg: '#a8bffd', color: '#1a3a8f' },
    Rescheduled: { bg: '#FFCE99', color: '#7a4000' },
    Completed:   { bg: '#bbf7d0', color: '#166534' },
    Cancelled:   { bg: '#fecaca', color: '#991b1b' },
  };
  return map[status] || { bg: '#e2e8f0', color: '#4a5568' };
};

/* ── Component ───────────────────────────────────────────── */

const SessionCard = ({ appointment, onViewDetails }) => {
  const { prefix, label } = getServiceLabel(appointment.referenceNumber);
  const { bg, color }     = getStatusVariant(appointment.status);

  return (
    <div className={styles.sessionCard}>

      {/* ── Card Header: service type title + status badge ── */}
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <span className={styles.prefixTag}>{prefix}</span>
          <div>
            <div className={styles.serviceTitle}>{appointment.serviceType}</div>
            <div className={styles.serviceSubtitle}>{label}</div>
          </div>
        </div>
        <span
          className={styles.statusBadge}
          style={{ backgroundColor: bg, color }}
        >
          {appointment.status}
        </span>
      </div>

      <div className={styles.divider} />

      {/* ── Card Body: details ── */}
      <div className={styles.cardBody}>

        <div className={styles.infoRow}>
          <FaHashtag className={styles.infoIcon} />
          <span className={styles.infoLabel}>Reference No.:</span>
          <span className={styles.infoValue}>{appointment.referenceNumber}</span>
        </div>

        <div className={styles.infoRow}>
          <FaCalendarAlt className={styles.infoIcon} />
          <span className={styles.infoLabel}>Date:</span>
          <span className={styles.infoValue}>{appointment.date}</span>
        </div>

        <div className={styles.infoRow}>
          <FaClock className={styles.infoIcon} />
          <span className={styles.infoLabel}>Time:</span>
          <span className={styles.infoValue}>{appointment.time}</span>
        </div>

        <div className={styles.infoRow}>
          <FaUserMd className={styles.infoIcon} />
          <span className={styles.infoLabel}>Doctor:</span>
          <span className={styles.infoValue}>{appointment.doctor}</span>
        </div>

      </div>

      {/* ── Card Footer: view details button ── */}
      <div className={styles.cardFooter}>
        <button
          className={styles.viewDetailsBtn}
          onClick={() => onViewDetails(appointment.id)}
        >
          View Details
        </button>
      </div>

    </div>
  );
};

export default SessionCard;
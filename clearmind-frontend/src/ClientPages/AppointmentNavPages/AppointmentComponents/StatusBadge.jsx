import React from 'react';
import styles from './styles/StatusBadge.module.css';

const STATUS_CONFIG = {
  Pending:     { label: 'Pending' },
  Confirmed:   { label: 'Confirmed' },
  Rescheduled: { label: 'Rescheduled' },
  Completed:   { label: 'Completed' },
  Cancelled:   { label: 'Cancelled' },
};

const StatusBadge = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status] || { label: status };

  return (
    <span className={`${styles.statusBadge} ${styles[`badge${status}`]} ${className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
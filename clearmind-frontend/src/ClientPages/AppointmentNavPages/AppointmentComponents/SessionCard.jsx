import React, { useState } from 'react';
import {
  FaCalendarAlt, FaClock, FaUserMd, FaHashtag,
  FaChevronDown, FaChevronUp,
} from 'react-icons/fa';
import styles from './styles/SessionCard.module.css';
import SessionProgressBar from './SessionProgressBar';
import StatusBadge from './StatusBadge';

/* ── Helpers ─────────────────────────────────────────────── */

const getSessionPhaseLabel = (sessionNumber) => {
  if (sessionNumber === 1) return 'Initial Assessment';
  if (sessionNumber === 2) return 'Assessment & Discussion';
  return `Therapy Session ${sessionNumber - 2}`;
};

/* ── Session Row ─────────────────────────────────────────── */

const SessionRow = ({ appointment, sessionNumber, onViewDetails }) => {
  const phaseLabel = getSessionPhaseLabel(sessionNumber);

  const doctorChanged =
    appointment.doctorHistory?.length > 1 &&
    appointment.doctorHistory[appointment.doctorHistory.length - 1]?.changeReason;

  return (
    <div className={styles.sessionRow}>

      {/* Session number bubble */}
      <div className={styles.sessionNumBubble}>
        <span className={styles.sessionNum}>{sessionNumber}</span>
        <span className={styles.sessionPhase}>
          {sessionNumber <= 2 ? 'Assess' : 'Therapy'}
        </span>
      </div>

      {/* Session info */}
      <div className={styles.sessionInfo}>
        <div className={styles.sessionRowHeader}>
          <span className={styles.phaseLabel}>{phaseLabel}</span>
          <StatusBadge status={appointment.status} />
        </div>

        <div className={styles.infoRow}>
          <FaHashtag className={styles.infoIcon} />
          <span className={styles.infoLabel}>Ref #:</span>
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

        {/* Doctor change notice */}
        {doctorChanged && (
          <div className={styles.doctorChangeNotice}>
            ⚠ Doctor changed —{' '}
            {appointment.doctorHistory[appointment.doctorHistory.length - 1].changeReason}
          </div>
        )}

        {/* Decline / On Hold notice */}
        {appointment.declineReason && (
          <div className={styles.declineNotice}>
            {appointment.progressionStatus === 'On Hold' ? '⏸' : '✕'}{' '}
            {appointment.declineReason.reason}
            {appointment.declineReason.note && (
              <span className={styles.declineNote}>
                {' '}— {appointment.declineReason.note}
              </span>
            )}
          </div>
        )}

        <div className={styles.rowFooter}>
          <button
            className={styles.viewDetailsBtn}
            onClick={() => onViewDetails(appointment.id)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────── */

const SessionCard = ({ prefix, groupLabel, subLabel, appointments, onViewDetails }) => {
  const [expanded, setExpanded] = useState(false);

  const totalSessions     = 10;
  const completedCount    = appointments.filter((a) => a.status === 'Completed').length;
  const latestApt         = appointments[appointments.length - 1];
  const latestNum         = appointments.length;
  const prevCount         = appointments.length - 1;
  const progressionStatus = latestApt?.progressionStatus ?? 'Active';

  return (
    <div className={styles.sessionCard}>

      {/* ── Card Header ── */}
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <span className={styles.prefixTag}>{prefix}</span>
          <div>
            <div className={styles.serviceTitle}>{groupLabel}</div>
            {subLabel && (
              <div className={styles.subServiceLabel}>{subLabel}</div>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          <span className={styles.journeyChip}>
            {Math.min(appointments.length, totalSessions)}/{totalSessions} sessions
          </span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Progress Bar ── */}
      <div className={styles.cardBody}>
        <SessionProgressBar
          variant="full"
          completedCount={completedCount}
          totalSessions={totalSessions}
          progressionStatus={progressionStatus}
          showLegend={true}
          showChip={true}
          showLabel={true}
        />
      </div>

      <div className={styles.divider} />

      {/* ── Latest Session ── */}
      <div className={styles.cardBody}>
        <p className={styles.sectionLabel}>Current / Latest Session</p>
        <SessionRow
          appointment={latestApt}
          sessionNumber={latestNum}
          onViewDetails={onViewDetails}
        />
      </div>

      {/* ── Expanded: previous sessions ── */}
      {expanded && prevCount > 0 && (
        <>
          <div className={styles.divider} />
          <div className={styles.cardBody}>
            <p className={styles.sectionLabel}>Previous Sessions</p>
            {appointments
              .slice(0, -1)
              .reverse()
              .map((apt, idx) => (
                <SessionRow
                  key={apt.id}
                  appointment={apt}
                  sessionNumber={appointments.length - 1 - idx}
                  onViewDetails={onViewDetails}
                />
              ))}
          </div>
        </>
      )}

      {/* ── View More / Less ── */}
      {prevCount > 0 && (
        <button
          className={styles.viewMoreBtn}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <><FaChevronUp className={styles.chevron} /> View Less</>
          ) : (
            <><FaChevronDown className={styles.chevron} /> View More ({prevCount} previous session{prevCount > 1 ? 's' : ''})</>
          )}
        </button>
      )}

    </div>
  );
};

export default SessionCard;
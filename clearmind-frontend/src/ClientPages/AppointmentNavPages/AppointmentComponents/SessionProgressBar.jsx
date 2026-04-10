import React from 'react';
import styles from './styles/SessionProgressBar.module.css';

const PROGRESSION_CONFIG = {
  'Active':       { chipClass: styles.chipActive,       segmentClass: styles.segmentDoneActive       },
  'On Hold':      { chipClass: styles.chipOnHold,       segmentClass: styles.segmentDoneOnHold       },
  'Discontinued': { chipClass: styles.chipDiscontinued, segmentClass: styles.segmentDoneDiscontinued },
  'Completed':    { chipClass: styles.chipCompleted,    segmentClass: styles.segmentDoneCompleted    },
};

const getSessionPhaseLabel = (sessionNumber) => {
  if (sessionNumber === 1) return 'Initial Assessment';
  if (sessionNumber === 2) return 'Assessment & Discussion';
  return `Therapy Session ${sessionNumber - 2}`;
};

/**
 * Props:
 *   sessionNumber      — current session (used for mini variant)
 *   completedCount     — how many sessions are done (used for full variant)
 *   totalSessions      — defaults to 10
 *   progressionStatus  — 'Active' | 'On Hold' | 'Discontinued' | 'Completed'
 *   variant            — 'full' (SessionCard) | 'mini' (AppointmentCard)
 *   showLegend         — show assessment/therapy legend (full only)
 *   showChip           — show the progression status chip
 *   showLabel          — show "Session Progress" label and count
 */
const SessionProgressBar = ({
  sessionNumber    = 0,
  completedCount   = 0,
  totalSessions    = 10,
  progressionStatus = 'Active',
  variant          = 'full',
  showLegend       = true,
  showChip         = true,
  showLabel        = true,
}) => {
  const config     = PROGRESSION_CONFIG[progressionStatus] ?? PROGRESSION_CONFIG['Active'];
  const isMini     = variant === 'mini';

  // mini uses sessionNumber to fill, full uses completedCount
  const filledCount = isMini ? sessionNumber : Math.min(completedCount, totalSessions);

  return (
    <div className={`${styles.wrapper} ${isMini ? styles.wrapperMini : styles.wrapperFull}`}>

      {/* Top row — label + chip */}
      {(showLabel || showChip) && (
        <div className={styles.topRow}>
          {showLabel && (
            <div className={styles.labelGroup}>
              <span className={styles.progressLabel}>
                {isMini ? `Session ${sessionNumber} of ${totalSessions}` : 'Session Progress'}
              </span>
              {!isMini && (
                <span className={styles.progressCount}>
                  {filledCount} / {totalSessions} completed
                </span>
              )}
            </div>
          )}
          {showChip && (
            <span className={`${styles.progressionChip} ${config.chipClass}`}>
              {progressionStatus}
            </span>
          )}
        </div>
      )}

      {/* Segment track */}
      <div className={`${styles.track} ${isMini ? styles.trackMini : styles.trackFull}`}>
        {Array.from({ length: totalSessions }).map((_, i) => {
          const sessionNum = i + 1;
          const isDone     = sessionNum <= filledCount;
          const isAssess   = sessionNum <= 2;

          return (
            <div
              key={i}
              title={getSessionPhaseLabel(sessionNum)}
              className={`
                ${styles.segment}
                ${isMini ? styles.segmentMini : styles.segmentFull}
                ${isDone
                  ? `${config.segmentClass} ${isAssess ? styles.segmentAssess : styles.segmentTherapy}`
                  : styles.segmentEmpty
                }
              `}
            />
          );
        })}
      </div>

      {/* Legend — full variant only */}
      {!isMini && showLegend && (
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendAssess}`} />
            Assessment (1–2)
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendTherapy}`} />
            Therapy (3–10)
          </span>
        </div>
      )}

    </div>
  );
};

export default SessionProgressBar;
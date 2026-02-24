import { useState, useEffect } from "react";
import MOCK_ANNOUNCEMENTS from "../../MockData/MockAnnouncement.js";
import styles from "../ClientStyle/ClientHome.module.css";

// ── swap this out with real API call later ──
const fetchAnnouncements = async () => {
  // TODO: replace with actual API
  // const res = await fetch("/api/announcements?role=client");
  // return await res.json();
  return MOCK_ANNOUNCEMENTS.filter((a) => a.targetRole === "client");
};

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAnnouncements();
        if (!cancelled) setAnnouncements(data);
      } catch (err) {
        if (!cancelled) setError("Failed to load announcements.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Loading State ──
  if (loading) {
    return (
      <div className={styles.anWrap}>
        <div className={styles.anSectionHeader}>
          <span className={styles.anTitle}>Announcements</span>
        </div>
        <div className={styles.anSkeletonList}>
          {[1, 2, 3].map((n) => (
            <div key={n} className={styles.anSkeleton} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className={styles.anWrap}>
        <div className={styles.anSectionHeader}>
          <span className={styles.anTitle}>Announcements</span>
        </div>
        <div className={styles.anError}>{error}</div>
      </div>
    );
  }

  // ── Empty State ──
  if (announcements.length === 0) {
    return (
      <div className={styles.anWrap}>
        <div className={styles.anSectionHeader}>
          <span className={styles.anTitle}>Announcements</span>
          <span className={styles.anCount}>(0)</span>
        </div>
        <div className={styles.anEmpty}>No announcements at this time.</div>
      </div>
    );
  }

  // ── Main ──
  return (
    <div className={styles.anWrap}>
      <div className={styles.anSectionHeader}>
        <span className={styles.anTitle}>Announcements</span>
        <span className={styles.anCount}>({announcements.length})</span>
      </div>

      <div className={styles.anList}>
        {announcements.map((item) => (
          <div
            key={item.id}
            className={`${styles.anCard} ${item.urgent ? styles.anCardUrgent : styles.anCardNormal}`}
          >
            <div className={styles.anCardAccent} />
            <div className={styles.anCardContent}>
              <div className={styles.anCardTitleRow}>
                {item.urgent && (
                  <span className={styles.anUrgentBadge}>URGENT</span>
                )}
                <span className={styles.anCardTitle}>{item.title}</span>
              </div>
              <p className={styles.anCardBody}>{item.body}</p>
              <span className={styles.anCardDate}>Posted: {item.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Announcements;
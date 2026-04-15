import { useState, useEffect, useCallback } from "react";
import axiosClient from "../../axiosClient"; // adjust path as needed
import styles from "../ClientStyle/ClientHome.module.css";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosClient.get("/admin/announcements");
      setAnnouncements(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("fetchAnnouncements:", err);
      setError("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // ── Loading State ──
  if (loading) {
    /* ...same as before... */
  }

  // ── Error State ──
  if (error) {
    /* ...same as before... */
  }

  // ── Empty State ──
  if (announcements.length === 0) {
    /* ...same as before... */
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
            className={`${styles.anCard} ${item.priority === "high" ? styles.anCardUrgent : styles.anCardNormal}`}
          >
            <div className={styles.anCardAccent} />
            <div className={styles.anCardContent}>
              <div className={styles.anCardTitleRow}>
                {item.priority === "high" && (
                  <span className={styles.anUrgentBadge}>URGENT</span>
                )}
                <span className={styles.anCardTitle}>{item.title}</span>
              </div>
              <p className={styles.anCardBody}>{item.message}</p>
              <span className={styles.anCardDate}>
                Posted:{" "}
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Announcements;

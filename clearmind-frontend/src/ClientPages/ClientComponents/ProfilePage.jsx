import { useState, useEffect } from "react";
import {
  FaPen,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUser,
  FaVenusMars,
  FaCalendarAlt,
  FaHeart,
  FaArrowLeft,
} from "react-icons/fa";
import ProfileAvatar from "./ProfileAvatar";
import EditProfileModal from "./EditProfileModal";
import styles from "../ClientStyle/ProfilePage.module.css";
import { useOutletContext, useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const { user: contextUser } = context;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Only sync from context on mount (or when contextUser first becomes available)
  useEffect(() => {
    if (contextUser) setUser(contextUser);
  }, [contextUser?.id]); // depend on ID only — avoids overwriting after save

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p className="text-muted">Loading profile...</p>
      </div>
    );
  }

  // After save, update local user state — modal closes itself
  const handleSave = (updatedData) => {
    setUser(updatedData);
  };

  const computeAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const formatDate = (dob) => {
    if (!dob) return "—";
    return new Date(dob).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const normalizePronouns = (val) => {
    if (!val) return null;
    const map = {
      he_him: "He/Him",
      she_her: "She/Her",
      they_them: "They/Them",
    };
    return map[val] || val;
  };

  const capitalize = (val) => {
    if (!val) return null;
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  const age = computeAge(user?.dob);

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className={styles.infoRow}>
      <div className={styles.infoIcon}>
        <Icon />
      </div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value || "—"}</span>
      </div>
    </div>
  );

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay} />
        <div className={styles.avatarWrapper}>
          <ProfileAvatar
            firstName={user?.firstName}
            lastName={user?.lastName}
            profilePic={user?.profilePicture}
            size={88}
          />
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>
            {[
              user?.firstName,
              user?.middleInitial && user.middleInitial !== "N/A"
                ? `${user.middleInitial}.`
                : null,
              user?.lastName,
            ]
              .filter(Boolean)
              .join(" ") || "—"}
          </h1>
          <div className={styles.heroBadges}>
            {user?.civilStatus && (
              <span className={styles.badge}>{user.civilStatus}</span>
            )}
            {user?.sex && (
              <span className={styles.badge}>{capitalize(user.sex)}</span>
            )}
            {(user?.preferredPronoun || user?.displayPronoun) && (
              <span className={styles.badgeOutline}>
                {normalizePronouns(
                  user.displayPronoun || user.preferredPronoun,
                )}
              </span>
            )}
          </div>
        </div>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/client/account")}
        >
          <FaArrowLeft /> Back
        </button>
        <button className={styles.editBtn} onClick={() => setIsEditOpen(true)}>
          <FaPen size={13} /> Edit Profile
        </button>
      </div>

      <div className={styles.cardsWrapper}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FaUser className={styles.cardHeaderIcon} />
            <span>Personal Information</span>
          </div>
          <div className={styles.cardBody}>
            <InfoRow
              icon={FaCalendarAlt}
              label="Date of Birth"
              value={`${formatDate(user?.dob)}${age !== null ? ` (${age} yrs old)` : ""}`}
            />
            <InfoRow
              icon={FaVenusMars}
              label="Sex"
              value={capitalize(user?.sex)}
            />
            {user?.genderIdentity && (
              <InfoRow
                icon={FaVenusMars}
                label="Gender Identity"
                value={capitalize(user.genderIdentity)}
              />
            )}
            <InfoRow
              icon={FaHeart}
              label="Civil Status"
              value={user?.civilStatus}
            />
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FaPhone className={styles.cardHeaderIcon} />
            <span>Contact Information</span>
          </div>
          <div className={styles.cardBody}>
            <InfoRow
              icon={FaPhone}
              label="Contact No."
              value={user?.contactNo}
            />
            <InfoRow icon={FaEnvelope} label="Email" value={user?.email} />
            <InfoRow
              icon={FaMapMarkerAlt}
              label="Home Address"
              value={user?.address}
            />
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProfilePage;

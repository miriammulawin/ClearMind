import { useState } from "react";
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
import EditProfileModal from "../EditProfileModal";
import styles from "../ClientStyle/ProfilePage.module.css";
import { useOutletContext, useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userData, onSave } = useOutletContext();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [user, setUser] = useState(userData);

  const handleSave = (updatedData) => {
    setUser(updatedData);
    onSave?.(updatedData);
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

  const age = computeAge(user?.dateOfBirth);

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
    <div className={styles.bodyWrapper}>
      {/* ── Hero / Avatar Section ── */}
      <div className={styles.heroSection}>
        <div className={styles.heroOverlay} />
        <div className={styles.avatarWrapper}>
          <ProfileAvatar
            firstName={user?.firstName}
            lastName={user?.lastName}
            profilePic={user?.profilePic}
            size={88}
          />
        </div>
        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>
            {[user?.firstName, user?.middleName, user?.lastName]
              .filter(Boolean)
              .join(" ") || "—"}
          </h1>
          <div className={styles.heroBadges}>
            {user?.civilStatus && (
              <span className={styles.badge}>{user.civilStatus}</span>
            )}
            {user?.sex && <span className={styles.badge}>{user.sex}</span>}
            {user?.preferredPronouns && (
              <span className={styles.badgeOutline}>
                {user.preferredPronouns}
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

      {/* ── Cards ── */}
      <div className={styles.cardsWrapper}>
        {/* Personal Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FaUser className={styles.cardHeaderIcon} />
            <span>Personal Information</span>
          </div>
          <div className={styles.cardBody}>
            <InfoRow
              icon={FaCalendarAlt}
              label="Date of Birth"
              value={`${formatDate(user?.dateOfBirth)}${age !== null ? ` (${age} yrs old)` : ""}`}
            />
            <InfoRow icon={FaVenusMars} label="Sex" value={user?.sex} />
            {user?.genderIdentity && (
              <InfoRow
                icon={FaVenusMars}
                label="Gender Identity"
                value={user.genderIdentity}
              />
            )}
            <InfoRow
              icon={FaHeart}
              label="Civil Status"
              value={user?.civilStatus}
            />
          </div>
        </div>

        {/* Contact Information */}
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
              value={user?.homeAddress}
            />
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userData={user}
        onSave={handleSave}
      />
    </div>
  );
};

export default ProfilePage;

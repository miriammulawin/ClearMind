// AppointmentComponents/FormHeader.jsx
//
// Handles:
//   1. Required notice
//   2. "I am the Patient / I am the Complainant" toggle
//   3a. Patient     → PreloadedProfile card (read-only, from useCurrentUser)
//   3b. Complainant → ComplainantFields (manual patient info entry)
//
// Props:
//   isInformant     — bool (false = Patient, true = Complainant)
//   onToggle        — (value: bool) => void
//   user            — object returned by useCurrentUser()
//                     fields used: fullName, initials, profilePic,
//                                  age, sex, contactNo, email, homeAddress
//   patientForm     — shared form state object
//   setPatientForm  — functional setter for patientForm

import React, { useMemo, useState } from "react";
import {
  BsPersonCheckFill,
  BsCalendar2CheckFill,
  BsGenderMale,
  BsGenderFemale,
  BsGeoAltFill,
  BsEnvelopeFill,
  BsTelephoneFill,
} from "react-icons/bs";
import { FaVenusMars, FaChevronDown } from "react-icons/fa";
import styles from "./styles/FormHeader.module.css";

// ─── Required Notice ──────────────────────────────────────────────────────────
const RequiredNotice = () => (
  <div className={styles.requiredNotice}>
    Fields with mark <span className={styles.requiredStar}>*</span> are required
  </div>
);

// ─── Pre-loaded Profile Card ───────────────────────────────────────────────────
const PreloadedProfile = ({ user }) => {
  // Guard: user not yet loaded
  if (!user) {
    return (
      <div className={styles.profileCard}>
        <div className={styles.avatar}>?</div>
        <div className={styles.profileInfo}>
          <span className={styles.preloadedBadge}>
            <BsPersonCheckFill /> Pre-loaded from your account
          </span>
          <div className={styles.profileName} style={{ color: "#9b8ab0" }}>
            Loading profile…
          </div>
        </div>
      </div>
    );
  }

  // useCurrentUser returns: sex as string e.g. "Male" / "Female"
  const GenderIcon = user.sex === "Male" ? BsGenderMale : BsGenderFemale;

  return (
    <div className={styles.profileCard}>
      {/* Avatar */}
      {user.profilePic ? (
        <img
          src={user.profilePic}
          alt={user.fullName}
          className={styles.avatar}
          style={{ objectFit: "cover", borderRadius: "50%" }}
        />
      ) : (
        <div className={styles.avatar}>{user.initials}</div>
      )}

      {/* Info */}
      <div className={styles.profileInfo}>
        <span className={styles.preloadedBadge}>
          <BsPersonCheckFill /> Pre-loaded from your account
        </span>

        {/* Full name */}
        <div className={styles.profileName}>{user.fullName}</div>

        {/* 2-col grid */}
        <div className={styles.metaGrid}>
          <div className={styles.metaRow}>
            <BsCalendar2CheckFill className={styles.metaIcon} />
            <span>{user.age} yrs old</span>
          </div>

          <div className={styles.metaRow}>
            <GenderIcon className={styles.metaIcon} />
            <span>{user.sex}</span>
          </div>

          {user.genderIdentity && (
            <div className={styles.metaRow}>
              <FaVenusMars className={styles.metaIcon} />
              <span>{user.genderIdentity}</span>
            </div>
          )}

          {user.preferredPronouns && (
            <div className={styles.metaRow}>
              <BsPersonCheckFill className={styles.metaIcon} />
              <span>{user.preferredPronouns}</span>
            </div>
          )}
          <div className={styles.metaRow}>
            <BsPersonCheckFill className={styles.metaIcon} />
            <span>{user.civilStatus}</span>
          </div>

          <div className={styles.metaRow}>
            <BsTelephoneFill className={styles.metaIcon} />
            <span>{user.contactNo}</span>
          </div>

          <div className={styles.metaRow}>
            <BsEnvelopeFill className={styles.metaIcon} />
            <span>{user.email}</span>
          </div>

          {/* Address — full width */}
          <div className={`${styles.metaRow} ${styles.metaFull}`}>
            <BsGeoAltFill className={styles.metaIcon} />
            <span>{user.homeAddress}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Complainant Fields ────────────────────────────────────────────────────────
const ComplainantFields = ({ patientForm = {}, setPatientForm }) => {
  const handle = (field, value) =>
    setPatientForm((prev) => ({ ...prev, [field]: value }));

  const {
    complainantName = "",
    complainantRelation = "",
    firstName = "",
    middleName = "",
    lastName = "",
    sex = "",
    genderIdentity = "",
    preferredPronouns = "",
    civilStatus = "",
    dateOfBirth = "",
    contactNo = "",
    email = "",
    address = "",
  } = patientForm;
  const PRONOUN_OPTIONS = [
    { label: "She/Her", value: "she/her" },
    { label: "He/Him", value: "he/him" },
    { label: "They/Them", value: "they/them" },
    { label: "Other (specify)", value: "other" },
  ];
  // for dropdown
  const [sexOpen, setSexOpen] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);
  const [pronounOpen, setPronounOpen] = useState(false);
  const [civilOpen, setCivilOpen] = useState(false);

  const GENDER_OPTIONS = [
    "Woman",
    "Man",
    "Transgender",
    "Trans woman",
    "Trans man",
    "Non-binary",
    "Genderqueer",
    "Gender fluid",
    "Agender",
    "Bigender",
    "Two-spirit",
    "Intersex",
    "Pangender",
    "Prefer not to say",
    "Other (specify)",
  ];

  const CIVIL_STATUS_OPTIONS = [
    "Single",
    "Married",
    "Widowed",
    "Separated",
    "Annulled",
  ];

  const todayStr = new Date().toISOString().split("T")[0];

  const computedAge = useMemo(() => {
    if (!dateOfBirth) return "";
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 1 ? String(age) : "";
  }, [dateOfBirth]);

  // Sync computed age into form
  React.useEffect(() => {
    if (computedAge && patientForm.age !== computedAge) {
      handle("age", computedAge);
    }
  }, [computedAge]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.complainantCard}>
      {/* ── Complainant details ── */}
      <div className={styles.complainantTitle}>Your Details (Complainant)</div>

      <div>
        <label className={styles.inputLabel}>
          Your Full Name <span className={styles.req}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g. Maria Santos"
          value={complainantName}
          onChange={(e) => handle("complainantName", e.target.value)}
        />
      </div>

      <div>
        <label className={styles.inputLabel}>
          Your Relation to the Patient <span className={styles.req}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g. Parent, Spouse, Guardian"
          value={complainantRelation}
          onChange={(e) => handle("complainantRelation", e.target.value)}
        />
      </div>

      {/* ── Patient info ── */}
      <div className={styles.complainantTitle} style={{ marginTop: "0.5rem" }}>
        Patient's Information
      </div>

      {/* First + Middle */}
      <div className={styles.inputRow}>
        <div>
          <label className={styles.inputLabel}>
            First Name <span className={styles.req}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="Juan"
            value={firstName}
            onChange={(e) => handle("firstName", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.inputLabel}>Middle Name</label>
          <input
            type="text"
            className={styles.input}
            placeholder="(optional)"
            value={middleName}
            onChange={(e) => handle("middleName", e.target.value)}
          />
        </div>
      </div>

      {/* Last Name */}
      <div>
        <label className={styles.inputLabel}>
          Last Name <span className={styles.req}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="Dela Cruz"
          value={lastName}
          onChange={(e) => handle("lastName", e.target.value)}
        />
      </div>

      {/* Sex */}
      <div>
        <label className={styles.inputLabel}>
          Sex <span className={styles.req}>*</span>
        </label>
        <div
          className={styles.selectWrapper}
          onClick={() => setSexOpen((prev) => !prev)}
        >
          <select
            className={`${styles.input} ${styles.select}`}
            value={sex}
            onChange={(e) => handle("sex", e.target.value)}
            onBlur={() => setSexOpen(false)}
          >
            <option value="" disabled>
              Select sex
            </option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          <FaChevronDown
            className={`${styles.selectIcon} ${sexOpen ? styles.selectIconOpen : ""}`}
          />
        </div>
      </div>

      {/* Gender Identity */}
      <div>
        <label className={styles.inputLabel}>Gender Identity</label>
        <div
          className={styles.selectWrapper}
          onClick={() => setSexOpen((prev) => !prev)}
        >
          <select
            className={`${styles.input} ${styles.select}`}
            value={genderIdentity}
            onChange={(e) => handle("genderIdentity", e.target.value)}
            onBlur={() => setGenderOpen(false)}
          >
            <option value="" disabled>
              Select gender identity
            </option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <FaChevronDown
            className={`${styles.selectIcon} ${genderOpen ? styles.selectIconOpen : ""}`}
          />
        </div>
      </div>

      {/* Preferred Pronouns */}
      <div>
        <label className={styles.inputLabel}>Preferred Pronouns</label>
        <div
          className={styles.selectWrapper}
          onClick={() => setSexOpen((prev) => !prev)}
        >
          <select
            className={`${styles.input} ${styles.select}`}
            value={preferredPronouns}
            onChange={(e) => handle("preferredPronouns", e.target.value)}
            onBlur={() => setPronounOpen(false)}
          >
            <option value="" disabled>
              Select pronouns
            </option>
            {PRONOUN_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <FaChevronDown
            className={`${styles.selectIcon} ${pronounOpen ? styles.selectIconOpen : ""}`}
          />
        </div>
      </div>

      {/* Civil Status */}
      <div>
        <label className={styles.inputLabel}>
          Civil Status <span className={styles.req}>*</span>
        </label>
        <div
          className={styles.selectWrapper}
          onClick={() => setSexOpen((prev) => !prev)}
        >
          <select
            className={`${styles.input} ${styles.select}`}
            value={civilStatus}
            onChange={(e) => handle("civilStatus", e.target.value)}
            onBlur={() => setCivilOpen(false)}
          >
            <option value="" disabled>
              Select civil status
            </option>
            {CIVIL_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <FaChevronDown
            className={`${styles.selectIcon} ${civilOpen ? styles.selectIconOpen : ""}`}
          />
        </div>
      </div>

      {/* DOB + Age */}
      <div className={styles.inputRow}>
        <div>
          <label className={styles.inputLabel}>
            Date of Birth <span className={styles.req}>*</span>
          </label>
          <input
            type="date"
            className={styles.input}
            value={dateOfBirth}
            max={todayStr}
            onChange={(e) => handle("dateOfBirth", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.inputLabel}>Age</label>
          <input
            type="text"
            className={styles.input}
            value={computedAge}
            readOnly
            tabIndex={-1}
            placeholder="—"
            style={{ background: "#f3eeff", color: "#5B2C91", fontWeight: 600 }}
          />
        </div>
      </div>

      {/* Contact */}
      <div>
        <label className={styles.inputLabel}>
          Contact No. <span className={styles.req}>*</span>
        </label>
        <input
          type="tel"
          className={styles.input}
          placeholder="+63 9XX XXX XXXX"
          value={contactNo}
          onChange={(e) => handle("contactNo", e.target.value)}
        />
      </div>

      {/* Email */}
      <div>
        <label className={styles.inputLabel}>
          Email <span className={styles.req}>*</span>
        </label>
        <input
          type="email"
          className={styles.input}
          placeholder="patient@email.com"
          value={email}
          onChange={(e) => handle("email", e.target.value)}
        />
      </div>

      {/* Address */}
      <div>
        <label className={styles.inputLabel}>
          Home Address <span className={styles.req}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="Street, Barangay, City"
          value={address}
          onChange={(e) => handle("address", e.target.value)}
        />
      </div>
    </div>
  );
};

// ─── FormHeader (default export) ──────────────────────────────────────────────
const FormHeader = ({
  isInformant,
  onToggle,
  user,
  patientForm,
  setPatientForm,
}) => (
  <>
    <RequiredNotice />

    {/* ── Toggle ── */}
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>
        You are filling this form as:{" "}
        <span className={styles.requiredStar}>*</span>
      </label>
      <div className={styles.toggleRow}>
        {[
          { value: false, label: "I am the Patient" },
          { value: true, label: "I am the Complainant" },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            className={`${styles.toggleBtn} ${
              isInformant === opt.value ? styles.toggleBtnActive : ""
            }`}
            onClick={() => onToggle(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>

    {/* ── Patient → pre-loaded card ── */}
    {isInformant === false && <PreloadedProfile user={user} />}

    {/* ── Complainant → manual fields ── */}
    {isInformant === true && (
      <ComplainantFields
        patientForm={patientForm}
        setPatientForm={setPatientForm}
      />
    )}

    {/* ── Patient Type — shown in both modes ── */}
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>
        Patient Type <span className={styles.requiredStar}>*</span>
      </label>
      <div className={styles.radioRow}>
        {["Existing Patient", "New Patient"].map((type) => (
          <label key={type} className={styles.radioLabel}>
            <input
              type="radio"
              name="patientType"
              value={type}
              checked={(patientForm.patientType ?? "New Patient") === type}
              onChange={() =>
                setPatientForm((prev) => ({ ...prev, patientType: type }))
              }
              className={styles.radioInput}
            />
            <span className={styles.radioCustom} />
            {type}
          </label>
        ))}
      </div>
    </div>

    {/* ── Patient Classification — shown in both modes ── */}
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>
        Patient Classification <span className={styles.requiredStar}>*</span>
      </label>
      <div className={styles.radioRow}>
        {["PWD", "Senior Citizen", "Regular"].map((cls) => (
          <label key={cls} className={styles.radioLabel}>
            <input
              type="radio"
              name="classification"
              value={cls}
              checked={(patientForm.classification ?? "Regular") === cls}
              onChange={() =>
                setPatientForm((prev) => ({ ...prev, classification: cls }))
              }
              className={styles.radioInput}
            />
            <span className={styles.radioCustom} />
            {cls}
          </label>
        ))}
      </div>
    </div>
  </>
);

export default FormHeader;

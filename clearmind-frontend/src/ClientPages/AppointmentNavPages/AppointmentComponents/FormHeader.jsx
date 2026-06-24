// AppointmentComponents/FormHeader.jsx
//
// FIXED: PreloadedProfile now accepts + displays the appointment schedule
//        (mode, date, time, service, fee) below the patient info card.
//
// Props added to FormHeader:
//   consultationMode, selectedDate, selectedTime,
//   consultationFee, selectedService, doctorData
// These are forwarded to PreloadedProfile so the patient can see
// what they booked while reviewing their own profile info.

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

// ─── Schedule helpers ─────────────────────────────────────────────────────────
const formatTimePH = (time24) => {
  if (!time24) return "—";
  if (time24.includes("AM") || time24.includes("PM")) return time24;
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
};

const getEndTime = (startTime) => {
  if (!startTime) return "—";
  let mins;
  if (startTime.includes("AM") || startTime.includes("PM")) {
    const [time, period] = startTime.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    mins = h * 60 + m;
  } else {
    const [h, m] = startTime.split(":").map(Number);
    mins = h * 60 + m;
  }
  mins += 60;
  const hours = Math.floor(mins / 60) % 24;
  const minutes = mins % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const displayH = hours % 12 || 12;
  const displayM = String(minutes).padStart(2, "0");
  return `${displayH}:${displayM} ${period}`;
};

const formatPeso = (amt) => {
  if (amt === null || amt === undefined || amt === "") return null;
  const num = Number(amt);
  if (isNaN(num)) return null;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(num);
};

const resolveDateStr = (d) => {
  if (!d) return null;
  if (typeof d === "string") return d;
  if (d.date) return d.date;
  return null;
};

// ─── Inline schedule mini-card shown inside PreloadedProfile ──────────────────
const ScheduleMiniCard = ({
  consultationMode,
  selectedDate,
  selectedTime,
  consultationFee,
  selectedService,
}) => {
  const dateStr = resolveDateStr(selectedDate);
  if (!consultationMode && !dateStr && !selectedTime) return null;

  const feeStr = formatPeso(consultationFee);
  const modeLabel =
    consultationMode === "VIRTUAL"
      ? "🖥 Virtual"
      : consultationMode === "ON-SITE"
        ? "🏥 On-Site"
        : consultationMode || "—";

  const rows = [
    { icon: "📅", label: "Mode", value: modeLabel },
    { icon: "🗓", label: "Date", value: dateStr || "—" },
    selectedTime
      ? {
          icon: "🕐",
          label: "Time",
          value: `${formatTimePH(selectedTime)} – ${getEndTime(selectedTime)}`,
        }
      : null,
    selectedService
      ? { icon: "📋", label: "Service", value: selectedService }
      : null,
    feeStr
      ? { icon: "💰", label: "Fee", value: feeStr, highlight: true }
      : null,
  ].filter(Boolean);

  return (
    <div
      style={{
        marginTop: "12px",
        padding: "12px 14px",
        background: "linear-gradient(135deg,#f5f0fb 0%,#eef6ff 100%)",
        border: "1.5px solid #d4b8f0",
        borderRadius: "12px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "#4D227C",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "#4D227C",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        Appointment Schedule
      </div>

      {rows.map(({ icon, label, value, highlight }) => (
        <div
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 0",
          }}
        >
          <span style={{ fontSize: "13px", flexShrink: 0 }}>{icon}</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#7c3aed",
              minWidth: "44px",
              flexShrink: 0,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: highlight ? 700 : 500,
              color: highlight ? "#059669" : "#2d1254",
              flex: 1,
            }}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Required Notice ──────────────────────────────────────────────────────────
const RequiredNotice = () => (
  <div className={styles.requiredNotice}>
    Fields with mark <span className={styles.requiredStar}>*</span> are required
  </div>
);

// ─── PreloadedProfile ─────────────────────────────────────────────────────────
const PreloadedProfile = ({
  user,
  // Schedule props forwarded from FormHeader
  consultationMode,
  selectedDate,
  selectedTime,
  consultationFee,
  selectedService,
}) => {
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

  const fullName = [user.firstName, user.middleInitial, user.lastName]
    .filter(Boolean)
    .join(" ");

  const computeAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // useCurrentUser exposes `dateOfBirth` (normalized from dob in the hook)
  const age = computeAge(user.dateOfBirth || user.dob);

  const initials =
    (user.firstName?.[0]?.toUpperCase() || "") +
    (user.lastName?.[0]?.toUpperCase() || "");

  const GenderIcon =
    user.sex === "male"
      ? BsGenderMale
      : user.sex === "female"
        ? BsGenderFemale
        : FaVenusMars;

  return (
    <div className={styles.profileCard}>
      {/* Avatar */}
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={fullName}
          className={styles.avatar}
          style={{ objectFit: "cover", borderRadius: "50%" }}
        />
      ) : (
        <div className={styles.avatar}>{initials || "?"}</div>
      )}

      <div className={styles.profileInfo} style={{ flex: 1 }}>
        <span className={styles.preloadedBadge}>
          <BsPersonCheckFill /> Pre-loaded from your account
        </span>

        <div className={styles.profileName}>{fullName || "—"}</div>

        <div className={styles.metaGrid}>
          <div className={styles.metaRow}>
            <BsCalendar2CheckFill className={styles.metaIcon} />
            <span>{age ? `${age} yrs old` : "—"}</span>
          </div>

          <div className={styles.metaRow}>
            <GenderIcon className={styles.metaIcon} />
            <span>{user.sex || "—"}</span>
          </div>

          {user.genderIdentity && (
            <div className={styles.metaRow}>
              <FaVenusMars className={styles.metaIcon} />
              <span>{user.genderIdentity}</span>
            </div>
          )}

          {user.displayPronoun && (
            <div className={styles.metaRow}>
              <BsPersonCheckFill className={styles.metaIcon} />
              <span>{user.displayPronoun}</span>
            </div>
          )}

          <div className={styles.metaRow}>
            <BsPersonCheckFill className={styles.metaIcon} />
            <span>{user.civilStatus || "—"}</span>
          </div>

          <div className={styles.metaRow}>
            <BsTelephoneFill className={styles.metaIcon} />
            <span>{user.contactNo || "—"}</span>
          </div>

          <div className={styles.metaRow}>
            <BsEnvelopeFill className={styles.metaIcon} />
            <span>{user.email || "—"}</span>
          </div>

          <div className={`${styles.metaRow} ${styles.metaFull}`}>
            <BsGeoAltFill className={styles.metaIcon} />
            <span>{user.homeAddress || user.address || "—"}</span>
          </div>
        </div>

        {/* ── Schedule mini-card ── */}
        <ScheduleMiniCard
          consultationMode={consultationMode}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          consultationFee={consultationFee}
          selectedService={selectedService}
        />
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

  React.useEffect(() => {
    if (computedAge && patientForm.age !== computedAge) {
      handle("age", computedAge);
    }
  }, [computedAge]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.complainantCard}>
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

      <div className={styles.complainantTitle} style={{ marginTop: "0.5rem" }}>
        Patient's Information
      </div>

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
          onClick={() => setSexOpen((p) => !p)}
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
          onClick={() => setGenderOpen((p) => !p)}
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
          onClick={() => setPronounOpen((p) => !p)}
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
          onClick={() => setCivilOpen((p) => !p)}
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
/**
 * NEW PROPS (all optional — forwarded to PreloadedProfile → ScheduleMiniCard):
 *   consultationMode, selectedDate, selectedTime, consultationFee,
 *   selectedService, doctorData
 */
const FormHeader = ({
  isInformant,
  onToggle,
  user,
  patientForm,
  setPatientForm,
  // Schedule summary props (passed from VerifyProfileForm)
  consultationMode,
  selectedDate,
  selectedTime,
  consultationFee,
  selectedService,
  doctorData,
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
          { value: true, label: "I am the Informant" },
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

    {/* ── Patient → pre-loaded card (with schedule mini-card inside) ── */}
    {isInformant === false && (
      <PreloadedProfile
        user={user}
        consultationMode={consultationMode}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        consultationFee={consultationFee}
        selectedService={selectedService}
        doctorData={doctorData}
      />
    )}

    {/* ── Complainant → manual fields ── */}
    {isInformant === true && (
      <ComplainantFields
        patientForm={patientForm}
        setPatientForm={setPatientForm}
      />
    )}

    {/* ── Patient Type ── */}
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

    {/* ── Patient Classification ── */}
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

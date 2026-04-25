import React, { useState, useMemo } from "react";
import { Form } from "react-bootstrap";
import styles from "../../../ClientStyle/VerifyProfileForm.module.css";
import { useCurrentUser } from "../../../../hooks/userCurrentUser";

/* ─── Small helpers ──────────────────────────────────────────────────────── */
const Field = ({ label, required, children, error }) => (
  <div className={styles.fieldGroup}>
    <label className={styles.fieldLabel}>
      {label} {required && <span className={styles.requiredStar}>*</span>}
    </label>
    {children}
    {error && (
      <div className={styles.fieldErrorMsg}>
        <svg className={styles.fieldErrorIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
        </svg>
        {error}
      </div>
    )}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "13px" }}>
    <span style={{ color: "#7c3aed", fontWeight: 600, minWidth: "120px" }}>{label}:</span>
    <span style={{ color: "#2d1254", fontWeight: 500 }}>{value || <em style={{ color: "#aaa" }}>Not provided</em>}</span>
  </div>
);

/* ─── VerifyProfileForm ──────────────────────────────────────────────────── */
const VerifyProfileForm = ({
  formData = {},
  setFormData = () => {},
  declarationAgreed = false,
  onOpenDeclaration = () => {},
}) => {
  const user = useCurrentUser(); // logged-in client's profile

  const [emailError, setEmailError]   = useState("");
  const [ageError,   setAgeError]     = useState("");

  /* ── which mode ── */
  const isInformant = formData.isInformant === true;

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  /* ── email validation ── */
  const handleEmailChange = (value) => {
    handleChange("email", value);
    if (!value) { setEmailError(""); return; }
    setEmailError(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? ""
        : "Please enter a valid email address (e.g. juan@email.com)."
    );
  };

  /* ── computed age (Complainant mode only) ── */
  const computedAge = useMemo(() => {
    if (!isInformant || !formData.dateOfBirth) return "";
    const today = new Date();
    const birth = new Date(formData.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 1) { setAgeError("Age must be at least 1 year old."); return "0"; }
    setAgeError("");
    return String(age);
  }, [formData.dateOfBirth, isInformant]);

  /* keep formData.age in sync */
  React.useEffect(() => {
    if (isInformant && formData.age !== computedAge) {
      setFormData((prev) => ({ ...prev, age: computedAge }));
    }
  }, [computedAge]); // eslint-disable-line

  /* ── switch mode ── */
  const switchMode = (toInformant) => {
    setFormData((prev) => ({
      ...prev,
      isInformant: toInformant,
      // clear complainant fields when switching back to Patient
      ...(!toInformant && {
        complainantName: "", complainantRelation: "",
        firstName: "", middleName: "", lastName: "",
        sex: "", dateOfBirth: "", age: "",
        contactNo: "", email: "", address: "",
      }),
    }));
    setEmailError("");
    setAgeError("");
  };

  /* ── Patient display name from useCurrentUser ── */
  const patientFullName =
    user
      ? [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ")
      : "";

  const todayStr = new Date().toISOString().split("T")[0];

  /* ───────────────────────────────────────────────────────────── */
  return (
    <div className={styles.formWrapper}>

      {/* ══ MODE TOGGLE ══ */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "24px",
        padding: "4px",
        background: "#f5f0fb",
        borderRadius: "14px",
      }}>
        {[
          { val: false, label: "🙋 I am the Patient",     sub: "Book for myself" },
          { val: true,  label: "👥 I am the Complainant", sub: "Book for someone else" },
        ].map(({ val, label, sub }) => {
          const active = isInformant === val;
          return (
            <button
              key={String(val)}
              type="button"
              onClick={() => switchMode(val)}
              style={{
                flex: 1,
                padding: "12px 10px",
                borderRadius: "10px",
                border: active ? "2px solid #4D227C" : "2px solid transparent",
                background: active ? "#fff" : "transparent",
                cursor: "pointer",
                transition: "all .18s",
                boxShadow: active ? "0 2px 10px rgba(77,34,124,0.13)" : "none",
                outline: "none",
                fontFamily: "Poppins, sans-serif",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 700, color: active ? "#4D227C" : "#7c5ea0" }}>
                {label}
              </div>
              <div style={{ fontSize: "11px", color: active ? "#7c3aed" : "#bbb", marginTop: "2px" }}>
                {sub}
              </div>
            </button>
          );
        })}
      </div>

      {/* ══ PATIENT MODE — show fetched profile ══ */}
      {!isInformant && (
        <div style={{
          marginBottom: "22px",
          padding: "16px 18px",
          background: "#f5f0fb",
          border: "2px solid #4D227C",
          borderRadius: "14px",
        }}>
          <div style={{
            fontSize: "10px", fontWeight: 700, color: "#4D227C",
            textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{
              width: "22px", height: "22px", borderRadius: "50%", background: "#4D227C",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            Patient Profile (Auto-filled)
          </div>

          {user ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <InfoRow label="Full Name"   value={patientFullName} />
              <InfoRow label="Sex"         value={user.sex} />
              <InfoRow label="Date of Birth" value={user.dob || user.dateOfBirth} />
              <InfoRow label="Age"         value={user.age ? `${user.age} yrs` : ""} />
              <InfoRow label="Contact No." value={user.contactNo || user.contact_no} />
              <InfoRow label="Email"       value={user.email} />
              <InfoRow label="Address"     value={user.address} />
              <InfoRow label="Civil Status" value={user.civilStatus || user.civil_status} />
            </div>
          ) : (
            <div style={{ fontSize: "13px", color: "#aaa", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "14px", height: "14px", borderRadius: "50%",
                border: "2px solid #4D227C", borderTop: "2px solid transparent",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }}/>
              Loading your profile…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          <div style={{
            marginTop: "12px", padding: "8px 12px",
            background: "#eef6ff", border: "1px solid #bfdbfe",
            borderRadius: "8px", fontSize: "11px", color: "#1d4ed8",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span>ℹ️</span>
            Your profile info will be used for this appointment. To update it, go to My Profile.
          </div>
        </div>
      )}

      {/* ══ COMPLAINANT MODE — manual patient fields ══ */}
      {isInformant && (
        <div style={{ marginBottom: "22px" }}>

          {/* Complainant's own info */}
          <div style={{
            padding: "14px 16px",
            background: "#faf7ff",
            border: "1.5px solid #e8d8f8",
            borderRadius: "12px",
            marginBottom: "18px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              👤 Your Info (Complainant)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Field label="Complainant Full Name" required>
                <Form.Control
                  type="text"
                  placeholder="Your full name"
                  className={styles.input}
                  value={formData.complainantName || ""}
                  onChange={(e) => handleChange("complainantName", e.target.value)}
                />
              </Field>
              <Field label="Relation to Patient" required>
                <Form.Control
                  as="select"
                  className={styles.input}
                  value={formData.complainantRelation || ""}
                  onChange={(e) => handleChange("complainantRelation", e.target.value)}
                >
                  <option value="">Select relation</option>
                  {["Parent","Spouse","Sibling","Child","Guardian","Friend","Relative","Other"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </Form.Control>
              </Field>
            </div>
          </div>

          {/* Patient's info — to be saved in patients table */}
          <div style={{
            padding: "14px 16px",
            background: "#f0fdf4",
            border: "1.5px solid #bbf7d0",
            borderRadius: "12px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#166534", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              🏥 Patient Information (will be saved to records)
            </div>

            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <Field label="First Name" required>
                <Form.Control
                  type="text"
                  placeholder="First name"
                  className={styles.input}
                  value={formData.firstName || ""}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
              </Field>
              <Field label="Middle Name">
                <Form.Control
                  type="text"
                  placeholder="Middle name"
                  className={styles.input}
                  value={formData.middleName || ""}
                  onChange={(e) => handleChange("middleName", e.target.value)}
                />
              </Field>
              <Field label="Last Name" required>
                <Form.Control
                  type="text"
                  placeholder="Last name"
                  className={styles.input}
                  value={formData.lastName || ""}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </Field>
            </div>

            {/* Sex + DOB + Age row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <Field label="Sex" required>
                <Form.Control
                  as="select"
                  className={styles.input}
                  value={formData.sex || ""}
                  onChange={(e) => handleChange("sex", e.target.value)}
                >
                  <option value="">Select sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Form.Control>
              </Field>
              <Field label="Date of Birth" error={ageError}>
                <Form.Control
                  type="date"
                  className={styles.input}
                  max={todayStr}
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </Field>
              <Field label="Age">
                <Form.Control
                  type="text"
                  className={styles.input}
                  value={computedAge}
                  readOnly
                  style={{ background: "#f0fdf4", color: "#166534", fontWeight: 600 }}
                />
              </Field>
            </div>

            {/* Civil Status + Classification */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <Field label="Civil Status">
                <Form.Control
                  as="select"
                  className={styles.input}
                  value={formData.civilStatus || ""}
                  onChange={(e) => handleChange("civilStatus", e.target.value)}
                >
                  <option value="">Select status</option>
                  {["Single","Married","Widowed","Divorced","Separated"].map(s => (
                    <option key={s} value={s.toLowerCase()}>{s}</option>
                  ))}
                </Form.Control>
              </Field>
              <Field label="Classification">
                <Form.Control
                  as="select"
                  className={styles.input}
                  value={formData.patientClassification || "Regular"}
                  onChange={(e) => handleChange("patientClassification", e.target.value)}
                >
                  <option value="Regular">Regular</option>
                  <option value="PWD">PWD</option>
                  <option value="Senior Citizen">Senior Citizen</option>
                </Form.Control>
              </Field>
            </div>

            {/* Contact + Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <Field label="Contact No." required>
                <Form.Control
                  type="text"
                  placeholder="09XX XXX XXXX"
                  className={styles.input}
                  value={formData.contactNo || ""}
                  onChange={(e) => handleChange("contactNo", e.target.value)}
                />
              </Field>
              <Field label="Email" error={emailError}>
                <Form.Control
                  type="email"
                  placeholder="patient@email.com"
                  className={styles.input}
                  value={formData.email || ""}
                  onChange={(e) => handleEmailChange(e.target.value)}
                />
              </Field>
            </div>

            {/* Address */}
            <Field label="Address">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Full address"
                className={styles.textarea}
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {/* ══ REASON FOR CONSULTATION ══ */}
      <Field label="Reason for Consultation" required>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Briefly describe your concern."
          className={styles.textarea}
          value={formData.reason || ""}
          onChange={(e) => handleChange("reason", e.target.value)}
        />
      </Field>

      {/* ══ DECLARATION ══ */}
      <div className={styles.acknowledgementRow}>
        <input
          type="radio"
          className={styles.radioInput}
          checked={declarationAgreed}
          onChange={() => onOpenDeclaration()}
        />
        <span>
          {" "}I acknowledge and agree on the{" "}
          <button type="button" className={styles.policyLink} onClick={onOpenDeclaration}>
            Declaration of Participation
          </button>
          <span className={styles.requiredStar}>*</span>
        </span>
      </div>
    </div>
  );
};

export default VerifyProfileForm;
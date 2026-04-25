import React, { useState, useMemo, useEffect } from "react";
import { Form } from "react-bootstrap";
import styles from "../../../ClientStyle/VerifyProfileForm.module.css";
import FormHeader from "../../AppointmentComponents/FormHeader";
import { useCurrentUser } from "../../../../hooks/userCurrentUser";

const VerifyProfileForm = ({
  formData = {},
  setFormData = () => {},
  declarationAgreed = false,
  onOpenDeclaration = () => {},
}) => {
  const rawUser = useCurrentUser();

  const [emailError, setEmailError] = useState("");
  const [ageError, setAgeError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  // ─────────────────────────────────────────────
  // ✅ FIX: Normalize REAL backend user → UI user
  // ─────────────────────────────────────────────
  const user = useMemo(() => {
    if (!rawUser) return null;

    return {
      id: rawUser.id,
      firstName: rawUser.firstName,
      lastName: rawUser.lastName,
      middleInitial: rawUser.middleInitial,

      fullName:
        `${rawUser.firstName || ""} ${rawUser.middleInitial || ""} ${rawUser.lastName || ""}`.trim(),

      initials: (rawUser.firstName?.[0] || "") + (rawUser.lastName?.[0] || ""),

      dob: rawUser.dob,
      sex: rawUser.sex,
      genderIdentity: rawUser.genderIdentity,
      civilStatus: rawUser.civilStatus,

      contactNo: rawUser.contactNo,
      email: rawUser.email,

      address: rawUser.address, // backend field
      homeAddress: rawUser.address, // UI alias

      profilePicture: rawUser.profilePicture,
    };
  }, [rawUser]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (value) => {
    if (!value) return setEmailError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(
      emailRegex.test(value)
        ? ""
        : "Please enter a valid email address (e.g. juan@email.com)",
    );
  };

  const handleEmailChange = (value) => {
    handleChange("email", value);
    validateEmail(value);
  };

  const { isInformant = false, reason = "", dateOfBirth = "" } = formData;

  // ─────────────────────────────────────────────
  // Age calculation for Complainant mode
  // ─────────────────────────────────────────────
  const computedAge = useMemo(() => {
    if (!isInformant || !dateOfBirth) return "";

    const today = new Date();
    const birth = new Date(dateOfBirth);

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

    if (age < 1) {
      setAgeError("Age must be at least 1 year old.");
      return "0";
    }

    setAgeError("");
    return String(age);
  }, [dateOfBirth, isInformant]);

  useEffect(() => {
    if (formData.age !== computedAge) {
      setFormData((prev) => ({ ...prev, age: computedAge }));
    }
  }, [computedAge]); // eslint-disable-line

  // ─────────────────────────────────────────────
  // ✅ IMPORTANT: WAIT FOR USER DATA
  // ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className={styles.formWrapper}>
        <div style={{ padding: "20px", color: "#888" }}>
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formWrapper}>
      {/* ── HEADER (REAL USER NOW PASSED) ── */}
      <FormHeader
        isInformant={isInformant}
        onToggle={(value) =>
          setFormData((prev) => ({
            ...prev,
            isInformant: value,

            // reset fields when switching back to Patient
            ...(!value && {
              complainantName: "",
              complainantRelation: "",
              firstName: "",
              middleName: "",
              lastName: "",
              sex: "",
              dateOfBirth: "",
              age: "",
              contactNo: "",
              email: "",
              address: "",
            }),
          }))
        }
        user={user} // ✅ REAL DATA FIXED
        patientForm={formData}
        setPatientForm={setFormData}
      />

      {/* ── REASON ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Reason for Consultation <span className={styles.requiredStar}>*</span>
        </label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Briefly describe your concern."
          className={styles.textarea}
          value={reason}
          onChange={(e) => handleChange("reason", e.target.value)}
        />
      </div>

      {/* ── ERRORS ── */}
      {isInformant && (
        <>
          {ageError && <div className={styles.fieldErrorMsg}>{ageError}</div>}
          {emailError && (
            <div className={styles.fieldErrorMsg}>{emailError}</div>
          )}
        </>
      )}

      {/* ── DECLARATION ── */}
      <div className={styles.acknowledgementRow}>
        <input
          type="radio"
          className={styles.radioInput}
          checked={declarationAgreed}
          onChange={onOpenDeclaration}
        />
        <span>
          I acknowledge and agree on the{" "}
          <button
            type="button"
            className={styles.policyLink}
            onClick={onOpenDeclaration}
          >
            Declaration of Participation
          </button>
          <span className={styles.requiredStar}>*</span>
        </span>
      </div>
    </div>
  );
};

export default VerifyProfileForm;

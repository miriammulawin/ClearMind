import React, { useState, useMemo, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { IoMdArrowDropdown } from 'react-icons/io';
import styles from '../../../ClientStyle/VerifyProfileForm.module.css';
import FormHeader from '../../AppointmentComponents/FormHeader';
import { useCurrentUser } from '../../../../hooks/userCurrentUser';

/* -----------------------------------------------------------------
   VerifyProfileForm
   Props:
     formData    — shared form state
     setFormData — setter

   NOTE: user is fetched internally via useCurrentUser()
         exactly like PAaEReason does — no need to pass it as a prop
------------------------------------------------------------------ */
const VerifyProfileForm = ({ formData = {}, setFormData = () => {} }) => {

  // ── Same pattern as PAaEReason ─────────────────────────────────
  const user = useCurrentUser();

  const [emailError, setEmailError] = useState('');
  const [ageError,   setAgeError]   = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (value) => {
    if (!value) { setEmailError(''); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(
      emailRegex.test(value)
        ? ''
        : 'Please enter a valid email address (e.g. juan@email.com).'
    );
  };

  const handleEmailChange = (value) => {
    handleChange('email', value);
    validateEmail(value);
  };

  const {
    isInformant    = false,
    reason         = '',
    dateOfBirth    = '',
  } = formData;

  // Age computed only in Complainant mode
  // (Patient mode uses user.age from useCurrentUser)
  const computedAge = useMemo(() => {
    if (!isInformant || !dateOfBirth) return '';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 1) { setAgeError('Age must be at least 1 year old.'); return '0'; }
    setAgeError('');
    return age >= 0 ? String(age) : '';
  }, [dateOfBirth, isInformant]);

  useEffect(() => {
    if (formData.age !== computedAge) {
      setFormData(prev => ({ ...prev, age: computedAge }));
    }
  }, [computedAge]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.formWrapper}>

      {/* ── Required notice + Toggle + Pre-loaded card OR Complainant fields ──
          Same pattern as PAaEReason's FormHeader usage:
          • "I am the Patient"     → pre-loaded profile card from useCurrentUser
          • "I am the Complainant" → manual patient info fields
      ── */}
      <FormHeader
        isInformant={isInformant}
        onToggle={(value) => setFormData(prev => ({
          ...prev,
          isInformant: value,
          // Clear manual fields when switching back to Patient
          ...(!value && {
            complainantName:     '',
            complainantRelation: '',
            firstName:           '',
            middleName:          '',
            lastName:            '',
            sex:                 '',
            dateOfBirth:         '',
            age:                 '',
            contactNo:           '',
            email:               '',
            address:             '',
          }),
        }))}
        user={user}
        patientForm={formData}
        setPatientForm={setFormData}
      />

      {/* ── Reason for Consultation ── */}
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
          onChange={e => handleChange('reason', e.target.value)}
        />
      </div>

      {/* ── Errors (Complainant mode only) ── */}
      {isInformant && (
        <>
          {ageError && (
            <div className={styles.fieldErrorMsg}>
              <svg className={styles.fieldErrorIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
              </svg>
              {ageError}
            </div>
          )}
          {emailError && (
            <div className={styles.fieldErrorMsg}>
              <svg className={styles.fieldErrorIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
              </svg>
              {emailError}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default VerifyProfileForm;
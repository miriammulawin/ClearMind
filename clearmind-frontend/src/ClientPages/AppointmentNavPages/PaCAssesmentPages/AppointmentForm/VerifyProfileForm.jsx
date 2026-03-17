import React, { useState, useMemo, useEffect } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { IoMdArrowDropdown } from 'react-icons/io';
import styles from '../../../ClientStyle/VerifyProfileForm.module.css';

const VerifyProfileForm = ({ formData = {}, setFormData = () => {} }) => {

  const [emailError, setEmailError] = useState('');
  const [ageError,   setAgeError]   = useState('');

  // Today's date in YYYY-MM-DD — used as max for date of birth
  const todayStr = new Date().toISOString().split('T')[0];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateEmail = (value) => {
    if (!value) {
      setEmailError('');
      return;
    }
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
    isInformant       = false,
    informantName     = '',
    informantRelation = '',
    reason            = '',
    patientType       = 'New Patient',
    classification    = 'Regular',
    firstName         = '',
    middleName        = '',
    lastName          = '',
    dateOfBirth       = '',
    contactNo         = '',
    email             = '',
    sex               = '',
    address           = '',
  } = formData;

  const computedAge = useMemo(() => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 1) {
      setAgeError('Age must be at least 1 year old.');
      return '0';
    }
    setAgeError('');
    return age >= 0 ? String(age) : '';
  }, [dateOfBirth]);

  // sync computed age into formData — guard against infinite loop
  useEffect(() => {
    if (formData.age !== computedAge) {
      setFormData(prev => ({ ...prev, age: computedAge }));
    }
  }, [computedAge]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.formWrapper}>

      {/* ── Required notice ── */}
      <div className={styles.requiredNotice}>
        Fields with mark <span className={styles.requiredStar}>*</span> are required
      </div>

      {/* ── Who is filling this form? ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          You are filling this form as: <span className={styles.requiredStar}>*</span>
        </label>
        <div className={styles.informantToggleRow}>
          {[
            { value: false, label: 'I am the Patient'   },
            { value: true,  label: 'I am the Informant' },
          ].map(opt => (
            <button
              key={String(opt.value)}
              type="button"
              className={`${styles.informantToggleBtn} ${isInformant === opt.value ? styles.informantToggleBtnActive : ''}`}
              onClick={() => handleChange('isInformant', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Informant fields — required when I am the Informant ── */}
      {isInformant === true && (
        <div className={styles.informantCard}>
          <div className={styles.informantCardTitle}>Informant Details</div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Full Name of Informant <span className={styles.requiredStar}>*</span>
            </label>
            <Form.Control
              type="text"
              placeholder="Full Name"
              className={styles.input}
              value={informantName}
              onChange={e => handleChange('informantName', e.target.value)}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Relation to the Client <span className={styles.requiredStar}>*</span>
            </label>
            <Form.Control
              type="text"
              placeholder="e.g. Parent, Spouse, Sibling"
              className={styles.input}
              value={informantRelation}
              onChange={e => handleChange('informantRelation', e.target.value)}
            />
          </div>
        </div>
      )}

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

      {/* ── Patient's Profile ── */}
      <div className={styles.sectionHeading}>Patient's Profile</div>

      {/* Patient Type */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Patient Type <span className={styles.requiredStar}>*</span>
        </label>
        <div className={styles.radioRow}>
          {['Existing Patient', 'New Patient'].map(type => (
            <label key={type} className={styles.radioLabel}>
              <input
                type="radio"
                name="patientType"
                value={type}
                checked={patientType === type}
                onChange={() => handleChange('patientType', type)}
                className={styles.radioInput}
              />
              <span className={styles.radioCustom} />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Patient Classification */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Patient Classification <span className={styles.requiredStar}>*</span>
        </label>
        <div className={styles.radioRow}>
          {['PWD', 'Senior Citizen', 'Regular'].map(cls => (
            <label key={cls} className={styles.radioLabel}>
              <input
                type="radio"
                name="classification"
                value={cls}
                checked={classification === cls}
                onChange={() => handleChange('classification', cls)}
                className={styles.radioInput}
              />
              <span className={styles.radioCustom} />
              {cls}
            </label>
          ))}
        </div>
      </div>

      {/* First + Middle Name */}
      <Row className={styles.nameRow}>
        <Col xs={6} className={styles.nameCol}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              First Name <span className={styles.requiredStar}>*</span>
            </label>
            <Form.Control
              type="text"
              placeholder="Juan"
              className={styles.input}
              value={firstName}
              onChange={e => handleChange('firstName', e.target.value)}
            />
          </div>
        </Col>
        <Col xs={6} className={styles.nameCol}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Middle Name</label>
            <Form.Control
              type="text"
              placeholder=""
              className={styles.input}
              value={middleName}
              onChange={e => handleChange('middleName', e.target.value)}
            />
          </div>
        </Col>
      </Row>

      {/* Last Name */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Last Name <span className={styles.requiredStar}>*</span>
        </label>
        <Form.Control
          type="text"
          placeholder="Dela Cruz"
          className={styles.input}
          value={lastName}
          onChange={e => handleChange('lastName', e.target.value)}
        />
      </div>

      {/* Sex */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Sex <span className={styles.requiredStar}>*</span>
        </label>
        <div className={styles.selectWrapper}>
          <Form.Select
            className={styles.input}
            value={sex}
            onChange={e => handleChange('sex', e.target.value)}
          >
            <option value="">Select sex</option>
            <option value="FEMALE">Female</option>
            <option value="MALE">Male</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </Form.Select>
          <IoMdArrowDropdown className={styles.selectArrow} />
        </div>
      </div>

      {/* DOB + Age + Contact — 3 col */}
      <Row className={styles.nameRow}>
        <Col xs={5} className={styles.nameCol}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Date of Birth <span className={styles.requiredStar}>*</span>
            </label>
            <Form.Control
              type="date"
              className={`${styles.input} ${ageError ? styles.inputError : ''}`}
              value={dateOfBirth}
              max={todayStr}
              onChange={e => handleChange('dateOfBirth', e.target.value)}
            />
          </div>
        </Col>
        <Col xs={2} className={styles.nameCol}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Age</label>
            <Form.Control
              type="text"
              className={`${styles.input} ${styles.inputReadOnly} ${ageError ? styles.inputError : ''}`}
              value={computedAge}
              readOnly
              tabIndex={-1}
              placeholder="—"
            />
          </div>
        </Col>
        <Col xs={5} className={styles.nameCol}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Contact No. <span className={styles.requiredStar}>*</span>
            </label>
            <Form.Control
              type="tel"
              placeholder="+63"
              className={styles.input}
              value={contactNo}
              onChange={e => handleChange('contactNo', e.target.value)}
            />
          </div>
        </Col>
      </Row>

      {/* ── Age Error ── */}
      {ageError && (
        <div className={styles.fieldErrorMsg}>
          <svg className={styles.fieldErrorIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
          </svg>
          {ageError}
        </div>
      )}

      {/* Email */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Email <span className={styles.requiredStar}>*</span>
        </label>
        <Form.Control
          type="email"
          placeholder="Email"
          className={`${styles.input} ${emailError ? styles.inputError : ''}`}
          value={email}
          onChange={e => handleEmailChange(e.target.value)}
          onBlur={e => validateEmail(e.target.value)}
        />
        {emailError && (
          <div className={styles.fieldErrorMsg}>
            <svg className={styles.fieldErrorIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
            </svg>
            {emailError}
          </div>
        )}
      </div>

      {/* Address */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Address <span className={styles.requiredStar}>*</span>
        </label>
        <Form.Control
          type="text"
          placeholder="Home Address"
          className={styles.input}
          value={address}
          onChange={e => handleChange('address', e.target.value)}
        />
      </div>

    </div>
  );
};

export default VerifyProfileForm;
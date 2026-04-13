import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiChevronDown } from "react-icons/fi";
import styles from "./Registration.module.css";
import logo_login from "./assets/CMPS_Logo.png";
import axiosClient from "./axiosClient";
import { Toaster, toast } from "react-hot-toast";
import TermsModal from "./components/TermsModal";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [pronounOther, setPronounOther] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTerms, setShowTerms] = useState(false);
  const [serverError, setServerError] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    dob: "",
    sex: "",
    genderIdentity: "",
    preferredPronoun: "",
    contact: "",
    civilStatus: "",
    patientClassification: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.middleInitial.trim())
      newErrors.middleInitial = "Middle initial is required";
    if (!form.dob) newErrors.dob = "Date of birth is required";
    if (!form.sex) newErrors.sex = "Sex is required";

    if (!form.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!/^09\d{9}$/.test(form.contact)) {
      newErrors.contact =
        "Contact number must start with 09 and be exactly 11 digits";
    }

    if (!form.civilStatus) newErrors.civilStatus = "Civil status is required";

    if (!form.patientClassification)
      newErrors.patientClassification = "Patient classification is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/.test(form.password)
    ) {
      newErrors.password =
        "Password must be at least 6 characters, include 1 uppercase letter, 1 number, and 1 special character";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreed)
      newErrors.agreeTerms = "You must agree to the Terms and Condition";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getConsolidatedError = () => {
    if (serverError) return serverError;

    const entries = Object.entries(errors);
    const hasRequiredError = entries.some(([, val]) =>
      val?.toLowerCase().includes("required"),
    );
    if (hasRequiredError) return "All fields are required to fill out";

    const otherErrors = entries
      .filter(([key, val]) => key !== "agreeTerms" && val)
      .map(([, val]) => val);
    if (otherErrors.length > 0) return otherErrors[0];

    if (errors.agreeTerms) return errors.agreeTerms;

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await axiosClient.post("/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        middleInitial: form.middleInitial,
        dob: form.dob,
        sex: form.sex,
        genderIdentity: form.genderIdentity,
        preferredPronoun: form.preferredPronoun,
        customPronoun: form.preferredPronoun === "other" ? pronounOther : null,
        contactNo: form.contact,
        civilStatus: form.civilStatus,
        patientClassification: form.patientClassification,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
        address: form.address,
      });
      const data = response.data;
      if (data.success) {
        localStorage.setItem("pendingEmail", form.email);

        toast.success(
          "Registration successful! Check your email for the OTP code.",
          {
            duration: 2000,
            position: "top-center",
            style: {
              background: "#E2F7E3",
              border: "1px solid #91C793",
              color: "#2E7D32",
              fontWeight: 600,
              fontSize: "1rem",
              textAlign: "center",
              maxWidth: "360px",
              margin: "0 auto",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
            },
            iconTheme: { primary: "#2E7D32", secondary: "#E2F7E3" },
          },
        );

        setTimeout(() => navigate("/verify-otp"), 2000);
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const e = err.response.data.errors || {};
        setErrors({
          ...(e.firstName && { firstName: e.firstName[0] }),
          ...(e.lastName && { lastName: e.lastName[0] }),
          ...(e.middleInitial && { middleInitial: e.middleInitial[0] }),
          ...(e.dob && { dob: e.dob[0] }),
          ...(e.sex && { sex: e.sex[0] }),
          ...(e.contactNo && { contact: e.contactNo[0] }),
          ...(e.civilStatus && { civilStatus: e.civilStatus[0] }),
          ...(e.patientClassification && {
            patientClassification: e.patientClassification[0],
          }),
          ...(e.email && { email: e.email[0] }),
          ...(e.password && { password: e.password[0] }),
          ...(e.address && { address: e.address[0] }),
        });
        setServerError(null);
      } else {
        setServerError(
          err.response?.data?.message ||
            "Server error. Please try again later.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const consolidatedError = getConsolidatedError();

  return (
    <>
      <Toaster />
      <TermsModal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={() => {
          setAgreed(true);
          if (errors.agreeTerms)
            setErrors((prev) => ({ ...prev, agreeTerms: "" }));
        }}
      />

      <div className={styles.page}>
        <div className={styles.containerSplit}>
          {/* ── LEFT PANEL ── */}
          <div className={styles.leftPanel}>
            <div className={styles.leftOverlay} />

            <div
              className={styles.leftDeco}
              style={{
                width: 110,
                height: 110,
                background: "rgba(216, 168, 255, 0.13)",
                top: 24,
                right: -28,
              }}
            />
            <div
              className={styles.leftDeco}
              style={{
                width: 60,
                height: 60,
                background: "rgba(255, 200, 240, 0.1)",
                top: 110,
                left: 18,
              }}
            />
            <div
              className={styles.leftDeco}
              style={{
                width: 36,
                height: 36,
                border: "1.5px solid rgba(255,255,255,0.12)",
                background: "transparent",
                top: 175,
                right: 38,
              }}
            />

            <svg
              className={styles.leftSparkle}
              style={{ top: 60, left: 55 }}
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M9 1v4M9 13v4M1 9h4M13 9h4"
                stroke="rgba(255,255,255,0.32)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <circle cx="9" cy="9" r="2" fill="rgba(216,168,255,0.55)" />
            </svg>
            <svg
              className={styles.leftSparkle}
              style={{ top: 195, right: 28 }}
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                d="M7 1v3M7 10v3M1 7h3M10 7h3"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
              <circle cx="7" cy="7" r="1.5" fill="rgba(255,200,240,0.6)" />
            </svg>
            <svg
              className={styles.leftSparkle}
              style={{ top: 148, right: 78 }}
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
            >
              <circle cx="5" cy="5" r="2.5" fill="rgba(255,255,255,0.18)" />
            </svg>
            <svg
              className={styles.leftSparkle}
              style={{ top: 82, right: 52 }}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8 13.5S2 9.5 2 5.5A3.5 3.5 0 018 3a3.5 3.5 0 016 2.5C14 9.5 8 13.5 8 13.5z"
                fill="rgba(232,165,255,0.45)"
              />
            </svg>
            <svg
              className={styles.leftSparkle}
              style={{ top: 235, left: 28 }}
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M6 10.5S1 7.2 1 4.2A2.6 2.6 0 016 2.2a2.6 2.6 0 015 2C11 7.2 6 10.5 6 10.5z"
                fill="rgba(255,200,240,0.38)"
              />
            </svg>

            <div className={styles.leftContent}>
              <span className={styles.tagline}>
                <span className={styles.taglineDot} />
                Mental Wellness Care
              </span>
              <h1 className={styles.heroTitle}>
                Welcome To <span className={styles.heroAccent}>ClearMind</span>{" "}
                Psychological Services
              </h1>
              <p className={styles.heroDesc}>
                Begin your journey toward emotional wellness and a clearer mind.
                We provide compassionate, professional care in a safe and
                confidential environment.
              </p>
              <div className={styles.pillRow}>
                <span className={styles.pill}>
                  <span className={styles.pillDot} />
                  Safe &amp; Confidential
                </span>
                <span className={styles.pill}>
                  <span className={styles.pillDot} />
                  Compassionate Care
                </span>
                <span className={styles.pill}>
                  <span className={styles.pillDot} />
                  Free to Register
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL (FORM) ── */}
          <div className={styles.card}>
            <img
              src={logo_login}
              alt="ClearMind Logo"
              className={styles.logo}
            />
            <p className={styles.formSubtitle}>
              Fill in your details to get started
            </p>

            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              {/* ── PERSONAL INFORMATION ── */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.sectionLabel}>
                  Personal Information
                </legend>

                <div className={styles.formRow}>
                  <div className={styles.formCol}>
                    <input
                      type="text"
                      name="firstName"
                      className={`form-control ${styles.input} ${errors.firstName ? styles.inputError : ""}`}
                      placeholder="First Name *"
                      value={form.firstName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formCol}>
                    <input
                      type="text"
                      name="lastName"
                      className={`form-control ${styles.input} ${errors.lastName ? styles.inputError : ""}`}
                      placeholder="Last Name *"
                      value={form.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formCol}>
                    <input
                      type="text"
                      name="middleInitial"
                      className={`form-control ${styles.input} ${errors.middleInitial ? styles.inputError : ""}`}
                      placeholder="Middle Initial *"
                      value={form.middleInitial}
                      onChange={handleChange}
                      maxLength={1}
                    />
                  </div>
                  <div className={styles.formCol}>
                    <input
                      type="date"
                      name="dob"
                      className={`form-control ${styles.input} ${errors.dob ? styles.inputError : ""}`}
                      value={form.dob}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formCol}>
                    <div className={styles.selectWrap}>
                      <select
                        name="sex"
                        className={`form-select ${styles.input} ${styles.select} ${errors.sex ? styles.inputError : ""}`}
                        value={form.sex}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Sex *
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <FiChevronDown className={styles.selectArrow} />
                    </div>
                  </div>
                  <div className={styles.formCol}>
                    <div className={styles.selectWrap}>
                      <select
                        name="genderIdentity"
                        className={`form-select ${styles.input} ${styles.select}`}
                        value={form.genderIdentity}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Gender Identity
                        </option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="transgender">Transgender</option>
                        <option value="trans_woman">Trans Woman</option>
                        <option value="trans_man">Trans Man</option>
                        <option value="non_binary">Non-Binary</option>
                        <option value="genderqueer">Genderqueer</option>
                        <option value="gender_fluid">Gender Fluid</option>
                        <option value="agender">Agender</option>
                        <option value="bigender">Bigender</option>
                        <option value="two_spirit">Two-Spirit</option>
                        <option value="intersex">Intersex</option>
                        <option value="pangender">Pangender</option>
                        <option value="prefer_not">Prefer Not to Say</option>
                      </select>
                      <FiChevronDown className={styles.selectArrow} />
                    </div>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formCol}>
                    <div className={styles.selectWrap}>
                      <select
                        name="preferredPronoun"
                        className={`form-select ${styles.input} ${styles.select}`}
                        value={form.preferredPronoun}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Preferred Pronoun/s
                        </option>
                        <option value="he_him">He/Him</option>
                        <option value="she_her">She/Her</option>
                        <option value="they_them">They/Them</option>
                        <option value="other">Other (specify)</option>
                      </select>
                      <FiChevronDown className={styles.selectArrow} />
                    </div>
                  </div>
                  {form.preferredPronoun === "other" && (
                    <div className={styles.formCol}>
                      <input
                        type="text"
                        className={`form-control ${styles.input}`}
                        placeholder="Specify pronoun/s *"
                        value={pronounOther}
                        onChange={(e) => setPronounOther(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* ── CIVIL STATUS & PATIENT CLASSIFICATION ── */}
                <div className={styles.formRow}>
                  <div className={styles.formCol}>
                    <div className={styles.selectWrap}>
                      <select
                        name="civilStatus"
                        className={`form-select ${styles.input} ${styles.select} ${errors.civilStatus ? styles.inputError : ""}`}
                        value={form.civilStatus}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Civil Status *
                        </option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="widowed">Widowed</option>
                        <option value="divorced">Divorced</option>
                        <option value="separated">Separated</option>
                      </select>
                      <FiChevronDown className={styles.selectArrow} />
                    </div>
                  </div>
                  <div className={styles.formCol}>
                    <div className={styles.selectWrap}>
                      <select
                        name="patientClassification"
                        className={`form-select ${styles.input} ${styles.select} ${errors.patientClassification ? styles.inputError : ""}`}
                        value={form.patientClassification}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Patient Classification *
                        </option>
                        <option value="PWD">PWD</option>
                        <option value="Senior Citizen">Senior Citizen</option>
                        <option value="Solo Parent">Solo Parent</option>
                      </select>
                      <FiChevronDown className={styles.selectArrow} />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* ── CONTACT INFORMATION ── */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.sectionLabel}>
                  Contact Information
                </legend>
                <div className={styles.formRow}>
                  <div className={styles.formCol}>
                    <input
                      type="tel"
                      name="contact"
                      className={`form-control ${styles.input} ${errors.contact ? styles.inputError : ""}`}
                      placeholder="Contact No. *"
                      value={form.contact}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formCol}>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${styles.input} ${errors.email ? styles.inputError : ""}`}
                      placeholder="Email Address *"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formCol} style={{ width: "100%" }}>
                    <input
                      type="text"
                      name="address"
                      className={`form-control ${styles.input} ${errors.address ? styles.inputError : ""}`}
                      placeholder="Address *"
                      value={form.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </fieldset>

              {/* ── SECURITY ── */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.sectionLabel}>Security</legend>
                <div className={styles.formRow}>
                  <div className={styles.formCol}>
                    <div className={styles.pwInner}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`form-control ${styles.input} ${styles.pwInput} ${errors.password ? styles.inputError : ""}`}
                        placeholder="Password *"
                        value={form.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        tabIndex={-1}
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <FiEye /> : <FiEyeOff />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.formCol}>
                    <div className={styles.pwInner}>
                      <input
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        className={`form-control ${styles.input} ${styles.pwInput} ${errors.confirmPassword ? styles.inputError : ""}`}
                        placeholder="Confirm Password *"
                        value={form.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        tabIndex={-1}
                        onClick={() => setShowConfirm((p) => !p)}
                        aria-label={
                          showConfirm ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirm ? <FiEye /> : <FiEyeOff />}
                      </button>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* ── FOOTER ── */}
              <div className={styles.footer}>
                <div className={styles.checkGroup}>
                  <input
                    type="checkbox"
                    id="terms"
                    className={`form-check-input ${styles.checkbox}`}
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (errors.agreeTerms)
                        setErrors((prev) => ({ ...prev, agreeTerms: "" }));
                    }}
                  />
                  <label
                    htmlFor="terms"
                    className={`form-check-label ${styles.checkLabel}`}
                  >
                    I agree to the{" "}
                    <span
                      className={styles.termsLink}
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTerms(true);
                      }}
                    >
                      Terms and Conditions
                    </span>{" "}
                    <span style={{ color: "#e53e3e" }}>*</span>
                  </label>
                </div>

                {/* ── CONSOLIDATED ERROR MESSAGE ── */}
                {consolidatedError && (
                  <div className="text-danger d-block text-center mt-1">
                    {consolidatedError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`btn ${styles.submitBtn}`}
                >
                  {loading ? "Registering..." : "REGISTER"}
                </button>

                <p className={styles.loginLink}>
                  Already have an account?{" "}
                  <span
                    className={styles.loginLinkBold}
                    onClick={() => navigate("/")}
                  >
                    Log In
                  </span>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;

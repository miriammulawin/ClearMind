import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import styles from "./Registration.module.css";
import logo_login from "./assets/CMPS_Logo.png";
import axiosClient from "./axiosClient";
import toast from "react-hot-toast";
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

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    dob: "",
    sex: "",
    genderIdentity: "",
    preferredPronoun: "",
    contact: "",
    civilStatus: "", // ✅ NEW
    patientType: "", // ✅ NEW
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.middleInitial.trim())
      newErrors.middleInitial = "Middle initial is required";
    if (!form.dob) newErrors.dob = "Date of birth is required";
    if (!form.sex) newErrors.sex = "Sex is required";
    if (!form.contact.trim()) newErrors.contact = "Contact number is required";
    if (!form.civilStatus) newErrors.civilStatus = "Civil status is required";
    if (!form.patientType) newErrors.patientType = "Patient type is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!agreed) newErrors.agreeTerms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        patientType: form.patientType,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
      });

      const data = response.data;

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("role", data.data.user.role);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        toast.success("Registration Successful!", {
          duration: 1500,
          style: {
            background: "#E2F7E3",
            border: "1px solid #91C793",
            color: "#2E7D32",
            fontWeight: 600,
            fontSize: "0.95rem",
            textAlign: "center",
            maxWidth: "320px",
            borderRadius: "10px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
          },
          iconTheme: { primary: "#2E7D32", secondary: "#E2F7E3" },
        });

        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 422) {
          const laravelErrors = err.response.data.errors || {};
          const mapped = {};
          if (laravelErrors.firstName)
            mapped.firstName = laravelErrors.firstName[0];
          if (laravelErrors.lastName)
            mapped.lastName = laravelErrors.lastName[0];
          if (laravelErrors.middleInitial)
            mapped.middleInitial = laravelErrors.middleInitial[0];
          if (laravelErrors.dob) mapped.dob = laravelErrors.dob[0];
          if (laravelErrors.sex) mapped.sex = laravelErrors.sex[0];
          if (laravelErrors.contactNo)
            mapped.contact = laravelErrors.contactNo[0];
          if (laravelErrors.email) mapped.email = laravelErrors.email[0];
          if (laravelErrors.password)
            mapped.password = laravelErrors.password[0];
          setErrors(mapped);
        } else {
          toast.error(err.response.data?.message || "Registration failed.");
        }
      } else {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── small helper: field error message ── */
  const ErrMsg = ({ field }) =>
    errors[field] ? <div className={styles.errMsg}>{errors[field]}</div> : null;

  return (
    <>
      {/* ── TERMS MODAL ── */}
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
        <div className={styles.card}>
          {/* ── LEFT PANEL ── */}
          <div className={styles.leftPanel}>
            <div className={styles.leftOverlay} />
            <div className={styles.leftContent}>
              <span className={styles.tagline}>● Mental Wellness Care</span>
              <h1 className={styles.heroTitle}>
                Welcome To <span className={styles.heroAccent}>ClearMind</span>{" "}
                Psychological Services
              </h1>
              <p className={styles.heroDesc}>
                Begin your journey toward emotional wellness and a clearer mind.
                We provide compassionate, professional care in a safe and
                confidential environment.
              </p>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className={styles.rightPanel}>
            {/* Logo */}
            <div className="text-center mb-1">
              <img
                src={logo_login}
                alt="ClearMind Logo"
                className={styles.logo}
              />
            </div>

            <p className={styles.formSubtitle}>
              Fill in your details to get started
            </p>

            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              {/* ── Personal Information ── */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.sectionLabel}>
                  Personal Information
                </legend>

                {/* First & Last Name */}
                <div className={styles.formRow}>
                  <div className={styles.formCol}>
                    <input
                      type="text"
                      name="firstName"
                      className={`form-control ${styles.input} ${errors.firstName ? styles.inputError : ""}`}
                      placeholder="First Name *"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                    />
                    <ErrMsg field="firstName" />
                  </div>
                  <div className={styles.formCol}>
                    <input
                      type="text"
                      name="lastName"
                      className={`form-control ${styles.input} ${errors.lastName ? styles.inputError : ""}`}
                      placeholder="Last Name *"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                    />
                    <ErrMsg field="lastName" />
                  </div>
                </div>

                {/* Middle Initial & DOB */}
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
                      required
                    />
                    <ErrMsg field="middleInitial" />
                  </div>
                  <div className={styles.formCol}>
                    <input
                      type="date"
                      name="dob"
                      className={`form-control ${styles.input} ${errors.dob ? styles.inputError : ""}`}
                      value={form.dob}
                      onChange={handleChange}
                      required
                    />
                    <ErrMsg field="dob" />
                  </div>
                </div>

                {/* Sex & Gender Identity */}
                <div className={styles.formRow}>
                  <div className={styles.formCol}>
                    <div className={styles.selectWrap}>
                      <select
                        name="sex"
                        className={`form-select ${styles.input} ${styles.select} ${errors.sex ? styles.inputError : ""}`}
                        value={form.sex}
                        onChange={handleChange}
                        required
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
                    <ErrMsg field="sex" />
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

                {/* Preferred Pronouns & Custom */}
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
                        required
                      />
                    </div>
                  )}
                </div>
              </fieldset>

              {/* Civil Status & Patient Type */}
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <div className={styles.selectWrap}>
                    <select
                      name="civilStatus"
                      className={`form-select ${styles.input} ${styles.select} ${errors.civilStatus ? styles.inputError : ""}`}
                      value={form.civilStatus}
                      onChange={handleChange}
                      required
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
                  <ErrMsg field="civilStatus" />
                </div>

                <div className={styles.formCol}>
                  <div className={styles.selectWrap}>
                    <select
                      name="patientType"
                      className={`form-select ${styles.input} ${styles.select} ${errors.patientType ? styles.inputError : ""}`}
                      value={form.patientType}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Patient Type *
                      </option>
                      <option value="new">New</option>
                      <option value="existing">Existing</option>
                    </select>
                    <FiChevronDown className={styles.selectArrow} />
                  </div>
                  <ErrMsg field="patientType" />
                </div>
              </div>

              {/* ── Contact Information ── */}
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
                      required
                    />
                    <ErrMsg field="contact" />
                  </div>
                  <div className={styles.formCol}>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${styles.input} ${errors.email ? styles.inputError : ""}`}
                      placeholder="Email Address *"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                    <ErrMsg field="email" />
                  </div>
                </div>
              </fieldset>

              {/* ── Security ── */}
              <fieldset className={styles.fieldset}>
                <legend className={styles.sectionLabel}>Security</legend>

                {/* Password */}
                <div className={`${styles.pwWrap} ${styles.formRow}`}>
                  <div className={styles.formCol}>
                    <div className={styles.pwInner}>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`form-control ${styles.input} ${styles.pwInput} ${errors.password ? styles.inputError : ""}`}
                        placeholder="Password *"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowPassword((p) => !p)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <FiEye size={20} />
                        ) : (
                          <FiEyeOff size={20} />
                        )}
                      </button>
                    </div>
                    <ErrMsg field="password" />
                  </div>

                  {/* Confirm Password */}
                  <div className={styles.formCol}>
                    <div className={styles.pwInner}>
                      <input
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        className={`form-control ${styles.input} ${styles.pwInput} ${errors.confirmPassword ? styles.inputError : ""}`}
                        placeholder="Confirm Password *"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowConfirm((p) => !p)}
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <FiEye size={20} />
                        ) : (
                          <FiEyeOff size={20} />
                        )}
                      </button>
                    </div>
                    <ErrMsg field="confirmPassword" />
                  </div>
                </div>
              </fieldset>

              {/* ── Terms & Submit ── */}
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
                    *
                  </label>
                </div>
                {errors.agreeTerms && (
                  <div className={styles.errMsg}>{errors.agreeTerms}</div>
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

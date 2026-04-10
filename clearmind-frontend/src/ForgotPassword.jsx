import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { FaEye, FaEyeSlash, FaLock, FaCheckCircle } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import logo_login from "./assets/CMPS_Logo.png";
import styles from "./ForgotPassword.module.css";

const RULES = [
  { id: "length",  label: "At least 6 characters",     test: (v) => v.length >= 6 },
  { id: "upper",   label: "1 uppercase letter (A–Z)",   test: (v) => /[A-Z]/.test(v) },
  { id: "number",  label: "1 number (0–9)",              test: (v) => /[0-9]/.test(v) },
  { id: "special", label: "1 special character (!@#…)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const STEP_LABELS = ["Email", "Verify", "Reset"];

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep]                       = useState(1);
  const [email, setEmail]                     = useState("");
  const [otp, setOtp]                         = useState(["", "", "", ""]);
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [error, setError]                     = useState("");
  const [loading, setLoading]                 = useState(false);
  const [resendTimer, setResendTimer]         = useState(0);

  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  /* ── STEP 1 ── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim())            return showError("Please enter your email address.");
    if (!emailRegex.test(email))  return showError("Please enter a valid email address.");
    setLoading(true);
    try {
      // TODO: await axiosClient.post("/forgot-password", { email });
      await new Promise((r) => setTimeout(r, 900));
      setResendTimer(60);
      setStep(2);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to send code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 2 ── */
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 3) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs[index - 1].current?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const updated = ["", "", "", ""];
    [...pasted].forEach((ch, i) => { updated[i] = ch; });
    setOtp(updated);
    const nextEmpty = updated.findIndex((v) => !v);
    otpRefs[nextEmpty === -1 ? 3 : nextEmpty].current?.focus();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.join("").length < 4) return showError("Please enter the complete 4-digit code.");
    setLoading(true);
    try {
      // TODO: await axiosClient.post("/verify-otp", { email, otp: otp.join("") });
      await new Promise((r) => setTimeout(r, 900));
      setStep(3);
    } catch (err) {
      showError(err.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(["", "", "", ""]);
    setError("");
    setLoading(true);
    try {
      // TODO: await axiosClient.post("/forgot-password", { email });
      await new Promise((r) => setTimeout(r, 700));
      setResendTimer(60);
    } catch {
      showError("Failed to resend code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 3 ── */
  const ruleResults    = RULES.map((r) => ({ ...r, passed: r.test(newPassword) }));
  const allRulesPassed = ruleResults.every((r) => r.passed);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!allRulesPassed)                return showError("Password does not meet all requirements.");
    if (newPassword !== confirmPassword) return showError("Passwords do not match.");
    setLoading(true);
    try {
      // TODO: await axiosClient.post("/reset-password", { email, otp: otp.join(""), newPassword });
      await new Promise((r) => setTimeout(r, 900));
      setStep(4);
    } catch (err) {
      showError(err.response?.data?.message || "Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepMeta = {
    1: { title: "Forgot Password?",    subtitle: "Enter your email and we'll send you a reset code." },
    2: { title: "Check Your Email",    subtitle: `We sent a 4-digit code to ${email}` },
    3: { title: "Create New Password", subtitle: "Your new password must meet the requirements below." },
    4: { title: "Password Reset!",     subtitle: "Your password has been successfully updated." },
  };

  return (
    <div className={styles["fp-page"]}>
      <div className={styles["fp-card"]}>

        {/* LOGO */}
        <img src={logo_login} alt="CMPS Logo" className={styles["fp-logo"]} />

        {/* STEP INDICATORS */}
        {step < 4 && (
          <div className={styles["fp-steps-row"]}>
            {STEP_LABELS.map((label, i) => {
              const s = i + 1;
              return (
                <div key={s} className={styles["fp-step-item"]}>
                  {i > 0 && (
                    <div className={[
                      styles["fp-step-connector"],
                      step > i ? styles["done"] : "",
                    ].join(" ")} />
                  )}
                  <div className={[
                    styles["fp-step-dot"],
                    step === s ? styles["active"] : "",
                    step > s  ? styles["done"]   : "",
                  ].join(" ")}>
                    {s}
                  </div>
                  <span className={[
                    styles["fp-step-lbl"],
                    step >= s ? styles["active"] : "",
                  ].join(" ")}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* TITLE + SUBTITLE */}
        <h3 className={styles["fp-form-title"]}>{stepMeta[step].title}</h3>
        <p  className={styles["fp-form-subtitle"]}>{stepMeta[step].subtitle}</p>

        {/* ── STEP 1: EMAIL ── */}
        {step === 1 && (
          <form className={styles["fp-form"]} onSubmit={handleEmailSubmit} noValidate>
            <div className={styles["fp-field"]}>
              <label className={styles["fp-label"]}>
                Email Address <span className={styles["fp-required"]}>*</span>
              </label>
              <div className={styles["fp-input-wrap"]}>
                <MdEmail className={styles["fp-icon-left"]} />
                <input
                  type="email"
                  className={styles["fp-input"]}
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {error && <small className={styles["fp-error"]}>{error}</small>}

            <button className={styles["fp-btn"]} type="submit" disabled={loading}>
              {loading ? <span className={styles["fp-spinner"]} /> : "Send Reset Code"}
            </button>
            <button type="button" className={styles["fp-back-link"]} onClick={() => navigate("/login")}>
              <IoArrowBack /> Back to Login
            </button>
          </form>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 2 && (
          <form className={styles["fp-form"]} onSubmit={handleOtpSubmit} noValidate>
            <div className={styles["fp-otp-group"]}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={[
                    styles["fp-otp-box"],
                    digit ? styles["filled"] : "",
                  ].join(" ")}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  autoFocus={i === 0}
                  aria-label={`Digit ${i + 1}`}
                />
              ))}
            </div>

            <p className={styles["fp-resend-row"]}>
              Didn't receive a code?{" "}
              <button
                type="button"
                className={[
                  styles["fp-resend-btn"],
                  resendTimer > 0 ? styles["disabled"] : "",
                ].join(" ")}
                onClick={handleResend}
                disabled={resendTimer > 0 || loading}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
              </button>
            </p>

            {error && <small className={styles["fp-error"]}>{error}</small>}

            <button
              className={styles["fp-btn"]}
              type="submit"
              disabled={loading || otp.join("").length < 4}
            >
              {loading ? <span className={styles["fp-spinner"]} /> : "Verify Code"}
            </button>
            <button type="button" className={styles["fp-back-link"]} onClick={() => setStep(1)}>
              <IoArrowBack /> Change Email
            </button>
          </form>
        )}

        {/* ── STEP 3: NEW PASSWORD ── */}
        {step === 3 && (
          <form className={styles["fp-form"]} onSubmit={handlePasswordSubmit} noValidate>
            <div className={styles["fp-field"]}>
              <label className={styles["fp-label"]}>
                New Password <span className={styles["fp-required"]}>*</span>
              </label>
              <div className={styles["fp-input-wrap"]}>
                <FaLock className={styles["fp-icon-left"]} />
                <input
                  type={showNew ? "text" : "password"}
                  className={`${styles["fp-input"]} ${styles["fp-pw-input"]}`}
                  placeholder="Create new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  className={styles["fp-eye-btn"]}
                  onClick={() => setShowNew(!showNew)}
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>

            {newPassword.length > 0 && (
              <ul className={styles["fp-rules"]}>
                {ruleResults.map((r) => (
                  <li
                    key={r.id}
                    className={[
                      styles["fp-rule"],
                      r.passed ? styles["passed"] : styles["failed"],
                    ].join(" ")}
                  >
                    <span className={styles["fp-rule-icon"]}>{r.passed ? "✓" : "✗"}</span>
                    {r.label}
                  </li>
                ))}
              </ul>
            )}

            <div className={styles["fp-field"]}>
              <label className={styles["fp-label"]}>
                Confirm Password <span className={styles["fp-required"]}>*</span>
              </label>
              <div className={styles["fp-input-wrap"]}>
                <FaLock className={styles["fp-icon-left"]} />
                <input
                  type={showConfirm ? "text" : "password"}
                  className={[
                    styles["fp-input"],
                    styles["fp-pw-input"],
                    confirmPassword && confirmPassword !== newPassword ? styles["fp-input-err"] : "",
                  ].join(" ")}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles["fp-eye-btn"]}
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <small className={styles["fp-match-err"]}>Passwords do not match</small>
              )}
            </div>

            {error && <small className={styles["fp-error"]}>{error}</small>}

            <button
              className={styles["fp-btn"]}
              type="submit"
              disabled={loading || !allRulesPassed || newPassword !== confirmPassword}
            >
              {loading ? <span className={styles["fp-spinner"]} /> : "Reset Password"}
            </button>
          </form>
        )}

        {/* ── STEP 4: SUCCESS ── */}
        {step === 4 && (
          <div className={styles["fp-success"]}>
            <div className={styles["fp-success-icon"]}>
              <FaCheckCircle />
            </div>
            <p className={styles["fp-success-text"]}>
              You can now log in with your new password.
            </p>
            <button className={styles["fp-btn"]} onClick={() => navigate("/login")}>
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;
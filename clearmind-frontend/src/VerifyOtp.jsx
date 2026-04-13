import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import styles from "./VerifyOtp.module.css";
import logo_login from "./assets/CMPS_Logo.png";
import axiosClient from "./axiosClient";
import toast from "react-hot-toast";

// ── Helper: mask email like "***rian@gmail.com" ──────────────
function maskEmail(email) {
  if (!email) return "your email";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visibleCount = Math.min(4, local.length);
  const masked = "***" + local.slice(local.length - visibleCount);
  return `${masked}@${domain}`;
}

function VerifyOtp() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  const email = localStorage.getItem("pendingEmail") || "";
  const maskedEmail = maskEmail(email);

  // Main countdown timer
  useEffect(() => {
    if (success) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getOTP = () => digits.join("");

  const handleChange = (index, value) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);
    setError("");
    if (cleaned && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...digits];
    text.split("").forEach((ch, i) => {
      if (newDigits[i] !== undefined) newDigits[i] = ch;
    });
    setDigits(newDigits);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otp = getOTP();
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    if (timeLeft === 0) { setError("Your code has expired. Please request a new one."); return; }

    setLoading(true);
    setError("");

    try {
      const response = await axiosClient.post("/verify-email", { email, otp });
      const data = response.data;
      if (data.success) {
        setSuccess(true);
        toast.success("Account verified!", {
          duration: 2000,
          style: {
            background: "#E2F7E3",
            border: "1px solid #91C793",
            color: "#2E7D32",
            fontWeight: 600,
            fontSize: "0.95rem",
            borderRadius: "10px",
          },
          iconTheme: { primary: "#2E7D32", secondary: "#E2F7E3" },
        });
        localStorage.removeItem("pendingEmail");
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      if (err.response?.status === 422 || err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      } else {
        setError("Server error. Please try again later.");
      }
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    setError("");

    try {
      await axiosClient.post("/resend-otp", { email });
      setTimeLeft(15 * 60);
      setResendCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success("New code sent to your email!", {
        style: {
          background: "#E2F7E3",
          border: "1px solid #91C793",
          color: "#2E7D32",
          fontWeight: 600,
          borderRadius: "10px",
        },
      });
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const isFilled = getOTP().length === 6;
  const isExpired = timeLeft === 0;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* LOGO */}
        <img src={logo_login} alt="ClearMind Logo" className={styles.logo} />

        {/* Step indicator */}
        {!success && (
          <>
            <div className={styles.stepRow}>
              <div className={`${styles.step} ${styles.stepDone}`} />
              <div className={`${styles.step} ${styles.stepDone}`} />
              <div className={`${styles.step} ${styles.stepActive}`} />
            </div>
            <p className={styles.stepLabel}>Step 3 of 3 — Email Verification</p>
          </>
        )}

        {!success ? (
          <>
            <h2 className={styles.title}>Check your inbox</h2>
            <p className={styles.subtitle}>
              We sent a 6-digit verification code to:
            </p>

            {/* Masked email badge */}
            <div className={styles.emailBadge}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="#542982" strokeWidth="1.8" />
                <path d="M2 8l10 6 10-6" stroke="#542982" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {maskedEmail}
            </div>

            {/* OTP Digit Inputs */}
            <div className={styles.otpRow} onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`${styles.otpBox} ${
                    error ? styles.otpBoxError : d ? styles.otpBoxFilled : ""
                  } ${isExpired ? styles.otpBoxDisabled : ""}`}
                  disabled={isExpired || success}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {/* Error message */}
            <div className={styles.errorMsg}>{error || "\u00A0"}</div>

            {/* Timer & Resend */}
            <p className={styles.timerRow}>
              <span className={styles.timerLabel}>
                {isExpired ? (
                  <span className={styles.expiredLabel}>Code expired</span>
                ) : (
                  <>
                    Expires in{" "}
                    <span className={styles.timerValue}>{formatTime(timeLeft)}</span>
                  </>
                )}
              </span>
              <button
                type="button"
                className={`${styles.resendBtn} ${resendCooldown === 0 ? styles.resendActive : ""}`}
                onClick={handleResend}
                disabled={resendCooldown > 0 || resendLoading}
              >
                {resendLoading
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </button>
            </p>

            {/* Verify Button */}
            <button
              type="button"
              className={styles.verifyBtn}
              onClick={handleVerify}
              disabled={!isFilled || loading || isExpired}
            >
              {loading ? (
                <span className={styles.spinnerRow}>
                  <span className={styles.spinner} />
                  Verifying...
                </span>
              ) : (
                "Verify Account"
              )}
            </button>

            <button
              type="button"
              className={styles.backLink}
              onClick={() => navigate("/register")}
            >
              <IoArrowBack /> Wrong email? Go back to registration
            </button>
          </>
        ) : (
          /* ── SUCCESS STATE ── */
          <div className={styles.successState}>
            <div className={styles.successIconWrap}>
              <FaCheckCircle style={{ fontSize: "2rem", color: "#2E7D32" }} />
            </div>
            <h2 className={styles.successTitle}>You're verified!</h2>
            <p className={styles.successDesc}>
              Your ClearMind account is now active. Redirecting you to login...
            </p>
            <div className={styles.progressTrack}>
              <div className={styles.progressBar} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyOtp;
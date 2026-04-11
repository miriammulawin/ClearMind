import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./VerifyOtp.module.css";
import logo_login from "./assets/CMPS_Logo.png";
import axiosClient from "./axiosClient";
import toast from "react-hot-toast";

// ── Helper: mask email like "***rian@gmail.com" ──────────────
function maskEmail(email) {
  if (!email) return "your email";
  const [local, domain] = email.split("@");
  if (!domain) return email;

  // Show last 4 chars of local part, mask the rest with ***
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
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
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
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
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

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)
      inputRefs.current[index + 1]?.focus();
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
    if (otp.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    if (timeLeft === 0) {
      setError("Your code has expired. Please request a new one.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosClient.post("/verify-email", {
        email,
        otp,
      });

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
        setError(
          err.response?.data?.message || "Invalid OTP. Please try again.",
        );
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
      {/* ── LEFT PANEL ── */}
      <div className={styles.leftPanel}>
        <div className={styles.leftOverlay} />

        <div
          className={styles.blob}
          style={{
            width: 120,
            height: 120,
            background: "rgba(216,168,255,0.12)",
            top: 30,
            right: -30,
          }}
        />
        <div
          className={styles.blob}
          style={{
            width: 64,
            height: 64,
            background: "rgba(255,200,240,0.1)",
            top: 120,
            left: 20,
          }}
        />
        <div
          className={styles.blob}
          style={{
            width: 38,
            height: 38,
            border: "1.5px solid rgba(255,255,255,0.12)",
            background: "transparent",
            top: 190,
            right: 42,
          }}
        />

        <svg
          className={styles.sparkle}
          style={{ top: 64, left: 58 }}
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
          className={styles.sparkle}
          style={{ top: 200, right: 30 }}
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
          className={styles.sparkle}
          style={{ top: 88, right: 54 }}
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
          className={styles.sparkle}
          style={{ top: 240, left: 30 }}
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
            Almost There — <span className={styles.heroAccent}>Verify</span>{" "}
            Your Identity
          </h1>
          <p className={styles.heroDesc}>
            We sent a one-time code to your email to confirm your identity and
            keep your account secure. It only takes a moment.
          </p>
          <div className={styles.pillRow}>
            <span className={styles.pill}>
              <span className={styles.pillDot} />
              Expires in 15 mins
            </span>
            <span className={styles.pill}>
              <span className={styles.pillDot} />
              Secure &amp; Encrypted
            </span>
            <span className={styles.pill}>
              <span className={styles.pillDot} />
              One-Time Code
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.card}>
        <img src={logo_login} alt="ClearMind Logo" className={styles.logo} />

        {/* Step indicator */}
        <div className={styles.stepRow}>
          <div className={`${styles.step} ${styles.stepDone}`} />
          <div className={`${styles.step} ${styles.stepDone}`} />
          <div className={`${styles.step} ${styles.stepActive}`} />
        </div>
        <p className={styles.stepLabel}>Step 3 of 3 — Email Verification</p>

        {!success ? (
          <>
            <h2 className={styles.title}>Check your inbox</h2>
            <p className={styles.subtitle}>
              We sent a 6-digit verification code to:
            </p>

            {/* ✅ Masked email badge */}
            <div className={styles.emailBadge}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="3"
                  stroke="#7c3aed"
                  strokeWidth="1.8"
                />
                <path
                  d="M2 8l10 6 10-6"
                  stroke="#7c3aed"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
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
            <div className={styles.timerRow}>
              <span className={styles.timerLabel}>
                {isExpired ? (
                  <span className={styles.expiredLabel}>Code expired</span>
                ) : (
                  <>
                    Expires in{" "}
                    <span className={styles.timerValue}>
                      {formatTime(timeLeft)}
                    </span>
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
            </div>

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

            <p className={styles.backLink}>
              Wrong email?{" "}
              <span
                className={styles.backLinkBold}
                onClick={() => navigate("/register")}
              >
                Go back to registration
              </span>
            </p>
          </>
        ) : (
          /* ── SUCCESS STATE ── */
          <div className={styles.successState}>
            <div className={styles.successIconWrap}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M6 16l7 7L26 9"
                  stroke="#2E7D32"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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

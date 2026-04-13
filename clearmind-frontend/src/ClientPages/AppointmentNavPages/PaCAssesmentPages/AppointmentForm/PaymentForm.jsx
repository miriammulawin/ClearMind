import React, { useState } from "react";
import { Form } from "react-bootstrap";
import styles from "../../../ClientStyle/PaymentForm.module.css";
import sampleQr from "../../../../assets/sample_qr_ara.jpg";
import { useCurrentUser } from "../../../../hooks/userCurrentUser";

/**
 * PaymentForm  –  Step 3 body
 *
 * Location: ClientComponent/AppointmentComponents/AppointmentForm/PaymentForm.jsx
 */
const PaymentForm = ({
  doctorData = {},
  selectedDate = {},
  selectedTime = "",
  consultationMode = "",
  consultationFee = 0,
  profileData = {},
  paymentData = {},
  setPaymentData = () => {},
  qrImages = { gcash: sampleQr, bankTransfer: sampleQr },
  bookingPolicyAgreed = false,
  onOpenBookingPolicy = () => {},
}) => {
  const user = useCurrentUser();

  const [fileError, setFileError] = useState("");
  const [showError, setShowError] = useState(false);

  const {
    paymentMode = "G-Cash",
    referenceNo = "",
    receiptFile = null,
  } = paymentData;

  const handleChange = (field, value) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    if (!file) {
      handleChange("receiptFile", null);
      return;
    }

    const isValidMime = ALLOWED_IMAGE_TYPES.includes(file.type);
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
    const isValidExtension = allowedExtensions.test(file.name);

    if (!isValidMime || !isValidExtension) {
      setFileError(
        "Invalid file type. Only image files (JPG, PNG, GIF, WEBP, BMP) are allowed.",
      );
      setShowError(true);
      e.target.value = "";
      handleChange("receiptFile", null);
      return;
    }

    setFileError("");
    setShowError(false);
    handleChange("receiptFile", file);
  };

  // ── Helpers ───────────────────────────────────────────────────
  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const getEndTime = (startTime) => {
    if (!startTime) return "";
    const mins = timeToMinutes(startTime) + 60;
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const displayMins = minutes === 0 ? "00" : String(minutes).padStart(2, "0");
    return `${displayHours}:${displayMins} ${period}`;
  };

  const toTitleCase = (str) =>
    str.replace(
      /\w\S*/g,
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    );

  // ── Only show a summary row if the value is a real non-dash string ──
  const hasValue = (val) => val && val !== "—";

  // ── Resolve patient info ──────────────────────────────────────
  const isComplainant = profileData.isInformant === true;

  const patient = isComplainant
    ? {
        fullName:
          toTitleCase(
            [
              profileData.firstName,
              profileData.middleName,
              profileData.lastName,
            ]
              .filter(Boolean)
              .join(" "),
          ) || "—",
        dateOfBirth: profileData.dateOfBirth || "—",
        age: profileData.age || "—",
        sex: profileData.sex || "—",
        genderIdentity: profileData.genderIdentity || "—",
        preferredPronouns: profileData.preferredPronouns || "—",
        civilStatus: profileData.civilStatus || "—",
        contactNo: profileData.contactNo || "—",
        email: profileData.email || "—",
        address: profileData.address || "—",
      }
    : {
        fullName: user?.fullName || "—",
        dateOfBirth: user?.dateOfBirth || "—",
        age: user?.age ? String(user.age) : "—",
        sex: user?.sex || "—",
        genderIdentity: user?.genderIdentity || "—",
        preferredPronouns: user?.preferredPronouns || "—",
        civilStatus: user?.civilStatus || "—",
        contactNo: user?.contactNo || "—",
        email: user?.email || "—",
        address: user?.homeAddress || "—",
      };

  const visitType =
    consultationMode === "ONLINE" ? "Online" : "On-site / Clinic";
  const dateTimeDisplay =
    selectedDate?.date && selectedTime
      ? `${selectedDate.date}, ${selectedTime} – ${getEndTime(selectedTime)}`
      : "—";

  const QR_SOURCES = {
    "G-Cash": qrImages?.gcash || null,
    "Bank Transfer": qrImages?.bankTransfer || null,
  };

  return (
    <div className={styles.formWrapper}>
      {/* ── Appointment Summary ── */}
      <div className={styles.sectionLabel}>Appointment Summary:</div>
      <div className={styles.summaryCard}>
        {/* ── Schedule ── */}
        <div className={styles.summaryGroup}>
          <div className={styles.summaryGroupTitle}>Schedule</div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Assigned Doctor:</span>
            <span className={styles.summaryVal}>{doctorData?.name || "—"}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Date and Time:</span>
            <span className={styles.summaryVal}>{dateTimeDisplay}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Visit Type:</span>
            <span className={styles.summaryVal}>{visitType}</span>
          </div>
        </div>

        <div className={styles.summaryDivider} />

        {/* ── Patient Profile ── */}
        <div className={styles.summaryGroup}>
          <div className={styles.summaryGroupTitle}>Patient Profile</div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Patient Name:</span>
            <span className={styles.summaryVal}>{patient.fullName}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Date of Birth:</span>
            <span className={styles.summaryVal}>{patient.dateOfBirth}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Age:</span>
            <span className={styles.summaryVal}>{patient.age}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Sex:</span>
            <span className={styles.summaryVal}>{patient.sex}</span>
          </div>
          {hasValue(patient.genderIdentity) && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Gender Identity:</span>
              <span className={styles.summaryVal}>
                {patient.genderIdentity}
              </span>
            </div>
          )}
          {hasValue(patient.preferredPronouns) && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Preferred Pronouns:</span>
              <span className={styles.summaryVal}>
                {patient.preferredPronouns}
              </span>
            </div>
          )}
          {hasValue(patient.civilStatus) && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Civil Status:</span>
              <span className={styles.summaryVal}>{patient.civilStatus}</span>
            </div>
          )}
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Contact No.:</span>
            <span className={styles.summaryVal}>{patient.contactNo}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Email:</span>
            <span className={styles.summaryVal}>{patient.email}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryKey}>Address:</span>
            <span className={styles.summaryVal}>{patient.address}</span>
          </div>

          {/* Only shown when actually collected (PAC) — hidden for PAaE */}
          {hasValue(profileData.patientType) && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Patient Type:</span>
              <span className={styles.summaryVal}>
                {profileData.patientType}
              </span>
            </div>
          )}
          {hasValue(profileData.classification) && (
            <div className={styles.summaryRow}>
              <span className={styles.summaryKey}>Classification:</span>
              <span className={styles.summaryVal}>
                {profileData.classification}
              </span>
            </div>
          )}
        </div>

        {/* ── Complainant Info (only if complainant mode) ── */}
        {isComplainant && (
          <>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryGroup}>
              <div className={styles.summaryGroupTitle}>Complainant</div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Name:</span>
                <span className={styles.summaryVal}>
                  {profileData.complainantName || "—"}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>Relation:</span>
                <span className={styles.summaryVal}>
                  {profileData.complainantRelation || "—"}
                </span>
              </div>
            </div>
          </>
        )}

        <div className={styles.summaryDivider} />

        {/* ── Reason ── */}
        <div className={styles.summaryGroup}>
          <div className={styles.summaryGroupTitle}>
            Reason for Consultation
          </div>
          <p className={styles.summaryReason}>
            {profileData.reason && profileData.reason.trim()
              ? profileData.reason
              : "—"}
          </p>
        </div>
      </div>

      {/* ── Consultation Fee ── */}
      <div className={styles.feeRow}>
        <span className={styles.feeLabel}>Consultation Fee:</span>
        <span className={styles.feeAmount}>
          ₱ {consultationFee?.toLocaleString()}
        </span>
      </div>

      {/* ── Payment Mode ── */}
      <div className={styles.sectionLabel}>Choose mode of payment:</div>
      <div className={styles.paymentModeCard}>
        {["G-Cash", "Bank Transfer"].map((mode) => (
          <label key={mode} className={styles.paymentRadioLabel}>
            <input
              type="radio"
              name="paymentMode"
              value={mode}
              checked={paymentMode === mode}
              onChange={() => handleChange("paymentMode", mode)}
              className={styles.radioInput}
            />
            {mode}
          </label>
        ))}
      </div>

      {/* ── QR Code ── */}
      <div className={styles.sectionLabel}>Scan the QR Code:</div>
      <div className={styles.qrCard}>
        <div className={styles.qrImageWrapper}>
          {QR_SOURCES[paymentMode] ? (
            <img
              src={QR_SOURCES[paymentMode]}
              alt={`${paymentMode} QR Code`}
              className={styles.qrImage}
            />
          ) : (
            <div className={styles.qrPlaceholder}>
              <div className={styles.qrPlaceholderInner}>
                <span className={styles.qrPlaceholderLabel}>
                  {paymentMode === "G-Cash" ? "instaPay" : "Bank QR"}
                </span>
              </div>
            </div>
          )}
        </div>
        <p className={styles.qrNote}>Transfer fees may apply.</p>
        <p className={styles.accountName}>{paymentMode}</p>
      </div>

      {/* ── Reference Number ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Reference Number <span className={styles.requiredStar}>*</span>
        </label>
        <Form.Control
          type="text"
          placeholder="Reference Number"
          className={styles.input}
          value={referenceNo}
          onChange={(e) => handleChange("referenceNo", e.target.value)}
        />
      </div>

      {/* ── Upload Receipt ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Upload receipt <span className={styles.requiredStar}>*</span>
        </label>
        <div
          className={`${styles.fileInputWrapper} ${showError ? styles.fileInputWrapperError : ""}`}
        >
          <label className={styles.fileBtn}>
            Choose File
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
              className={styles.fileInputHidden}
              onChange={handleFileChange}
            />
          </label>
          <span
            className={`${styles.fileName} ${showError ? styles.fileNameError : ""}`}
          >
            {receiptFile ? receiptFile.name : "No file selected"}
          </span>
        </div>

        {showError && (
          <div className={styles.fileErrorMsg}>
            <svg
              className={styles.fileErrorIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
            >
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
            </svg>
            {fileError}
          </div>
        )}

        <p className={styles.fileHint}>
          Accepted formats: JPG, PNG, GIF, WEBP, BMP
        </p>
      </div>

      <div className={styles.acknowledgementRow}>
        <input
          type="radio"
          checked={bookingPolicyAgreed}
          onChange={() => onOpenBookingPolicy()}
          className={styles.radioInput}
        />
        <span>
          {" "}
          I acknowledge and agree on the{" "}
          <button
            type="button"
            className={styles.policyLink}
            onClick={onOpenBookingPolicy}
          >
            Cancellation & Rebooking Policy
          </button>
        </span>
      </div>
    </div>
  );
};

export default PaymentForm;

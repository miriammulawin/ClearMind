import PAeEPayment from "../../AppointmentComponents/PaymentForm";
import styles from "../../AppointmentComponents/styles/PaymentForm.module.css";
import { buildPaymentProps } from "./PAaEHelpers.jsx";

const PreEmploymentPayment = ({
  config,
  form,
  setForm,
  bookingPolicyAgreed,
  onOpenBookingPolicy,
}) => {
  const baseFee = config.baseFee || 3000;
  const reportFee = config.printedReportFee || 1500;
  const wantsReport = form.wantsPrintedReport === true;
  const totalFee = baseFee + (wantsReport ? reportFee : 0);

  const paymentProps = buildPaymentProps(
    form,
    setForm,
    config,
    totalFee,
    bookingPolicyAgreed,
    onOpenBookingPolicy,
  );

  return (
    <div className={styles.stepCard}>
      {/* ── Disclaimer ── */}
      <div className={styles.disclaimer}>
        <span>ℹ️</span>
        <span>
          <strong>Disclaimer:</strong> This service covers{" "}
          <strong>test administration only</strong>. The fee below applies to
          the psychological test session. An official printed psychological
          report (evaluation) is a separate deliverable with an additional fee
          of <strong>₱{reportFee.toLocaleString()}</strong>.
        </span>
      </div>

      {/* ── Printed Report Toggle ── */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>
          Would you like to receive the official printed psychological report
          (evaluation)?
        </label>
        <div className={styles.reportToggleRow}>
          {/* YES */}
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, wantsPrintedReport: true }))}
            className={`${styles.reportToggleBtn} ${wantsReport ? styles.reportToggleBtnActive : styles.reportToggleBtnInactive}`}
          >
            <div
              className={`${styles.customCheck} ${wantsReport ? styles.customCheckActive : ""}`}
            />
            Yes — include printed report
            <span className={styles.reportBadge}>
              +₱{reportFee.toLocaleString()}
            </span>
          </button>

          {/* NO */}
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, wantsPrintedReport: false }))
            }
            className={`${styles.reportToggleBtn} ${form.wantsPrintedReport === false ? styles.reportToggleBtnActive : styles.reportToggleBtnInactive}`}
          >
            <div
              className={`${styles.customCheck} ${form.wantsPrintedReport === false ? styles.customCheckActive : ""}`}
            />
            No — test administration only
          </button>
        </div>
      </div>

      {/* ── Fee Summary ── */}
      {form.wantsPrintedReport !== undefined && (
        <div className={styles.feeSummaryBox}>
          <div className={styles.feeSummaryRow}>
            <span className={styles.feeSummaryRowLabel}>
              Test Administration
            </span>
            <span className={styles.feeSummaryRowVal}>
              ₱{baseFee.toLocaleString()}
            </span>
          </div>
          {wantsReport && (
            <div className={styles.feeSummaryRow}>
              <span className={styles.feeSummaryRowLabel}>
                Printed Psychological Report
              </span>
              <span className={styles.feeSummaryRowVal}>
                +₱{reportFee.toLocaleString()}
              </span>
            </div>
          )}
          <div className={`${styles.feeSummaryRow} ${styles.feeSummaryTotal}`}>
            <span
              className={`${styles.feeSummaryRowLabel} ${styles.feeSummaryTotalLabel}`}
            >
              Total
            </span>
            <span
              className={`${styles.feeSummaryRowVal} ${styles.feeSummaryTotalVal}`}
            >
              ₱{totalFee.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <PAeEPayment {...paymentProps} />
    </div>
  );
};

export default PreEmploymentPayment;

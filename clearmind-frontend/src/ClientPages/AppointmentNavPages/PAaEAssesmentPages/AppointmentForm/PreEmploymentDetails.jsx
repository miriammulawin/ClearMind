import FormHeader from "../../AppointmentComponents/FormHeader";
import styles from "../style/PAaEAppointmentForm.module.css";

const PreEmploymentDetails = ({ form, setForm, user }) => {
  return (
    <div className={styles.stepCard}>
      <FormHeader
        isInformant={form.isInformant ?? false}
        onToggle={(val) => setForm((f) => ({ ...f, isInformant: val }))}
        user={user}
        patientForm={form}
        setPatientForm={setForm}
      />
      <div className={styles.field} style={{ marginTop: 20 }}>
        <label className={styles.label}>
          Name of Employer / Company <span className={styles.req}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. ABC Corporation"
          value={form.employerName || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, employerName: e.target.value }))
          }
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          Purpose of Assessment <span className={styles.req}>*</span>
        </label>
        <textarea
          className={styles.textarea}
          placeholder="Briefly describe the purpose of this pre-employment assessment..."
          value={form.assessmentPurpose || ""}
          maxLength={500}
          onChange={(e) =>
            setForm((f) => ({ ...f, assessmentPurpose: e.target.value }))
          }
        />
        <div
          className={`${styles.charCount} ${(form.assessmentPurpose || "").length > 450 ? styles.charCountWarn : ""}`}
        >
          {(form.assessmentPurpose || "").length}/500
        </div>
      </div>
    </div>
  );
};

export default PreEmploymentDetails;

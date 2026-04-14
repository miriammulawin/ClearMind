import FormHeader from "../../AppointmentComponents/FormHeader";
import styles from "../style/PAaEAppointmentForm.module.css";

const InternshipDetails = ({ form, setForm, user }) => {
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
          Name of School / University <span className={styles.req}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. University of the Philippines"
          value={form.schoolName || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, schoolName: e.target.value }))
          }
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          Program / Course <span className={styles.req}>*</span>
        </label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. BS Psychology"
          value={form.program || ""}
          onChange={(e) => setForm((f) => ({ ...f, program: e.target.value }))}
        />
      </div>
    </div>
  );
};

export default InternshipDetails;

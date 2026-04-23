import FormHeader from "../../AppointmentComponents/FormHeader";
import styles from "../style/PAaEAppointmentForm.module.css";

const EsaTravelDiagnosis = ({ form, setForm, user }) => {
  const hasDiagnosis = form.hasDiagnosis === true;

  const handleDiagnosisFile = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".pdf")) {
      setForm((f) => ({ ...f, diagnosisFile: file.name }));
    }
    e.target.value = "";
  };

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
          Travel Type <span className={styles.req}>*</span>
        </label>
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}
        >
          {["Local", "International"].map((option) => {
            const selected = form.travelType === option;
            return (
              <label
                key={option}
                style={{
                  flex: "1",
                  minWidth: 120,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: `2px solid ${selected ? "#5B2C91" : "#ddd0f0"}`,
                  borderRadius: 10,
                  padding: "10px 16px",
                  background: selected ? "#f3eeff" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  fontFamily: "inherit",
                }}
              >
                <input
                  type="radio"
                  name="travelType"
                  value={option}
                  checked={selected}
                  onChange={() =>
                    setForm((f) => ({ ...f, travelType: option }))
                  }
                  style={{ accentColor: "#5B2C91", width: 16, height: 16 }}
                />
                <span
                  style={{
                    fontWeight: selected ? 700 : 500,
                    color: selected ? "#5B2C91" : "#6b5a8a",
                    fontSize: "clamp(13px,3vw,14px)",
                  }}
                >
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Is there any existing diagnosis? <span className={styles.req}>*</span>
        </label>
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}
        >
          {[
            { label: "Yes", value: true },
            { label: "No", value: false },
          ].map(({ label, value }) => {
            const selected = form.hasDiagnosis === value;
            return (
              <label
                key={label}
                style={{
                  flex: "1",
                  minWidth: 100,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: `2px solid ${selected ? "#5B2C91" : "#ddd0f0"}`,
                  borderRadius: 10,
                  padding: "10px 16px",
                  background: selected ? "#f3eeff" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  fontFamily: "inherit",
                }}
              >
                <input
                  type="radio"
                  name="hasDiagnosis"
                  checked={selected}
                  onChange={() =>
                    setForm((f) => ({
                      ...f,
                      hasDiagnosis: value,
                      diagnosisFile: value ? f.diagnosisFile : null,
                    }))
                  }
                  style={{ accentColor: "#5B2C91", width: 16, height: 16 }}
                />
                <span
                  style={{
                    fontWeight: selected ? 700 : 500,
                    color: selected ? "#5B2C91" : "#6b5a8a",
                    fontSize: "clamp(13px,3vw,14px)",
                  }}
                >
                  {label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {hasDiagnosis && (
        <div className={styles.field}>
          <label className={styles.label}>
            Attach Diagnosis Document <span className={styles.req}>*</span>
            <span className={styles.opt}> (PDF only)</span>
          </label>
          <div
            className={styles.uploadZone}
            style={{
              border: "2px dashed #c8b0e8",
              borderRadius: 10,
              padding: "clamp(16px,3.5vw,24px)",
              textAlign: "center",
              background: "#faf6ff",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{ fontSize: "clamp(1.5rem,4vw,2rem)", marginBottom: 5 }}
            >
              📄
            </div>
            <div
              style={{
                fontWeight: 600,
                color: "#5b2c91",
                fontSize: "clamp(12px,3vw,13px)",
              }}
            >
              Click to upload
            </div>
            <div
              style={{
                fontSize: "clamp(10px,2.3vw,12px)",
                color: "#8a7a9a",
                marginTop: 3,
              }}
            >
              PDF files only
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleDiagnosisFile}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
                width: "100%",
                height: "100%",
              }}
            />
          </div>
          {form.diagnosisFile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#f3eeff",
                borderRadius: 7,
                padding: "7px 12px",
                marginTop: 8,
                fontSize: "clamp(11px,2.5vw,12px)",
              }}
            >
              <span style={{ color: "#c0392b" }}>📄</span>
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "#2d1b69",
                  fontWeight: 500,
                }}
              >
                {form.diagnosisFile}
              </span>
              <button
                onClick={() => setForm((f) => ({ ...f, diagnosisFile: null }))}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#8a7a9a",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EsaTravelDiagnosis;

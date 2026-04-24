// AppointmentForm/PAaEReason.jsx
// Step: Reason for Consultation
//
// When "I am the Patient"     → shows pre-loaded profile card (read-only)
// When "I am the Complainant" → shows manual patient info fields
// Reason textarea + extra service fields always shown

import { BsInfoCircleFill } from "react-icons/bs";
import styles from "../style/PAaEAppointmentForm.module.css";
import FormHeader from "../../AppointmentComponents/FormHeader";

/* -----------------------------------------------------------------
   PAaEReason
   Props:
     config         — SERVICE_CONFIG entry for the selected service
     form           — shared form state object
     setForm        — form state setter
     user           — current user object from useCurrentUser
------------------------------------------------------------------ */
const PAaEReason = ({
  config,
  form,
  setForm,
  user,
  declarationAgreed = false,
  onOpenDeclaration = () => {},
}) => {
  const len = (form.reason || "").length;
  const hasRpmStep = config.steps.includes("Choose RPm");

  const extraFields = {
    legalType: (
      <div className={styles.field}>
        <label className={styles.label}>
          Legal Case Type <span className={styles.opt}>(optional)</span>
        </label>
        <select
          className={styles.select}
          value={form.legalType || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, legalType: e.target.value }))
          }
        >
          <option value="">-- Select --</option>
          {["Adoption", "Custody", "Annulment", "Other Legal Purpose"].map(
            (o) => (
              <option key={o}>{o}</option>
            ),
          )}
        </select>
      </div>
    ),
    school: (
      <div className={styles.field}>
        <label className={styles.label}>
          School / Institution <span className={styles.opt}>(optional)</span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g. Batangas State University"
          value={form.school || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, school: e.target.value }))
          }
        />
      </div>
    ),
    company: (
      <div className={styles.field}>
        <label className={styles.label}>
          Company / Employer <span className={styles.opt}>(optional)</span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g. Company Name"
          value={form.company || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, company: e.target.value }))
          }
        />
      </div>
    ),
    institution: (
      <div className={styles.field}>
        <label className={styles.label}>
          Institution / Purpose <span className={styles.opt}>(optional)</span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g. Hospital / School / Employer"
          value={form.institution || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, institution: e.target.value }))
          }
        />
      </div>
    ),
    preEmployment: (
      <>
        <div className={styles.field}>
          <label className={styles.label}>
            Name of Employer / Company <span className={styles.req}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. ABC Corporation"
            value={form.employerName || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, employerName: e.target.value }))
            }
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            Purpose of Assessment <span className={styles.req}>*</span>
          </label>
          <textarea
            className={styles.textarea}
            placeholder="Briefly describe the purpose..."
            value={form.assessmentPurpose || ""}
            maxLength={500}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                assessmentPurpose: e.target.value,
              }))
            }
          />
          <div
            className={`${styles.charCount} ${(form.assessmentPurpose || "").length > 450 ? styles.charCountWarn : ""}`}
          >
            {(form.assessmentPurpose || "").length}/500
          </div>
        </div>
      </>
    ),

    internship: (
      <>
        <div className={styles.field}>
          <label className={styles.label}>
            Name of School / University <span className={styles.req}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. University of the Philippines"
            value={form.schoolName || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, schoolName: e.target.value }))
            }
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            Program / Course <span className={styles.req}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. BS Psychology"
            value={form.program || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, program: e.target.value }))
            }
          />
        </div>
      </>
    ),

    esa: <EsaFields form={form} setForm={setForm} styles={styles} />,
  };
  function EsaFields({ form, setForm, styles }) {
    const hasDiagnosis = form.hasDiagnosis === true;

    return (
      <>
        <div className={styles.field}>
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
            Is there any existing diagnosis?{" "}
            <span className={styles.req}>*</span>
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
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.name.endsWith(".pdf"))
                    setForm((f) => ({ ...f, diagnosisFile: file.name }));
                  e.target.value = "";
                }}
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
                  onClick={() =>
                    setForm((f) => ({ ...f, diagnosisFile: null }))
                  }
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
      </>
    );
  }
  return (
    <div className={styles.stepCard}>
      {/* ── Info banner ── */}
      <div className={styles.infoBanner}>
        <BsInfoCircleFill className={styles.bannerIcon} />
        <span>
          Your basic profile information is pre-loaded from your account. Only
          your reason for consultation is needed below.
        </span>
      </div>
      {/* ── Toggle + Pre-loaded card OR Complainant fields ──
          FormHeader handles:
            - Required notice
            - Patient / Complainant toggle
            - Pre-loaded profile card (patient mode)
            - Manual patient fields (complainant mode)
      ── */}
      <FormHeader
        isInformant={form.isInformant ?? false}
        onToggle={(value) =>
          setForm((prev) => ({
            ...prev,
            isInformant: value,
            // Clear complainant-specific fields when switching back to patient
            ...(!value && {
              complainantName: "",
              complainantRelation: "",
              firstName: "",
              middleName: "",
              lastName: "",
              sex: "",
              dateOfBirth: "",
              age: "",
              contactNo: "",
              email: "",
              address: "",
            }),
          }))
        }
        user={user}
        patientForm={form}
        setPatientForm={setForm}
      />

      {/* ── Reason textarea ── */}
      {config.extraField !== "preEmployment" &&
        config.extraField !== "esa" &&
        config.extraField !== "internship" && (
          <div className={styles.field}>
            <label className={styles.label}>
              Reason for Consultation <span className={styles.req}>*</span>
            </label>
            <textarea
              className={styles.textarea}
              maxLength={500}
              placeholder="Describe the reason for your appointment…"
              value={form.reason || ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
            <div
              className={`${styles.charCount} ${len > 450 ? styles.charCountWarn : ""}`}
            >
              {len} / 500
            </div>
          </div>
        )}

      {/* ── Service-specific extra field ── */}
      {config.extraField && extraFields[config.extraField]}

      <div className={styles.acknowledgementRow}>
        <input
          type="radio"
          className={styles.radioInput}
          checked={declarationAgreed}
          onChange={() => onOpenDeclaration()} // opens modal
        />
        <span>
          {" "}
          I acknowledge and agree on the{" "}
          <button
            type="button"
            className={styles.policyLink}
            onClick={onOpenDeclaration}
          >
            Declaration of Participation
          </button>
          <span className={styles.requiredStar}>*</span>
        </span>
      </div>
    </div>
  );
};

export default PAaEReason;

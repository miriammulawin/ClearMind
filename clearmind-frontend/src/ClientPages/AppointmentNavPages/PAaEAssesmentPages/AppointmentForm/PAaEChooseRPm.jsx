// PAaEAssesmentPages/AppointmentForm/PAaEChooseRPm.jsx
import { useMemo, useState, useEffect } from "react";
import DoctorProfile from "../../AppointmentComponents/DoctorProfile";
import styles from "../style/PAaEAppointmentForm.module.css";
import DoctorCard from "../../AppointmentComponents/DoctorCard";
import axiosClient from "../../../../axiosClient";

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

const mapDoctor = (d) => {
  const schedules = Array.isArray(d.schedules) ? d.schedules : [];
  const DAY_ORDER_NUM = [1, 2, 3, 4, 5, 6, 0];
  const sorted = [...schedules].sort(
    (a, b) =>
      DAY_ORDER_NUM.indexOf(a.day_num) - DAY_ORDER_NUM.indexOf(b.day_num),
  );

  const today = new Date();
  const todayNum = today.getDay();
  let earliestSchedule = null;
  for (let i = 1; i <= 7; i++) {
    const checkDay = (todayNum + i) % 7;
    const found = schedules.find((s) => s.day_num === checkDay);
    if (found) {
      earliestSchedule = found;
      break;
    }
  }

  const hasOnline = schedules.some(
    (s) => s.slot_type === "online" || s.slot_type === "both",
  );
  const hasPhysical = schedules.some(
    (s) => s.slot_type === "physical" || s.slot_type === "both",
  );

  return {
    ...d,
    id: d.doctor_id,
    name: `${d.firstName}${d.middleInitial ? " " + d.middleInitial + "." : ""} ${d.lastName}`,
    title: d.professional_title || d.doctor?.professional_title || "",
    sex: d.sex,

    // ── Profile pic ──
    photo: d.doctor?.profile_picture
      ? `http://localhost:8000/storage/${d.doctor.profile_picture}`
      : null,
    profile_picture: d.doctor?.profile_picture
      ? `http://localhost:8000/storage/${d.doctor.profile_picture}`
      : null,

    // ── DoctorProfile fields ──
    professional_title:
      d.professional_title || d.doctor?.professional_title || "",
    main_specialty: d.doctor?.main_specialty || "",
    description: d.doctor?.description || "",
    license_number: d.license_number || d.doctor?.license_number || "",
    prc_number: d.doctor?.prc_number || "",
    practicing_since: d.doctor?.practicing_since || "",
    years_of_experience: d.doctor?.years_of_experience || null,
    specializations: d.doctor?.specializations || d.specializations || [],
    sub_specializations: d.doctor?.sub_specializations || [],
    services: d.doctor?.services || [],
    board_cert_names: d.doctor?.board_cert_names || [],

    // ── DoctorCard display ──
    consultationMode:
      hasOnline && hasPhysical ? "Both" : hasOnline ? "Virtual" : "Onsite",
    consultationType:
      hasOnline && hasPhysical
        ? "Online & On-site"
        : hasOnline
          ? "Virtual Consultation"
          : "On-site Consultation",
    schedule: {
      days: sorted.map((s) => s.day),
      time: earliestSchedule
        ? `${formatTime(earliestSchedule.start_time)} - ${formatTime(earliestSchedule.end_time)}`
        : null,
      earliest: earliestSchedule?.day || null,
    },
    consultationFees: {
      initialConsultation: d.doctor?.initial_consultation_fee || null,
    },
  };
};

// ── ESA Fields Component ─────────────────────────────────────────
const EsaFields = ({ form, setForm, styles }) => {
  const hasDiagnosis = form.hasDiagnosis === true;

  return (
    <>
      <div className={styles.field} style={{ marginTop: 24 }}>
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
    </>
  );
};

const PAaEChooseRPm = ({ config, form, setForm, onDoctorSelect }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("config.extraField:", config.extraField);
  console.log("form.rpm:", form.rpm);

  useEffect(() => {
    axiosClient
      .get("/doctors/list")
      .then(({ data }) => {
        console.log("doctors/list raw response:", data.data);
        data.data?.forEach((d) =>
          console.log(`[${d.doctor_id}]`, {
            professional_title: d.professional_title,
            specialization: d.specialization,
            sex: d.sex,
          }),
        );
        setDoctors(data.data || []);
      })
      .catch((err) => {
        console.error("Failed to load doctors:", err);
        setError("Failed to load doctors.");
      })
      .finally(() => setLoading(false));
  }, []);

  const rpmList = useMemo(() => {
    return doctors.filter((d) => {
      const title = (d.professional_title || "").toLowerCase();
      const spec = (d.specialization || "").toLowerCase();

      const isRpm =
        title.includes("psychometrician") ||
        title.includes("rpm") ||
        title.includes("r.pm") ||
        spec.includes("psychometrician") ||
        spec.includes("rpm");

      if (config?.femaleOnly) {
        return isRpm && (d.sex || "").toLowerCase() === "female";
      }

      return isRpm;
    });
  }, [doctors, config?.femaleOnly]);

  const displayList = rpmList.length > 0 ? rpmList : doctors;

  return (
    <div className={styles.stepCard}>
      {selectedProfile ? (
        <DoctorProfile
          doctorData={selectedProfile}
          onBack={() => setSelectedProfile(null)}
          hideBookButton={true}
        />
      ) : (
        <>
          {/* ── Optional fields BEFORE doctor selection ── */}
          {(config.extraField === "school" ||
            config.extraField === "company" ||
            config.extraField === "legalType") && (
            <div className={styles.extraFieldCard}>
              <p className={styles.extraFieldCardTitle}>
                Additional Information
              </p>

              {config.extraField === "school" && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    School / Institution{" "}
                    <span className={styles.opt}>(optional)</span>
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
              )}

              {config.extraField === "company" && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    Company / Employer{" "}
                    <span className={styles.opt}>(optional)</span>
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
              )}

              {config.extraField === "legalType" && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    Legal Case Type{" "}
                    <span className={styles.opt}>(optional)</span>
                  </label>
                  <select
                    className={styles.select}
                    value={form.legalType || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        legalType: e.target.value,
                      }))
                    }
                  >
                    <option value="">-- Select --</option>
                    {[
                      "Adoption",
                      "Custody",
                      "Annulment",
                      "Other Legal Purpose",
                    ].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <h4 className={styles.titlePage}>Choose your Psychometrician:</h4>

          {config?.femaleOnly && (
            <div className={styles.infoBanner}>
              <span>⚠️</span>
              <span>
                For VAWC cases, only <strong>Female</strong> RPm /
                Psychometricians are available.
              </span>
            </div>
          )}

          {loading && <p>Loading doctors...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className={styles.rpmGrid}>
            {!loading && !error && displayList.length === 0 && (
              <p>No doctors available.</p>
            )}
            {!loading &&
              !error &&
              displayList.map((d) => {
                const mapped = mapDoctor(d);
                return (
                  <DoctorCard
                    compact
                    key={d.doctor_id}
                    doctor={mapped}
                    hideSetAppointment
                    hideViewProfileBtn={false}
                    isSelected={form.rpm === d.doctor_id}
                    onViewProfile={() => setSelectedProfile(mapped)}
                    onSelect={() => {
                      setForm((prev) => ({
                        ...prev,
                        rpm: d.doctor_id,
                        date: null,
                        time: null,
                      }));
                      onDoctorSelect(d);
                    }}
                  />
                );
              })}
          </div>

          {/* ── Required fields AFTER doctor selection ── */}
          {!!form.rpm &&
            (config.extraField === "preEmployment" ||
              config.extraField === "internship" ||
              config.extraField === "esa") && (
              <div className={styles.extraFieldCard} style={{ marginTop: 20 }}>
                <p className={styles.extraFieldCardTitle}>
                  Additional Information
                </p>

                {config.extraField === "preEmployment" && (
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Name of Employer / Company{" "}
                      <span className={styles.req}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. ABC Corporation"
                      value={form.employerName || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          employerName: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                {config.extraField === "internship" && (
                  <>
                    <div className={styles.field}>
                      <label className={styles.label}>
                        Name of School / University{" "}
                        <span className={styles.req}>*</span>
                      </label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. University of the Philippines"
                        value={form.schoolName || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            schoolName: e.target.value,
                          }))
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
                          setForm((prev) => ({
                            ...prev,
                            program: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                )}

                {config.extraField === "esa" && (
                  <EsaFields form={form} setForm={setForm} styles={styles} />
                )}
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default PAaEChooseRPm;

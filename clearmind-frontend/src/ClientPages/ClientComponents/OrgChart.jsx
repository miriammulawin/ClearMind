import React, { useState } from "react";
import orgChart from "../../assets/CMPS-ORG-CHART.jpg";
import { MOCK_DOCTORS } from "../../MockData/MockDoctors";
import styles from "../ClientStyle/OrgChart.module.css";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getInitials = (name) =>
  name
    .split(" ")
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .map((n) => n[0].toUpperCase())
    .join("");

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({ initials, bg, color, size = 40, imgSrc }) => (
  <div
    className={styles.avatar}
    style={{
      width: size,
      height: size,
      background: imgSrc ? "transparent" : bg, // Transparent background if image exists
      color,
      fontSize: size < 38 ? 11 : 13,
      overflow: "hidden", // Ensures image stays inside the circle
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {imgSrc ? (
      <img
        src={imgSrc}
        alt={initials}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ) : (
      initials
    )}
  </div>
);

const MemberRow = ({ initials, name, role, bg, color }) => (
  <div className={styles.memberRow}>
    <Avatar initials={initials} bg={bg} color={color} size={34} />
    <div>
      <p className={styles.memberName}>{name}</p>
      <p className={styles.memberRole}>{role}</p>
    </div>
  </div>
);

const AccordionItem = ({
  title,
  subtitle,
  avatarInitials,
  bg,
  color,
  head,
  staff,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.accordionItem}>
      {/* Header */}
      <div
        className={`${styles.accordionHeader} ${open ? styles.open : ""}`}
        onClick={() => setOpen(!open)}
      >
        <Avatar initials={avatarInitials} bg={bg} color={color} />
        <div className={styles.accordionHeaderText}>
          <p className={styles.accordionTitle}>{title}</p>
          <p className={styles.accordionSubtitle}>{subtitle}</p>
        </div>
        <span
          className={`${styles.accordionChevron} ${open ? styles.open : ""}`}
        >
          ▼
        </span>
      </div>

      {/* Body */}
      {open && (
        <div className={styles.accordionBody}>
          {/* Department head */}
          {head && (
            <div className={styles.headRow}>
              <Avatar initials={getInitials(head.name)} bg={bg} color={color} />
              <div>
                <p className={styles.headName}>
                  {head.fullName || head.name}
                  {head.credentials ? `, ${head.credentials}` : ""}
                </p>
                <p className={styles.headRole}>{head.role}</p>
              </div>
            </div>
          )}

          {/* Staff list */}
          {staff.map((m, i) => (
            <MemberRow
              key={i}
              initials={getInitials(m.name.replace(/^(Dr\.|Ms\.|Mr\.)\s+/, ""))}
              name={`${m.name}${m.credentials ? `, ${m.credentials}` : ""}`}
              role={m.role}
              bg={bg}
              color={color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Data builders ────────────────────────────────────────────────────────────

const getDoctor = (name) => MOCK_DOCTORS.find((d) => d.name === name);

const buildMember = (name, roleOverride) => {
  const doc = getDoctor(name);
  const prefix = doc ? (doc.sex === "Female" ? "Ms." : "Mr.") : "";
  return {
    name: `${prefix} ${name}`.trim(),
    credentials: doc?.credentials || "",
    role: roleOverride || doc?.title || "",
    profilePic: doc?.profilePic || null,
  };
};

// ─── Main component ───────────────────────────────────────────────────────────

const OrgChart = () => {
  const jinky = getDoctor("Jinky C. Malabanan");

  const clinicalHead = {
    name: "Jinky C. Malabanan",
    fullName: "Dr. Jinky C. Malabanan",
    credentials: jinky?.credentials,
    role: "Department Head · Chief Psychologist",
  };
  const clinicalStaff = [
    {
      name: "Dr. Aevon Mustapha",
      credentials: getDoctor("Aevon Mustapha")?.credentials,
      role: "Clinic Psychiatrist",
    },
    buildMember("Cristine Lae Erasga"),
    buildMember("Christine Anne Villamarzo"),
    buildMember("Almie Buco"),
  ];

  const adminHead = {
    name: "Marwin Gilbero Jr.",
    fullName: "Mr. Marwin Gilbero Jr.",
    credentials: getDoctor("Marwin Gilbero Jr.")?.credentials,
    role: "Department Head · HR & Clinic Operations",
  };
  const adminStaff = [
    {
      name: "Ms. Erika Mae Faustino",
      credentials: "",
      role: "Admissions Administrator",
    },
    {
      name: "Ms. Joy Mariz Malabanan",
      credentials: "",
      role: "Accounts & Payroll Officer",
    },
    {
      name: "Mr. Cresencio Estrada III",
      credentials: "",
      role: "Admin Officer",
    },
    { name: "Mr. Jerome Dela Cruz", credentials: "", role: "System Analyst" },
    buildMember("Leera Nae Guevarra", "Learning Head"),
  ];

  const psychHead = {
    name: "Leera Nae Guevarra",
    fullName: "Ms. Leera Nae Guevarra",
    credentials: getDoctor("Leera Nae Guevarra")?.credentials,
    role: "Department Head · Chief Psychometrician",
  };
  const psychStaff = [
    {
      name: "Ms. Erika Mae Faustino",
      credentials: "",
      role: "Internship Training Supervisor",
    },
    buildMember("Marwin Gilbero Jr.", "SPED Program Coordinator"),
    buildMember("Jerome Dela Cruz", "Clinic Psychometrician"),
  ];

  return (
    <>
      {/* Desktop / Tablet */}
      <div className="d-none d-sm-block overflow-auto">
        <img
          src={orgChart}
          alt="Organizational Chart"
          style={{ minWidth: "800px", width: "100%" }}
          className="img-fluid"
        />
      </div>

      {/* Mobile accordion */}
      <div className="d-sm-none p-">
        <AccordionItem
          title="Executive Director"
          subtitle="Chief Psychologist"
          avatarInitials="ED"
          bg="#EEEDFE"
          color="#3C3489"
          head={{
            name: "Jinky C. Malabanan",
            fullName: "Dr. Jinky C. Malabanan",
            credentials: jinky?.credentials,
            role: "Executive Director · Chief Psychologist",
          }}
          staff={[]}
        />
        <AccordionItem
          title="Clinical & therapy"
          subtitle={`${clinicalStaff.length} members`}
          avatarInitials="CT"
          bg="#E1F5EE"
          color="#085041"
          head={clinicalHead}
          staff={clinicalStaff}
        />
        <AccordionItem
          title="Clinic administration"
          subtitle={`${adminStaff.length} members`}
          avatarInitials="CA"
          bg="#E6F1FB"
          color="#0C447C"
          head={adminHead}
          staff={adminStaff}
        />
        <AccordionItem
          title="Psych services & assessment"
          subtitle={`${psychStaff.length} members`}
          avatarInitials="PS"
          bg="#FAECE7"
          color="#712B13"
          head={psychHead}
          staff={psychStaff}
        />
      </div>
    </>
  );
};

export default OrgChart;

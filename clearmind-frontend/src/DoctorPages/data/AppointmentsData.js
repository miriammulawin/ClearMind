// ─────────────────────────────────────────────
//  Color tokens (shared with DoctorAppointment)
// ─────────────────────────────────────────────
export const EVENT_COLORS = {
  online: "#6b7280", // gray — counseling
  physical: "#6b7280", // gray — counseling
  // PA purpose colors (used by modal dots)
  vawc: "#4D227C", // deep purple
  legal: "#8B4545", // maroon
  school: "#1e6091", // navy blue
  work: "#2d6a4f", // forest green
};

// ─────────────────────────────────────────────
//  Raw appointment records
// ─────────────────────────────────────────────
const appointments = [
  // ── Counseling / Therapy ──────────────────────────────────────────────

  {
    id: "APT-001",
    title: "Online Clinic",
    start: new Date(2026, 0, 5, 9, 0),
    end: new Date(2026, 0, 5, 10, 0),
    allDay: false,
    patientName: "Liezel Paciente",
    gender: "Female",
    visitType: "New Concern",
    serviceType: "Counseling / Therapy",
    status: "Scheduled",
    reason: "Persistent headache and dizziness for 3 days",
    payment: "Paid",
    rescheduledTo: null,
  },
  {
    id: "APT-002",
    title: "Physical Clinic",
    start: new Date(2026, 0, 15, 11, 0),
    end: new Date(2026, 0, 15, 12, 0),
    allDay: false,
    patientName: "Juan dela Cruz",
    gender: "Male",
    visitType: "Follow-up",
    serviceType: "Counseling / Therapy",
    status: "Rescheduled",
    reason: "Follow-up on anxiety management sessions",
    payment: "Paid",
    rescheduledTo: {
      date: "2026-01-22",
      startTime: "14:00",
      endTime: "15:00",
      reason: "Patient requested reschedule due to work conflict",
    },
  },
  {
    id: "APT-003",
    title: "Physical Clinic",
    start: new Date(2026, 0, 28, 13, 0),
    end: new Date(2026, 0, 28, 14, 0),
    allDay: false,
    patientName: "Maria Santos",
    gender: "Female",
    visitType: "New Concern",
    serviceType: "Counseling / Therapy",
    status: "Completed",
    reason: "Grief counseling after loss of family member",
    payment: "Paid",
    rescheduledTo: null,
  },
  {
    id: "APT-004",
    title: "Online Clinic",
    start: new Date(2026, 1, 10, 10, 0),
    end: new Date(2026, 1, 10, 11, 0),
    allDay: false,
    patientName: "Roberto Reyes",
    gender: "Male",
    visitType: "Follow-up",
    serviceType: "Counseling / Therapy",
    status: "Rescheduled",
    reason: "Follow-up on depression management",
    payment: "Paid",
    rescheduledTo: {
      date: "2026-02-17",
      startTime: "09:00",
      endTime: "10:00",
      reason: "Doctor unavailable on original date",
    },
  },
  {
    id: "APT-005",
    title: "Physical Clinic",
    start: new Date(2026, 1, 24, 15, 0),
    end: new Date(2026, 1, 24, 16, 0),
    allDay: false,
    patientName: "Anna Villanueva",
    gender: "Female",
    visitType: "New Concern",
    serviceType: "Counseling / Therapy",
    status: "Scheduled",
    reason: "Stress and burnout from work",
    payment: "Paid",
    rescheduledTo: null,
  },

  // ── Psych Assessment — VAWC (Female) ─────────────────────────────────

  {
    id: "APT-006",
    title: "Physical Clinic",
    start: new Date(2026, 2, 10, 9, 0),
    end: new Date(2026, 2, 10, 10, 0),
    allDay: false,
    patientName: "Maria Esperanza Santos",
    gender: "Female",
    visitType: "Initial Assessment",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "VAWC",
    status: "Confirmed",
    reason: "Referral from Barangay VAWC desk",
    initialComplaint:
      "Patient reports repeated physical and emotional abuse by live-in partner over the past 8 months. States she is afraid to leave due to threats against her children. Referred by barangay VAWC officer after neighbor report.",
    payment: "Paid",
    rescheduledTo: null,
    // Assessment session info
    assessmentSession: null,
  },

  // ── Psych Assessment — Adoption or Legal ─────────────────────────────

  {
    id: "APT-007",
    title: "Online Clinic",
    start: new Date(2026, 2, 10, 11, 0),
    end: new Date(2026, 2, 10, 12, 0),
    allDay: false,
    patientName: "Ana Reyes",
    gender: "Female",
    visitType: "Evaluation",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "Adoption or Legal",
    status: "Confirmed",
    reason: "Court-ordered psychological evaluation for custody case",
    initialComplaint:
      "Patient is subject of a custody dispute. Court has requested full psychological evaluation to assess parenting capacity and child welfare. Referred by CSWD Case Worker Ms. Rivera.",
    payment: "Paid",
    rescheduledTo: null,
    assessmentSession: null,
  },

  // ── Psych Assessment — School / Academic (HAS supporting docs) ────────
  // APT-008: Carlo Mendoza — patient uploaded a school report + incident report

  {
    id: "APT-008",
    title: "Physical Clinic",
    start: new Date(2026, 2, 10, 13, 0),
    end: new Date(2026, 2, 10, 14, 0),
    allDay: false,
    patientName: "Carlo Mendoza",
    gender: "Male",
    visitType: "Assessment",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "School / Academic Support",
    status: "Confirmed",
    reason:
      "Learning disability screening requested by school guidance counselor",
    initialComplaint: null,
    payment: "Paid",
    rescheduledTo: null,
    assessmentSession: null,
    // Patient-uploaded supporting documents (optional)
    schoolDocuments: [
      {
        label: "School Incident Report",
        filename: "Carlo_Mendoza_Incident_Report.pdf",
        uploadedBy: "Carlo Mendoza",
        uploadedAt: "2026-03-08",
      },
      {
        label: "Guidance Counselor Referral",
        filename: "Carlo_Mendoza_GC_Referral.pdf",
        uploadedBy: "Guidance Office — San Isidro High School",
        uploadedAt: "2026-03-07",
      },
    ],
  },

  // ── Psych Assessment — Work-Related (stress, not pre-employment) ──────

  {
    id: "APT-009",
    title: "Online Clinic",
    start: new Date(2026, 2, 10, 14, 0),
    end: new Date(2026, 2, 10, 15, 0),
    allDay: false,
    patientName: "Liza Flores",
    gender: "Female",
    visitType: "Assessment",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "Work-Related",
    status: "Confirmed",
    // Changed: stress at work, not pre-employment clearance
    reason:
      "Employee referred by HR due to persistent work-related stress, difficulty concentrating, and reported emotional breakdowns during work hours over the past month.",
    initialComplaint: null,
    payment: "Unpaid",
    rescheduledTo: null,
    assessmentSession: null,
  },

  // ── Psych Assessment — VAWC (Female, Rescheduled) ────────────────────

  {
    id: "APT-010",
    title: "Physical Clinic",
    start: new Date(2026, 2, 14, 9, 0),
    end: new Date(2026, 2, 14, 10, 0),
    allDay: false,
    patientName: "Rosario Dela Vega",
    gender: "Female",
    visitType: "Initial Assessment",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "VAWC",
    status: "Rescheduled",
    reason: "Referral from Women's Crisis Center",
    initialComplaint:
      "Patient presents with signs of prolonged emotional and economic abuse by spouse. She reports being denied access to finances and being isolated from family for over a year.",
    payment: "Unpaid",
    rescheduledTo: {
      date: "2026-03-21",
      startTime: "10:00",
      endTime: "11:00",
      reason:
        "Patient requested a safer time to attend without spouse's knowledge",
    },
    assessmentSession: null,
  },

  // ── Psych Assessment — Adoption or Legal (Rescheduled) ───────────────

  {
    id: "APT-011",
    title: "Physical Clinic",
    start: new Date(2026, 2, 18, 10, 0),
    end: new Date(2026, 2, 18, 11, 0),
    allDay: false,
    patientName: "Benjamin Ocampo",
    gender: "Male",
    visitType: "Evaluation",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "Adoption or Legal",
    status: "Rescheduled",
    reason: "PACO referral for parole psychological clearance",
    initialComplaint:
      "Subject referred by PACO officer for mandatory psychological evaluation as part of parole conditions. Has completed 6 months of community service.",
    payment: "Paid",
    rescheduledTo: {
      date: "2026-03-25",
      startTime: "13:00",
      endTime: "14:00",
      reason: "Psychologist unavailable on original date",
    },
    assessmentSession: null,
  },

  // ── Psych Assessment — School / Academic (NO supporting docs) ─────────
  // APT-012: Sofia Ramos — no documents uploaded; section is hidden entirely

  {
    id: "APT-012",
    title: "Online Clinic",
    start: new Date(2026, 2, 20, 15, 0),
    end: new Date(2026, 2, 20, 16, 0),
    allDay: false,
    patientName: "Sofia Ramos",
    gender: "Female",
    visitType: "Assessment",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "School / Academic Support",
    status: "Scheduled",
    reason: "IQ and aptitude testing for special education placement",
    initialComplaint: null,
    payment: "Paid",
    rescheduledTo: null,
    assessmentSession: null,
    // No documents uploaded — section will be hidden
    schoolDocuments: [],
  },

  // ── Psych Assessment — Session 2: Discussion of Physical Assessment ───
  // APT-013: Carlo Mendoza returns for Session 2 after APT-008.
  // The psychologist discusses the results of the initial assessment.

  {
    id: "APT-013",
    title: "Physical Clinic",
    start: new Date(2026, 2, 24, 13, 0),
    end: new Date(2026, 2, 24, 14, 0),
    allDay: false,
    patientName: "Carlo Mendoza",
    gender: "Male",
    visitType: "Follow-up Assessment",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "School / Academic Support",
    status: "Scheduled",
    reason:
      "Discussion of results from initial psychological assessment (Session 2)",
    initialComplaint: null,
    payment: "Paid",
    rescheduledTo: null,
    schoolDocuments: [],
    // Session info — links this appointment to a prior session
    assessmentSession: {
      sessionNumber: 2,
      sessionType: "Discussion of Psychological Assessment Results",
      linkedSessionId: "APT-008", // the initial assessment this discusses
      sessionNotes:
        "Psychologist will present and explain findings from Session 1 IQ and learning disability screening. Parent/guardian advised to attend.",
    },
  },

  // ── Psych Assessment — Release of Certificate ─────────────────────────
  // APT-014: Carlo Mendoza — scheduled certificate release after assessment.

  {
    id: "APT-014",
    title: "Physical Clinic",
    start: new Date(2026, 2, 31, 13, 0),
    end: new Date(2026, 2, 31, 14, 0),
    allDay: false,
    patientName: "Carlo Mendoza",
    gender: "Male",
    visitType: "Certificate Release",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "School / Academic Support",
    status: "Scheduled",
    reason: "Release of Psychological Assessment Certificate / Report",
    initialComplaint: null,
    payment: "Paid",
    rescheduledTo: null,
    schoolDocuments: [],
    // Certificate release info
    assessmentSession: {
      sessionNumber: 3,
      sessionType: "Release of Certificate",
      linkedSessionId: "APT-008",
      sessionNotes:
        "Official psychological assessment certificate and written report will be released to the patient or authorized representative. Valid government-issued ID required upon release.",
    },
  },
  // ── Psych Assessment — Pre-Employment ────────────────────────────────

  {
    id: "APT-015",
    title: "Physical Clinic",
    start: new Date(2026, 2, 17, 9, 0),
    end: new Date(2026, 2, 17, 11, 0),
    allDay: false,
    patientName: "Sofia Mendoza",
    gender: "Female",
    visitType: "New Concern",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "Pre-Employment",
    status: "Confirmed",
    reason: "Pre-employment psychological clearance",
    employerName: "BDO Unibank, Inc.",
    purposeOfAssessment:
      "Psychological fitness evaluation required prior to onboarding for the position of Branch Operations Officer.",
    payment: "Paid",
    rescheduledTo: null,
    assessmentSession: null,
  },

  {
    id: "APT-016",
    title: "Physical Clinic",
    start: new Date(2026, 2, 19, 13, 0),
    end: new Date(2026, 2, 19, 15, 0),
    allDay: false,
    patientName: "Gerald Bautista",
    gender: "Male",
    visitType: "New Concern",
    serviceType: "Psychological Assessment and Evaluation",
    assessmentPurpose: "Pre-Employment",
    status: "Confirmed",
    reason: "Pre-employment screening for government position",
    employerName: "Philippine National Police (PNP)",
    purposeOfAssessment:
      "Mandatory pre-employment psychological screening for law enforcement applicant as required by PNP entry standards.",
    payment: "Unpaid",
    rescheduledTo: null,
    assessmentSession: null,
  },

  // ── Emotional Support Animal (ESA) ───────────────────────────────────

  {
    id: "APT-017",
    title: "Physical Clinic",
    start: new Date(2026, 2, 20, 10, 0),
    end: new Date(2026, 2, 20, 11, 0),
    allDay: false,
    patientName: "Carla Villanueva",
    gender: "Female",
    visitType: "New Concern",
    serviceType: "Emotional Support Animal (ESA)",
    assessmentPurpose: null,
    status: "Confirmed",
    reason: "ESA letter for local travel accommodation",
    placeOfTravel: "Local",
    travelDestination: "Cebu City, Philippines",
    hasExistingDiagnosis: true,
    existingDiagnosisNote:
      "Patient has an existing diagnosis of Generalized Anxiety Disorder (GAD) from a previous clinician.",
    diagnosisDocuments: [
      {
        label: "Previous Clinical Diagnosis",
        filename: "GAD_Diagnosis_Certificate.pdf",
      },
    ],
    payment: "Paid",
    rescheduledTo: null,
    assessmentSession: null,
  },

  {
    id: "APT-018",
    title: "Physical Clinic",
    start: new Date(2026, 2, 24, 9, 0),
    end: new Date(2026, 2, 24, 10, 0),
    allDay: false,
    patientName: "Marco Lim",
    gender: "Male",
    visitType: "New Concern",
    serviceType: "Emotional Support Animal (ESA)",
    assessmentPurpose: null,
    status: "Confirmed",
    reason: "ESA letter required for international airline travel",
    placeOfTravel: "International",
    travelDestination: "Toronto, Canada",
    hasExistingDiagnosis: false,
    existingDiagnosisNote: null,
    diagnosisDocuments: [],
    payment: "Paid",
    rescheduledTo: null,
    assessmentSession: null,
  },

  // ── Mental Health for Internship ─────────────────────────────────────

  {
    id: "APT-019",
    title: "Physical Clinic",
    start: new Date(2026, 2, 25, 13, 0),
    end: new Date(2026, 2, 25, 14, 0),
    allDay: false,
    patientName: "Bianca Torres",
    gender: "Female",
    visitType: "New Concern",
    serviceType: "Mental Health for Internship",
    assessmentPurpose: null,
    status: "Confirmed",
    reason:
      "Mental health clearance required by school prior to clinical internship",
    schoolName: "University of Santo Tomas (UST)",
    program: "Bachelor of Science in Nursing",
    internshipStartDate: "April 7, 2026",
    payment: "Paid",
    rescheduledTo: null,
    assessmentSession: null,
  },

  {
    id: "APT-020",
    title: "Physical Clinic",
    start: new Date(2026, 2, 27, 10, 0),
    end: new Date(2026, 2, 27, 11, 0),
    allDay: false,
    patientName: "Andrei Castillo",
    gender: "Male",
    visitType: "New Concern",
    serviceType: "Mental Health for Internship",
    assessmentPurpose: null,
    status: "Confirmed",
    reason: "Psychological fitness clearance for practicum placement",
    schoolName: "De La Salle University (DLSU)",
    program: "Bachelor of Science in Psychology",
    internshipStartDate: "April 14, 2026",
    payment: "Unpaid",
    rescheduledTo: null,
    assessmentSession: null,
  },
];

// ─────────────────────────────────────────────
//  Build calendar events (+ ghost events for
//  rescheduled appointments on the new date)
// ─────────────────────────────────────────────
function buildCalendarEvents(appts) {
  const result = [];
  appts.forEach((appt) => {
    result.push(appt);
    if (appt.rescheduledTo) {
      const { date, startTime, endTime } = appt.rescheduledTo;
      const [sy, sm, sd] = date.split("-").map(Number);
      const [sh, smin] = startTime.split(":").map(Number);
      const [eh, emin] = endTime.split(":").map(Number);
      result.push({
        ...appt,
        id: `${appt.id}-rescheduled`,
        title: `↪ ${appt.title} (Rescheduled)`,
        start: new Date(sy, sm - 1, sd, sh, smin),
        end: new Date(sy, sm - 1, sd, eh, emin),
        isRescheduledGhost: true,
      });
    }
  });
  return result;
}

export const calendarEvents = buildCalendarEvents(appointments);
export const appointmentsData = appointments;
export default appointments;

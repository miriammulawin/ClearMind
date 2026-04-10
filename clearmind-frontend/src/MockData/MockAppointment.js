// src/data/mockAppointments.js

export const MOCK_APPOINTMENTS = [

  // ══════════════════════════════════════════════════════════════════════════
  // PROGRAM 1 — Psychotherapy and Counseling (Sessions 1–4, Active)
  // Patient: Juan Dela Cruz | Doctor: Almie Buco
  // ══════════════════════════════════════════════════════════════════════════

  // ── SESSION 1 — Completed ─────────────────────────────────────────────────
  {
    id: 1,
    programId: 'PROG-0001',
    sessionNumber: 1,
    totalSessions: 10,
    progressionStatus: 'Active',
    disclaimerAccepted: true,
    declineReason: null,
    doctorHistory: [
      { sessionNumber: 1, doctor: 'Almie Buco' },
    ],
    referenceNumber: 'PAC-0001-2026-01-05',
    time: '4:00 P.M.',
    date: 'January 5, 2026',
    serviceType: 'Psychotherapy and Counseling',
    doctor: 'Almie Buco',
    type: 'Online Consultation',
    status: 'Completed',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'G-cash',
    receiptUrl: '#',
  },

  // ── SESSION 2 — Completed ─────────────────────────────────────────────────
  {
    id: 2,
    programId: 'PROG-0001',
    sessionNumber: 2,
    totalSessions: 10,
    progressionStatus: 'Active',
    disclaimerAccepted: true,
    declineReason: null,
    doctorHistory: [
      { sessionNumber: 1, doctor: 'Almie Buco' },
      { sessionNumber: 2, doctor: 'Almie Buco' },
    ],
    referenceNumber: 'PAC-0002-2026-01-12',
    time: '4:00 P.M.',
    date: 'January 12, 2026',
    serviceType: 'Psychotherapy and Counseling',
    doctor: 'Almie Buco',
    type: 'Online Consultation',
    status: 'Completed',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'G-cash',
    receiptUrl: '#',
  },

  // ── SESSION 3 — Completed (Doctor changed) ────────────────────────────────
  {
    id: 3,
    programId: 'PROG-0001',
    sessionNumber: 3,
    totalSessions: 10,
    progressionStatus: 'Active',
    disclaimerAccepted: true,
    declineReason: null,
    doctorHistory: [
      { sessionNumber: 1, doctor: 'Almie Buco' },
      { sessionNumber: 2, doctor: 'Almie Buco' },
      { sessionNumber: 3, doctor: 'Christine Anne Villamarzo', changeReason: 'Patient requested doctor change' },
    ],
    referenceNumber: 'PAC-0003-2026-01-19',
    time: '10:00 A.M.',
    date: 'January 19, 2026',
    serviceType: 'Psychotherapy and Counseling',
    doctor: 'Christine Anne Villamarzo',
    type: 'Clinic - CMPS',
    status: 'Completed',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'Cash',
    receiptUrl: '#',
  },

  // ── SESSION 4 — Pending (Current/Latest) ──────────────────────────────────
  {
    id: 4,
    programId: 'PROG-0001',
    sessionNumber: 4,
    totalSessions: 10,
    progressionStatus: 'Active',
    disclaimerAccepted: true,
    declineReason: null,
    doctorHistory: [
      { sessionNumber: 1, doctor: 'Almie Buco' },
      { sessionNumber: 2, doctor: 'Almie Buco' },
      { sessionNumber: 3, doctor: 'Christine Anne Villamarzo', changeReason: 'Patient requested doctor change' },
      { sessionNumber: 4, doctor: 'Christine Anne Villamarzo' },
    ],
    referenceNumber: 'PAC-0004-2026-01-26',
    time: '10:00 A.M.',
    date: 'January 26, 2026',
    serviceType: 'Psychotherapy and Counseling',
    doctor: 'Christine Anne Villamarzo',
    type: 'Clinic - CMPS',
    status: 'Pending',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'Cash',
    receiptUrl: '#',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PROGRAM 2 — Psychiatric Assessment (Session 1 only, Discontinued)
  // Patient: Juan Dela Cruz | Doctor: Aevon Mustapha
  // Patient went AWOL after session 1
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 5,
    programId: 'PROG-0002',
    sessionNumber: 1,
    totalSessions: 10,
    progressionStatus: 'Discontinued',
    disclaimerAccepted: true,
    declineReason: {
      reason: 'Personal reasons',
      note: 'Patient opted not to continue after initial session.',
    },
    doctorHistory: [
      { sessionNumber: 1, doctor: 'Aevon Mustapha' },
    ],
    referenceNumber: 'PAE-0005-2026-02-01',
    time: '9:00 A.M.',
    date: 'February 1, 2026',
    serviceType: 'Psychiatric Assessment',
    doctor: 'Aevon Mustapha',
    type: 'Clinic - CMPS',
    status: 'Completed',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'G-cash',
    receiptUrl: '#',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PROGRAM 3 — Mental Health Certification (Session 1, On Hold)
  // Patient: Juan Dela Cruz | Doctor: C. Malabanan
  // Patient requested to pause sessions temporarily
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 6,
    programId: 'PROG-0003',
    sessionNumber: 1,
    totalSessions: 10,
    progressionStatus: 'On Hold',
    disclaimerAccepted: true,
    declineReason: {
      reason: 'Schedule conflict',
      note: 'Patient requested to pause and reschedule next session at a later date.',
    },
    doctorHistory: [
      { sessionNumber: 1, doctor: 'C. Malabanan' },
    ],
    referenceNumber: 'PAC-0006-2026-02-10',
    time: '1:00 P.M.',
    date: 'February 10, 2026',
    serviceType: 'Mental Health Certification',
    doctor: 'C. Malabanan',
    type: 'Clinic - CMPS',
    status: 'Completed',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'G-cash',
    receiptUrl: '#',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // STANDALONE APPOINTMENTS (no program, one-off sessions)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 7,
    programId: null,
    sessionNumber: null,
    totalSessions: null,
    progressionStatus: null,
    disclaimerAccepted: true,
    declineReason: null,
    doctorHistory: null,
    referenceNumber: 'PAC-0007-2026-02-21',
    time: '3:00 P.M.',
    date: 'February 21, 2026',
    serviceType: 'Initial Consultation',
    doctor: 'Almie Buco',
    type: 'Online Consultation',
    status: 'Confirmed',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'Cash',
    receiptUrl: '#',
  },
  {
    id: 8,
    programId: null,
    sessionNumber: null,
    totalSessions: null,
    progressionStatus: null,
    disclaimerAccepted: true,
    declineReason: null,
    doctorHistory: null,
    referenceNumber: 'PAE-0008-2026-01-27',
    time: '10:00 A.M.',
    date: 'January 27, 2026',
    serviceType: 'Psychiatric Assessment',
    doctor: 'Aevon Mustapha',
    type: 'Online Consultation',
    status: 'Cancelled',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'G-cash',
    receiptUrl: '#',
  },
  {
    id: 9,
    programId: null,
    sessionNumber: null,
    totalSessions: null,
    progressionStatus: null,
    disclaimerAccepted: true,
    declineReason: null,
    doctorHistory: null,
    referenceNumber: 'PAE-0009-2026-01-25',
    time: '3:00 P.M.',
    date: 'January 25, 2026',
    serviceType: 'Psychiatric Assessment',
    doctor: 'Cristine Lae Erasga',
    type: 'Clinic - CMPS',
    status: 'Cancelled',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'Cash',
    receiptUrl: '#',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export const getAppointmentById = (id) =>
  MOCK_APPOINTMENTS.find((apt) => apt.id === parseInt(id));

export const getAppointmentsByStatus = (status) =>
  MOCK_APPOINTMENTS.filter((apt) => apt.status === status);

// Get all sessions belonging to a program, sorted by session number
export const getSessionsByProgram = (programId) =>
  MOCK_APPOINTMENTS
    .filter((apt) => apt.programId === programId)
    .sort((a, b) => a.sessionNumber - b.sessionNumber);

// Get the latest session in a program (the most recent sessionNumber)
export const getLatestSession = (programId) => {
  const sessions = getSessionsByProgram(programId);
  return sessions[sessions.length - 1] ?? null;
};

// Get all unique active programs
export const getActivePrograms = () => {
  const seen = new Set();
  return MOCK_APPOINTMENTS.filter((apt) => {
    if (!apt.programId || seen.has(apt.programId)) return false;
    seen.add(apt.programId);
    return apt.progressionStatus === 'Active';
  });
};

// Check if a program is eligible for next session booking
// (latest session must be Completed and progressionStatus must be Active)
export const canProceedToNextSession = (programId) => {
  const latest = getLatestSession(programId);
  if (!latest) return false;
  return (
    latest.status === 'Completed' &&
    latest.progressionStatus === 'Active' &&
    latest.sessionNumber < latest.totalSessions
  );
};

export default MOCK_APPOINTMENTS;
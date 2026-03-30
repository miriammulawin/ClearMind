// src/MockData/MockDoctors.js

// ... (keep all helpers and slot templates unchanged) ...

export const MOCK_DOCTORS = [
  // ─── Psychologists ────────────────────────────────────────────────────────

  {
    id: 1,
    name: "Almie Buco",
    title: "Clinic Psychologist",
    credentials: "RPsy, RPm, CHRA, CSPE",
    avatar: null,
    consultationType: "Virtual Clinic",
    consultationMode: "Virtual",
    virtualDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    onSiteDays: [],
    schedule: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      time: "4:00 PM - 7:00 PM",
    },
    consultationFees: {
      initialConsultation: 2500,
      followUpConsultation: 2000,
      psychotherapy: 2500,
      mentalHealthCertification: 1500,
    },
    get availability() {
      return buildAvailability([
        { days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], slots: SLOTS_4PM_7PM },
      ], 12);
    },
  },
  {
    id: 2,
    name: "Christine Anne Villamarzo",
    title: "Clinic Psychologist",
    credentials: "RPsy, RPm, CHRA, CSPE",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS)",
    consultationMode: "Onsite",
    onSiteDays: ["Monday", "Tuesday", "Friday"],
    virtualDays: [],
    schedule: {
      days: ["Monday", "Tuesday", "Friday"],
      time: "10:00 AM - 4:00 PM",
    },
    consultationFees: {
      initialConsultation: 2500,
      followUpConsultation: 2000,
      psychotherapy: 2500,
      mentalHealthCertification: 1500,
    },
    get availability() {
      return buildAvailability([
        { days: ["Monday","Tuesday","Friday"], slots: SLOTS_10AM_4PM },
      ], 12);
    },
  },
  {
    id: 3,
    name: "C. Malabanan",
    title: "Executive Director",
    credentials: "RPsy, RPm, CHRA",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS) & Virtual",
    consultationMode: "Both",
    onSiteDays: ["Thursday"],
    virtualDays: ["Tuesday"],
    schedule: {
      days: ["Thursday", "Tuesday"],
      time: "1:00 PM - 7:00 PM (On-Site Thu) · 6:00 PM - 9:00 PM (Virtual Tue)",
    },
    consultationFees: {
      initialConsultation: 3000,
      followUpConsultation: 2500,
      psychotherapy: 3000,
      mentalHealthCertification: 2000,
    },
    get availability() {
      return buildAvailability([
        { days: ["Thursday"], slots: SLOTS_1PM_7PM },
        { days: ["Tuesday"],  slots: SLOTS_6PM_9PM },
      ], 12);
    },
  },
  {
    id: 4,
    name: "Cristine Lae Erasga",
    title: "Clinic Psychologist",
    credentials: "RPsy, RPm, CHRA, CSPE",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS)",
    consultationMode: "Onsite",
    onSiteDays: ["Saturday"],
    virtualDays: [],
    schedule: {
      days: ["Saturday"],
      time: "3:30 PM - 7:30 PM",
    },
    consultationFees: {
      initialConsultation: 2500,
      followUpConsultation: 2000,
      psychotherapy: 2500,
      mentalHealthCertification: 1500,
    },
    get availability() {
      return buildAvailability([
        { days: ["Saturday"], slots: SLOTS_3_30PM_7_30PM },
      ], 12);
    },
  },

  // ─── Psychiatrist ─────────────────────────────────────────────────────────

  {
    id: 5,
    name: "Aevon Mustapha",
    title: "Clinic Psychiatrist",
    credentials: "MD",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS)",
    consultationMode: "Onsite",
    onSiteDays: ["Wednesday", "Saturday"],
    virtualDays: [],
    schedule: {
      days: ["Wednesday", "Saturday"],
      time: "9:00 AM - 12:00 PM",
    },
    consultationFees: {
      initialConsultation: 3500,
      followUpConsultation: 3000,
      psychiatricAssessment: 4000,
      mentalHealthCertification: 2000,
    },
    get availability() {
      return buildAvailability([
        { days: ["Wednesday", "Saturday"], slots: SLOTS_9AM_12PM },
      ], 12);
    },
  },

  // ─── Psychometricians ─────────────────────────────────────────────────────

  {
    id: 6,
    name: "Leera Nae Guevarra",
    title: "Chief Psychometrician / Learning Head",
    credentials: "RPm",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS) & Virtual",
    consultationMode: "Both",
    onSiteDays: ["Monday", "Wednesday"],
    virtualDays: ["Friday"],
    schedule: {
      days: ["Monday", "Wednesday", "Friday"],
      time: "8:00 AM - 12:00 PM (On-Site Mon & Wed) · 1:00 PM - 5:00 PM (Virtual Fri)",
    },
    consultationFees: {
      initialConsultation: 1500,
      followUpConsultation: 1200,
      psychometricTesting: 2000,
    },
    get availability() {
      return buildAvailability([
        { days: ["Monday", "Wednesday"], slots: SLOTS_8AM_12PM },
        { days: ["Friday"],             slots: SLOTS_1PM_5PM  },
      ], 12);
    },
  },
  {
    id: 7,
    name: "Jerome Dela Cruz",
    title: "Clinic Psychometrician",
    credentials: "RPm",
    avatar: null,
    consultationType: "Virtual Clinic",
    consultationMode: "Virtual",
    onSiteDays: [],
    virtualDays: ["Tuesday", "Thursday"],
    schedule: {
      days: ["Tuesday", "Thursday"],
      time: "10:00 AM - 2:00 PM",
    },
    consultationFees: {
      initialConsultation: 1500,
      followUpConsultation: 1200,
      psychometricTesting: 2000,
    },
    get availability() {
      return buildAvailability([
        { days: ["Tuesday", "Thursday"], slots: SLOTS_10AM_2PM },
      ], 12);
    },
  },
  {
    id: 8,
    name: "Marwin Gilbero Jr.",
    title: "Department Head / HR & Clinic Operations",
    credentials: "RPm, CHRA",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS)",
    consultationMode: "Onsite",
    onSiteDays: ["Tuesday", "Thursday", "Saturday"],
    virtualDays: [],
    schedule: {
      days: ["Tuesday", "Thursday", "Saturday"],
      time: "1:00 PM - 5:00 PM",
    },
    consultationFees: {
      initialConsultation: 1500,
      followUpConsultation: 1200,
      psychometricTesting: 2000,
    },
    get availability() {
      return buildAvailability([
        { days: ["Tuesday", "Thursday", "Saturday"], slots: SLOTS_1PM_5PM },
      ], 12);
    },
  },
];

export const CONSULTATION_FEES = {
  psychologist: {
    initialConsultation: 2500,
    followUpConsultation: 2000,
    psychotherapy: 2500,
    mentalHealthCertification: 1500,
  },
  psychiatrist: {
    initialConsultation: 3500,
    followUpConsultation: 3000,
    psychiatricAssessment: 4000,
    mentalHealthCertification: 2000,
  },
  psychometrician: {
    initialConsultation: 1500,
    followUpConsultation: 1200,
    psychometricTesting: 2000,
  },
};

export const getDoctorById = (id) => {
  return MOCK_DOCTORS.find(doctor => doctor.id === parseInt(id));
};

export const getAvailableDoctors = () => {
  return MOCK_DOCTORS.filter(doctor =>
    doctor.availability.some(avail =>
      avail.slots.some(slot => slot.available)
    )
  );
};

export default MOCK_DOCTORS;
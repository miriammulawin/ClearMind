// src/MockData/MockDoctors.js
import Holidays from "date-holidays";

const hd = new Holidays("PH");

const isPhilippineHoliday = (date) => {
  const result = hd.isHoliday(date);
  return result !== false;
};

// ── Slot Templates ────────────────────────────────────────────────────────────

const createSlots = (times) => times.map((time) => ({ time, available: true }));

const SLOTS_4PM_7PM = createSlots([
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
]);
const SLOTS_10AM_4PM = createSlots([
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
]);
const SLOTS_1PM_7PM = createSlots([
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
]);
const SLOTS_6PM_9PM = createSlots([
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
]);
const SLOTS_3_30PM_7_30PM = createSlots([
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
]);
const SLOTS_9AM_12PM = createSlots([
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
]);
const SLOTS_8AM_12PM = createSlots([
  "8:00 AM",
  "8:30 AM",
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
]);
const SLOTS_1PM_5PM = createSlots([
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
]);
const SLOTS_10AM_2PM = createSlots([
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
]);

// ── Availability Builder ──────────────────────────────────────────────────────

const DAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const buildAvailability = (schedule, weeksAhead = 12) => {
  const result = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let w = 0; w < weeksAhead; w++) {
    schedule.forEach(({ days, slots }) => {
      days.forEach((dayName) => {
        const dayIndex = DAY_ORDER.indexOf(dayName);
        if (dayIndex === -1) return;

        // Start from tomorrow
        const date = new Date(today);
        date.setDate(today.getDate() + 1);

        // Advance to the correct weekday
        while (date.getDay() !== dayIndex) {
          date.setDate(date.getDate() + 1);
        }

        // Add w full weeks for subsequent occurrences
        date.setDate(date.getDate() + w * 7);

        // ✅ Skip Philippine holidays
        if (isPhilippineHoliday(date)) return;

        const dateStr = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });

        result.push({
          date: dateStr,
          day: dayName,
          slots: slots.map((s) => ({ ...s })),
        });
      });
    });
  }

  return result;
};

// ── Doctors ───────────────────────────────────────────────────────────────────

export const MOCK_DOCTORS = [
  {
    id: 1,
    name: "Almie Buco",
    title: "Clinic Psychologist",
    sex: "Female",
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
      return buildAvailability(
        [
          {
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            slots: SLOTS_4PM_7PM,
          },
        ],
        12,
      );
    },
  },
  {
    id: 2,
    name: "Christine Anne Villamarzo",
    title: "Clinic Psychologist",
    sex: "Female",
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
      return buildAvailability(
        [{ days: ["Monday", "Tuesday", "Friday"], slots: SLOTS_10AM_4PM }],
        12,
      );
    },
  },
  {
    id: 3,
    name: "Jinky C. Malabanan",
    title: "Executive Director",
    sex: "Female",
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
      return buildAvailability(
        [
          { days: ["Thursday"], slots: SLOTS_1PM_7PM },
          { days: ["Tuesday"], slots: SLOTS_6PM_9PM },
        ],
        12,
      );
    },
  },
  {
    id: 4,
    name: "Cristine Lae Erasga",
    title: "Clinic Psychologist",
    sex: "Female",
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
      return buildAvailability(
        [{ days: ["Saturday"], slots: SLOTS_3_30PM_7_30PM }],
        12,
      );
    },
  },
  {
    id: 5,
    name: "Aevon Mustapha",
    title: "Clinic Psychiatrist",
    sex: "Male",
    credentials: "MD, RPm",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS)",
    consultationMode: "Onsite",
    onSiteDays: ["Tuesday", "Wednesday"],
    virtualDays: [],
    schedule: {
      days: ["Tuesday", "Wednesday"],
      time: "10:00 AM - 2:00 PM",
    },
    consultationFees: {
      initialConsultation: 4000,
      followUpConsultation: 3000,
    },
    get availability() {
      return buildAvailability(
        [{ days: ["Tuesday", "Wednesday"], slots: SLOTS_10AM_2PM }],
        12,
      );
    },
  },
  {
    id: 6,
    name: "Leera Nae Guevarra",
    sex: "Female",
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
      return buildAvailability(
        [
          { days: ["Monday", "Wednesday"], slots: SLOTS_8AM_12PM },
          { days: ["Friday"], slots: SLOTS_1PM_5PM },
        ],
        12,
      );
    },
  },
  {
    id: 7,
    name: "Jerome Dela Cruz",
    sex: "Male",
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
      return buildAvailability(
        [{ days: ["Tuesday", "Thursday"], slots: SLOTS_10AM_2PM }],
        12,
      );
    },
  },
  {
    id: 8,
    name: "Marwin Gilbero Jr.",
    sex: "Male",
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
      return buildAvailability(
        [{ days: ["Tuesday", "Thursday", "Saturday"], slots: SLOTS_1PM_5PM }],
        12,
      );
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

export const getDoctorById = (id) =>
  MOCK_DOCTORS.find((doctor) => doctor.id === parseInt(id));

export const getAvailableDoctors = () =>
  MOCK_DOCTORS.filter((doctor) =>
    doctor.availability.some((avail) =>
      avail.slots.some((slot) => slot.available),
    ),
  );

export default MOCK_DOCTORS;

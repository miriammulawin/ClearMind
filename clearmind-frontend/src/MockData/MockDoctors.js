// src/MockData/MockDoctors.js
//
// HOW SLOTS WORK:
// - Each slot = one 30-minute block
// - available: true  → this 30-min block is FREE (unoccupied)
// - available: false → this 30-min block is TAKEN/BLOCKED
//
// A user can BOOK a 1-hour session starting at slot X only if:
//   slot[X].available === true  AND  slot[X+1].available === true
//
// Availability is generated dynamically based on the current date.
// Each doctor shows their next 4 upcoming days that match their schedule.

// ─── Helper: get next N dates matching given day names ────────────────────────
const getUpcomingDates = (dayNames, count = 4) => {
  const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const results = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = new Date(today);
  cursor.setDate(cursor.getDate() + 1); // start from tomorrow

  while (results.length < count) {
    const dayName = DAY_NAMES[cursor.getDay()];
    if (dayNames.includes(dayName)) {
      results.push({
        date: cursor.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        day: dayName,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
};

// ─── Helper: build availability array from day configs ────────────────────────
// dayConfigs: [{ days: [...], slots: [...] }, ...]
const buildAvailability = (dayConfigs, count = 12) => {
  const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const allDays = dayConfigs.flatMap(c => c.days);
  const results = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cursor = new Date(today);
  cursor.setDate(cursor.getDate() + 1);

  while (results.length < count) {
    const dayName = DAY_NAMES[cursor.getDay()];
    if (allDays.includes(dayName)) {
      const config = dayConfigs.find(c => c.days.includes(dayName));
      results.push({
        date: cursor.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        day: dayName,
        slots: config.slots.map(s => ({ ...s })),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
};

// ─── Slot templates ───────────────────────────────────────────────────────────
const SLOTS_4PM_7PM = [
  { time: "4:00 PM", available: true },
  { time: "4:30 PM", available: true },
  { time: "5:00 PM", available: true },
  { time: "5:30 PM", available: true },
  { time: "6:00 PM", available: true },
  { time: "6:30 PM", available: true },
];

const SLOTS_10AM_4PM = [
  { time: "10:00 AM", available: true },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: true },
  { time: "12:00 PM", available: true },
  { time: "12:30 PM", available: true },
  { time: "1:00 PM",  available: true },
  { time: "1:30 PM",  available: true },
  { time: "2:00 PM",  available: true },
  { time: "2:30 PM",  available: true },
  { time: "3:00 PM",  available: true },
  { time: "3:30 PM",  available: true },
];

const SLOTS_1PM_7PM = [
  { time: "1:00 PM", available: true },
  { time: "1:30 PM", available: true },
  { time: "2:00 PM", available: true },
  { time: "2:30 PM", available: true },
  { time: "3:00 PM", available: true },
  { time: "3:30 PM", available: true },
  { time: "4:00 PM", available: true },
  { time: "4:30 PM", available: true },
  { time: "5:00 PM", available: true },
  { time: "5:30 PM", available: true },
  { time: "6:00 PM", available: true },
  { time: "6:30 PM", available: true },
];

const SLOTS_6PM_9PM = [
  { time: "6:00 PM", available: true },
  { time: "6:30 PM", available: true },
  { time: "7:00 PM", available: true },
  { time: "7:30 PM", available: true },
  { time: "8:00 PM", available: true },
  { time: "8:30 PM", available: true },
];

const SLOTS_3_30PM_7_30PM = [
  { time: "3:30 PM", available: true },
  { time: "4:00 PM", available: true },
  { time: "4:30 PM", available: true },
  { time: "5:00 PM", available: true },
  { time: "5:30 PM", available: true },
  { time: "6:00 PM", available: true },
  { time: "6:30 PM", available: true },
  { time: "7:00 PM", available: true },
];

const SLOTS_9AM_12PM = [
  { time: "9:00 AM",  available: true },
  { time: "9:30 AM",  available: true },
  { time: "10:00 AM", available: true },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: true },
];

const SLOTS_8AM_12PM = [
  { time: "8:00 AM",  available: true },
  { time: "8:30 AM",  available: true },
  { time: "9:00 AM",  available: true },
  { time: "9:30 AM",  available: true },
  { time: "10:00 AM", available: true },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: true },
];

const SLOTS_1PM_5PM = [
  { time: "1:00 PM", available: true },
  { time: "1:30 PM", available: true },
  { time: "2:00 PM", available: true },
  { time: "2:30 PM", available: true },
  { time: "3:00 PM", available: true },
  { time: "3:30 PM", available: true },
  { time: "4:00 PM", available: true },
  { time: "4:30 PM", available: true },
];

const SLOTS_10AM_2PM = [
  { time: "10:00 AM", available: true },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: true },
  { time: "12:00 PM", available: true },
  { time: "12:30 PM", available: true },
  { time: "1:00 PM",  available: true },
  { time: "1:30 PM",  available: true },
];

// ─── Doctor definitions ───────────────────────────────────────────────────────
export const MOCK_DOCTORS = [
  {
    id: 1,
    name: "Almie M. Buco",
    title: "Psychologist",
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
    get availability() {
      return buildAvailability([
        { days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], slots: SLOTS_4PM_7PM },
      ], 12);
    },
  },
  {
    id: 2,
    name: "Christine Anne Villamarzo",
    title: "Psychologist",
    credentials: "PhD, RPsy, RPm, CHRA, CSPE",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS)",
    consultationMode: "Onsite",
    onSiteDays: ["Monday", "Tuesday", "Friday"],
    virtualDays: [],
    schedule: {
      days: ["Monday", "Tuesday", "Friday"],
      time: "10:00 AM - 4:00 PM",
    },
    get availability() {
      return buildAvailability([
        { days: ["Monday","Tuesday","Friday"], slots: SLOTS_10AM_4PM },
      ], 12);
    },
  },
  {
    id: 3,
    name: "Jinky Malabanan",
    title: "Psychologist",
    credentials: "PhD, RPsy, RPm, CHRA, CSPE",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS) & Virtual",
    consultationMode: "Both",
    onSiteDays: ["Thursday"],
    virtualDays: ["Tuesday"],
    schedule: {
      days: ["Thursday", "Tuesday"],
      time: "1:00 PM - 7:00 PM (On-Site Thu) · 6:00 PM - 9:00 PM (Virtual Tue)",
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
    title: "Psychologist",
    credentials: "PhD, RPsy, RPm, CHRA, CSPE",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS)",
    consultationMode: "Onsite",
    onSiteDays: ["Saturday"],
    virtualDays: [],
    schedule: {
      days: ["Saturday"],
      time: "3:30 PM - 7:30 PM",
    },
    get availability() {
      return buildAvailability([
        { days: ["Saturday"], slots: SLOTS_3_30PM_7_30PM },
      ], 12);
    },
  },

  // ─── Psychometricians ─────────────────────────────────────────────────────────

  {
    // Female #1 — existing
    id: 5,
    name: "Maria Lourdes R. Santos",
    title: "Psychometrician",
    credentials: "RPm",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS)",
    consultationMode: "Onsite",
    onSiteDays: ["Wednesday", "Saturday"],
    virtualDays: [],
    schedule: {
      days: ["Wednesday", "Saturday"],
      time: "9:00 AM - 12:00 PM",
    },
    get availability() {
      return buildAvailability([
        { days: ["Wednesday", "Saturday"], slots: SLOTS_9AM_12PM },
      ], 12);
    },
  },
  {
    // Female #2
    id: 6,
    name: "Angela Faye D. Reyes",
    title: "Psychometrician",
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
    get availability() {
      return buildAvailability([
        { days: ["Monday", "Wednesday"], slots: SLOTS_8AM_12PM },
        { days: ["Friday"],             slots: SLOTS_1PM_5PM  },
      ], 12);
    },
  },
  {
    // Female #3
    id: 7,
    name: "Patricia Joy B. Navarro",
    title: "Psychometrician",
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
    get availability() {
      return buildAvailability([
        { days: ["Tuesday", "Thursday"], slots: SLOTS_10AM_2PM },
      ], 12);
    },
  },
  {
    // Male #1
    id: 8,
    name: "Ramon Miguel C. Dela Cruz",
    title: "Psychometrician",
    credentials: "RPm",
    avatar: null,
    consultationType: "On-Site Clinic (CMPS)",
    consultationMode: "Onsite",
    onSiteDays: ["Tuesday", "Thursday", "Saturday"],
    virtualDays: [],
    schedule: {
      days: ["Tuesday", "Thursday", "Saturday"],
      time: "1:00 PM - 5:00 PM",
    },
    get availability() {
      return buildAvailability([
        { days: ["Tuesday", "Thursday", "Saturday"], slots: SLOTS_1PM_5PM },
      ], 12);
    },
  },
];

export const CONSULTATION_FEES = {
  initial: 2500,
  followUp: 2500,
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
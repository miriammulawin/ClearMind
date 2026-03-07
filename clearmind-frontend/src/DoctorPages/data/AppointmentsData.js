// ─────────────────────────────────────────────
//  Color tokens (shared with DoctorAppointment)
// ─────────────────────────────────────────────
export const EVENT_COLORS = {
  online:   "#6B7280", // gray
  physical: "#7C3AED", // violet
};

// ─────────────────────────────────────────────
//  Raw appointment records
// ─────────────────────────────────────────────
const appointments = [
  {
    id: "APT-001",
    title: "Online Clinic",
    start: new Date(2026, 0, 5, 9, 0),
    end:   new Date(2026, 0, 5, 10, 0),
    allDay: false,
    patientName: "Liezel Paciente",
    visitType:   "New Concern",
    status:      "Scheduled",
    reason:      "Persistent headache and dizziness for 3 days",
    payment:     "Paid",
    rescheduledTo: null,
  },
  {
    id: "APT-002",
    title: "Physical Clinic",
    start: new Date(2026, 0, 15, 11, 0),
    end:   new Date(2026, 0, 15, 12, 0),
    allDay: false,
    patientName: "Juan dela Cruz",
    visitType:   "Follow-up",
    status:      "Rescheduled",
    reason:      "Follow-up on hypertension medication",
    payment:     "Paid",
    rescheduledTo: {
      date:      "2026-01-22",
      startTime: "14:00",
      endTime:   "15:00",
      reason:    "Patient requested reschedule due to work conflict",
    },
  },
  {
    id: "APT-003",
    title: "Physical Clinic",
    start: new Date(2026, 0, 28, 13, 0),
    end:   new Date(2026, 0, 28, 14, 0),
    allDay: false,
    patientName: "Maria Santos",
    visitType:   "New Concern",
    status:      "Completed",
    reason:      "Skin rash on arms and neck",
    payment:     "Paid",
    rescheduledTo: null,
  },
  {
    id: "APT-004",
    title: "Online Clinic",
    start: new Date(2026, 1, 10, 10, 0),
    end:   new Date(2026, 1, 10, 11, 0),
    allDay: false,
    patientName: "Roberto Reyes",
    visitType:   "Follow-up",
    status:      "Rescheduled",
    reason:      "Review of blood test results",
    payment:     "Paid",
    rescheduledTo: {
      date:      "2026-02-17",
      startTime: "09:00",
      endTime:   "10:00",
      reason:    "Doctor unavailable on original date",
    },
  },
  {
    id: "APT-005",
    title: "Physical Clinic",
    start: new Date(2026, 1, 24, 15, 0),
    end:   new Date(2026, 1, 24, 16, 0),
    allDay: false,
    patientName: "Anna Villanueva",
    visitType:   "New Concern",
    status:      "Scheduled",
    reason:      "Frequent stomach pain after meals",
    payment:     "Paid",
    rescheduledTo: null,
  },
];

// ─────────────────────────────────────────────
//  Build calendar events list.
//  For rescheduled appointments we also inject
//  a ghost event on the NEW date so it appears
//  on the calendar in amber.
// ─────────────────────────────────────────────
function buildCalendarEvents(appts) {
  const calendarEvents = [];

  appts.forEach((appt) => {
    // Original event
    calendarEvents.push(appt);

    // Ghost event on the rescheduled date
    if (appt.rescheduledTo) {
      const { date, startTime, endTime } = appt.rescheduledTo;
      const [sy, sm, sd] = date.split("-").map(Number);
      const [sh, smin] = startTime.split(":").map(Number);
      const [eh, emin] = endTime.split(":").map(Number);

      calendarEvents.push({
        ...appt,
        id:           `${appt.id}-rescheduled`,
        title:        `↪ ${appt.title} (Rescheduled)`,
        start:        new Date(sy, sm - 1, sd, sh, smin),
        end:          new Date(sy, sm - 1, sd, eh, emin),
        isRescheduledGhost: true,
      });
    }
  });

  return calendarEvents;
}

export const calendarEvents   = buildCalendarEvents(appointments);
export const appointmentsData = appointments;
export default appointments;
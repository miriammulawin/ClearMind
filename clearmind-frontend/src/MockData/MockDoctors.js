// src/MockData/MockDoctors.js
//
// HOW SLOTS WORK:
// - Each slot = one 30-minute block
// - available: true  → this 30-min block is FREE (unoccupied)
// - available: true → this 30-min block is TAKEN/BLOCKED
//
// A user can BOOK a 1-hour session starting at slot X only if:
//   slot[X].available === true  AND  slot[X+1].available === true
// (both consecutive 30-min blocks must be free)

export const MOCK_DOCTORS = [
  {
    id: 1,
    name: "Almie M. Buco",
    title: "Psychologist",
    credentials: "RPsy, RPm, CHRA, CSPE",
    avatar: null,
    consultationType: "Online Clinic",
    consultationMode: "Online",
    schedule: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      time: "4:00 PM - 7:00 PM"
    },
    // 4:00 PM - 7:00 PM → slots: 4:00, 4:30, 5:00, 5:30, 6:00, 6:30
    // Bookable starts: any slot where this AND next are both free
    availability: [
      {
        date: "February 13, 2026",
        day: "Thursday",
        slots: [
          { time: "4:00 PM", available: true  }, // 4:00-4:30 free
          { time: "4:30 PM", available: true  }, 
          { time: "5:00 PM", available: true }, // 5:00-5:30 taken
          { time: "5:30 PM", available: true  }, // 5:30-6:00 free
          { time: "6:00 PM", available: true  }, 
          { time: "6:30 PM", available: true  },
        ]
      },
      {
        date: "February 14, 2026",
        day: "Friday",
        slots: [
          { time: "4:00 PM", available: true  },
          { time: "4:30 PM", available: true  },
          { time: "5:00 PM", available: true  },
          { time: "5:30 PM", available: true  },
          { time: "6:00 PM", available: true  },
          { time: "6:30 PM", available: true  },
        ]
      },
      {
        date: "February 17, 2026",
        day: "Monday",
        slots: [
          { time: "4:00 PM", available: true },
          { time: "4:30 PM", available: true  },
          { time: "5:00 PM", available: true  },
          { time: "5:30 PM", available: true  },
          { time: "6:00 PM", available: true  },
          { time: "6:30 PM", available: true  },
        ]
      },
      {
        date: "February 18, 2026",
        day: "Tuesday",
        slots: [
          { time: "4:00 PM", available: true  },
          { time: "4:30 PM", available: true  },
          { time: "5:00 PM", available: true },
          { time: "5:30 PM", available: true  },
          { time: "6:00 PM", available: true  },
          { time: "6:30 PM", available: true  },
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Christine Anne Villamarzo",
    title: "Psychologist",
    credentials: "PhD, RPsy, RPm, CHRA, CSPE",
    avatar: null,
    consultationType: "Clinic - CMPS",
    consultationMode: "Onsite",
    schedule: {
      days: ["Monday", "Tuesday", "Friday"],
      time: "10:00 AM - 4:00 PM"
    },
    // slots: 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 1:00, 1:30, 2:00, 2:30, 3:00, 3:30
    availability: [
      {
        date: "February 14, 2026",
        day: "Friday",
        slots: [
          { time: "10:00 AM", available: true  },
          { time: "10:30 AM", available: true  },
          { time: "11:00 AM", available: true  },
          { time: "11:30 AM", available: true },
          { time: "12:00 PM", available: true  },
          { time: "12:30 PM", available: true  },
          { time: "1:00 PM",  available: true  },
          { time: "1:30 PM",  available: true },
          { time: "2:00 PM",  available: true  },
          { time: "2:30 PM",  available: true  },
          { time: "3:00 PM",  available: true  },
          { time: "3:30 PM",  available: true  },
        ]
      },
      {
        date: "February 17, 2026",
        day: "Monday",
        slots: [
          { time: "10:00 AM", available: true },
          { time: "10:30 AM", available: true  },
          { time: "11:00 AM", available: true  },
          { time: "11:30 AM", available: true  },
          { time: "12:00 PM", available: true  },
          { time: "12:30 PM", available: true  },
          { time: "1:00 PM",  available: true },
          { time: "1:30 PM",  available: true  },
          { time: "2:00 PM",  available: true  },
          { time: "2:30 PM",  available: true  },
          { time: "3:00 PM",  available: true },
          { time: "3:30 PM",  available: true  },
        ]
      },
      {
        date: "February 18, 2026",
        day: "Tuesday",
        slots: [
          { time: "10:00 AM", available: true  },
          { time: "10:30 AM", available: true  },
          { time: "11:00 AM", available: true  },
          { time: "11:30 AM", available: true  },
          { time: "12:00 PM", available: true },
          { time: "12:30 PM", available: true  },
          { time: "1:00 PM",  available: true  },
          { time: "1:30 PM",  available: true  },
          { time: "2:00 PM",  available: true  },
          { time: "2:30 PM",  available: true  },
          { time: "3:00 PM",  available: true  },
          { time: "3:30 PM",  available: true  },
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Jinky Malabanan",
    title: "Psychologist",
    credentials: "PhD, RPsy, RPm, CHRA, CSPE",
    avatar: null,
    consultationType: "Clinic - CMPS",
    consultationMode: "Onsite",
    schedule: {
      days: ["Thursday"],
      time: "1:00 PM - 7:00 PM"
    },
    // slots: 1:00, 1:30, 2:00, 2:30, 3:00, 3:30, 4:00, 4:30, 5:00, 5:30, 6:00, 6:30
    availability: [
      {
        date: "February 13, 2026",
        day: "Thursday",
        slots: [
          { time: "1:00 PM",  available: true  },
          { time: "1:30 PM",  available: true  },
          { time: "2:00 PM",  available: true  },
          { time: "2:30 PM",  available: true },
          { time: "3:00 PM",  available: true  },
          { time: "3:30 PM",  available: true  },
          { time: "4:00 PM",  available: true  },
          { time: "4:30 PM",  available: true  },
          { time: "5:00 PM",  available: true },
          { time: "5:30 PM",  available: true  },
          { time: "6:00 PM",  available: true  },
          { time: "6:30 PM",  available: true  },
        ]
      },
      {
        date: "February 20, 2026",
        day: "Thursday",
        slots: [
          { time: "1:00 PM",  available: true },
          { time: "1:30 PM",  available: true  },
          { time: "2:00 PM",  available: true  },
          { time: "2:30 PM",  available: true  },
          { time: "3:00 PM",  available: true  },
          { time: "3:30 PM",  available: true },
          { time: "4:00 PM",  available: true  },
          { time: "4:30 PM",  available: true  },
          { time: "5:00 PM",  available: true  },
          { time: "5:30 PM",  available: true  },
          { time: "6:00 PM",  available: true },
          { time: "6:30 PM",  available: true  },
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Cristine Lae Erasga",
    title: "Psychologist",
    credentials: "PhD, RPsy, RPm, CHRA, CSPE",
    avatar: null,
    consultationType: "Clinic - CMPS",
    consultationMode: "Onsite",
    schedule: {
      days: ["Saturday"],
      time: "3:30 PM - 7:30 PM"
    },
    // slots: 3:30, 4:00, 4:30, 5:00, 5:30, 6:00, 6:30, 7:00
    availability: [
      {
        date: "February 15, 2026",
        day: "Saturday",
        slots: [
          { time: "3:30 PM", available: true  },
          { time: "4:00 PM", available: true  },
          { time: "4:30 PM", available: true },
          { time: "5:00 PM", available: true  },
          { time: "5:30 PM", available: true  },
          { time: "6:00 PM", available: true  },
          { time: "6:30 PM", available: true  },
          { time: "7:00 PM", available: true  },
        ]
      },
      {
        date: "February 22, 2026",
        day: "Saturday",
        slots: [
          { time: "3:30 PM", available: true },
          { time: "4:00 PM", available: true  },
          { time: "4:30 PM", available: true  },
          { time: "5:00 PM", available: true  },
          { time: "5:30 PM", available: true },
          { time: "6:00 PM", available: true  },
          { time: "6:30 PM", available: true  },
          { time: "7:00 PM", available: true  },
        ]
      }
    ]
  }
];

export const CONSULTATION_FEES = {
  initial: 2500,
  followUp: 2500
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
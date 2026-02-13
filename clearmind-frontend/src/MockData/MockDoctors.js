// src/MockData/MockDoctors.js
// MOCK DOCTORS DATA
// This file contains sample doctor data for frontend development

export const MOCK_DOCTORS = [
  {
    id: 1,
    name: "Almie M. Buco",
    title: "Psychologist",
    credentials: "RPsy, RPm, CHRA, CSPE",
    avatar: null, // You can add image URLs later
    consultationType: "Online Clinic",
    consultationMode: "Online",
    schedule: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      time: "4:00 PM - 7:00 PM"
    },
    // Generate available dates for the next 2 weeks
    availability: [
      {
        date: "February 13, 2026",
        day: "Thursday",
        slots: [
          { time: "4:00 PM", available: true },
          { time: "5:00 PM", available: false },
          { time: "6:00 PM", available: true }
        ]
      },
      {
        date: "February 14, 2026",
        day: "Friday",
        slots: [
          { time: "4:00 PM", available: true },
          { time: "5:00 PM", available: true },
          { time: "6:00 PM", available: true }
        ]
      },
      {
        date: "February 17, 2026",
        day: "Monday",
        slots: [
          { time: "4:00 PM", available: false },
          { time: "5:00 PM", available: true },
          { time: "6:00 PM", available: true }
        ]
      },
      {
        date: "February 18, 2026",
        day: "Tuesday",
        slots: [
          { time: "4:00 PM", available: true },
          { time: "5:00 PM", available: true },
          { time: "6:00 PM", available: false }
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
    availability: [
      {
        date: "February 14, 2026",
        day: "Friday",
        slots: [
          { time: "10:00 AM", available: true },
          { time: "11:00 AM", available: true },
          { time: "12:00 PM", available: false },
          { time: "1:00 PM", available: true },
          { time: "2:00 PM", available: false },
          { time: "3:00 PM", available: true }
        ]
      },
      {
        date: "February 17, 2026",
        day: "Monday",
        slots: [
          { time: "10:00 AM", available: false },
          { time: "11:00 AM", available: true },
          { time: "12:00 PM", available: true },
          { time: "1:00 PM", available: true },
          { time: "2:00 PM", available: true },
          { time: "3:00 PM", available: false }
        ]
      },
      {
        date: "February 18, 2026",
        day: "Tuesday",
        slots: [
          { time: "10:00 AM", available: true },
          { time: "11:00 AM", available: false },
          { time: "12:00 PM", available: true },
          { time: "1:00 PM", available: true },
          { time: "2:00 PM", available: true },
          { time: "3:00 PM", available: true }
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
    availability: [
      {
        date: "February 13, 2026",
        day: "Thursday",
        slots: [
          { time: "1:00 PM", available: true },
          { time: "2:00 PM", available: true },
          { time: "3:00 PM", available: false },
          { time: "4:00 PM", available: true },
          { time: "5:00 PM", available: true },
          { time: "6:00 PM", available: false }
        ]
      },
      {
        date: "February 20, 2026",
        day: "Thursday",
        slots: [
          { time: "1:00 PM", available: false },
          { time: "2:00 PM", available: true },
          { time: "3:00 PM", available: true },
          { time: "4:00 PM", available: true },
          { time: "5:00 PM", available: false },
          { time: "6:00 PM", available: true }
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
    availability: [
      {
        date: "February 15, 2026",
        day: "Saturday",
        slots: [
          { time: "3:30 PM", available: true },
          { time: "4:30 PM", available: false },
          { time: "5:30 PM", available: true },
          { time: "6:30 PM", available: true }
        ]
      },
      {
        date: "February 22, 2026",
        day: "Saturday",
        slots: [
          { time: "3:30 PM", available: false },
          { time: "4:30 PM", available: true },
          { time: "5:30 PM", available: true },
          { time: "6:30 PM", available: false }
        ]
      }
    ]
  }
];

// Consultation fees (same for all doctors)
export const CONSULTATION_FEES = {
  initial: 2500,
  followUp: 2500
};

// Helper function to get doctor by ID
export const getDoctorById = (id) => {
  return MOCK_DOCTORS.find(doctor => doctor.id === parseInt(id));
};

// Helper function to get available doctors
export const getAvailableDoctors = () => {
  return MOCK_DOCTORS.filter(doctor => 
    doctor.availability.some(avail => 
      avail.slots.some(slot => slot.available)
    )
  );
};

export default MOCK_DOCTORS;
// src/data/mockAppointments.js

// MOCK APPOINTMENTS DATA
// This file contains sample appointment data for frontend development
// When you're ready to connect to backend, just import from API instead

export const MOCK_APPOINTMENTS = [
  {
    id: 1,
    time: '9:00 A.M.',
    date: 'March 2, 2026',
    serviceType: 'Psychotherapy and Counseling',
    doctor: 'Juan Dela Cruz',
    type: 'Clinic - CMPS',
    status: 'Pending',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'G-cash',
    receiptUrl: '#'
  },
  {
    id: 2,
    time: '10:00 A.M.',
    date: 'March 2, 2026',
    serviceType: 'Psychiatric Assessment',
    doctor: 'Maria Santos',
    type: 'Online Consultation',
    status: 'Confirmed',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'G-cash',
    receiptUrl: '#'
  },
  {
    id: 3,
    time: '11:00 A.M.',
    date: 'March 2, 2026',
    serviceType: 'Mental Health Certification',
    doctor: 'Pedro Reyes',
    type: 'Online Consultation',
    status: 'Rescheduled',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'G-cash',
    receiptUrl: '#'
  },
  {
    id: 4,
    time: '2:00 P.M.',
    date: 'January 29, 2026',
    serviceType: 'Follow-up Consultation',
    doctor: 'Ana Rodriguez',
    type: 'Clinic - CMPS',
    status: 'Pending',
    patientName: 'Juan Dela Cruz',
    classification: 'Regular',
    sex: 'Male',
    dateOfBirth: '09/01/2003',
    contactNumber: '+63 9XXXXXXXXX',
    email: 'example@gmail.com',
    homeAddress: 'Cabuyao City',
    paymentMode: 'G-cash',
    receiptUrl: '#'
  },
  {
    id: 5,
    time: '3:00 P.M.',
    date: 'February 1, 2026',
    serviceType: 'Initial Consultation',
    doctor: 'Dr. Santos',
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
    receiptUrl: '#'
  },
  {
    id: 6,
    time: '3:00 P.M.',
    date: 'February 21 2026',
    serviceType: 'Initial Consultation',
    doctor: 'Dr. Santos',
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
    receiptUrl: '#'
  },
   {
    id: 7,
    time: '3:00 P.M.',
    date: 'February 22 2026',
    serviceType: 'Initial Consultation',
    doctor: 'Dr. Santos',
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
    receiptUrl: '#'
  }
];

// Helper function to get appointment by ID
export const getAppointmentById = (id) => {
  return MOCK_APPOINTMENTS.find(apt => apt.id === parseInt(id));
};

// Helper function to filter by status
export const getAppointmentsByStatus = (status) => {
  return MOCK_APPOINTMENTS.filter(apt => apt.status === status);
};

// Export default
export default MOCK_APPOINTMENTS;
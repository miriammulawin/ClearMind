const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    urgent: true,
    targetRole: "doctor",
    title: "TIME OUT",
    body: "MAG TIME OUT NA TAYO",
    date: "Feb 24, 2026",
  },
  {
    id: 2,
    urgent: true,
    targetRole: "client",
    title: "Clinic Holiday Schedule",
    body: "The clinic will be closed on February 25 in observance of EDSA People Power Anniversary. Please reschedule your appointments accordingly.",
    date: "Feb 20, 2026",
  },
  {
    id: 3,
    urgent: false,
    targetRole: "client",
    title: "New Online Consultation Hours",
    body: "Starting March 1, online consultations will be available from 8:00 AM to 6:00 PM, Monday to Saturday.",
    date: "Feb 18, 2026",
  },
  {
    id: 4,
    urgent: false,
    targetRole: "doctor",
    title: "Updated EMR System",
    body: "The new EMR system will go live on March 5. Please attend the orientation on March 3.",
    date: "Feb 22, 2026",
  },
  {
    id: 5,
    urgent: true,
    targetRole: "doctor",
    title: "Mandatory Staff Meeting",
    body: "All doctors are required to attend the meeting on Feb 26 at 3:00 PM at the conference room.",
    date: "Feb 21, 2026",
  },
];

export default MOCK_ANNOUNCEMENTS;
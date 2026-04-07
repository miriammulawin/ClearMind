/**
 * PolicyModalContent.js
 * ─────────────────────────────────────────────────────────────────
 * Pre-built section arrays for each policy modal.
 * Import the one you need and pass it to <PolicyModal sections={...} />
 */

// ─── 1. Declaration of Participation ─────────────────────────────
export const DECLARATION_SECTIONS = [
  {
    type: 'heading',
    content: 'Declaration of Participation and Commitment to Mental Health Support',
  },
  {
    type: 'paragraph',
    content:
      'I hereby acknowledge and understand that the results of my test may indicate if I am at risk or in need of further counseling and mental health support.',
  },
  {
    type: 'paragraph',
    content:
      'Should the results show that I require counseling or intervention, I willingly and voluntarily agree to:',
  },
  {
    type: 'ordered-list',
    content: [
      'Participate in counseling sessions, guidance, or any recommended mental health support program.',
      'Commit myself to the process of improving my mental health and well-being.',
      'Cooperate with the counselor/mental health professional in developing strategies that will help me manage and strengthen my mental health.',
      'Respect the confidentiality of the process and abide by the guidelines set by the mental health service provider.',
    ],
  },
  {
    type: 'divider',
  },
  {
    type: 'paragraph',
    content:
      'I understand that this commitment is for my personal growth, safety, and overall well-being, by signing below,',
  },
];

export const DECLARATION_RADIO_LABEL =
  'I declare my voluntary willingness to be involved and to take responsibility in helping myself through the support offered.';


// ─── 2. Therapy Appointment, Cancellation & Rebooking Policy ─────
export const BOOKING_POLICY_SECTIONS = [
  {
    type: 'paragraph',
    content:
      'All parties are advised to carefully review the policy for full information and guidance.',
  },

  // Appointment Scheduling
  {
    type: 'heading',
    content: 'Appointment Scheduling',
  },
  {
    type: 'ordered-list',
    content: [
      'Therapy sessions are conducted by appointment only.',
      'Appointments may be scheduled through [email/online system] and are confirmed once acknowledged by both parties.',
      'Session duration is typically 45–60 minutes, unless otherwise agreed upon.',
    ],
  },

  // Client Responsibilities
  {
    type: 'heading',
    content: 'Client Responsibilities',
  },
  {
    type: 'ordered-list',
    content: [
      'Clients are expected to arrive on time for their scheduled session.',
      'Late arrival will not extend the session time and will still be charged as a full session.',
      'Clients must ensure they are mentally and physically available during the scheduled time, especially for online sessions.',
    ],
  },

  // Client-Initiated Cancellation
  {
    type: 'heading',
    content: 'Client-Initiated Cancellation or Rescheduling Policy',
  },
  {
    type: 'ordered-list',
    content: [
      'Clients must cancel or reschedule appointments at least eight (8) hours in advance.',
      'Cancellations made less than eight (8) hours before the appointment may be subject to a cancellation fee or considered a forfeited session, unless due to emergency circumstances.',
      {
        text: 'Failure to attend a scheduled session without prior notice "NO-SHOW" may result in:',
        sub: [
          'Full session fee charged',
          'Limited future booking privileges',
        ],
      },
    ],
  },
  {
    type: 'note',
    content:
      'Emergency situations (e.g., medical emergencies, unforeseen crises) will be considered on a case-by-case basis.',
  },

  // Rebooking Policy
  {
    type: 'heading',
    content: 'Rebooking Policy (Client-Initiated Cancellation)',
  },
  {
    type: 'ordered-list',
    content: [
      'Rebooking is subject to therapist availability.',
      {
        text: 'Clients who frequently cancel or reschedule on short notice may be required to:',
        sub: [
          'Confirm appointments closer to the session date',
          'Five hundred pesos (₱500.00) will be charged to the client as a rebooking fee.',
        ],
      },
      'Rebooked sessions must be scheduled within a reasonable timeframe to maintain continuity of care.',
    ],
  },

  // Therapist-Initiated Cancellation
  {
    type: 'heading',
    content: 'Therapist-Initiated Cancellation or Rescheduling Policy',
  },
  {
    type: 'ordered-list',
    content: [
      {
        text: 'In the event that the therapist needs to cancel or reschedule due to illness, emergency, or unavoidable circumstances:',
        sub: [
          'The client will be informed as soon as possible.',
          'The session will be rebooked at no additional cost, or',
          'A refund or credit will be offered, if applicable.',
          'FULL REFUND: If the client agrees, the full refund will be processed within 24–48 hours.',
          'REBOOKING REFUND: If the client agrees, five hundred pesos (₱500.00) will be refunded to the client and processed within 24–48 hours.',
        ],
      },
      'The therapist commits to minimizing disruptions and maintaining professional responsibility toward client care.',
    ],
  },

  // Online / Teletherapy
  {
    type: 'heading',
    content: 'Online / Teletherapy Appointments',
  },
  {
    type: 'ordered-list',
    content: [
      'Clients are responsible for having a stable internet connection and a private, quiet environment.',
      'Technical issues on the client\'s end may result in shortened sessions and are subject to the same cancellation policy.',
      'If technical issues occur on the therapist\'s end, the session will be rescheduled or extended where possible.',
    ],
  },

  // Change Therapist
  {
    type: 'heading',
    content: 'Change Therapist',
  },
  {
    type: 'ordered-list',
    content: [
      'Where deemed necessary, the client may request or will be referred to the available Therapist or MHP to provide the service he/she needs in the urgency of concern or situation.',
      'Client will be given a change therapist form to acknowledge the said arrangement.',
    ],
  },

  // Mutual Respect
  {
    type: 'heading',
    content: 'Mutual Respect and Fairness',
  },
  {
    type: 'ordered-list',
    content: [
      {
        text: 'This policy is designed to respect:',
        sub: [
          'The therapist\'s professional time and preparation',
          'The client\'s access to consistent and ethical care',
        ],
      },
      'Both parties agree to communicate openly and respectfully regarding scheduling concerns.',
    ],
  },

  {
    type: 'divider',
  },
  {
    type: 'note',
    content:
      'By scheduling and attending therapy sessions, clients acknowledge that they have read, understood, and agreed to this Appointment, Cancellation, and Rebooking Policy.',
  },
];

export const BOOKING_POLICY_RADIO_LABEL =
  'I have read, understood, and agree to the Appointment, Cancellation, and Rebooking Policy.';
// hooks/useCurrentUser.js
//
// PURPOSE: Single source of truth for the logged-in user's profile.
//
// HOW TO SWAP TO A REAL BACKEND:
//   1. Remove the mockUser import below.
//   2. Replace the body of useCurrentUser() with a real data-fetching call,
//      e.g. React Query, SWR, useEffect + fetch, or your auth context:
//
//      import { useContext } from 'react';
//      import { AuthContext } from '../context/AuthContext';
//      export function useCurrentUser() { return useContext(AuthContext).user; }
//
//   3. Make sure the returned object keeps the same field names so every
//      consumer (PAaESetAppointmentForm, etc.) works without any changes.
//
// RETURNED SHAPE:
//   {
//     id, firstName, middleName, lastName, fullName, initials,
//     dateOfBirth, age, sex, genderIdentity, preferredPronouns,
//     contactNo, email, homeAddress, profilePic
//   }

import { useMemo } from 'react';
import { mockUser } from '../MockData/MockUser'; // ← only this line changes when going live

function computeAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const dob   = new Date(dateOfBirth);
  let age     = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

function computeInitials(firstName, lastName) {
  const f = (firstName  || '').charAt(0).toUpperCase();
  const l = (lastName || '').charAt(0).toUpperCase();
  return `${f}${l}` || '??';
}

export function useCurrentUser() {
  // Swap `mockUser` for your real auth/user object and nothing else changes.
  const raw = mockUser;

  return useMemo(() => ({
    // — identifiers —
    id:               raw.id,

    // — name helpers —
    firstName:        raw.firstName,
    middleName:       raw.middleName,
    lastName:         raw.lastName,
    fullName:         `${raw.firstName} ${raw.lastName}`,
    initials:         computeInitials(raw.firstName, raw.lastName),

    // — demographics —
    dateOfBirth:      raw.dateOfBirth,
    age:              computeAge(raw.dateOfBirth),
    sex:              raw.sex,
    genderIdentity:   raw.genderIdentity,
    preferredPronouns:raw.preferredPronouns,

    // — contact —
    contactNo:        raw.contactNo,
    email:            raw.email,
    homeAddress:      raw.homeAddress,

    // — avatar —
    profilePic:       raw.profilePic || null,
  }), [raw]);
}
import React, { createContext, useContext, useState } from "react";
import { MOCK_APPOINTMENTS } from "../MockData/MockAppointment";

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);

  const getAppointmentById = (id) =>
    appointments.find((apt) => apt.id === parseInt(id));

  const getSessionsByProgram = (programId) =>
    appointments
      .filter((apt) => apt.programId === programId)
      .sort((a, b) => a.sessionNumber - b.sessionNumber);

  const discontinueProgram = (programId) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.programId === programId
          ? { ...apt, progressionStatus: "Discontinued" }
          : apt,
      ),
    );
  };

  const canProceedToNextSession = (programId) => {
    const sessions = getSessionsByProgram(programId);
    const latest = sessions[sessions.length - 1];
    if (!latest) return false;
    return (
      latest.status === "Completed" &&
      latest.progressionStatus === "Active" &&
      latest.sessionNumber < latest.totalSessions
    );
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        getAppointmentById,
        getSessionsByProgram,
        discontinueProgram,
        canProceedToNextSession,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentContext);

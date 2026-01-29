import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US"; 
import "react-big-calendar/lib/css/react-big-calendar.css";

import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminAppointment.css";

const locales = {
  "en-US": enUS,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function AdminAppointment() {

  const [activeMenu, setActiveMenu] = useState("Appointment");
  const [events, setEvents] = useState([
    {
      title: "Online Clinic",
      start: new Date(2026, 0, 1, 9, 0),
      end: new Date(2026, 0, 1, 10, 0),
      allDay: false,
    },
    {
      title: "New Year's Day",
      start: new Date(2026, 0, 1),
      end: new Date(2026, 0, 1),
      allDay: true,
    },
    {
      title: "Physical Clinic",
      start: new Date(2026, 0, 5, 9, 0),
      end: new Date(2026, 0, 5, 10, 0),
      allDay: false,
    },
    

  ]);

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content" style={{ padding: "20px" }}>
          <div className="dashboard-card">
            <h5>Appointments Calendar</h5>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600, marginTop: 20, borderRadius: "12px" }}
              eventPropGetter={(event) => {
                let backgroundColor;
                if (event.title.includes("Online Clinic"))
                  backgroundColor = "#4D227C";
                else if (event.title.includes("New Year's Day"))
                  backgroundColor = "#7A92D1"; 
                else backgroundColor = "#4D227C"; 

                return {
                  style: {
                    backgroundColor,
                    color: "#fff",
                    borderRadius: "16px", 
                    padding: "4px 8px",
                    fontWeight: 500,
                    marginBottom: "4px", 
                    fontSize: "13px",
                  },
                };
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAppointment;

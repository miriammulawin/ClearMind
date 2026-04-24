import "./ClientStyle/ClientAppointment.css";
import ClientAppointmentTab from "./AppointmentNavPages/AppointmentComponents/AppointmentTab";
import { Outlet } from "react-router-dom";

function ClientAppointment() {
  return (
    <div className="tab-content-wrapper">
      <Outlet />
    </div>
  );
}

export default ClientAppointment;

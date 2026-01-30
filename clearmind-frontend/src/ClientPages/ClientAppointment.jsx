import "./ClientStyle/ClientAppointment.css"
import ClientHeader from "./ClientComponents/ClientHeader";
import ClientFooter from "./ClientComponents/ClientFooter";
import ClientAppointmentTab from "./ClientComponents/ClientAppointmentTab";
import { Outlet } from 'react-router-dom';

function ClientAppointment() {
    return (
       <div className="client-appointment-container">
            <div className="sticky-header">
                <ClientHeader />
                <ClientAppointmentTab />
            </div>
            
            {/* Scrollable content area */}
            <div className="tab-content-wrapper">
                <Outlet />
            </div>
            
            <div className="sticky-footer">
                <ClientFooter />
            </div>
        </div>
    );
}

export default ClientAppointment;
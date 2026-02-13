import "./ClientStyle/ClientAppointment.css"
import ClientHeader from "./ClientComponents/ClientHeader";
import ClientFooter from "./ClientComponents/ClientFooter";
import ClientAppointmentTab from "./ClientComponents/ClientAppointmentTab";
import { Outlet, useLocation } from 'react-router-dom';

function ClientAppointment() {
    const location = useLocation();
    
    // List of routes where header/footer should be hidden
    const hideLayoutRoutes = [
        '/client/appointment/book-form',
        '/client/appointment/payment',
        // Add more routes here
    ];    
        
    const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

    return (
       <div className="client-appointment-container">
            {!shouldHideLayout && (
                <div className="sticky-header">
                    <ClientHeader />
                    <ClientAppointmentTab />
                </div>
            )}
            
            <div className="tab-content-wrapper">
                <Outlet />
            </div>
            
            {!shouldHideLayout && (
                <div className="sticky-footer">
                    <ClientFooter />
                </div>
            )}
        </div>
    );
}

export default ClientAppointment;
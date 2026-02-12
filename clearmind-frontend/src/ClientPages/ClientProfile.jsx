import "./ClientStyle/ClientProfile.css"
import ClientHeader from "./ClientComponents/ClientHeader";
import ClientFooter from "./ClientComponents/ClientFooter";
import ProfilePage from "./ClientComponents/ProfileBody";

function ClientAccount() {
    return (
        <div className="client-appointment-container">
            <div className="sticky-header">
                <ClientHeader />
            </div>
            
            <div className="tab-content-wrapper">
                 <ProfilePage />
            </div>
            
            <div className="sticky-footer">
                <ClientFooter />
            </div>
        </div>
    );
}

export default ClientAccount;
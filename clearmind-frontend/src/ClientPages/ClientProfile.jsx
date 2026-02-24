// ClientAccount.jsx
import { useState } from "react";
import "./ClientStyle/ClientProfile.css";
import ClientHeader from "./ClientComponents/Header";
import ClientFooter from "./ClientComponents/Footer";
import ProfilePage from "./ClientComponents/ProfileBody";
import EditProfileModal from "./EditProfileModal"; 
function ClientAccount() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [userData, setUserData] = useState({
    firstName: "Juan",
    lastName: "Dela Cruz",
    dateOfBirth: "1995-06-15",
    sex: "Male",
    contactNo: "09123456789",
    email: "example@gmail.com",
  });

  const handleSave = (updatedData) => {
   
    setUserData(updatedData);
    console.log("Saved:", updatedData);
  };

  return (
    <div className="client-appointment-container">
      <div className="sticky-header">
        <ClientHeader />
      </div>

      <div className="tab-content-wrapper">
       
        <ProfilePage
          userData={userData}
          onEditClick={() => setIsModalOpen(true)}
        />
      </div>

      <div className="sticky-footer">
        <ClientFooter />
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userData={userData}
        onSave={handleSave}
      />
    </div>
  );
}

export default ClientAccount;

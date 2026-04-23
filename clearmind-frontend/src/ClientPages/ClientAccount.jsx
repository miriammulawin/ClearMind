// ClientAccount.jsx
import { useState } from "react";
import "./ClientStyle/ClientAccount.css";
import AccountPage from "./ClientComponents/AccountPage";
import EditProfileModal from "./ClientComponents/EditProfileModal";
import { mockUser } from "../MockData/MockUser";
import { Outlet, useLocation } from "react-router-dom";

function ClientAccount() {
  const location = useLocation();
  const isProfilePage = location.pathname.includes("profile-page");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(mockUser);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = (updatedData) => {
    setUserData(updatedData);
    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    console.log("Saved:", updatedData);
  };

  return (
    <div>
      {/* Success Toast */}
      {showSuccess && (
        <div className="profile-success-toast">
          <span className="profile-success-icon">✓</span>
          Profile updated successfully!
        </div>
      )}

      <div className="tab-content-wrapper">
        {isProfilePage ? (
          <Outlet context={{ userData, onSave: handleSave }} />
        ) : (
          <AccountPage
            userData={userData}
            onEditClick={() => setIsModalOpen(true)}
          />
        )}
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

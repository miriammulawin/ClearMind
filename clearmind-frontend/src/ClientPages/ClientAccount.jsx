// ClientAccount.jsx
import { useState, useEffect } from "react"; // ← add useEffect
import "./ClientStyle/ClientAccount.css";
import AccountPage from "./ClientComponents/AccountPage";
import EditProfileModal from "./EditProfileModal";
import { Outlet, useLocation } from "react-router-dom";
import axiosClient from "../axiosClient"; // ← add this
// remove: import { mockUser } from "../MockData/MockUser";

function ClientAccount() {
  const location = useLocation();
  const isProfilePage = location.pathname.includes("profile-page");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null); // ← null instead of mockUser
  const [loading, setLoading] = useState(true); // ← add this
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Fetch real user on mount ──────────────────────────────────────────────
  useEffect(() => {
    axiosClient
      .get("/me")
      .then((res) => {
        if (res.data.success) setUserData(res.data.data);
      })
      .catch((err) => console.error("Failed to load user:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (updatedData) => {
    setUserData(updatedData);
    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div>
      {showSuccess && (
        <div className="profile-success-toast">
          <span className="profile-success-icon">✓</span>
          Profile updated successfully!
        </div>
      )}

      <div className="tab-content-wrapper">
        {isProfilePage ? (
          <Outlet context={{ userData, onSave: handleSave }} />
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p className="text-muted">Loading profile...</p>
          </div>
        ) : userData ? (
          <AccountPage
            userData={userData}
            onEditClick={() => setIsModalOpen(true)}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <p className="text-danger">Failed to load profile.</p>
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default ClientAccount;

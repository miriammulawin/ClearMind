import { useState, useEffect } from "react";
import "./ClientStyle/ClientProfile.css";
import ClientHeader from "./ClientComponents/Header";
import ClientFooter from "./ClientComponents/Footer";
import AccountPage from "./ClientComponents/AccountPage";
import EditProfileModal from "./EditProfileModal";
import { Outlet, useLocation } from "react-router-dom";
import axiosClient from "../axiosClient";

function ClientAccount() {
  const location = useLocation();
  const isProfilePage = location.pathname.includes("profile-page");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Fetch user on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    axiosClient
      .get("/me")
      .then((res) => {
        if (res.data.success) setUserData(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch user:", err))
      .finally(() => setLoading(false));
  }, []);

  // ── Called by EditProfileModal after a successful save ───────────────────────
  const handleSave = (updatedData) => {
    setUserData(updatedData); // update the single source of truth
    setIsModalOpen(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="client-appointment-container">
      <div className="sticky-header">
        <ClientHeader />
      </div>

      {showSuccess && (
        <div className="profile-success-toast">
          <span className="profile-success-icon">✓</span>
          Profile updated successfully!
        </div>
      )}

      <div className="tab-content-wrapper">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p className="text-muted">Loading...</p>
          </div>
        ) : isProfilePage ? (
          // ✅ Pass user, the modal opener, and handleSave down via context
          <Outlet
            context={{
              user: userData,
              setIsEditOpen: setIsModalOpen,
            }}
          />
        ) : (
          <AccountPage
            userData={userData}
            onEditClick={() => setIsModalOpen(true)}
          />
        )}
      </div>

      <div className="sticky-footer">
        <ClientFooter />
      </div>

      {/* Single EditProfileModal — only lives here */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default ClientAccount;

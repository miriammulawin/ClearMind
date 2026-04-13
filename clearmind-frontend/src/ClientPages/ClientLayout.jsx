import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
// import ClientHeader from "./ClientComponents/Header";
import EditProfileModal from "./EditProfileModal";
import axiosClient from "./../axiosClient";

function ClientLayout() {
  const [user, setUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchUser = () => {
    axiosClient
      .get("/me")
      .then((res) => {
        if (res.data.success) setUser(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch user:", err));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSave = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div>
      {/* <ClientHeader user={user} /> */}
      <Outlet
        context={{ user, setUser, setIsEditOpen, refreshUser: fetchUser }}
      />

      {/* ✅ Pass user directly so modal can pre-fill without re-fetching */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user} // ✅ must be named "userData" to match the prop
        onSave={handleSave}
      />    
    </div>
  );
}

export default ClientLayout;

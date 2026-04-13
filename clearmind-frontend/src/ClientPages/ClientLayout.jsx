import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import ClientHeader from "./ClientHeader";
import EditProfileModal from "./EditProfileModal";
import axiosClient from "../../axiosClient";

function ClientLayout() {
  const [user, setUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    axiosClient
      .get("/me")
      .then((res) => {
        if (res.data.success) setUser(res.data.data);
      })
      .catch((err) => console.error("Failed to fetch user:", err));
  }, []);

  const handleSave = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <div>
      <ClientHeader user={user} />

      {/* Outlet renders child routes */}
      <Outlet context={{ user, setUser, setIsEditOpen }} />

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSave}
        user={user}
      />
    </div>
  );
}

export default ClientLayout;

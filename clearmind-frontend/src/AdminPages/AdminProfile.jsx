import { useState } from "react";
import { FiEdit, FiLock, FiFileText, FiLogOut } from "react-icons/fi";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminProfile.css";

function AdminProfile() {
  const [activeMenu, setActiveMenu] = useState("My Profile");
  const [activeTab, setActiveTab] = useState("edit");

  const [profileData, setProfileData] = useState({
    firstName: "Admin",
    lastName: "User",
    birthday: "1990-01-01",
    name: "Admin101",
    email: "admin101@gmail.com",
    contact: "09123456789",
    address: "123 Main Street, City, Country",
    profilePic: "https://via.placeholder.com/150/667eea/ffffff?text=Admin",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSaveProfile = () => {
    alert("Profile updated successfully!");
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData({ ...profileData, profilePic: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    alert("Logging out...");
  };

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content">
          <div className="profile-card two-columns">

            <div className="profile-left">
              <div className="profile-picture-wrapper">
                <img
                  src={profileData.profilePic}
                  alt="Profile"
                  className="profile-picture"
                />
                <label className="edit-pic-overlay">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    style={{ display: "none" }}
                  />
                  ✎
                </label>
              </div>
              <h3>{profileData.name}</h3>
              <p className="profile-email">{profileData.email}</p>

              <div className="side-nav">
                <button
                  className={
                    activeTab === "edit"
                      ? "side-nav-btn active"
                      : "side-nav-btn"
                  }
                  onClick={() => setActiveTab("edit")}
                >
                  <FiEdit className="side-nav-icon" /> Edit Profile
                </button>

                <button
                  className={
                    activeTab === "password"
                      ? "side-nav-btn active"
                      : "side-nav-btn"
                  }
                  onClick={() => setActiveTab("password")}
                >
                  <FiLock className="side-nav-icon" /> Change Password
                </button>

                <button
                  className={
                    activeTab === "terms"
                      ? "side-nav-btn active"
                      : "side-nav-btn"
                  }
                  onClick={() => setActiveTab("terms")}
                >
                  <FiFileText className="side-nav-icon" /> Terms & Conditions
                </button>

                <button className="side-nav-btn" onClick={handleLogout}>
                  <FiLogOut className="side-nav-icon" /> Logout
                </button>
              </div>
            </div>

  
            <div className="profile-right">
              {activeTab === "edit" && (
                <div className="tab-content">
                  <h4>Edit Profile</h4>
                  <hr />

                  <div className="form-grid">
                    <label>
                      First Name
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                      />
                    </label>

                    <label>
                      Last Name
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                      />
                    </label>

                    <label>
                      Birthday
                      <input
                        type="date"
                        name="birthday"
                        value={profileData.birthday}
                        onChange={handleInputChange}
                      />
                    </label>

                    <label>
                      Email
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                      />
                    </label>

                    <label>
                      Contact
                      <input
                        type="text"
                        name="contact"
                        value={profileData.contact}
                        onChange={handleInputChange}
                        placeholder="Enter contact number"
                      />
                    </label>

                    <label>
                      Address
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                      />
                    </label>
                  </div>

                  <button className="btn-save" onClick={handleSaveProfile}>
                    Save Profile
                  </button>
                </div>
              )}

              {activeTab === "password" && (
                <div className="tab-content">
                  <h4>Change Password</h4>
                  <hr />

                  <div className="form-grid">
                    <label style={{ gridColumn: "1 / -1" }}>
                      Current Password
                      <input
                        type="password"
                        placeholder="Enter current password"
                      />
                    </label>

                    <label>
                      New Password
                      <input type="password" placeholder="Enter new password" />
                    </label>

                    <label>
                      Confirm Password
                      <input
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </label>
                  </div>

                  <button className="btn-save">Update Password</button>
                </div>
              )}

              {activeTab === "terms" && (
                <div className="tab-content">
                  <h4>Terms & Conditions</h4>
                  <hr />
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                    occaecat cupidatat non proident, sunt in culpa qui officia
                    deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem
                    aperiam, eaque ipsa quae ab illo inventore veritatis et
                    quasi architecto beatae vitae dicta sunt explicabo.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;

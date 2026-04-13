import React, { useState, useEffect } from "react";
import { Container, Card, ListGroup, Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../ClientStyle/AccountPage.css";
import { LuHandHeart } from "react-icons/lu";
import { LuBookOpenText } from "react-icons/lu";
import { MdOutlineShield } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";
import { Image } from "react-bootstrap";
import logo_login from "../../assets/CMPS_Logo.png";
import ProfileAvatar from "./ProfileAvatar";
import axiosClient from "../../axiosClient";

export default function AccountPage({ onEditClick }) {
  const [user, setUser] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get("/me")
      .then((response) => {
        if (response.data.success) {
          setUser(response.data.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        setError("Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getDisplayName = () => {
    if (!user) return "";
    const first = capitalize(user.firstName);
    const last = capitalize(user.lastName);
    const middle =
      user.middleInitial && user.middleInitial !== "N/A"
        ? `${user.middleInitial.toUpperCase()}. `
        : "";
    return `${first} ${middle}${last}`;
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleCloseModal = () => setShowLogoutModal(false);

  const handleLogout = () => {
    // Clear token on logout
    localStorage.removeItem("token");
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleMenuClick = (item) => {
    if (item.action) item.action();
    else if (item.link) navigate(item.link);
  };

  const menuItems = [
    { icon: <LuHandHeart />, label: "Help", link: "/client/help" },
    {
      icon: <LuBookOpenText />,
      label: "Terms and Conditions",
      link: "/client/terms-and-conditions",
    },
    {
      icon: <MdOutlineShield />,
      label: "Privacy Policy",
      link: "/client/privacy-policy",
    },
    {
      icon: <IoMdInformationCircleOutline />,
      label: "About",
      link: "/client/about",
    },
    { icon: <IoLogOutOutline />, label: "Log Out", action: handleLogoutClick },
  ];

  return (
    <div className="profile-page-container">
      <Container fluid className="p-0 profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <h5 className="profile-title">PROFILE</h5>
        </div>

        {/* User Info Card */}
        <div className="user-info-section">
          <Card className="user-info-card">
            <Card.Body
              className="user-info-body"
              onClick={() => navigate("/client/account/profile-page")}
            >
              {loading ? (
                <div className="user-details">
                  <p className="text-muted">Loading profile...</p>
                </div>
              ) : error ? (
                <div className="user-details">
                  <p className="text-danger">{error}</p>
                </div>
              ) : (
                <>
                  {/* Avatar */}
                  <div
                    className="user-avatar-wrapper"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick && onEditClick();
                    }}
                  >
                    <ProfileAvatar
                      firstName={capitalize(user?.firstName)}
                      lastName={capitalize(user?.lastName)}
                      profilePic={user?.profilePic || null}
                      size={52}
                    />
                    <div className="avatar-edit-btn">
                      <FaCamera size={10} />
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="user-details">
                    <h5 className="user-name">{getDisplayName()}</h5>
                    <p className="user-email">{user?.email}</p>
                  </div>

                  <button
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick && onEditClick();
                    }}
                  >
                    <FaRegEdit />
                  </button>
                </>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="menu-section">
          <Card className="menu-card">
            <ListGroup variant="flush">
              {menuItems.map((item, index) => (
                <ListGroup.Item
                  key={index}
                  className="menu-item"
                  action
                  onClick={() => handleMenuClick(item)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="menu-item-content">
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </div>
                  <span className="menu-arrow">›</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </div>

        {/* Branding Footer */}
        <div className="branding-section">
          <p className="branding-text">Clarity of Mind, Journey to Wellness.</p>
          <div className="branding-logo">
            <Image src={logo_login} className="logo-image" />
          </div>
          <p className="year-branding-dev-version">Est. 2024</p>
          <p className="year-branding-dev-version">© 2026 | Version 1.0</p>
        </div>
      </Container>

      {/* Logout Modal */}
      <Modal
        show={showLogoutModal}
        onHide={handleCloseModal}
        centered
        className="logout-modal"
      >
        <Modal.Body className="text-center p-4">
          <div className="mb-3">
            <IoLogOutOutline size={40} className="text-custom" />
          </div>
          <h5 className="mb-3">Log out ?</h5>
          <p className="text-muted mb-4">
            Are you sure you want to log out your account?
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <Button
              variant="outline-secondary"
              onClick={handleCloseModal}
              className="px-4"
            >
              CANCEL
            </Button>
            <Button variant="primary" onClick={handleLogout} className="px-4">
              LOG OUT
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

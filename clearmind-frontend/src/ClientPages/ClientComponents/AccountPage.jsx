import React, { useState, useRef } from "react";
import { Container, Card, ListGroup, Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../ClientStyle/AccountPage.css";
import { LuHandHeart } from "react-icons/lu";
import { LuBookOpenText } from "react-icons/lu";
import { MdOutlineShield } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { FaRegEdit, FaCamera } from "react-icons/fa";
import { IoBookOutline } from "react-icons/io5";

import { Image } from "react-bootstrap";
import logo_login from "../../assets/CMPS_Logo.png";
import ProfileAvatar from "./ProfileAvatar";

export default function AccountPage({ userData, onEditClick }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleCloseModal = () => setShowLogoutModal(false);

  const handleLogout = () => {
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
      icon: <IoMdInformationCircleOutline />,
      label: "About",
      link: "/client/about",
    },
  ];

  const policyItems = [
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
      icon: <IoBookOutline />,
      label: "Therapy Appointment, Cancellation, and Rebooking Policy ",
      link: "/client/privacy-policy",
    },
  ];

  const logoutItem = {
    icon: <IoLogOutOutline />,
    label: "Log Out",
    action: handleLogoutClick,
  };

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
              {/* Avatar — clicking opens Edit Modal */}
              <div className="user-avatar-wrapper" onClick={onEditClick}>
                <ProfileAvatar
                  firstName={userData.firstName}
                  lastName={userData.lastName}
                  profilePic={userData.profilePicture}
                  size={52}
                />
                <div className="avatar-edit-btn">
                  <FaCamera size={10} />
                </div>
              </div>

              <div className="user-details">
                <h5 className="user-name">
                  {userData.firstName}{" "}
                  {userData.middleInitial && userData.middleInitial !== "N/A"
                    ? `${userData.middleInitial[0]}. `
                    : ""}
                  {userData.lastName}
                </h5>
                <p className="user-email">{userData.email}</p>
              </div>

              <button className="edit-button" onClick={onEditClick}>
                <FaRegEdit />
              </button>
            </Card.Body>
          </Card>
        </div>

        {/* General */}
        <div className="menu-section">
          <Card className="menu-card">
            <ListGroup variant="flush">
              {menuItems.map((item, index) => (
                <ListGroup.Item
                  key={index}
                  className="menu-item"
                  action
                  onClick={() => handleMenuClick(item)}
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

        {/* Policies & Legal */}
        <p className="menu-section-title">Policies & Legal</p>
        <div className="menu-section">
          <Card className="menu-card">
            <ListGroup variant="flush">
              {policyItems.map((item, index) => (
                <ListGroup.Item
                  key={index}
                  className="menu-item"
                  action
                  onClick={() => handleMenuClick(item)}
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

        {/* Logout */}
        <div className="menu-section">
          <Card className="menu-card">
            <ListGroup variant="flush">
              <ListGroup.Item
                className="menu-item"
                action
                onClick={handleLogoutClick}
              >
                <div className="menu-item-content">
                  <span className="menu-icon">{logoutItem.icon}</span>
                  <span className="menu-label">{logoutItem.label}</span>
                </div>
                <span className="menu-arrow">›</span>
              </ListGroup.Item>
            </ListGroup>
          </Card>
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

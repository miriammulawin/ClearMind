import React, { useState } from 'react';
import { Container, Card, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../ClientStyle/ProfileBody.css';
import { LuHandHeart } from "react-icons/lu";
import { LuBookOpenText } from "react-icons/lu";
import { MdOutlineShield } from "react-icons/md";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import logo_login_single from "../../assets/CMPS_Logo.png";



export default function ProfilePage() {
  const [showFooter, setShowFooter] = useState(false);

  const menuItems = [
    { icon: <LuHandHeart />, label: 'Help', link: '/help' },
    { icon: <LuBookOpenText />, label: 'Terms and Conditions', link: '/terms' },
    { icon: <MdOutlineShield />, label: 'Privacy Policy', link: '/privacy' },
    { icon: <IoMdInformationCircleOutline />, label: 'About', link: '/about' },
    { icon: <IoLogOutOutline />, label: 'Log Out', link: '/logout' }
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
              <Card.Body className="user-info-body">
                <div className="user-avatar">
                  JD
                </div>
                <div className="user-details">
                  <h5 className="user-name">Juan Dela Cruz</h5>
                  <p className="user-email">example@gmail.com</p>
                </div>
                <button className="edit-button">
                  <FaRegEdit />
                </button>
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
            <p className="branding-text">It's okay to ask for help.</p>
            <div className="branding-logo">
             
            </div>
          </div>
        </Container>
    </div>
  );
}
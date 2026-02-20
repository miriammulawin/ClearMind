import { useState } from "react";
import { FiLogOut, FiSearch, FiX } from "react-icons/fi";
import { AiFillMessage } from "react-icons/ai";
import { IoNotifications } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "../axiosClient";

import "../index.css";
import "./DoctorStyle/NotificationModal.css";
import AllNotifications from "./AllNotifications";
import axiosClient from "../axiosClient";

function DoctorTopNavbar({ activeMenu }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Appointment Request",
      message: "John Doe has requested an appointment for January 15, 2026",
      time: "5 minutes ago",
      isRead: false,
      type: "appointment",
    },
    {
      id: 2,
      title: "Payment Received",
      message: "Payment of ₱1,500 received from Maria Santos",
      time: "1 hour ago",
      isRead: false,
      type: "payment",
    },
    {
      id: 3,
      title: "Appointment Reminder",
      message: "Upcoming appointment with Pedro Cruz at 2:00 PM today",
      time: "2 hours ago",
      isRead: true,
      type: "reminder",
    },
    {
      id: 4,
      title: "New Message",
      message: "You have a new message from Anna Lopez",
      time: "3 hours ago",
      isRead: true,
      type: "message",
    },
    {
      id: 5,
      title: "Appointment Cancelled",
      message: "Carlos Reyes cancelled appointment scheduled for tomorrow",
      time: "Yesterday",
      isRead: true,
      type: "cancelled",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#a276d0",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      // Call Laravel logout → revokes the Bearer token on the server
      await axiosClient.post("/logout");
    } catch (error) {
      // Even if the API call fails, we still clear local storage
      console.error("Logout API error:", error);
    } finally {
      // Always clear localStorage regardless of API result
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      Swal.fire({
        icon: "success",
        title: "Logged out successfully!",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top-end",
      });

      setTimeout(() => navigate("/"), 1500);
    }
  };


  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, isRead: true })),
    );
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment":
        return "📅";
      case "payment":
        return "💰";
      case "reminder":
        return "⏰";
      case "message":
        return "💬";
      case "cancelled":
        return "❌";
      default:
        return "🔔";
    }
  };

  return (
    <div className="top-navbar">
      <div className="top-navbar-left">
        <h3>{activeMenu}</h3>
      </div>

      <div className="top-navbar-right">
        <AiFillMessage
          className="top-icon"
          onClick={() => navigate("/admin/messages")}
          style={{ cursor: "pointer" }}
        />

        <div className="notification-container">
          <IoNotifications
            className="top-icon"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ cursor: "pointer" }}
          />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}

          {showNotifications && (
            <>
              <div
                className="notification-overlay"
                onClick={() => setShowNotifications(false)}
              />
              <div className="notification-modal">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <div className="notification-header-actions">
                    {unreadCount > 0 && (
                      <button
                        className="mark-all-read-btn"
                        onClick={markAllAsRead}
                      >
                        Mark all as read
                      </button>
                    )}
                    <FiX
                      className="close-notification-btn"
                      onClick={() => setShowNotifications(false)}
                    />
                  </div>
                </div>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${
                          !notif.isRead ? "unread" : ""
                        }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="notification-icon">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="notification-content">
                          <h4>{notif.title}</h4>
                          <p>{notif.message}</p>
                          <span className="notification-time">
                            {notif.time}
                          </span>
                        </div>
                        <button
                          className="delete-notification-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                        >
                          <FiX />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="notification-footer">
                    <button
                      className="view-all-btn"
                      onClick={() => {
                        setShowNotifications(false);
                        setShowAllNotifications(true);
                      }}
                    >
                      View All Notifications
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="search-box">
          <input type="text" placeholder="Search" />
          <FiSearch className="search-icon" />
        </div>

        <FiLogOut
          className="top-icon"
          style={{ cursor: "pointer" }}
          onClick={handleLogout}
        />
      </div>

      {/* All Notifications Modal */}
      {showAllNotifications && (
        <AllNotifications
          onClose={() => setShowAllNotifications(false)}
          notifications={notifications}
          setNotifications={setNotifications}
        />
      )}
    </div>
  );
}

export default DoctorTopNavbar;

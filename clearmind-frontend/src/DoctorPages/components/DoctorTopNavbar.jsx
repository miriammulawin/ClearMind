import { useState } from "react";
import { FiLogOut, FiSearch, FiX } from "react-icons/fi";
import { AiFillMessage } from "react-icons/ai";
import { IoNotifications } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosClient from "../../axiosClient";

import "../../index.css";

import styles from "../DoctorStyle/DoctorTopNavbar.module.css";
import "../DoctorStyle/NotificationModal.css";
import AllNotifications from "./AllNotifications";

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
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You will be logged out.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, logout",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await axiosClient.post("/logout");
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

        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    console.error("Logout failed:", error);
    navigate("/");
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
    <div className={styles.topNavbar}>
      <div className={styles.topNavbarLeft}>
        <h3>{activeMenu}</h3>
      </div>

      <div className={styles.topNavbarRight}>
        <AiFillMessage
          className={styles.topIcon}
          onClick={() => navigate("/doctor/messages")}
          style={{ cursor: "pointer" }}
        />

        <div className={styles.notificationContainer}>
          <IoNotifications
            className={styles.topIcon}
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ cursor: "pointer" }}
          />
          {unreadCount > 0 && (
            <span className={styles.notificationBadge}>{unreadCount}</span>
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
                        className={`notification-item ${!notif.isRead ? "unread" : ""}`}
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

        <div className={styles.searchBox}>
          <input type="text" placeholder="Search" />
          <FiSearch className={styles.searchIcon} />
        </div>

        <FiLogOut
          className={styles.topIcon}
          style={{ cursor: "pointer" }}
          onClick={handleLogout}
        />
      </div>

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

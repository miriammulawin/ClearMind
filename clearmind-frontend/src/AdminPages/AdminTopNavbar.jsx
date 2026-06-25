import { useState } from "react";
import { FiLogOut, FiSearch, FiX } from "react-icons/fi";
import { AiFillMessage } from "react-icons/ai";
import { IoNotifications } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosClient from "../axiosClient";
import { useUnreadCount } from "../hooks/useUnreadCount";

import styles from "./AdminStyle/AdminTopNavbar.module.css";
import "./AdminStyle/NotificationModal.css";
import AllNotifications from "./AllNotifications";

const toastSuccess = {
  duration: 1500,
  style: {
    background: "#E2F7E3",
    border: "1px solid #91C793",
    color: "#2E7D32",
    fontWeight: 600,
    fontSize: "0.95rem",
    textAlign: "center",
    maxWidth: "320px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
  },
  iconTheme: { primary: "#2E7D32", secondary: "#E2F7E3" },
};

const toastError = {
  duration: 1500,
  style: {
    background: "#FDECEA",
    border: "1px solid #F5C6CB",
    color: "#C62828",
    fontWeight: 600,
    fontSize: "0.9rem",
    textAlign: "center",
    maxWidth: "320px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
  },
  iconTheme: { primary: "#C62828", secondary: "#FDECEA" },
};

function AdminTopNavbar({ activeMenu }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const unreadMessageCount = useUnreadCount();

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

  const confirmLogout = async () => {
    try {
      await axiosClient.post("/logout");

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      setShowLogoutModal(false);

      toast.success("Logged out successfully!", toastSuccess);

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (error) {
      console.error("Logout failed:", error);

      // Always clear session for safety
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      setShowLogoutModal(false);

      toast.error(
        error?.response?.data?.message || "Logout failed, session cleared.",
        toastError,
      );

      setTimeout(() => {
        navigate("/");
      }, 1200);
    }
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
        <div className={styles.notificationContainer}>
          <AiFillMessage
            className={styles.topIcon}
            onClick={() => navigate("/admin/messages")}
            style={{ cursor: "pointer" }}
          />
          {unreadMessageCount > 0 && (
            <span className={styles.notificationBadge}>
              {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
            </span>
          )}
        </div>

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

        {showLogoutModal && (
          <div
            className={styles.logoutOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowLogoutModal(false);
            }}
          >
            <div className={styles.logoutModal}>
              {/* Icon */}
              <div className={styles.logoutIconWrap}>
                <FiLogOut className={styles.logoutIcon} />
              </div>

              {/* Content */}
              <div className={styles.logoutContent}>
                <h2 className={styles.logoutTitle}>Log Out</h2>
                <p className={styles.logoutDesc}>
                  Are you sure you want to logout?
                </p>
              </div>

              {/* Actions */}
              <div className={styles.logoutActions}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>

                <button className={styles.confirmBtn} onClick={confirmLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.searchBox}>
          <input type="text" placeholder="Search" />
          <FiSearch className={styles.searchIcon} />
        </div>

        <FiLogOut
          className={styles.topIcon}
          style={{ cursor: "pointer" }}
          onClick={() => setShowLogoutModal(true)}
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

export default AdminTopNavbar;

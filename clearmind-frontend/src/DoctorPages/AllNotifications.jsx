import { useState } from "react";
import { FiX, FiCheck, FiTrash2, FiFilter } from "react-icons/fi";
import "./DoctorStyle/AllNotifications.css";

function AllNotifications({ onClose, notifications, setNotifications }) {
  const [filter, setFilter] = useState("all"); 

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.isRead;
    if (filter === "read") return notif.isRead;
    return true;
  });

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

  const deleteAllRead = () => {
    setNotifications(notifications.filter((notif) => !notif.isRead));
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
    <div className="all-notifications-overlay">
      <div className="all-notifications-container">
       
        <div className="all-notifications-header">
          <div className="header-left">
            <h2>All Notifications</h2>
            <span className="notification-count">
              {notifications.length} total
            </span>
          </div>
          <button className="close-all-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>


        <div className="notifications-toolbar">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({notifications.filter((n) => !n.isRead).length})
            </button>
            <button
              className={`filter-btn ${filter === "read" ? "active" : ""}`}
              onClick={() => setFilter("read")}
            >
              Read ({notifications.filter((n) => n.isRead).length})
            </button>
          </div>

          <div className="action-buttons">
            <button className="action-btn" onClick={markAllAsRead}>
              <FiCheck /> Mark all as read
            </button>
            <button className="action-btn delete" onClick={deleteAllRead}>
              <FiTrash2 /> Delete read
            </button>
          </div>
        </div>

     
        <div className="all-notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="no-notifications-message">
              <div className="empty-icon">🔔</div>
              <h3>No notifications here</h3>
              <p>
                {filter === "unread"
                  ? "You're all caught up!"
                  : filter === "read"
                    ? "No read notifications"
                    : "You don't have any notifications yet"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`all-notification-card ${
                  !notif.isRead ? "unread" : ""
                }`}
              >
                <div className="notification-card-icon">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="notification-card-content">
                  <div className="notification-card-header">
                    <h3>{notif.title}</h3>
                    {!notif.isRead && <span className="unread-dot"></span>}
                  </div>
                  <p className="notification-card-message">{notif.message}</p>
                  <span className="notification-card-time">{notif.time}</span>
                </div>

                <div className="notification-card-actions">
                  {!notif.isRead && (
                    <button
                      className="card-action-btn read"
                      onClick={() => markAsRead(notif.id)}
                      title="Mark as read"
                    >
                      <FiCheck />
                    </button>
                  )}
                  <button
                    className="card-action-btn delete"
                    onClick={() => deleteNotification(notif.id)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AllNotifications;

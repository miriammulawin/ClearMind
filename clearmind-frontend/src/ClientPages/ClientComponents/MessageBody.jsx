import React, { useState, useEffect, useRef } from "react";
import { Container, InputGroup, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../ClientStyle/MessageBody.css";
import { FaSearch } from "react-icons/fa";
import { IoMdAttach, IoMdArrowBack } from "react-icons/io";
import { BiSolidMessageAdd } from "react-icons/bi";
import { useMessages } from "../../hooks/useMessages";
import axiosClient from "../../axiosClient";

export default function MessagingApp({ onChatStateChange }) {
  const [showChat, setShowChat] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const {
    conversations,
    activeConv,
    messages,
    loadingConvs,
    loadingMsgs,
    sending,
    currentUserId,
    openConversation,
    sendMessage,
    startConversation,
    getOther,
    getInitials,
    formatTime,
    formatDate,
  } = useMessages();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpenChat = async (conv) => {
    await openConversation(conv);
    setShowChat(true);
    onChatStateChange?.(true);
  };

  const handleBack = () => {
    setShowChat(false);
    onChatStateChange?.(false);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText.trim());
    setInputText("");
  };

  // Load all messageable users for new conversation
  const handleNewChat = async () => {
    try {
      const { data } = await axiosClient.get("/users/messageable");
      setAllUsers(data.data);
      setShowNewChat(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartNew = async (userId) => {
    setShowNewChat(false);
    const conv = await startConversation(userId);
    setShowChat(true);
    onChatStateChange?.(true);
  };

  const filtered = conversations.filter((c) => {
    const other = getOther(c);
    return `${other.firstName} ${other.lastName}`
      .toLowerCase()
      .includes(searchText.toLowerCase());
  });

  return (
    <div className="messaging-app-container">
      {/* ══ NEW CHAT MODAL ══ */}
      {showNewChat && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: "90%",
              maxWidth: 360,
            }}
          >
            <h6 style={{ marginBottom: 16 }}>Start New Conversation</h6>
            {allUsers.length === 0 ? (
              <p style={{ color: "#888" }}>No users available.</p>
            ) : (
              allUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => handleStartNew(u.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 0",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "#7341A8",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {`${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {u.firstName} {u.lastName}
                    </div>
                    <small style={{ color: "#888" }}>{u.role}</small>
                  </div>
                </div>
              ))
            )}
            <button
              onClick={() => setShowNewChat(false)}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: 8,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showChat ? (
        // ══ CONVERSATION LIST ══
        <Container fluid className="p-0 messaging-container">
          <div className="messages-header">
            {!showSearch ? (
              <>
                <h5 className="messages-title">MESSAGES</h5>
                <button
                  className="search-button"
                  onClick={() => setShowSearch(true)}
                >
                  <FaSearch />
                </button>
              </>
            ) : (
              <div className="search-bar-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search messages..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  autoFocus
                />
                <button
                  className="close-search-button"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchText("");
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="messages-list">
            {loadingConvs ? (
              <div className="loading-container">
                <p>Loading conversations...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="no-messages-container">
                <p>No conversations found</p>
              </div>
            ) : (
              filtered.map((conv) => {
                const other = getOther(conv);
                const initials = getInitials(other);
                const lastMsg = conv.latest_message?.body ?? "No messages yet";
                const lastTime = conv.latest_message?.created_at
                  ? new Date(
                      conv.latest_message.created_at,
                    ).toLocaleDateString()
                  : "";
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleOpenChat(conv)}
                    className="message-item"
                  >
                    <div className="message-avatar">{initials}</div>
                    <div className="message-content">
                      <div className="message-header">
                        <h6 className="message-name">
                          {other.firstName} {other.lastName}
                        </h6>
                        <small className="message-date">{lastTime}</small>
                      </div>
                      <p className="message-preview">
                        {conv.unread_count > 0 ? (
                          <span className="unread-messages">
                            {conv.unread_count} new message
                            {conv.unread_count > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="no-new-messages">{lastMsg}</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="button-position">
            <button className="fab-new-message" onClick={handleNewChat}>
              <BiSolidMessageAdd className="add-message" />
            </button>
          </div>
        </Container>
      ) : (
        // ══ CHAT VIEW ══
        <Container fluid className="p-0 chat-container">
          <div className="chat-header">
            <button onClick={handleBack} className="back-button">
              <IoMdArrowBack />
            </button>
            <div className="chat-avatar">
              {getInitials(getOther(activeConv))}
            </div>
            <div className="chat-user-info">
              <h6 className="chat-user-name">
                {getOther(activeConv).firstName} {getOther(activeConv).lastName}
              </h6>
              <small className="chat-user-contact">
                {getOther(activeConv).role}
              </small>
            </div>
          </div>

          <div className="messages-area">
            {loadingMsgs ? (
              <div className="loading-container">
                <p>Loading messages...</p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isMine = msg.sender_id === currentUserId;
                  const showDate =
                    i === 0 ||
                    formatDate(msg.created_at) !==
                      formatDate(messages[i - 1]?.created_at);
                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="date-divider">
                          <small>{formatDate(msg.created_at)}</small>
                        </div>
                      )}
                      <div
                        className={`chat-message ${isMine ? "sent" : "received"}`}
                      >
                        {!isMine && (
                          <div className="chat-message-avatar">
                            {getInitials(getOther(activeConv))}
                          </div>
                        )}
                        <div>
                          <div className="chat-message-bubble">{msg.body}</div>
                          <div className="chat-message-time">
                            {formatTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="message-input-container">
            <InputGroup>
              <button type="button" className="attach-button">
                <IoMdAttach />
              </button>
              <Form.Control
                type="text"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="message-text-input"
                disabled={sending}
              />
              <button
                type="button"
                className="send-button"
                onClick={handleSend}
                disabled={sending || !inputText.trim()}
              >
                {sending ? "..." : "➤"}
              </button>
            </InputGroup>
          </div>
        </Container>
      )}
    </div>
  );
}

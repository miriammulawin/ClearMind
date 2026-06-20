import React, { useState, useEffect, useRef } from "react";
import { Container, InputGroup, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../ClientStyle/MessageBody.css";
import { FaSearch } from "react-icons/fa";
import { IoMdAttach, IoMdArrowBack } from "react-icons/io";
import { BiSolidMessageAdd } from "react-icons/bi";
import {
  FiTrash2,
  FiFile,
  FiDownload,
  FiX,
  FiEdit2,
  FiCheck,
} from "react-icons/fi";
import { useMessages } from "../../hooks/useMessages";
import axiosClient from "../../axiosClient";

export default function MessagingApp({ onChatStateChange }) {
  const [showChat, setShowChat] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachPreview, setAttachPreview] = useState(null);
  const [hoveredMsg, setHoveredMsg] = useState(null);

  // ── Edit state ──
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const editInputRef = useRef(null);

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
    sendWithAttachment,
    unsendMessage,
    editMessage, // ← expose this from your hook (see note below)
    startConversation,
    getOther,
    getInitials,
    formatTime,
    formatDate,
  } = useMessages();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (editingMsgId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMsgId]);

  useEffect(() => {
    return () => {
      if (attachPreview) URL.revokeObjectURL(attachPreview);
    };
  }, [attachPreview]);

  const handleOpenChat = async (conv) => {
    await openConversation(conv);
    setShowChat(true);
    onChatStateChange?.(true);
  };

  const handleBack = () => {
    setShowChat(false);
    onChatStateChange?.(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      setAttachPreview(URL.createObjectURL(file));
    } else {
      setAttachPreview(null);
    }
    e.target.value = "";
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    if (attachPreview) {
      URL.revokeObjectURL(attachPreview);
      setAttachPreview(null);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !attachedFile) return;
    if (attachedFile) {
      await sendWithAttachment(inputText, attachedFile);
    } else {
      await sendMessage(inputText.trim());
    }
    setInputText("");
    clearAttachment();
  };

  // ── Unsend (delete) ──
  const handleUnsend = async (msgId) => {
    if (window.confirm("Unsend this message?")) {
      await unsendMessage(msgId);
      setHoveredMsg(null);
    }
  };

  // ── Start editing ──
  const handleStartEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditText(msg.body ?? "");
    setHoveredMsg(null);
  };

  // ── Confirm edit ──
  const handleConfirmEdit = async (msgId) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    try {
      // editMessage should PATCH /messages/{id} with { body: trimmed }
      if (typeof editMessage === "function") {
        await editMessage(msgId, trimmed);
      } else {
        // Fallback if hook doesn't export it yet
        await axiosClient.patch(`/messages/${msgId}`, { body: trimmed });
      }
    } catch (err) {
      console.error("Edit failed", err);
    } finally {
      setEditingMsgId(null);
      setEditText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setEditText("");
  };

  const getAttachmentUrl = (path) =>
    `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/storage/${path}`;

  const isImage = (path) => /\.(jpg|jpeg|png|gif|webp)$/i.test(path ?? "");

  const handleNewChat = async () => {
    try {
      const { data } = await axiosClient.get("/users/messageable");
      const doctorsAndAdmins = data.data.filter((u) => u.role === "Admin");
      setAllUsers(doctorsAndAdmins);
      setShowNewChat(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartNew = async (userId) => {
    setShowNewChat(false);
    await startConversation(userId);
    setShowChat(true);
    onChatStateChange?.(true);
  };

  const filtered = conversations.filter((c) => {
    const other = getOther(c);
    return `${other.firstName} ${other.lastName}`
      .toLowerCase()
      .includes(searchText.toLowerCase());
  });

  const lastMsgId = messages[messages.length - 1]?.id;

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
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}
          >
            <h6 style={{ marginBottom: 16, fontWeight: 700, color: "#5e4b8b" }}>
              Start New Conversation
            </h6>
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
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f5f0ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
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
                      flexShrink: 0,
                    }}
                  >
                    {`${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: "#333" }}>
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
                color: "#5e4b8b",
                fontWeight: 600,
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
                const lastMsg =
                  conv.latest_message?.body ??
                  (conv.latest_message?.attachment_path
                    ? "📎 Attachment"
                    : "No messages yet");
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
                  const isLast = msg.id === lastMsgId;
                  const isEditing = editingMsgId === msg.id;
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

                      {/* ── Bubble row ── */}
                      <div
                        className={`chat-message ${isMine ? "sent" : "received"}`}
                        onMouseEnter={() =>
                          isMine &&
                          !msg.unsent &&
                          !isEditing &&
                          setHoveredMsg(msg.id)
                        }
                        onMouseLeave={() => setHoveredMsg(null)}
                      >
                        {!isMine && (
                          <div className="chat-message-avatar">
                            {getInitials(getOther(activeConv))}
                          </div>
                        )}

                        <div className="bubble-wrapper">
                          {/* ── Bubble ── */}
                          <div
                            className={`chat-message-bubble ${msg.unsent ? "bubble-unsent" : ""}`}
                          >
                            {msg.unsent ? (
                              <span className="unsent-label">
                                Message unsent
                              </span>
                            ) : isEditing ? (
                              /* ── Inline edit input ── */
                              <div className="edit-input-wrap">
                                <input
                                  ref={editInputRef}
                                  className="edit-inline-input"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault();
                                      handleConfirmEdit(msg.id);
                                    }
                                    if (e.key === "Escape") handleCancelEdit();
                                  }}
                                />
                                <div className="edit-action-row">
                                  <button
                                    className="edit-confirm-btn"
                                    onClick={() => handleConfirmEdit(msg.id)}
                                    title="Save"
                                  >
                                    <FiCheck size={12} />
                                    Save
                                  </button>
                                  <button
                                    className="edit-cancel-btn"
                                    onClick={handleCancelEdit}
                                    title="Cancel"
                                  >
                                    <FiX size={12} />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Attachment */}
                                {msg.attachment_path && (
                                  <div className="attachment-wrap">
                                    {isImage(msg.attachment_path) ? (
                                      <a
                                        href={getAttachmentUrl(
                                          msg.attachment_path,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <img
                                          src={getAttachmentUrl(
                                            msg.attachment_path,
                                          )}
                                          alt="attachment"
                                          className="attach-img"
                                        />
                                      </a>
                                    ) : (
                                      <a
                                        href={getAttachmentUrl(
                                          msg.attachment_path,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="attach-file-link"
                                      >
                                        <FiFile size={16} />
                                        <span>
                                          {msg.attachment_path.split("/").pop()}
                                        </span>
                                        <FiDownload size={13} />
                                      </a>
                                    )}
                                  </div>
                                )}
                                {/* Text */}
                                {msg.body && (
                                  <span>
                                    {msg.body}
                                    {msg.edited && (
                                      <span className="edited-label">
                                        {" "}
                                        (edited)
                                      </span>
                                    )}
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <div className="chat-message-time">
                            {formatTime(msg.created_at)}
                          </div>

                          {/* Seen indicator */}
                          {isMine && isLast && msg.seen && (
                            <div className="seen-label">Seen</div>
                          )}

                          {/* ══ ACTION BAR — icon-only circles below bubble ══ */}
                          {isMine &&
                            !msg.unsent &&
                            !isEditing &&
                            hoveredMsg === msg.id && (
                              <div className="msg-action-bar">
                                {msg.body && (
                                  <button
                                    className="msg-action-btn msg-action-edit"
                                    onClick={() => handleStartEdit(msg)}
                                    title="Edit"
                                  >
                                    <FiEdit2 size={13} />
                                  </button>
                                )}
                                <button
                                  className="msg-action-btn msg-action-delete"
                                  onClick={() => handleUnsend(msg.id)}
                                  title="Delete"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Attachment preview strip */}
          {attachedFile && (
            <div className="attach-preview-bar">
              {attachPreview ? (
                <img
                  src={attachPreview}
                  alt="preview"
                  className="attach-preview-img"
                />
              ) : (
                <div className="attach-preview-file">
                  <FiFile size={18} />
                  <span>{attachedFile.name}</span>
                </div>
              )}
              <button
                className="attach-remove-btn"
                onClick={clearAttachment}
                title="Remove"
              >
                <FiX size={13} />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="message-input-container">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            <InputGroup>
              <button
                type="button"
                className="attach-button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
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
                disabled={sending || (!inputText.trim() && !attachedFile)}
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

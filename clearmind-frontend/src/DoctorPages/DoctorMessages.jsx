import { useState, useEffect, useRef } from "react";
import DoctorSidebar from "./components/DoctorSideBar";
import styles from "./DoctorStyle/DoctorMessages.module.css";
import {
  FiSearch,
  FiPaperclip,
  FiSend,
  FiEdit,
  FiX,
  FiTrash2,
  FiFile,
  FiDownload,
} from "react-icons/fi";
import { useMessages } from "../hooks/useMessages";
import axiosClient from "../axiosClient";

function DoctorMessages() {
  const [activeMenu] = useState("Messages");
  const [showList, setShowList] = useState(true);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null); // File object
  const [attachPreview, setAttachPreview] = useState(null); // preview URL
  const [hoveredMsg, setHoveredMsg] = useState(null); // message id for unsend tooltip
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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
    startConversation,
    getOther,
    getInitials,
    formatTime,
    formatDate,
  } = useMessages();

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (attachPreview) URL.revokeObjectURL(attachPreview);
    };
  }, [attachPreview]);

  const handleSelect = (conv) => {
    openConversation(conv);
    if (window.innerWidth < 768) setShowList(false);
  };

  const handleNewChat = async () => {
    try {
      const { data } = await axiosClient.get("/users/messageable");
      const clientsOnly = data.data.filter((u) => u.role === "Client");
      setAllUsers(clientsOnly);
      setShowNewChat(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartNew = async (userId) => {
    setShowNewChat(false);
    await startConversation(userId);
    if (window.innerWidth < 768) setShowList(false);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      setAttachPreview(URL.createObjectURL(file));
    } else {
      setAttachPreview(null);
    }
    e.target.value = ""; // reset input
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    if (attachPreview) {
      URL.revokeObjectURL(attachPreview);
      setAttachPreview(null);
    }
  };

  // Send handler — text only or with attachment
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

  // Unsend handler
  const handleUnsend = async (msgId) => {
    if (window.confirm("Unsend this message?")) {
      await unsendMessage(msgId);
      setHoveredMsg(null);
    }
  };

  // Resolve attachment URL
  const getAttachmentUrl = (path) =>
    `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/storage/${path}`;

  const isImage = (path) => /\.(jpg|jpeg|png|gif|webp)$/i.test(path ?? "");

  const filtered = conversations.filter((c) => {
    const other = getOther(c);
    return `${other.firstName} ${other.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  // Last message in list — used for "Seen" indicator
  const lastMsgId = messages[messages.length - 1]?.id;

  return (
    <div className="doctor-layout">
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
              boxShadow: "0 8px 32px rgba(77,34,124,0.18)",
            }}
          >
            <h6 style={{ marginBottom: 16, fontWeight: 700, color: "#2e104e" }}>
              Start New Conversation
            </h6>
            {allUsers.length === 0 ? (
              <p style={{ color: "#888" }}>No clients available.</p>
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
                    (e.currentTarget.style.background = "#f3eeff")
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
                      background: "linear-gradient(135deg, #7341A8, #4D227C)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                      boxShadow: "0 3px 10px rgba(77,34,124,0.25)",
                    }}
                  >
                    {`${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#2e104e",
                        fontSize: 14,
                      }}
                    >
                      {u.firstName} {u.lastName}
                    </div>
                    <small style={{ color: "#9ca3af" }}>{u.role}</small>
                  </div>
                </div>
              ))
            )}
            <button
              onClick={() => setShowNewChat(false)}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "10px",
                border: "1.5px solid #e5d6f5",
                borderRadius: 8,
                background: "transparent",
                cursor: "pointer",
                color: "#4D227C",
                fontWeight: 600,
                fontSize: 14,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f3eeff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DoctorSidebar activeMenu={activeMenu} />
      <div className="doctor-main">
        <div
          className={`${styles.msgWrapper} ${showList ? styles.showList : ""}`}
        >
          {/* ══ LEFT PANEL ══ */}
          <div className={styles.msgLeft}>
            <div className={styles.msgLeftTop}>
              <h5 className={styles.msgLeftTitle}>Messages</h5>
              <div className={styles.msgSearch}>
                <FiSearch />
                <input
                  placeholder="Search conversations…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.msgList}>
              {loadingConvs ? (
                <p
                  style={{ padding: 16, color: "var(--color-text-secondary)" }}
                >
                  Loading…
                </p>
              ) : filtered.length === 0 ? (
                <p
                  style={{ padding: 16, color: "var(--color-text-secondary)" }}
                >
                  No conversations yet.
                </p>
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
                      className={`${styles.msgItem} ${activeConv?.id === conv.id ? styles.active : ""}`}
                      onClick={() => handleSelect(conv)}
                    >
                      <div className={styles.avatar}>{initials}</div>
                      <div className={styles.msgItemInfo}>
                        <h6>
                          {other.firstName} {other.lastName}
                        </h6>
                        <p>{lastMsg}</p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        <span className={styles.msgDate}>{lastTime}</span>
                        {conv.unread_count > 0 && (
                          <span className={styles.unreadDot} />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ══ FAB NEW CONVERSATION ══ */}
            <button
              onClick={handleNewChat}
              title="New conversation"
              className={styles.fabBtn}
            >
              <FiEdit />
            </button>
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <div className={styles.msgRight}>
            {!activeConv ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "var(--color-text-secondary)",
                }}
              >
                Select a conversation to start messaging
              </div>
            ) : (
              <>
                {/* Header */}
                <div className={styles.msgHeader}>
                  <button
                    className={styles.backBtn}
                    onClick={() => setShowList(true)}
                  >
                    ←
                  </button>
                  <div className={styles.avatarWrapper}>
                    <div className={`${styles.avatar} ${styles.avatarLg}`}>
                      {getInitials(getOther(activeConv))}
                    </div>
                    <span className={styles.onlineDot} />
                  </div>
                  <div className={styles.msgHeaderInfo}>
                    <h5>
                      {getOther(activeConv).firstName}{" "}
                      {getOther(activeConv).lastName}
                    </h5>
                    <p>{getOther(activeConv).role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className={styles.msgBody}>
                  {loadingMsgs ? (
                    <p style={{ textAlign: "center", padding: 20 }}>
                      Loading messages…
                    </p>
                  ) : (
                    <>
                      {messages.map((m, i) => {
                        const isMine = m.sender_id === currentUserId;
                        const showDate =
                          i === 0 ||
                          formatDate(m.created_at) !==
                            formatDate(messages[i - 1]?.created_at);
                        const isLast = m.id === lastMsgId;

                        return (
                          <div key={m.id}>
                            {showDate && (
                              <div className={styles.msgDay}>
                                {formatDate(m.created_at)}
                              </div>
                            )}

                            {/* Bubble row */}
                            <div
                              className={styles.bubbleRow}
                              style={{
                                justifyContent: isMine
                                  ? "flex-end"
                                  : "flex-start",
                              }}
                              onMouseEnter={() =>
                                isMine && !m.unsent && setHoveredMsg(m.id)
                              }
                              onMouseLeave={() => setHoveredMsg(null)}
                            >
                              {/* Unsend button — only mine, only on hover */}
                              {isMine && hoveredMsg === m.id && !m.unsent && (
                                <button
                                  className={styles.unsendBtn}
                                  onClick={() => handleUnsend(m.id)}
                                  title="Unsend"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              )}

                              {/* Bubble */}
                              <div
                                className={`${styles.bubble} ${isMine ? styles.bubbleAdmin : styles.bubblePatient} ${m.unsent ? styles.bubbleUnsent : ""}`}
                              >
                                {m.unsent ? (
                                  <span className={styles.unsentLabel}>
                                    Message unsent
                                  </span>
                                ) : (
                                  <>
                                    {/* Attachment */}
                                    {m.attachment_path && (
                                      <div className={styles.attachmentWrap}>
                                        {isImage(m.attachment_path) ? (
                                          <a
                                            href={getAttachmentUrl(
                                              m.attachment_path,
                                            )}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            <img
                                              src={getAttachmentUrl(
                                                m.attachment_path,
                                              )}
                                              alt="attachment"
                                              className={styles.attachImg}
                                            />
                                          </a>
                                        ) : (
                                          <a
                                            href={getAttachmentUrl(
                                              m.attachment_path,
                                            )}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.attachFile}
                                          >
                                            <FiFile size={18} />
                                            <span>
                                              {m.attachment_path
                                                .split("/")
                                                .pop()}
                                            </span>
                                            <FiDownload size={14} />
                                          </a>
                                        )}
                                      </div>
                                    )}
                                    {/* Text body */}
                                    {m.body && <span>{m.body}</span>}
                                  </>
                                )}

                                {/* Time */}
                                <div className={styles.msgTime}>
                                  {formatTime(m.created_at)}
                                </div>
                              </div>
                            </div>

                            {/* Seen indicator — only on last sent message by me */}
                            {isMine && isLast && m.seen && (
                              <div className={styles.seenRow}>Seen</div>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Attachment preview strip */}
                {attachedFile && (
                  <div className={styles.attachPreviewBar}>
                    {attachPreview ? (
                      <img
                        src={attachPreview}
                        alt="preview"
                        className={styles.attachPreviewImg}
                      />
                    ) : (
                      <div className={styles.attachPreviewFile}>
                        <FiFile size={20} />
                        <span>{attachedFile.name}</span>
                      </div>
                    )}
                    <button
                      className={styles.attachRemoveBtn}
                      onClick={clearAttachment}
                      title="Remove"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                )}

                {/* Input bar */}
                <div className={styles.msgInputBar}>
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  />
                  <button
                    className={styles.iconBtn}
                    title="Attach file"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiPaperclip />
                  </button>
                  <input
                    className={styles.msgInputField}
                    placeholder="Type a message…"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={sending}
                  />
                  <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={sending || (!inputText.trim() && !attachedFile)}
                  >
                    <FiSend />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorMessages;

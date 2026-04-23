import { useState, useEffect, useRef } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminMessages.module.css";
import { FiSearch, FiPaperclip, FiSend } from "react-icons/fi";
import { useMessages } from "../hooks/useMessages";

function AdminMessages() {
  const [activeMenu] = useState("Messages");
  const [showList, setShowList] = useState(true);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
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
    getOther,
    getInitials,
    formatTime,
    formatDate,
  } = useMessages();

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelect = (conv) => {
    openConversation(conv);
    if (window.innerWidth < 768) setShowList(false);
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    await sendMessage(inputText.trim());
    setInputText("");
  };

  const filtered = conversations.filter((c) => {
    const other = getOther(c);
    return `${other.firstName} ${other.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

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
                    conv.latest_message?.body ?? "No messages yet";
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
                        return (
                          <div key={m.id}>
                            {showDate && (
                              <div className={styles.msgDay}>
                                {formatDate(m.created_at)}
                              </div>
                            )}
                            <div
                              className={`${styles.bubble} ${isMine ? styles.bubbleAdmin : styles.bubblePatient}`}
                            >
                              {m.body}
                              <div className={styles.msgTime}>
                                {formatTime(m.created_at)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <div className={styles.msgInputBar}>
                  <button className={styles.iconBtn} title="Attach file">
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
                    disabled={sending}
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

export default AdminMessages;

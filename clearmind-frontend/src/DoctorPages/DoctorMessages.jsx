import { useState, useEffect, useRef } from "react";
import DoctorSidebar from "./components/DoctorSideBar";
import styles from "./DoctorStyle/DoctorMessages.module.css";
import {
  FiSearch,
  FiPaperclip,
  FiSend,
  FiEdit2,
  FiX,
  FiTrash2,
  FiFile,
  FiDownload,
  FiCheck,
} from "react-icons/fi";
import { BiSolidMessageAdd } from "react-icons/bi";
import { useMessages } from "../hooks/useMessages";
import axiosClient from "../axiosClient";

function DoctorMessages() {
  const [activeMenu] = useState("Messages");
  const [showList, setShowList] = useState(true);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");

  // ── New conversation ──
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // ── Attachment ──
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachPreview, setAttachPreview] = useState(null);

  // ── Hover / edit / unsend ──
  const [hoveredMsg, setHoveredMsg] = useState(null);
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
    editMessage,
    startConversation,
    getOther,
    getInitials,
    formatTime,
    formatDate,
  } = useMessages();

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus edit input
  useEffect(() => {
    if (editingMsgId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMsgId]);

  // Revoke object URLs
  useEffect(() => {
    return () => {
      if (attachPreview) URL.revokeObjectURL(attachPreview);
    };
  }, [attachPreview]);

  /* ── Conversation select ── */
  const handleSelect = (conv) => {
    openConversation(conv);
    if (window.innerWidth < 768) setShowList(false);
  };

  /* ── New conversation ── */
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

  /* ── Attachment ── */
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

  /* ── Send ── */
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

  /* ── Unsend ── */
  const handleUnsend = async (msgId) => {
    if (window.confirm("Unsend this message?")) {
      await unsendMessage(msgId);
      setHoveredMsg(null);
    }
  };

  /* ── Edit ── */
  const handleStartEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditText(msg.body ?? "");
    setHoveredMsg(null);
  };

  const handleConfirmEdit = async (msgId) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    try {
      if (typeof editMessage === "function") {
        await editMessage(msgId, trimmed);
      } else {
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

  /* ── Attachment helpers ── */
  const getAttachmentUrl = (path) =>
    `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/storage/${path}`;

  const isImage = (path) => /\.(jpg|jpeg|png|gif|webp)$/i.test(path ?? "");

  /* ── Filter conversations ── */
  const filtered = conversations.filter((c) => {
    const other = getOther(c);
    return `${other.firstName} ${other.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const lastMsgId = messages[messages.length - 1]?.id;

  return (
    <div className="doctor-layout">
      {/* ══ NEW CHAT MODAL ══ */}
      {showNewChat && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowNewChat(false)}
        >
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h6 className={styles.modalTitle}>New Conversation</h6>
              <button
                className={styles.modalClose}
                onClick={() => setShowNewChat(false)}
              >
                <FiX size={16} />
              </button>
            </div>

            <div className={styles.modalList}>
              {allUsers.length === 0 ? (
                <p className={styles.modalEmpty}>No clients available.</p>
              ) : (
                allUsers.map((u) => (
                  <div
                    key={u.id}
                    className={styles.modalItem}
                    onClick={() => handleStartNew(u.id)}
                  >
                    <div className={styles.modalAvatar}>
                      {`${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase()}
                    </div>
                    <div className={styles.modalItemInfo}>
                      <span className={styles.modalItemName}>
                        {u.firstName} {u.lastName}
                      </span>
                      <span className={styles.modalItemRole}>{u.role}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              className={styles.modalCancelBtn}
              onClick={() => setShowNewChat(false)}
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
              <div className={styles.msgLeftHeader}>
                <h5 className={styles.msgLeftTitle}>Messages</h5>
                <button
                  className={styles.fabBtn}
                  onClick={handleNewChat}
                  title="New conversation"
                >
                  <BiSolidMessageAdd size={18} />
                </button>
              </div>
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
                <p className={styles.listPlaceholder}>Loading…</p>
              ) : filtered.length === 0 ? (
                <p className={styles.listPlaceholder}>No conversations yet.</p>
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
                      <div className={styles.msgItemMeta}>
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
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <BiSolidMessageAdd size={36} />
                </div>
                <p className={styles.emptyTitle}>No conversation selected</p>
                <p className={styles.emptyHint}>
                  Choose one from the list or start a new one
                </p>
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

                {/* Messages body */}
                <div className={styles.msgBody}>
                  {loadingMsgs ? (
                    <p className={styles.bodyLoading}>Loading messages…</p>
                  ) : (
                    <>
                      {messages.map((m, i) => {
                        const isMine = m.sender_id === currentUserId;
                        const isLast = m.id === lastMsgId;
                        const isEditing = editingMsgId === m.id;
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
                              className={`${styles.msgRow} ${isMine ? styles.msgRowMine : styles.msgRowOther}`}
                              onMouseEnter={() =>
                                isMine &&
                                !m.unsent &&
                                !isEditing &&
                                setHoveredMsg(m.id)
                              }
                              onMouseLeave={() => setHoveredMsg(null)}
                            >
                              {/* Other avatar */}
                              {!isMine && (
                                <div
                                  className={`${styles.avatar} ${styles.avatarSm}`}
                                >
                                  {getInitials(getOther(activeConv))}
                                </div>
                              )}

                              <div className={styles.bubbleCol}>
                                {/* Bubble */}
                                <div
                                  className={`${styles.bubble} ${
                                    isMine
                                      ? styles.bubbleAdmin
                                      : styles.bubblePatient
                                  } ${m.unsent ? styles.bubbleUnsent : ""}`}
                                >
                                  {m.unsent ? (
                                    <span className={styles.unsentLabel}>
                                      🚫 Message unsent
                                    </span>
                                  ) : isEditing ? (
                                    /* ── Inline edit ── */
                                    <div className={styles.editWrap}>
                                      <input
                                        ref={editInputRef}
                                        className={styles.editInput}
                                        value={editText}
                                        onChange={(e) =>
                                          setEditText(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            !e.shiftKey
                                          ) {
                                            e.preventDefault();
                                            handleConfirmEdit(m.id);
                                          }
                                          if (e.key === "Escape")
                                            handleCancelEdit();
                                        }}
                                      />
                                      <div className={styles.editActions}>
                                        <button
                                          className={styles.editSaveBtn}
                                          onClick={() =>
                                            handleConfirmEdit(m.id)
                                          }
                                        >
                                          <FiCheck size={11} /> Save
                                        </button>
                                        <button
                                          className={styles.editCancelBtn}
                                          onClick={handleCancelEdit}
                                        >
                                          <FiX size={11} /> Cancel
                                        </button>
                                      </div>
                                    </div>
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
                                              <FiFile size={15} />
                                              <span>
                                                {m.attachment_path
                                                  .split("/")
                                                  .pop()}
                                              </span>
                                              <FiDownload size={12} />
                                            </a>
                                          )}
                                        </div>
                                      )}
                                      {/* Text */}
                                      {m.body && (
                                        <span>
                                          {m.body}
                                          {m.edited && (
                                            <span
                                              className={styles.editedLabel}
                                            >
                                              {" "}
                                              (edited)
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* Time + seen */}
                                <div
                                  className={`${styles.msgTime} ${isMine ? styles.msgTimeMine : ""}`}
                                >
                                  {formatTime(m.created_at)}
                                  {isMine && isLast && m.seen && (
                                    <span className={styles.seenLabel}>
                                      {" "}
                                      · Seen
                                    </span>
                                  )}
                                </div>

                                {/* Action bar */}
                                {isMine &&
                                  !m.unsent &&
                                  !isEditing &&
                                  hoveredMsg === m.id && (
                                    <div
                                      className={`${styles.actionBar} ${styles.actionBarMine}`}
                                    >
                                      {m.body && (
                                        <button
                                          className={`${styles.actionBtn} ${styles.actionEdit}`}
                                          onClick={() => handleStartEdit(m)}
                                          title="Edit"
                                        >
                                          <FiEdit2 size={12} />
                                        </button>
                                      )}
                                      <button
                                        className={`${styles.actionBtn} ${styles.actionDelete}`}
                                        onClick={() => handleUnsend(m.id)}
                                        title="Unsend"
                                      >
                                        <FiTrash2 size={12} />
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
                  <div className={styles.attachPreviewBar}>
                    {attachPreview ? (
                      <img
                        src={attachPreview}
                        alt="preview"
                        className={styles.attachPreviewImg}
                      />
                    ) : (
                      <div className={styles.attachPreviewFile}>
                        <FiFile size={18} />
                        <span>{attachedFile.name}</span>
                      </div>
                    )}
                    <button
                      className={styles.attachRemoveBtn}
                      onClick={clearAttachment}
                    >
                      <FiX size={13} />
                    </button>
                  </div>
                )}

                {/* Input bar */}
                <div className={styles.msgInputBar}>
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

import { useState } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminMessages.module.css";
import { FiSearch, FiPaperclip, FiSend } from "react-icons/fi";

const chats = [
  {
    name: "Liezel Paciente",
    initials: "LP",
    email: "pacienteliezel@gmail.com",
    phone: "09123 456791",
    last: "You: goodmorning",
    date: "Jan 20",
    unread: true,
  },
  {
    name: "Ara Christina Ceres",
    initials: "AC",
    email: "ara.ceres@gmail.com",
    phone: "09181 234567",
    last: "You: Thank you po!",
    date: "Jan 19",
    unread: false,
  },
  {
    name: "Kevin Ramos",
    initials: "KR",
    email: "kevin.ramos@gmail.com",
    phone: "09221 234567",
    last: "Kevin: Okay po.",
    date: "Jan 18",
    unread: true,
  },
  {
    name: "Maria Santos",
    initials: "MS",
    email: "maria.santos@gmail.com",
    phone: "09191 234567",
    last: "You: Noted, salamat!",
    date: "Jan 17",
    unread: false,
  },
  {
    name: "Sofia Dela Cruz",
    initials: "SD",
    email: "sofia.delacruz@gmail.com",
    phone: "09301 234567",
    last: "Sofia: When po ba?",
    date: "Jan 16",
    unread: true,
  },
  {
    name: "John Doe",
    initials: "JD",
    email: "john.doe@gmail.com",
    phone: "09201 234567",
    last: "You: Good morning!",
    date: "Jan 15",
    unread: false,
  },
  {
    name: "Ana Reyes",
    initials: "AR",
    email: "ana.reyes@gmail.com",
    phone: "09301 234567",
    last: "Ana: Thank you!",
    date: "Jan 14",
    unread: false,
  },
  {
    name: "Carlo Mendoza",
    initials: "CM",
    email: "carlo.mendoza@gmail.com",
    phone: "09251 234567",
    last: "You: Sure, noted po.",
    date: "Jan 13",
    unread: false,
  },
];

const messages = [
  { day: "JAN 19" },
  { from: "patient", text: "Good morning po! Pwede po bang magtanong?" },
  { from: "admin", text: "Good morning! Of course, how can I help you?" },
  { from: "patient", text: "May appointment po ba bukas?" },
  { from: "admin", text: "Let me check for you. Please hold on for a moment." },
  { day: "JAN 20" },
  { time: "8:14 am" },
  { from: "patient", text: "goodmorning" },
  {
    from: "admin",
    text: "Good morning!",
  },
  { time: "6:25 pm" },
  {
    from: "patient",
    text: "goodmorning!",
    seen: true,
  },
];

function AdminMessages() {
  const [activeMenu] = useState("Messages");
  const [selectedChat, setSelectedChat] = useState(0);
  const [showList, setShowList] = useState(true);
  const [message, setMessage] = useState("");

  const selected = chats[selectedChat];

  const handleSelect = (i) => {
    setSelectedChat(i);
    if (window.innerWidth < 768) setShowList(false);
  };

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} />
      <div className="admin-main">
      

        <div
          className={`${styles.msgWrapper} ${showList ? styles.showList : ""}`}
        >
          {/* ══ LEFT PANEL ══ */}
          <div className={styles.msgLeft}>
            <div className={styles.msgLeftTop}>
              <h5 className={styles.msgLeftTitle}>Messages</h5>

              <div className={styles.msgSearch}>
                <FiSearch />
                <input placeholder="Search conversations…" />
              </div>

              <select className={styles.msgFilter}>
                <option>Show All</option>
                <option>Unread</option>
                <option>Patients</option>
                <option>Doctors</option>
              </select>
            </div>

            <div className={styles.msgList}>
              {chats.map((c, i) => (
                <div
                  key={i}
                  className={`${styles.msgItem} ${selectedChat === i ? styles.active : ""}`}
                  onClick={() => handleSelect(i)}
                >
                  <div className={styles.avatar}>{c.initials}</div>
                  <div className={styles.msgItemInfo}>
                    <h6>{c.name}</h6>
                    <p>{c.last}</p>
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
                    <span className={styles.msgDate}>{c.date}</span>
                    {c.unread && <span className={styles.unreadDot} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ RIGHT PANEL ══ */}
          <div className={styles.msgRight}>
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
                  {selected.initials}
                </div>
                <span className={styles.onlineDot} />
              </div>

              <div className={styles.msgHeaderInfo}>
                <h5>{selected.name}</h5>
                <p>
                  {selected.email} · {selected.phone}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.msgBody}>
              {messages.map((m, i) => {
                if (m.day)
                  return (
                    <div key={i} className={styles.msgDay}>
                      {m.day}
                    </div>
                  );
                if (m.time)
                  return (
                    <div key={i} className={styles.msgTime}>
                      {m.time}
                    </div>
                  );
                return (
                  <div
                    key={i}
                    className={`${styles.bubble} ${m.from === "admin" ? styles.bubbleAdmin : styles.bubblePatient}`}
                  >
                    {m.text}
                    {m.seen && <div className={styles.seen}>seen ✓</div>}
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className={styles.msgInputBar}>
              <button className={styles.iconBtn} title="Attach file">
                <FiPaperclip />
              </button>
              <input
                className={styles.msgInputField}
                placeholder="Type a message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setMessage("");
                }}
              />
              <button className={styles.sendBtn} title="Send message">
                <FiSend />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMessages;

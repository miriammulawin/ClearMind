import { useState } from "react";
import DoctorSideBar from "./components/DoctorSideBar";
import DoctorTopNavbar from "./components/DoctorTopNavbar";
import "./DoctorStyle/DoctorMessages.css";
import { FiSearch, FiPaperclip, FiSend } from "react-icons/fi";

function DoctorMessages() {
  const [activeMenu] = useState("Messages");
  const [selectedChat, setSelectedChat] = useState(0);
  const [showList, setShowList] = useState(true);

  const chats = new Array(8).fill({
    name: "Liezel Paciente",
    email: "pacienteliezl@gmail.com",
    phone: "09123 456791",
    last: "You: goodmorning",
    date: "January 20, 2026",
  });

  const messages = [
    { from: "patient", text: "goodmorning" },
    { from: "admin", text: "goodmorning!, how's your day? eat your lunch, goodbye." },
    { day: "JAN 20" },
    { from: "patient", text: "goodmorning!, how's your day? eat your lunch, goodbye." },
    { from: "patient", text: "goodmorning!, how's your day? eat your lunch, goodbye." },
    { time: "6:25 am" },
    { from: "patient", text: "goodmorning!, how's your day? eat your lunch, goodbye.", seen: true },
  ];

  return (
    <div className="doctor-layout">
      <DoctorSideBar activeMenu={activeMenu} />

      <div className="doctor-main">
        <DoctorTopNavbar activeMenu={activeMenu} />

        <div className={`doctor-content msg-wrapper ${showList ? "show-list" : ""}`}>

          {/* Left panel — chat list */}
          <div className="msg-left">
            <select className="msg-filter">
              <option>Show All</option>
            </select>

            <div className="msg-search">
              <FiSearch />
              <input placeholder="Search Existing Conversation" />
            </div>

            <div className="msg-list">
              {chats.map((c, i) => (
                <div
                  key={i}
                  className={`msg-item ${selectedChat === i ? "active" : ""}`}
                  onClick={() => {
                    setSelectedChat(i);
                    if (window.innerWidth < 768) setShowList(false);
                  }}
                >
                  <div className="avatar">LP</div>
                  <div className="msg-info">
                    <h6>{c.name}</h6>
                    <p>{c.last}</p>
                  </div>
                  <span className="msg-date">{c.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — chat window */}
          <div className="msg-right">
            <div className="msg-header">
              <button className="back-btn" onClick={() => setShowList(true)}>
                ←
              </button>
              <div className="avatar large">LP</div>
              <div>
                <h5>Liezel Paciente</h5>
                <p>pacienteliezl@gmail.com · 09123 456791</p>
              </div>
            </div>

            <div className="msg-body">
              {messages.map((m, i) => {
                if (m.day)  return <div key={i} className="msg-day">{m.day}</div>;
                if (m.time) return <div key={i} className="msg-time">{m.time}</div>;
                return (
                  <div key={i} className={`bubble ${m.from === "admin" ? "admin" : "patient"}`}>
                    {m.text}
                    {m.seen && <div className="seen">seen</div>}
                  </div>
                );
              })}
            </div>

            <div className="msg-input">
              <FiPaperclip className="attach" />
              <input placeholder="Type a message..." />
              <FiSend className="send" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default DoctorMessages;
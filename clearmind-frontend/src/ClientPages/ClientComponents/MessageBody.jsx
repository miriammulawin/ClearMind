import React, { useState, useEffect } from 'react';
import { Container, Form, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../ClientStyle/MessageBody.css';
import { FaSearch } from "react-icons/fa";
import { IoMdAttach } from "react-icons/io";
import { IoMdArrowBack } from "react-icons/io";
import { BiSolidMessageAdd } from "react-icons/bi";

// ============================================
// FAKE API FUNCTIONS (Replace with real API later)
// ============================================

// Simulates fetching conversations from backend
const fetchConversations = async () => {
  // TODO: Replace with actual API call
  // return await fetch('/api/conversations').then(res => res.json());
  
  // Fake data for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          userId: 101,
          name: 'Liezel Paciente',
          email: 'pacienteliezel@gmail.com',
          phone: '09124 587891',
          unreadCount: 3,
          lastMessageTime: new Date(Date.now() - 60000), // 1 minute ago
          avatar: 'LP'
        },
        {
          id: 2,
          userId: 102,
          name: 'Juan Dela Cruz',
          email: 'juan@gmail.com',
          phone: '09123 456789',
          unreadCount: 1,
          lastMessageTime: new Date(Date.now() - 300000), // 5 minutes ago
          avatar: 'JD'
        },
        {
          id: 3,
          userId: 103,
          name: 'Maria Santos',
          email: 'maria@gmail.com',
          phone: '09987 654321',
          unreadCount: 0,
          lastMessageTime: new Date(Date.now() - 7200000), // 2 hours ago
          avatar: 'MS'
        }
      ]);
    }, 500); // Simulate network delay
  });
};

// Simulates fetching messages for a specific conversation
const fetchMessages = async (conversationId) => {
  // TODO: Replace with actual API call
  // return await fetch(`/api/conversations/${conversationId}/messages`).then(res => res.json());
  
  // Fake data for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          conversationId: conversationId,
          text: 'goodmorning!, pwede pong mgpasched ng appointment...',
          time: '12:30 pm',
          timestamp: new Date(Date.now() - 3600000),
          sent: false,
          senderId: 101,
          read: true
        },
        {
          id: 2,
          conversationId: conversationId,
          text: 'yes po, when and what time po?',
          time: '12:35 pm',
          timestamp: new Date(Date.now() - 3300000),
          sent: true,
          senderId: 'current_user',
          read: true
        },
        {
          id: 3,
          conversationId: conversationId,
          text: 'sana po next week, available po ba kayo?',
          time: '12:36 pm',
          timestamp: new Date(Date.now() - 60000),
          sent: false,
          senderId: 101,
          read: false
        }
      ]);
    }, 300);
  });
};

// Simulates sending a new message
const sendMessage = async (conversationId, messageText) => {
  // TODO: Replace with actual API call
  // return await fetch(`/api/conversations/${conversationId}/messages`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ text: messageText })
  // }).then(res => res.json());
  
  // Fake response for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now(),
        conversationId: conversationId,
        text: messageText,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        timestamp: new Date(),
        sent: true,
        senderId: 'current_user',
        read: false
      });
    }, 200);
  });
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Calculate relative time (now, 5m ago, 2h ago, etc.)
const getRelativeTime = (timestamp) => {
  const now = new Date();
  const diffInMs = now - new Date(timestamp);
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

// Format date for dividers
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function MessagingApp({ onChatStateChange }) {
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Backend data states
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load conversations on component mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setLoading(true);
      const data = await fetchMessages(conversationId);
      setChatMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowChat = async (show, conversation = null) => {
    setShowChat(show);
    if (onChatStateChange) {
      onChatStateChange(show);
    }

    if (show && conversation) {
      setCurrentConversation(conversation);
      await loadMessages(conversation.id);
      
      // Mark conversation as read
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } else {
      setCurrentConversation(null);
      setChatMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentConversation) return;

    try {
      setSending(true);
      const newMessage = await sendMessage(currentConversation.id, message);
      
      // Add message to chat
      setChatMessages(prev => [...prev, newMessage]);
      
      // Update conversation's last message time
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversation.id
            ? { ...conv, lastMessageTime: new Date() }
            : conv
        )
      );
      
      // Clear input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="messaging-app-container">
      {!showChat ? (
        // First Frame - Messages List Only (No Header/Footer)
        <Container fluid className="p-0 messaging-container">
          {/* Messages Header */}
          <div className="messages-header">
            {!showSearch ? (
              <>
                <h5 className="messages-title">MESSAGES</h5>
                <button className="search-button" onClick={() => setShowSearch(true)}>
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
                    setSearchText('');
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          
          <div className="messages-list">
            {loading ? (
              <div className="loading-container">
                <p>Loading conversations...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="no-messages-container">
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleShowChat(true, conv)}
                  className="message-item"
                >
                  <div className="message-avatar">
                    {conv.avatar}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <h6 className="message-name">{conv.name}</h6>
                      <small className="message-date">
                        {new Date(conv.lastMessageTime).toLocaleDateString()}
                      </small>
                    </div>
                    <p className="message-preview">
                      {conv.unreadCount > 0 ? (
                        <span className="unread-messages">
                          {conv.unreadCount} new {conv.unreadCount === 1 ? 'message' : 'messages'}
                          <span className="status-bullet"> • </span>
                          <span className="message-status-time">
                            {getRelativeTime(conv.lastMessageTime)}
                          </span>
                        </span>
                      ) : (
                        <span className="no-new-messages">
                          No new messages
                          <span className="status-bullet"> • </span>
                          <span className="message-status-time">
                            {getRelativeTime(conv.lastMessageTime)}
                          </span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className='button-position'>
            {/* Floating Add New Message Button */}
            <button className="fab-new-message" onClick={() => alert('Start new conversation')}>
            <BiSolidMessageAdd className='add-message'/>
            </button>
          </div>
          
        </Container>
      ) : (
        // Second Frame - Complete Chat View (With Header and Footer)
        <Container fluid className="p-0 chat-container">
          {/* Header */}
          <div className="chat-header">
            <button
              onClick={() => handleShowChat(false)}
              className="back-button"
            >
              <IoMdArrowBack />
            </button>
            <div className="chat-avatar">
              {currentConversation?.avatar}
            </div>
            <div className="chat-user-info">
              <h6 className="chat-user-name">{currentConversation?.name}</h6>
              <small className="chat-user-contact">
                {currentConversation?.email} - {currentConversation?.phone}
              </small>
            </div>
            <button className="menu-button">
              ⋮
            </button>
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {loading ? (
              <div className="loading-container">
                <p>Loading messages...</p>
              </div>
            ) : (
              <>
                {chatMessages.length > 0 && (
                  <div className="date-divider">
                    <small>{formatDate(chatMessages[0].timestamp)}</small>
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.sent ? 'sent' : 'received'}`}
                  >
                    {!msg.sent && (
                      <div className="chat-message-avatar">
                        {currentConversation?.avatar}
                      </div>
                    )}
                    <div>
                      <div className="chat-message-bubble">
                        {msg.text}
                      </div>
                      <div className="chat-message-time">
                        {msg.time}
                        {msg.sent && msg.read && <span className="message-status"> seen</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="message-input-container">
            <form onSubmit={handleSendMessage}>
              <InputGroup>
                <button type="button" className="attach-button">
                  <IoMdAttach />
                </button>
                <Form.Control
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="message-text-input"
                  disabled={sending}
                />
                <button 
                  type="submit" 
                  className="send-button"
                  disabled={sending || !message.trim()}
                >
                  {sending ? '...' : '➤'}
                </button>
              </InputGroup>
            </form>
          </div>
        </Container>
      )}
    </div>
  );
}
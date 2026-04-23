import { useState, useEffect, useRef, useCallback } from "react";
import axiosClient from "../axiosClient";
import echo from "../../echo";

export function useMessages() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const channelRef = useRef(null);

  // Get current user id from localStorage
  const currentUserId = JSON.parse(localStorage.getItem("user") ?? "{}")?.id;

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConvs(true);
      const { data } = await axiosClient.get("/conversations");
      setConversations(data.data);
    } catch (err) {
      console.error("Failed to load conversations", err);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const openConversation = useCallback(async (conv) => {
    // Leave previous channel
    if (channelRef.current) {
      echo.leave(`conversation.${channelRef.current}`);
    }

    setActiveConv(conv);
    setMessages([]);
    setLoadingMsgs(true);

    try {
      const { data } = await axiosClient.get(
        `/conversations/${conv.id}/messages`,
      );
      setMessages([...(data.data.data ?? [])].reverse());
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMsgs(false);
    }

    // Subscribe to real-time updates
    channelRef.current = conv.id;
    echo.private(`conversation.${conv.id}`).listen("MessageSent", (e) => {
      setMessages((prev) => [...prev, e]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id ? { ...c, latest_message: e, unread_count: 0 } : c,
        ),
      );
    });
  }, []);

  const sendMessage = useCallback(
    async (body) => {
      if (!activeConv || !body.trim() || sending) return;
      setSending(true);
      try {
        const { data } = await axiosClient.post(
          `/conversations/${activeConv.id}/messages`,
          { body },
        );
        setMessages((prev) => [...prev, data.data]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConv.id ? { ...c, latest_message: data.data } : c,
          ),
        );
      } catch (err) {
        console.error("Failed to send message", err);
      } finally {
        setSending(false);
      }
    },
    [activeConv, sending],
  );

  const startConversation = useCallback(
    async (userId) => {
      const { data } = await axiosClient.post("/conversations/start", {
        user_id: userId,
      });
      const conv = data.data;
      setConversations((prev) =>
        prev.find((c) => c.id === conv.id) ? prev : [conv, ...prev],
      );
      await openConversation(conv);
      return conv;
    },
    [openConversation],
  );

  // Helper: get the other participant (not current user)
  const getOther = (conv) =>
    conv.participants?.find((p) => p.id !== currentUserId) ??
    conv.participants?.[0] ??
    {};

  const getInitials = (user) =>
    `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    return () => {
      if (channelRef.current) echo.leave(`conversation.${channelRef.current}`);
    };
  }, []);

  return {
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
    refreshConversations: fetchConversations,
  };
}

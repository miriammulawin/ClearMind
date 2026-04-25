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
  const activeConvRef = useRef(null);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

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

  const openConversation = useCallback(
    async (conv) => {
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

      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
      );

      channelRef.current = conv.id;
      echo
        .private(`conversation.${conv.id}`)
        .listen("MessageSent", (e) => {
          setMessages((prev) => [...prev, e]);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conv.id
                ? {
                    ...c,
                    latest_message: e,
                    unread_count:
                      activeConvRef.current?.id === conv.id
                        ? 0
                        : (c.unread_count ?? 0) + 1,
                  }
                : c,
            ),
          );
        })
        .listen("MessageUnsent", (e) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === e.message_id
                ? { ...m, body: null, attachment_path: null, unsent: true }
                : m,
            ),
          );
        })
        // ── NEW: real-time edit listener ──────────────────────────────────
        .listen("MessageEdited", (e) => {
          // e = { message_id: number, body: string, edited_at: string }
          setMessages((prev) =>
            prev.map((m) =>
              m.id === e.message_id
                ? { ...m, body: e.body, edited: true, edited_at: e.edited_at }
                : m,
            ),
          );
        })
        // ─────────────────────────────────────────────────────────────────
        .listen("MessageRead", (e) => {
          if (e.reader_id !== currentUserId) {
            setMessages((prev) => prev.map((m) => ({ ...m, seen: true })));
          }
        });
    },
    [currentUserId],
  );

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

  const sendWithAttachment = useCallback(
    async (body, file) => {
      if (!activeConv || sending) return;
      setSending(true);
      try {
        const formData = new FormData();
        if (body?.trim()) formData.append("body", body.trim());
        if (file) formData.append("attachment", file);

        const { data } = await axiosClient.post(
          `/conversations/${activeConv.id}/messages`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        setMessages((prev) => [...prev, data.data]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConv.id ? { ...c, latest_message: data.data } : c,
          ),
        );
      } catch (err) {
        console.error("Failed to send attachment", err);
      } finally {
        setSending(false);
      }
    },
    [activeConv, sending],
  );

  const unsendMessage = useCallback(async (messageId) => {
    try {
      await axiosClient.delete(`/messages/${messageId}`);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, body: null, attachment_path: null, unsent: true }
            : m,
        ),
      );
    } catch (err) {
      console.error("Failed to unsend message", err);
    }
  }, []);

  // ── NEW: edit an existing message ─────────────────────────────────────────
  const editMessage = useCallback(async (messageId, newBody) => {
    if (!newBody.trim()) return;
    try {
      const { data } = await axiosClient.patch(`/messages/${messageId}`, {
        body: newBody.trim(),
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                body: data.data.body,
                edited: true,
                edited_at: data.data.updated_at,
              }
            : m,
        ),
      );
    } catch (err) {
      console.error("Failed to edit message", err);
    }
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

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
    sendWithAttachment,
    unsendMessage,
    editMessage, // ← NEW
    startConversation,
    getOther,
    getInitials,
    formatTime,
    formatDate,
    refreshConversations: fetchConversations,
  };
}

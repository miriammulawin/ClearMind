import { useState, useEffect, useRef, useCallback } from "react";
import axiosClient from "../axiosClient";
import echo from "../echo";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const activeConvIdRef = useRef(null);
  const currentUserId = JSON.parse(localStorage.getItem("user") ?? "{}")?.id;

  const refresh = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/conversations");
      const convos = data.data ?? [];
      const total = convos.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);
      setUnreadCount(total);
    } catch (err) {
      console.error("Failed to load unread count", err);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // One channel, one subscription — covers every conversation, including brand-new ones
  useEffect(() => {
    if (!currentUserId) return;

    const channel = echo.private(`user.${currentUserId}`);

    const handler = (e) => {
      // Compare as strings — sender_id/currentUserId can come back as
      // number vs string depending on how the payload was serialized,
      // and a strict !== here means the sender's own badge increments.
      if (String(e.sender_id) === String(currentUserId)) return; // ignore messages I sent
      if (e.conversation_id === activeConvIdRef.current) return; // already viewing this chat
      setUnreadCount((prev) => prev + 1);
    };

    channel.listen("MessageSent", handler);

    return () => {
      channel.stopListening("MessageSent", handler);
      echo.leave(`user.${currentUserId}`);
    };
  }, [currentUserId]);

  // Bridge events from the Messages page
  useEffect(() => {
    const onActiveConv = (e) => {
      activeConvIdRef.current = e.detail ?? null;
    };
    const onCleared = (e) => {
      const n = e.detail ?? 0;
      setUnreadCount((prev) => Math.max(0, prev - n));
    };
    window.addEventListener("messages:activeConv", onActiveConv);
    window.addEventListener("messages:cleared", onCleared);
    return () => {
      window.removeEventListener("messages:activeConv", onActiveConv);
      window.removeEventListener("messages:cleared", onCleared);
    };
  }, []);

  return unreadCount;
}

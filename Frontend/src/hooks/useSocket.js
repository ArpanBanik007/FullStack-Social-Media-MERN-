import { useEffect, useRef } from "react";
import { useSocket } from "../context/SocketContext";


export const useChatSocket = ({
  conversationId,
  onNewMessage,
  onTyping,
  onStopTyping,
  onMessageSeen,
  onMessageDeleted,
  onMessageEdited,
}) => {
  const { socket } = useSocket();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("joinRoom", conversationId);

    socket.on("newMessage", onNewMessage);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);
    socket.on("messageSeen", onMessageSeen);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("messageEdited", onMessageEdited);

    return () => {
      socket.emit("leaveRoom", conversationId);
      socket.off("newMessage", onNewMessage);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
      socket.off("messageSeen", onMessageSeen);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("messageEdited", onMessageEdited);
    };
  }, [socket, conversationId]);

  const emitTyping = () => {
    if (!socket || !conversationId) return;
    socket.emit("typing", { conversationId });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId });
    }, 3000);
  };

  const emitSeen = () => {
    if (!socket || !conversationId) return;
    socket.emit("messageSeen", { chatId: conversationId });
  };

  return { emitTyping, emitSeen };
};
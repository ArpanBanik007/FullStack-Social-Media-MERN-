import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import ChatLeftBar from "../Chat/ChatLeftBar";
import ChattingPage from "../Chat/ChattingPage";
import ChatRightbar from "../Chat/ChatRightbar";
import Navbar from "../home/Navbar";
import {
  fetchConversations,
  setSelectedConversation,
  setOnlineUsers,
  addMessage,
  updateLastMessage,
  setTypingUser,
  removeTypingUser,
  markMessagesSeenLocally,
  deleteMessageLocally,
  updateReactions,
  updateUserPresence,
  receiveMessageGlobally,
} from "../slices/chat.slice";
import { formatLastSeen } from "../utils/timeUtils";
import { connectSocket, disconnectSocket, getSocket } from "../socket.js";
import { selectCurrentUser } from "../slices/mydetails.slice";

function ChatMainPage() {
  const dispatch = useDispatch();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const { selectedConversation, conversations, onlineUsers } = useSelector(
    (state) => state.chat,
  );
  const [showRightbar, setShowRightbar] = useState(false);

  const isOnline = (userId) => {
    if (!userId) return false;
    const idStr = String(userId);
    return onlineUsers.some((u) => String(u._id || u) === idStr);
  };

  // ── Socket connect করো একবার, currentUser._id পেলেই
  useEffect(() => {
    if (!currentUser?._id) return;
    connectSocket(currentUser._id);
  }, [currentUser?._id]);

  // ── Global socket events — শুধু currentUser._id এ depend করে
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessageNotification = ({ conversationId, preview }) => {
      dispatch(
        updateLastMessage({
          conversationId,
          preview,
          lastMessageAt: new Date().toISOString(),
        }),
      );
    };

    const handleReceiveMessage = (msg) => {
      console.log("📩 receive-message:", msg);
      dispatch(receiveMessageGlobally({ msg, currentUserId: currentUser._id }));
    };

    const handleMessageSent = (msg) => {
      console.log("✉️ message-sent:", msg);
      dispatch(receiveMessageGlobally({ msg, currentUserId: currentUser._id }));
    };

    const handleUserStatusUpdate = ({ userId, isOnline, lastSeen }) => {
      dispatch(updateUserPresence({ userId, isOnline, lastSeen }));
    };

    const handleOnlineUsers = (userIds) => {
      dispatch(setOnlineUsers(userIds));
    };

    socket.on("newMessageNotification", handleNewMessageNotification);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("message-sent", handleMessageSent);
    socket.on("user-status-update", handleUserStatusUpdate);
    socket.on("online-users", handleOnlineUsers);

    // Conversations load করো
    dispatch(fetchConversations());

    return () => {
      socket.off("newMessageNotification", handleNewMessageNotification);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("message-sent", handleMessageSent);
      socket.off("user-status-update", handleUserStatusUpdate);
      socket.off("online-users", handleOnlineUsers);
    };
  }, [currentUser?._id, dispatch]); // ← selectedConversation নেই এখানে

  // ── Route param থেকে conversation sync করো
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const rawConv = conversations.find(
        (c) =>
          String(c._id) === conversationId || String(c.id) === conversationId,
      );
      if (rawConv) {
        const other = rawConv.members?.find(
          (m) => String(m._id) !== String(currentUser?._id),
        );
        const shaped = {
          ...rawConv,
          id: rawConv._id,
          name:
            other?.fullName || other?.name || other?.username || "Unknown",
          avatar: other?.avatar || "/default-avatar.png",
          _other: other,
        };
        dispatch(setSelectedConversation(shaped));
      } else {
        dispatch(setSelectedConversation(null));
        navigate("/chat", { replace: true });
      }
    } else if (!conversationId) {
      if (!selectedConversation?.isNew) {
        dispatch(setSelectedConversation(null));
      }
    }
  }, [conversationId, conversations.length, dispatch, navigate, currentUser?._id]);

  // ── নতুন conversation → active হলে URL update করো
  const isNewRef = useRef(false);
  useEffect(() => {
    if (selectedConversation?.isNew) {
      isNewRef.current = true;
    } else if (
      selectedConversation?._id &&
      isNewRef.current &&
      !conversationId
    ) {
      navigate(`/chat/${selectedConversation._id}`, { replace: true });
      isNewRef.current = false;
    } else if (conversationId) {
      isNewRef.current = false;
    }
  }, [selectedConversation, conversationId, navigate]);

  const handleSelectChat = (conv) => {
    if (conv.id || conv._id) {
      navigate(`/chat/${conv.id || conv._id}`);
    } else {
      dispatch(setSelectedConversation(conv));
    }
    setShowRightbar(false);
  };

  // ── ChatLeftBar এর জন্য conversations shape করো
  const shapedConversations = conversations.map((conv) => {
    const other = conv.members?.find(
      (m) => String(m._id) !== String(currentUser?._id),
    );
    return {
      ...conv,
      id: conv._id,
      name: other?.fullName || other?.name || other?.username || "Unknown",
      avatar: other?.avatar || "/default-avatar.png",
      lastMsg: conv.lastMessage || "",
      time: conv.lastMessageAt
        ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "",
      unread: conv.unreadCounts?.[String(currentUser?._id)] || 0,
      online: isOnline(other?._id),
      lastSeen: other?.lastSeen,
      _other: other,
    };
  });

  return (
    <>
      <style>{`
        .chat-page-root {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0f172a;
          overflow: hidden;
        }
        .chat-page-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          min-height: 0;
        }
        .chat-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.15);
          gap: 12px;
          font-family: 'DM Sans', sans-serif;
        }
        .chat-empty-icon { font-size: 52px; }
        .chat-empty-text { font-size: 15px; font-weight: 500; }
        .chat-empty-sub  { font-size: 13px; opacity: 0.6; }
      `}</style>

      <div className="chat-page-root">
        <Navbar />
        <div className="chat-page-body">
          {/* Left */}
          <ChatLeftBar
            conversations={shapedConversations}
            onSelectChat={handleSelectChat}
            selectedId={selectedConversation?._id}
          />

          {/* Center */}
          {selectedConversation ? (
            <ChattingPage
              conversation={{
                ...selectedConversation,
                online: isOnline(
                  selectedConversation._other?._id ||
                  selectedConversation.receiverId,
                ),
              }}
              onOpenProfile={() => setShowRightbar(true)}
            />
          ) : (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">💬</div>
              <div className="chat-empty-text">Select a conversation</div>
              <div className="chat-empty-sub">
                Choose from your messages on the left
              </div>
            </div>
          )}

          {/* Right */}
          {showRightbar &&
            selectedConversation &&
            !selectedConversation.isNew && (
              <ChatRightbar
                conversation={selectedConversation}
                onClose={() => setShowRightbar(false)}
              />
            )}
        </div>
      </div>
    </>
  );
}

export default ChatMainPage;
import API from "../utils/API.js";
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  sendMessage,
  reactToMessageAction,
  setTypingUser,
  removeTypingUser,
  markMessagesSeenLocally,
  deleteMessageLocally,
  editMessageLocally,
  updateReactions,
} from "../slices/chat.slice";
import { selectCurrentUser } from "../slices/mydetails.slice";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../socket.js";
import {
  FiSend,
  FiSmile,
  FiPaperclip,
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiCornerUpLeft,
} from "react-icons/fi";
import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { formatLastSeen } from "../utils/timeUtils";

function ChattingPage({ conversation, onOpenProfile }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const reduxMessages = useSelector((state) => state.chat.messages);
  const typingUsers = useSelector((state) => state.chat.typingUsers);
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const typingTimerRef = useRef(null);

  // ── Emoji picker outside click close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // ── Conversation change হলে room join করো এবং socket events attach করো
  useEffect(() => {
    if (!conversation?._id) return;

    const socket = getSocket();
    if (!socket) return;

    // Room join
    socket.emit("joinRoom", conversation._id);
    console.log("📌 Joined room:", conversation._id);

    // messageSeen handler
    const handleMessageSeen = ({ chatId, seenBy, seenAt }) => {
      dispatch(
        markMessagesSeenLocally({
          seenBy,
          currentUserId: currentUser?._id,
          chatId,
        }),
      );
    };

    // messageDeleted handler
    const handleMessageDeleted = ({ messageId, deletedFor }) => {
      dispatch(deleteMessageLocally({ messageId, deleteFor: deletedFor }));
    };

    // messageEdited handler
    const handleMessageEdited = ({ messageId, content }) => {
      dispatch(editMessageLocally({ messageId, content }));
    };

    // reactionUpdated handler
    const handleReactionUpdated = ({ messageId, reactions }) => {
      dispatch(updateReactions({ messageId, reactions }));
    };

    // typing handler
    const handleTyping = ({ conversationId, userId, userName }) => {
      if (String(conversationId) === String(conversation._id)) {
        dispatch(setTypingUser({ userName }));
      }
    };

    // stopTyping handler
    const handleStopTyping = ({ conversationId, userId }) => {
      if (String(conversationId) === String(conversation._id)) {
        dispatch(removeTypingUser({ userId }));
      }
    };

    socket.on("messageSeen", handleMessageSeen);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("reactionUpdated", handleReactionUpdated);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.emit("leaveRoom", conversation._id);
      socket.off("messageSeen", handleMessageSeen);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("reactionUpdated", handleReactionUpdated);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [conversation?._id, dispatch, currentUser?._id]);

  // ── Messages fetch
  useEffect(() => {
    if (conversation?._id) {
      dispatch(fetchMessages({ conversationId: conversation._id }));
    }
  }, [conversation?._id, dispatch]);

  // ── Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [reduxMessages]);

  // ── Mark seen — unread message থাকলে socket emit করো
  useEffect(() => {
    if (!conversation?._id || reduxMessages.length === 0) return;

    const hasUnseen = reduxMessages.some(
      (m) =>
        String(m.senderId?._id || m.senderId) !== String(currentUser?._id) &&
        m.status !== "seen",
    );

    if (hasUnseen) {
      const socket = getSocket();
      if (socket) {
        socket.emit("messageSeen", { chatId: conversation._id });
      }
    }
  }, [conversation?._id, reduxMessages, currentUser?._id]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const type = file.type;
    let detectedType = "file";

    if (type.startsWith("image/")) {
      detectedType = "image";
      if (file.size > 5 * 1024 * 1024) return alert("Image must be less than 5MB");
      setFilePreview(URL.createObjectURL(file));
    } else if (type.startsWith("video/")) {
      detectedType = "video";
      if (file.size > 10 * 1024 * 1024) return alert("Video must be less than 10MB");
      setFilePreview(URL.createObjectURL(file));
    } else if (type === "application/pdf") {
      detectedType = "file";
      if (file.size > 5 * 1024 * 1024) return alert("PDF must be less than 5MB");
      setFilePreview("/pdf-icon.png");
    } else {
      return alert("Unsupported file type");
    }

    setFileType(detectedType);
    setSelectedFile(file);
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedFile) || !conversation) return;

    // Typing stop emit
    const socket = getSocket();
    if (socket && conversation?._id) {
      socket.emit("stopTyping", { conversationId: conversation._id });
      clearTimeout(typingTimerRef.current);
    }

    if (selectedFile) {
      const formData = new FormData();
      formData.append(
        "receiverId",
        conversation.receiverId || conversation._other?._id,
      );
      formData.append("type", fileType);
      if (input.trim()) formData.append("content", input.trim());
      if (replyingTo) formData.append("replyTo", replyingTo.id);
      formData.append("file", selectedFile);

      dispatch(sendMessage(formData));
      setSelectedFile(null);
      setFilePreview(null);
      setFileType(null);
      setInput("");
      setReplyingTo(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const payload = {
      receiverId: conversation.receiverId || conversation._other?._id,
      content: input.trim(),
      type: "text",
      replyTo: replyingTo ? replyingTo.id : null,
    };

    dispatch(sendMessage(payload));
    setInput("");
    setReplyingTo(null);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Typing emit
    const socket = getSocket();
    if (socket && conversation?._id) {
      socket.emit("typing", { conversationId: conversation._id });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socket.emit("stopTyping", { conversationId: conversation._id });
      }, 2000);
    }
  };

  const handleReact = (msgId, emoji) => {
    dispatch(reactToMessageAction({ messageId: msgId, emoji }));
    setActiveMessageId(null);
  };

  const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) return null;

  const displayMessages = reduxMessages.map((msg) => ({
    id: msg._id,
    from:
      String(msg.senderId?._id || msg.senderId) === String(currentUser?._id)
        ? "me"
        : "them",
    text: msg.content,
    time: new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: msg.status || "sent",
    type: msg.type || "text",
    fileUrl: msg.fileUrl || null,
    fileName: msg.fileName || null,
    reactions: msg.reactions || {},
    replyTo: msg.replyTo || null,
    isDeleted: msg.isDeleted || false,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .chatting-root {
          font-family: 'DM Sans', sans-serif;
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0f172a;
          min-width: 0;
        }

        .chatting-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
          background: #111827;
        }

        .chatting-avatar-wrap { position: relative; flex-shrink: 0; }
        .chatting-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(6,182,212,0.3);
        }
        .chatting-online {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #111827;
          box-shadow: 0 0 5px rgba(34,197,94,0.6);
        }

        .chatting-info { flex: 1; min-width: 0; }
        .chatting-name { font-size: 15px; font-weight: 700; color: #f1f5f9; }
        .chatting-status { font-size: 12px; color: #22c55e; font-weight: 500; }
        .chatting-status.offline { color: rgba(255,255,255,0.3); }
        .chatting-typing { font-size: 12px; color: #06b6d4; font-style: italic; }

        .chatting-actions { display: flex; align-items: center; gap: 4px; }
        .chatting-action-btn {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; color: rgba(255,255,255,0.4);
          cursor: pointer; transition: background 0.15s, color 0.15s;
          border: none; background: transparent;
        }
        .chatting-action-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }

        .chatting-messages {
          flex: 1; overflow-y: auto;
          padding: 20px 20px 8px;
          display: flex; flex-direction: column; gap: 6px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.06) transparent;
        }
        .chatting-messages::-webkit-scrollbar { width: 4px; }
        .chatting-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 4px; }

        .msg-row { display: flex; align-items: flex-end; gap: 8px; }
        .msg-row.me { flex-direction: row-reverse; }

        .msg-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; margin-bottom: 2px; }
        .msg-row.me .msg-avatar { display: none; }

        .msg-content { display: flex; flex-direction: column; max-width: 75%; }
        .msg-row.me .msg-content { align-items: flex-end; }
        .msg-row.them .msg-content { align-items: flex-start; }

        .msg-bubble {
          max-width: 100%; padding: 8px 14px; border-radius: 18px;
          font-size: 15px; line-height: 1.4; white-space: pre-wrap;
          overflow-wrap: break-word; word-break: break-word;
          box-shadow: 0 1px 2px rgba(0,0,0,0.15);
        }
        .msg-deleted { font-style: italic; opacity: 0.4; font-size: 13px; }
        .msg-image { max-width: 250px; max-height: 250px; border-radius: 12px; object-fit: cover; margin-bottom: 4px; display: block; }
        .msg-video { max-width: 250px; border-radius: 12px; margin-bottom: 4px; display: block; }
        .msg-file {
          display: flex; align-items: center; gap: 12px; padding: 10px;
          background: rgba(0,0,0,0.15); border-radius: 8px; margin-bottom: 4px;
          text-decoration: none; color: inherit;
        }
        .msg-file:hover { background: rgba(0,0,0,0.25); }
        .msg-row.them .msg-bubble { background: rgba(255,255,255,0.07); color: #e2e8f0; border-bottom-left-radius: 4px; }
        .msg-row.me .msg-bubble { background: linear-gradient(135deg, #0891b2, #2563eb); color: #fff; border-bottom-right-radius: 4px; }

        .msg-meta { display: flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 11px; color: rgba(255,255,255,0.4); }
        .msg-row.me .msg-meta { align-self: flex-end; }
        .msg-row.them .msg-meta { align-self: flex-start; }
        .msg-status-icon { display: flex; align-items: center; font-size: 15px; }
        .msg-seen { color: #3b82f6; }

        .msg-row-inner { position: relative; display: flex; align-items: center; gap: 8px; }
        .msg-options {
          display: none;
          background: rgba(15,23,42,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 4px; gap: 4px; align-items: center;
          position: absolute; top: -15px; z-index: 10;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        .msg-row-inner:hover .msg-options, .msg-options.active { display: flex; }
        .msg-row.me .msg-options { right: 0; }
        .msg-row.them .msg-options { left: 40px; }
        .msg-option-btn { background: transparent; border: none; color: white; cursor: pointer; padding: 4px 8px; border-radius: 12px; font-size: 16px; transition: background 0.2s; }
        .msg-option-btn:hover { background: rgba(255,255,255,0.1); }

        .msg-reactions-bar { display: flex; gap: 4px; margin-top: -8px; z-index: 2; position: relative; }
        .msg-row.me .msg-reactions-bar { justify-content: flex-end; right: 10px; }
        .msg-row.them .msg-reactions-bar { justify-content: flex-start; left: 10px; }
        .msg-reaction-pill {
          background: rgba(30,41,59,0.95); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 2px 6px; font-size: 12px;
          cursor: pointer; display: flex; align-items: center; gap: 4px; color: #fff;
        }
        .msg-reaction-pill.reacted { background: rgba(6,182,212,0.2); border-color: rgba(6,182,212,0.5); }

        .reply-preview-bar {
          background: rgba(15,23,42,0.95); border-left: 3px solid #06b6d4;
          padding: 8px 12px; display: flex; justify-content: space-between;
          align-items: center; border-radius: 8px 8px 0 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-right: 1px solid rgba(255,255,255,0.05);
          margin-bottom: -1px; z-index: 10;
        }
        .reply-preview-content { font-size: 13px; color: rgba(255,255,255,0.7); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90%; }
        .reply-preview-close { background: none; border: none; color: rgba(255,255,255,0.5); cursor: pointer; font-size: 16px; }

        .replied-msg-box {
          background: rgba(0,0,0,0.25); border-left: 3px solid rgba(255,255,255,0.5);
          padding: 4px 8px; border-radius: 4px; font-size: 13px; margin-bottom: 6px;
          cursor: pointer; color: rgba(255,255,255,0.9);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          transition: background 0.2s;
        }
        .replied-msg-box:hover { background: rgba(0,0,0,0.4); }

        .typing-indicator { padding: 6px 20px; font-size: 12px; color: #06b6d4; font-style: italic; flex-shrink: 0; }

        .chatting-input-bar {
          padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0; background: #111827; position: relative;
        }
        .chatting-input-wrap {
          flex: 1; display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px; padding: 8px 12px; transition: border-color 0.2s;
        }
        .chatting-input-wrap:focus-within { border-color: rgba(6,182,212,0.35); }
        .chatting-input {
          flex: 1; background: transparent; border: none; outline: none;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #e2e8f0; resize: none; max-height: 100px; line-height: 1.5;
        }
        .chatting-input::placeholder { color: rgba(255,255,255,0.2); }
        .chatting-input-icon { font-size: 17px; color: rgba(255,255,255,0.25); cursor: pointer; transition: color 0.15s; flex-shrink: 0; }
        .chatting-input-icon:hover { color: rgba(255,255,255,0.6); }

        .send-btn {
          width: 42px; height: 42px; border-radius: 12px;
          background: linear-gradient(135deg, #0891b2, #2563eb);
          border: none; color: #fff; font-size: 17px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s; flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(8,145,178,0.35);
        }
        .send-btn:hover { opacity: 0.9; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }

        .emoji-picker-container { position: absolute; bottom: 70px; right: 20px; z-index: 100; }

        .image-preview-container {
          position: absolute; bottom: 70px; left: 20px;
          background: rgba(15,23,42,0.95); padding: 8px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          display: flex; align-items: center; gap: 12px; z-index: 90;
        }
        .image-preview { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
        .file-preview-text { font-size: 13px; color: #fff; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .image-preview-close {
          background: rgba(255,255,255,0.1); border: none; color: white;
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
      `}</style>

      <div className="chatting-root">
        {/* Header */}
        <div className="chatting-header">
          <div
            className="chatting-avatar-wrap"
            onClick={onOpenProfile}
            style={{ cursor: "pointer" }}
          >
            <img
              className="chatting-avatar"
              src={conversation.avatar}
              alt={conversation.name}
            />
            {conversation.online && <div className="chatting-online" />}
          </div>
          <div
            className="chatting-info"
            onClick={onOpenProfile}
            style={{ cursor: "pointer" }}
          >
            <div className="chatting-name">{conversation.name}</div>
            {typingUsers.length > 0 ? (
              <div className="chatting-typing">typing...</div>
            ) : (
              <div className={`chatting-status ${!conversation.online ? "offline" : ""}`}>
                {conversation.online
                  ? "Active now"
                  : conversation.lastSeen
                    ? `Active ${formatLastSeen(conversation.lastSeen)}`
                    : "Offline"}
              </div>
            )}
          </div>
          <div className="chatting-actions">
            <button className="chatting-action-btn">
              <FiPhone />
            </button>
            <button className="chatting-action-btn">
              <FiVideo />
            </button>
            <button className="chatting-action-btn" onClick={onOpenProfile}>
              <FiMoreVertical />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatting-messages">
          {displayMessages.map((msg) => {
            const reactionCounts = {};
            const myReaction = msg.reactions?.[currentUser?._id] || null;

            Object.values(msg.reactions || {}).forEach((emoji) => {
              reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
            });
            const reactionEntries = Object.entries(reactionCounts);

            return (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`msg-row ${msg.from}`}
              >
                {msg.from === "them" && (
                  <img className="msg-avatar" src={conversation.avatar} alt="" />
                )}
                <div className="msg-content">
                  <div
                    className="msg-row-inner"
                    onMouseLeave={() => setActiveMessageId(null)}
                  >
                    <div
                      className="msg-bubble"
                      onClick={() =>
                        setActiveMessageId(
                          activeMessageId === msg.id ? null : msg.id,
                        )
                      }
                    >
                      {msg.isDeleted ? (
                        <span className="msg-deleted">Message deleted</span>
                      ) : (
                        <>
                          {msg.replyTo && (
                            <div
                              className="replied-msg-box"
                              onClick={(e) => {
                                e.stopPropagation();
                                document
                                  .getElementById(
                                    `msg-${msg.replyTo._id || msg.replyTo}`,
                                  )
                                  ?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                  });
                              }}
                            >
                              <strong>
                                {msg.replyTo.senderId?.name ||
                                  (msg.from === "me"
                                    ? conversation.name
                                    : "You")}
                              </strong>
                              <br />
                              {msg.replyTo.type === "image"
                                ? "📷 Image"
                                : msg.replyTo.content}
                            </div>
                          )}
                          {msg.type === "image" && msg.fileUrl && (
                            <img
                              src={msg.fileUrl}
                              alt="attachment"
                              className="msg-image"
                            />
                          )}
                          {msg.type === "video" && msg.fileUrl && (
                            <video
                              src={msg.fileUrl}
                              controls
                              className="msg-video"
                            />
                          )}
                          {msg.type === "file" && msg.fileUrl && (
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="msg-file"
                            >
                              <FiPaperclip size={24} />
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  overflow: "hidden",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 600,
                                    fontSize: "13px",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                  }}
                                >
                                  {msg.fileName || "Document.pdf"}
                                </span>
                                <span style={{ fontSize: "11px", opacity: 0.7 }}>
                                  Click to view
                                </span>
                              </div>
                            </a>
                          )}
                          {msg.text && <span>{msg.text}</span>}
                        </>
                      )}
                    </div>

                    {!msg.isDeleted && (
                      <div
                        className={`msg-options ${activeMessageId === msg.id ? "active" : ""}`}
                      >
                        {reactionEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            className="msg-option-btn"
                            onClick={() => handleReact(msg.id, emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                        <button
                          className="msg-option-btn"
                          onClick={() => {
                            setReplyingTo(msg);
                            setActiveMessageId(null);
                          }}
                        >
                          <FiCornerUpLeft />
                        </button>
                      </div>
                    )}
                  </div>

                  {reactionEntries.length > 0 && (
                    <div className="msg-reactions-bar">
                      {reactionEntries.map(([emoji, count]) => (
                        <div
                          key={emoji}
                          className={`msg-reaction-pill ${myReaction === emoji ? "reacted" : ""}`}
                          onClick={() => handleReact(msg.id, emoji)}
                        >
                          {emoji} {count > 1 && count}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="msg-meta">
                    {msg.time}
                    {msg.from === "me" && (
                      <span className="msg-status-icon">
                        {msg.status === "sent" && <IoCheckmark />}
                        {msg.status === "delivered" && <IoCheckmarkDone />}
                        {msg.status === "seen" && (
                          <IoCheckmarkDone className="msg-seen" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Reply Preview */}
        {replyingTo && (
          <div className="reply-preview-bar">
            <div className="reply-preview-content">
              <strong>
                Replying to{" "}
                {replyingTo.from === "me" ? "You" : conversation.name}:
              </strong>{" "}
              {replyingTo.type === "image" ? "📷 Image" : replyingTo.text}
            </div>
            <button
              className="reply-preview-close"
              onClick={() => setReplyingTo(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Input */}
        <div className="chatting-input-bar">
          {showEmojiPicker && (
            <div className="emoji-picker-container" ref={emojiPickerRef}>
              <EmojiPicker
                theme="dark"
                onEmojiClick={(emojiData) =>
                  setInput((prev) => prev + emojiData.emoji)
                }
              />
            </div>
          )}

          {filePreview && (
            <div className="image-preview-container">
              {fileType === "image" && (
                <img src={filePreview} alt="Preview" className="image-preview" />
              )}
              {fileType === "video" && (
                <video src={filePreview} className="image-preview" muted />
              )}
              {fileType === "file" && (
                <div className="file-preview-text">
                  📄 {selectedFile?.name}
                </div>
              )}
              <button
                className="image-preview-close"
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreview(null);
                  setFileType(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div className="chatting-input-wrap">
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*, application/pdf, video/*"
              onChange={handleFileSelect}
            />
            <FiPaperclip
              className="chatting-input-icon"
              onClick={() => fileInputRef.current?.click()}
            />
            <textarea
              className="chatting-input"
              placeholder="Type a message..."
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <FiSmile
              ref={emojiButtonRef}
              className="chatting-input-icon"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
          </div>
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() && !selectedFile}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChattingPage;
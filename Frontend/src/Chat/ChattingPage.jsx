import React, { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiSmile,
  FiPaperclip,
  FiPhone,
  FiVideo,
  FiMoreVertical,
} from "react-icons/fi";
import { IoCheckmarkDone } from "react-icons/io5";

const DUMMY_MESSAGES = [
  {
    id: 1,
    from: "them",
    text: "ki re? ki korcho?",
    time: "10:00 AM",
    seen: true,
  },
  {
    id: 2,
    from: "me",
    text: "kicu na bhai, code korchi 😅",
    time: "10:01 AM",
    seen: true,
  },
  { id: 3, from: "them", text: "ki project?", time: "10:01 AM", seen: true },
  {
    id: 4,
    from: "me",
    text: "MERN stack social media app",
    time: "10:02 AM",
    seen: true,
  },
  {
    id: 5,
    from: "them",
    text: "wah! kemon cholche?",
    time: "10:03 AM",
    seen: true,
  },
  {
    id: 6,
    from: "me",
    text: "bhalo, almost done. chat feature banachhi ekhon 🔥",
    time: "10:04 AM",
    seen: true,
  },
  {
    id: 7,
    from: "them",
    text: "nice nice! socket.io use korcho?",
    time: "10:05 AM",
    seen: false,
  },
  { id: 8, from: "me", text: "haa, plan ache", time: "10:05 AM", seen: false },
];

function ChattingPage({ chat }) {
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  // auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: "me",
        text: input.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        seen: false,
      },
    ]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat) return null;

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

        /* ── Header ── */
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
        .chatting-name {
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .chatting-status {
          font-size: 12px;
          color: #22c55e;
          font-weight: 500;
        }

        .chatting-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .chatting-action-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          border: none;
          background: transparent;
        }
        .chatting-action-btn:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.8);
        }

        /* ── Messages ── */
        .chatting-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 20px 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.06) transparent;
        }
        .chatting-messages::-webkit-scrollbar { width: 4px; }
        .chatting-messages::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
        }

        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        .msg-row.me { flex-direction: row-reverse; }

        .msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          margin-bottom: 2px;
        }
        .msg-row.me .msg-avatar { display: none; }

        .msg-bubble {
          max-width: 62%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
        }
        .msg-row.them .msg-bubble {
          background: rgba(255,255,255,0.07);
          color: #e2e8f0;
          border-bottom-left-radius: 4px;
        }
        .msg-row.me .msg-bubble {
          background: linear-gradient(135deg, #0891b2, #2563eb);
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .msg-meta {
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 3px;
          font-size: 10px;
          color: rgba(255,255,255,0.25);
        }
        .msg-row.me .msg-meta { justify-content: flex-end; }
        .msg-seen { color: #06b6d4; font-size: 14px; }

        /* ── Input ── */
        .chatting-input-bar {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          background: #111827;
        }

        .chatting-input-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 8px 12px;
          transition: border-color 0.2s;
        }
        .chatting-input-wrap:focus-within {
          border-color: rgba(6,182,212,0.35);
        }

        .chatting-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #e2e8f0;
          resize: none;
          max-height: 100px;
          line-height: 1.5;
        }
        .chatting-input::placeholder { color: rgba(255,255,255,0.2); }

        .chatting-input-icon {
          font-size: 17px;
          color: rgba(255,255,255,0.25);
          cursor: pointer;
          transition: color 0.15s;
          flex-shrink: 0;
        }
        .chatting-input-icon:hover { color: rgba(255,255,255,0.6); }

        .send-btn {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0891b2, #2563eb);
          border: none;
          color: #fff;
          font-size: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(8,145,178,0.35);
        }
        .send-btn:hover { opacity: 0.9; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="chatting-root">
        {/* Header */}
        <div className="chatting-header">
          <div className="chatting-avatar-wrap">
            <img
              className="chatting-avatar"
              src={chat.avatar}
              alt={chat.name}
            />
            {chat.online && <div className="chatting-online" />}
          </div>
          <div className="chatting-info">
            <div className="chatting-name">{chat.name}</div>
            <div className="chatting-status">
              {chat.online ? "Active now" : "Offline"}
            </div>
          </div>
          <div className="chatting-actions">
            <button className="chatting-action-btn">
              <FiPhone />
            </button>
            <button className="chatting-action-btn">
              <FiVideo />
            </button>
            <button className="chatting-action-btn">
              <FiMoreVertical />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatting-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`msg-row ${msg.from}`}>
              {msg.from === "them" && (
                <img className="msg-avatar" src={chat.avatar} alt="" />
              )}
              <div>
                <div className="msg-bubble">{msg.text}</div>
                <div className="msg-meta">
                  {msg.time}
                  {msg.from === "me" && (
                    <IoCheckmarkDone className={msg.seen ? "msg-seen" : ""} />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chatting-input-bar">
          <div className="chatting-input-wrap">
            <FiPaperclip className="chatting-input-icon" />
            <textarea
              className="chatting-input"
              placeholder="Type a message..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <FiSmile className="chatting-input-icon" />
          </div>
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </>
  );
}

export default ChattingPage;

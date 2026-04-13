import React, { useState } from "react";
import ChatLeftBar from "../Chat/ChatLeftBar";
import ChattingPage from "../Chat/ChattingPage";
import ChatRightbar from "../Chat/ChatRightbar";
import Navbar from "../home/Navbar";

function ChatMainPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showRightbar, setShowRightbar] = useState(false);

  const handleSelectChat = (conv) => {
    setSelectedChat(conv);
    setShowRightbar(false); // নতুন chat select করলে rightbar বন্ধ
  };

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

        /* কেউ select না করলে empty state */
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
          {/* Left — conversation list */}
          <ChatLeftBar
            onSelectChat={handleSelectChat}
            selectedId={selectedChat?.id}
          />

          {/* Center — chat window অথবা empty state */}
          {selectedChat ? (
            <ChattingPage chat={selectedChat} />
          ) : (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">💬</div>
              <div className="chat-empty-text">Select a conversation</div>
              <div className="chat-empty-sub">
                Choose from your messages on the left
              </div>
            </div>
          )}

          {/* Right — user info (chat select করলে দেখাবে) */}
          {selectedChat && <ChatRightbar chat={selectedChat} />}
        </div>
      </div>
    </>
  );
}

export default ChatMainPage;

import React from "react";
import { FiUser, FiImage, FiLink, FiBell, FiBellOff } from "react-icons/fi";
import { MdBlock } from "react-icons/md";

// dummy shared media
const SHARED_MEDIA = [
  "https://picsum.photos/seed/a1/100/100",
  "https://picsum.photos/seed/b2/100/100",
  "https://picsum.photos/seed/c3/100/100",
  "https://picsum.photos/seed/d4/100/100",
  "https://picsum.photos/seed/e5/100/100",
  "https://picsum.photos/seed/f6/100/100",
];

function ChatRightbar({ chat }) {
  // chat না থাকলে কিছু দেখাবে না
  if (!chat) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .chat-rightbar {
          font-family: 'DM Sans', sans-serif;
          width: 270px;
          height: 100%;
          background: #111827;
          border-left: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.06) transparent;
          animation: slideIn 0.2s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .chat-rightbar::-webkit-scrollbar { width: 4px; }
        .chat-rightbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
        }

        /* Profile section */
        .crb-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          gap: 8px;
        }

        .crb-avatar-wrap { position: relative; }
        .crb-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(6,182,212,0.35);
        }
        .crb-online-dot {
          position: absolute;
          bottom: 3px;
          right: 3px;
          width: 13px;
          height: 13px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #111827;
          box-shadow: 0 0 6px rgba(34,197,94,0.6);
        }

        .crb-name {
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
          text-align: center;
        }
        .crb-status {
          font-size: 12px;
          color: #22c55e;
          font-weight: 500;
        }

        /* Quick actions */
        .crb-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .crb-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 10px 14px;
          cursor: pointer;
          transition: background 0.15s;
          color: rgba(255,255,255,0.5);
          font-size: 18px;
        }
        .crb-action-btn:hover {
          background: rgba(6,182,212,0.1);
          color: #06b6d4;
          border-color: rgba(6,182,212,0.2);
        }
        .crb-action-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        /* Section */
        .crb-section {
          padding: 16px 16px 8px;
        }
        .crb-section-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 10px;
        }
        .crb-section-title svg { font-size: 13px; }

        /* Shared media grid */
        .crb-media-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }
        .crb-media-img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .crb-media-img:hover { opacity: 0.8; }

        /* Options */
        .crb-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 2px;
        }
        .crb-option:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .crb-option.danger { color: #f87171; }
        .crb-option.danger:hover { background: rgba(239,68,68,0.08); }
        .crb-option-icon { font-size: 16px; flex-shrink: 0; }
      `}</style>

      <div className="chat-rightbar">
        {/* Profile */}
        <div className="crb-profile">
          <div className="crb-avatar-wrap">
            <img className="crb-avatar" src={chat.avatar} alt={chat.name} />
            {chat.online && <div className="crb-online-dot" />}
          </div>
          <div className="crb-name">{chat.name}</div>
          <div className="crb-status">
            {chat.online ? "Active now" : "Offline"}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="crb-actions">
          <div className="crb-action-btn">
            <FiUser />
            <span className="crb-action-label">Profile</span>
          </div>
          <div className="crb-action-btn">
            <FiBell />
            <span className="crb-action-label">Mute</span>
          </div>
          <div className="crb-action-btn">
            <FiLink />
            <span className="crb-action-label">Share</span>
          </div>
        </div>

        {/* Shared Media */}
        <div className="crb-section">
          <div className="crb-section-title">
            <FiImage /> Shared Media
          </div>
          <div className="crb-media-grid">
            {SHARED_MEDIA.map((src, i) => (
              <img key={i} className="crb-media-img" src={src} alt="" />
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="crb-section">
          <div className="crb-section-title">Options</div>
          <div className="crb-option">
            <FiBellOff className="crb-option-icon" />
            Mute Notifications
          </div>
          <div className="crb-option danger">
            <MdBlock className="crb-option-icon" />
            Block User
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatRightbar;

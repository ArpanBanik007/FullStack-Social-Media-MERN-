import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FiUser, FiImage, FiLink, FiBell, FiBellOff } from "react-icons/fi";
import { MdBlock } from "react-icons/md";
import { selectCurrentUser } from "../slices/mydetails.slice";

function ChatRightbar({ conversation, onClose }) {
  const { onlineUsers, messages } = useSelector((state) => state.chat);
  const currentUser = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  if (!conversation) return null;

  const other = conversation._other || { _id: conversation.receiverId };
  const isOnline = onlineUsers.includes(String(other?._id));

  // Shared images — current conversation থেকে
  const sharedImages = messages
    .filter((m) => m.type === "image" && m.fileUrl && !m.isDeleted)
    .slice(-6)
    .map((m) => m.fileUrl);

  // তোমার existing ChatRightbar styles হুবহু রাখো
  return (
    <>
      <style>{`
        .chat-rightbar { font-family: 'Inter', sans-serif; width: 270px; height: 100%; background: var(--pluto-bg-navbar); border-left: 1px solid var(--pluto-border); display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--pluto-border) transparent; animation: slideIn 0.2s ease; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        .chat-rightbar::-webkit-scrollbar { width: 4px; }
        .chat-rightbar::-webkit-scrollbar-thumb { background: var(--pluto-border); border-radius: 4px; }
        .crb-profile { display: flex; flex-direction: column; align-items: center; padding: 28px 20px 20px; border-bottom: 1px solid var(--pluto-border); gap: 8px; }
        .crb-avatar-wrap { position: relative; }
        .crb-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(34, 211, 238, 0.35); }
        .crb-online-dot { position: absolute; bottom: 3px; right: 3px; width: 13px; height: 13px; background: var(--pluto-online); border-radius: 50%; border: 2px solid var(--pluto-bg-navbar); box-shadow: 0 0 6px rgba(34,197,94,0.5); }
        .crb-name { font-size: 16px; font-weight: 700; color: var(--pluto-text-primary); text-align: center; }
        .crb-status { font-size: 12px; color: var(--pluto-online); font-weight: 500; }
        .crb-status.offline { color: var(--pluto-text-hint); }
        .crb-actions { display: flex; justify-content: center; gap: 10px; padding: 16px 20px; border-bottom: 1px solid var(--pluto-border); }
        .crb-action-btn { display: flex; flex-direction: column; align-items: center; gap: 5px; background: var(--pluto-bg-input); border: 1px solid var(--pluto-border); border-radius: 12px; padding: 10px 14px; cursor: pointer; transition: background 0.15s; color: var(--pluto-text-hint); font-size: 18px; }
        .crb-action-btn:hover { background: var(--pluto-accent-bg); color: var(--pluto-accent); border-color: rgba(34, 211, 238, 0.2); }
        .crb-action-label { font-size: 10px; font-weight: 600; letter-spacing: 0.04em; }
        .crb-section { padding: 16px 16px 8px; }
        .crb-section-title { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--pluto-text-hint); margin-bottom: 10px; }
        .crb-media-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
        .crb-media-img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; cursor: pointer; transition: opacity 0.15s; }
        .crb-media-img:hover { opacity: 0.8; }
        .crb-no-media { font-size: 12px; color: var(--pluto-text-hint); text-align: center; padding: 12px 0; }
        .crb-option { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 10px; cursor: pointer; transition: background 0.15s; color: var(--pluto-text-secondary); font-size: 13px; font-weight: 500; margin-bottom: 2px; }
        .crb-option:hover { background: var(--pluto-bg-hover); color: var(--pluto-text-primary); }
        .crb-option.danger { color: #f87171; }
        .crb-option.danger:hover { background: rgba(239,68,68,0.08); }
        .crb-option-icon { font-size: 16px; flex-shrink: 0; }
      `}</style>

      <div className="chat-rightbar">
        <div className="crb-profile">
          <div 
            style={{ alignSelf: 'flex-end', cursor: 'pointer', fontSize: '18px', color: 'rgba(255,255,255,0.4)', padding: '0 4px' }} 
            onClick={onClose}
          >
            ✕
          </div>
          <div className="crb-avatar-wrap">
            <img
              className="crb-avatar"
              src={other?.avatar || "/default-avatar.png"}
              alt={other?.name}
            />
            {isOnline && <div className="crb-online-dot" />}
          </div>
          <div className="crb-name">{other?.name || conversation.name}</div>
          <div className={`crb-status ${!isOnline ? "offline" : ""}`}>
            {isOnline ? "Active now" : "Offline"}
          </div>
        </div>

        <div className="crb-actions">
          <div className="crb-action-btn" onClick={() => navigate(`/profile/${other?._id}`)}>
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

        <div className="crb-section">
          <div className="crb-section-title">
            <FiImage /> Shared Media
          </div>
          {sharedImages.length > 0 ? (
            <div className="crb-media-grid">
              {sharedImages.map((src, i) => (
                <img key={i} className="crb-media-img" src={src} alt="" />
              ))}
            </div>
          ) : (
            <div className="crb-no-media">No shared media yet</div>
          )}
        </div>

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

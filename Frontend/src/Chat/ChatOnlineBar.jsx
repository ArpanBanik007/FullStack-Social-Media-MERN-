import React from "react";
import { useSelector } from "react-redux";

function ChatOnlineBar() {
  const { onlineUsers } = useSelector((state) => state.chat);
  const currentUser = useSelector((state) => state.mydetails?.user);

  // Filter out current user from the socket's online users list
  const unique = onlineUsers.filter(
    (user) => String(user._id || user) !== String(currentUser?._id)
  );

  if (unique.length === 0) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .online-bar { font-family: 'DM Sans', sans-serif; width: 100%; padding: 14px 0 10px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .online-bar-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.25); padding: 0 16px 10px; }
        .online-scroll { display: flex; gap: 16px; overflow-x: auto; padding: 0 16px 4px; scrollbar-width: none; }
        .online-scroll::-webkit-scrollbar { display: none; }
        .online-user { display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; flex-shrink: 0; }
        .online-avatar-ring { width: 52px; height: 52px; border-radius: 50%; padding: 2px; background: linear-gradient(135deg, #06b6d4, #818cf8); transition: transform 0.2s ease; }
        .online-user:hover .online-avatar-ring { transform: scale(1.08); }
        .online-avatar-inner { width: 100%; height: 100%; border-radius: 50%; border: 2px solid #111827; overflow: hidden; position: relative; }
        .online-avatar-inner img { width: 100%; height: 100%; object-fit: cover; }
        .online-dot { position: absolute; bottom: 2px; right: 2px; width: 10px; height: 10px; background: #22c55e; border-radius: 50%; border: 2px solid #111827; box-shadow: 0 0 6px rgba(34,197,94,0.7); }
        .online-name { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.5); white-space: nowrap; max-width: 52px; overflow: hidden; text-overflow: ellipsis; }
      `}</style>

      <div className="online-bar">
        <div className="online-bar-label">Active Now</div>
        <div className="online-scroll">
          {unique.map((user) => (
            <div key={user._id || user} className="online-user">
              <div className="online-avatar-ring">
                <div className="online-avatar-inner">
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt={user.fullName || user.name || user.username || "User"}
                  />
                  <div className="online-dot" />
                </div>
              </div>
              <span className="online-name">
                {(user.fullName || user.name || user.username || "User").split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ChatOnlineBar;

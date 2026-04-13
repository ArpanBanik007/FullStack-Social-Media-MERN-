import React from "react";

const ONLINE_USERS = [
  {
    id: 1,
    name: "Arpan",
    avatar: "https://i.pravatar.cc/150?img=1",
    hasStory: true,
  },
  {
    id: 2,
    name: "Soma",
    avatar: "https://i.pravatar.cc/150?img=5",
    hasStory: false,
  },
  {
    id: 3,
    name: "Riya",
    avatar: "https://i.pravatar.cc/150?img=9",
    hasStory: true,
  },
  {
    id: 4,
    name: "Aditya",
    avatar: "https://i.pravatar.cc/150?img=12",
    hasStory: false,
  },
  {
    id: 5,
    name: "Sangita",
    avatar: "https://i.pravatar.cc/150?img=16",
    hasStory: true,
  },
  {
    id: 6,
    name: "Ankit",
    avatar: "https://i.pravatar.cc/150?img=20",
    hasStory: false,
  },
  {
    id: 7,
    name: "Abhinaba",
    avatar: "https://i.pravatar.cc/150?img=25",
    hasStory: true,
  },
  {
    id: 8,
    name: "Priya",
    avatar: "https://i.pravatar.cc/150?img=29",
    hasStory: false,
  },
  {
    id: 9,
    name: "Rahul",
    avatar: "https://i.pravatar.cc/150?img=33",
    hasStory: true,
  },
  {
    id: 10,
    name: "Diya",
    avatar: "https://i.pravatar.cc/150?img=44",
    hasStory: false,
  },
];

function ChatOnlineBar() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .online-bar {
          font-family: 'DM Sans', sans-serif;
          width: 100%;
          padding: 14px 0 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        .online-bar-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          padding: 0 16px 10px;
        }

        .online-scroll {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding: 0 16px 4px;
          scrollbar-width: none;
        }
        .online-scroll::-webkit-scrollbar { display: none; }

        .online-user {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .online-avatar-ring {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          padding: 2px;
          background: linear-gradient(135deg, #06b6d4, #818cf8);
          transition: transform 0.2s ease;
        }
        .online-avatar-ring.no-story {
          background: rgba(255,255,255,0.08);
        }
        .online-user:hover .online-avatar-ring {
          transform: scale(1.08);
        }

        .online-avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid #111827;
          overflow: hidden;
          position: relative;
        }

        .online-avatar-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .online-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #111827;
          box-shadow: 0 0 6px rgba(34,197,94,0.7);
        }

        .online-name {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.5);
          white-space: nowrap;
          max-width: 52px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      <div className="online-bar">
        <div className="online-bar-label">Active Now</div>
        <div className="online-scroll">
          {ONLINE_USERS.map((user) => (
            <div key={user.id} className="online-user">
              <div
                className={`online-avatar-ring ${!user.hasStory ? "no-story" : ""}`}
              >
                <div className="online-avatar-inner">
                  <img src={user.avatar} alt={user.name} />
                  <div className="online-dot" />
                </div>
              </div>
              <span className="online-name">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default ChatOnlineBar;

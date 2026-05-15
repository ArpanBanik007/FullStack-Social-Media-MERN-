import API from "../utils/API.js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function RightBar() {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await API.get("/users/my-followers", { withCredentials: true });
        const data = res.data?.data;
        setFollowers(Array.isArray(data) ? data : data?.followers || []);
      } catch (err) {
        console.error("Failed to fetch followers:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();
  }, []);

  return (
    <>
      <style>{`
        .rightbar-root {
          position: fixed;
          top: 90px;
          right: 40px;
          width: 260px;
          height: calc(100vh - 130px);
          display: flex;
          flex-direction: column;
          background: rgba(17, 28, 46, 0.4);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 24px 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          z-index: 100;
        }

        @media (max-width: 1200px) {
          .rightbar-root { right: 20px; width: 240px; }
        }

        @media (max-width: 1024px) {
          .rightbar-root { display: none; }
        }

        .rightbar-header {
          padding: 0 8px 20px;
          border-bottom: 1px solid var(--glass-border);
        }

        .rightbar-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-secondary);
          opacity: 0.6;
        }

        .rightbar-count {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin-top: 4px;
        }

        .rightbar-list {
          flex: 1;
          overflow-y: auto;
          margin-top: 20px;
          padding-right: 4px;
        }
        .rightbar-list::-webkit-scrollbar { width: 4px; }
        .rightbar-list::-webkit-scrollbar-thumb { background: var(--glass-border); border-radius: 10px; }

        .follower-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          margin-bottom: 8px;
        }

        .follower-card:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--glass-border);
          transform: scale(1.02);
        }

        .avatar-container {
          position: relative;
          flex-shrink: 0;
        }

        .follower-avatar {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          object-fit: cover;
          border: 2px solid var(--glass-border);
        }

        .online-ring {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #00E676;
          border-radius: 50%;
          border: 2px solid var(--bg-deep);
          box-shadow: 0 0 10px rgba(0, 230, 118, 0.5);
        }

        .follower-info {
          min-width: 0;
        }

        .follower-username {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .follower-name {
          font-size: 12px;
          color: var(--text-secondary);
          opacity: 0.6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .see-all-btn {
          width: 100%;
          padding: 14px;
          border-radius: 16px;
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid rgba(0, 217, 255, 0.1);
          color: var(--accent-primary);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 16px;
        }

        .see-all-btn:hover {
          background: rgba(0, 217, 255, 0.1);
          border-color: rgba(0, 217, 255, 0.3);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.1);
        }

        /* Skeleton */
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
        .skeleton { background: var(--surface-elevated); animation: pulse 1.5s infinite ease-in-out; border-radius: 10px; }
      `}</style>

      <div className="rightbar-root">
        <div className="rightbar-header">
          <div className="rightbar-title">Synchronized</div>
          <div className="rightbar-count">
            {loading ? "..." : `${followers.length} Contacts`}
          </div>
        </div>

        <div className="rightbar-list">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="follower-card">
                <div className="skeleton" style={{ width: 40, height: 40 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 10, width: "40%" }} />
                </div>
              </div>
            ))
          ) : followers.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-secondary)", opacity: 0.5 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🌌</div>
              <div style={{ fontSize: 13 }}>No cosmic connections yet</div>
            </div>
          ) : (
            followers.map((user, idx) => (
              <div
                key={user._id}
                className="follower-card"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <div className="avatar-container">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=16243A&color=00D9FF`}
                    alt={user.username}
                    className="follower-avatar"
                  />
                  {idx % 3 === 0 && <div className="online-ring" />}
                </div>
                <div className="follower-info">
                  <div className="follower-username">{user.username}</div>
                  <div className="follower-name">{user.fullName || "Stardust"}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="see-all-btn" onClick={() => navigate("/profile")}>
          VIEW ALL NETWORK
        </button>
      </div>
    </>
  );
}

export default RightBar;

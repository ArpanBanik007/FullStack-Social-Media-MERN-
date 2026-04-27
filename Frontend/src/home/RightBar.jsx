import API from "../utils/API.js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function RightBar() {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Followers fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await API.get(
          "/users/my-followers",
          {
            withCredentials: true,
          },
        );

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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .rightbar-root {
          font-family: 'Syne', sans-serif;
          position: fixed;
          top: 72px;
          right: 10px;
          width: 230px;
          height: calc(100vh - 84px);
          background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.45);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .rightbar-header {
          padding: 16px 16px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }

        .rightbar-title {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
        }

        .rightbar-count {
          font-size: 20px;
          font-weight: 800;
          color: rgba(255,255,255,0.85);
          margin-top: 2px;
        }

        .rightbar-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px 10px 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }
        .rightbar-list::-webkit-scrollbar { width: 4px; }
        .rightbar-list::-webkit-scrollbar-track { background: transparent; }
        .rightbar-list::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
        }

        /* ── Skeleton ── */
        .skeleton-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          margin-bottom: 3px;
        }
        .skeleton-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          flex-shrink: 0;
          animation: shimmer 1.4s infinite;
        }
        .skeleton-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .skeleton-line {
          height: 10px;
          border-radius: 6px;
          background: rgba(255,255,255,0.07);
          animation: shimmer 1.4s infinite;
        }
        .skeleton-line.short { width: 60%; }
        @keyframes shimmer {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }

        /* ── Follower Card ── */
        .follower-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 14px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          margin-bottom: 3px;
        }
        .follower-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.07);
          transform: translateX(-2px);
        }

        .follower-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .follower-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(6,182,212,0.2);
          transition: border-color 0.2s;
        }
        .follower-card:hover .follower-avatar { border-color: rgba(6,182,212,0.5); }

        .follower-online {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 9px;
          height: 9px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid #0f172a;
          box-shadow: 0 0 5px rgba(34,197,94,0.6);
        }

        .follower-info { flex: 1; min-width: 0; }

        .follower-username {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
        }
        .follower-card:hover .follower-username { color: #06b6d4; }

        .follower-name {
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.28);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }

        /* ── Empty State ── */
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255,255,255,0.18);
          padding: 24px;
          text-align: center;
        }
        .empty-icon { font-size: 32px; }
        .empty-text { font-size: 12px; font-weight: 600; line-height: 1.5; }

        .rightbar-footer {
          padding: 12px 14px;
          border-top: 1px solid rgba(255,255,255,0.05);
          flex-shrink: 0;
        }

        .see-all-btn {
          width: 100%;
          padding: 9px;
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.4);
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .see-all-btn:hover {
          background: rgba(6,182,212,0.1);
          color: #06b6d4;
          border-color: rgba(6,182,212,0.2);
        }
      `}</style>

      <div className="rightbar-root">
        {/* ── Header ── */}
        <div className="rightbar-header">
          <div className="rightbar-title">Your Followers</div>
          <div className="rightbar-count">
            {loading ? "—" : `${followers.length} Followers`}
          </div>
        </div>

        {/* ── List ── */}
        {loading ? (
          // Skeleton
          <div className="rightbar-list">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-avatar" />
                <div className="skeleton-lines">
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : followers.length === 0 ? (
          // Empty state
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-text">No followers yet</div>
          </div>
        ) : (
          // Real data
          <div className="rightbar-list">
            {followers.map((user, idx) => (
              <div
                key={user._id}
                className="follower-card"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <div className="follower-avatar-wrap">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.username}&background=0f172a&color=06b6d4`
                    }
                    alt={user.username}
                    className="follower-avatar"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=0f172a&color=06b6d4`;
                    }}
                  />
                  {/* প্রতি ৩ জনে একজন online দেখাবে — পরে socket দিয়ে real করা যাবে */}
                  {idx % 3 === 0 && <div className="follower-online" />}
                </div>

                <div className="follower-info">
                  <div className="follower-username">@{user.username}</div>
                  <div className="follower-name">
                    {user.fullName || user.name || ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="rightbar-footer">
          <button className="see-all-btn" onClick={() => navigate("/profile")}>
            SEE ALL FOLLOWERS
          </button>
        </div>
      </div>
    </>
  );
}

export default RightBar;

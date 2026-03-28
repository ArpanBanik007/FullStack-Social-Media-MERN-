import React from "react";
import { useNavigate } from "react-router-dom";

const users = [
  {
    id: 1,
    name: "Arpan Banik",
    username: "arpan007",
    avatar:
      "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
  },
  {
    id: 2,
    name: "Soma Banik",
    username: "soma007",
    avatar:
      "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
  },
  {
    id: 3,
    name: "Abhinaba Banik",
    username: "abhinaba007",
    avatar:
      "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
  },
  {
    id: 4,
    name: "Ajit Banik",
    username: "ajit007",
    avatar:
      "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
  },
  {
    id: 5,
    name: "Ankit Mondal",
    username: "ankit007",
    avatar:
      "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
  },
  {
    id: 6,
    name: "Sangita Mondal",
    username: "sangita007",
    avatar:
      "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
  },
  {
    id: 7,
    name: "Aditya Shee",
    username: "adi007",
    avatar:
      "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
  },
  {
    id: 8,
    name: "Ankit Mondal",
    username: "ankit2007",
    avatar:
      "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
  },
  {
    id: 9,
    name: "Riya Das",
    username: "riya007",
    avatar:
      "https://img.etimg.com/thumb/width-1200,height-1200,imgsize-1392094,resizemode-75,msid-111883605/magazines/panache/spider-man-4-release-date-update-marvels-kevin-feige-shares-major-details-check-plot-cast-new-characters.jpg",
  },
];

function RightBar() {
  const navigate = useNavigate();

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
        .rightbar-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

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

        .follow-btn {
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.04em;
          padding: 4px 10px;
          border-radius: 8px;
          border: 1px solid rgba(6,182,212,0.3);
          background: rgba(6,182,212,0.08);
          color: #06b6d4;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .follow-btn:hover { background: rgba(6,182,212,0.2); color: #fff; }

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
        .see-all-btn:hover { background: rgba(6,182,212,0.1); color: #06b6d4; border-color: rgba(6,182,212,0.2); }
      `}</style>

      <div className="rightbar-root">
        <div className="rightbar-header">
          <div className="rightbar-title">People you may know</div>
          <div className="rightbar-count">{users.length} Followers</div>
        </div>

        <div className="rightbar-list">
          {users.map((user, idx) => (
            <div
              key={user.id}
              className="follower-card"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <div className="follower-avatar-wrap">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="follower-avatar"
                />
                {idx % 3 === 0 && <div className="follower-online" />}
              </div>
              <div className="follower-info">
                <div className="follower-username">@{user.username}</div>
                <div className="follower-name">{user.name}</div>
              </div>
              <button
                className="follow-btn"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Follow
              </button>
            </div>
          ))}
        </div>

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

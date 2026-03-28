import React, { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import { FaBookmark } from "react-icons/fa";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import { HiPencil } from "react-icons/hi2";
import AllPosts from "./AllPosts";
import AllVideos from "./AllVideos";
import AllSaved from "./AllSaved";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyPosts } from "../slices/postSlice";

/* ─────────────── FOLLOW MODAL ─────────────── */
function FollowModal({ type, userId, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const url =
          type === "followers"
            ? "http://localhost:8000/api/v1/users/my-followers"
            : "http://localhost:8000/api/v1/users/my-followings";
        const res = await axios.get(url, { withCredentials: true });
        const data =
          type === "followers"
            ? res.data?.data?.followers
            : res.data?.data?.followings;
        setList(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [type]);

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity:0; transform:translate(-50%,-52%) scale(0.95); }
          to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
        }
        @keyframes shimmer2 {
          0%  { background-position:-300px 0; }
          100%{ background-position:300px 0; }
        }
        .skel2 {
          background: linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%);
          background-size: 300px 100%;
          animation: shimmer2 1.3s infinite linear;
          border-radius: 8px;
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: "linear-gradient(160deg,#1e293b,#0f172a)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            width: "90%",
            maxWidth: 380,
            overflow: "hidden",
            animation: "modalIn 0.2s ease",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            fontFamily: "'Syne',sans-serif",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "rgba(255,255,255,0.9)",
                textTransform: "capitalize",
              }}
            >
              {type}
            </span>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <IoClose />
            </button>
          </div>

          {/* List */}
          <div
            style={{
              maxHeight: 340,
              overflowY: "auto",
              padding: "8px 10px 14px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.08) transparent",
            }}
          >
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 10px",
                    marginBottom: 4,
                  }}
                >
                  <div
                    className="skel2"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      className="skel2"
                      style={{ height: 12, width: "55%", marginBottom: 7 }}
                    />
                    <div
                      className="skel2"
                      style={{ height: 10, width: "35%" }}
                    />
                  </div>
                </div>
              ))
            ) : list.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "rgba(255,255,255,0.25)",
                  fontSize: 14,
                }}
              >
                No {type} yet
              </div>
            ) : (
              list.map((user) => (
                <div
                  key={user._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 10px",
                    borderRadius: 14,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={() => {
                    navigate(`/profile/${user._id}`);
                    onClose();
                  }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid rgba(6,182,212,0.25)",
                      }}
                      alt="avatar"
                    />
                  ) : (
                    <RiAccountCircleFill
                      style={{
                        fontSize: 40,
                        color: "rgba(255,255,255,0.3)",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      @{user.username}
                    </div>
                    {user.fullName && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.3)",
                          marginTop: 2,
                        }}
                      >
                        {user.fullName}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────── MAIN PROFILE ─────────────── */
export default function MyProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const dispatch = useDispatch();
  const { posts } = useSelector((state) => state.posts);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/users/current-user");
        setUser(res.data.data);
      } catch {
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (!posts || posts.length === 0) dispatch(fetchMyPosts());
  }, [dispatch]);

  const TABS = [
    { key: "posts", icon: <FaCamera />, label: "Posts" },
    { key: "videos", icon: <MdOndemandVideo />, label: "Videos" },
    { key: "saved", icon: <FaBookmark />, label: "Saved" },
  ];

  const renderContent = () => {
    if (activeTab === "posts") return <AllPosts />;
    if (activeTab === "videos") return <AllVideos />;
    if (activeTab === "saved") return <AllSaved />;
  };

  if (!user) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
          @keyframes shimmer3 { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          .skel3 { background:linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%); background-size:400px 100%; animation:shimmer3 1.3s infinite linear; border-radius:12px; }
        `}</style>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            maxWidth: 620,
            margin: "20px auto",
            padding: "0 12px",
          }}
        >
          <div
            className="skel3"
            style={{
              width: "100%",
              height: 220,
              borderRadius: 18,
              marginBottom: 16,
            }}
          />
          <div
            style={{
              background: "linear-gradient(160deg,#1e293b,#0f172a)",
              borderRadius: 18,
              padding: 20,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
              <div
                className="skel3"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="skel3"
                  style={{ height: 14, width: "45%", marginBottom: 10 }}
                />
                <div
                  className="skel3"
                  style={{ height: 11, width: "30%", marginBottom: 14 }}
                />
                <div style={{ display: "flex", gap: 12 }}>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="skel3"
                      style={{ height: 11, width: 60 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .profile-root {
          font-family: 'Syne', sans-serif;
          max-width: 640px;
          margin: 16px auto 40px;
          padding: 0 12px 0 12px;
        }

        /* Cover */
        .profile-cover {
          width: 100%;
          height: 200px;
          border-radius: 20px;
          overflow: hidden;
          background: #1e293b;
          position: relative;
        }
        @media(min-width:640px){ .profile-cover{ height:260px; } }

        .profile-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 60%);
        }

        /* Card */
        .profile-card {
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 20px;
          margin-top: 14px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.35);
        }

        .profile-top-row {
          display: flex;
          align-items: flex-end;
          gap: 18px;
        }

        .profile-avatar-wrap { position: relative; flex-shrink: 0; }
        .profile-avatar {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(6,182,212,0.5);
          box-shadow: 0 0 0 4px rgba(6,182,212,0.12);
          display: block;
        }
        @media(min-width:640px){ .profile-avatar { width:100px; height:100px; } }

        .profile-name {
          font-size: 20px;
          font-weight: 800;
          color: rgba(255,255,255,0.92);
          line-height: 1.1;
        }
        @media(min-width:640px){ .profile-name { font-size:24px; } }

        .profile-fullname {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          margin-top: 3px;
        }

        .profile-stats {
          display: flex;
          gap: 6px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .stat-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 18px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          min-width: 72px;
        }
        .stat-pill:hover { background: rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.25); }

        .stat-num {
          font-size: 18px;
          font-weight: 800;
          color: rgba(255,255,255,0.9);
          line-height: 1;
        }
        .stat-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          margin-top: 4px;
        }

        .profile-bio-section { margin-top: 16px; }
        .profile-bio-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          margin-bottom: 5px;
        }
        .profile-bio-text {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
          font-weight: 400;
        }

        .edit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: auto;
          padding: 8px 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.5);
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
          align-self: flex-start;
        }
        .edit-btn:hover { background: rgba(6,182,212,0.12); color: #06b6d4; border-color: rgba(6,182,212,0.25); }

        /* Tabs */
        .profile-tabs {
          display: flex;
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px;
          padding: 6px;
          margin-top: 14px;
          gap: 4px;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 0;
          border-radius: 13px;
          border: none;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          color: rgba(255,255,255,0.28);
          background: transparent;
        }
        .tab-btn svg { font-size: 16px; }
        .tab-btn.active {
          background: rgba(6,182,212,0.15);
          color: #06b6d4;
          border: 1px solid rgba(6,182,212,0.25);
        }
        .tab-btn:not(.active):hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); }

        /* Content */
        .profile-content {
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          margin-top: 12px;
          padding: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.25);
          color: rgba(255,255,255,0.8);
        }
      `}</style>

      <div className="profile-root">
        {modalType && (
          <FollowModal
            type={modalType}
            userId={user._id}
            onClose={() => setModalType(null)}
          />
        )}

        {/* Cover */}
        <div className="profile-cover">
          {user.coverImage ? (
            <img src={user.coverImage} alt="cover" />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg,#0f172a,#1e3a5f)",
              }}
            />
          )}
          <div className="cover-overlay" />
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-top-row">
            <div className="profile-avatar-wrap">
              <img src={user.avatar} alt="avatar" className="profile-avatar" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="profile-name">@{user.username}</div>
              <div className="profile-fullname">{user.fullName}</div>
            </div>
            <button className="edit-btn" onClick={() => navigate("/settings")}>
              <HiPencil /> Edit
            </button>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-pill" style={{ cursor: "default" }}>
              <span className="stat-num">{posts?.length || 0}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div
              className="stat-pill"
              onClick={() => setModalType("followers")}
            >
              <span className="stat-num">{user.followersCount || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div
              className="stat-pill"
              onClick={() => setModalType("followings")}
            >
              <span className="stat-num">{user.followingCount || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>

          {/* Bio */}
          <div className="profile-bio-section">
            <div className="profile-bio-label">Bio</div>
            <div className="profile-bio-text">
              {user.bio || "No bio available yet."}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {TABS.map(({ key, icon, label }) => (
            <button
              key={key}
              className={`tab-btn ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="profile-content">{renderContent()}</div>
      </div>
    </>
  );
}

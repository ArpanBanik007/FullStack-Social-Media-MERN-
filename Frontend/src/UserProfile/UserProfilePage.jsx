import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { RiAccountCircleFill } from "react-icons/ri";
import UserAllPost from "./UserAllPost";
import UserAllVideos from "./UserAllVideos";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import FollowButton from "../componants/FollowButton";
import { fetchMyFollowings } from "../slices/follow.slice";

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
            ? `http://localhost:8000/api/v1/users/${userId}/followers`
            : `http://localhost:8000/api/v1/users/${userId}/followings`;
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
  }, [type, userId]);

  return (
    <>
      <style>{`
        @keyframes modalInU { from{opacity:0;transform:translate(-50%,-52%) scale(0.95)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        @keyframes shimU { 0%{background-position:-300px 0} 100%{background-position:300px 0} }
        .skU { background:linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%); background-size:300px 100%; animation:shimU 1.3s infinite linear; border-radius:8px; }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          zIndex: 50,
          fontFamily: "'Syne',sans-serif",
        }}
        onClick={onClose}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background: "linear-gradient(160deg,#1e293b,#0f172a)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            width: "90%",
            maxWidth: 380,
            overflow: "hidden",
            animation: "modalInU 0.2s ease",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
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
                    padding: "10px",
                    marginBottom: 4,
                  }}
                >
                  <div
                    className="skU"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      className="skU"
                      style={{ height: 12, width: "50%", marginBottom: 7 }}
                    />
                    <div className="skU" style={{ height: 10, width: "32%" }} />
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
                    padding: "10px",
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

/* ─────────────── MAIN COMPONENT ─────────────── */
function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);

  const followings = useSelector((state) => state.follow.followings);
  const { mydetails } = useSelector((state) => state.mydetails);
  const isMyProfile = userId === mydetails?._id;
  const isFollowing = followings?.includes(userId);

  useEffect(() => {
    dispatch(fetchMyFollowings());
  }, [dispatch]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:8000/api/v1/users/user/${userId}`,
          { withCredentials: true },
        );
        setUser(res?.data?.data);
      } catch (err) {
        console.error("User fetch error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
          @keyframes shimUP { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          .skUP { background:linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%); background-size:400px 100%; animation:shimUP 1.3s infinite linear; border-radius:12px; }
        `}</style>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            maxWidth: 640,
            margin: "20px auto",
            padding: "0 12px",
          }}
        >
          <div
            className="skUP"
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
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div
                className="skUP"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="skUP"
                  style={{ height: 14, width: "40%", marginBottom: 10 }}
                />
                <div
                  className="skUP"
                  style={{ height: 11, width: "28%", marginBottom: 14 }}
                />
                <div style={{ display: "flex", gap: 10 }}>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="skUP"
                      style={{ height: 11, width: 70 }}
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

  if (!user) {
    return (
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          textAlign: "center",
          padding: "80px 20px",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 12 }}>👤</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
          User not found
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 12,
            padding: "10px 20px",
            borderRadius: 12,
            background: "rgba(6,182,212,0.12)",
            border: "1px solid rgba(6,182,212,0.25)",
            color: "#06b6d4",
            fontFamily: "'Syne',sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const TABS = [
    { key: "posts", icon: <FaCamera />, label: "Posts" },
    { key: "videos", icon: <MdOndemandVideo />, label: "Videos" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .up-root { font-family:'Syne',sans-serif; max-width:640px; margin:16px auto 40px; padding:0 12px; }

        .up-cover { width:100%; height:200px; border-radius:20px; overflow:hidden; background:#1e293b; position:relative; }
        @media(min-width:640px){ .up-cover{ height:260px; } }
        .up-cover img { width:100%; height:100%; object-fit:cover; display:block; }
        .up-cover-overlay { position:absolute; inset:0; background:linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 60%); }

        .up-card { background:linear-gradient(160deg,#1e293b 0%,#0f172a 100%); border:1px solid rgba(255,255,255,0.07); border-radius:20px; padding:20px; margin-top:14px; box-shadow:0 4px 24px rgba(0,0,0,0.35); }
        .up-top-row { display:flex; align-items:center; gap:18px; }
        .up-avatar { width:84px; height:84px; border-radius:50%; object-fit:cover; border:3px solid rgba(6,182,212,0.5); box-shadow:0 0 0 4px rgba(6,182,212,0.12); display:block; flex-shrink:0; }
        @media(min-width:640px){ .up-avatar{ width:100px; height:100px; } }

        .up-name { font-size:20px; font-weight:800; color:rgba(255,255,255,0.92); line-height:1.1; }
        .up-fullname { font-size:13px; font-weight:500; color:rgba(255,255,255,0.4); margin-top:3px; }

        .up-stats { display:flex; gap:6px; margin-top:14px; flex-wrap:wrap; }
        .up-stat-pill { display:flex; flex-direction:column; align-items:center; padding:10px 18px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); cursor:pointer; transition:background 0.2s, border-color 0.2s; min-width:72px; }
        .up-stat-pill:hover { background:rgba(6,182,212,0.1); border-color:rgba(6,182,212,0.25); }
        .up-stat-num { font-size:18px; font-weight:800; color:rgba(255,255,255,0.9); line-height:1; }
        .up-stat-label { font-size:10px; font-weight:600; letter-spacing:0.06em; color:rgba(255,255,255,0.3); text-transform:uppercase; margin-top:4px; }

        .up-bio-label { font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:rgba(255,255,255,0.22); margin-bottom:5px; margin-top:16px; }
        .up-bio-text { font-size:13px; color:rgba(255,255,255,0.55); line-height:1.6; }

        .up-tabs { display:flex; background:linear-gradient(160deg,#1e293b,#0f172a); border:1px solid rgba(255,255,255,0.07); border-radius:18px; padding:6px; margin-top:14px; gap:4px; }
        .up-tab { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:10px 0; border-radius:13px; border:none; font-family:'Syne',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:background 0.2s, color 0.2s; color:rgba(255,255,255,0.28); background:transparent; }
        .up-tab svg { font-size:16px; }
        .up-tab.active { background:rgba(6,182,212,0.15); color:#06b6d4; border:1px solid rgba(6,182,212,0.25); }
        .up-tab:not(.active):hover { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.6); }

        .up-content { background:linear-gradient(160deg,#1e293b,#0f172a); border:1px solid rgba(255,255,255,0.06); border-radius:18px; margin-top:12px; padding:18px; box-shadow:0 4px 24px rgba(0,0,0,0.25); color:rgba(255,255,255,0.8); }
      `}</style>

      <div className="up-root">
        {modalType && (
          <FollowModal
            type={modalType}
            userId={userId}
            onClose={() => setModalType(null)}
          />
        )}

        {/* Cover */}
        <div className="up-cover">
          <img
            src={user?.coverImage || "https://via.placeholder.com/800x300"}
            alt="cover"
          />
          <div className="up-cover-overlay" />
        </div>

        {/* Profile Card */}
        <div className="up-card">
          <div className="up-top-row">
            <img
              src={user?.avatar || "https://via.placeholder.com/100"}
              alt="avatar"
              className="up-avatar"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="up-name">@{user?.username}</div>
              <div className="up-fullname">{user?.fullName}</div>
            </div>
            {!isMyProfile && (
              <FollowButton userId={userId} isFollowedByBackend={isFollowing} />
            )}
          </div>

          <div className="up-stats">
            <div
              className="up-stat-pill"
              onClick={() => setModalType("followers")}
            >
              <span className="up-stat-num">{user?.followersCount ?? 0}</span>
              <span className="up-stat-label">Followers</span>
            </div>
            <div
              className="up-stat-pill"
              onClick={() => setModalType("followings")}
            >
              <span className="up-stat-num">{user?.followingCount ?? 0}</span>
              <span className="up-stat-label">Following</span>
            </div>
          </div>

          <div className="up-bio-label">Bio</div>
          <div className="up-bio-text">
            {user?.bio || "No bio available yet."}
          </div>
        </div>

        {/* Tabs */}
        <div className="up-tabs">
          {TABS.map(({ key, icon, label }) => (
            <button
              key={key}
              className={`up-tab ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="up-content">
          {activeTab === "videos" ? (
            <UserAllVideos userId={userId} />
          ) : (
            <UserAllPost userId={userId} />
          )}
        </div>
      </div>
    </>
  );
}

export default UserProfilePage;

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaComment, FaShareNodes, FaRegBookmark } from "react-icons/fa6";
import { PiDotsThreeBold } from "react-icons/pi";
import LikeButton from "../componants/LikeButton";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { useDispatch } from "react-redux";
import { syncPostLike } from "../slices/like.slice";

function UserAllPost({ userId }) {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/posts/user/${userId}`,
          { withCredentials: true },
        );
        const fetchedPosts = res.data.data || [];
        setPosts(fetchedPosts);
        fetchedPosts.forEach(post => {
          if (post.userLiked !== undefined) {
             dispatch(syncPostLike({ postId: post._id, isLiked: post.userLiked }));
          }
        });
      } catch (err) {
        console.log("Post fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchPosts();
  }, [userId]);

  useEffect(() => {
    if (!posts.length) return;
    posts.forEach((post) => socket.emit("join-post", post._id));
  }, [posts.length]);

  useEffect(() => {
    const handleReactionUpdate = (data) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === data.postId
            ? { 
                ...post, 
                likes: data.likes, 
                dislikes: data.dislikes,
                userLiked: data.userLiked !== undefined ? data.userLiked : post.userLiked,
              }
            : post,
        ),
      );
    };
    socket.on("post-reaction-updated", handleReactionUpdate);
    return () => socket.off("post-reaction-updated", handleReactionUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddToWatchLater = async (postId) => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/watch/watchlater",
        { postId },
        { withCredentials: true },
      );
      setOpenMenuId(null);
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');
          @keyframes shimUAP { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          .skUAP { background:linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%); background-size:400px 100%; animation:shimUAP 1.3s infinite linear; border-radius:10px; }
        `}</style>
        {[1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: "linear-gradient(160deg,#1e293b,#0f172a)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20,
              padding: 14,
              marginBottom: 14,
              fontFamily: "'Syne',sans-serif",
            }}
          >
            <div style={{ display: "flex", gap: 11, marginBottom: 14 }}>
              <div
                className="skUAP"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="skUAP"
                  style={{ height: 12, width: "48%", marginBottom: 8 }}
                />
                <div className="skUAP" style={{ height: 10, width: "30%" }} />
              </div>
            </div>
            <div className="skUAP" style={{ height: 190, width: "100%" }} />
          </div>
        ))}
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          textAlign: "center",
          padding: "50px 20px",
          color: "rgba(255,255,255,0.25)",
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 10 }}>📷</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          No posts yet
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        @keyframes menuInUAP { from{opacity:0;transform:translateY(-6px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .uap-card { font-family:'Syne',sans-serif; position:relative; background:linear-gradient(160deg,#1e293b 0%,#0f172a 100%); border:1px solid rgba(255,255,255,0.06); border-radius:20px; overflow:hidden; margin-bottom:14px; box-shadow:0 4px 20px rgba(0,0,0,0.3); transition:box-shadow 0.25s, transform 0.2s; }
        .uap-card:hover { box-shadow:0 8px 36px rgba(0,0,0,0.45); transform:translateY(-1px); }

        .uap-header { display:flex; align-items:center; gap:11px; padding:14px 14px 10px; }
        .uap-avatar { width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid rgba(6,182,212,0.3); flex-shrink:0; }
        .uap-username { font-size:13px; font-weight:700; color:rgba(255,255,255,0.85); }
        .uap-time { font-size:11px; color:rgba(255,255,255,0.28); margin-top:2px; }
        .uap-dots { margin-left:auto; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:20px; cursor:pointer; color:rgba(255,255,255,0.3); transition:background 0.2s, color 0.2s; }
        .uap-dots:hover { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.75); }

        .uap-body { padding:0 14px 14px; }
        .uap-title { font-size:13px; font-weight:600; color:rgba(255,255,255,0.78); margin-bottom:10px; line-height:1.5; }
        .uap-img { width:100%; max-height:300px; border-radius:14px; object-fit:cover; display:block; }

        .uap-actions { display:flex; align-items:center; border-top:1px solid rgba(255,255,255,0.05); padding:4px 6px; }
        .uap-act-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:7px; padding:10px 0; font-size:13px; font-weight:600; font-family:'Syne',sans-serif; color:rgba(255,255,255,0.32); cursor:pointer; border-radius:10px; border:none; background:transparent; transition:background 0.2s, color 0.2s; }
        .uap-act-btn:hover { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.8); }
        .uap-act-btn.comment:hover { color:#38bdf8; }
        .uap-act-btn.share:hover { color:#a78bfa; }
        .uap-act-divider { width:1px; height:22px; background:rgba(255,255,255,0.05); }

        .uap-menu { position:absolute; top:52px; right:12px; z-index:50; background:linear-gradient(160deg,#1e293b,#0f172a); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:6px; width:160px; box-shadow:0 12px 40px rgba(0,0,0,0.5); animation:menuInUAP 0.18s ease; }
        .uap-menu-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:10px; font-size:13px; font-weight:600; font-family:'Syne',sans-serif; cursor:pointer; border:none; background:transparent; width:100%; text-align:left; color:rgba(255,255,255,0.65); transition:background 0.15s, color 0.15s; }
        .uap-menu-item:hover { background:rgba(255,255,255,0.06); color:#fff; }
      `}</style>

      {posts.map((post) => (
        <div key={post._id} className="uap-card">
          <div className="uap-header">
            <img
              src={post?.createdBy?.avatar || "https://via.placeholder.com/40"}
              alt="avatar"
              className="uap-avatar"
            />
            <div>
              <div className="uap-username">
                @{post?.createdBy?.username || "Unknown"}
              </div>
              <div className="uap-time">
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>
            <div
              className="uap-dots"
              onClick={() =>
                setOpenMenuId(openMenuId === post._id ? null : post._id)
              }
            >
              <PiDotsThreeBold />
            </div>
          </div>

          <div className="uap-body">
            {post.title && <p className="uap-title">{post.title}</p>}
            {post.posturl && (
              <img
                src={post.posturl}
                alt="post"
                className="uap-img"
                loading="lazy"
              />
            )}
          </div>

          <div className="uap-actions">
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <LikeButton postId={post._id} likeCount={post.likes || 0} />
            </div>
            <div className="uap-act-divider" />
            <button
              className="uap-act-btn comment"
              onClick={() => navigate(`/post/${post._id}`)}
            >
              <FaComment /> {post.comments || 0}
            </button>
            <div className="uap-act-divider" />
            <button className="uap-act-btn share">
              <FaShareNodes /> Share
            </button>
          </div>

          {openMenuId === post._id && (
            <div className="uap-menu" ref={menuRef}>
              <button
                className="uap-menu-item"
                onClick={() => handleAddToWatchLater(post._id)}
              >
                <FaRegBookmark /> Save
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default UserAllPost;

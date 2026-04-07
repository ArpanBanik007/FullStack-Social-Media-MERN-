import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaComment, FaShareNodes, FaRegBookmark, FaEye } from "react-icons/fa6";
import { PiDotsThreeBold } from "react-icons/pi";
import { MdEdit, MdDelete } from "react-icons/md";
import LikeButton from "../componants/LikeButton";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { syncPostLike } from "../slices/like.slice";

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
  @keyframes shimmerA { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes menuIn { from{opacity:0;transform:translateY(-6px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .skA { background:linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%); background-size:400px 100%; animation:shimmerA 1.3s infinite linear; border-radius:10px; }

  .ap-card {
    font-family: 'Syne', sans-serif;
    position: relative;
    background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 14px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    transition: box-shadow 0.25s, transform 0.2s;
  }
  .ap-card:hover { box-shadow:0 8px 36px rgba(0,0,0,0.45); transform:translateY(-1px); }

  .ap-header { display:flex; align-items:center; gap:11px; padding:14px 14px 10px; }

  .ap-avatar {
    width:40px; height:40px; border-radius:50%; object-fit:cover;
    border:2px solid rgba(6,182,212,0.3); flex-shrink:0;
    transition:border-color 0.2s;
  }
  .ap-avatar:hover { border-color:#06b6d4; }

  .ap-username { font-size:13px; font-weight:700; color:rgba(255,255,255,0.85); }
  .ap-time { font-size:11px; color:rgba(255,255,255,0.28); margin-top:2px; }

  .ap-dots {
    margin-left:auto; width:32px; height:32px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:20px; cursor:pointer; color:rgba(255,255,255,0.3);
    transition:background 0.2s, color 0.2s;
    flex-shrink:0;
  }
  .ap-dots:hover { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.75); }

  .ap-body { padding:0 14px 14px; }
  .ap-title { font-size:13px; font-weight:600; color:rgba(255,255,255,0.78); margin-bottom:10px; line-height:1.5; }
  .ap-img { width:100%; max-height:300px; border-radius:14px; object-fit:cover; display:block; }

  .ap-actions {
    display:flex; align-items:center;
    border-top:1px solid rgba(255,255,255,0.05);
    padding:4px 6px;
  }
  .ap-act-btn {
    flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
    padding:10px 0; font-size:13px; font-weight:600; font-family:'Syne',sans-serif;
    color:rgba(255,255,255,0.32); cursor:pointer; border-radius:10px;
    border:none; background:transparent; transition:background 0.2s, color 0.2s;
  }
  .ap-act-btn:hover { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.8); }
  .ap-act-btn.comment:hover { color:#38bdf8; }
  .ap-act-btn.share:hover { color:#a78bfa; }
  .ap-act-divider { width:1px; height:22px; background:rgba(255,255,255,0.05); }

  .ap-menu {
    position:absolute; top:52px; right:12px; z-index:50;
    background:linear-gradient(160deg,#1e293b,#0f172a);
    border:1px solid rgba(255,255,255,0.08); border-radius:14px;
    padding:6px; width:170px;
    box-shadow:0 12px 40px rgba(0,0,0,0.5);
    animation:menuIn 0.18s ease;
  }
  .ap-menu-item {
    display:flex; align-items:center; gap:10px; padding:9px 12px;
    border-radius:10px; font-size:13px; font-weight:600; font-family:'Syne',sans-serif;
    cursor:pointer; border:none; background:transparent; width:100%; text-align:left;
    color:rgba(255,255,255,0.65); transition:background 0.15s, color 0.15s;
  }
  .ap-menu-item:hover { background:rgba(255,255,255,0.06); color:#fff; }
  .ap-menu-item.danger { color:#f87171; }
  .ap-menu-item.danger:hover { background:rgba(239,68,68,0.1); }
  .ap-menu-sep { height:1px; background:rgba(255,255,255,0.06); margin:4px 0; }
`;

const AllPosts = () => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/posts/my-posts",
          { withCredentials: true },
        );
        const fetchedPosts = res.data?.data || [];
        setPosts(fetchedPosts);
        fetchedPosts.forEach((post) => {
          if (post.userLiked !== undefined) {
            dispatch(
              syncPostLike({ postId: post._id, isLiked: post.userLiked }),
            );
          }
        });
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, []);

  useEffect(() => {
    if (!posts.length) return;
    posts.forEach((post) => socket.emit("join-post", post._id));
  }, [posts.length]);

  useEffect(() => {
    const handleReactionUpdate = (data) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === data.postId ? { ...post, likes: data.likes } : post,
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

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/v1/posts/${postId}`, {
        withCredentials: true,
      });
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToWatchLater = async (postId) => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/watch/watchlater",
        { postId },
        { withCredentials: true },
      );
      setOpenMenuId(null);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <>
        <style>{SHARED_STYLES}</style>
        {[1, 2, 2].map((i) => (
          <div key={i} className="ap-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", gap: 11, marginBottom: 14 }}>
              <div
                className="skA"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="skA"
                  style={{ height: 12, width: "50%", marginBottom: 8 }}
                />
                <div className="skA" style={{ height: 10, width: "32%" }} />
              </div>
            </div>
            <div
              className="skA"
              style={{ height: 200, width: "100%", marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <div className="skA" style={{ height: 10, width: "25%" }} />
              <div className="skA" style={{ height: 10, width: "20%" }} />
              <div className="skA" style={{ height: 10, width: "20%" }} />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <style>{SHARED_STYLES}</style>
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
          <div style={{ fontSize: 12 }}>Your posts will appear here</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{SHARED_STYLES}</style>
      {posts.map((post) => (
        <div key={post._id} className="ap-card">
          <div className="ap-header">
            <img
              src={post?.createdBy?.avatar || "https://via.placeholder.com/40"}
              alt="avatar"
              className="ap-avatar"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="ap-username"
                style={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                @{post?.createdBy?.username || "Unknown"}
              </div>
              <div className="ap-time">
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>
            <div
              className="ap-dots"
              onClick={() =>
                setOpenMenuId(openMenuId === post._id ? null : post._id)
              }
            >
              <PiDotsThreeBold />
            </div>
          </div>

          <div className="ap-body">
            {post.title && <p className="ap-title">{post.title}</p>}
            {post.posturl && (
              <div
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/post/single/${post._id}`)}
              >
                <img src={post.posturl} alt="post" className="ap-img" />
              </div>
            )}
          </div>

          <div className="ap-actions">
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <LikeButton postId={post._id} likeCount={post.likes || 0} />
            </div>
            <div className="ap-act-divider" />
            <button
              className="ap-act-btn comment"
              onClick={() => navigate(`/post/single/${post._id}`)}
            >
              <FaComment /> {post.comments || 0}
            </button>
            <div className="ap-act-divider" />
            <button className="ap-act-btn comment">
              <FaEye /> {post.views || 0}
            </button>
            <div className="ap-act-divider" />
            <button className="ap-act-btn share">
              <FaShareNodes /> Share
            </button>
          </div>

          {openMenuId === post._id && (
            <div className="ap-menu" ref={menuRef}>
              <button
                className="ap-menu-item"
                onClick={() => handleAddToWatchLater(post._id)}
              >
                <FaRegBookmark /> Save
              </button>
              <button className="ap-menu-item">
                <MdEdit /> Edit
              </button>
              <div className="ap-menu-sep" />
              <button
                className="ap-menu-item danger"
                onClick={() => handleDeletePost(post._id)}
              >
                <MdDelete /> Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default AllPosts;

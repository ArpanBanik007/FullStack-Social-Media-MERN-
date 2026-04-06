import { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../socket";

import { FaComment, FaShareNodes } from "react-icons/fa6";
import { FaEye } from "react-icons/fa";
import { PiDotsThreeBold } from "react-icons/pi";

import { useSelector, useDispatch } from "react-redux";
import FollowButton from "../componants/FollowButton";
import { fetchMyFollowings } from "../slices/follow.slice";
import PostActionMenu from "../componants/PostActionMenu";
import { useNavigate } from "react-router-dom";
import LikeButton from "../componants/LikeButton";
import { syncPostLike } from "../slices/like.slice";

function MainFeed() {
  const dispatch = useDispatch();
  const { mydetails, loading: userLoading } = useSelector(
    (state) => state.mydetails,
  );

  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchMyFollowings());
  }, [dispatch]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/posts/feed", {
          withCredentials: true,
        });
        const fetchedPosts = res.data?.posts || [];
        setPosts(fetchedPosts);
        fetchedPosts.forEach((post) => {
          if (post.userLiked !== undefined) {
            dispatch(
              syncPostLike({ postId: post._id, isLiked: post.userLiked }),
            );
          }
        });
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setFeedLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleSavePost = async (postId) => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/watch/watchlater",
        { postId },
        { withCredentials: true },
      );
      alert("Post saved ✅");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!posts.length) return;
    posts.forEach((post) => socket.emit("join-post", `post:${post._id}`));
  }, [posts.length]);

  useEffect(() => {
    posts.forEach((post) => socket.emit("join-post", post._id));
    const handleReactionUpdate = (data) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === data.postId
            ? {
                ...post,
                likes: data.likes,
                dislikes: data.dislikes,
                userLiked:
                  data.userLiked !== undefined
                    ? data.userLiked
                    : post.userLiked,
                userDisliked:
                  data.userDisliked !== undefined
                    ? data.userDisliked
                    : post.userDisliked,
              }
            : post,
        ),
      );
    };
    socket.on("post-reaction-updated", handleReactionUpdate);
    return () => socket.off("post-reaction-updated", handleReactionUpdate);
  }, []);

  useEffect(() => {
    const handleCommentCountUpdate = ({ postId, comments }) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, comments } : post,
        ),
      );
    };
    socket.on("comment-count-updated", handleCommentCountUpdate);
    return () => socket.off("comment-count-updated", handleCommentCountUpdate);
  }, []);

  if (feedLoading || userLoading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');
          @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          .skeleton {
            background: linear-gradient(90deg, #1e293b 25%, #263348 50%, #1e293b 75%);
            background-size: 400px 100%;
            animation: shimmer 1.4s infinite linear;
            border-radius: 12px;
          }
        `}</style>
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "8px 0",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "linear-gradient(160deg,#1e293b,#0f172a)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 18,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div
                  className="skeleton"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skeleton"
                    style={{ height: 13, width: "55%", marginBottom: 7 }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 10, width: "35%" }}
                  />
                </div>
              </div>
              {/* skeleton ও 4:5 ratio তে */}
              <div
                className="skeleton"
                style={{
                  width: "100%",
                  aspectRatio: "4/5",
                  marginBottom: 14,
                  borderRadius: 14,
                }}
              />
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  className="skeleton"
                  style={{ height: 11, width: "25%" }}
                />
                <div
                  className="skeleton"
                  style={{ height: 11, width: "20%" }}
                />
                <div
                  className="skeleton"
                  style={{ height: 11, width: "20%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        style={{
          fontFamily: "'Syne',sans-serif",
          textAlign: "center",
          padding: "60px 20px",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌌</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
          Nothing here yet
        </div>
        <div style={{ fontSize: 13 }}>
          Follow some people to see their posts
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');

        .post-card {
          font-family: 'Syne', sans-serif;
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.35);
          transition: box-shadow 0.25s, transform 0.2s;
          position: relative;
        }
        .post-card:hover {
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
          transform: translateY(-1px);
        }

        .post-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px 10px;
          position: relative;
        }

        .post-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(6,182,212,0.35);
          cursor: pointer;
          transition: border-color 0.2s;
          flex-shrink: 0;
        }
        .post-avatar:hover { border-color: #06b6d4; }

        .post-username {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          cursor: pointer;
          transition: color 0.2s;
        }
        .post-username:hover { color: #06b6d4; }

        .post-time {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          margin-top: 2px;
          font-weight: 400;
        }

        .post-menu-btn {
          margin-left: auto;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
          color: rgba(255,255,255,0.35);
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .post-menu-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }

        .post-body { padding: 0 16px 14px; }

        .post-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.82);
          margin-bottom: 10px;
          line-height: 1.5;
        }

        /* ✅ 4:5 fixed wrapper — structure same থাকে */
        .post-image-wrapper {
          width: 100%;
          aspect-ratio: 4 / 5;
          border-radius: 14px;
          overflow: hidden;
          background: #0a1628;   /* contain এর পাশে dark fill */
          cursor: pointer;
          position: relative;
        }

        /* ✅ Hover overlay */
        .post-image-wrapper::after {
          content: '💬 View Post';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          opacity: 0;
          transition: opacity 0.25s ease;
          border-radius: 14px;
        }
        .post-image-wrapper:hover::after { opacity: 1; }

        /* ✅ contain — পুরো image দেখাবে, crop নেই, পাশে dark gap */
        .post-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          background: #0a1628;
          display: block;
          transition: transform 0.35s ease;
        }
        .post-image-wrapper:hover .post-image {
          transform: scale(1.02);
        }

        .post-actions {
          display: flex;
          align-items: center;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 4px 6px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 0;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Syne', sans-serif;
          color: rgba(255,255,255,0.38);
          cursor: pointer;
          border-radius: 10px;
          border: none;
          background: transparent;
          transition: background 0.2s, color 0.2s;
        }
        .action-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .action-btn.comment:hover { color: #38bdf8; }
        .action-btn.share:hover { color: #a78bfa; }
        .action-btn svg { font-size: 16px; }

        .action-divider {
          width: 1px;
          height: 22px;
          background: rgba(255,255,255,0.06);
        }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "4px 0" }}>
        {posts.map((post) => (
          <div key={post._id} className="post-card">
            {/* HEADER */}
            <div className="post-header">
              <img
                src={
                  post?.createdBy?.avatar || "https://via.placeholder.com/42"
                }
                className="post-avatar"
                onClick={() =>
                  post?.createdBy?._id === mydetails?._id
                    ? navigate("/profile")
                    : navigate(`/profile/${post?.createdBy?._id}`)
                }
              />
              <div
                style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                onClick={() =>
                  post?.createdBy?._id === mydetails?._id
                    ? navigate("/profile")
                    : navigate(`/profile/${post?.createdBy?._id}`)
                }
              >
                <div
                  className="post-username"
                  style={{
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  @{post?.createdBy?.username}
                </div>
                <div className="post-time">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>

              {post.createdBy._id !== mydetails?._id && (
                <div style={{ marginRight: 4, flexShrink: 0 }}>
                  <FollowButton
                    userId={post.createdBy._id}
                    isFollowedByBackend={post.createdBy.isFollowedByMe}
                  />
                </div>
              )}

              <div
                className="post-menu-btn"
                style={
                  post.createdBy._id === mydetails?._id
                    ? { marginLeft: "auto" }
                    : {}
                }
                onClick={() =>
                  setOpenMenuId(openMenuId === post._id ? null : post._id)
                }
              >
                <PiDotsThreeBold />
              </div>

              <PostActionMenu
                isOpen={openMenuId === post._id}
                onClose={() => setOpenMenuId(null)}
                onSave={() => handleSavePost(post._id)}
                onBlock={() => console.log("Block user:", post.createdBy._id)}
              />
            </div>

            {/* BODY */}
            <div className="post-body">
              {post.title && <p className="post-title">{post.title}</p>}
              {post.posturl && (
                // ✅ Click → comment page, contain → পুরো image দেখায়
                <div
                  className="post-image-wrapper"
                  onClick={() => navigate(`/post/single/${post._id}`)}
                >
                  <img src={post.posturl} className="post-image" alt="post" />
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="post-actions">
              <div
                style={{ flex: 1, display: "flex", justifyContent: "center" }}
              >
                <LikeButton postId={post._id} likeCount={post.likes || 0} />
              </div>

              <div className="action-divider" />

              <button
                className="action-btn comment"
                onClick={() => navigate(`/post/single/${post._id}`)}
              >
                <FaComment /> {post.comments || 0}
              </button>

              <div className="action-divider" />

              <button className="action-btn">
                <FaEye /> {post.views || 0}
              </button>
              <div className="action-divider" />

              <button className="action-btn share">
                <FaShareNodes /> Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default MainFeed;

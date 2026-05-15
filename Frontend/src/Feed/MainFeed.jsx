import API from "../utils/API.js";
import { useEffect, useState } from "react";
import { connectSocket } from "../socket";
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
  const { mydetails, loading: userLoading } = useSelector((state) => state.mydetails);
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
        const res = await API.get("/posts/feed", { withCredentials: true });
        const fetchedPosts = res.data?.posts || [];
        setPosts(fetchedPosts);
        fetchedPosts.forEach((post) => {
          if (post.userLiked !== undefined) {
            dispatch(syncPostLike({ postId: post._id, isLiked: post.userLiked }));
          }
        });
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setFeedLoading(false);
      }
    };
    fetchFeed();
  }, [dispatch]);

  useEffect(() => {
    if (!posts.length) return;
    const socket = connectSocket();
    if (!socket) return;
    posts.forEach((post) => socket.emit("joinRoom", `post:${post._id}`));

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
            : post
        )
      );
    };
    socket.on("post-reaction-updated", handleReactionUpdate);
    return () => socket.off("post-reaction-updated", handleReactionUpdate);
  }, [posts.length]);

  if (feedLoading || userLoading) {
    return (
      <div style={{ padding: "20px 0" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card" style={{ padding: 18, borderRadius: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 14 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: "30%", marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 10, width: "15%" }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: "100%", height: 300, borderRadius: 18 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .post-card {
          position: relative;
          background: rgba(22, 36, 58, 0.35);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 18px;
          margin-bottom: 16px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .post-card:hover {
          background: rgba(22, 36, 58, 0.5);
          border-color: rgba(0, 217, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 217, 255, 0.05);
        }

        .post-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .post-avatar-wrap {
          position: relative;
          cursor: pointer;
        }

        .post-avatar {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          object-fit: cover;
          border: 1.5px solid var(--glass-border);
          transition: all 0.3s ease;
        }

        .post-card:hover .post-avatar {
          border-color: var(--accent-primary);
          box-shadow: 0 0 12px rgba(0, 217, 255, 0.2);
        }

        .post-user-info {
          flex: 1;
          min-width: 0;
        }

        .post-author-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          transition: color 0.3s ease;
          letter-spacing: -0.2px;
        }

        .post-author-name:hover { color: var(--accent-primary); }

        .post-meta {
          font-size: 11px;
          color: var(--text-secondary);
          opacity: 0.5;
          margin-top: 1px;
        }

        .post-content {
          margin-bottom: 16px;
        }

        .post-title-text {
          font-size: 15px;
          line-height: 1.5;
          color: var(--text-primary);
          margin-bottom: 12px;
          font-weight: 400;
          opacity: 0.95;
        }

        .post-media-container {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          background: #08111d;
          border: 1px solid var(--glass-border);
          max-height: 420px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .post-image {
          width: 100%;
          max-height: 420px;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          aspect-ratio: 16 / 10;
        }

        .post-card:hover .post-image {
          transform: scale(1.04);
        }

        .post-actions-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 14px;
          border-top: 1px solid var(--glass-border);
        }

        .feed-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .feed-action-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .feed-action-btn.comment-btn:hover {
          color: var(--accent-primary);
          background: rgba(0, 217, 255, 0.04);
        }

        .feed-action-btn svg { font-size: 16px; }

        .views-badge {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--text-secondary);
          font-size: 12px;
          opacity: 0.4;
        }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 10px" }}>
        {posts.map((post) => (
          <div key={post._id} className="post-card">
            <div className="post-header">
              <div className="post-avatar-wrap" onClick={() => navigate(post?.createdBy?._id === mydetails?._id ? "/profile" : `/profile/${post?.createdBy?._id}`)}>
                <img
                  src={post?.createdBy?.avatar || `https://ui-avatars.com/api/?name=${post?.createdBy?.username}&background=16243A&color=00D9FF`}
                  className="post-avatar"
                  alt="avatar"
                />
              </div>
              <div className="post-user-info" onClick={() => navigate(post?.createdBy?._id === mydetails?._id ? "/profile" : `/profile/${post?.createdBy?._id}`)}>
                <div className="post-author-name">@{post?.createdBy?.username}</div>
                <div className="post-meta">{new Date(post.createdAt).toLocaleDateString()} • {post?.createdBy?.bio?.substring(0, 20) || "Nexus Explorer"}</div>
              </div>

              {post.createdBy._id !== mydetails?._id && (
                <FollowButton
                  userId={post.createdBy._id}
                  isFollowedByBackend={post.createdBy.isFollowedByMe}
                />
              )}

              <div className="post-menu-btn" onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}>
                <PiDotsThreeBold style={{ fontSize: 22, cursor: "pointer", color: "var(--text-secondary)", opacity: 0.6 }} />
              </div>

              <PostActionMenu
                isOpen={openMenuId === post._id}
                onClose={() => setOpenMenuId(null)}
                onSave={() => alert("Stored in quantum storage ✅")}
              />
            </div>

            <div className="post-content">
              {post.title && <div className="post-title-text">{post.title}</div>}
              {post.posturl && (
                <div className="post-media-container" onClick={() => navigate(`/post/single/${post._id}`)}>
                  <img src={post.posturl} className="post-image" alt="content" />
                </div>
              )}
            </div>

            <div className="post-actions-bar">
              <LikeButton postId={post._id} likeCount={post.likes || 0} />
              
              <button className="feed-action-btn comment-btn" onClick={() => navigate(`/post/single/${post._id}`)}>
                <FaComment /> <span>{post.comments || 0}</span>
              </button>

              <button className="feed-action-btn">
                <FaShareNodes /> <span>Share</span>
              </button>

              <div className="views-badge">
                <FaEye /> <span>{post.views || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default MainFeed;

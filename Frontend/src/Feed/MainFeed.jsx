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

  /* ── Skeleton loader ── */
  if (feedLoading || userLoading) {
    return (
      <div style={{ paddingTop: 4 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--pluto-bg-card)",
              border: "1px solid var(--pluto-border)",
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
              <div className="skeleton" style={{ width: 42, height: 42, borderRadius: "50%" }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 13, width: "32%", marginBottom: 7 }} />
                <div className="skeleton" style={{ height: 10, width: "18%" }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: "100%", height: 260, borderRadius: 10 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ── Post card ── */
        .post-card {
          position: relative;
          background: var(--pluto-bg-card);
          border: 1px solid var(--pluto-border);
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 12px;
          transition: border-color 0.2s ease;
        }
        .post-card:hover {
          border-color: rgba(34, 211, 238, 0.18);
        }

        /* ── Post header ── */
        .post-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        /* ── Avatar ── */
        .post-avatar-wrap { cursor: pointer; flex-shrink: 0; }
        .post-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--pluto-border);
          display: block;
          transition: border-color 0.2s ease;
        }
        .post-card:hover .post-avatar { border-color: rgba(34, 211, 238, 0.3); }

        /* ── Author info ── */
        .post-user-info {
          flex: 1;
          min-width: 0;
          cursor: pointer;
        }
        .post-author-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--pluto-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .post-meta {
          font-size: 13px;
          color: var(--pluto-text-hint);
          margin-top: 1px;
        }

        /* ── Post body ── */
        .post-title-text {
          font-size: 16px;
          font-weight: 500;
          line-height: 1.55;
          color: var(--pluto-text-primary);
          margin-bottom: 12px;
        }

        /* ── Post image ── */
        .post-media-container {
          border-radius: 10px;
          overflow: hidden;
          background: #08111d;
          border: 1px solid var(--pluto-border);
          cursor: pointer;
        }
        .post-image {
          width: 100%;
          max-height: 420px;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .post-card:hover .post-image { transform: scale(1.02); }

        /* ── Actions bar ── */
        .post-actions-bar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 12px;
          border-top: 1px solid var(--pluto-border);
        }

        .feed-action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: var(--pluto-text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: background 0.15s ease, color 0.15s ease;
          cursor: pointer;
        }
        .feed-action-btn:hover {
          background: var(--pluto-bg-hover);
          color: var(--pluto-text-primary);
        }
        .feed-action-btn svg { font-size: 16px; }

        /* ── Views pill ── */
        .views-badge {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--pluto-text-hint);
          font-size: 13px;
        }

        /* ── Dots menu trigger ── */
        .post-menu-btn {
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          color: var(--pluto-text-hint);
          transition: background 0.15s ease, color 0.15s ease;
          display: flex;
        }
        .post-menu-btn:hover {
          background: var(--pluto-bg-hover);
          color: var(--pluto-text-secondary);
        }
      `}</style>

      <div>
        {posts.map((post) => (
          <div key={post._id} className="post-card">
            {/* ── Header ── */}
            <div className="post-header">
              <div
                className="post-avatar-wrap"
                onClick={() => navigate(post?.createdBy?._id === mydetails?._id ? "/profile" : `/profile/${post?.createdBy?._id}`)}
              >
                <img
                  src={post?.createdBy?.avatar || `https://ui-avatars.com/api/?name=${post?.createdBy?.username}&background=1a2235&color=22d3ee`}
                  className="post-avatar"
                  alt="avatar"
                />
              </div>

              <div
                className="post-user-info"
                onClick={() => navigate(post?.createdBy?._id === mydetails?._id ? "/profile" : `/profile/${post?.createdBy?._id}`)}
              >
                <div className="post-author-name">@{post?.createdBy?.username}</div>
                <div className="post-meta">
                  {new Date(post.createdAt).toLocaleDateString()} &bull; {post?.createdBy?.bio?.substring(0, 20) || "Nexus Explorer"}
                </div>
              </div>

              {post.createdBy._id !== mydetails?._id && (
                <FollowButton
                  userId={post.createdBy._id}
                  isFollowedByBackend={post.createdBy.isFollowedByMe}
                />
              )}

              <div
                className="post-menu-btn"
                onClick={() => setOpenMenuId(openMenuId === post._id ? null : post._id)}
              >
                <PiDotsThreeBold style={{ fontSize: 22 }} />
              </div>

              <PostActionMenu
                isOpen={openMenuId === post._id}
                onClose={() => setOpenMenuId(null)}
                onSave={() => alert("Stored in quantum storage ✅")}
              />
            </div>

            {/* ── Content ── */}
            <div>
              {post.title && <div className="post-title-text">{post.title}</div>}
              {post.posturl && (
                <div
                  className="post-media-container"
                  onClick={() => navigate(`/post/single/${post._id}`)}
                >
                  <img src={post.posturl} className="post-image" alt="content" />
                </div>
              )}
            </div>

            {/* ── Actions ── */}
            <div className="post-actions-bar">
              <LikeButton postId={post._id} likeCount={post.likes || 0} />

              <button
                className="feed-action-btn"
                onClick={() => navigate(`/post/single/${post._id}`)}
              >
                <FaComment style={{ color: "var(--pluto-text-secondary)" }} />
                <span>{post.comments || 0}</span>
              </button>

              <button className="feed-action-btn">
                <FaShareNodes />
                <span>Share</span>
              </button>

              <div className="views-badge">
                <FaEye />
                <span>{post.views || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default MainFeed;

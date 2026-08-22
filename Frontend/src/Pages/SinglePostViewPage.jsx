import API from "../utils/API.js";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { IoArrowBack } from "react-icons/io5";
import { RiAccountCircleFill } from "react-icons/ri";
import { FaHeart, FaRegHeart, FaComment } from "react-icons/fa6";
import { FaEye } from "react-icons/fa";
import {
  toggleLike,
  selectIsPostLiked,
  syncPostLike,
} from "../slices/like.slice";
import {
  getPostViews,
  addPostView,
  updatePostViews,
} from "../slices/postView.slice";
import { connectSocket } from "../socket";
import ShareButton from "../componants/ShareButton";

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const SPV_CSS = `
  .spv-root { min-height: 100vh; display: flex; flex-direction: column; background: var(--pluto-bg-page); }
  .spv-topbar { position: sticky; top: 0; z-index: 20; background: rgba(10,14,26,0.92); backdrop-filter: blur(8px); border-bottom: 1px solid var(--pluto-border); padding: 0 16px; height: 56px; display: flex; align-items: center; gap: 12px; }
  .spv-back-btn { width: 34px; height: 34px; border-radius: 8px; background: var(--pluto-bg-input); border: 1px solid var(--pluto-border); display: flex; align-items: center; justify-content: center; color: var(--pluto-text-secondary); cursor: pointer; transition: background 0.15s ease, color 0.15s ease; font-size: 18px; }
  .spv-back-btn:hover { background: var(--pluto-bg-hover); color: var(--pluto-text-primary); }
  .spv-topbar-title { font-size: 15px; font-weight: 600; color: var(--pluto-text-primary); }
  .spv-body { max-width: 640px; margin: 0 auto; width: 100%; padding: 16px; display: flex; flex-direction: column; gap: 12px; padding-bottom: 100px; }
  .spv-post-card { background: var(--pluto-bg-card); border: 1px solid var(--pluto-border); border-radius: 14px; overflow: hidden; transition: border-color 0.2s ease; }
  .spv-post-card:hover { border-color: rgba(34,211,238,0.18); }
  .spv-post-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; }
  .spv-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--pluto-border); cursor: pointer; flex-shrink: 0; transition: border-color 0.2s ease; }
  .spv-avatar:hover { border-color: rgba(34,211,238,0.4); }
  .spv-username { font-size: 15px; font-weight: 600; color: var(--pluto-text-primary); cursor: pointer; }
  .spv-timestamp { font-size: 13px; color: var(--pluto-text-hint); margin-top: 2px; }
  .spv-post-body { padding: 0 16px 14px; }
  .spv-post-title { font-size: 15px; line-height: 1.55; color: var(--pluto-text-primary); margin-bottom: 12px; }
  .spv-post-img-wrap { border-radius: 10px; overflow: hidden; background: #08111d; border: 1px solid var(--pluto-border); display: flex; align-items: center; justify-content: center; }
  .spv-post-img { max-width: 100%; max-height: 80vh; width: auto; height: auto; object-fit: contain; display: block; }
  .spv-actions { display: flex; align-items: center; border-top: 1px solid var(--pluto-border); padding: 4px 8px; }
  .spv-action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 0; border-radius: 8px; background: transparent; border: none; font-size: 14px; font-weight: 500; color: var(--pluto-text-secondary); cursor: pointer; transition: background 0.15s ease, color 0.15s ease; }
  .spv-action-btn:hover { background: var(--pluto-bg-hover); color: var(--pluto-text-primary); }
  .spv-action-btn.liked { color: var(--pluto-like); }
  .spv-action-btn.liked:hover { background: rgba(244,114,182,0.08); }
  .spv-action-sep { width: 1px; height: 20px; background: var(--pluto-border); flex-shrink: 0; }
  .spv-comments-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--pluto-text-hint); padding: 0 4px; }
  .spv-comment-row { display: flex; gap: 12px; padding: 12px 14px; background: var(--pluto-bg-card); border: 1px solid var(--pluto-border); border-radius: 12px; }
  .spv-comment-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid var(--pluto-border); flex-shrink: 0; margin-top: 2px; }
  .spv-comment-author { font-size: 13px; font-weight: 600; color: var(--pluto-text-primary); margin-bottom: 4px; }
  .spv-comment-text { font-size: 14px; color: var(--pluto-text-secondary); line-height: 1.5; word-break: break-word; }
  .spv-comment-time { font-size: 12px; color: var(--pluto-text-hint); margin-top: 5px; }
  .spv-comment-input-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 20; background: rgba(10,14,26,0.96); backdrop-filter: blur(8px); border-top: 1px solid var(--pluto-border); padding: 12px 16px; }
  .spv-comment-input-wrap { max-width: 640px; margin: 0 auto; display: flex; align-items: center; gap: 10px; }
  .spv-comment-input { flex: 1; background: var(--pluto-bg-input); border: 1px solid var(--pluto-border); border-radius: 9999px; padding: 9px 18px; font-size: 14px; color: var(--pluto-text-primary); outline: none; font-family: inherit; transition: border-color 0.2s ease; }
  .spv-comment-input::placeholder { color: var(--pluto-text-hint); }
  .spv-comment-input:focus { border-color: rgba(34,211,238,0.4); }
  .spv-comment-send { font-size: 14px; font-weight: 600; color: var(--pluto-accent); background: none; border: none; cursor: pointer; transition: opacity 0.15s ease; white-space: nowrap; padding: 0; }
  .spv-comment-send:hover:not(:disabled) { opacity: 0.8; }
  .spv-comment-send:disabled { opacity: 0.3; cursor: not-allowed; }
`;

function SinglePostViewPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  const isLiked = useSelector(selectIsPostLiked(postId));
  const { mydetails } = useSelector((state) => state.mydetails);
  const views = useSelector((state) => state.postView.views);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          API.get(`/posts/single/${postId}`, { withCredentials: true }),
          API.get(`/posts/comments/post/${postId}`, { withCredentials: true }),
        ]);

        const fetchedPost = postRes.data?.data;
        setPost(fetchedPost);
        setLikeCount(fetchedPost?.likes || 0);
        setComments(commentsRes.data?.data || []);

        if (fetchedPost?.isLiked !== undefined) {
          dispatch(syncPostLike({ postId, isLiked: fetchedPost.isLiked }));
        }

        dispatch(getPostViews(postId));
        dispatch(addPostView(postId));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [postId, dispatch]);

  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    socket.emit("joinRoom", `post:${postId}`);

    const handleReaction = (data) => {
      if (data.postId === postId) setLikeCount(data.likes);
    };

    const handleCommentCount = ({ postId: pid, comments: count }) => {
      if (pid === postId)
        setPost((prev) => (prev ? { ...prev, commentCount: count } : prev));
    };

    const handleViewCount = (data) => {
      if (data.postId === postId) {
        dispatch(updatePostViews(data.views));
      }
    };

    const handleNewComment = (data) => {
      if (data.postId === postId) {
        setComments((prev) => {
          if (prev.some((c) => c._id === data.comment._id)) return prev;
          return [data.comment, ...prev];
        });
      }
    };

    socket.on("post-reaction-updated", handleReaction);
    socket.on("comment-count-updated", handleCommentCount);
    socket.on("viewCountUpdate", handleViewCount);
    socket.on("new-comment", handleNewComment);

    return () => {
      socket.off("post-reaction-updated", handleReaction);
      socket.off("comment-count-updated", handleCommentCount);
      socket.off("viewCountUpdate", handleViewCount);
      socket.off("new-comment", handleNewComment);
    };
  }, [postId, dispatch]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    const wasLiked = isLiked;
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    dispatch(syncPostLike({ postId, isLiked: !wasLiked }));
    try {
      await dispatch(toggleLike(postId)).unwrap();
    } catch {
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      dispatch(syncPostLike({ postId, isLiked: wasLiked }));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!content.trim() || sending) return;
    try {
      setSending(true);
      const res = await API.post(
        `/posts/comments/post/${postId}`,
        { content },
        { withCredentials: true },
      );
      setComments((prev) => {
        if (prev.some((c) => c._id === res.data.data._id)) return prev;
        return [res.data.data, ...prev];
      });
      setContent("");
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{SPV_CSS}</style>
        <div className="spv-root">
          <div className="spv-topbar">
            <div className="spv-back-btn"><IoArrowBack /></div>
            <div className="skeleton" style={{ height: 14, width: 60, borderRadius: 6 }} />
          </div>
          <div className="spv-body">
            {[1, 2].map((i) => (
              <div key={i} className="spv-post-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: 13, width: "35%", marginBottom: 7 }} />
                    <div className="skeleton" style={{ height: 10, width: "20%" }} />
                  </div>
                </div>
                <div className="skeleton" style={{ width: "100%", height: 280, borderRadius: 10 }} />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <>
        <style>{SPV_CSS}</style>
        <div className="spv-root" style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 48 }}>🔍</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--pluto-text-primary)", marginTop: 12 }}>Post not found</p>
          <button
            onClick={() => navigate(-1)}
            style={{ marginTop: 12, padding: "8px 20px", borderRadius: 10, background: "var(--pluto-accent-bg)", border: "1px solid var(--pluto-accent)", color: "var(--pluto-accent)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Go Back
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{SPV_CSS}</style>

      <div className="spv-root">
        <div className="spv-topbar">
          <button className="spv-back-btn" onClick={() => navigate(-1)}>
            <IoArrowBack />
          </button>
          <span className="spv-topbar-title">Post</span>
        </div>

        <div className="spv-body">
          <div className="spv-post-card">
            <div className="spv-post-header">
              {post.createdBy?.avatar ? (
                <img
                  src={post.createdBy.avatar}
                  className="spv-avatar"
                  onClick={() =>
                    post.createdBy._id === mydetails?._id
                      ? navigate("/profile")
                      : navigate(`/profile/${post.createdBy._id}`)
                  }
                  alt="avatar"
                />
              ) : (
                <RiAccountCircleFill
                  style={{ fontSize: 40, color: "var(--pluto-text-hint)", flexShrink: 0, cursor: "pointer" }}
                  onClick={() =>
                    post.createdBy._id === mydetails?._id
                      ? navigate("/profile")
                      : navigate(`/profile/${post.createdBy._id}`)
                  }
                />
              )}
              <div
                style={{ cursor: "pointer" }}
                onClick={() =>
                  post.createdBy._id === mydetails?._id
                    ? navigate("/profile")
                    : navigate(`/profile/${post.createdBy._id}`)
                }
              >
                <div className="spv-username">@{post.createdBy?.username}</div>
                <div className="spv-timestamp">{timeAgo(post.createdAt)}</div>
              </div>
            </div>

            <div className="spv-post-body">
              {post.title && <div className="spv-post-title">{post.title}</div>}
              {post.posturl && (
                <div className="spv-post-img-wrap">
                  <img src={post.posturl} alt="post" className="spv-post-img" />
                </div>
              )}
            </div>

            <div className="spv-actions">
              <button
                className={`spv-action-btn ${isLiked ? "liked" : ""}`}
                onClick={handleLike}
                disabled={likeLoading}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                <span>{likeCount}</span>
              </button>

              <div className="spv-action-sep" />

              <div className="spv-action-btn" style={{ cursor: "default" }}>
                <FaComment />
                <span>{post.commentCount ?? comments.length}</span>
              </div>

              <div className="spv-action-sep" />

              <div className="spv-action-btn" style={{ cursor: "default" }}>
                <FaEye />
                <span>{views}</span>
              </div>

              <div className="spv-action-sep" />

              <ShareButton
                contentId={postId}
                title={post?.title}
                initialCount={post?.shares || 0}
                type="post"
                className="spv-action-btn"
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="spv-comments-label">Comments · {comments.length}</div>

            {comments.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                <div style={{ fontSize: 14, color: "var(--pluto-text-secondary)" }}>No comments yet</div>
                <div style={{ fontSize: 13, color: "var(--pluto-text-hint)", marginTop: 4 }}>Be the first to comment!</div>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="spv-comment-row">
                  {c.user?.avatar ? (
                    <img src={c.user.avatar} className="spv-comment-avatar" alt="avatar" />
                  ) : (
                    <RiAccountCircleFill style={{ fontSize: 32, color: "var(--pluto-text-hint)", flexShrink: 0, marginTop: 2 }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="spv-comment-author">@{c.user?.username}</div>
                    <div className="spv-comment-text">{c.content}</div>
                    <div className="spv-comment-time">{timeAgo(c.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={commentsEndRef} />
          </div>
        </div>

        <div className="spv-comment-input-bar">
          <div className="spv-comment-input-wrap">
            {mydetails?.avatar ? (
              <img
                src={mydetails.avatar}
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                alt="avatar"
              />
            ) : (
              <RiAccountCircleFill style={{ fontSize: 32, color: "var(--pluto-text-hint)", flexShrink: 0 }} />
            )}
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Write a comment..."
              className="spv-comment-input"
            />
            <button
              className="spv-comment-send"
              onClick={handleAddComment}
              disabled={sending || !content.trim()}
            >
              {sending ? "..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SinglePostViewPage;
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { IoArrowBack } from "react-icons/io5";
import { RiAccountCircleFill } from "react-icons/ri";
import { FaHeart, FaRegHeart, FaComment, FaShareNodes } from "react-icons/fa6";
import { toggleLike, selectIsPostLiked } from "../slices/like.slice";
import { socket } from "../socket";

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

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
  const commentsEndRef = useRef(null);

  // ── Fetch post + comments ──────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/v1/posts/${postId}`, {
            withCredentials: true,
          }),
          axios.get(`http://localhost:8000/api/v1/comments/post/${postId}`, {
            withCredentials: true,
          }),
        ]);
        setPost(postRes.data?.data);
        setLikeCount(postRes.data?.data?.likes || 0);
        setComments(commentsRes.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [postId]);

  // ── Socket: real-time like + comment count ─────────────────────────
  useEffect(() => {
    socket.emit("join-post", `post:${postId}`);

    socket.on("post-reaction-updated", (data) => {
      if (data.postId === postId) setLikeCount(data.likes);
    });

    socket.on("comment-count-updated", ({ postId: pid, comments: count }) => {
      if (pid === postId)
        setPost((prev) => (prev ? { ...prev, commentCount: count } : prev));
    });

    return () => {
      socket.off("post-reaction-updated");
      socket.off("comment-count-updated");
    };
  }, [postId]);

  // ── Like toggle ────────────────────────────────────────────────────
  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    // Optimistic update
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    try {
      await dispatch(toggleLike(postId)).unwrap();
    } catch {
      // Revert on error
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
    } finally {
      setLikeLoading(false);
    }
  };

  // ── Add comment ────────────────────────────────────────────────────
  const handleAddComment = async () => {
    if (!content.trim() || sending) return;
    try {
      setSending(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/comments/post/${postId}`,
        { content },
        { withCredentials: true },
      );
      setComments((prev) => [res.data.data, ...prev]);
      setContent("");
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-gray-950 min-h-screen flex flex-col">
        <div className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-800 animate-pulse" />
          <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="max-w-lg mx-auto w-full px-4 py-4 flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-gray-800/50 rounded-2xl p-4 animate-pulse"
            >
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-1/3" />
                  <div className="h-2 bg-gray-700 rounded w-1/4" />
                </div>
              </div>
              <div className="w-full aspect-[4/5] bg-gray-700 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-gray-950 min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500">
        <div className="text-5xl">🔍</div>
        <p className="text-white font-bold text-lg">Post not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-600/30 text-blue-400 text-sm font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col pb-24">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition"
        >
          <IoArrowBack />
        </button>
        <span className="text-white font-bold text-base">Post</span>
      </div>

      <div className="max-w-lg mx-auto w-full px-4 py-4 flex flex-col gap-3">
        {/* ── Post Card ── */}
        <div className="bg-gray-800/60 rounded-2xl overflow-hidden border border-white/5">
          {/* Post Header */}
          <div className="flex items-center gap-3 p-4">
            {post.createdBy?.avatar ? (
              <img
                src={post.createdBy.avatar}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/40 cursor-pointer flex-shrink-0"
                onClick={() =>
                  post.createdBy._id === mydetails?._id
                    ? navigate("/profile")
                    : navigate(`/profile/${post.createdBy._id}`)
                }
              />
            ) : (
              <RiAccountCircleFill className="text-4xl text-gray-600 flex-shrink-0" />
            )}
            <div
              className="cursor-pointer"
              onClick={() =>
                post.createdBy._id === mydetails?._id
                  ? navigate("/profile")
                  : navigate(`/profile/${post.createdBy._id}`)
              }
            >
              <p className="text-white font-bold text-sm">
                @{post.createdBy?.username}
              </p>
              <p className="text-gray-500 text-xs">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            {post.title && (
              <p className="text-white/80 text-sm leading-relaxed mb-3">
                {post.title}
              </p>
            )}
            {post.posturl && (
              <div className="w-full rounded-xl overflow-hidden bg-black/30 flex items-center justify-center">
                <img
                  src={post.posturl}
                  alt="post"
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain block"
                />
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center border-t border-white/5 px-2 py-1">
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isLiked
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {isLiked ? <FaHeart /> : <FaRegHeart />}
              <span>{likeCount}</span>
            </button>

            <div className="w-px h-5 bg-white/5" />

            {/* Comment count */}
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500">
              <FaComment />
              <span>{post.commentCount ?? comments.length}</span>
            </div>

            <div className="w-px h-5 bg-white/5" />

            {/* Share */}
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition">
              <FaShareNodes />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* ── Comments Section ── */}
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-600 uppercase font-bold tracking-widest px-1">
            Comments · {comments.length}
          </p>

          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-400 text-sm">No comments yet</p>
              <p className="text-gray-600 text-xs mt-1">
                Be the first to comment!
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c._id}
                className="flex gap-3 p-3 rounded-2xl bg-gray-800/40 border border-white/5"
              >
                {c.user?.avatar ? (
                  <img
                    src={c.user.avatar}
                    className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0 mt-0.5"
                  />
                ) : (
                  <RiAccountCircleFill className="text-3xl text-gray-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs font-bold mb-1">
                    @{c.user?.username}
                  </p>
                  <p className="text-gray-400 text-sm leading-relaxed break-words">
                    {c.content}
                  </p>
                  <p className="text-gray-600 text-xs mt-1.5">
                    {timeAgo(c.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>
      </div>

      {/* ── Fixed Comment Input ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-950/95 backdrop-blur border-t border-white/5 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {mydetails?.avatar ? (
            <img
              src={mydetails.avatar}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <RiAccountCircleFill className="text-3xl text-gray-600 flex-shrink-0" />
          )}
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            placeholder="Write a comment..."
            className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2.5 outline-none border border-white/5 focus:border-blue-500/40 placeholder-gray-600"
          />
          <button
            onClick={handleAddComment}
            disabled={sending || !content.trim()}
            className="text-blue-400 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:text-blue-300 transition"
          >
            {sending ? "..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SinglePostViewPage;

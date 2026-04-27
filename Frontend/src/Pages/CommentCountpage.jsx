import API from "../utils/API.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../home/Navbar";

// ── Time formatter ────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

// ── Single Comment Card ───────────────────────────────────────────────
const CommentCard = ({ comment, type, onClick }) => {
  const target = type === "post" ? comment.post : comment.video;
  const targetTitle =
    target?.title || (type === "post" ? "Deleted Post" : "Deleted Video");
  const targetThumb = type === "video" ? target?.videourl : null;

  return (
    <div
      onClick={onClick}
      className="group flex items-start gap-3 p-4 rounded-2xl bg-gray-800/60 hover:bg-gray-700/70 border border-gray-700/40 hover:border-blue-500/30 cursor-pointer transition-all duration-200"
    >
      {/* Avatar */}
      <img
        src={
          comment.user?.avatar ||
          "https://ui-avatars.com/api/?name=User&background=1e293b&color=fff"
        }
        alt={comment.user?.username}
        className="h-9 w-9 rounded-full object-cover border border-gray-600 flex-shrink-0 mt-0.5"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Target title */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500 truncate">
            {type === "post" ? "📝" : "🎬"}{" "}
            {targetThumb ? "on video" : "on post"}:&nbsp;
            <span className="text-gray-400 font-medium">{targetTitle}</span>
          </span>
        </div>

        {/* Comment text */}
        <p className="text-sm text-white leading-relaxed line-clamp-2">
          {comment.content || comment.text || comment.comment}
        </p>

        {/* Time */}
        <p className="text-xs text-gray-500 mt-1.5">
          {timeAgo(comment.createdAt)}
        </p>
      </div>

      {/* Arrow */}
      <div className="text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────
const EmptyState = ({ type }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-4xl mb-3">{type === "post" ? "📝" : "🎬"}</div>
    <p className="text-gray-400 text-sm">No {type} comments yet</p>
    <p className="text-gray-600 text-xs mt-1">
      {type === "post"
        ? "Comment on a post to see it here"
        : "Comment on a video to see it here"}
    </p>
  </div>
);

// ── Skeleton Loader ───────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-800/40 border border-gray-700/30 animate-pulse">
    <div className="h-9 w-9 rounded-full bg-gray-700 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-700 rounded w-2/5" />
      <div className="h-4 bg-gray-700 rounded w-4/5" />
      <div className="h-3 bg-gray-700 rounded w-1/4" />
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────
function CommentCountpage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("post"); // "post" | "video"
  const [postComments, setPostComments] = useState([]);
  const [videoComments, setVideoComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState({ post: false, video: false });

  // ── Fetch on tab switch (lazy — only fetch once per tab) ──────────
  useEffect(() => {
    const fetchComments = async () => {
      if (fetched[activeTab]) return; // already fetched, skip

      try {
        setLoading(true);
        setError(null);

        if (activeTab === "post") {
          const res = await API.get(
            "/posts/comments/getAllpostCommnents",
            {
              withCredentials: true,
            },
          );
          setPostComments(res.data?.data || []);
        } else {
          const res = await API.get(
            "/videos/comments/getAllvideoComments",
            {
              withCredentials: true,
            },
          );
          setVideoComments(res.data?.data || []);
        }

        setFetched((prev) => ({ ...prev, [activeTab]: true }));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch comments");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [activeTab]);

  // ── Navigate to post/video page on comment click ──────────────────
  const handleCommentClick = (comment, type) => {
    if (type === "post" && comment.post?._id) {
      navigate(`/post/${comment.post._id}`);
    } else if (type === "video" && comment.video?._id) {
      navigate(`/video/${comment.video._id}`);
    }
  };

  const activeComments = activeTab === "post" ? postComments : videoComments;

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* ── Header ── */}
        <div>
          <h1 className="text-white text-xl font-bold">My Comments</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            All your comments in one place
          </p>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="flex bg-gray-800/60 rounded-2xl p-1 gap-1">
          {[
            { key: "post", label: "Post Comments", emoji: "📝" },
            { key: "video", label: "Video Comments", emoji: "🎬" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              {/* Comment count badge */}
              {tab.key === "post" &&
                fetched.post &&
                postComments.length > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === "post" ? "bg-white/20" : "bg-gray-700"}`}
                  >
                    {postComments.length}
                  </span>
                )}
              {tab.key === "video" &&
                fetched.video &&
                videoComments.length > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === "video" ? "bg-white/20" : "bg-gray-700"}`}
                  >
                    {videoComments.length}
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* ── Comments List ── */}
        <div className="flex flex-col gap-2">
          {/* Loading */}
          {loading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-sm text-red-400 bg-red-600/10 border border-red-600/20 rounded-2xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            fetched[activeTab] &&
            activeComments.length === 0 && <EmptyState type={activeTab} />}

          {/* Comment cards */}
          {!loading &&
            !error &&
            activeComments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                type={activeTab}
                onClick={() => handleCommentClick(comment, activeTab)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default CommentCountpage;

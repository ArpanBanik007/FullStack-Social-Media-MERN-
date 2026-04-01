import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../home/Navbar";

import {
  fetchMyLikes,
  selectLikedPosts,
  selectLikedStatus,
  selectTotalLikes,
} from "../slices/like.slice";

import {
  fetchMyVideoLikes,
  selectLikedVideos,
  selectVideoLikeStatus,
  selectTotalVideoLikes,
} from "../slices/video.like.slice";

// ── Time formatter ─────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
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

// ── Like Card ──────────────────────────────────────────────────────────
const LikeCard = ({ item, type, onClick }) => {
  const title =
    type === "post"
      ? item.title || item.content?.slice(0, 60) || "Untitled Post"
      : item.title || "Untitled Video";

  const thumb =
    type === "post"
      ? item.image || item.posturl || null
      : item.thumbnail || item.videourl || null;

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-3 p-4 rounded-2xl bg-gray-800/60 hover:bg-gray-700/70 border border-gray-700/40 hover:border-blue-500/30 cursor-pointer transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
        {thumb ? (
          <img src={thumb} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xl">
            {type === "post" ? "📝" : "🎬"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-red-400 text-xs">❤️ Liked</span>
          {item.createdAt && (
            <span className="text-gray-500 text-xs">
              · {timeAgo(item.createdAt)}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0">
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

// ── Skeleton ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-800/40 border border-gray-700/30 animate-pulse">
    <div className="h-12 w-12 rounded-xl bg-gray-700 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-3/5" />
      <div className="h-3 bg-gray-700 rounded w-1/4" />
    </div>
  </div>
);

// ── Empty State ────────────────────────────────────────────────────────
const EmptyState = ({ type }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-4xl mb-3">{type === "post" ? "📝" : "🎬"}</div>
    <p className="text-gray-400 text-sm">No liked {type}s yet</p>
    <p className="text-gray-600 text-xs mt-1">
      {type === "post"
        ? "Like a post to see it here"
        : "Like a video to see it here"}
    </p>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────
function LikeCountpage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("post");
  const [fetched, setFetched] = useState({ post: false, video: false });

  // ── Selectors ──
  const likedPosts = useSelector(selectLikedPosts);
  const postStatus = useSelector(selectLikedStatus);
  const totalPostLikes = useSelector(selectTotalLikes);

  const likedVideos = useSelector(selectLikedVideos);
  const videoStatus = useSelector(selectVideoLikeStatus);
  const totalVideoLikes = useSelector(selectTotalVideoLikes);

  const isLoading =
    (activeTab === "post" && postStatus === "loading") ||
    (activeTab === "video" && videoStatus === "loading");

  const error =
    activeTab === "post" ? postStatus === "failed" : videoStatus === "failed";

  // ── Fetch on tab switch (lazy) ──
  useEffect(() => {
    if (fetched[activeTab]) return;

    if (activeTab === "post") {
      dispatch(fetchMyLikes()).then(() =>
        setFetched((p) => ({ ...p, post: true })),
      );
    } else {
      dispatch(fetchMyVideoLikes()).then(() =>
        setFetched((p) => ({ ...p, video: true })),
      );
    }
  }, [activeTab]);

  // ── Navigate on click ──
  const handleClick = (item, type) => {
    if (type === "post" && item._id) navigate(`/posts/${item._id}`);
    else if (type === "video" && item._id) navigate(`/videoss/${item._id}`);
  };

  const activeItems = activeTab === "post" ? likedPosts : likedVideos;
  const activeTotal = activeTab === "post" ? totalPostLikes : totalVideoLikes;

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* ── Header ── */}
        <div>
          <h1 className="text-white text-xl font-bold">My Likes</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Everything you've liked
          </p>
        </div>

        {/* ── Tab Switcher ── */}
        <div className="flex bg-gray-800/60 rounded-2xl p-1 gap-1">
          {[
            {
              key: "post",
              label: "Post Likes",
              emoji: "📝",
              total: totalPostLikes,
            },
            {
              key: "video",
              label: "Video Likes",
              emoji: "🎬",
              total: totalVideoLikes,
            },
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
              {fetched[tab.key] && tab.total > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? "bg-white/20" : "bg-gray-700"
                  }`}
                >
                  {tab.total}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── List ── */}
        <div className="flex flex-col gap-2">
          {isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {!isLoading && error && (
            <div className="text-sm text-red-400 bg-red-600/10 border border-red-600/20 rounded-2xl px-4 py-3 text-center">
              Failed to load. Please try again.
            </div>
          )}

          {!isLoading &&
            !error &&
            fetched[activeTab] &&
            activeItems.length === 0 && <EmptyState type={activeTab} />}

          {!isLoading &&
            !error &&
            activeItems.map((item) => (
              <LikeCard
                key={item._id}
                item={item}
                type={activeTab}
                onClick={() => handleClick(item, activeTab)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default LikeCountpage;

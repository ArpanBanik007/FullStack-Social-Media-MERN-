import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWatchHistory,
  deleteAllWatchHistory,
  deleteWatchHistoryById,
} from "../slices/watchHistory.slice";
import Navbar from "../home/Navbar";
import LeftBar from "../home/LeftBar";
import { RiDeleteBin7Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import { MdVideoLibrary, MdGridOn } from "react-icons/md";
import { HiPhotograph } from "react-icons/hi";

function HistoryPage() {
  const dispatch = useDispatch();
  const { historyItems, status } = useSelector((state) => state.watchHistory);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "videos" | "posts"

  useEffect(() => {
    dispatch(fetchWatchHistory({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handleDeleteAll = () => {
    dispatch(deleteAllWatchHistory());
    setShowConfirm(false);
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(deleteWatchHistoryById(id));
  };

  const videoItems = historyItems?.filter((item) => !!item.videoId) || [];
  const postItems = historyItems?.filter((item) => !!item.postId) || [];

  const displayItems =
    activeTab === "videos"
      ? videoItems
      : activeTab === "posts"
        ? postItems
        : historyItems?.filter((item) => !!item.videoId || !!item.postId) || [];

  const tabs = [
    {
      id: "all",
      label: "All",
      icon: <MdGridOn />,
      count: (historyItems?.filter((i) => !!i.videoId || !!i.postId) || [])
        .length,
    },
    {
      id: "videos",
      label: "Videos",
      icon: <MdVideoLibrary />,
      count: videoItems.length,
    },
    {
      id: "posts",
      label: "Posts",
      icon: <HiPhotograph />,
      count: postItems.length,
    },
  ];

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="bg-gray-950 flex flex-col min-h-screen overflow-x-hidden"
    >
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .tab-active {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #fff;
          box-shadow: 0 0 20px rgba(37,99,235,0.35);
        }
        .tab-inactive {
          background: rgba(255,255,255,0.04);
          color: #9ca3af;
        }
        .tab-inactive:hover {
          background: rgba(255,255,255,0.08);
          color: #e5e7eb;
        }
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.5);
        }
        .delete-btn {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .card-hover:hover .delete-btn {
          opacity: 1;
        }
        .badge-video {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
        }
        .badge-post {
          background: linear-gradient(135deg, #059669, #0891b2);
        }
        .confirm-overlay {
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .section-divider {
          height: 2px;
          background: linear-gradient(90deg, #2563eb22, #2563eb88, #2563eb22);
          border-radius: 999px;
        }
      `}</style>

      <Navbar />
      <LeftBar />

      <div className="w-[70%] ml-[28%] px-6 py-5 relative">
        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Watch History
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {
                (historyItems?.filter((i) => !!i.videoId || !!i.postId) || [])
                  .length
              }{" "}
              items watched
            </p>
          </div>
          {(historyItems?.filter((i) => !!i.videoId || !!i.postId) || [])
            .length > 0 && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-white/5 transition-all duration-200"
            >
              <RiDeleteBin7Line className="text-lg" />
              Clear All
            </button>
          )}
        </div>

        {/* ── Confirm Dialog ── */}
        {showConfirm && (
          <div className="confirm-overlay absolute top-20 right-6 bg-gray-900 border border-white/10 text-gray-100 rounded-2xl shadow-2xl p-5 w-72 z-50">
            <p className="text-center font-semibold mb-1">Clear all history?</p>
            <p className="text-center text-gray-500 text-xs mb-5">
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAll}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl text-sm font-semibold transition"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-2 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id ? "tab-active" : "tab-inactive"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {status === "loading" ? (
          /* Skeleton */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-700/50" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-700/50 rounded w-3/4" />
                  <div className="h-3 bg-gray-700/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600">
            <MdVideoLibrary className="text-6xl mb-4 opacity-30" />
            <p className="text-lg font-medium">No history yet</p>
            <p className="text-sm mt-1 opacity-60">
              {activeTab === "videos"
                ? "Videos you watch will appear here"
                : activeTab === "posts"
                  ? "Posts you view will appear here"
                  : "Content you watch will appear here"}
            </p>
          </div>
        ) : activeTab === "all" ? (
          /* ── ALL TAB: দুই section আলাদা ── */
          <div className="space-y-10">
            {/* Videos Section */}
            {videoItems.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <MdVideoLibrary className="text-blue-500 text-xl" />
                    <h2 className="text-white font-semibold text-lg">Videos</h2>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {videoItems.length}
                    </span>
                  </div>
                  <div className="flex-1 section-divider" />
                </div>
                <HistoryGrid items={videoItems} onDelete={handleDelete} />
              </div>
            )}

            {/* Posts Section */}
            {postItems.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <HiPhotograph className="text-emerald-500 text-xl" />
                    <h2 className="text-white font-semibold text-lg">Posts</h2>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                      {postItems.length}
                    </span>
                  </div>
                  <div className="flex-1 section-divider" />
                </div>
                <HistoryGrid items={postItems} onDelete={handleDelete} />
              </div>
            )}
          </div>
        ) : (
          /* ── FILTERED TAB ── */
          <HistoryGrid items={displayItems} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}

/* ── Card Grid Component ── */
function HistoryGrid({ items, onDelete }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map((item) => {
        const isVideo = !!item.videoId;
        const isPost = !!item.postId;

        let mediaUrl = "";
        let itemTitle = "Untitled";

        if (isVideo) {
          mediaUrl = item.videoId?.videoUrl;
          itemTitle = item.videoId?.title || "Video";
        } else if (isPost) {
          mediaUrl = item.postId?.images?.[0] || item.postId?.posturl;
          itemTitle =
            item.postId?.title ||
            item.postId?.content?.substring(0, 40) + "..." ||
            "Post";
        }

        const linkTo = isVideo
          ? `/video/single/${item.videoId?._id}`
          : `/post/single/${item.postId?._id}`;

        return (
          <Link
            to={linkTo}
            key={item._id}
            className="card-hover bg-gray-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col group"
          >
            {/* Media */}
            <div className="relative aspect-video bg-black w-full overflow-hidden">
              {isVideo ? (
                <video
                  src={mediaUrl}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={itemTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x225/111827/374151?text=No+Media";
                  }}
                />
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              {/* Badge */}
              <span
                className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs text-white font-semibold ${
                  isVideo ? "badge-video" : "badge-post"
                }`}
              >
                {isVideo ? "Video" : "Post"}
              </span>

              {/* Delete button — hover-এ দেখাবে */}
              <button
                onClick={(e) => onDelete(e, item._id)}
                className="delete-btn absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600/80 text-white transition-colors"
                title="Remove from history"
              >
                <RiDeleteBin7Line className="text-sm" />
              </button>
            </div>

            {/* Title */}
            <div className="p-3">
              <p className="text-gray-200 text-sm font-medium truncate group-hover:text-blue-400 transition-colors">
                {itemTitle}
              </p>
              <p className="text-gray-600 text-xs mt-0.5">
                {isVideo ? "Video" : "Post"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default HistoryPage;

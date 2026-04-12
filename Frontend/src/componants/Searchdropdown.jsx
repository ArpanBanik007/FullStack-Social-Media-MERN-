import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  selectSearchResults,
  selectSearchStatus,
  closeSearch,
} from "../slices/Search.slice";
import { FiUser, FiImage, FiVideo } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";

function SearchDropdown() {
  const dispatch = useDispatch();
  const results = useSelector(selectSearchResults);
  const status = useSelector(selectSearchStatus);

  const { users = [], posts = [], videos = [] } = results;
  const totalResults = users.length + posts.length + videos.length;

  const handleClose = () => dispatch(closeSearch());

  // ── Loading State ──────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-6 flex items-center justify-center gap-2">
        <BiLoaderAlt className="animate-spin text-blue-500 text-xl" />
        <span className="text-gray-400 text-sm">Searching...</span>
      </div>
    );
  }

  // ── No Results ─────────────────────────────────────────────────────────────
  if (status === "succeeded" && totalResults === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-6 text-center">
        <p className="text-gray-500 text-sm">No results found</p>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (status !== "succeeded") return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[480px] overflow-y-auto custom-scroll">
      {/* ── Users Section ── */}
      {users.length > 0 && (
        <div>
          <SectionHeader
            icon={<FiUser />}
            label="People"
            count={users.length}
          />
          {users.map((user) => (
            <Link
              key={user._id}
              to={`/profile/${user._id}`}
              onClick={handleClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <img
                src={user.avatar || "https://via.placeholder.com/40?text=U"}
                alt={user.username}
                className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-gray-200 text-sm font-semibold truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-gray-500 text-xs truncate">
                  @{user.username}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Posts Section ── */}
      {posts.length > 0 && (
        <div>
          <SectionHeader
            icon={<FiImage />}
            label="Posts"
            count={posts.length}
          />
          {posts.map((post) => {
            const thumb = post.images?.[0] || post.posturl;
            return (
              <Link
                key={post._id}
                to={`/post/single/${post._id}`}
                onClick={handleClose}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <FiImage />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-gray-200 text-sm font-semibold truncate">
                    {post.title ||
                      post.content?.substring(0, 40) + "..." ||
                      "Post"}
                  </p>
                  {post.createdBy && (
                    <p className="text-gray-500 text-xs truncate">
                      @{post.createdBy.username}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Videos Section ── */}
      {videos.length > 0 && (
        <div>
          <SectionHeader
            icon={<FiVideo />}
            label="Videos"
            count={videos.length}
          />
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/video/single/${video._id}`}
              onClick={handleClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-12 h-9 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <FiVideo />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-gray-200 text-sm font-semibold truncate">
                  {video.title || "Video"}
                </p>
                {video.createdBy && (
                  <p className="text-gray-500 text-xs truncate">
                    @{video.createdBy.username}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label, count }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-white/5 first:border-t-0">
      <span className="text-gray-500 text-xs">{icon}</span>
      <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xs text-gray-600 bg-white/5 px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}

export default SearchDropdown;

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
  const status  = useSelector(selectSearchStatus);

  const { users = [], posts = [], videos = [] } = results;
  const totalResults = users.length + posts.length + videos.length;

  const handleClose = () => dispatch(closeSearch());

  /* ── Shared dropdown shell style ── */
  const shellStyle = {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: "var(--pluto-bg-card)",
    border: "1px solid var(--pluto-border)",
    borderRadius: 14,
    boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
    zIndex: 999,
    overflow: "hidden",
  };

  /* ── Loading ── */
  if (status === "loading") {
    return (
      <div style={{ ...shellStyle, padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <BiLoaderAlt style={{ fontSize: 18, color: "var(--pluto-accent)", animation: "spin 0.8s linear infinite" }} />
        <span style={{ fontSize: 14, color: "var(--pluto-text-secondary)" }}>Searching…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── No results ── */
  if (status === "succeeded" && totalResults === 0) {
    return (
      <div style={{ ...shellStyle, padding: "20px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "var(--pluto-text-hint)", margin: 0 }}>No results found</p>
      </div>
    );
  }

  if (status !== "succeeded") return null;

  return (
    <>
      <style>{`
        .sd-shell {
          max-height: 460px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--pluto-border) transparent;
        }
        .sd-shell::-webkit-scrollbar { width: 4px; }
        .sd-shell::-webkit-scrollbar-thumb { background: var(--pluto-border); border-radius: 999px; }

        /* Section header */
        .sd-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px 6px;
          border-top: 1px solid var(--pluto-border);
        }
        .sd-section-header:first-child { border-top: none; }
        .sd-section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--pluto-text-hint);
        }
        .sd-section-count {
          font-size: 11px;
          color: var(--pluto-text-hint);
          background: var(--pluto-bg-input);
          padding: 1px 7px;
          border-radius: 999px;
        }

        /* Result row */
        .sd-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .sd-row:hover {
          background: var(--pluto-bg-hover);
        }

        /* User avatar */
        .sd-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--pluto-border);
          flex-shrink: 0;
          display: block;
        }

        /* Post / video thumbnail */
        .sd-thumb {
          flex-shrink: 0;
          background: var(--pluto-bg-input);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--pluto-border);
        }
        .sd-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .sd-thumb-icon {
          font-size: 16px;
          color: var(--pluto-text-hint);
        }

        .sd-info-primary {
          font-size: 14px;
          font-weight: 600;
          color: var(--pluto-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sd-info-secondary {
          font-size: 12px;
          color: var(--pluto-text-hint);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }
      `}</style>

      <div style={shellStyle}>
        <div className="sd-shell">

          {/* ── People ── */}
          {users.length > 0 && (
            <div>
              <div className="sd-section-header">
                <FiUser style={{ fontSize: 12, color: "var(--pluto-text-hint)" }} />
                <span className="sd-section-label">People</span>
                <span className="sd-section-count">{users.length}</span>
              </div>
              {users.map((user) => (
                <Link
                  key={user._id}
                  to={`/profile/${user._id}`}
                  onClick={handleClose}
                  className="sd-row"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=1a2235&color=22d3ee`}
                    alt={user.username}
                    className="sd-avatar"
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className="sd-info-primary">{user.fullName || user.username}</div>
                    <div className="sd-info-secondary">@{user.username}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ── Posts ── */}
          {posts.length > 0 && (
            <div>
              <div className="sd-section-header">
                <FiImage style={{ fontSize: 12, color: "var(--pluto-text-hint)" }} />
                <span className="sd-section-label">Posts</span>
                <span className="sd-section-count">{posts.length}</span>
              </div>
              {posts.map((post) => {
                const thumb = post.images?.[0] || post.posturl;
                return (
                  <Link
                    key={post._id}
                    to={`/post/single/${post._id}`}
                    onClick={handleClose}
                    className="sd-row"
                  >
                    <div className="sd-thumb" style={{ width: 44, height: 44 }}>
                      {thumb ? (
                        <img src={thumb} alt="" onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <FiImage className="sd-thumb-icon" />
                      )}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="sd-info-primary">
                        {post.title || post.content?.substring(0, 40) + "…" || "Post"}
                      </div>
                      {post.createdBy && (
                        <div className="sd-info-secondary">@{post.createdBy.username}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* ── Videos ── */}
          {videos.length > 0 && (
            <div>
              <div className="sd-section-header">
                <FiVideo style={{ fontSize: 12, color: "var(--pluto-text-hint)" }} />
                <span className="sd-section-label">Videos</span>
                <span className="sd-section-count">{videos.length}</span>
              </div>
              {videos.map((video) => (
                <Link
                  key={video._id}
                  to={`/video/single/${video._id}`}
                  onClick={handleClose}
                  className="sd-row"
                >
                  <div className="sd-thumb" style={{ width: 48, height: 36 }}>
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt="" />
                    ) : (
                      <FiVideo className="sd-thumb-icon" />
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="sd-info-primary">{video.title || "Video"}</div>
                    {video.createdBy && (
                      <div className="sd-info-secondary">@{video.createdBy.username}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default SearchDropdown;

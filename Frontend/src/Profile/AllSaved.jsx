import API from "../utils/API.js";
import React, { useEffect, useState, useRef } from "react";

import { PiDotsThreeBold } from "react-icons/pi";
import { MdDelete } from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AllSaved = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await API.get(
          "/watch/watchlater",
          { withCredentials: true },
        );
        setSavedItems(res.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch saved items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemoveWatchLater = async (savedItemId) => {
    try {
      await API.delete("/watch/watchlater", {
        data: { savedItemId },
        withCredentials: true,
      });
      setSavedItems((prev) => prev.filter((item) => item._id !== savedItemId));
      setOpenMenuId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClick = (item) => {
    if (item.postId?._id) navigate(`/post/${item.postId._id}`);
    else if (item.videoId?._id) navigate(`/video/comments/${item.videoId._id}`);
  };

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');
          @keyframes shimS { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          .skS { background:linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%); background-size:400px 100%; animation:shimS 1.3s infinite linear; border-radius:12px; }
        `}</style>
        <div style={{ fontFamily: "'Syne',sans-serif" }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: "linear-gradient(160deg,#1e293b,#0f172a)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 18,
                overflow: "hidden",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 11,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <div
                  className="skS"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skS"
                    style={{ height: 12, width: "50%", marginBottom: 8 }}
                  />
                  <div className="skS" style={{ height: 10, width: "28%" }} />
                </div>
              </div>
              <div
                className="skS"
                style={{ margin: "0 14px 14px", height: 190, borderRadius: 14 }}
              />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (savedItems.length === 0) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');`}</style>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            textAlign: "center",
            padding: "50px 20px",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 10 }}>🔖</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            Nothing saved yet
          </div>
          <div style={{ fontSize: 12 }}>
            Save posts and videos to watch later
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        @keyframes menuInS { from{opacity:0;transform:translateY(-6px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }

        .sv-card {
          font-family: 'Syne', sans-serif;
          position: relative;
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 14px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .sv-card:hover { box-shadow:0 8px 36px rgba(0,0,0,0.45); transform:translateY(-1px); }

        .sv-header { display:flex; align-items:center; gap:11px; padding:14px 14px 10px; }

        .sv-avatar {
          width:40px; height:40px; border-radius:50%; object-fit:cover;
          border:2px solid rgba(6,182,212,0.3); flex-shrink:0;
        }

        .sv-username { font-size:13px; font-weight:700; color:rgba(255,255,255,0.85); }

        .sv-type-badge {
          display:inline-flex; align-items:center; gap:4px;
          font-size:10px; font-weight:700; letter-spacing:0.06em;
          padding:3px 8px; border-radius:6px; margin-top:4px;
        }
        .sv-type-badge.post { background:rgba(6,182,212,0.12); color:#06b6d4; border:1px solid rgba(6,182,212,0.2); }
        .sv-type-badge.video { background:rgba(168,85,247,0.12); color:#a855f7; border:1px solid rgba(168,85,247,0.2); }

        .sv-dots {
          margin-left:auto; width:32px; height:32px; border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          font-size:20px; cursor:pointer; color:rgba(255,255,255,0.3);
          transition:background 0.2s, color 0.2s;
        }
        .sv-dots:hover { background:rgba(255,255,255,0.07); color:rgba(255,255,255,0.75); }

        .sv-body { padding:0 14px 14px; cursor:pointer; }
        .sv-title { font-size:13px; font-weight:600; color:rgba(255,255,255,0.75); margin-bottom:10px; line-height:1.5; }

        .sv-media-wrap {
          position:relative; width:100%; border-radius:14px; overflow:hidden;
          padding-top:56.25%;
        }
        .sv-media-wrap img,
        .sv-media-wrap video {
          position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block;
        }
        .sv-media-overlay {
          position:absolute; inset:0;
          background:linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%);
        }
        .sv-play-icon {
          position:absolute; top:50%; left:50%;
          transform:translate(-50%,-50%);
          width:44px; height:44px; border-radius:50%;
          background:rgba(255,255,255,0.15); backdrop-filter:blur(4px);
          border:1px solid rgba(255,255,255,0.3);
          display:flex; align-items:center; justify-content:center;
          font-size:16px; color:#fff;
        }

        .sv-menu {
          position:absolute; top:52px; right:12px; z-index:50;
          background:linear-gradient(160deg,#1e293b,#0f172a);
          border:1px solid rgba(255,255,255,0.08); border-radius:14px;
          padding:6px; width:160px;
          box-shadow:0 12px 40px rgba(0,0,0,0.5);
          animation:menuInS 0.18s ease;
        }
        .sv-menu-item {
          display:flex; align-items:center; gap:10px; padding:9px 12px;
          border-radius:10px; font-size:13px; font-weight:600; font-family:'Syne',sans-serif;
          cursor:pointer; border:none; background:transparent; width:100%; text-align:left;
          color:#f87171; transition:background 0.15s;
        }
        .sv-menu-item:hover { background:rgba(239,68,68,0.1); }
      `}</style>

      <div>
        {savedItems.map((item) => {
          const post = item.postId;
          const video = item.videoId;
          const createdBy = post?.createdBy || video?.createdBy;
          const isVideo = !!video;

          const videoSrc = video?.videourl
            ?.replace("http://", "https://")
            ?.replace("/upload/", "/upload/f_mp4,vc_h264/");

          return (
            <div key={item._id} className="sv-card">
              <div className="sv-header">
                <img
                  src={createdBy?.avatar || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className="sv-avatar"
                />
                <div>
                  <div className="sv-username">
                    @{createdBy?.username || "Unknown"}
                  </div>
                  <span
                    className={`sv-type-badge ${isVideo ? "video" : "post"}`}
                  >
                    {isVideo ? "🎬 VIDEO" : "📷 POST"}
                  </span>
                </div>
                <div
                  className="sv-dots"
                  onClick={() =>
                    setOpenMenuId(openMenuId === item._id ? null : item._id)
                  }
                >
                  <PiDotsThreeBold />
                </div>
              </div>

              <div className="sv-body" onClick={() => handleClick(item)}>
                {(post?.title || video?.title) && (
                  <p className="sv-title">{post?.title || video?.title}</p>
                )}

                {post?.posturl && (
                  <div className="sv-media-wrap">
                    <img src={post.posturl} alt="post" />
                    <div className="sv-media-overlay" />
                  </div>
                )}

                {video && (
                  <div className="sv-media-wrap">
                    <video src={`${videoSrc}#t=0.1`} preload="metadata" muted />
                    <div className="sv-media-overlay" />
                    <div className="sv-play-icon">
                      <FaPlay />
                    </div>
                  </div>
                )}
              </div>

              {openMenuId === item._id && (
                <div className="sv-menu" ref={menuRef}>
                  <button
                    className="sv-menu-item"
                    onClick={() => handleRemoveWatchLater(item._id)}
                  >
                    <MdDelete style={{ fontSize: 16 }} /> Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default AllSaved;

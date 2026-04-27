import API from "../utils/API.js";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; // ✅ একবারই

import { FaBookmark, FaPlay } from "react-icons/fa";
import { FaEye } from "react-icons/fa"; // ✅ নতুন
import {
  FaComment,
  FaShareNodes,
  FaVolumeXmark,
  FaVolumeHigh,
} from "react-icons/fa6";
import { RiAccountCircleFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../socket";
import { addVideoView, updateVideoViews } from "../slices/videoView.slice";
import VideoLikeButton from "../componants/VideoLikeButton";
import { syncVideoLike } from "../slices/video.like.slice";
import FollowButton from "../componants/FollowButton";
import { fetchMyFollowings } from "../slices/follow.slice";

function VideoPlayer() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const videoRefs = useRef([]);
  const viewedVideos = useRef(new Set()); // ✅ duplicate view রোখে
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mydetails } = useSelector((state) => state.mydetails);
  const followings = useSelector((state) => state.follow.followings);

  useEffect(() => {
    dispatch(fetchMyFollowings());
  }, [dispatch]);

  // ── Videos fetch ───────────────────────────────────────
  useEffect(() => {
    const fetchFeedVideos = async () => {
      try {
        const res = await API.get(
          "/videos/feed",
          { withCredentials: true },
        );
        const fetchedVideos = res.data?.data?.videos || [];
        setVideos(fetchedVideos);
        fetchedVideos.forEach((v) => {
          if (v.userLiked !== undefined) {
            dispatch(syncVideoLike({ videoId: v._id, isLiked: v.userLiked }));
          }
        });
        if (fetchedVideos.length > 0)
          navigate(`/videos/${fetchedVideos[0]._id}`, { replace: true });
      } catch (err) {
        console.error("Video fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedVideos();
  }, []);

  // ── Socket room join ───────────────────────────────────
  useEffect(() => {
    if (!videos.length) return;
    const socket = connectSocket();
    videos.forEach((video) => socket.emit("join-video", `video:${video._id}`));
  }, [videos.length]);

  // ── Socket: like update ────────────────────────────────
  useEffect(() => {
    const socket = connectSocket();
    const handleReactionUpdate = (data) => {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId
            ? {
                ...v,
                likes: data.likes,
                userLiked:
                  data.userLiked !== undefined ? data.userLiked : v.userLiked,
              }
            : v,
        ),
      );
    };
    socket.on("video-reaction-updated", handleReactionUpdate);
    return () => socket.off("video-reaction-updated", handleReactionUpdate);
  }, []);

  // ── Socket: comment count update ───────────────────────
  useEffect(() => {
    const socket = connectSocket();
    const handleCommentCountUpdate = ({ videoId, comments }) => {
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, comments } : v)),
      );
    };
    socket.on("comment-count-updated", handleCommentCountUpdate);
    return () => socket.off("comment-count-updated", handleCommentCountUpdate);
  }, []);

  // ── Socket: view count update ✅ নতুন ─────────────────
  useEffect(() => {
    const socket = connectSocket();
    const handleViewCount = (data) => {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId ? { ...v, views: data.views } : v,
        ),
      );
    };
    socket.on("viewCountUpdate", handleViewCount);
    return () => socket.off("viewCountUpdate", handleViewCount);
  }, []);

  // ── Save video ─────────────────────────────────────────
  const handleSaveVideo = async (videoId) => {
    try {
      await API.post(
        "/watch/watchlater",
        { videoId },
        { withCredentials: true },
      );
      setSavedIds((prev) => new Set([...prev, videoId]));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Autoplay Observer ──────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoEl = entry.target;
          const index = videoRefs.current.indexOf(videoEl);

          if (entry.isIntersecting) {
            // অন্য সব video pause করো
            videoRefs.current.forEach((v) => {
              if (v && v !== videoEl) v.pause();
            });
            videoEl.muted = isMuted;
            videoEl.play().catch(() => {});
            setPlayingIndex(index);
            if (videos[index])
              navigate(`/videos/${videos[index]._id}`, { replace: true });
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: 0.65 },
    );

    videoRefs.current.forEach((v) => {
      if (v) observer.observe(v);
    });
    return () => observer.disconnect();
  }, [videos, isMuted]);

  // ── View Observer ✅ নতুন — আলাদা observer ────────────
  useEffect(() => {
    if (!videos.length) return;

    const viewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const videoId = entry.target.dataset.videoid;
          if (!videoId) return;

          // আগে দেখা হয়ে থাকলে skip করো
          if (viewedVideos.current.has(videoId)) return;

          // Lock করো — duplicate হবে না
          viewedVideos.current.add(videoId);

          // API call — view save করো
          dispatch(addVideoView(videoId));
        });
      },
      { threshold: 0.5 }, // 50% দেখা গেলে trigger
    );

    // সব video slide observe করো
    document.querySelectorAll("[data-videoid]").forEach((el) => {
      viewObserver.observe(el);
    });

    return () => viewObserver.disconnect();
  }, [videos, dispatch]);

  // ── Play/Pause toggle ──────────────────────────────────
  const handlePlayPause = (index) => {
    const videoEl = videoRefs.current[index];
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      setPlayingIndex(index);
    } else {
      videoEl.pause();
      setPlayingIndex(null);
    }
  };

  // ── Mute toggle ────────────────────────────────────────
  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRefs.current.forEach((v) => {
      if (v) v.muted = newMuted;
    });
  };

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes pulseVP { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        `}</style>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: "#0f172a",
            fontFamily: "'Syne',sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "3px solid rgba(6,182,212,0.2)",
                borderTopColor: "#06b6d4",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Loading reels
            </span>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </>
    );
  }

  if (videos.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0f172a",
          fontFamily: "'Syne',sans-serif",
          flexDirection: "column",
          gap: 12,
          color: "rgba(255,255,255,0.25)",
        }}
      >
        <div style={{ fontSize: 48 }}>🎬</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>No videos yet</div>
        <div style={{ fontSize: 13 }}>Check back later</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        .vp-root {
          display: flex; align-items: center; justify-content: center;
          height: 100vh;
          background: radial-gradient(ellipse at center, #111827 0%, #0f172a 100%);
          font-family: 'Syne', sans-serif;
        }
        .vp-phone {
          position: relative; width: 100%; max-width: 400px; height: 92vh;
          background: #000; border-radius: 28px; overflow: hidden;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 32px 80px rgba(0,0,0,0.7);
        }
        .vp-scroll {
          height: 100%; overflow-y: scroll; scroll-snap-type: y mandatory; scrollbar-width: none;
        }
        .vp-scroll::-webkit-scrollbar { display: none; }
        .vp-controls {
          position: absolute; top: 0; left: 0; right: 0; z-index: 30;
          padding: 16px 16px 0;
          display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%);
          pointer-events: none;
        }
        .vp-controls-title {
          font-size: 15px; font-weight: 800; color: rgba(255,255,255,0.9); letter-spacing: 0.02em;
        }
        .vp-mute-btn {
          pointer-events: all; width: 36px; height: 36px; border-radius: 50%;
          background: rgba(0,0,0,0.4); backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 16px; cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .vp-mute-btn:hover { background: rgba(0,0,0,0.6); transform: scale(1.08); }
        .vp-slide {
          height: 100%; scroll-snap-align: start; position: relative;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .vp-slide video { height: 100%; width: 100%; object-fit: cover; display: block; }
        .vp-play-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center; pointer-events: none;
        }
        .vp-play-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
          border: 2px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; color: #fff; transition: opacity 0.2s;
        }
        .vp-bottom-grad {
          position: absolute; bottom: 0; left: 0; right: 0; height: 55%;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%);
          pointer-events: none;
        }
        .vp-info {
          position: absolute; bottom: 80px; left: 14px; max-width: 62%; color: #fff;
        }
        .vp-user-row {
          display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer;
        }
        .vp-avatar {
          width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
          border: 2px solid rgba(255,255,255,0.4); flex-shrink: 0;
        }
        .vp-username { font-size: 13px; font-weight: 700; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }
        .vp-title {
          font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.75);
          line-height: 1.5; text-shadow: 0 1px 4px rgba(0,0,0,0.6);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .vp-actions {
          position: absolute; right: 12px; bottom: 80px;
          display: flex; flex-direction: column; gap: 20px; align-items: center;
        }
        .vp-action-btn {
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          color: #fff; background: none; border: none; cursor: pointer; transition: transform 0.15s;
        }
        .vp-action-btn:hover { transform: scale(1.12); }
        .vp-action-icon {
          width: 42px; height: 42px; border-radius: 50%;
          background: rgba(0,0,0,0.35); backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; transition: background 0.2s;
        }
        .vp-action-btn:hover .vp-action-icon { background: rgba(255,255,255,0.15); }
        .vp-action-icon.saved { background: rgba(6,182,212,0.25); border-color: rgba(6,182,212,0.4); color: #06b6d4; }
        .vp-action-count { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.8); text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
        .vp-progress {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          display: flex; flex-direction: column; gap: 4px; z-index: 20; pointer-events: none;
        }
        .vp-dot { width: 3px; border-radius: 2px; background: rgba(255,255,255,0.25); transition: height 0.2s, background 0.2s; }
        .vp-dot.active { background: #06b6d4; box-shadow: 0 0 6px rgba(6,182,212,0.6); }
      `}</style>

      <div className="vp-root">
        <div className="vp-phone">
          {/* Top bar */}
          <div className="vp-controls">
            <span className="vp-controls-title">Pluto</span>
            <button className="vp-mute-btn" onClick={handleMuteToggle}>
              {isMuted ? <FaVolumeXmark /> : <FaVolumeHigh />}
            </button>
          </div>

          {/* Progress dots */}
          <div className="vp-progress">
            {videos.slice(0, 8).map((_, i) => (
              <div
                key={i}
                className={`vp-dot ${i === playingIndex ? "active" : ""}`}
                style={{ height: i === playingIndex ? 20 : 6 }}
              />
            ))}
          </div>

          {/* Scroll container */}
          <div className="vp-scroll">
            {videos.map((video, index) => {
              const videoSrc = video.videourl
                ?.replace("/upload/", "/upload/f_mp4,vc_h264/")
                ?.replace("http://", "https://");
              const isPlaying = playingIndex === index;
              const isOwnVideo =
                String(video?.createdBy?._id) === String(mydetails?._id);
              const isFollowing = followings?.includes(
                String(video?.createdBy?._id),
              );
              const isSaved = savedIds.has(video._id);

              return (
                // ✅ data-videoid — IntersectionObserver এটা দিয়ে চেনে
                <div
                  key={video._id}
                  className="vp-slide"
                  data-videoid={video._id}
                >
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={videoSrc}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onClick={() => handlePlayPause(index)}
                  />

                  {!isPlaying && (
                    <div className="vp-play-overlay">
                      <div className="vp-play-icon">
                        <FaPlay />
                      </div>
                    </div>
                  )}

                  <div className="vp-bottom-grad" />

                  {/* Left info */}
                  <div className="vp-info">
                    <div
                      className="vp-user-row"
                      onClick={() =>
                        isOwnVideo
                          ? navigate("/profile")
                          : navigate(`/profile/${video?.createdBy?._id}`)
                      }
                    >
                      {video.createdBy?.avatar ? (
                        <img
                          src={video.createdBy.avatar}
                          className="vp-avatar"
                          alt="avatar"
                        />
                      ) : (
                        <RiAccountCircleFill
                          style={{
                            fontSize: 34,
                            color: "rgba(255,255,255,0.6)",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span className="vp-username">
                        @{video.createdBy?.username}
                      </span>
                    </div>

                    {!isOwnVideo && (
                      <div style={{ marginBottom: 8 }}>
                        <FollowButton
                          userId={String(video?.createdBy?._id)}
                          isFollowedByBackend={isFollowing}
                        />
                      </div>
                    )}

                    {video.title && <p className="vp-title">{video.title}</p>}
                  </div>

                  {/* Right actions */}
                  <div className="vp-actions">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <VideoLikeButton
                        videoId={video._id}
                        likeCount={video.likes}
                      />
                    </div>

                    <button
                      className="vp-action-btn"
                      onClick={() => navigate(`/video/comments/${video._id}`)}
                    >
                      <div className="vp-action-icon">
                        <FaComment />
                      </div>
                      <span className="vp-action-count">
                        {video.comments || 0}
                      </span>
                    </button>

                    {/* ✅ Views — নতুন */}
                    <button className="vp-action-btn">
                      <div className="vp-action-icon">
                        <FaEye />
                      </div>
                      <span className="vp-action-count">
                        {video.views ?? 0}
                      </span>
                    </button>

                    <button className="vp-action-btn">
                      <div className="vp-action-icon">
                        <FaShareNodes />
                      </div>
                      <span className="vp-action-count">Share</span>
                    </button>

                    <button
                      className="vp-action-btn"
                      onClick={() => !isSaved && handleSaveVideo(video._id)}
                    >
                      <div
                        className={`vp-action-icon ${isSaved ? "saved" : ""}`}
                      >
                        <FaBookmark />
                      </div>
                      <span className="vp-action-count">
                        {isSaved ? "Saved" : "Save"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default VideoPlayer;

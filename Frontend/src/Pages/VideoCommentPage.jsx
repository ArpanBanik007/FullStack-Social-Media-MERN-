import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoArrowBack } from "react-icons/io5";
import { FaPlay, FaVolumeXmark, FaVolumeHigh } from "react-icons/fa6";
import { PiDotsThreeBold } from "react-icons/pi";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { connectSocket } from "../socket";

function VideoCommentPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { mydetails } = useSelector((state) => state.mydetails);
  const videoRef = useRef(null);
  const commentsEndRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/videos/${videoId}`,
          { withCredentials: true },
        );
        setVideo(res.data?.data);
        setCommentCount(res.data?.data?.comments || 0);
      } catch (err) {
        console.error("Video fetch error:", err);
      }
    };
    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/videos/comments/${videoId}`,
          { withCredentials: true },
        );
        setComments(res.data?.data || []);
      } catch (err) {
        console.error("Comment fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [videoId]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit("joinRoom", `video:${videoId}`);
    const handleNewComment = (comment) => {
      setComments((prev) => {
        if (prev.some((c) => c._id === comment._id)) return prev;
        return [comment, ...prev];
      });
    };
    const handleCountUpdate = ({ videoId: vid, comments: count }) => {
      if (String(vid) === String(videoId)) setCommentCount(count);
    };
    socket.on("new-comment", handleNewComment);
    socket.on("comment-count-updated", handleCountUpdate);
    return () => {
      socket.off("new-comment", handleNewComment);
      socket.off("comment-count-updated", handleCountUpdate);
    };
  }, [videoId]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const handleAddComment = async () => {
    if (!content.trim() || sending) return;
    try {
      setSending(true);
      await axios.post(
        `http://localhost:8000/api/v1/videos/comments/${videoId}`,
        { content },
        { withCredentials: true },
      );
      setContent("");
    } catch (err) {
      console.error("Comment add error:", err);
    } finally {
      setSending(false);
    }
  };

  const videoSrc = video?.videourl
    ?.replace("/upload/", "/upload/f_mp4,vc_h264/")
    ?.replace("http://", "https://");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
        @keyframes menuInVC { from{opacity:0;transform:translateY(-6px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes shimVC { 0%{background-position:-300px 0} 100%{background-position:300px 0} }
        .skVC { background:linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%); background-size:300px 100%; animation:shimVC 1.3s infinite linear; border-radius:10px; }

        .vc-root {
          min-height: 100vh;
          background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
          font-family: 'Syne', sans-serif;
          display: flex; flex-direction: column;
        }

        /* Header */
        .vc-header {
          position: sticky; top: 0; z-index: 20;
          background: rgba(15,23,42,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 14px 16px;
          display: flex; align-items: center; gap: 14px;
        }
        .vc-back-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: rgba(255,255,255,0.7); cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .vc-back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .vc-header-title { font-size: 16px; font-weight: 800; color: rgba(255,255,255,0.9); }
        .vc-count-badge {
          margin-left: 6px;
          background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.25);
          color: #06b6d4; font-size: 11px; font-weight: 700;
          padding: 2px 8px; border-radius: 8px;
        }

        /* Video */
        .vc-video-wrap {
          position: relative; width: 100%; max-width: 560px;
          margin: 0 auto; background: #000;
          padding-top: 56.25%;
        }
        .vc-video-wrap video {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; cursor: pointer;
        }
        .vc-play-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .vc-play-icon {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          border: 2px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: #fff;
        }
        .vc-mute-btn {
          position: absolute; top: 10px; right: 10px; z-index: 10;
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; color: #fff; cursor: pointer;
          transition: background 0.2s;
        }
        .vc-mute-btn:hover { background: rgba(0,0,0,0.7); }

        /* Video info */
        .vc-video-info {
          max-width: 560px; margin: 0 auto; width: 100%;
          padding: 14px 16px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 12px;
        }
        .vc-info-avatar {
          width: 38px; height: 38px; border-radius: 50%; object-fit: cover;
          border: 2px solid rgba(6,182,212,0.3); flex-shrink: 0;
        }
        .vc-info-username { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.85); }
        .vc-info-title { font-size: 12px; color: rgba(255,255,255,0.38); margin-top: 2px; }

        /* Comments */
        .vc-comments {
          flex: 1; overflow-y: auto; max-width: 560px; margin: 0 auto;
          width: 100%; padding: 14px 16px 100px;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
        }
        .vc-comments::-webkit-scrollbar { width: 4px; }
        .vc-comments::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

        .vc-comment {
          display: flex; gap: 11px; margin-bottom: 16px; position: relative;
        }
        .vc-comment-avatar {
          width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
          border: 2px solid rgba(255,255,255,0.08); flex-shrink: 0; margin-top: 2px;
        }
        .vc-comment-body { flex: 1; min-width: 0; }
        .vc-comment-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
        .vc-comment-username { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); }
        .vc-comment-text { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.5; word-break: break-word; }
        .vc-comment-time { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 4px; font-weight: 400; }

        .vc-dots-btn {
          width: 28px; height: 28px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; cursor: pointer; color: rgba(255,255,255,0.25);
          transition: background 0.2s, color 0.2s; background: transparent; border: none;
          flex-shrink: 0;
        }
        .vc-dots-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }

        .vc-comment-menu {
          position: absolute; right: 0; top: 28px; z-index: 50;
          background: linear-gradient(160deg,#1e293b,#0f172a);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 5px; width: 140px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.5);
          animation: menuInVC 0.18s ease;
        }
        .vc-menu-item {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 12px; border-radius: 8px;
          font-size: 13px; font-weight: 600; font-family: 'Syne',sans-serif;
          cursor: pointer; border: none; background: transparent;
          width: 100%; text-align: left; color: #f87171;
          transition: background 0.15s;
        }
        .vc-menu-item:hover { background: rgba(239,68,68,0.1); }

        /* Comment input */
        .vc-input-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 20;
          background: rgba(15,23,42,0.92); backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 12px 16px;
        }
        .vc-input-inner {
          max-width: 560px; margin: 0 auto;
          display: flex; align-items: center; gap: 10px;
        }
        .vc-input-avatar {
          width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
          border: 2px solid rgba(255,255,255,0.1); flex-shrink: 0;
        }
        .vc-input {
          flex: 1; height: 40px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; color: rgba(255,255,255,0.85);
          font-family: 'Syne',sans-serif; font-size: 13px;
          padding: 0 16px; outline: none;
          transition: border-color 0.2s;
        }
        .vc-input:focus { border-color: rgba(6,182,212,0.4); }
        .vc-input::placeholder { color: rgba(255,255,255,0.2); }
        .vc-post-btn {
          font-family: 'Syne',sans-serif; font-size: 13px; font-weight: 800;
          color: #06b6d4; background: none; border: none; cursor: pointer;
          padding: 0 4px; transition: color 0.2s, opacity 0.2s;
          white-space: nowrap;
        }
        .vc-post-btn:hover:not(:disabled) { color: #67e8f9; }
        .vc-post-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .vc-empty {
          text-align: center; padding: 50px 20px;
          color: rgba(255,255,255,0.22);
        }
        .vc-empty-icon { font-size: 40px; margin-bottom: 10px; }
        .vc-empty-text { font-size: 14px; font-weight: 600; }
        .vc-empty-sub { font-size: 12px; margin-top: 4px; }
      `}</style>

      <div className="vc-root">
        {/* Header */}
        <div className="vc-header">
          <button className="vc-back-btn" onClick={() => navigate(-1)}>
            <IoArrowBack />
          </button>
          <span className="vc-header-title">
            Comments
            {commentCount > 0 && (
              <span className="vc-count-badge">{commentCount}</span>
            )}
          </span>
        </div>

        {/* Video */}
        <div className="vc-video-wrap">
          <video
            ref={videoRef}
            src={videoSrc}
            loop
            playsInline
            onClick={handlePlayPause}
          />
          {!isPlaying && (
            <div className="vc-play-overlay">
              <div className="vc-play-icon">
                <FaPlay />
              </div>
            </div>
          )}
          <button className="vc-mute-btn" onClick={handleMute}>
            {isMuted ? <FaVolumeXmark /> : <FaVolumeHigh />}
          </button>
        </div>

        {/* Video info */}
        {video && (
          <div className="vc-video-info">
            {video.createdBy?.avatar ? (
              <img
                src={video.createdBy.avatar}
                className="vc-info-avatar"
                alt="avatar"
              />
            ) : (
              <RiAccountCircleFill
                style={{
                  fontSize: 38,
                  color: "rgba(255,255,255,0.3)",
                  flexShrink: 0,
                }}
              />
            )}
            <div>
              <div className="vc-info-username">
                @{video.createdBy?.username}
              </div>
              {video.title && (
                <div className="vc-info-title">{video.title}</div>
              )}
            </div>
          </div>
        )}

        {/* Comments list */}
        <div className="vc-comments">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 11, marginBottom: 18 }}
              >
                <div
                  className="skVC"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skVC"
                    style={{ height: 11, width: "40%", marginBottom: 8 }}
                  />
                  <div className="skVC" style={{ height: 10, width: "75%" }} />
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <div className="vc-empty">
              <div className="vc-empty-icon">💬</div>
              <div className="vc-empty-text">No comments yet</div>
              <div className="vc-empty-sub">Be the first to comment!</div>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="vc-comment">
                {c.user?.avatar ? (
                  <img
                    src={c.user.avatar}
                    className="vc-comment-avatar"
                    alt="avatar"
                  />
                ) : (
                  <RiAccountCircleFill
                    style={{
                      fontSize: 34,
                      color: "rgba(255,255,255,0.3)",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  />
                )}
                <div className="vc-comment-body">
                  <div className="vc-comment-header">
                    <span className="vc-comment-username">
                      @{c.user?.username || "Unknown"}
                    </span>
                    {String(c.user?._id) === String(mydetails?._id) && (
                      <div style={{ position: "relative" }}>
                        <button
                          className="vc-dots-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === c._id ? null : c._id);
                          }}
                        >
                          <PiDotsThreeBold />
                        </button>
                        {openMenuId === c._id && (
                          <div
                            className="vc-comment-menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="vc-menu-item"
                              onClick={() => {
                                console.log("Delete:", c._id);
                                setOpenMenuId(null);
                              }}
                            >
                              <MdDelete style={{ fontSize: 15 }} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="vc-comment-text">{c.content}</p>
                  <p className="vc-comment-time">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input bar */}
        <div className="vc-input-bar">
          <div className="vc-input-inner">
            {mydetails?.avatar ? (
              <img
                src={mydetails.avatar}
                className="vc-input-avatar"
                alt="avatar"
              />
            ) : (
              <RiAccountCircleFill
                style={{
                  fontSize: 34,
                  color: "rgba(255,255,255,0.3)",
                  flexShrink: 0,
                }}
              />
            )}
            <input
              className="vc-input"
              type="text"
              placeholder="Add a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddComment();
              }}
            />
            <button
              className="vc-post-btn"
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

export default VideoCommentPage;

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoArrowBack } from "react-icons/io5";
import { FaPlay, FaVolumeXmark, FaVolumeHigh } from "react-icons/fa6";
import { PiDotsThreeBold } from "react-icons/pi";
import { useSelector } from "react-redux";
import { socket } from "../socket";

function VideoCommentPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { mydetails } = useSelector((state) => state.mydetails);
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [commentCount, setCommentCount] = useState(0); // ✅ আলাদা count state

  // ===================== FETCH VIDEO =====================
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/videos/${videoId}`,
          { withCredentials: true },
        );
        setVideo(res.data?.data);
        setCommentCount(res.data?.data?.comments || 0); // ✅ initial count
      } catch (err) {
        console.error("Video fetch error:", err);
      }
    };
    fetchVideo();
  }, [videoId]);

  // ===================== FETCH COMMENTS =====================
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

  // ===================== SOCKET =====================
  useEffect(() => {
    socket.emit("join-video", `video:${videoId}`);

    // ✅ duplicate check সহ new comment
    const handleNewComment = (comment) => {
      setComments((prev) => {
        const exists = prev.some((c) => c._id === comment._id);
        if (exists) return prev;
        return [comment, ...prev];
      });
    };

    // ✅ আলাদা state update
    const handleCountUpdate = ({ videoId: vid, comments: count }) => {
      if (String(vid) === String(videoId)) {
        setCommentCount(count);
      }
    };

    socket.on("new-comment", handleNewComment);
    socket.on("comment-count-updated", handleCountUpdate);

    return () => {
      socket.off("new-comment", handleNewComment);
      socket.off("comment-count-updated", handleCountUpdate);
    };
  }, [videoId]);

  // ===================== PLAY/PAUSE =====================
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

  // ===================== MUTE =====================
  const handleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  // ===================== ADD COMMENT =====================
  const handleAddComment = async () => {
    if (!content.trim() || sending) return;
    try {
      setSending(true);
      await axios.post(
        `http://localhost:8000/api/v1/videos/comments/${videoId}`,
        { content },
        { withCredentials: true },
      );
      // ✅ socket "new-comment" event দিয়ে আসবে
      setContent("");
    } catch (err) {
      console.error("Comment add error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddComment();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ===== HEADER ===== */}
      <div className="sticky top-0 bg-black border-b border-gray-800 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate(-1)}>
          <IoArrowBack className="text-2xl" />
        </button>
        <h1 className="text-lg font-semibold">
          Comments {commentCount > 0 && `(${commentCount})`} {/* ✅ */}
        </h1>
      </div>

      {/* ===== VIDEO PLAYER — 16:9 ratio ===== */}
      <div
        className="relative w-full max-w-xl mx-auto bg-black"
        style={{ paddingTop: "56.25%" }}
      >
        <video
          ref={videoRef}
          src={video?.videourl
            ?.replace("/upload/", "/upload/f_mp4,vc_h264/")
            ?.replace("http://", "https://")}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          onClick={handlePlayPause}
        />

        {/* Play/Pause overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!isPlaying && (
            <div className="bg-black bg-opacity-50 rounded-full p-3">
              <FaPlay className="text-white text-2xl" />
            </div>
          )}
        </div>

        {/* Mute button */}
        <button
          onClick={handleMute}
          className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2 z-10"
        >
          {isMuted ? (
            <FaVolumeXmark className="text-white text-sm" />
          ) : (
            <FaVolumeHigh className="text-white text-sm" />
          )}
        </button>
      </div>

      {/* ===== VIDEO INFO ===== */}
      {video && (
        <div className="px-3 py-2 flex items-center gap-2 max-w-xl mx-auto w-full">
          {video.createdBy?.avatar ? (
            <img
              src={video.createdBy.avatar}
              className="w-8 h-8 rounded-full object-cover"
              alt="avatar"
            />
          ) : (
            <RiAccountCircleFill className="text-3xl text-gray-400" />
          )}
          <div>
            <p className="text-sm font-semibold">
              @{video.createdBy?.username}
            </p>
            {video.title && (
              <p className="text-xs text-gray-400">{video.title}</p>
            )}
          </div>
        </div>
      )}

      {/* ===== DIVIDER ===== */}
      <div className="border-t border-gray-800 mx-4" />

      {/* ===== COMMENTS LIST ===== */}
      <div className="flex-1 overflow-y-auto max-w-xl mx-auto w-full px-4 py-3 pb-24 space-y-4">
        {loading ? (
          <p className="text-gray-500 text-sm text-center mt-6">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-6">
            No comments yet. Be the first! 💬
          </p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="flex gap-3 relative">
              {c.user?.avatar ? (
                <img
                  src={c.user.avatar}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                  alt="avatar"
                />
              ) : (
                <RiAccountCircleFill className="text-3xl text-gray-400 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    @{c.user?.username || "Unknown"}
                  </p>

                  {/* 3 dot — শুধু নিজের comment এ */}
                  {String(c.user?._id) === String(mydetails?._id) && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === c._id ? null : c._id)
                        }
                      >
                        <PiDotsThreeBold className="text-gray-400 text-xl" />
                      </button>
                      {openMenuId === c._id && (
                        <div className="absolute right-0 top-6 bg-gray-800 rounded-xl shadow-lg w-32 z-50 border border-gray-700">
                          <button
                            onClick={() => {
                              console.log("Delete:", c._id);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-xl"
                          >
                            🗑 Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-300 mt-1">{c.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== ADD COMMENT — fixed bottom ===== */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 px-4 py-3 z-10">
        <div className="max-w-xl mx-auto flex gap-2 items-center">
          {mydetails?.avatar ? (
            <img
              src={mydetails.avatar}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              alt="avatar"
            />
          ) : (
            <RiAccountCircleFill className="text-3xl text-gray-400 flex-shrink-0" />
          )}
          <input
            type="text"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleAddComment}
            disabled={sending || !content.trim()}
            className="text-blue-400 font-semibold text-sm disabled:opacity-40"
          >
            {sending ? "..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoCommentPage;

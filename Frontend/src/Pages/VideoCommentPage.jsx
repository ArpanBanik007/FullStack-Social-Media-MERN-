import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoArrowBack } from "react-icons/io5";
import { useSelector } from "react-redux";
import { socket } from "../socket";

function VideoCommentPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { mydetails } = useSelector((state) => state.mydetails);

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // ===================== FETCH VIDEO =====================
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/videos/${videoId}`, // ← video info আনতে
          { withCredentials: true },
        );
        setVideo(res.data?.data);
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
          `http://localhost:8000/api/v1/videos/comments/${videoId}`, // ✅ fixed
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

  // ===================== ADD COMMENT =====================
  const handleAddComment = async () => {
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/videos/comments/${videoId}`, // ✅ fixed
        { content },
        { withCredentials: true },
      );
      setComments((prev) => [res.data.data, ...prev]);
      setContent("");
    } catch (err) {
      console.error("Comment add error:", err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    // room এ join করো
    socket.emit("join-post", `post:${videoId}`);

    // comment count update শুনো
    const handleCountUpdate = ({ postId, comments }) => {
      if (postId === videoId) {
        // count update — optional
      }
    };

    socket.on("comment-count-updated", handleCountUpdate);
    return () => socket.off("comment-count-updated", handleCountUpdate);
  }, [videoId]);

  // ===================== ENTER KEY =====================
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddComment();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HEADER */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate(-1)}>
          <IoArrowBack className="text-2xl" />
        </button>
        <h1 className="text-lg font-semibold">Comments</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 pb-24">
        {/* VIDEO INFO */}
        {video && (
          <div className="py-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              {video.createdBy?.avatar ? (
                <img
                  src={video.createdBy.avatar}
                  className="w-10 h-10 rounded-full object-cover"
                  alt="avatar"
                />
              ) : (
                <RiAccountCircleFill className="text-4xl text-gray-400" />
              )}
              <div>
                <p className="font-semibold">@{video.createdBy?.username}</p>
                <p className="text-xs text-gray-400">
                  {new Date(video.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {video.title && (
              <p className="mt-2 text-sm text-gray-300">{video.title}</p>
            )}
          </div>
        )}

        {/* COMMENTS LIST */}
        <div className="mt-4 space-y-4">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center mt-10">
              No comments yet. Be the first! 💬
            </p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="flex gap-3">
                {c.user?.avatar ? (
                  <img
                    src={c.user.avatar}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    alt="avatar"
                  />
                ) : (
                  <RiAccountCircleFill className="text-3xl text-gray-400 flex-shrink-0" />
                )}
                <div className="bg-gray-800 rounded-xl px-3 py-2 flex-1">
                  <p className="text-sm font-semibold">
                    @{c.user?.username || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">{c.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD COMMENT — fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-4 py-3">
        <div className="max-w-xl mx-auto flex gap-2">
          {/* Logged in user avatar */}
          {mydetails?.avatar ? (
            <img
              src={mydetails.avatar}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              alt="avatar"
            />
          ) : (
            <RiAccountCircleFill className="text-4xl text-gray-400 flex-shrink-0" />
          )}

          <input
            type="text"
            className="flex-1 bg-gray-800 border border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={handleAddComment}
            disabled={sending || !content.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            {sending ? "..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoCommentPage;

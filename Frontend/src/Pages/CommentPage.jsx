import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "../utils/axios";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoArrowBack } from "react-icons/io5";

function CommentPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/posts/single/${postId}`,
        );
        setPost(res.data?.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPost();
  }, [postId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/posts/comments/post/${postId}`,
        );
        setComments(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  useEffect(() => {
    import("../socket").then(({ connectSocket }) => {
      const socket = connectSocket();
      socket.emit("joinRoom", `post:${postId}`);

      const handleNewComment = (data) => {
        if (data.postId === postId) {
          setComments((prev) => {
            if (prev.some(c => c._id === data.comment._id)) return prev;
            return [data.comment, ...prev];
          });
        }
      };

      socket.on("new-comment", handleNewComment);

      return () => {
        socket.off("new-comment", handleNewComment);
      };
    });
  }, [postId]);

  const handleAddComment = async () => {
    if (!content.trim() || sending) return;
    try {
      setSending(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/posts/comments/post/${postId}`,
        { content },
        { withCredentials: true }
      );
      setComments((prev) => {
        if (prev.some(c => c._id === res.data.data._id)) return prev;
        return [res.data.data, ...prev];
      });
      setContent("");
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');
          @keyframes shimCP { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
          .skCP { background:linear-gradient(90deg,#1e293b 25%,#263348 50%,#1e293b 75%); background-size:400px 100%; animation:shimCP 1.3s infinite linear; border-radius:10px; }
        `}</style>
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(160deg,#0f172a,#1e293b)",
            fontFamily: "'Syne',sans-serif",
            padding: "0 0 80px",
          }}
        >
          <div
            style={{
              position: "sticky",
              top: 0,
              background: "rgba(15,23,42,0.85)",
              backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              className="skCP"
              style={{ width: 36, height: 36, borderRadius: 10 }}
            />
            <div className="skCP" style={{ height: 14, width: 100 }} />
          </div>
          <div
            style={{ maxWidth: 560, margin: "16px auto", padding: "0 16px" }}
          >
            <div
              style={{
                background: "linear-gradient(160deg,#1e293b,#0f172a)",
                borderRadius: 20,
                padding: 16,
                border: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div
                  className="skCP"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skCP"
                    style={{ height: 12, width: "45%", marginBottom: 8 }}
                  />
                  <div className="skCP" style={{ height: 10, width: "30%" }} />
                </div>
              </div>
              <div className="skCP" style={{ height: 220, width: "100%" }} />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!post) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg,#0f172a,#1e293b)",
          fontFamily: "'Syne',sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
          color: "rgba(255,255,255,0.25)",
        }}
      >
        <div style={{ fontSize: 44 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Post not found</div>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 8,
            padding: "9px 20px",
            borderRadius: 12,
            background: "rgba(6,182,212,0.12)",
            border: "1px solid rgba(6,182,212,0.25)",
            color: "#06b6d4",
            fontFamily: "'Syne',sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .cp-root {
          min-height: 100vh;
          background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
          font-family: 'Syne', sans-serif;
          color: #fff;
          display: flex; flex-direction: column;
          padding-bottom: 80px;
        }

        .cp-header {
          position: sticky; top: 0; z-index: 20;
          background: rgba(15,23,42,0.85); backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 14px 16px;
          display: flex; align-items: center; gap: 14px;
        }
        .cp-back-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: rgba(255,255,255,0.7); cursor: pointer;
          transition: background 0.2s;
        }
        .cp-back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .cp-header-title { font-size: 16px; font-weight: 800; color: rgba(255,255,255,0.9); }
        .cp-count-badge {
          margin-left: 6px;
          background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.25);
          color: #06b6d4; font-size: 11px; font-weight: 700;
          padding: 2px 8px; border-radius: 8px;
        }

        /* Post card */
        .cp-post-card {
          max-width: 560px; margin: 16px auto 0; width: 100%; padding: 0 14px;
        }
        .cp-post-inner {
          background: linear-gradient(160deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .cp-post-header { display:flex; align-items:center; gap:12px; padding:14px 14px 10px; }
        .cp-post-avatar {
          width: 40px; height: 40px; border-radius: 50%; object-fit: cover;
          border: 2px solid rgba(6,182,212,0.3); flex-shrink: 0;
        }
        .cp-post-username { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.85); }
        .cp-post-time { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 2px; }
        .cp-post-body { padding: 0 14px 14px; }
        .cp-post-desc { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 10px; line-height: 1.6; }

        /* ✅ Natural image — জেমন size তেমন দেখাবে, crop নেই */
        .cp-post-img-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0,0,0,0.2);
          border-radius: 14px;
          overflow: hidden;
        }
        .cp-post-img {
          display: block;
          max-width: 100%;
          width: auto;
          height: auto;
          max-height: 80vh;   /* ✅ screen এর বাইরে যাবে না */
          object-fit: contain; /* ✅ কোনো crop নেই */
          border-radius: 14px;
        }

        /* Comments section */
        .cp-comments-section {
          max-width: 560px; margin: 14px auto 0; width: 100%; padding: 0 14px;
        }
        .cp-comments-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.22); margin-bottom: 12px;
        }

        .cp-comment {
          display: flex; gap: 11px; margin-bottom: 14px;
        }
        .cp-comment-avatar {
          width: 34px; height: 34px; border-radius: 50%; object-fit: cover;
          border: 2px solid rgba(255,255,255,0.08); flex-shrink: 0; margin-top: 2px;
        }
        .cp-comment-body {
          flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px; padding: 10px 14px;
        }
        .cp-comment-username { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.75); margin-bottom: 4px; }
        .cp-comment-text { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.5; word-break: break-word; }
        .cp-comment-time { font-size: 10px; color: rgba(255,255,255,0.22); margin-top: 6px; }

        .cp-empty { text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.22); }
        .cp-empty-icon { font-size: 38px; margin-bottom: 8px; }
        .cp-empty-text { font-size: 14px; font-weight: 600; }
        .cp-empty-sub { font-size: 12px; margin-top: 4px; }

        /* Input bar */
        .cp-input-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 20;
          background: rgba(15,23,42,0.92); backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 12px 16px;
        }
        .cp-input-inner { max-width: 560px; margin: 0 auto; display: flex; align-items: center; gap: 10px; }
        .cp-input {
          flex: 1; height: 42px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 21px; color: rgba(255,255,255,0.85);
          font-family: 'Syne',sans-serif; font-size: 13px;
          padding: 0 16px; outline: none; transition: border-color 0.2s;
        }
        .cp-input:focus { border-color: rgba(6,182,212,0.4); }
        .cp-input::placeholder { color: rgba(255,255,255,0.2); }
        .cp-post-btn {
          font-family: 'Syne',sans-serif; font-size: 13px; font-weight: 800;
          color: #06b6d4; background: none; border: none; cursor: pointer;
          padding: 0 4px; transition: color 0.2s, opacity 0.2s;
          white-space: nowrap;
        }
        .cp-post-btn:hover:not(:disabled) { color: #67e8f9; }
        .cp-post-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      `}</style>

      <div className="cp-root">
        {/* Header */}
        <div className="cp-header">
          <button className="cp-back-btn" onClick={() => navigate(-1)}>
            <IoArrowBack />
          </button>
          <span className="cp-header-title">
            Comments
            {comments.length > 0 && (
              <span className="cp-count-badge">{comments.length}</span>
            )}
          </span>
        </div>

        {/* Post */}
        <div className="cp-post-card">
          <div className="cp-post-inner">
            <div className="cp-post-header">
              {post.createdBy?.avatar ? (
                <img
                  src={post.createdBy.avatar}
                  className="cp-post-avatar"
                  alt="avatar"
                />
              ) : (
                <RiAccountCircleFill
                  style={{
                    fontSize: 40,
                    color: "rgba(255,255,255,0.3)",
                    flexShrink: 0,
                  }}
                />
              )}
              <div>
                <div className="cp-post-username">
                  @{post.createdBy?.username}
                </div>
                <div className="cp-post-time">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="cp-post-body">
              {post.description && (
                <p className="cp-post-desc">{post.description}</p>
              )}
              {/* ✅ Natural image — wrapper center করে, image নিজের size এ থাকে */}
              {post.posturl && (
                <div className="cp-post-img-wrapper">
                  <img src={post.posturl} className="cp-post-img" alt="post" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="cp-comments-section">
          <div className="cp-comments-label">Comments</div>

          {comments.length === 0 ? (
            <div className="cp-empty">
              <div className="cp-empty-icon">💬</div>
              <div className="cp-empty-text">No comments yet</div>
              <div className="cp-empty-sub">Be the first to comment!</div>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="cp-comment">
                {c.user?.avatar ? (
                  <img
                    src={c.user.avatar}
                    className="cp-comment-avatar"
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
                <div className="cp-comment-body">
                  <div className="cp-comment-username">@{c.user?.username}</div>
                  <p className="cp-comment-text">{c.content}</p>
                  <div className="cp-comment-time">
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input */}
        <div className="cp-input-bar">
          <div className="cp-input-inner">
            <input
              className="cp-input"
              type="text"
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddComment();
              }}
            />
            <button
              className="cp-post-btn"
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

export default CommentPage;

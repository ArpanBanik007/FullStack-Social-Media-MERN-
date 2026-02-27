import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../utils/axios";

function CommentPage() {
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  /* ================= FETCH POST ================= */
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/posts/${postId}`,
        );
        setPost(res.data?.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPost();
  }, [postId]);

  /* ================= FETCH COMMENTS ================= */
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

  /* ================= ADD COMMENT ================= */
  const handleAddComment = async () => {
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/posts/comments/post/${postId}`,
        {
          content,
        },
      );

      setComments((prev) => [res.data.data, ...prev]);
      setContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;

  if (!post)
    return <div className="text-center mt-10 text-red-500">Post not found</div>;

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      {/* POST */}
      <div className="bg-white shadow rounded-lg mb-4 p-4">
        <div className="flex gap-3 mb-3">
          <img
            src={post.createdBy?.avatar}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold">{post.createdBy?.username}</div>
            <div className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {post.description && <p className="mb-3 text-sm">{post.description}</p>}

        {post.posturl && (
          <img src={post.posturl} alt="post" className="w-full rounded-lg" />
        )}
      </div>

      {/* COMMENTS */}
      <div className="bg-white shadow rounded-lg p-4">
        <h6 className="font-semibold mb-4">Comments</h6>

        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet</p>
        ) : (
          comments.map((c) => (
            <div key={c._id} className="flex gap-3 mb-3">
              <img
                src={c.user?.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-sm">{c.user?.username}</div>
                <div className="text-sm text-gray-600">{c.content}</div>
              </div>
            </div>
          ))
        )}

        {/* Add Comment */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={sending}
            onClick={handleAddComment}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentPage;

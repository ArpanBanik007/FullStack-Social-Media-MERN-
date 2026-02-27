import { useEffect, useState } from "react";
import axios from "axios";
import { socket } from "../socket";

import { FaHeart } from "react-icons/fa";
import { FaComment, FaShareNodes } from "react-icons/fa6";
import { PiDotsThreeBold } from "react-icons/pi";

import { useSelector, useDispatch } from "react-redux";
import FollowButton from "../componants/FollowButton";
import { fetchMyFollowings } from "../slices/follow.slice";
import PostActionMenu from "../componants/PostActionMenu";
import { useNavigate } from "react-router-dom";

function MainFeed() {
  const dispatch = useDispatch();
  const { mydetails, loading: userLoading } = useSelector(
    (state) => state.mydetails,
  );

  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  /* ================= FETCH CURRENT USER FOLLOWINGS ================= */
  useEffect(() => {
    dispatch(fetchMyFollowings());
  }, [dispatch]);

  /* ================= FETCH FEED ================= */
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/posts/feed", {
          withCredentials: true,
        });
        setPosts(res.data?.posts || []);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setFeedLoading(false);
      }
    };
    fetchFeed();
  }, []);

  /* ================= SAVE POST ================= */
  const handleSavePost = async (postId) => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/watch/watchlater",
        { postId },
        { withCredentials: true },
      );
      alert("Post saved ✅");
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= SOCKET JOIN ================= */
  useEffect(() => {
    if (!posts.length) return;

    posts.forEach((post) => {
      socket.emit("join-post", `post:${post._id}`);
    });
  }, [posts.length]);

  /* ================= SOCKET REACTIONS ================= */
  useEffect(() => {
    posts.forEach((post) => socket.emit("join-post", post._id));

    const handleReactionUpdate = (data) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === data.postId
            ? {
                ...post,
                likes: data.likes,
                dislikes: data.dislikes,
                userLiked: data.userLiked,
                userDisliked: data.userDisliked,
              }
            : post,
        ),
      );
    };

    socket.on("post-reaction-updated", handleReactionUpdate);
    return () => socket.off("post-reaction-updated", handleReactionUpdate);
  }, []);

  /* ================= COMMENT COUNT LISTENER ================= */
  useEffect(() => {
    const handleCommentCountUpdate = ({ postId, comments }) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId ? { ...post, comments } : post,
        ),
      );
    };

    socket.on("comment-count-updated", handleCommentCountUpdate);

    return () => socket.off("comment-count-updated", handleCommentCountUpdate);
  }, []);

  /* ================= LIKE ================= */
  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/posts/${postId}/like`,
        {},
        { withCredentials: true },
      );

      const liked = res.data?.liked;
      if (typeof liked !== "boolean") return;

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                userLiked: liked,
                userDisliked: liked ? false : post.userDisliked,
              }
            : post,
        ),
      );
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  /* ================= LOADING ================= */
  if (feedLoading || userLoading) {
    return (
      <div className="text-center text-gray-400 py-10 text-lg">
        Loading posts...
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10 text-lg">
        No posts available 😕
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-cyan-300 w-full max-w-md mx-auto mt-2 mb-6 border rounded-xl shadow-md relative"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-3 cursor-pointer">
            <div className="flex items-center">
              <img
                src={
                  post?.createdBy?.avatar || "https://via.placeholder.com/40"
                }
                className="h-10 w-10 rounded-full"
              />
              <div className="ml-3">
                <h3 className="font-semibold">@{post?.createdBy?.username}</h3>
                <p className="text-sm text-gray-700">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {post.createdBy._id !== mydetails?._id && (
              <FollowButton
                userId={post.createdBy._id}
                isFollowedByBackend={post.createdBy.isFollowedByMe}
              />
            )}

            <PiDotsThreeBold
              className="text-2xl cursor-pointer"
              onClick={() =>
                setOpenMenuId(openMenuId === post._id ? null : post._id)
              }
            />

            {/* 🔥 STEP 6 MENU */}
            <PostActionMenu
              isOpen={openMenuId === post._id}
              onClose={() => setOpenMenuId(null)}
              onSave={() => handleSavePost(post._id)}
              onBlock={() => console.log("Block user:", post.createdBy._id)}
            />
          </div>

          {/* CONTENT */}
          <div className="px-3 pb-3">
            {post.title && <p className="mb-2 font-semibold">{post.title}</p>}
            {post.posturl && (
              <img
                src={post.posturl}
                className="w-full max-h-80 rounded-md object-contain"
              />
            )}
          </div>

          {/* ACTIONS */}
          <div className="border-t flex justify-around py-2 text-sm">
            <button
              onClick={() => handleLike(post._id)}
              className={post.userLiked ? "text-red-500" : ""}
            >
              <FaHeart className=" cursor-pointer" /> {post.likes}
            </button>

            <button onClick={() => navigate(`/post/${post._id}`)}>
              <FaComment className=" cursor-pointer" /> {post.comments || 0}
            </button>

            <button>
              <FaShareNodes /> Share
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

export default MainFeed;

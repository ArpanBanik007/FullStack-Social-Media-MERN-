import React from "react";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import {
  FaHeart,
  FaComment,
  FaShareNodes,
  FaRegBookmark,
} from "react-icons/fa6";
import { IoMdHeartDislike } from "react-icons/io";
import { PiDotsThreeBold } from "react-icons/pi";
import LikeButton from "../componants/LikeButton";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

function UserAllPost({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/posts/user/${userId}`,
          { withCredentials: true },
        );

        setPosts(res.data.data);
      } catch (error) {
        console.log("Post fetch error", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  useEffect(() => {
    if (!posts.length) return;
    posts.forEach((post) => {
      socket.emit("join-post", post._id);
    });
  }, [posts.length]);

  useEffect(() => {
    const handleReactionUpdate = (data) => {
      setPosts((prev) =>
        prev.map((post) =>
          post._id === data.postId
            ? { ...post, likes: data.likes, dislikes: data.dislikes }
            : post,
        ),
      );
    };

    socket.on("post-reaction-updated", handleReactionUpdate);

    return () => {
      socket.off("post-reaction-updated", handleReactionUpdate); // ✅ cleanup
    };
  }, []); // ← একবারই register করো
  const toggleMenu = (postId) => {
    setOpenMenuId((prevId) => (prevId === postId ? null : postId));
  };

  const handleAddToWatchLater = async (postId) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/watch/watchlater",
        { postId },
        { withCredentials: true },
      );

      alert(res.data?.message || "Added to Watch Later ✅");
    } catch (error) {
      console.error("Failed to add to Watch Later:", error);
      alert(error.response?.data?.message || "Failed to add ❌");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10 text-lg">
        Loading your posts...
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-200 py-10 text-lg">
        You don’t have any posts yet 😕
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <div
          key={post._id}
          className="relative bg-white dark:bg-slate-800 w-full max-w-xl mx-auto mt-4 border rounded-xl shadow-md mb-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center">
              <img
                src={
                  post?.createdBy?.avatar || "https://via.placeholder.com/40"
                }
                alt="avatar"
                className="h-10 w-10 rounded-full border"
              />

              <div className="ml-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {post?.createdBy?.username || "Unknown"}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* 3 Dot Menu */}
            <PiDotsThreeBold
              className="text-2xl text-gray-400 hover:text-gray-700 cursor-pointer"
              onClick={() => toggleMenu(post._id)}
            />
          </div>

          {/* Post Content */}
          <div className="px-3 pb-3">
            {post.title && (
              <p className="mb-2 font-semibold text-gray-800 dark:text-gray-100">
                {post.title}
              </p>
            )}

            {post.posturl && (
              <img
                src={post.posturl}
                alt="post"
                className="w-full max-h-80 rounded-md object-contain"
              />
            )}
          </div>

          {/* Actions */}
          <div className="border-t flex justify-around py-2 text-gray-400 text-sm">
            <LikeButton postId={post._id} likeCount={post.likes || 0} />

            <button onClick={() => navigate(`/post/${post._id}`)}>
              <FaComment className=" cursor-pointer" /> {post.comments || 0}
            </button>

            <button className="flex items-center gap-1 hover:text-purple-600">
              <FaShareNodes />
              <span>Share</span>
            </button>
          </div>

          {/* 3 Dot Dropdown */}
          {openMenuId === post._id && (
            <div className="absolute top-12 right-4 bg-white dark:bg-slate-900 shadow-lg rounded-xl border w-40 p-2 z-50">
              <button
                onClick={() => handleAddToWatchLater(post._id)}
                className="flex items-center gap-3 w-full hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-lg"
              >
                <FaRegBookmark className="text-lg" />
                <span className="text-sm">Save</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default UserAllPost;

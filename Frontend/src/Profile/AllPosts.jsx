import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  FaHeart,
  FaComment,
  FaShareNodes,
  FaRegBookmark,
} from "react-icons/fa6";
import { IoMdHeartDislike } from "react-icons/io";
import { PiDotsThreeBold } from "react-icons/pi";
import { MdEdit, MdDelete } from "react-icons/md";

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/posts/my-posts",
          {
            withCredentials: true,
          },
        );
        setPosts(res.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = (postId) => {
    setOpenMenuId((prevId) => (prevId === postId ? null : postId));
  };

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?",
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/v1/posts/${postId}`, {
        withCredentials: true,
      });

      setPosts(posts.filter((post) => post._id !== postId));

      alert("Post deleted successfully ✅");
    } catch (error) {
      console.error(error);
      alert("Failed to delete post ❌");
    }
  };

  const handleAddToWatchLater = async (postId) => {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/watch/watchlater",
        { postId }, // 👈 backend-এ postId পাঠাচ্ছি
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

            {/* Right section: 3 dots */}
            <PiDotsThreeBold
              className="text-2xl text-gray-400 hover:text-gray-200 cursor-pointer"
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
            <button className="flex items-center gap-1 hover:text-red-500">
              <FaHeart className="text-base" />
              <span>Like</span>
              <span className="text-xs font-semibold ml-1">
                {post.likes || 0}
              </span>
            </button>

            <button className="flex items-center gap-1 hover:text-violet-900">
              <IoMdHeartDislike className="text-base" />
              <span>Dislike</span>
              <span className="text-xs font-semibold ml-1">
                {post.dislikes || 0}
              </span>
            </button>

            <button className="flex items-center gap-1 hover:text-green-500">
              <FaComment className="text-base" />
              <span>Comment</span>
              <span className="text-xs font-semibold ml-1">
                {post.comments || 0}
              </span>
            </button>

            <button className="flex items-center gap-1 hover:text-purple-600">
              <FaShareNodes className="text-base" />
              <span>Share</span>
            </button>
          </div>

          {/* Dot Menu */}
          {openMenuId === post._id && (
            <div
              ref={menuRef}
              className="absolute top-14 right-4 bg-slate-800 text-gray-100 rounded-xl shadow-lg p-3 w-48 z-50 flex flex-col gap-2 border border-slate-600 transition-all duration-300 animate-fadeIn"
            >
              <button
                onClick={() => handleAddToWatchLater(post._id)}
                className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded-lg"
              >
                <FaRegBookmark className="text-lg" />
                <span className="text-sm font-medium">Save</span>
              </button>
              <button className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded-lg">
                <MdEdit className="text-lg" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button
                className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded-lg text-red-400 hover:text-red-300"
                onClick={() => handleDeletePost(post._id)}
              >
                <MdDelete className="text-lg" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default AllPosts;

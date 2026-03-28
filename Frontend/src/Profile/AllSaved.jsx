import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { PiDotsThreeBold } from "react-icons/pi";
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
        const res = await axios.get(
          "http://localhost:8000/api/v1/watch/watchlater",
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

  const handleRemoveWatchLater = async (savedItemId) => {
    try {
      await axios.delete("http://localhost:8000/api/v1/watch/watchlater", {
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
    if (item.postId?._id) {
      navigate(`/post/${item.postId._id}`);
    } else if (item.videoId?._id) {
      navigate(`/video/comments/${item.videoId._id}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10 text-lg">
        Loading saved items...
      </div>
    );
  }

  if (savedItems.length === 0) {
    return (
      <div className="text-center text-gray-200 py-10 text-lg">
        Nothing saved yet 😕
      </div>
    );
  }

  return (
    <div className="p-2 flex flex-col items-center">
      {savedItems.map((item) => {
        const post = item.postId;
        const video = item.videoId;
        const createdBy = post?.createdBy || video?.createdBy;

        const videoSrc = video?.videourl
          ?.replace("http://", "https://")
          ?.replace("/upload/", "/upload/f_mp4,vc_h264/");

        return (
          <div
            key={item._id}
            className="relative bg-white dark:bg-slate-800 w-full max-w-xl mx-auto mt-4 border rounded-xl shadow-md mb-6 overflow-hidden"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center">
                <img
                  src={createdBy?.avatar || "https://via.placeholder.com/40"}
                  alt="avatar"
                  className="h-10 w-10 rounded-full border object-cover"
                />
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {createdBy?.username || "Unknown"}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {post ? "📷 Post" : "🎬 Video"}
                  </span>
                </div>
              </div>

              <PiDotsThreeBold
                className="text-2xl text-gray-400 cursor-pointer hover:text-gray-200"
                onClick={() =>
                  setOpenMenuId(openMenuId === item._id ? null : item._id)
                }
              />
            </div>

            {/* CONTENT */}
            <div className="cursor-pointer" onClick={() => handleClick(item)}>
              {/* POST — 16:9 ratio */}
              {post && (
                <>
                  {post.title && (
                    <p className="px-3 mb-2 font-semibold text-gray-800 dark:text-gray-100">
                      {post.title}
                    </p>
                  )}
                  {post.posturl && (
                    // ✅ 16:9 ratio box
                    <div
                      className="relative w-full"
                      style={{ paddingTop: "56.25%" }}
                    >
                      <img
                        src={post.posturl}
                        alt="post"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                </>
              )}

              {/* VIDEO — 16:9 ratio */}
              {video && (
                <>
                  {video.title && (
                    <p className="px-3 mb-2 font-semibold text-gray-800 dark:text-gray-100">
                      {video.title}
                    </p>
                  )}
                  {/* ✅ 16:9 ratio box */}
                  <div
                    className="relative w-full"
                    style={{ paddingTop: "56.25%" }}
                  >
                    <video
                      src={`${videoSrc}#t=0.1`}
                      className="absolute inset-0 w-full h-full object-cover"
                      preload="metadata"
                      muted
                    />
                    {/* Play icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-3">
                        <span className="text-white text-xl">▶</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 3 DOT MENU */}
            {openMenuId === item._id && (
              <div
                ref={menuRef}
                className="absolute top-14 right-4 bg-slate-800 text-gray-100 rounded-xl shadow-lg p-3 w-40 z-50 border border-slate-600"
              >
                <button
                  className="flex items-center gap-2 w-full hover:bg-slate-700 p-2 rounded-lg text-red-400"
                  onClick={() => handleRemoveWatchLater(item._id)}
                >
                  🗑 Remove
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AllSaved;

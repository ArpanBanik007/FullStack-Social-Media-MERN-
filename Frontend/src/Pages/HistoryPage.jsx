import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWatchHistory,
  deleteAllWatchHistory,
  deleteWatchHistoryById,
} from "../slices/watchHistory.slice";
import Navbar from "../home/Navbar";
import LeftBar from "../home/LeftBar";
import { RiDeleteBin7Line } from "react-icons/ri";
import { Link } from "react-router-dom";

function HistoryPage() {
  const dispatch = useDispatch();
  const { historyItems, status } = useSelector((state) => state.watchHistory);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchWatchHistory({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handleDeleteAll = () => {
    dispatch(deleteAllWatchHistory());
    setShowConfirm(false);
  };

  const handleDelete = (id) => {
    dispatch(deleteWatchHistoryById(id));
  };

  return (
    <div className="bg-slate-800 flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <LeftBar />

      <div className="w-[70%] ml-[28%] relative">
        {/* ✅ Top Header */}
        <div className="flex justify-between items-center pr-6">
          <h1 className="text-2xl text-gray-200 font-semibold ml-5 mt-3.5">
            History
          </h1>
          {historyItems?.length > 0 && (
            <div
              onClick={() => setShowConfirm(true)}
              className="text-3xl text-gray-200 pt-2 cursor-pointer hover:text-red-400 transition"
              title="Delete All History"
            >
              <RiDeleteBin7Line />
            </div>
          )}
        </div>

        {/* ✅ Confirmation Card */}
        {showConfirm && (
          <div className="absolute top-16 right-6 bg-slate-900 text-gray-100 rounded-xl shadow-lg p-5 w-64 z-50">
            <p className="text-center font-semibold mb-4">
              Are you sure you want to delete all history?
            </p>
            <div className="flex justify-around">
              <button
                onClick={handleDeleteAll}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md transition"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded-md transition"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* ✅ History Cards */}
        <div className="p-4">
          {status === "loading" ? (
            <p className="text-gray-400 text-center mt-10">
              Loading history...
            </p>
          ) : historyItems?.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              No history available.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 mt-4">
              {historyItems?.map((item) => {
                const isVideo = !!item.videoId;
                const isPost = !!item.postId;

                // Determine content based on whether it is a post or a video
                let mediaUrl = "";
                let itemTitle = "Untitled";

                if (isVideo) {
                  mediaUrl = item.videoId?.videoUrl;
                  itemTitle = item.videoId?.title || "Video";
                } else if (isPost) {
                  // Attempt to retrieve an image from the post, otherwise fallback to posturl
                  mediaUrl = item.postId?.images?.[0] || item.postId?.posturl;
                  itemTitle =
                    item.postId?.title ||
                    item.postId?.content?.substring(0, 30) + "..." ||
                    "Post";
                }

                // If the referenced video/post was deleted from the DB but history remains
                if (!isVideo && !isPost) return null;

                return (
                  <div
                    key={item._id}
                    className="bg-slate-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 flex flex-col"
                  >
                    <div className="flex flex-grow justify-center items-center aspect-video w-full bg-black relative">
                      {isVideo ? (
                        <video
                          src={mediaUrl}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Post Media"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300?text=No+Media";
                          }}
                        />
                      )}
                      {/* Badge identifying content kind */}
                      <span className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white font-semibold">
                        {isVideo ? "Video" : "Post"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3">
                      <Link 
                        to={isVideo ? `/video/single/${item.videoId?._id}` : `/post/single/${item.postId?._id}`}
                        className="font-bold text-gray-300 truncate w-3/4 text-sm hover:text-blue-400 transition"
                      >
                        {itemTitle}
                      </Link>
                      <div
                        onClick={() => handleDelete(item._id)}
                        className="text-gray-400 hover:text-red-600 text-xl cursor-pointer transition-colors"
                        title="Delete from history"
                      >
                        <RiDeleteBin7Line />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;

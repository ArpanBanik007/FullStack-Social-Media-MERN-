import React, { useState } from "react";
import myVideo from "../assets/myvideo.mp4";
import Navbar from "../home/Navbar";
import LeftBar from "../home/LeftBar";
import { RiDeleteBin7Line } from "react-icons/ri";

const initialHistory = [
  {
    id: 1,
    text: "My new painting 🎨",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: 2,
    text: "Chilling with friends 😎",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: 3,
    text: "Nature vibes 🌿",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  {
    id: 4,
    text: "Travel diaries ✈️",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
  },
  { id: 5, text: "Travel diaries ✈️", videoUrl: myVideo },
  { id: 6, text: "Travel diaries ✈️", videoUrl: myVideo },
];

function HistoryPage() {
  const [videos, setVideos] = useState(initialHistory);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteAll = () => {
    setVideos([]); // ✅ সব ভিডিও মুছে ফেলবে
    setShowConfirm(false);
  };

  return (
    <div className="bg-slate-800 flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <LeftBar />

      <div className="w-[70%] ml-[28%] relative">
        {/* ✅ টপ হেডার */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl text-gray-200 font-semibold ml-5 mt-3.5">
            History
          </h1>
          <div
            onClick={() => setShowConfirm(true)}
            className="text-3xl text-gray-200 pt-2 cursor-pointer hover:text-red-400 transition"
          >
            <RiDeleteBin7Line />
          </div>
        </div>

        {/* ✅ কনফার্মেশন কার্ড */}
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

        {/* ✅ ভিডিও কার্ডস */}
        <div className="p-4">
          {videos.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              No history available.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-slate-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex justify-center items-center aspect-video w-full">
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full h-90 object-center"
                    />
                  </div>
                  <div className="flex justify-between items-center px-3">
                    <p className="font-bold text-gray-300 my-2.5">
                      {video.text}
                    </p>
                    <div className="text-gray-100 hover:text-red-600 text-xl cursor-pointer">
                      <RiDeleteBin7Line />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;

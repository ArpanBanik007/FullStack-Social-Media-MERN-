import React from "react";
import myVideo from "../assets/myvideo.mp4";

function UserAllVideos() {
  const videos = [
    {
      id: 1,
      time: "1d ago",
      text: "My new painting 🎨",
      videoUrl: myVideo,
    },
    {
      id: 2,

      time: "2d ago",
      text: "Chilling with friends 😎",
      videoUrl: myVideo,
    },
    {
      id: 3,

      time: "3d ago",
      text: "Nature vibes 🌿",
      videoUrl: myVideo,
    },
    {
      id: 4,
      time: "4d ago",
      text: "New artwork 🖌️",
      videoUrl: myVideo,
    },
    {
      id: 5,
      time: "5d ago",
      text: "Travel diaries ✈️",
      videoUrl: "https://youtu.be/udgrClXV26Y", // ✅ YouTube short link
    },
  ];
  return (
    <div className="flex flex-col space-y-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="h-80 flex justify-center items-center bg-slate-800 rounded-md"
        >
          <div className="h-[95%] w-[96%] flex justify-center items-center bg-black rounded-xl">
            <video
              src={video.videoUrl}
              controls
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserAllVideos;

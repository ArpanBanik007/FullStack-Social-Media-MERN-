import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { IoMdHeartDislike } from "react-icons/io";
import { FaComment, FaShareNodes } from "react-icons/fa6";
import { RiAccountCircleFill } from "react-icons/ri";

function VideoPlayer() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef([]);

  // ===================== FETCH VIDEOS =====================
  useEffect(() => {
    const fetchFeedVideos = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/videos/feed",
          { withCredentials: true }
        );
        setVideos(res.data?.data?.videos || []);
      } catch (err) {
        console.error("Video fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedVideos();
  }, []);

  // ===================== AUTO PLAY ON SCROLL =====================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;

          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.65 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [videos]);

  if (loading) {
    return <p className="text-center mt-10">Loading reels...</p>;
  }

  return (
    // ===================== STATIC CARD =====================
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="w-full max-w-[430px] h-[95vh] bg-black rounded-xl overflow-hidden">
        {/* ===================== SCROLL AREA ===================== */}
        <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
          {videos.map((video, index) => {
            const videoSrc = video.videourl
              ?.replace("/upload/", "/upload/f_mp4,vc_h264/")
              ?.replace("http://", "https://");

            return (
              <div
                key={video._id}
                className="h-full snap-start relative flex items-center justify-center"
              >
                {/* ===================== VIDEO ===================== */}
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={videoSrc}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onClick={(e) => {
                    const video = e.currentTarget;

                    // 🔁 play / pause toggle
                    if (video.paused) {
                      video.play().catch(() => {});
                    } else {
                      video.pause();
                    }

                    // 🔊 unmute on first interaction
                    if (video.muted) {
                      video.muted = false;
                    }
                  }}
                />

                {/* ===================== LEFT INFO ===================== */}
                <div className="absolute bottom-20 left-4 text-white max-w-[70%]">
                  <div className="flex items-center gap-2 mb-2">
                    {video.createdBy?.avatar ? (
                      <img
                        src={video.createdBy.avatar}
                        className="w-8 h-8 rounded-full object-cover"
                        alt="avatar"
                      />
                    ) : (
                      <RiAccountCircleFill className="text-3xl" />
                    )}
                    <p className="font-semibold">
                      @{video.createdBy?.username}
                    </p>
                  </div>

                  {video.title && (
                    <p className="text-sm opacity-90">{video.title}</p>
                  )}
                </div>

                {/* ===================== RIGHT ACTIONS ===================== */}
                <div className="absolute right-4 bottom-24 flex flex-col gap-6 text-white text-xl">
                  <button>
                    <FaHeart />
                  </button>
                  <button>
                    <IoMdHeartDislike />
                  </button>
                  <button>
                    <FaComment />
                  </button>
                  <button>
                    <FaShareNodes />
                  </button>
                  <button>
                    <FaBookmark />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;

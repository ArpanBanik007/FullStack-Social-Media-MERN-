import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AllVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/videos/myvideos",
          { withCredentials: true },
        );
        setVideos(res.data?.data?.videos || []);
      } catch (err) {
        console.error("Video fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-400 py-10">Loading videos...</div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">No videos yet 😕</div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {videos.map((video) => {
        const videoSrc = video.videourl
          ?.replace("/upload/", "/upload/f_mp4,vc_h264/")
          ?.replace("http://", "https://");

        return (
          <div
            key={video._id}
            className="relative bg-black rounded-xl overflow-hidden cursor-pointer aspect-[9/16]"
            onClick={() => navigate(`/video/comments/${video._id}`)}
          >
            {/* Thumbnail বা Video */}
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={videoSrc}
                className="w-full h-full object-cover"
                preload="metadata"
              />
            )}

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
              <p className="text-white text-xs font-medium line-clamp-2">
                {video.title}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {video.likes || 0} likes
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AllVideos;

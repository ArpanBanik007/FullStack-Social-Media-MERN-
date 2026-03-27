import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaBookmark, FaPlay } from "react-icons/fa";
import {
  FaComment,
  FaShareNodes,
  FaVolumeXmark,
  FaVolumeHigh,
} from "react-icons/fa6";
import { RiAccountCircleFill } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import VideoLikeButton from "../componants/VideoLikeButton";
import FollowButton from "../componants/FollowButton"; // ✅
import { fetchMyFollowings } from "../slices/follow.slice"; // ✅

function VideoPlayer() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mydetails } = useSelector((state) => state.mydetails);
  const followings = useSelector((state) => state.follow.followings); // ✅

  // ===================== FETCH FOLLOWINGS =====================
  useEffect(() => {
    dispatch(fetchMyFollowings()); // ✅
  }, [dispatch]);

  // ===================== FETCH VIDEOS =====================
  useEffect(() => {
    const fetchFeedVideos = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/videos/feed",
          { withCredentials: true },
        );
        const fetchedVideos = res.data?.data?.videos || [];
        setVideos(fetchedVideos);

        if (fetchedVideos.length > 0) {
          navigate(`/videos/${fetchedVideos[0]._id}`, { replace: true });
        }
      } catch (err) {
        console.error("Video fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedVideos();
  }, []);

  // ===================== SOCKET JOIN =====================
  useEffect(() => {
    if (!videos.length) return;
    videos.forEach((video) => {
      socket.emit("join-video", `video:${video._id}`);
    });
  }, [videos.length]);

  // ===================== SOCKET REACTION UPDATE =====================
  useEffect(() => {
    const handleReactionUpdate = (data) => {
      setVideos((prev) =>
        prev.map((video) =>
          video._id === data.videoId ? { ...video, likes: data.likes } : video,
        ),
      );
    };

    socket.on("video-reaction-updated", handleReactionUpdate);
    return () => socket.off("video-reaction-updated", handleReactionUpdate);
  }, []);

  // ===================== COMMENT COUNT LISTENER =====================
  useEffect(() => {
    const handleCommentCountUpdate = ({ videoId, comments }) => {
      setVideos((prev) =>
        prev.map((video) =>
          video._id === videoId ? { ...video, comments } : video,
        ),
      );
    };

    socket.on("comment-count-updated", handleCommentCountUpdate);
    return () => socket.off("comment-count-updated", handleCommentCountUpdate);
  }, []);

  // ===================== AUTO PLAY ON SCROLL =====================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoEl = entry.target;
          const index = videoRefs.current.indexOf(videoEl);

          if (entry.isIntersecting) {
            videoRefs.current.forEach((v) => {
              if (v && v !== videoEl) v.pause();
            });

            videoEl.muted = isMuted;
            videoEl.play().catch(() => {});
            setPlayingIndex(index);

            if (videos[index]) {
              navigate(`/videos/${videos[index]._id}`, { replace: true });
            }
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: 0.65 },
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [videos, isMuted]);

  // ===================== PLAY/PAUSE =====================
  const handlePlayPause = (index) => {
    const videoEl = videoRefs.current[index];
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      setPlayingIndex(index);
    } else {
      videoEl.pause();
      setPlayingIndex(null);
    }
  };

  // ===================== MUTE/UNMUTE =====================
  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRefs.current.forEach((videoEl) => {
      if (videoEl) videoEl.muted = newMuted;
    });
  };

  if (loading) {
    return <p className="text-center mt-10 text-white">Loading reels...</p>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="w-full max-w-[430px] h-[95vh] bg-black rounded-xl overflow-hidden relative">
        {/* Mute Button */}
        <div className="absolute top-4 right-16 z-50">
          {" "}
          {/* ✅ right বদলালো */}
          <button
            onClick={handleMuteToggle}
            className="bg-black bg-opacity-50 rounded-full p-2"
          >
            {isMuted ? (
              <FaVolumeXmark className="text-white text-xl" />
            ) : (
              <FaVolumeHigh className="text-white text-xl" />
            )}
          </button>
        </div>

        <div className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
          {videos.map((video, index) => {
            const videoSrc = video.videourl
              ?.replace("/upload/", "/upload/f_mp4,vc_h264/")
              ?.replace("http://", "https://");

            const isPlaying = playingIndex === index;

            // ✅ Follow check
            const isOwnVideo =
              String(video?.createdBy?._id) === String(mydetails?._id);
            const isFollowing = followings?.includes(
              String(video?.createdBy?._id),
            );

            return (
              <div
                key={video._id}
                className="h-full snap-start relative flex items-center justify-center"
              >
                {/* VIDEO */}
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={videoSrc}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onClick={() => handlePlayPause(index)}
                />

                {/* PLAY OVERLAY */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {!isPlaying && (
                    <div className="bg-black bg-opacity-40 rounded-full p-4">
                      <FaPlay className="text-white text-3xl" />
                    </div>
                  )}
                </div>

                {/* LEFT INFO */}
                <div className="absolute bottom-20 left-4 text-white max-w-[65%]">
                  {/* ✅ avatar + username + follow একই row এ */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        if (isOwnVideo) {
                          navigate("/profile");
                        } else {
                          navigate(`/profile/${video?.createdBy?._id}`);
                        }
                      }}
                    >
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

                    {/* ✅ username এর পাশে, gap-2 দিয়ে */}
                    {!isOwnVideo && (
                      <FollowButton
                        userId={String(video?.createdBy?._id)}
                        isFollowedByBackend={isFollowing}
                      />
                    )}
                  </div>

                  {video.title && (
                    <p className="text-sm opacity-90">{video.title}</p>
                  )}
                </div>

                {/* RIGHT ACTIONS */}
                <div className="absolute right-4 bottom-24 flex flex-col gap-6 text-white text-xl">
                  <VideoLikeButton
                    videoId={video._id}
                    likeCount={video.likes}
                  />

                  <button
                    onClick={() => navigate(`/video/comments/${video._id}`)}
                    className="flex flex-col items-center gap-1"
                  >
                    <FaComment className="text-xl cursor-pointer" />
                    <span className="text-xs">{video.comments || 0}</span>
                  </button>

                  <button className="flex flex-col items-center gap-1">
                    <FaShareNodes className="text-2xl" />
                  </button>

                  <button className="flex flex-col items-center gap-1">
                    <FaBookmark className="text-2xl" />
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

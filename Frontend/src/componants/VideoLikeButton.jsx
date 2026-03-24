import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsVideoLiked,
  toggleVideoLike,
} from "../slices/video.like.slice";

function VideoLikeButton({ videoId, likeCount }) {
  const dispatch = useDispatch();
  const isLiked = useSelector((state) => {
    const videos = state.videoLikes.videos;
    console.log("videos →", videos);
    console.log("videoId →", videoId);
    console.log(
      "match →",
      videos.some((v) => String(v._id) === String(videoId)),
    );
    return videos.some((v) => String(v._id) === String(videoId));
  });
  return (
    <button
      onClick={() => dispatch(toggleVideoLike(videoId))}
      className="flex flex-col items-center gap-1 cursor-pointer"
    >
      {isLiked ? (
        <FaHeart className="text-red-500 text-2xl" />
      ) : (
        <FaRegHeart className="text-white text-2xl hover:text-red-400" />
      )}
      <span className="text-xs">{likeCount || 0}</span>
    </button>
  );
}

export default VideoLikeButton;

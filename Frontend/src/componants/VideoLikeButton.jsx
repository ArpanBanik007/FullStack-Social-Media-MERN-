import {
  selectIsVideoLiked,
  toggleVideoLike,
} from "../slices/video.like.slice";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

function VideoLikeButton({ videoId, likeCount }) {
  const dispatch = useDispatch();
  const isLiked = useSelector(selectIsVideoLiked(videoId));

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

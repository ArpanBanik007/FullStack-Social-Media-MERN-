import { FaHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { selectIsPostLiked, toggleLike } from "../slices/like.slice";

function LikeButton({ postId, likeCount }) {
  const dispatch = useDispatch();
  const isLiked = useSelector(selectIsPostLiked(postId));

  const handleLike = () => {
    dispatch(toggleLike(postId));
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-1 transition-colors duration-200
        ${
          isLiked
            ? "text-red-500" // liked → সবসময় red
            : "text-gray-400 hover:text-red-500" // not liked → grey, hover এ red
        }
      `}
    >
      <FaHeart />
      <span className="text-xs font-semibold">{likeCount}</span>
    </button>
  );
}

export default LikeButton;

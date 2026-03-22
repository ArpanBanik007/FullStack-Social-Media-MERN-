import { FaHeart, FaRegHeart } from "react-icons/fa";
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
      onClick={() => dispatch(toggleLike(postId))}
      className={`flex items-center cursor-pointer gap-1 transition-colors duration-200
        ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}
    >
      {isLiked ? <FaHeart /> : <FaRegHeart />}{" "}
      {/* ✅ liked হলে filled, না হলে outlined */}
      <span className="text-xs font-semibold">{likeCount}</span>
    </button>
  );
}

export default LikeButton;

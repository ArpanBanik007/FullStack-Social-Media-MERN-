import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { selectIsPostLiked, toggleLike, syncPostLike } from "../slices/like.slice";
import { useState, useEffect } from "react";

function LikeButton({ postId, likeCount }) {
  const dispatch = useDispatch();
  const isLiked = useSelector(selectIsPostLiked(postId));
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    setLocalLikeCount(likeCount);
  }, [likeCount]);

  const handleLike = () => {
    if (likeLoading) return;
    setLikeLoading(true);

    // Optimistic UI update
    const wasLiked = isLiked;
    setLocalLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    dispatch(syncPostLike({ postId, isLiked: !wasLiked }));
    
    dispatch(toggleLike(postId))
      .catch(() => {
        // Revert on error
        setLocalLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
        dispatch(syncPostLike({ postId, isLiked: wasLiked }));
      })
      .finally(() => {
        setLikeLoading(false);
      });
  };

  return (
    <button
      onClick={handleLike}
      disabled={likeLoading}
      className={`flex items-center cursor-pointer gap-1 transition-colors duration-200
        ${isLiked ? "text-red-500" : "text-gray-400 hover:text-red-500"}
        ${likeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLiked ? <FaHeart /> : <FaRegHeart />}{" "}
      {/* ✅ liked হলে filled, না হলে outlined */}
      <span className="text-xs font-semibold">{localLikeCount}</span>
    </button>
  );
}

export default LikeButton;

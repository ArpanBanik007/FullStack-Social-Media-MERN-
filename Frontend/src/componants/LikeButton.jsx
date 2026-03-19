import React from "react";
import { FaHeart } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { selectIsPostLiked } from "../slices/like.slice";

function LikeButton({ postId, likeCount }) {
  const dispatch = useDispatch();
  const isLiked = useSelector(selectIsPostLiked(postId));

  return (
    <button
      className={`flex items-center gap-1 ${
        isLiked ? "text-red-500" : "text-gray-400"
      } hover:text-red-500`}
    >
      <FaHeart />
      <span>Like</span>
      <span className="text-xs font-semibold">{likeCount}</span>
    </button>
  );
}

export default LikeButton;

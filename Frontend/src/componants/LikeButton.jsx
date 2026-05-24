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

    const wasLiked = isLiked;
    setLocalLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    dispatch(syncPostLike({ postId, isLiked: !wasLiked }));

    dispatch(toggleLike(postId))
      .catch(() => {
        setLocalLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
        dispatch(syncPostLike({ postId, isLiked: wasLiked }));
      })
      .finally(() => {
        setLikeLoading(false);
      });
  };

  return (
    <>
      <style>{`
        .pluto-like-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 8px;
          background: transparent;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .pluto-like-btn.liked {
          color: var(--pluto-like);
        }
        .pluto-like-btn.unliked {
          color: var(--pluto-text-secondary);
        }
        .pluto-like-btn.unliked:hover {
          background: var(--pluto-bg-hover);
          color: var(--pluto-like);
        }
        .pluto-like-btn.liked:hover {
          background: rgba(244, 114, 182, 0.08);
        }
        .pluto-like-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pluto-like-btn svg {
          font-size: 16px;
        }
      `}</style>

      <button
        onClick={handleLike}
        disabled={likeLoading}
        className={`pluto-like-btn ${isLiked ? "liked" : "unliked"}`}
      >
        {isLiked ? <FaHeart /> : <FaRegHeart />}
        <span>{localLikeCount}</span>
      </button>
    </>
  );
}

export default LikeButton;

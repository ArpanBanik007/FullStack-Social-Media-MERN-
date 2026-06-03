import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsVideoLiked,
  toggleVideoLike,
  syncVideoLike,
} from "../slices/video.like.slice";
import { useState, useEffect } from "react";

function VideoLikeButton({ videoId, likeCount }) {
  const dispatch = useDispatch();

  // ✅ Post এর মতো selector দিয়ে Redux state থেকে নাও
  const isLiked = useSelector(selectIsVideoLiked(videoId));

  const [localLikeCount, setLocalLikeCount] = useState(likeCount ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);

  // likeCount prop বদলালে sync করো (socket update)
  useEffect(() => {
    setLocalLikeCount(likeCount ?? 0);
  }, [likeCount]);

  const handleLike = () => {
    if (likeLoading) return;
    setLikeLoading(true);

    const wasLiked = isLiked;

    // ✅ Post এর মতো — আগেই count + Redux update (optimistic)
    setLocalLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    dispatch(syncVideoLike({ videoId, isLiked: !wasLiked }));

    dispatch(toggleVideoLike(videoId))
      .unwrap()
      .catch(() => {
        // ❌ Error হলে rollback
        setLocalLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
        dispatch(syncVideoLike({ videoId, isLiked: wasLiked }));
      })
      .finally(() => {
        setLikeLoading(false);
      });
  };

  return (
    <>
      <style>{`
        @keyframes heartPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.4); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .vp-like-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: transform 0.15s;
        }
        .vp-like-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .vp-like-icon-wrap {
          width: 42px; height: 42px;
          border-radius: 50%;
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          font-size: 19px;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .vp-like-icon-wrap.liked {
          background: rgba(239,68,68,0.2);
          border: 1px solid rgba(239,68,68,0.45);
          color: #ef4444;
        }
        .vp-like-icon-wrap.unliked {
          background: rgba(0,0,0,0.35);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
        }
        .vp-like-icon-wrap.unliked:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          color: #fca5a5;
        }
        .heart-pop { animation: heartPop 0.3s ease forwards; }
        .vp-like-count {
          font-size: 11px;
          font-weight: 700;
          text-shadow: 0 1px 3px rgba(0,0,0,0.5);
          transition: color 0.2s;
          font-family: 'Syne', sans-serif;
        }
      `}</style>

      <button
        className="vp-like-btn"
        onClick={handleLike}
        disabled={likeLoading}
      >
        <div
          className={`vp-like-icon-wrap ${isLiked ? "liked" : "unliked"} ${likeLoading ? "" : ""}`}
        >
          <span className={likeLoading ? "" : ""}>
            {isLiked ? <FaHeart /> : <FaRegHeart />}
          </span>
        </div>
        <span
          className="vp-like-count"
          style={{ color: isLiked ? "#fca5a5" : "rgba(255,255,255,0.8)" }}
        >
          {localLikeCount}
        </span>
      </button>
    </>
  );
}

export default VideoLikeButton;

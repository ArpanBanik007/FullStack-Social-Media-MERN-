import API from "../utils/API.js";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addFollowing, removeFollowing } from "../slices/follow.slice";

const FollowButton = ({ userId, isFollowedByBackend }) => {
  const dispatch = useDispatch();
  const [isFollowed, setIsFollowed] = useState(isFollowedByBackend);

  useEffect(() => {
    setIsFollowed(isFollowedByBackend);
  }, [isFollowedByBackend]);

  const handleToggle = async () => {
    try {
      if (isFollowed) {
        setIsFollowed(false);
        dispatch(removeFollowing(userId));
        await API.post(`/users/interactions/${userId}/unfollow`, {}, { withCredentials: true });
      } else {
        setIsFollowed(true);
        dispatch(addFollowing(userId));
        await API.post(`/users/interactions/${userId}/follow`, {}, { withCredentials: true });
      }
    } catch (err) {
      console.error("Follow failed", err);
      setIsFollowed(isFollowedByBackend);
    }
  };

  return (
    <>
      <style>{`
        .pluto-follow-btn {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .pluto-follow-btn.following {
          background: var(--pluto-bg-btn-outline);
          border: 1px solid #2a4060;
          color: var(--pluto-text-primary);
        }
        .pluto-follow-btn.following:hover {
          background: #1e3050;
          border-color: #3a5070;
        }
        .pluto-follow-btn.follow {
          background: transparent;
          border: 1px solid var(--pluto-accent);
          color: var(--pluto-accent);
        }
        .pluto-follow-btn.follow:hover {
          background: var(--pluto-accent-bg);
        }
      `}</style>

      <button
        onClick={handleToggle}
        className={`pluto-follow-btn ${isFollowed ? "following" : "follow"}`}
      >
        {isFollowed ? "Following" : "Follow"}
      </button>
    </>
  );
};

export default FollowButton;

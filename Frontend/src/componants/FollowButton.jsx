import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { addFollowing, removeFollowing } from "../slices/follow.slice";

const FollowButton = ({ userId, isFollowedByBackend }) => {
  const dispatch = useDispatch();

  // 🔥 backend truth first
  const [isFollowed, setIsFollowed] = useState(isFollowedByBackend);

  // 🔁 backend value change হলে sync
  useEffect(() => {
    setIsFollowed(isFollowedByBackend);
  }, [isFollowedByBackend]);

  const handleToggle = async () => {
    try {
      if (isFollowed) {
        setIsFollowed(false); // optimistic UI
        dispatch(removeFollowing(userId));

        await axios.delete(
          `http://localhost:8000/api/v1/users/interactions/${userId}/unfollow`,
          {
            withCredentials: true,
          },
        );
      } else {
        setIsFollowed(true);
        dispatch(addFollowing(userId));

        await axios.post(
          `http://localhost:8000/api/v1/users/interactions/${userId}/follow`,
          {},
          { withCredentials: true },
        );
      }
    } catch (err) {
      console.error("Follow failed", err);
      setIsFollowed(isFollowedByBackend); // rollback
    }
  };

  //

  return (
    <button
      onClick={handleToggle}
      className={`px-3 py-1 rounded text-white ${
        isFollowed ? "bg-gray-500" : "bg-blue-600 "
      }`}
    >
      {isFollowed ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;

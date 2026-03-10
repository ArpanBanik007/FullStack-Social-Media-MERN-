import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import UserAllPost from "./UserAllPost";
import UserAllVideos from "./UserAllVideos";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import FollowButton from "../componants/FollowButton";

function UserProfilePage() {
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);

  const followings = useSelector((state) => state.follow.followings);
  const { mydetails } = useSelector((state) => state.mydetails);

  // check if this profile is mine
  const isMyProfile = userId === mydetails?._id;

  // check if already following
  const isFollowing = followings?.includes(userId);

  console.log("Here is Is Following", isFollowing);

  // fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `http://localhost:8000/api/v1/users/user/${userId}`,
          { withCredentials: true },
        );

        setUser(res?.data?.data);
      } catch (error) {
        console.error("User fetch error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUser();
  }, [userId]);

  // tab content
  const renderContent =
    activeTab === "videos" ? (
      <UserAllVideos userId={userId} />
    ) : (
      <UserAllPost userId={userId} />
    );

  // loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  // user not found
  if (!user) {
    return <p className="text-center text-red-400 mt-20">User not found</p>;
  }

  return (
    <div className="flex flex-col mt-2 items-center w-full px-2 sm:px-4 md:pl-64">
      {/* cover image */}

      <div className="flex justify-center w-full">
        <div className="bg-black w-full sm:w-[80%] md:w-[60%] h-40 sm:h-64 md:h-80 rounded-xl overflow-hidden">
          <img
            src={user?.coverImage || "https://via.placeholder.com/800x300"}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* profile card */}

      <div className="bg-slate-700 w-full sm:w-[80%] md:w-[60%] mt-4 rounded-2xl p-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
          {/* avatar + follow button */}

          <div className="flex flex-col items-center sm:items-start">
            <img
              src={user?.avatar || "https://via.placeholder.com/150"}
              alt="dp"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md -mt-12 sm:mt-0"
            />

            {/* follow button */}

            {!isMyProfile && (
              <div className="mt-2">
                <FollowButton
                  userId={userId}
                  isFollowedByBackend={isFollowing}
                />
              </div>
            )}
          </div>

          {/* profile info */}

          <div className="flex flex-col mt-4 sm:mt-0 text-gray-200">
            <h2 className="text-xl sm:text-2xl font-medium">
              {user?.username}
            </h2>

            <p className="text-gray-300 font-semibold mt-1">{user?.fullName}</p>

            {/* followers */}

            <div className="flex gap-4 mt-3 text-gray-300 font-semibold">
              <p>{user?.followersCount ?? 0} Followers</p>

              <p>{user?.followingCount ?? 0} Following</p>
            </div>

            {/* bio */}

            <div className="mt-3">
              <h2 className="font-bold">Bio</h2>

              <p className="text-gray-300 font-semibold">
                {user?.bio || "No bio available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* tabs */}

      <div className="bg-slate-700 w-full sm:w-[80%] md:w-[60%] mt-3 rounded-2xl flex justify-around p-3 text-3xl text-white">
        <button
          onClick={() => setActiveTab("posts")}
          className={`p-2 rounded-full ${
            activeTab === "posts" ? "bg-slate-800" : "text-gray-400"
          }`}
        >
          <FaCamera />
        </button>

        <button
          onClick={() => setActiveTab("videos")}
          className={`p-2 rounded-full ${
            activeTab === "videos" ? "bg-slate-800" : "text-gray-400"
          }`}
        >
          <MdOndemandVideo />
        </button>
      </div>

      {/* content */}

      <div className="bg-slate-600 w-full sm:w-[80%] md:w-[60%] rounded-xl mt-3 p-4 text-gray-200">
        {renderContent}
      </div>
    </div>
  );
}

export default UserProfilePage;

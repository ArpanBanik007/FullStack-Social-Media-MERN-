import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import UserAllPost from "./UserAllPost";
import UserAllVideos from "./UserAllVideos";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleFollow = () => {
    setIsFollowing((prev) => !prev);
  };

  useEffect(() => {
    if (!userId) return;

    const fetchClickedUser = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `http://localhost:8000/api/v1/users/user/${userId}`,
          { withCredentials: true },
        );

        setUser(res.data?.data);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          navigate("/home");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClickedUser();
  }, [userId, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return <UserAllPost userId={userId} />;
      case "videos":
        return <UserAllVideos userId={userId} />;
      default:
        return <UserAllPost userId={userId} />;
    }
  };

  if (loading) {
    return <p className="text-center text-white mt-20">Loading...</p>;
  }

  if (!user) {
    return <p className="text-center text-red-400 mt-20">User not found</p>;
  }

  return (
    <div className="flex flex-col mt-2 items-center w-full px-2 sm:px-4 md:pl-64">
      {/* ✅ Cover Image */}
      <div className="flex justify-center w-full">
        <div className="bg-black w-full sm:w-[80%] md:w-[60%] h-40 sm:h-64 md:h-80 rounded-xl overflow-hidden">
          <img
            src={user?.coverImage || "https://via.placeholder.com/800x300"}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ✅ Profile Info Section */}
      <div className="bg-slate-700 w-full sm:w-[80%] md:w-[60%] mt-4 rounded-2xl p-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
          {/* Avatar + Follow */}
          <div className="flex flex-col items-center sm:items-start">
            <img
              src={user?.avatar || "https://via.placeholder.com/150"}
              alt="dp"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md -mt-12 sm:mt-0"
            />
            <button
              onClick={toggleFollow}
              type="button"
              className={`text-white text-sm mt-2 px-4 py-2 rounded-xl transition
                ${
                  isFollowing
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>

          {/* User Info */}
          <div className="flex flex-col mt-4 sm:mt-0 text-gray-200">
            <h2 className="text-xl sm:text-2xl font-medium">
              {user?.username}
            </h2>
            <p className="text-gray-300 font-semibold mt-1">{user?.fullName}</p>

            <div className="flex justify-center sm:justify-start gap-4 mt-3 text-gray-300 text-sm sm:text-base font-semibold">
              <p>{user?.followersCount || 0} Followers</p>
              <p>{user?.followingCount || 0} Following</p>
            </div>

            <div className="mt-3">
              <h2 className="font-bold">Bio</h2>
              <p className="text-gray-300 font-semibold text-sm sm:text-base">
                {user?.bio || "No bio available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Tabs */}
      <div className="bg-slate-700 w-full sm:w-[80%] md:w-[60%] mt-3 rounded-2xl flex justify-around p-3 text-3xl text-white">
        <button
          onClick={() => setActiveTab("posts")}
          className={`p-2 rounded-full ${
            activeTab === "posts" ? "bg-slate-800 text-white" : "text-gray-400"
          }`}
        >
          <FaCamera />
        </button>

        <button
          onClick={() => setActiveTab("videos")}
          className={`p-2 rounded-full ${
            activeTab === "videos" ? "bg-slate-800 text-white" : "text-gray-400"
          }`}
        >
          <MdOndemandVideo />
        </button>
      </div>

      {/* ✅ Content */}
      <div className="bg-slate-600 w-full sm:w-[80%] md:w-[60%] rounded-xl mt-3 p-4 text-gray-200">
        {renderContent()}
      </div>
    </div>
  );
}

export default UserProfilePage;

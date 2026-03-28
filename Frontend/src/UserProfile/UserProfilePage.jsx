import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { RiAccountCircleFill } from "react-icons/ri";
import UserAllPost from "./UserAllPost";
import UserAllVideos from "./UserAllVideos";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import FollowButton from "../componants/FollowButton";
import { fetchMyFollowings } from "../slices/follow.slice";

// ✅ Follow Modal Component
function FollowModal({ type, userId, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const url =
          type === "followers"
            ? `http://localhost:8000/api/v1/users/${userId}/followers`
            : `http://localhost:8000/api/v1/users/${userId}/followings`;

        const res = await axios.get(url, { withCredentials: true });

        const data =
          type === "followers"
            ? res.data?.data?.followers
            : res.data?.data?.followings;

        setList(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [type, userId]);

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Modal box */}
      <div
        className="bg-slate-800 w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-600">
          <h2 className="text-white font-semibold text-lg capitalize">
            {type}
          </h2>
          <button onClick={onClose}>
            <IoClose className="text-gray-400 text-2xl hover:text-white" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto py-2">
          {loading ? (
            <p className="text-gray-400 text-center py-6">Loading...</p>
          ) : list.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No {type} yet</p>
          ) : (
            list.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700 cursor-pointer transition"
                onClick={() => {
                  navigate(`/profile/${user._id}`);
                  onClose();
                }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    className="w-10 h-10 rounded-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <RiAccountCircleFill className="text-4xl text-gray-400" />
                )}
                <div>
                  <p className="text-white font-semibold text-sm">
                    @{user.username}
                  </p>
                  {user.fullName && (
                    <p className="text-gray-400 text-xs">{user.fullName}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Main Component
function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // ✅ "followers" | "followings" | null

  const followings = useSelector((state) => state.follow.followings);
  const { mydetails } = useSelector((state) => state.mydetails);

  const isMyProfile = userId === mydetails?._id;
  const isFollowing = followings?.includes(userId);

  useEffect(() => {
    dispatch(fetchMyFollowings());
  }, [dispatch]);

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

  const renderContent =
    activeTab === "videos" ? (
      <UserAllVideos userId={userId} />
    ) : (
      <UserAllPost userId={userId} />
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-red-400 mt-20">User not found</p>;
  }

  return (
    <div className="flex flex-col mt-2 items-center w-full px-2 sm:px-4 md:pl-64">
      {/* ✅ Modal */}
      {modalType && (
        <FollowModal
          type={modalType}
          userId={userId}
          onClose={() => setModalType(null)}
        />
      )}

      {/* Cover Image */}
      <div className="flex justify-center w-full">
        <div className="bg-black w-full sm:w-[80%] md:w-[60%] h-40 sm:h-64 md:h-80 rounded-xl overflow-hidden">
          <img
            src={user?.coverImage || "https://via.placeholder.com/800x300"}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-700 w-full sm:w-[80%] md:w-[60%] mt-4 rounded-2xl p-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
          {/* Avatar + Follow button */}
          <div className="flex flex-col items-center sm:items-start">
            <img
              src={user?.avatar || "https://via.placeholder.com/150"}
              alt="dp"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-md -mt-12 sm:mt-0"
            />
            {!isMyProfile && (
              <div className="mt-2 ml-5">
                <FollowButton
                  userId={userId}
                  isFollowedByBackend={isFollowing}
                />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex flex-col mt-4 sm:mt-0 text-gray-200">
            <h2 className="text-xl sm:text-2xl font-medium">
              {user?.username}
            </h2>
            <p className="text-gray-300 font-semibold mt-1">{user?.fullName}</p>

            {/* ✅ Followers/Following buttons */}
            <div className="flex gap-4 mt-3 text-gray-300 font-semibold">
              <button
                onClick={() => setModalType("followers")}
                className="hover:text-white transition"
              >
                {user?.followersCount ?? 0} Followers
              </button>

              <button
                onClick={() => setModalType("followings")}
                className="hover:text-white transition"
              >
                {user?.followingCount ?? 0} Following
              </button>
            </div>

            {/* Bio */}
            <div className="mt-3">
              <h2 className="font-bold">Bio</h2>
              <p className="text-gray-300 font-semibold">
                {user?.bio || "No bio available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Content */}
      <div className="bg-slate-600 w-full sm:w-[80%] md:w-[60%] rounded-xl mt-3 p-4 text-gray-200">
        {renderContent}
      </div>
    </div>
  );
}

export default UserProfilePage;

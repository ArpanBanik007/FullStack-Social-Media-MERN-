import React, { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import { FaBookmark } from "react-icons/fa";
import { RiAccountCircleFill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import AllPosts from "./AllPosts";
import AllVideos from "./AllVideos";
import AllSaved from "./AllSaved";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyPosts } from "../slices/postSlice";

// ✅ Modal Component
function FollowModal({ type, userId, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchList = async () => {
      try {
        const url =
          type === "followers"
            ? "http://localhost:8000/api/v1/users/my-followers"
            : "http://localhost:8000/api/v1/users/my-followings";

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
  }, [type]);

  return (
    // ✅ Backdrop — বাইরে click করলে বন্ধ হবে
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* ✅ Modal box — ভেতরে click করলে বন্ধ হবে না */}
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
export default function MyProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState(null);
  const [modalType, setModalType] = useState(null); // "followers" | "followings" | null
  const dispatch = useDispatch();
  const { posts } = useSelector((state) => state.posts);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/users/current-user");
        setUser(res.data.data);
      } catch (error) {
        console.error("Unauthorized, please login");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (!posts || posts.length === 0) {
      dispatch(fetchMyPosts());
    }
  }, [dispatch]);

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return <AllPosts />;
      case "videos":
        return <AllVideos />;
      case "saved":
        return <AllSaved />;
      default:
        return <AllPosts />;
    }
  };

  if (!user) {
    return <p className="text-center text-white mt-20">Loading...</p>;
  }

  return (
    <div className="flex flex-col mt-2 items-center w-full px-2 sm:px-4 md:pl-64">
      {/* ✅ Modal */}
      {modalType && (
        <FollowModal
          type={modalType}
          userId={user._id}
          onClose={() => setModalType(null)}
        />
      )}

      {/* Cover Image */}
      <div className="flex justify-center w-full">
        <div className="bg-black w-full sm:w-[80%] md:w-[60%] h-40 sm:h-64 md:h-80 rounded-xl overflow-hidden cursor-pointer">
          <img
            src={user.coverImage}
            alt="cover"
            className="w-full h-full object-center"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-slate-700 w-full sm:w-[80%] md:w-[60%] mt-4 rounded-2xl p-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
          <div className="flex flex-col items-center sm:items-start">
            <img
              src={user.avatar}
              alt="dp"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-fill border-4 border-white shadow-md -mt-12 sm:mt-0"
            />
            <button
              onClick={() => navigate("/settings")}
              className="bg-slate-500 text-gray-200 text-sm mt-2 px-4 py-2 rounded-xl hover:bg-slate-600 transition"
            >
              Edit Profile
            </button>
          </div>

          <div className="flex flex-col mt-4 sm:mt-0 text-gray-200">
            <h2 className="text-xl sm:text-2xl font-medium">{user.username}</h2>
            <p className="text-gray-300 font-semibold mt-1">{user.fullName}</p>

            {/* ✅ Count buttons */}
            <div className="flex justify-center sm:justify-start gap-4 mt-3 text-gray-300 text-sm sm:text-base font-semibold">
              <p>{posts?.length || 0} Posts</p>

              <button
                onClick={() => setModalType("followers")}
                className="hover:text-white transition"
              >
                {user.followersCount || 0} Followers
              </button>

              <button
                onClick={() => setModalType("followings")}
                className="hover:text-white transition"
              >
                {user.followingCount || 0} Following
              </button>
            </div>

            <div className="mt-3">
              <h2 className="font-bold">Bio</h2>
              <p className="text-gray-300 font-semibold text-sm sm:text-base">
                {user.bio || "No bio available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-700 w-full sm:w-[80%] md:w-[60%] mt-3 rounded-2xl flex justify-around p-3 text-3xl text-white">
        <button
          onClick={() => setActiveTab("posts")}
          className={`p-2 rounded-full ${activeTab === "posts" ? "bg-slate-800 text-white" : "text-gray-400"}`}
        >
          <FaCamera />
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`p-2 rounded-full ${activeTab === "videos" ? "bg-slate-800 text-white" : "text-gray-400"}`}
        >
          <MdOndemandVideo />
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`p-2 rounded-full ${activeTab === "saved" ? "bg-slate-800 text-white" : "text-gray-400"}`}
        >
          <FaBookmark />
        </button>
      </div>

      {/* Content */}
      <div className="bg-slate-600 w-full sm:w-[80%] md:w-[60%] rounded-xl mt-3 p-4 text-gray-200">
        {renderContent()}
      </div>
    </div>
  );
}

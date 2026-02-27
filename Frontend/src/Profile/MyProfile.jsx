import React, { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import { FaBookmark } from "react-icons/fa";
import AllPosts from "./AllPosts";
import AllVideos from "./AllVideos";
import AllSaved from "./AllSaved";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyPosts } from "../slices/postSlice"; // 👈 তোমার slice থেকে import করবে

export default function MyProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.posts);

  // ✅ User fetch
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

  // ✅ Posts fetch (only once)
  useEffect(() => {
    if (!posts || posts.length === 0) {
      dispatch(fetchMyPosts());
    }
  }, [dispatch]);

  // ✅ Tabs
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
      {/* ✅ Cover Image */}
      <div className="flex justify-center w-full">
        <div className="bg-black w-full sm:w-[80%] md:w-[60%] h-40 sm:h-64 md:h-80 rounded-xl overflow-hidden cursor-pointer">
          <img
            src={user.coverImage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ✅ Profile Info */}
      <div className=" bg-slate-700 w-full sm:w-[80%] md:w-[60%] mt-4 rounded-2xl p-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
          <div className="flex flex-col items-center sm:items-start">
            <img
              src={user.avatar}
              alt="dp"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-fill border-4 border-white shadow-md -mt-12 sm:mt-0"
            />
            <button
              onClick={() => navigate("/settings")}
              type="button"
              className="bg-slate-500 text-gray-200 text-sm mt-2 px-4 py-2 rounded-xl hover:bg-slate-600 transition"
            >
              Edit Profile
            </button>
          </div>

          {/* Username & Bio */}
          <div className="flex flex-col mt-4 sm:mt-0 text-gray-200">
            <h2 className="text-xl sm:text-2xl font-medium">{user.username}</h2>
            <p className="text-gray-300 font-semibold mt-1">{user.fullName}</p>

            {/* ✅ Post count dynamically from Redux */}
            <div className="flex justify-center sm:justify-start gap-4 mt-3 text-gray-300 text-sm sm:text-base font-semibold">
              <p>{posts?.length || 0} Posts</p>
              <p>{user.followersCount} Followers</p>
              <p>{user.followingCount} Following</p>
            </div>

            <div className="mt-3">
              <h2 className="font-bold">Bio</h2>
              <p className="text-gray-300 font-semibold text-sm sm:text-base">
                #rcb ❤🖤 #fcbarcelona 💙❤ Selenophile 🌛❤
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
        <button
          onClick={() => setActiveTab("saved")}
          className={`p-2 rounded-full ${
            activeTab === "saved" ? "bg-slate-800 text-white" : "text-gray-400"
          }`}
        >
          <FaBookmark />
        </button>
      </div>

      {/* ✅ Content Section */}
      <div className="bg-slate-600 w-full sm:w-[80%] md:w-[60%] rounded-xl mt-3 p-4 text-gray-200">
        {renderContent()}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { FaCamera } from "react-icons/fa";
import { MdOndemandVideo } from "react-icons/md";
import { FaBookmark } from "react-icons/fa";
import UserAllPost from "./UserAllPost";
import UserAllVideos from "./UserAllVideos";

function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("posts");
  const [isfollowing, setFollowing] = useState(false);
  const toggleFollow = () => {
    setFollowing(!isfollowing); // true হলে false করবে, false হলে true
  };

  const renderContent = () => {
    switch (activeTab) {
      case "posts":
        return <UserAllPost />;
      case "videos":
        return <UserAllVideos />;

      default:
        return <UserAllPost />;
    }
  };

  return (
    <div className="flex flex-col mt-1">
      <div className="flex justify-center pt-2 pl-50">
        <div className="bg-black w-[60%] h-90 rounded-xl overflow-hidden">
          <img
            src="https://plus.unsplash.com/premium_photo-1673177667569-e3321a8d8256?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y292ZXIlMjBwaG90b3xlbnwwfHwwfHx8MA%3D%3D"
            alt="center"
            className="w-full h-full object-center"
          />
        </div>
      </div>

      <div className="bg-slate-700 w-[51%] mt-2 mb-2 rounded-2xl ml-[32%]">
        <div className="absolute ml-5 mt-3">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUvukVHOeioDmSUl1VSeKCb2pZBdvfxiPgjQ&s"
            alt="dp"
            className="w-32 h-32 rounded-full object-center border-4 border-white shadow-md"
          />
          <div className="flex justify-center items-center">
            <button
              onClick={toggleFollow}
              type="button"
              className={`px-4 py-2 mt-2.5 cursor-pointer rounded-lg font-semibold transition 
        ${
          isfollowing
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        } 
        text-white`}
            >
              {isfollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-center mt-8 mb-3">
          <div className="flex flex-col ml-17">
            <h2 className=" text-gray-200 text-2xl font-medium ml-25">
              arpanbanik007
            </h2>
            <p className=" text-gray-200 font-semibold mt-1.5 ml-27">
              Arpan Banik
            </p>
          </div>

          <div className="flex justify-between mt-3.5 ml-43 w-[45%]">
            <p className="text-gray-300 text-base font-semibold">23 Posts </p>
            <p className="text-gray-300 text-base font-semibold">
              1000 Followers
            </p>
            <p className="text-gray-300 text-base font-semibold">
              28 Following
            </p>
          </div>
          <div className="flex flex-col text-gray-300 text-base font-bold ml-43 h-25">
            <h2 className="mt-4 mb-1.5">Bio</h2>
            <p className=" text-gray-300 font-semibold">
              #rcb ❤️🖤 #fcbarcelona 💙❤️ Selenophile 🌛❤️
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Icons with hover label */}
      <div className="bg-slate-700 h-17  w-[51%] mt-1 mb-2 rounded-2xl ml-[32%] relative overflow-visible">
        <div className="flex justify-between p-3 text-3xl text-white ">
          <button
            onClick={() => setActiveTab("posts")}
            className={`p-2 rounded-full ${
              activeTab === "posts"
                ? "bg-slate-700 text-white"
                : "text-gray-400"
            }`}
          >
            <FaCamera className="cursor-pointer" />
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`p-2 rounded-full ${
              activeTab === "videos"
                ? "bg-slate-700 text-white"
                : "text-gray-400"
            }`}
          >
            <MdOndemandVideo className="cursor-pointer" />
          </button>
        </div>
      </div>
      <div className="bg-slate-600 w-[51%] rounded-xl ml-[32%] p-4 text-gray-200">
        {renderContent()}
      </div>
    </div>
  );
}

export default UserProfilePage;

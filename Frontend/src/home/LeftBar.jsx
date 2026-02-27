import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RiAccountCircleFill } from "react-icons/ri";
import { AiFillHome } from "react-icons/ai";
import { IoMdSettings } from "react-icons/io";
import { MdOndemandVideo } from "react-icons/md";
import { FaBookmark, FaHistory } from "react-icons/fa";
import { FaBell } from "react-icons/fa6";

function LeftBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const linkClass = (path) =>
    `flex items-center gap-3 p-4 rounded-2xl shadow-md w-full mt-1.5 cursor-pointer 
     transition hover:bg-cyan-500 ${
       location.pathname === path ? "bg-cyan-700" : "bg-slate-700"
     }`;

  return (
    <div
      className="fixed top-22 left-3 w-[25%]
        bg-slate-800 overflow-y-auto scrollbar-thin 
        scrollbar-thumb-gray-900 scrollbar-track-gray-300 rounded-xl"
    >
      {/* Home */}
      <div
        className={linkClass("/home")}
        onClick={() =>
          location.pathname === "/home"
            ? window.location.reload()
            : navigate("/home")
        }
      >
        <div className="text-3xl text-gray-100">
          <AiFillHome />
        </div>
        <span className="text-lg text-gray-100 font-medium">Home</span>
      </div>

      {/* Profile */}
      <div
        className={linkClass("/profile")}
        onClick={() =>
          location.pathname === "/profile"
            ? window.location.reload()
            : navigate("/profile")
        }
      >
        <div className="text-3xl text-gray-100">
          <RiAccountCircleFill />
        </div>
        <span className="text-lg text-gray-100 font-medium">Profile</span>
      </div>

      {/* Videos */}
      <div
        className={linkClass("/videos")}
        onClick={() =>
          location.pathname === "/videos"
            ? window.location.reload()
            : navigate("/videos")
        }
      >
        <div className="text-3xl text-gray-100">
          <MdOndemandVideo />
        </div>
        <span className="text-lg text-gray-100 font-medium">Videos</span>
      </div>

      {/* Settings */}
      <div
        className={linkClass("/settings")}
        onClick={() =>
          location.pathname === "/settings"
            ? window.location.reload()
            : navigate("/settings")
        }
      >
        <div className="text-3xl text-gray-100">
          <IoMdSettings />
        </div>
        <span className="text-lg text-gray-100 font-medium">Settings</span>
      </div>

      {/* Saved */}
      <div
        className={linkClass("/saved")}
        onClick={() =>
          location.pathname === "/saved"
            ? window.location.reload()
            : navigate("/saved")
        }
      >
        <div className="text-3xl text-gray-100">
          <FaBookmark />
        </div>
        <span className="text-lg text-gray-100 font-medium">Saved</span>
      </div>

      {/* History */}
      <div
        className={linkClass("/history")}
        onClick={() =>
          location.pathname === "/history"
            ? window.location.reload()
            : navigate("/history")
        }
      >
        <div className="text-3xl text-gray-100">
          <FaHistory />
        </div>
        <span className="text-lg text-gray-100 font-medium">History</span>
      </div>

      {/* Notifications */}
      <div
        className={linkClass("/notifications")}
        onClick={() => navigate("/")}
      >
        <div className="text-3xl text-gray-100">
          <FaBell />
        </div>
        <span className="text-lg text-gray-100 font-medium">Notifications</span>
      </div>
    </div>
  );
}

export default LeftBar;

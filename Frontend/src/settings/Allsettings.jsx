import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUnlockAlt, FaComments } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { IoNotifications, IoChevronForward } from "react-icons/io5";
import { ImBlocked } from "react-icons/im";
import { FcLike } from "react-icons/fc";

const settingsItems = [
  {
    icon: <FaUnlockAlt />,
    label: "Password & Security",
    route: "/settings/security",
    color: "text-blue-400",
  },
  {
    icon: <CgProfile />,
    label: "Profile Settings",
    route: "/settings/profile",
    color: "text-purple-400",
  },
  {
    icon: <IoNotifications />,
    label: "Notification Settings",
    route: null,
    color: "text-yellow-400",
  },
  {
    icon: <ImBlocked />,
    label: "Blocked",
    route: null,
    color: "text-red-400",
  },
  {
    icon: <FaComments />,
    label: "Comments Count",
    route: "/mycomments",
    color: "text-green-400",
  },
  {
    icon: <FcLike />,
    label: "Like Count",
    route: null,
    color: "text-pink-400",
  },
];

function Allsettings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-6">
      <h1 className="text-white text-2xl font-bold mb-6 px-1">Settings</h1>

      <div className="max-w-md mx-auto flex flex-col gap-3">
        {settingsItems.map((item, index) => (
          <div
            key={index}
            onClick={() => item.route && navigate(item.route)}
            className={`flex items-center justify-between bg-gray-800 hover:bg-gray-700 transition-colors duration-200 rounded-2xl px-4 py-4 ${
              item.route ? "cursor-pointer" : "cursor-default opacity-70"
            }`}
          >
            {/* Left — icon + label */}
            <div className="flex items-center gap-4">
              <div className={`text-2xl ${item.color}`}>{item.icon}</div>
              <p className="text-white text-base font-medium">{item.label}</p>
            </div>

            {/* Right — arrow */}
            {item.route && (
              <IoChevronForward className="text-gray-400 text-lg" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Allsettings;

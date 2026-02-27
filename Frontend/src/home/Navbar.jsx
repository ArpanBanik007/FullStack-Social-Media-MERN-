import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { MdOndemandVideo } from "react-icons/md";
import { BiVideoPlus } from "react-icons/bi";
import { FaBell } from "react-icons/fa6";
import { RiAccountCircleFill } from "react-icons/ri";
import { TiThMenu } from "react-icons/ti";
import SearchBar from "../componants/SearchBar";
import { persistor } from "../store/store";
import { resetMyDetails } from "../slices/mydetails.slice";
import { resetMyPosts } from "../slices/postSlice";
import axios from "axios";
import { useDispatch } from "react-redux";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // ✅ Logout Handler (Fully Fixed)
  const handleLogout = async () => {
    try {
      // 🔐 Backend logout API call
      await axios.post(
        "http://localhost:8000/api/v1/users/logout",
        {},
        { withCredentials: true },
      );

      // 🧹 Redux store clear
      dispatch(resetMyDetails());
      dispatch(resetMyPosts());

      // 🧹 Clear persist cache
      await persistor.purge();

      localStorage.clear();
      sessionStorage.clear();

      // 🔁 Redirect to login
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  const icons = [
    {
      id: 1,
      path: "/home",
      icon: <IoMdHome />,
      label: "Home",
      onClick: () =>
        location.pathname === "/home"
          ? window.location.reload()
          : navigate("/home"),
    },
    {
      id: 2,
      path: "/videos",
      icon: <MdOndemandVideo />,
      label: "Videos",
      onClick: () =>
        location.pathname === "/videos"
          ? window.location.reload()
          : navigate("/videos"),
    },
    {
      id: 3,
      path: "/upload",
      icon: <BiVideoPlus />,
      label: "Upload",
      onClick: () =>
        location.pathname === "/upload"
          ? window.location.reload()
          : navigate("/upload"),
    },
    {
      id: 4,
      path: "/notifications",
      icon: <FaBell />,
      label: "Notifications",
      onClick: () =>
        location.pathname === "/notifications"
          ? window.location.reload()
          : navigate("/notifications"),
    },
  ];

  return (
    <nav className="sticky top-0 w-full bg-slate-700 flex items-center justify-between px-4 h-14 shadow-md z-50">
      {/* ✅ Logo */}
      <p
        className="text-2xl font-semibold italic text-slate-300 hover:bg-slate-900 px-2 py-1 rounded-md cursor-pointer"
        onClick={() =>
          location.pathname === "/home"
            ? window.location.reload()
            : navigate("/home")
        }
      >
        Pluto
      </p>

      {/* ✅ SearchBar */}
      <div className="flex-1 max-w-md mx-3">
        <SearchBar placeholder="Search..." />
      </div>

      {/* ✅ Desktop Icons */}
      <div className="hidden md:flex items-center gap-30 text-3xl text-slate-300 relative">
        {icons.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.id}
              onClick={item.onClick}
              className={`relative group cursor-pointer transition-all ${
                isActive
                  ? "bg-slate-900 rounded-full p-2 text-white"
                  : "hover:text-white"
              }`}
            >
              {item.icon}
              <span className="absolute bottom-[-35px] left-1/2 -translate-x-1/2 bg-black text-white text-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                {item.label}
              </span>
            </div>
          );
        })}

        {/* ✅ Profile Icon */}
        <div className="relative">
          <div
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className={`cursor-pointer transition-all ${
              location.pathname === "/profile"
                ? "bg-slate-900 rounded-full p-2 text-white"
                : "hover:text-white"
            }`}
          >
            <RiAccountCircleFill />
          </div>

          {/* ✅ Profile Dropdown */}
          {showProfileMenu && (
            <>
              {/* Click outside to close */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              ></div>

              <div className="absolute top-12 right-0 bg-slate-800 text-gray-100 rounded-xl shadow-xl w-44 py-2 z-50 flex flex-col border border-slate-600 animate-fadeIn">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setShowProfileMenu(false);
                  }}
                  className="px-4 py-2 text-left hover:bg-slate-700 transition-all duration-200 text-[15px] font-medium tracking-wide"
                >
                  👤 My Profile
                </button>

                <div className="h-[1px] bg-slate-600 my-1"></div>

                <button
                  onClick={() => {
                    handleLogout();
                    setShowProfileMenu(false);
                  }}
                  className="px-4 py-2 text-left text-red-400 hover:bg-slate-700 transition-all duration-200 text-[15px] font-medium tracking-wide"
                >
                  🚪 Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ✅ Mobile Menu Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="md:hidden text-3xl mr-2.5 text-slate-300 hover:text-white"
      >
        <TiThMenu />
      </button>

      {/* ✅ Mobile Dropdown */}
      {showMenu && (
        <>
          {/* Background Blur */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowMenu(false)}
          ></div>

          {/* Dropdown Content */}
          <div className="absolute top-14 right-4 bg-slate-800 text-gray-100 rounded-xl shadow-lg p-4 w-52 z-50 flex flex-col gap-2 border border-slate-600 animate-fadeIn">
            {icons.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 hover:bg-slate-700 px-3 py-2 rounded-md transition text-[15px]"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            <button
              onClick={() => {
                navigate("/profile");
                setShowMenu(false);
              }}
              className="flex items-center gap-2 hover:bg-slate-700 px-3 py-2 rounded-md transition text-[15px]"
            >
              <RiAccountCircleFill />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                handleLogout();
                setShowMenu(false);
              }}
              className="flex items-center gap-2 hover:bg-slate-700 px-3 py-2 rounded-md text-red-400 transition text-[15px]"
            >
              🚪 <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </nav>
  );
}

export default Navbar;

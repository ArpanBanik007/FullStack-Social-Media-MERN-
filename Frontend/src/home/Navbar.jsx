import API from "../utils/API.js";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { MdOndemandVideo } from "react-icons/md";
import { BiVideoPlus } from "react-icons/bi";
import { FaBell } from "react-icons/fa6";
import { RiAccountCircleFill } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import { BsChatLeftTextFill } from "react-icons/bs";
import SearchBar from "../componants/SearchBar";
import { persistor } from "../store/store";
import { resetMyDetails } from "../slices/mydetails.slice";
import { resetMyPosts } from "../slices/postSlice";

import { useDispatch, useSelector } from "react-redux";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.mydetails?.user);

  const unreadCount = useSelector((state) => 
    state.chat?.conversations?.reduce((total, conv) => {
      return total + (conv.unreadCounts?.[currentUser?._id] || 0);
    }, 0) || 0
  );

  const ICONS = [
    { id: 1, path: "/home", icon: <IoMdHome />, label: "Home" },
    { id: 2, path: "/videos", icon: <MdOndemandVideo />, label: "Videos" },
    { id: 3, path: "/upload", icon: <BiVideoPlus />, label: "Upload" },
    {
      id: 4,
      path: "/notifications",
      icon: <FaBell />,
      label: "Notifications",
      badge: 3,
    },
    {
      id: 5,
      path: "/chat",
      icon: <BsChatLeftTextFill />,
      label: "Chats",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const handleNav = (path) => {
    if (location.pathname === path) window.location.reload();
    else navigate(path);
  };

  const handleLogout = async () => {
    try {
      await API.post("/users/logout", {}, { withCredentials: true });
      dispatch(resetMyDetails());
      dispatch(resetMyPosts());
      await persistor.purge();
      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  return (
    <>
      <style>{`
        .navbar-root {
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
          height: 70px;
          background: rgba(7, 17, 32, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          gap: 24px;
        }

        .navbar-logo {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -1px;
          cursor: pointer;
          background: linear-gradient(to right, #00D9FF, #6EE7FF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: all 0.3s ease;
        }
        .navbar-logo:hover { 
          filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.4));
          transform: scale(1.02);
        }

        .navbar-search {
          flex: 1;
          max-width: 500px;
          position: relative;
        }

        .navbar-icons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-icon-btn {
          position: relative;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: var(--text-secondary);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
          cursor: pointer;
        }

        .nav-icon-btn:hover {
          color: var(--accent-primary);
          background: rgba(0, 217, 255, 0.05);
          border-color: rgba(0, 217, 255, 0.2);
          transform: translateY(-2px);
        }

        .nav-icon-btn.active {
          color: var(--accent-primary);
          background: rgba(0, 217, 255, 0.1);
          border-color: rgba(0, 217, 255, 0.3);
          box-shadow: 0 0 15px rgba(0, 217, 255, 0.15);
        }

        .nav-icon-btn svg {
          font-size: 22px;
        }

        .nav-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          min-width: 16px;
          height: 16px;
          padding: 0 4px;
          background: #FF3B3B;
          color: white;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-deep);
          animation: pulse-badge 2s infinite;
        }

        @keyframes pulse-badge {
          0% { box-shadow: 0 0 0 0 rgba(255, 59, 59, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(255, 59, 59, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 59, 59, 0); }
        }

        .nav-divider {
          width: 1px;
          height: 24px;
          background: var(--glass-border);
          margin: 0 8px;
        }

        .profile-btn {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid var(--glass-border);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-elevated);
          color: var(--text-secondary);
          font-size: 28px;
        }

        .profile-btn:hover, .profile-btn.active {
          border-color: var(--accent-primary);
          transform: scale(1.05);
          color: var(--accent-primary);
          box-shadow: var(--neon-glow);
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 15px);
          right: 0;
          width: 220px;
          padding: 10px;
          background: rgba(17, 28, 46, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          z-index: 1001;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          width: 100%;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          background: transparent;
          text-align: left;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          transform: translateX(4px);
        }

        .dropdown-item.danger { color: #FF5252; }
        .dropdown-item.danger:hover { background: rgba(255, 82, 82, 0.1); }

        .dropdown-sep {
          height: 1px;
          background: var(--glass-border);
          margin: 8px 0;
        }

        .mobile-right { display: none; }

        @media (max-width: 768px) {
          .navbar-root { padding: 0 20px; }
          .navbar-icons { display: none; }
          .mobile-right { display: flex; align-items: center; gap: 12px; }
          .navbar-search { display: none; }
        }
      `}</style>

      <nav className="navbar-root">
        <div className="navbar-logo" onClick={() => handleNav("/home")}>
          Pluto
        </div>

        <div className="navbar-search">
          <SearchBar placeholder="Search cosmic universe..." />
        </div>

        <div className="navbar-icons">
          {ICONS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <div
                key={item.id}
                className={`nav-icon-btn ${isActive ? "active" : ""}`}
                onClick={() => handleNav(item.path)}
              >
                {item.icon}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            );
          })}

          <div className="nav-divider" />

          <div style={{ position: "relative" }}>
            <div
              className={`profile-btn ${
                location.pathname === "/profile" || showProfileMenu
                  ? "active"
                  : ""
              }`}
              onClick={() => setShowProfileMenu((p) => !p)}
            >
              <RiAccountCircleFill />
            </div>

            {showProfileMenu && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 1000 }}
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="profile-dropdown">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/profile");
                      setShowProfileMenu(false);
                    }}
                  >
                    <RiAccountCircleFill style={{ fontSize: 18 }} /> My Profile
                  </button>
                  <div className="dropdown-sep" />
                  <button
                    className="dropdown-item danger"
                    onClick={() => {
                      handleLogout();
                      setShowProfileMenu(false);
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mobile-right">
          <button
            className="mobile-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <BsThreeDotsVertical />
          </button>
        </div>
      </nav>
    </>
  );
}

export default Navbar;

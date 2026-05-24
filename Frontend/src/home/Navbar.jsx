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

  const unreadCount = useSelector(
    (state) =>
      state.chat?.conversations?.reduce((total, conv) => {
        return total + (conv.unreadCounts?.[currentUser?._id] || 0);
      }, 0) || 0,
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
        /* ── Navbar root ── */
        .navbar-root {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          height: 64px;
          background: var(--pluto-bg-navbar);
          border-bottom: 1px solid var(--pluto-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          gap: 16px;
          flex-shrink: 0;
        }

        /* ── Logo ── */
        .navbar-logo {
          font-size: 22px;
          font-weight: 700;
          color: var(--pluto-accent);
          cursor: pointer;
          letter-spacing: -0.5px;
          flex-shrink: 0;
          transition: opacity 0.2s ease;
        }
        .navbar-logo:hover { opacity: 0.85; }

        /* ── Search wrapper ── */
        .navbar-search {
          flex: 1;
          max-width: 420px;
        }

        /* ── Icon group ── */
        .navbar-icons {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        /* ── Individual icon button ── */
        .nav-icon-btn {
          position: relative;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: var(--pluto-icon-default);
          transition: background 0.2s ease, color 0.2s ease;
          cursor: pointer;
          border: none;
          background: transparent;
        }
        .nav-icon-btn svg { font-size: 22px; }

        .nav-icon-btn:hover {
          background: var(--pluto-bg-hover);
          color: var(--pluto-text-primary);
        }

        .nav-icon-btn.active {
          color: var(--pluto-icon-active);
          background: var(--pluto-accent-bg);
        }

        /* ── Notification badge ── */
        .nav-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: var(--pluto-badge);
          color: #ffffff;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--pluto-bg-navbar);
        }

        /* ── Divider ── */
        .nav-divider {
          width: 1px;
          height: 24px;
          background: var(--pluto-border);
          margin: 0 4px;
        }

        /* ── Profile avatar button ── */
        .profile-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid var(--pluto-border);
          transition: border-color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--pluto-bg-input);
          color: var(--pluto-text-secondary);
          font-size: 26px;
        }
        .profile-btn:hover,
        .profile-btn.active {
          border-color: var(--pluto-accent);
          color: var(--pluto-accent);
        }

        /* ── Dropdown ── */
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 200px;
          padding: 8px;
          background: var(--pluto-bg-card);
          border: 1px solid var(--pluto-border);
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          z-index: 1001;
          animation: pluto-dropdown 0.2s ease;
        }
        @keyframes pluto-dropdown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .dropdown-item {
          width: 100%;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--pluto-text-secondary);
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          transition: background 0.15s ease, color 0.15s ease;
          cursor: pointer;
          border: none;
          background: transparent;
          text-align: left;
        }
        .dropdown-item:hover {
          background: var(--pluto-bg-hover);
          color: var(--pluto-text-primary);
        }
        .dropdown-item.danger { color: #f87171; }
        .dropdown-item.danger:hover { background: rgba(248, 113, 113, 0.08); }

        .dropdown-sep {
          height: 1px;
          background: var(--pluto-border);
          margin: 6px 0;
        }

        /* ── Mobile ── */
        .mobile-right { display: none; }
        @media (max-width: 768px) {
          .navbar-root    { padding: 0 16px; }
          .navbar-icons   { display: none; }
          .mobile-right   { display: flex; align-items: center; gap: 10px; }
          .navbar-search  { display: none; }
        }
      `}</style>

      <nav className="navbar-root">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => handleNav("/home")}>
          Pluto
        </div>

        {/* Search */}
        <div className="navbar-search">
          <SearchBar placeholder="Search cosmic universe..." />
        </div>

        {/* Nav Icons */}
        <div className="navbar-icons">
          {ICONS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <div
                key={item.id}
                className={`nav-icon-btn ${isActive ? "active" : ""}`}
                onClick={() => handleNav(item.path)}
                title={item.label}
              >
                {item.icon}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            );
          })}

          <div className="nav-divider" />

          {/* Profile */}
          <div style={{ position: "relative" }}>
            <div
              className={`profile-btn ${
                location.pathname === "/profile" || showProfileMenu ? "active" : ""
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

        {/* Mobile fallback */}
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

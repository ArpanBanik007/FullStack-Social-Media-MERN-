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
import { FiSearch } from "react-icons/fi";
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

        /* ════════════════════════════════
           DESKTOP NAVBAR — একদম same
        ════════════════════════════════ */
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
        .navbar-search {
          flex: 1;
          max-width: 420px;
        }
        .navbar-icons {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
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
        .nav-divider {
          width: 1px;
          height: 24px;
          background: var(--pluto-border);
          margin: 0 4px;
        }
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
          to   { opacity: 1; transform: translateY(0); }
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
        .mobile-right { display: none; }

        /* ════════════════════════════════
           MOBILE — Instagram style
           Top: Logo + Notification
           Middle: SearchBar
           Bottom: 5 icons
        ════════════════════════════════ */

        /* Hide করা হবে mobile এ */
        .mobile-hidden-on-mobile { display: flex; }

        /* Mobile top bar */
        .mob-topbar {
          display: none;
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: var(--pluto-bg-navbar);
          border-bottom: 1px solid var(--pluto-border);
          flex-direction: column;
        }

        /* Row 1: Logo + Notification */
        .mob-topbar-row1 {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px 6px;
        }

        .mob-logo {
          font-size: 24px;
          font-weight: 800;
          color: var(--pluto-accent);
          cursor: pointer;
          letter-spacing: -0.5px;
          font-style: italic;
        }

        .mob-topbar-icons {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mob-icon-btn {
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pluto-text-primary);
          cursor: pointer;
          border: none;
          background: transparent;
          border-radius: 50%;
          transition: background 0.15s;
        }
        .mob-icon-btn svg { font-size: 24px; }
        .mob-icon-btn:active { background: var(--pluto-bg-hover); }

        .mob-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 16px;
          height: 16px;
          padding: 0 3px;
          background: #ef4444;
          color: #fff;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--pluto-bg-navbar);
        }

        /* Row 2: SearchBar */
        .mob-topbar-row2 {
          padding: 0 16px 10px;
        }

        /* Bottom nav */
        .mob-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 50;
          height: 54px;
          background: var(--pluto-bg-navbar);
          border-top: 1px solid var(--pluto-border);
          align-items: center;
          justify-content: space-around;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .mob-nav-btn {
          position: relative;
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--pluto-icon-default);
          cursor: pointer;
          border: none;
          background: transparent;
          transition: color 0.15s;
        }
        .mob-nav-btn svg { font-size: 26px; }
        .mob-nav-btn.active { color: var(--pluto-text-primary); }

        /* Instagram style — active এ bold icon, no underline */
        .mob-nav-btn.active svg {
          stroke-width: 2.5px;
          filter: drop-shadow(0 0 1px currentColor);
        }

        /* Profile avatar bottom nav */
        .mob-nav-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pluto-icon-default);
          font-size: 22px;
          transition: border-color 0.15s;
          overflow: hidden;
        }
        .mob-nav-btn.active .mob-nav-avatar {
          border-color: var(--pluto-text-primary);
        }

        .mob-nav-badge {
          position: absolute;
          top: 6px;
          right: calc(50% - 20px);
          min-width: 16px;
          height: 16px;
          padding: 0 3px;
          background: #ef4444;
          color: #fff;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--pluto-bg-navbar);
        }

        /* Profile dropdown — mobile এ bottom nav এর উপরে */
        .mob-profile-menu {
          position: fixed;
          bottom: 62px;
          right: 8px;
          width: 190px;
          padding: 8px;
          background: var(--pluto-bg-card);
          border: 1px solid var(--pluto-border);
          border-radius: 14px;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.6);
          z-index: 1001;
          animation: mob-menu-up 0.18s ease;
        }
        @keyframes mob-menu-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive switch ── */
        @media (max-width: 768px) {
          /* Desktop navbar সম্পূর্ণ hide */
          .navbar-root { display: none !important; }

          /* Mobile navbar show */
          .mob-topbar { display: flex; }
          .mob-bottom-nav { display: flex; }

          /* Page content নিচে padding — bottom nav এর জন্য */
          #root > *:not(.mob-topbar):not(.mob-bottom-nav) {
            padding-bottom: 54px;
          }
        }
      `}</style>

      {/* ════════════════════════════════
          DESKTOP NAVBAR — একদম same, কোনো change নেই
      ════════════════════════════════ */}
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
                title={item.label}
              >
                {item.icon}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            );
          })}
          <div className="nav-divider" />
          <div style={{ position: "relative" }}>
            <div
              className={`profile-btn ${location.pathname === "/profile" || showProfileMenu ? "active" : ""}`}
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

      {/* ════════════════════════════════
          MOBILE TOP BAR
          Row 1: Pluto (logo) + 🔔 + chat icon
          Row 2: SearchBar
      ════════════════════════════════ */}
      <div className="mob-topbar">
        {/* Row 1 */}
        <div className="mob-topbar-row1">
          {/* Logo — Instagram italic style */}
          <div className="mob-logo" onClick={() => handleNav("/home")}>
            Pluto
          </div>

          {/* Right icons */}
          <div className="mob-topbar-icons">
            {/* Chat */}
            <button className="mob-icon-btn" onClick={() => handleNav("/chat")}>
              <BsChatLeftTextFill />
              {unreadCount > 0 && (
                <span className="mob-badge">{unreadCount}</span>
              )}
            </button>

            {/* Notification */}
            <button
              className="mob-icon-btn"
              onClick={() => handleNav("/notifications")}
            >
              <FaBell />
              <span className="mob-badge">3</span>
            </button>
          </div>
        </div>

        {/* Row 2: SearchBar */}
        <div className="mob-topbar-row2">
          <SearchBar placeholder="Search..." />
        </div>
      </div>

      {/* ════════════════════════════════
          MOBILE BOTTOM NAV
          Home | Videos | Upload | Search | Profile
      ════════════════════════════════ */}
      <nav className="mob-bottom-nav">
        {/* Home */}
        <button
          className={`mob-nav-btn ${location.pathname === "/home" ? "active" : ""}`}
          onClick={() => handleNav("/home")}
        >
          <IoMdHome />
        </button>

        {/* Videos */}
        <button
          className={`mob-nav-btn ${location.pathname.startsWith("/videos") ? "active" : ""}`}
          onClick={() => handleNav("/videos")}
        >
          <MdOndemandVideo />
        </button>

        {/* Upload — center */}
        <button className="mob-nav-btn" onClick={() => handleNav("/upload")}>
          <BiVideoPlus style={{ fontSize: 30 }} />
        </button>

        {/* Search */}
        <button
          className={`mob-nav-btn ${location.pathname === "/search" ? "active" : ""}`}
          onClick={() => handleNav("/search")}
        >
          <FiSearch />
        </button>

        {/* Profile */}
        <button
          className={`mob-nav-btn ${location.pathname === "/profile" || showProfileMenu ? "active" : ""}`}
          onClick={() => setShowProfileMenu((p) => !p)}
        >
          <div className="mob-nav-avatar">
            <RiAccountCircleFill />
          </div>
        </button>

        {/* Profile dropdown */}
        {showProfileMenu && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 1000 }}
              onClick={() => setShowProfileMenu(false)}
            />
            <div className="mob-profile-menu">
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
      </nav>
    </>
  );
}

export default Navbar;

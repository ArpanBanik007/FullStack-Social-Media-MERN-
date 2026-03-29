import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdHome } from "react-icons/io";
import { MdOndemandVideo } from "react-icons/md";
import { BiVideoPlus } from "react-icons/bi";
import { IoSettingsSharp } from "react-icons/io5";
import { FaBell } from "react-icons/fa6";
import { RiAccountCircleFill } from "react-icons/ri";
import { TiThMenu } from "react-icons/ti";
import SearchBar from "../componants/SearchBar";
import { persistor } from "../store/store";
import { resetMyDetails } from "../slices/mydetails.slice";
import { resetMyPosts } from "../slices/postSlice";
import axios from "axios";
import { useDispatch } from "react-redux";

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
];

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleNav = (path) => {
    if (location.pathname === path) window.location.reload();
    else navigate(path);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/users/logout",
        {},
        { withCredentials: true },
      );
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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');

        .navbar-root {
          font-family: 'Syne', sans-serif;
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          height: 60px;
          background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 4px 30px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          gap: 16px;
        }

        /* Logo */
        .navbar-logo {
          font-size: 22px;
          font-weight: 800;
          font-style: italic;
          letter-spacing: -0.03em;
          cursor: pointer;
          flex-shrink: 0;
          background: linear-gradient(135deg, #06b6d4, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: opacity 0.2s;
        }
        .navbar-logo:hover { opacity: 0.8; }

        /* Search */
        .navbar-search {
          flex: 1;
          max-width: 380px;
        }

        /* Desktop icons area */
        .navbar-icons {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-icon-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          font-size: 20px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          color: rgba(255,255,255,0.4);
        }
        .nav-icon-btn:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
          transform: translateY(-1px);
        }
        .nav-icon-btn.active {
          background: rgba(6,182,212,0.15);
          border-color: rgba(6,182,212,0.3);
          color: #06b6d4;
        }

        /* Tooltip */
        .nav-tooltip {
          position: absolute;
          bottom: -34px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        .nav-icon-btn:hover .nav-tooltip { opacity: 1; }

        /* Badge */
        .nav-badge {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 16px;
          height: 16px;
          background: #ef4444;
          border-radius: 50%;
          font-size: 9px;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 6px rgba(239,68,68,0.6);
        }

        /* Divider */
        .nav-divider {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,0.08);
          margin: 0 4px;
        }

        /* Profile dropdown */
        .profile-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.5);
          transition: color 0.2s, transform 0.2s;
          overflow: hidden;
          position: relative;
        }
        .profile-btn:hover, .profile-btn.active { color: #06b6d4; transform: scale(1.08); }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: linear-gradient(160deg, #1e293b, #0f172a);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 8px;
          width: 180px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          animation: dropIn 0.18s ease;
          z-index: 100;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          color: rgba(255,255,255,0.75);
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .dropdown-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .dropdown-item.danger { color: #f87171; }
        .dropdown-item.danger:hover { background: rgba(239,68,68,0.1); }

        .dropdown-sep {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 6px 0;
        }

        /* Mobile menu button */
        .mobile-menu-btn {
          display: none;
          font-size: 22px;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          transition: background 0.2s, color 0.2s;
          border: none;
          background: transparent;
        }
        .mobile-menu-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }

        /* Mobile dropdown */
        .mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 40;
        }
        .mobile-dropdown {
          position: absolute;
          top: 68px;
          right: 16px;
          background: linear-gradient(160deg, #1e293b, #0f172a);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          padding: 10px;
          width: 210px;
          z-index: 50;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          animation: dropIn 0.2s ease;
        }
        .mobile-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          color: rgba(255,255,255,0.65);
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .mobile-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .mobile-item.danger { color: #f87171; }
        .mobile-item.danger:hover { background: rgba(239,68,68,0.1); }
        .mobile-item-icon { font-size: 18px; }

        @media (max-width: 768px) {
          .navbar-icons { display: none; }
          .mobile-menu-btn { display: flex; align-items: center; }
          .navbar-search { max-width: 200px; }
        }
      `}</style>

      <nav className="navbar-root">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => handleNav("/home")}>
          Pluto
        </div>

        {/* SearchBar */}
        <div className="navbar-search">
          <SearchBar placeholder="Search..." />
        </div>

        {/* Desktop Icons */}
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
                <span className="nav-tooltip">{item.label}</span>
              </div>
            );
          })}

          <div className="nav-divider" />

          {/* Profile */}
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
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
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
                    <RiAccountCircleFill style={{ fontSize: 16 }} /> My Profile
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

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          <TiThMenu />
        </button>

        {/* Mobile Dropdown */}
        {showMenu && (
          <>
            <div
              className="mobile-backdrop"
              onClick={() => setShowMenu(false)}
            />
            <div className="mobile-dropdown">
              {ICONS.map((item) => (
                <button
                  key={item.id}
                  className="mobile-item"
                  onClick={() => {
                    handleNav(item.path);
                    setShowMenu(false);
                  }}
                >
                  <span className="mobile-item-icon">{item.icon}</span>
                  {item.label}
                  {item.badge && (
                    <span
                      style={{
                        marginLeft: "auto",
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 8,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
              <div className="dropdown-sep" />
              <button
                className="mobile-item"
                onClick={() => {
                  navigate("/profile");
                  setShowMenu(false);
                }}
              >
                <span className="mobile-item-icon">
                  <RiAccountCircleFill />
                </span>
                My Profile
              </button>
              <button
                className="mobile-item"
                onClick={() => {
                  navigate("/settings");
                  setShowMenu(false);
                }}
              >
                <span className="mobile-item-icon">⚙️</span>
                Settings
              </button>

              <button
                className="mobile-item danger"
                onClick={() => {
                  handleLogout();
                  setShowMenu(false);
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

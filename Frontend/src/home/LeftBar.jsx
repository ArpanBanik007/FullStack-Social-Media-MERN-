import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RiAccountCircleFill } from "react-icons/ri";
import { AiFillHome } from "react-icons/ai";
import { IoMdSettings } from "react-icons/io";
import { MdOndemandVideo } from "react-icons/md";
import { FaBookmark, FaHistory } from "react-icons/fa";
import { FaBell } from "react-icons/fa6";

const NAV_ITEMS = [
  { path: "/home", icon: AiFillHome, label: "Home" },
  { path: "/profile", icon: RiAccountCircleFill, label: "Profile" },
  { path: "/videos", icon: MdOndemandVideo, label: "Videos" },
  { path: "/notifications", icon: FaBell, label: "Notifications", badge: 3 },
  { path: "/saved", icon: FaBookmark, label: "Saved" },
  { path: "/history", icon: FaHistory, label: "History" },
];

const SETTINGS_ITEM = {
  path: "/settings",
  icon: IoMdSettings,
  label: "Settings",
};

function LeftBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  const handleClick = (path) => {
    if (location.pathname === path) {
      window.location.reload();
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <style>{`
        .leftbar-root {
          position: fixed;
          top: 90px;
          left: 40px;
          width: 240px;
          height: calc(100vh - 130px);
          display: flex;
          flex-direction: column;
          background: rgba(17, 28, 46, 0.4);
          backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 24px 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4);
          z-index: 100;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 1100px) {
          .leftbar-root { left: 20px; width: 220px; }
        }

        @media (max-width: 768px) {
          .leftbar-root { display: none; }
        }

        .leftbar-section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-secondary);
          opacity: 0.5;
          margin: 20px 0 12px 16px;
        }

        .leftbar-section-label:first-child { margin-top: 0; }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 16px;
          cursor: pointer;
          margin-bottom: 6px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-secondary);
          border: 1px solid transparent;
        }

        .nav-item:hover {
          background: rgba(0, 217, 255, 0.05);
          color: var(--text-primary);
          transform: translateX(8px);
        }

        .nav-item.active {
          background: rgba(0, 217, 255, 0.1);
          border-color: rgba(0, 217, 255, 0.2);
          color: var(--accent-primary);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.1);
        }

        .nav-icon-wrap {
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .nav-item:hover .nav-icon-wrap {
          transform: scale(1.1);
        }

        .nav-label {
          font-size: 15px;
          font-weight: 600;
        }

        .nav-badge {
          margin-left: auto;
          background: var(--accent-primary);
          color: var(--bg-deep);
          font-size: 10px;
          font-weight: 800;
          width: 18px;
          height: 18px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(0, 217, 255, 0.4);
        }

        .leftbar-scroll-area {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .leftbar-scroll-area::-webkit-scrollbar { display: none; }

        .leftbar-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--glass-border);
        }
      `}</style>

      <div className="leftbar-root">
        <div className="leftbar-scroll-area">
          <div className="leftbar-section-label">Explore</div>
          {NAV_ITEMS.slice(0, 3).map(({ path, icon: Icon, label, badge }) => {
            const isActive = location.pathname === path;
            return (
              <div
                key={path}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleClick(path)}
              >
                <div className="nav-icon-wrap">
                  <Icon />
                </div>
                <span className="nav-label">{label}</span>
                {badge && <span className="nav-badge">{badge}</span>}
              </div>
            );
          })}

          <div className="leftbar-section-label">Library</div>
          {NAV_ITEMS.slice(3).map(({ path, icon: Icon, label, badge }) => {
            const isActive = location.pathname === path;
            return (
              <div
                key={path}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleClick(path)}
              >
                <div className="nav-icon-wrap">
                  <Icon />
                </div>
                <span className="nav-label">{label}</span>
                {badge && <span className="nav-badge">{badge}</span>}
              </div>
            );
          })}
        </div>

        <div className="leftbar-footer">
          <div
            className={`nav-item ${location.pathname === SETTINGS_ITEM.path ? "active" : ""}`}
            onClick={() => handleClick(SETTINGS_ITEM.path)}
          >
            <div className="nav-icon-wrap">
              <SETTINGS_ITEM.icon />
            </div>
            <span className="nav-label">{SETTINGS_ITEM.label}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default LeftBar;

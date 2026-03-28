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
  { path: "/settings", icon: IoMdSettings, label: "Settings" },
];

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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&display=swap');

        .leftbar-root {
          font-family: 'Syne', sans-serif;
          position: fixed;
          top: 80px;
          left: 12px;
          width: 240px;
          background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 16px 12px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
          overflow: hidden;
          z-index: 100;
        }

        .leftbar-root::before {
          content: '';
          position: absolute;
          top: -60px;
          left: -40px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .leftbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 10px;
        }

        .leftbar-brand-dot {
          width: 8px;
          height: 8px;
          background: #06b6d4;
          border-radius: 50%;
          box-shadow: 0 0 8px #06b6d4;
        }

        .leftbar-brand-text {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 11px 14px;
          border-radius: 14px;
          cursor: pointer;
          margin-bottom: 4px;
          transition: background 0.2s ease, transform 0.15s ease;
          overflow: hidden;
          border: 1px solid transparent;
        }

        .nav-item.active {
          background: rgba(6, 182, 212, 0.15);
          border-color: rgba(6, 182, 212, 0.3);
        }

        .nav-item:not(.active):hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.08);
          transform: translateX(3px);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          height: 60%;
          width: 3px;
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 0 3px 3px 0;
        }

        .nav-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          font-size: 18px;
          transition: background 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
          position: relative;
        }

        .nav-item.active .nav-icon-wrap {
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          color: #fff;
          box-shadow: 0 4px 14px rgba(6,182,212,0.35);
        }

        .nav-item:not(.active) .nav-icon-wrap {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.45);
        }

        .nav-item:not(.active):hover .nav-icon-wrap {
          background: rgba(6,182,212,0.12);
          color: #06b6d4;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          transition: color 0.2s ease;
        }

        .nav-item.active .nav-label {
          color: #e2e8f0;
        }

        .nav-item:not(.active) .nav-label {
          color: rgba(255,255,255,0.4);
        }

        .nav-item:not(.active):hover .nav-label {
          color: rgba(255,255,255,0.75);
        }

        .nav-badge {
          margin-left: auto;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          box-shadow: 0 0 8px rgba(239,68,68,0.5);
        }

        .leftbar-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          padding: 10px 14px 6px;
        }

        .leftbar-footer {
          margin-top: 10px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>

      <div className="leftbar-root">
        <div className="leftbar-brand">
          <div className="leftbar-brand-dot" />
          <span className="leftbar-brand-text">Navigate</span>
        </div>

        <div className="leftbar-section-label">Main</div>

        {NAV_ITEMS.slice(0, 3).map(({ path, icon: Icon, label, badge }) => {
          const isActive = location.pathname === path;
          return (
            <div
              key={path}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => handleClick(path)}
              onMouseEnter={() => setHovered(path)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="nav-icon-wrap">
                <Icon />
              </div>
              <span className="nav-label">{label}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </div>
          );
        })}

        <div className="leftbar-section-label" style={{ marginTop: 6 }}>
          Library
        </div>

        {NAV_ITEMS.slice(3, 6).map(({ path, icon: Icon, label, badge }) => {
          const isActive = location.pathname === path;
          return (
            <div
              key={path}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => handleClick(path)}
              onMouseEnter={() => setHovered(path)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="nav-icon-wrap">
                <Icon />
              </div>
              <span className="nav-label">{label}</span>
              {badge && <span className="nav-badge">{badge}</span>}
            </div>
          );
        })}

        <div className="leftbar-footer">
          {NAV_ITEMS.slice(6).map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <div
                key={path}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleClick(path)}
                onMouseEnter={() => setHovered(path)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="nav-icon-wrap">
                  <Icon />
                </div>
                <span className="nav-label">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default LeftBar;

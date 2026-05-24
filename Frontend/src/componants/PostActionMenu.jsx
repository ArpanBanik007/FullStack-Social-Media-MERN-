import { useEffect, useRef } from "react";
import { FaRegBookmark } from "react-icons/fa6";
import { FaUserAltSlash } from "react-icons/fa";

const PostActionMenu = ({ isOpen, onClose, onSave, onBlock }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .pluto-post-menu {
          position: absolute;
          top: 48px;
          right: 0;
          width: 172px;
          background: var(--pluto-bg-card);
          border: 1px solid var(--pluto-border);
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          z-index: 50;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          animation: pluto-menu-in 0.15s ease;
        }
        @keyframes pluto-menu-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }

        .pluto-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--pluto-text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .pluto-menu-item:hover {
          background: var(--pluto-bg-hover);
          color: var(--pluto-text-primary);
        }
        .pluto-menu-item.danger {
          color: #f87171;
        }
        .pluto-menu-item.danger:hover {
          background: rgba(248, 113, 113, 0.08);
          color: #fca5a5;
        }
        .pluto-menu-sep {
          height: 1px;
          background: var(--pluto-border);
          margin: 4px 0;
        }
      `}</style>

      <div ref={menuRef} className="pluto-post-menu">
        <button
          className="pluto-menu-item"
          onClick={() => { onSave(); onClose(); }}
        >
          <FaRegBookmark style={{ fontSize: 14 }} />
          <span>Save Post</span>
        </button>

        <div className="pluto-menu-sep" />

        <button
          className="pluto-menu-item danger"
          onClick={() => { onBlock?.(); onClose(); }}
        >
          <FaUserAltSlash style={{ fontSize: 14 }} />
          <span>Block User</span>
        </button>
      </div>
    </>
  );
};

export default PostActionMenu;

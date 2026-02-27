import { useEffect, useRef } from "react";
import { FaRegBookmark } from "react-icons/fa6";
import { FaUserAltSlash } from "react-icons/fa";

const PostActionMenu = ({ isOpen, onClose, onSave, onBlock }) => {
  const menuRef = useRef(null);

  // 🔹 বাইরে ক্লিক করলে menu বন্ধ
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
    <div
      ref={menuRef}
      className="absolute top-12 right-2 bg-slate-800 text-white
      rounded-xl shadow-lg p-3 w-44 z-50 flex flex-col gap-2
      border border-slate-600"
    >
      {/* SAVE */}
      <button
        onClick={() => {
          onSave();
          onClose();
        }}
        className="flex items-center gap-3 hover:bg-slate-700 p-2 rounded-lg"
      >
        <FaRegBookmark />
        <span>Save</span>
      </button>

      {/* BLOCK */}
      <button
        onClick={() => {
          onBlock();
          onClose();
        }}
        className="flex items-center gap-3 p-2 rounded-lg
        text-red-400 hover:text-red-300 hover:bg-red-500/20"
      >
        <FaUserAltSlash />
        <span>Block</span>
      </button>
    </div>
  );
};

export default PostActionMenu;

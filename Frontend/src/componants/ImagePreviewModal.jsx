import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

function ImagePreviewModal({ isOpen, imageUrl, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  return (
    <>
      <style>{`
        @keyframes zoomInPreview {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[110] flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
        >
          <IoClose size={24} />
        </button>

        {/* Image */}
        <div
          className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center"
          style={{ animation: "zoomInPreview 0.25s ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      </div>
    </>
  );
}

export default ImagePreviewModal;

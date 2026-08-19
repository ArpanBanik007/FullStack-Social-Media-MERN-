import { useEffect, useState } from "react";
import { FaShareNodes } from "react-icons/fa6";
import { connectSocket } from "../socket";
import { triggerShare, registerShareCount } from "../utils/share.js";

/**
 * Universal Share Button — post, photo, story, jekono content-e reusable
 *
 * @param {string} contentId - post/photo/content-er unique ID (share link + socket room-er jonye)
 * @param {string} title - share sheet-e dekhano title
 * @param {number} initialCount - initial share count (parent theke pass koro)
 * @param {string} type - "post" | "photo" — backend route/link path different hole
 * @param {string} className - custom styling class (optional)
 * @param {boolean} showCount - count dekhabe kina (default true)
 */
function ShareButton({
  contentId,
  title,
  initialCount = 0,
  type = "post",
  className = "feed-action-btn",
  showCount = true,
}) {
  const [shareCount, setShareCount] = useState(initialCount);

  // ── Initial count sync jodi parent-er data update hoy ──
  useEffect(() => {
    setShareCount(initialCount);
  }, [initialCount]);

  // ── Socket listen — ei specific content-er share count live update ──
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const roomName = `${type}:${contentId}`;
    socket.emit("joinRoom", roomName);

    const handleShareUpdate = (data) => {
      if (data.postId === contentId || data.contentId === contentId) {
        setShareCount(data.shares);
      }
    };

    socket.on("share-count-updated", handleShareUpdate);
    return () => socket.off("share-count-updated", handleShareUpdate);
  }, [contentId, type]);

  const handleClick = async () => {
    const shareUrl = `${import.meta.env.VITE_BACKEND_URL}/share/${type}/${contentId}`;

    const shared = await triggerShare(shareUrl, title);
    if (!shared) return;

    const updatedCount = await registerShareCount(contentId);
    if (updatedCount !== null) setShareCount(updatedCount); // fallback jodi socket delay kore
  };

  return (
    <button className={className} onClick={handleClick}>
      <FaShareNodes />
      {showCount && <span>{shareCount}</span>}
    </button>
  );
}

export default ShareButton;
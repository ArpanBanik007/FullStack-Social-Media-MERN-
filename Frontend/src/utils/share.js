import API from "./API.js";

/**
 * Universal share handler — jekono content-er jonye reusable
 * @param {string} shareUrl - full URL ja share hobe
 * @param {string} title - share sheet-e dekhano title
 */
export const triggerShare = async (shareUrl, title = "Check this out on Pluto") => {
  if (navigator.share) {
    try {
      await navigator.share({ title, url: shareUrl });
      return true;
    } catch (err) {
      return false; // user cancelled — error na, silent
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (err) {
      console.error("Copy failed:", err);
      return false;
    }
  }
};

/**
 * Backend e share count increment koro
 * @param {string} postId
 * @returns {number|null} updated share count, fail hole null
 */
export const registerShareCount = async (postId) => {
  try {
    const res = await API.post(`/posts/${postId}/share`, {}, { withCredentials: true });
    return res.data?.data?.shares ?? null;
  } catch (err) {
    console.error("Share count update failed:", err);
    return null;
  }
};
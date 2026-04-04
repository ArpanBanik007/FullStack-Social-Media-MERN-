import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Video from "../models/video.model.js"
import {VideoView } from "../models/videoView.model.js"





// ── View Add করো ──────────────────────────────────────
export const addVideoView = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Video আছে কিনা check
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const userId = req.user?._id || null;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  let alreadyViewed = false;

  if (userId) {
    // Logged in user — userId দিয়ে check
    alreadyViewed = await VideoView.findOne({ video: videoId, user: userId });
  } else {
    // Guest user — ip দিয়ে check
    alreadyViewed = await VideoView.findOne({ video: videoId, ip });
  }

  if (!alreadyViewed) {
    // নতুন view save করো
    await VideoView.create({
      video: videoId,
      user: userId,
      ip: userId ? null : ip, // logged in হলে ip দরকার নেই
    });

    // Video-র viewCount বাড়াও
    await Video.findByIdAndUpdate(videoId, { $inc: { viewCount: 1 } });

    // Socket emit — সবাইকে জানাও
    const updatedVideo = await Video.findById(videoId).select("viewCount");
    const io = req.app.get("io");
    io.to(`video:${videoId}`).emit("viewCountUpdate", {
      videoId,
      viewCount: updatedVideo.viewCount,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { alreadyViewed: !!alreadyViewed }, "Video view recorded"));
});

// ── View Count আনো ────────────────────────────────────
export const getVideoViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId).select("viewCount");
  if (!video) throw new ApiError(404, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { viewCount: video.viewCount }, "Video view count fetched"));
});
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Video from "../models/video.model.js"
import {VideoView } from "../models/videoView.model.js"




// ── View Add করো ──────────────────────────────────────
export const addVideoView = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const userId = req.user?._id || null;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  let alreadyViewed = false;

  if (userId) {
    alreadyViewed = await VideoView.findOne({ video: videoId, user: userId });
  } else {
    alreadyViewed = await VideoView.findOne({ video: videoId, ip });
  }

  if (!alreadyViewed) {
    await VideoView.create({
      video: videoId,
      user: userId,
      ip: userId ? null : ip,
    });

    // ✅ views field — তোমার Video model অনুযায়ী
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

    const updatedVideo = await Video.findById(videoId).select("views");

    const io = req.app.get("io");
    io.to(`video:${videoId}`).emit("viewCountUpdate", {
      videoId,
      views: updatedVideo.views, // ✅
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { alreadyViewed: !!alreadyViewed },
        "Video view recorded"
      )
    );
});

// ── View Count আনো ────────────────────────────────────
export const getVideoViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId).select("views"); // ✅
  if (!video) throw new ApiError(404, "Video not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { views: video.views }, "Video view count fetched") // ✅
    );
});
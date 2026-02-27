// routes/video.routes.js
import { Router } from "express";
import { verifyJWT } from "../middlewire/auth.middlewire.js";
import { upload } from "../middlewire/multer.middlewire.js";

import {
  createVideo,
  updateVideo,
  updateVideoThumbnail,
  deleteVideo,
  getShortsFeed,
  addViews,
  toggleLikes,
  toggleDislike,
  getSingleVideo,
} from "../controller/video.controller.js";

const router = Router();

// ✅ Create a new video
router.post(
  "/create",
  verifyJWT,
  upload.fields([
    { name: "videoUrl", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createVideo
);

// ✅ Update video details
router.put("/:videoId", verifyJWT, updateVideo);

// ✅ Update video thumbnail
router.put(
  "/thumbnail/:videoId",
  verifyJWT,
  upload.single("thumbnail"),
  updateVideoThumbnail
);

// ✅ Delete a video
router.delete("/:videoId", verifyJWT, deleteVideo);

// ✅ Get shorts feed with optional search & category
router.get("/feed", getShortsFeed);

// ✅ Get a single video by ID
router.get("/:videoId", getSingleVideo);

// ✅ Add a view
router.post("/view/:videoId", verifyJWT, addViews);

// ✅ Like / Unlike a video
router.post("/like/:videoId", verifyJWT, toggleLikes);

// ✅ Dislike / Remove dislike
router.post("/dislike/:videoId", verifyJWT, toggleDislike);

export default router;

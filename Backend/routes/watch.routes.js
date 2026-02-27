import { Router } from "express";
import { verifyJWT } from "../middlewire/auth.middlewire.js";
import {
  //createwatchHistory,
  getAllWatchHistory,
  deleteHistorybyID,
  deleteAllHistory,
  addWatchLater,
  deleteWatchLater,
  getAllWatchLater,
} from "../controller/watchVideo.controller.js";

const router = Router();

/**
 * Watch History Routes
 */

// ✅ Add or update watch history
//router.post("/history", verifyJWT, createwatchHistory);

// ✅ Get all watch history (paginated)
router.get("/history", verifyJWT, getAllWatchHistory);

// ✅ Delete a specific watch history entry
router.delete("/history", verifyJWT, deleteHistorybyID);

// ✅ Delete all watch history
router.delete("/history/all", verifyJWT, deleteAllHistory);

/**
 * Watch Later Routes
 */
router.post("/watchlater", verifyJWT, addWatchLater); // POST /watchlater?videoId=123
//router.delete("/watchlater", verifyJWT, deleteWatchLaterID); // DELETE /watchlater?videoId=123
router.get("/watchlater", verifyJWT, getAllWatchLater);

router.delete("/watchlater", verifyJWT, deleteWatchLater);

export default router;

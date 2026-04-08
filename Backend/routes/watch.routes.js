import { Router } from "express";
import { verifyJWT } from "../middlewire/auth.middlewire.js";
import {
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

// ✅ Get all watch history (paginated)
router.get("/history", verifyJWT, getAllWatchHistory);

// ✅ Delete all watch history — MUST be before /:historyId
router.delete("/history/all", verifyJWT, deleteAllHistory);

// ✅ Delete a specific watch history entry
router.delete("/history/:historyId", verifyJWT, deleteHistorybyID);

/**
 * Watch Later Routes
 */
router.post("/watchlater", verifyJWT, addWatchLater);
router.get("/watchlater", verifyJWT, getAllWatchLater);
router.delete("/watchlater", verifyJWT, deleteWatchLater);

export default router;
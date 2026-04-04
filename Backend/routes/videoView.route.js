import { Router } from "express";
import { addVideoView,getVideoViews } from "../controller/videoView.controller.js";
import { verifyJWT } from "../middlewire/auth.middlewire.js";

const router=Router()

router.post("/:videoId", verifyJWT, addVideoView);

// View count আনো — public
router.get("/:videoId", getVideoViews);

export default router;
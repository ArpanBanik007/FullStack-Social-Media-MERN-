import { Router } from "express";
import { addPostView,getPostViews } from "../controller/postView.controller.js";
import { verifyJWT } from "../middlewire/auth.middlewire.js";


const router = Router();

// View add
router.post("/:postId", verifyJWT, addPostView);

// View count আনো — public
router.get("/:postId", getPostViews);

export default router;
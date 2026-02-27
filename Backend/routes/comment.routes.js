import { Router } from "express";
import { verifyJWT } from "../middlewire/auth.middlewire.js";

import {
  createComment,
  getAllComments,
  getRepliesByCommentId,
  commentReply,
  updateComment,
  deleteComment,
  toggleLikeOnComment,
} from "../controller/comments.controller.js";

const router = Router();

/**
 * Comment Routes
 */

// ✅ Create new comment
router.route("/:videoId").post(verifyJWT, createComment);

// ✅ Get all comments for a video (with pagination)
router.route("/:videoId").get(getAllComments);

// ✅ Update a comment (only by owner)
router.route("/:videoId/:commentId").patch(verifyJWT, updateComment);

// ✅ Delete a comment (only by owner)
router.route("/:videoId/:commentId").delete(verifyJWT, deleteComment);

// ✅ Get replies of a specific comment
router.route("/replies/:commentId").get(getRepliesByCommentId);

// ✅ Post a reply under a comment
router.route("/reply/:commentId").post(verifyJWT, commentReply);

// ✅ Toggle like/unlike on a comment
router.route("/like/:commentId").post(verifyJWT, toggleLikeOnComment);

export default router;

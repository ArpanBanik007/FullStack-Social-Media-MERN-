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

// ✅ Specific routes আগে
router.route("/replies/:commentId").get(getRepliesByCommentId);
router.route("/reply/:commentId").post(verifyJWT, commentReply);
router.route("/like/:commentId").post(verifyJWT, toggleLikeOnComment);

// ✅ Dynamic routes পরে
router.route("/:videoId").post(verifyJWT, createComment);
router.route("/:videoId").get(getAllComments); // ← getSingleVideo সরাও এখান থেকে
router.route("/:videoId/:commentId").patch(verifyJWT, updateComment);
router.route("/:videoId/:commentId").delete(verifyJWT, deleteComment);

export default router;
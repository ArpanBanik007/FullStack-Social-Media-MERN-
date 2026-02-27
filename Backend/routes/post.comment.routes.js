// routes/comment.routes.js
import express from "express";
import {
  createPostComment,
  getAllCommentsForPost,
  getRepliesByCommentIdForPost,
  commentReplyForPost,
  updateCommentForPost,
  deleteCommentForPost,
  toggleLikeOnCommentForPost,
} from "../controller/post.comments.controller.js";

import { verifyJWT } from "../middlewire/auth.middlewire.js";
import { isBlocked } from "../middlewire/block.middleware.js";

const router = express.Router();


// ✅ Create a comment on a post
router.post("/post/:postId", verifyJWT, createPostComment);


//get all for single comments
router.get("/post/:postId", getAllCommentsForPost);

// ✅ Get replies for a specific comment
router.get("/replies/:commentId", getRepliesByCommentIdForPost);

// ✅ Reply to a comment
router.post("/reply/:commentId", verifyJWT, isBlocked, commentReplyForPost);

// ✅ Update a comment
router.put("/:postId/:commentId", verifyJWT, updateCommentForPost);

// ✅ Delete a comment
router.delete("/:postId/:commentId", verifyJWT, deleteCommentForPost);

// ✅ Toggle like on a comment
router.post("/like/:commentId", verifyJWT, toggleLikeOnCommentForPost);

export default router;

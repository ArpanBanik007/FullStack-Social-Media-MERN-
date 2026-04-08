import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Post from "../models/createpost.models.js";
import { PostView } from "../models/postView.model.js";
import watchHistoryModel from "../models/watchHistory.model.js";

// ── View Add করো ──────────────────────────────────────
export const addPostView = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const userId = req.user?._id || null;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  let alreadyViewed = false;

  if (userId) {
    alreadyViewed = await PostView.findOne({ post: postId, user: userId });
  } else {
    alreadyViewed = await PostView.findOne({ post: postId, ip });
  }

  if (!alreadyViewed) {
    await PostView.create({
      post: postId,
      user: userId,
      ip: userId ? null : ip,
    });

    // ✅ View count বাড়াও
    await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });

    const updatedPost = await Post.findById(postId).select("views");

    // ✅ Watch History-তে add করো (শুধু logged-in user হলে)
    if (userId) {
      const alreadyInHistory = await watchHistoryModel.findOne({
        userId,
        postId,
      });

      if (alreadyInHistory) {
        // আগে থেকে আছে — watchedAt update করো (most recent first এর জন্য)
        await watchHistoryModel.findByIdAndUpdate(alreadyInHistory._id, {
          watchedAt: new Date(),
        });
      } else {
        // নতুন entry add করো
        await watchHistoryModel.create({
          userId,
          postId,
          videoId: null,
          watchedAt: new Date(),
        });
      }
    }

    // ✅ Socket emit
    const io = req.app.get("io");
    io.to(`post:${postId}`).emit("viewCountUpdate", {
      postId,
      views: updatedPost.views,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { alreadyViewed: !!alreadyViewed },
        "Post view recorded"
      )
    );
});

// ── View Count আনো ────────────────────────────────────
export const getPostViews = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId).select("views");
  if (!post) throw new ApiError(404, "Post not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { views: post.views }, "Post view count fetched")
    );
});
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Post from "../models/createpost.models.js";
import { PostView} from "../models/postView.model.js";



// ── View Add করো ──────────────────────────────────────
export const addPostView = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  // Post আছে কিনা check
  const post = await Post.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const userId = req.user?._id || null;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  let alreadyViewed = false;

  if (userId) {
    // Logged in user — userId দিয়ে check
    alreadyViewed = await PostView.findOne({ post: postId, user: userId });
  } else {
    // Guest user — ip দিয়ে check
    alreadyViewed = await PostView.findOne({ post: postId, ip });
  }

  if (!alreadyViewed) {
    // নতুন view save করো
    await PostView.create({
      post: postId,
      user: userId,
      ip: userId ? null : ip,
    });

    // Post-এর viewCount বাড়াও
    await Post.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });

    // Socket emit — সবাইকে জানাও
    const updatedPost = await Post.findById(postId).select("viewCount");
    const io = req.app.get("io");
    io.to(`post:${postId}`).emit("viewCountUpdate", {
      postId,
      viewCount: updatedPost.viewCount,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { alreadyViewed: !!alreadyViewed }, "Post view recorded"));
});

// ── View Count আনো ────────────────────────────────────
export const getPostViews = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId).select("viewCount");
  if (!post) throw new ApiError(404, "Post not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { viewCount: post.viewCount }, "Post view count fetched"));
});
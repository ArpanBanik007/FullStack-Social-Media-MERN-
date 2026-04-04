import mongoose from "mongoose";

const postViewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  ip: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Logged in user
postViewSchema.index({ post: 1, user: 1 }, { sparse: true });

// Guest user
postViewSchema.index({ post: 1, ip: 1 }, { sparse: true });

postViewSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 15 * 24 * 60 * 60 }
);

export const PostView = mongoose.model("PostView", postViewSchema);
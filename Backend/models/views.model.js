import mongoose from "mongoose";

const viewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  ip: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound indexes for fast query + prevent duplicate views
viewSchema.index({ video: 1, user: 1, createdAt: -1 });
viewSchema.index({ video: 1, ip: 1, createdAt: -1 });

viewSchema.index({ post: 1, user: 1, createdAt: -1 });
viewSchema.index({ post: 1, ip: 1, createdAt: -1 });

// TTL index for auto-expiry after 15 days (configurable)
viewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15 * 24 * 60 * 60 }); // 15 days

export const View = mongoose.model("View", viewSchema);

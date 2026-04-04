import mongoose from "mongoose";

const videoViewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // guest user হলে null
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  ip: {
    type: String,
    default: null, // logged in user হলে ip দরকার নেই
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

videoViewSchema.index({ video: 1, user: 1 }, { sparse: true });


videoViewSchema.index({ video: 1, ip: 1 }, { sparse: true });


videoViewSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 15 * 24 * 60 * 60 }
);

export const VideoView = mongoose.model("VideoView", videoViewSchema);
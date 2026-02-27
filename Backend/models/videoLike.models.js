import mongoose from "mongoose";

const videoLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

videoLikeSchema.index({ user: 1, video: 1 }, { unique: true });

const VideoLike = mongoose.model("VideoLike", videoLikeSchema);
export default VideoLike;

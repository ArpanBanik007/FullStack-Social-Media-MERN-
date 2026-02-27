import mongoose from "mongoose";

const videoDisLikeSchema = new mongoose.Schema(
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

videoDisLikeSchema.index({ user: 1, video: 1 }, { unique: true });

const VideoDisLike = mongoose.model("VideoDisLike", videoDisLikeSchema);
export default VideoDisLike;

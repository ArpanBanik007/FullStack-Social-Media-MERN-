import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      default: "", 
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", 
      default: "", 
    },

    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ✅ Index: userId + postId + videoId (optional)
watchHistorySchema.index({ userId: 1, postId: 1, videoId: 1 });

// ✅ Single field index
watchHistorySchema.index({ userId: 1 });

export default mongoose.model("WatchHistory", watchHistorySchema);

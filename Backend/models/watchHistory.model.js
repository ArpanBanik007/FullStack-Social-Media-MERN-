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
      default: null,   // ✅ "" এর বদলে null
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,   // ✅ "" এর বদলে null
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

// ✅ sparse: true দিলে null value-গুলো index-এ ignore হবে
watchHistorySchema.index(
  { userId: 1, postId: 1, videoId: 1 },
  { sparse: true }
);

watchHistorySchema.index({ userId: 1 });

export default mongoose.model("WatchHistory", watchHistorySchema);
import mongoose from "mongoose";

const watchLaterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      sparse: true,
    },

    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      sparse: true,
    },

    AddAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ✅ Unique Index: Prevent duplicate video saves by same user
watchLaterSchema.index(
  { userId: 1, videoId: 1 },
  { unique: true, sparse: true }
);

// ✅ Prevent duplicate post saves by same user
watchLaterSchema.index(
  { userId: 1, postId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("WatchLater", watchLaterSchema);

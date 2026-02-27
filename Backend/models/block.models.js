import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate block entries (blocker-blocked pair unique thakbe)
blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export const Block = mongoose.model("Block", blockSchema);
// models/conversation.model.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    isGroup: { type: Boolean, default: false },

    groupName: {
      type: String,
      trim: true,
      default: null,
      maxlength: 100,
    },

    groupAvatar: { type: String, default: null },
    groupAvatarPublicId: { type: String, default: null },

    groupDescription: {
      type: String,
      trim: true,
      default: null,
      maxlength: 500,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    coAdmins: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],

    lastMessage: { type: String, default: "", maxlength: 200 },
    lastMessageType: {
      type: String,
      enum: ["text", "image", "file", "audio", "video"],
      default: "text",
    },
    lastMessageAt: { type: Date, default: Date.now },
    lastSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // WhatsApp style unread count
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    mutedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    onlyAdminCanMessage: { type: Boolean, default: false },
    inviteLink: { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes
conversationSchema.index({ members: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ members: 1, isGroup: 1 });

// Methods
conversationSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.toString() === userId.toString());
};

conversationSchema.methods.isAdmin = function (userId) {
  return (
    this.admin?.toString() === userId.toString() ||
    this.coAdmins?.some((a) => a.toString() === userId.toString())
  );
};

// Static — 1-to-1 conversation খোঁজো
conversationSchema.statics.findOneToOne = function (userId1, userId2) {
  return this.findOne({
    isGroup: false,
    members: { $all: [userId1, userId2], $size: 2 },
  });
};

export default mongoose.model("Conversation", conversationSchema);
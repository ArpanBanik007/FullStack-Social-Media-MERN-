// models/conversation.model.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // 🔹 1-to-1 or group members
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // 🔹 Group chat flag
    isGroup: {
      type: Boolean,
      default: false,
    },

    // 🔹 Group name (only for group chats)
    groupName: {
      type: String,
      trim: true,
      default: null,
    },

    // 🔹 Group avatar/image URL
    groupAvatar: {
      type: String,
      default: null,
    },

    // 🔹 Group admin
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🔹 Co-admins (future: multiple admins)
    coAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔹 Last message preview (sidebar fast load এর জন্য)
    lastMessage: {
      type: String,
      default: "",
      maxlength: 200,
    },

    // 🔹 Last message type (text/image/file)
    lastMessageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },

    // 🔹 Last message time (sorting এর জন্য)
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    // 🔹 Last sender reference
    lastSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🔹 Unread count per user — WhatsApp style
    // { "userId1": 3, "userId2": 0 }
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    // 🔹 Muted by (users who muted this conversation)
    mutedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔹 Pinned by (users who pinned this conversation)
    pinnedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔹 Blocked (1-to-1 এ blocker userId রাখা)
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🔹 Soft delete — কোন member conversation ছেড়েছে
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔹 Group description
    groupDescription: {
      type: String,
      trim: true,
      default: null,
      maxlength: 500,
    },

    // 🔹 Invite link (group এর জন্য)
    inviteLink: {
      type: String,
      default: null,
    },

    // 🔹 Only admins can send (group setting)
    onlyAdminCanMessage: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto
  }
);

// =====================
// 🔥 INDEXES (performance)
// =====================
conversationSchema.index({ members: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ "members": 1, "isGroup": 1 });

// =====================
// 🛠️ VIRTUALS
// =====================

// Group member count
conversationSchema.virtual("memberCount").get(function () {
  return this.members?.length || 0;
});

// =====================
// 🛠️ METHODS
// =====================

// কোনো user এই conversation এর member কিনা check
conversationSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.toString() === userId.toString());
};

// কোনো user admin কিনা
conversationSchema.methods.isAdmin = function (userId) {
  return (
    this.admin?.toString() === userId.toString() ||
    this.coAdmins?.some((a) => a.toString() === userId.toString())
  );
};

// =====================
// 🛠️ STATICS
// =====================


conversationSchema.statics.findOneToOne = function (userId1, userId2) {
  return this.findOne({
    isGroup: false,
    members: { $all: [userId1, userId2], $size: 2 },
  });
};

export default mongoose.model("Conversation", conversationSchema);
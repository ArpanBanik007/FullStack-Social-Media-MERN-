// models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // 🔹 কোন conversation এর message
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    // 🔹 Message পাঠানো user
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔹 Receiver (1-to-1 এর জন্য)
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🔹 Message content (text)
    content: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },

    // 🔹 Message type
    type: {
      type: String,
      enum: ["text", "image", "file", "audio", "video", "location", "sticker"],
      default: "text",
    },

    // 🔹 File / Image / Media URL
    fileUrl: {
      type: String,
      default: null,
    },

    // 🔹 File original name
    fileName: {
      type: String,
      default: null,
    },

    // 🔹 File size in bytes
    fileSize: {
      type: Number,
      default: null,
    },

    // 🔹 File MIME type
    mimeType: {
      type: String,
      default: null,
    },

    // 🔹 Thumbnail (video/image preview এর জন্য)
    thumbnail: {
      type: String,
      default: null,
    },

    // 🔹 Location data (type = "location" হলে)
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: null },
    },

    // 🔹 Delivery status (1-to-1 এর জন্য)
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    // 🔹 Seen by (group chat এ কে কে দেখেছে)
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔹 Reply to message (reply feature)
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // 🔹 Reactions — { userId: emoji }
    reactions: {
      type: Map,
      of: String,
      default: {},
    },

    // 🔹 Forwarded message flag
    isForwarded: {
      type: Boolean,
      default: false,
    },

    // 🔹 Edited flag
    isEdited: {
      type: Boolean,
      default: false,
    },

    // 🔹 Edited at time
    editedAt: {
      type: Date,
      default: null,
    },

    // 🔹 Soft delete — সবার জন্য delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // 🔹 Deleted for specific users (delete for me)
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔹 Pinned message flag
    isPinned: {
      type: Boolean,
      default: false,
    },

    // 🔹 System message (e.g. "X joined the group")
    isSystem: {
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
messageSchema.index({ chatId: 1, createdAt: -1 }); // message list fast load
messageSchema.index({ senderId: 1 });
messageSchema.index({ chatId: 1, isPinned: 1 }); // pinned messages

// =====================
// 🛠️ METHODS
// =====================

// Message delete for everyone
messageSchema.methods.deleteForAll = function () {
  this.isDeleted = true;
  this.content = "";
  this.fileUrl = null;
  return this.save();
};

// Message edit
messageSchema.methods.editContent = function (newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Reaction add/remove toggle
messageSchema.methods.toggleReaction = function (userId, emoji) {
  const key = userId.toString();
  if (this.reactions.get(key) === emoji) {
    this.reactions.delete(key); // same emoji = remove
  } else {
    this.reactions.set(key, emoji); // set new emoji
  }
  return this.save();
};

export default mongoose.model("Message", messageSchema);
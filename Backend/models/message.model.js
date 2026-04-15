// models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    content: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },

    type: {
      type: String,
      enum: ["text", "image", "file", "audio", "video", "location", "sticker"],
      default: "text",
    },

    fileUrl: { type: String, default: null },
    filePublicId: { type: String, default: null }, // Cloudinary delete এর জন্য
    fileName: { type: String, default: null },
    fileSize: { type: Number, default: null },
    mimeType: { type: String, default: null },
    thumbnail: { type: String, default: null },

    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, default: null },
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },

    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    reactions: {
      type: Map,
      of: String,
      default: {},
    },

    isForwarded: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPinned: { type: Boolean, default: false },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ chatId: 1, isPinned: 1 });

// Methods
messageSchema.methods.deleteForAll = function () {
  this.isDeleted = true;
  this.content = "";
  this.fileUrl = null;
  return this.save();
};

messageSchema.methods.editContent = function (newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

messageSchema.methods.toggleReaction = function (userId, emoji) {
  const key = userId.toString();
  if (this.reactions.get(key) === emoji) {
    this.reactions.delete(key);
  } else {
    this.reactions.set(key, emoji);
  }
  return this.save();
};

export default mongoose.model("Message", messageSchema);
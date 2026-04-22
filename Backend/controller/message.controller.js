import {
    getOrCreateConversation,
    createMessage,
    updateConversationAfterMessage,
    markMessagesAsSeen,
    deleteMessageForAll,
    editMessage,
    toggleReaction,
    searchUsers,
} from "../services/message.service.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

// ✅ Send Message
export const sendMessage = async (req, res, next) => {
    try {
        const senderId = req.user._id;
        const {
            receiverId,
            content,
            type = "text",
            fileUrl,
            fileName,
            fileSize,
            mimeType,
            filePublicId,
            replyTo,
        } = req.body;

        // ✅ Validation
        if (!receiverId) {
            return res.status(400).json({ success: false, error: "receiverId required" });
        }

        if (type === "text" && !content?.trim()) {
            return res.status(400).json({ success: false, error: "Message content required" });
        }

        // Step 1: Conversation নাও বা বানাও
        const conversation = await getOrCreateConversation(senderId, receiverId);

        // Step 2: Message তৈরি করো
        const message = await createMessage({
            chatId: conversation._id,
            senderId,
            receiverId,
            content: content?.trim() || "",
            type,
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            fileSize: fileSize || null,
            mimeType: mimeType || null,
            filePublicId: filePublicId || null,
            status: "sent",
            seenBy: [senderId],
            replyTo: replyTo || null,
        });

        // Step 3: Conversation update
        await updateConversationAfterMessage(conversation._id, {
            senderId,
            receiverIds: [receiverId],
            content,
            type,
        });

        // Step 4: Socket emit
        const io = req.app.get("io");
        if (io) {
            io.to(conversation._id.toString()).emit("newMessage", {
                message,
                conversationId: conversation._id,
            });

            io.to(receiverId.toString()).emit("newMessageNotification", {
                conversationId: conversation._id,
                senderId,
                senderName: req.user.name,
                senderAvatar: req.user.avatar,
                preview:
                    type === "text"
                        ? content?.slice(0, 60)
                        : `Sent a ${type}`,
            });
        } else {
            console.warn("⚠️ Socket io not available in sendMessage");
        }

        res.status(201).json({ success: true, message });
    } catch (err) {
        next(err);
    }
};

// ✅ Get Messages — cursor-based pagination
export const getMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { before, limit = 30 } = req.query;
        const userId = req.user._id;

        // Conversation member কিনা check
        const conversation = await Conversation.findById(chatId).select(
            "members deletedFor"
        );

        if (!conversation || !conversation.isMember(userId)) {
            return res.status(403).json({
                success: false,
                error: "Access denied",
            });
        }

        const query = {
            chatId,
            isDeleted: false,
            deletedFor: { $ne: userId },
        };

        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .populate("senderId", "name avatar")
            .populate({
                path: "replyTo",
                select: "content type senderId isDeleted",
                populate: { path: "senderId", select: "name" },
            })
            .lean();

        const hasMore = messages.length === Number(limit);

        res.status(200).json({
            success: true,
            messages: messages.reverse(),
            hasMore,
            nextCursor: hasMore
                ? messages[messages.length - 1]?.createdAt
                : null,
        });
    } catch (err) {
        next(err);
    }
};

// ✅ Get Conversations
export const getConversations = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({
            members: userId,
            deletedFor: { $ne: userId },
        })
            .sort({ lastMessageAt: -1 })
            .populate("members", "name avatar isOnline lastSeen")
            .populate("lastSender", "name")
            .lean();

        res.status(200).json({ success: true, conversations });
    } catch (err) {
        next(err);
    }
};

// ✅ Mark Seen
export const markSeen = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.params;

        if (!chatId) {
            return res.status(400).json({ success: false, error: "chatId required" });
        }

        const seenCount = await markMessagesAsSeen(chatId, userId);

        const io = req.app.get("io");
        if (io && seenCount > 0) {
            io.to(chatId).emit("messageSeen", {
                chatId,
                seenBy: userId,
                seenAt: new Date(),
            });
        } else if (!io) {
            console.warn("⚠️ Socket io not available in markSeen");
        }

        res.status(200).json({ success: true, seenCount });
    } catch (err) {
        next(err);
    }
};

// ✅ Delete Message
export const deleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { deleteFor } = req.query; // "all" or "me"
        const userId = req.user._id;

        if (!messageId) {
            return res.status(400).json({ success: false, error: "messageId required" });
        }

        let message;

        if (deleteFor === "all") {
            message = await deleteMessageForAll(messageId, userId);

            const io = req.app.get("io");
            if (io) {
                io.to(message.chatId.toString()).emit("messageDeleted", {
                    messageId,
                    chatId: message.chatId,
                    deletedFor: "all",
                });
            } else {
                console.warn("⚠️ Socket io not available in deleteMessage");
            }
        } else {
            // শুধু নিজের জন্য delete
            message = await Message.findByIdAndUpdate(
                messageId,
                { $addToSet: { deletedFor: userId } },
                { new: true }
            );

            if (!message) {
                return res.status(404).json({ success: false, error: "Message not found" });
            }
        }

        res.status(200).json({ success: true, message: "Message deleted" });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ success: false, error: err.message });
        }
        next(err);
    }
};

// ✅ Edit Message
export const editMessageController = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!messageId) {
            return res.status(400).json({ success: false, error: "messageId required" });
        }

        if (!content?.trim()) {
            return res.status(400).json({ success: false, error: "Content required" });
        }

        const message = await editMessage(messageId, userId, content.trim());

        const io = req.app.get("io");
        if (io) {
            io.to(message.chatId.toString()).emit("messageEdited", {
                messageId,
                chatId: message.chatId,
                content: message.content,
                editedAt: message.editedAt,
            });
        } else {
            console.warn("⚠️ Socket io not available in editMessage");
        }

        res.status(200).json({ success: true, message });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ success: false, error: err.message });
        }
        next(err);
    }
};

// ✅ React to Message
export const reactToMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        if (!messageId) {
            return res.status(400).json({ success: false, error: "messageId required" });
        }

        if (!emoji) {
            return res.status(400).json({ success: false, error: "Emoji required" });
        }

        const message = await toggleReaction(messageId, userId, emoji);

        const io = req.app.get("io");
        if (io) {
            io.to(message.chatId.toString()).emit("reactionUpdated", {
                messageId,
                chatId: message.chatId,
                reactions: Object.fromEntries(message.reactions),
            });
        } else {
            console.warn("⚠️ Socket io not available in reactToMessage");
        }

        res.status(200).json({ success: true, reactions: message.reactions });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ success: false, error: err.message });
        }
        next(err);
    }
};

// ✅ Search Users
export const searchUsersController = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: "Search query must be at least 2 characters",
            });
        }

        const users = await searchUsers(q.trim(), req.user._id);
        res.status(200).json({ success: true, users });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ success: false, error: err.message });
        }
        next(err);
    }
};
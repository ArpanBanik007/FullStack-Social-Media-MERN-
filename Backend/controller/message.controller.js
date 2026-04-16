import {
    getOrCreateConversation,
    createMessage,
    updateConversationAfterMessage,
    markMessagesAsSeen,
    deleteMessageForAll,
    editMessage,
    toggleReaction,
    searchUsers,
} from "../services/message.services.js";
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
            // Conversation room এ সবাইকে নতুন message পাঠাও
            io.to(conversation._id.toString()).emit("newMessage", {
                message,
                conversationId: conversation._id,
            });

            // Receiver এর personal room এ notification পাঠাও
            // (receiver যদি অন্য conversation এ থাকে তখনও notification পাবে)
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
        const conversation = await Conversation.findById(chatId).select("members");
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

        // Cursor: এই time এর আগের messages দাও
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
            messages: messages.reverse(), // পুরনো আগে
            hasMore,
            nextCursor: hasMore ? messages[0]?.createdAt : null,
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

        const seenCount = await markMessagesAsSeen(chatId, userId);

        // Socket দিয়ে sender কে জানাও
        const io = req.app.get("io");
        if (io && seenCount > 0) {
            io.to(chatId).emit("messageSeen", {
                chatId,
                seenBy: userId,
                seenAt: new Date(),
            });
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

        let message;

        if (deleteFor === "all") {
            message = await deleteMessageForAll(messageId, userId);

            // Socket দিয়ে সবাইকে জানাও
            const io = req.app.get("io");
            if (io) {
                io.to(message.chatId.toString()).emit("messageDeleted", {
                    messageId,
                    chatId: message.chatId,
                    deletedFor: "all",
                });
            }
        } else {
            // শুধু নিজের জন্য delete
            message = await Message.findByIdAndUpdate(
                messageId,
                { $addToSet: { deletedFor: userId } },
                { new: true }
            );
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
        const users = await searchUsers(q, req.user._id);
        res.status(200).json({ success: true, users });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ success: false, error: err.message });
        }
        next(err);
    }
};
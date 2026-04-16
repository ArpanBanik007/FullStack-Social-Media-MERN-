import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import { User } from "../models/user.models.js"


export const getOrCreateConversation = async (senderId, receiverId) => {
    const conversation = await Conversation.findOneAndUpdate(
        {
            isGroup: false,
            members: { $all: [senderId, receiverId], $size: 2 },
        },
        {
            $setOnInsert: {
                members: [senderId, receiverId],
                isGroup: false,
                unreadCounts: {
                    [senderId.toString()]: 0,
                    [receiverId.toString()]: 0,
                },
            },
        },
        { upsert: true, new: true }
    );
    return conversation;
};

// ✅ Message তৈরি করো + populate করো
export const createMessage = async (data) => {
    const message = await Message.create(data);

    await message.populate("senderId", "name avatar");

    if (data.replyTo) {
        await message.populate({
            path: "replyTo",
            select: "content type senderId",
            populate: { path: "senderId", select: "name" },
        });
    }

    return message;
};

// ✅ Conversation এর lastMessage + unreadCount update
export const updateConversationAfterMessage = async (
    conversationId,
    { senderId, receiverIds, content, type }
) => {
    // Receiver দের unread count বাড়াও — atomic $inc
    const incUpdate = {};
    receiverIds.forEach((id) => {
        incUpdate[`unreadCounts.${id.toString()}`] = 1;
    });

    // lastMessage preview তৈরি
    const lastMessagePreview =
        type === "text"
            ? content?.slice(0, 100)
            : type === "image"
                ? "📷 Photo"
                : type === "audio"
                    ? "🎵 Audio"
                    : type === "video"
                        ? "🎬 Video"
                        : `📎 File`;

    await Conversation.findByIdAndUpdate(conversationId, {
        $set: {
            lastMessage: lastMessagePreview,
            lastMessageType: type,
            lastMessageAt: new Date(),
            lastSender: senderId,
        },
        $inc: incUpdate,
    });
};

// ✅ Messages seen mark করো — controller + socket দুইজায়গা থেকে call হবে
export const markMessagesAsSeen = async (chatId, userId) => {
    const result = await Message.updateMany(
        {
            chatId,
            seenBy: { $ne: userId },
            senderId: { $ne: userId },
            isDeleted: false,
        },
        {
            $addToSet: { seenBy: userId },
            $set: { status: "seen" },
        }
    );

    // unreadCount শূন্য করো
    await Conversation.findByIdAndUpdate(chatId, {
        $set: { [`unreadCounts.${userId.toString()}`]: 0 },
    });

    return result.modifiedCount;
};

// ✅ Message delete for everyone
export const deleteMessageForAll = async (messageId, userId) => {
    const message = await Message.findById(messageId);

    if (!message) {
        throw { status: 404, message: "Message not found" };
    }

    // শুধু sender delete করতে পারবে
    if (message.senderId.toString() !== userId.toString()) {
        throw { status: 403, message: "Not authorized to delete this message" };
    }

    // Delete window — 10 মিনিট
    const tenMinutes = 10 * 60 * 1000;
    if (Date.now() - message.createdAt > tenMinutes) {
        throw { status: 400, message: "Delete window expired (10 minutes)" };
    }

    await message.deleteForAll(); // model method
    return message;
};

// ✅ Message edit
export const editMessage = async (messageId, userId, newContent) => {
    const message = await Message.findById(messageId);

    if (!message) {
        throw { status: 404, message: "Message not found" };
    }

    if (message.senderId.toString() !== userId.toString()) {
        throw { status: 403, message: "Not authorized to edit this message" };
    }

    if (message.type !== "text") {
        throw { status: 400, message: "Only text messages can be edited" };
    }

    // Edit window — 15 মিনিট
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - message.createdAt > fifteenMinutes) {
        throw { status: 400, message: "Edit window expired (15 minutes)" };
    }

    await message.editContent(newContent);
    return message;
};

// ✅ Reaction toggle
export const toggleReaction = async (messageId, userId, emoji) => {
    const message = await Message.findById(messageId);
    if (!message) {
        throw { status: 404, message: "Message not found" };
    }
    await message.toggleReaction(userId, emoji);
    return message;
};

// ✅ User search (new conversation শুরু করার জন্য)
export const searchUsers = async (query, currentUserId) => {
    if (!query || query.trim().length < 2) {
        throw { status: 400, message: "Search query must be at least 2 characters" };
    }

    const users = await User.find({
        _id: { $ne: currentUserId },
        isActive: true,
        $or: [
            { name: { $regex: query.trim(), $options: "i" } },
            { email: { $regex: query.trim(), $options: "i" } },
        ],
    })
        .select("name email avatar isOnline lastSeen")
        .limit(20)
        .lean();

    return users;
};
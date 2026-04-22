import { User } from "../models/user.models";
import Conversation from "../models/conversation.model";


export const checkNotBlocked = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) return next();

    // নিজেকে message করা যাবে না
    if (receiverId === senderId.toString()) {
      return res.status(400).json({
        success: false,
        error: "You cannot message yourself",
      });
    }

    const receiver = await User.findById(receiverId).select(
      "blockedUsers isActive"
    );

    if (!receiver) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (!receiver.isActive) {
      return res.status(404).json({
        success: false,
        error: "This account is no longer active",
      });
    }

    const isBlocked = receiver.hasBlocked(senderId);
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        error: "You cannot message this user",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

// Group এ member + admin permission check
export const checkGroupPermission = async (req, res, next) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return next();

    const conversation = await Conversation.findById(chatId).select(
      "members onlyAdminCanMessage admin coAdmins isGroup"
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    if (!conversation.isGroup) return next();

    if (!conversation.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: "You are not a member of this group",
      });
    }

    if (
      conversation.onlyAdminCanMessage &&
      !conversation.isAdmin(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        error: "Only admins can send messages in this group",
      });
    }

    req.conversation = conversation;
    next();
  } catch (err) {
    next(err);
  }
};

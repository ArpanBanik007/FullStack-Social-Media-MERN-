import express, { Router } from "express";
import { verifyJWT } from "../middlewire/auth.middlewire.js";
import { upload } from "../middlewire/multer.middlewire.js";
import {messageLimiter,searchLimiter} from "../middlewire/rateLimiter.js";
import { checkNotBlocked, checkGroupPermission } from "../middlewire/chat.middleware.js";
import { validate, sendMessageSchema, editMessageSchema, reactSchema} from "../validators/message.validator.js";
import{
     sendMessage,
  getMessages,
  getConversations,
  markSeen,
  deleteMessage,
  editMessageController,
  reactToMessage,
  searchUsersController,
} from "../controller/message.controller.js";

const router= Router();

router.use(verifyJWT);

router.get("/search-users", searchLimiter, searchUsersController);
router.get("/conversations", getConversations);
router.get("/:chatId", getMessages);
router.put("/seen/:chatId", markSeen);

router.post(
  "/send",
  messageLimiter,
  upload.single("image"),
  validate(sendMessageSchema),
  checkNotBlocked,
  checkGroupPermission,
  sendMessage
);

router.delete("/:messageId", deleteMessage);
router.patch("/:messageId/edit", validate(editMessageSchema), editMessageController);
router.patch("/:messageId/react", validate(reactSchema), reactToMessage);


export default router;
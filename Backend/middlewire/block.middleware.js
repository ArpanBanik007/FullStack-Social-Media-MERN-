import { Block } from "../models/block.models.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const isBlocked = asyncHandler(async (req, res, next) => {
  const current_userId = req.user?._id;
  const target_userId = req.params?.id || req.body?.targetId;

  if (!current_userId || !target_userId) {
    throw new ApiError(400, "User identification failed.");
  }

  const blockExists = await Block.exists({
    $or: [
      { blocker: current_userId, blocked: target_userId },
      { blocker: target_userId, blocked: current_userId },
    ],
  }).lean();

  if (blockExists) {
    throw new ApiError(403, "Interaction blocked between users.");
  }

  next(); 
});
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import watchHistoryModel from "../models/watchHistory.model.js";
import watchLaterModels from "../models/watchLater.models.js";
import mongoose from "mongoose";




// History 


const getAllWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;


  const [watchHistory, totalCount] = await Promise.all([
    watchHistoryModel.find({ userId })
      .sort({ watchAt: -1 }) // most recent first
      .skip(skip)
      .limit(limit)
      .populate("videoId", "title thumbnail duration")
      .lean(),

    watchHistoryModel.countDocuments({ userId })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return res.status(200).json(
    new ApiResponse(200, {
      watchHistory,
      pagination: {
        totalItems: totalCount,
        currentPage: page,
        totalPages,
        limit,
      },
    }, "Watch History fetched successfully")
  );
});


const deleteHistorybyID = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { videoId } = req.body;

  // Validate inputs
  if (!userId || !videoId) {
    throw new ApiError(400, "User ID and Video ID are required");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Delete watch history
  const deleteHistory = await watchHistoryModel.deleteOne({ userId, videoId });

  // Check if deletion happened
  if (deleteHistory.deletedCount === 0) {
    throw new ApiError(404, "No watch history found to delete");
  }

  // Success response
  return res
    .status(200)
    .json(new ApiResponse(200, null, "History deleted successfully"));
});


const deleteAllHistory = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const { deletedCount } = await watchHistoryModel.deleteMany({ userId });

  if (deletedCount === 0) {
    throw new ApiError(404, "No watch history found to delete");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { deletedCount }, "All watch history deleted successfully"));
});







// Watch Later 



const addWatchLater = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const videoId = req.body.videoId;
  const postId = req.body.postId;

  if (!userId) throw new ApiError(400, "UserId is required");
  if (!postId && !videoId)
    throw new ApiError(400, "Either postId or videoId is required");

  // ✅ building conditions for AND query
  const conditions = [{ userId }];
  if (postId) conditions.push({ postId });
  if (videoId) conditions.push({ videoId });

  // ✅ Check if already saved
  const alreadyExists = await watchLaterModels
    .findOne({ $and: conditions })
    .lean();

  if (alreadyExists) {
    return res.status(200).json(
      new ApiResponse(200, alreadyExists, "Already in Watch Later ✅")
    );
  }

  // ✅ Create new entry
  const newWatchLater = await watchLaterModels.create({
    userId,
    postId: postId || undefined,
    videoId: videoId || undefined,
    AddAt: new Date(),
  });

  return res.status(201).json(
    new ApiResponse(201, newWatchLater, "Added to Watch Later ✅")
  );
});






const getAllWatchLater = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) throw new ApiError(400, "UserId is required");

  const watchLaterItems = await watchLaterModels
    .find({ userId })
    .populate({
      path: "postId",
      select: "title posturl createdBy",
      populate: {
        path: "createdBy",
        select: "username avatar",
      },
    })
    .populate({
      path: "videoId",
      select: "title thumbnail videoUrl createdBy",
      populate: {
        path: "createdBy",
        select: "username avatar",
      },
    })
    .sort({ AddAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, watchLaterItems, "Fetched all Watch Later items ✅")
  );
});


const deleteWatchLater = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(400, "UserId is required");

  const savedItemId = req.body.savedItemId || req.params.savedItemId;

  if (!savedItemId) {
    throw new ApiError(400, "savedItemId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(savedItemId)) {
    throw new ApiError(400, "Invalid savedItemId format");
  }

  const saved = await watchLaterModels.findOne({
    _id: savedItemId,
    userId: userId,
  });

  if (!saved) {
    throw new ApiError(404, "Saved item not found");
  }

  await saved.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Saved item deleted successfully"));
});




// createwatchHistory,

export {
  getAllWatchHistory,
  deleteHistorybyID,
  deleteAllHistory,
  addWatchLater,
  deleteWatchLater,
  getAllWatchLater,
}
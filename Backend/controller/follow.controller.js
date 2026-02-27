import mongoose from "mongoose"
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Follow } from "../models/folllow.models.js";
import {User} from "../models/user.models.js"
import { Block } from "../models/block.models.js";



// const followUser = asyncHandler(async (req, res) => {
//   const current_userId = req.user?._id;
//   const target_userId = req.params?.id;

//   if (!current_userId || !target_userId) {
//     throw new ApiError(400, "Current or Target User not exists");
//   }

//   if (!mongoose.Types.ObjectId.isValid(target_userId)) {
//     throw new ApiError(400, "Invalid Target User ID");
//   }

//   if (current_userId.toString() === target_userId.toString()) {
//     throw new ApiError(400, "Current and Target User can't be same");
//   }

//   const alreadyFollowed = await Follow.exists({
//     follower: current_userId,
//     following: target_userId,
//   });

//   if (alreadyFollowed) {
//     throw new ApiError(400, "Already followed");
//   }

//   await Follow.create({
//     follower: current_userId,
//     following: target_userId,
//   });

//   await Promise.all([
//     User.findByIdAndUpdate(current_userId, {
//       $inc: { followingCount: 1 },
//     }),
//     User.findByIdAndUpdate(target_userId, {
//       $inc: { followersCount: 1 },
//     }),
//   ]);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, { target_userId }, "Followed successfully"));
// });

const followUser = asyncHandler(async (req, res) => {
  const current_userId = req.user?._id;
  const target_userId = req.params?.id;

  if (!current_userId || !target_userId) {
    throw new ApiError(400, "Current or Target User not exists");
  }

  if (!mongoose.Types.ObjectId.isValid(target_userId)) {
    throw new ApiError(400, "Invalid Target User ID");
  }

  if (current_userId.toString() === target_userId.toString()) {
    throw new ApiError(400, "Cannot follow yourself");
  }

  const alreadyFollowed = await Follow.exists({
    follower: current_userId,
    following: target_userId,
  });

  if (alreadyFollowed) {
    return res.status(200).json({
      success: true,
      message: "Already followed",
      target_userId,
      isFollowedByMe: true,
    });
  }

  await Follow.create({
    follower: current_userId,
    following: target_userId,
  });

  const [currentUser, targetUser] = await Promise.all([
    User.findByIdAndUpdate(current_userId, { $inc: { followingCount: 1 } }, { new: true }),
    User.findByIdAndUpdate(target_userId, { $inc: { followersCount: 1 } }, { new: true }),
  ]);

  return res.status(200).json({
    success: true,
    target_userId,
    isFollowedByMe: true,
    followersCount: targetUser.followersCount,
  });
});







// const unfollowUser = asyncHandler(async (req, res) => {
//   const current_userId = req.user?._id;
//   const target_userId = req.params?.id;

//   // Validation
//   if (!current_userId || !target_userId) {
//     throw new ApiError(400, "Current or Target User not exists");
//   }

//   if (!mongoose.Types.ObjectId.isValid(target_userId)) {
//     throw new ApiError(400, "Invalid Target User ID");
//   }

//   if (current_userId.toString() === target_userId.toString()) {
//     throw new ApiError(400, "Current and Target User can't be same");
//   }

//   // Check if follow exists
//   const followRecord = await Follow.findOne({
//     follower: current_userId,
//     following: target_userId,
//   });

//   if (!followRecord) {
//     throw new ApiError(400, "You are not following this user");
//   }

//   // Delete the follow relationship
//   await followRecord.deleteOne();

//   // Decrement counters in parallel
//   await Promise.all([
//     User.findByIdAndUpdate(current_userId, {
//       $inc: { followingCount: -1 },
//     }),
//     User.findByIdAndUpdate(target_userId, {
//       $inc: { followersCount: -1 },
//     }),
//   ]);

//   return res
//     .status(200)
//     .json(new ApiResponse(200, { target_userId }, "Unfollowed successfully"));
// });




const unfollowUser = asyncHandler(async (req, res) => {
  const current_userId = req.user?._id;
  const target_userId = req.params?.id;

  // ✅ Validation
  if (!current_userId || !target_userId) {
    throw new ApiError(400, "Current or Target User not exists");
  }

  if (!mongoose.Types.ObjectId.isValid(target_userId)) {
    throw new ApiError(400, "Invalid Target User ID");
  }

  if (current_userId.toString() === target_userId.toString()) {
    throw new ApiError(400, "Cannot unfollow yourself");
  }

  // ✅ Check if follow exists
  const followRecord = await Follow.findOne({
    follower: current_userId,
    following: target_userId,
  });

  // If already not following → safe response
  if (!followRecord) {
    return res.status(200).json({
      success: true,
      message: "You are not following this user",
      target_userId,
      isFollowedByMe: false,
    });
  }

  // Delete follow record
  await followRecord.deleteOne();

  // Update follower/following counts
  const [currentUser, targetUser] = await Promise.all([
    User.findByIdAndUpdate(
      current_userId,
      { $inc: { followingCount: -1 } },
      { new: true }
    ),
    User.findByIdAndUpdate(
      target_userId,
      { $inc: { followersCount: -1 } },
      { new: true }
    ),
  ]);

  // ✅ Return updated info
  return res.status(200).json({
    success: true,
    target_userId,
    isFollowedByMe: false,
    followersCount: targetUser.followersCount,
  });
});




const getAllFollowers = asyncHandler(async (req, res) => {
  const targetUserId = req.params?.id;

  if (!targetUserId) {
    throw new ApiError(400, "Target user ID is required");
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalFollowers = await Follow.countDocuments({ following: targetUserId });

  const followers = await Follow.find({ following: targetUserId })
    .sort({ createdAt: -1 }) // latest followers first
    .skip(skip)
    .limit(limit)
    .populate("follower", "_id name username avatar") // only select necessary fields
    .lean(); // lean() makes query faster by returning plain JS object

  return res.status(200).json(
    new ApiResponse(200, {
      total: totalFollowers,
      page,
      limit,
      followers,
    })
  );
});


 const getAllFollowings = asyncHandler(async (req, res) => {
  const targetUserId = req.params?.id;

  if (!targetUserId) {
    throw new ApiError(400, "Target user ID is required");
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalFollowing = await Follow.countDocuments({ follower: targetUserId });

  const following = await Follow.find({ follower: targetUserId })
    .sort({ createdAt: -1 }) // latest followings first
    .skip(skip)
    .limit(limit)
    .populate("following", "_id name username avatar")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      total: totalFollowing,
      page,
      limit,
      following,
    })
  );
});




const getMyAllFollowers = asyncHandler(async (req, res) => {
  const userId = req.user._id; // current logged-in user
  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalFollowers = await Follow.countDocuments({ following: userId });

  const followers = await Follow.find({ following: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("follower", "_id name username avatar")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      total: totalFollowers,
      page,
      limit,
      followers,
    })
  );
});




const getMyAllFollowing = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalFollowing = await Follow.countDocuments({ follower: userId });

  const following = await Follow.find({ follower: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("following", "_id name username avatar")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      total: totalFollowing,
      page,
      limit,
      following,
    })
  );
});

const blockUser = asyncHandler(async (req, res) => {
  const currentUser = req.user._id;
  const {targetUser} = req.params?.id || req.body?.targetUser  ;

  if (currentUser.toString() === targetUser) {
    throw new ApiError(400, "You can't block yourself.");
  }

  const alreadyBlocked = await Block.findOne({
    blocker: currentUser,
    blocked: targetUser,
  });

  if (alreadyBlocked) {
    throw new ApiError(409, "User already blocked.");
  }

  // 🧠 Auto unfollow both sides (if any)
  await Follow.deleteMany({
    $or: [
      { follower: currentUser, following: targetUser },
      { follower: targetUser, following: currentUser },
    ],
  });

  await Block.create({
    blocker: currentUser,
    blocked: targetUser,
  });

  res.status(200).json(new ApiResponse(400,Block,"User blocked sucessfully"));
});

const unblockUser = asyncHandler(async (req, res) => {
  const currentUser = req.user._id;
  const targetUser = req.params.id;

  
  if (currentUser.toString() === targetUser) {
    throw new ApiError(400, "You  unblock yourself.");
  }

  const result = await Block.findOneAndDelete({
    blocker: currentUser,
    blocked: targetUser,
  });

  if (!result) {
    throw new ApiError(404, "No block found to remove.");
  }

  res.status(200).json(new ApiResponse(200, result , "User unblocked successfully."));
});

export{
    followUser,
    unfollowUser,
    getAllFollowers,
    getAllFollowings,
    blockUser,
    unblockUser,
    getMyAllFollowers,
    getMyAllFollowing,

}

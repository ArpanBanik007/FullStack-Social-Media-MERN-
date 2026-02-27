import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import Comment from "../models/comments.models.js"
import Video from "../models/video.model.js";


 const createComment = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { content, parentComment } = req.body;
  const { videoId } = req.params;


  if (!videoId || !userId || !content || content.trim() === "") {
    throw new ApiError(400, "Video ID, User ID, and valid content are required");
  }


  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }


  let parent = null;
  if (parentComment) {
    parent = await Comment.findById(parentComment);
    if (!parent) {
      throw new ApiError(404, "Parent comment not found");
    }

    if (String(parent.video) !== videoId) {
      throw new ApiError(400, "Parent comment does not belong to this video");
    }
  }


  const newComment = await Comment.create({
    content: content.trim(),
    user: userId,
    video: videoId,
    parentComment: parentComment || null,
  });

  
  await Video.findByIdAndUpdate(videoId, { $inc: { commentsCount: 1 } });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newComment, "Comment posted successfully")
    );
});


const getAllComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const videoExists = await Video.findById(videoId);
  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }

  const comments = await Comment.find({
    video: videoId,
    parentComment: null,
  })
    .populate("user", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)     
    .lean();

  // 🧠 Add replyCount only, don't attach replies
  const commentIds = comments.map((c) => c._id);
  const replyCounts = await Comment.aggregate([
    { $match: { parentComment: { $in: commentIds } } },
    { $group: { _id: "$parentComment", count: { $sum: 1 } } },
  ]);

  const replyCountMap = {};
  for (const rc of replyCounts) {
    replyCountMap[rc._id.toString()] = rc.count;
  }

  const commentsWithReplyCount = comments.map((c) => ({
    ...c,
    replyCount: replyCountMap[c._id.toString()] || 0,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, commentsWithReplyCount, "Main comments fetched"));
});

const getRepliesByCommentId = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!commentId) {
    throw new ApiError(400, "Comment ID is required");
  }

  // ✅ Check if parent comment exists (optional but clean)
  const parentComment = await Comment.findById(commentId);
  if (!parentComment) {
    throw new ApiError(404, "Parent comment not found");
  }

  // ✅ Fetch paginated replies
  const replies = await Comment.find({ parentComment: commentId })
    .populate("user", "username avatar")
    .sort({ createdAt: 1 }) // oldest first
    .skip(skip)
    .limit(limit)
    .lean();

  // ✅ Count total replies (for frontend pagination)
  const totalReplies = await Comment.countDocuments({ parentComment: commentId });

  return res.status(200).json(
    new ApiResponse(200, {
      replies,
      currentPage: page,
      totalReplies,
      totalPages: Math.ceil(totalReplies / limit),
    }, "Replies fetched")
  );
});

const commentReply = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;

  // Validate required fields
  if (!commentId || !content?.trim()) {
    return res.status(400).json(
      new ApiResponse(400, null, "Parent comment ID and content are required")
    );
  }

  // Check if parent comment exists
  const parentComment = await Comment.findById(commentId).lean();
  if (!parentComment) {
    return res.status(404).json(
      new ApiResponse(404, null, "Parent comment not found")
    );
  }

  // Create the reply
  const reply = await Comment.create({
    content: content.trim(),
    user: userId,
    parentComment: commentId,
    video: parentComment.video,
  });

  // Populate user fields
  await reply.populate("user", "username avatar");

  return res
    .status(201)
    .json(new ApiResponse(201, reply, "Reply posted successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { videoId, commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  // Step 1: Validate content
  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  // Step 2: Atomically find and update if comment exists, user owns it, and it's under the same video
  const updatedComment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      video: videoId,
      user: userId,
    },
    {
      $set: { content: content.trim() },
    },
    {
      new: true, // return the updated document
      runValidators: true, // enforce schema validation
    }
  ).populate("user", "username avatar");

  // Step 3: Handle not found or unauthorized
  if (!updatedComment) {
    throw new ApiError(404, "Comment not found or you're not authorized to update this comment");
  }

  // Step 4: Respond with updated comment
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});


const deleteComment = asyncHandler(async (req, res) => {
  const { videoId, commentId } = req.params;
  const userId = req.user._id;

  // Step 1: Check if the comment exists and belongs to the user (and the video)
  const comment = await Comment.findOne({
    _id: commentId,
    video: videoId,
    user: userId,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found or you're not authorized to delete it");
  }

  // Step 2: Delete the comment
  await comment.deleteOne();

  // Optional: If replies exist, you may want to delete them too (cascading delete)
  await Comment.deleteMany({ parentComment: commentId });

  // Step 3: Respond
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment and its replies deleted successfully"));
});



const toggleLikeOnComment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;


  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }


  const alreadyLiked = await Comment.exists({
    _id: commentId,
    likes: userId,
  });

  let updatedComment;

  if (alreadyLiked) {
   
    updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      },
      { new: true }
    );
  } else {
   
    updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
      },
      { new: true }
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: updatedComment._id,
        likesCount: updatedComment.likesCount,
        likedByCurrentUser: !alreadyLiked,
      },
      alreadyLiked ? "Unliked the comment" : "Liked the comment"
    )
  );
});





export {
    createComment,
    getAllComments,
    getRepliesByCommentId,
    commentReply,
    updateComment,
    deleteComment,
    toggleLikeOnComment,
}
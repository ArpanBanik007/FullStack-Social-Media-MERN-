import { User } from "../models/user.models.js";
import Post from "../models/createpost.models.js";
import Video from "../models/video.model.js"
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


export const searchAll = asyncHandler(async (req,res) => {
  
  const { q } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(200).json(
      new ApiResponse(200, { users: [], posts: [], videos: [] }, "Empty query")
    );
  }

  const regex = new RegExp(q.trim(), "i");


  const [users, posts, videos] = await Promise.all([
    User.find({
      $or: [{ username: regex }, { fullName: regex }]
    })
    .select("username fullName avatar")
    .limit(5)
    .lean(),

Post.find({
        $or: [{ title: regex }, { content: regex }]

})
.select("title content images posturl createdBy")
    .populate("createdBy", "username avatar")
    .limit(5)
    .lean(),

  Video.find({
      $or: [{ title: regex }, { description: regex }]
  })
 .select("title thumbnail videoUrl createdBy")
    .populate("createdBy", "username avatar")
    .limit(5)
    .lean(),


  ])
return res.status(200).json(
    new ApiResponse(200, { users, posts, videos }, "Search results fetched")
  );
})


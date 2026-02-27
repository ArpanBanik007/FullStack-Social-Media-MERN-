import { Router } from "express";
import { verifyJWT } from "../middlewire/auth.middlewire.js"; // JWT verification
import {
  followUser,
  unfollowUser,
  getAllFollowers,
  getAllFollowings,
  blockUser,
  unblockUser,
  getMyAllFollowers,
  getMyAllFollowing,
} from "../controller/follow.controller.js"; // তোমার controller
import { isBlocked } from "../middlewire/block.middleware.js"; // block check middleware


const router = Router();

// 🔹 Follow a user (check block before allowing)
router.post("/:id/follow", verifyJWT,  followUser);

// 🔹 Unfollow a user (check block before allowing)
router.post("/:id/unfollow", verifyJWT, unfollowUser);

// 🔹 Get followers list
router.get("/:id/followers", verifyJWT, getAllFollowers);

// 🔹 Get followings list
router.get("/:id/following", verifyJWT, getAllFollowings);

// 🔹 Block a user
router.post("/:id/block", verifyJWT, blockUser);

// 🔹 Unblock a user
router.post("/:id/unblock", verifyJWT, unblockUser);


// 🔹 Get My followers list
router.get("/myfollowers",verifyJWT,getMyAllFollowers);

// 🔹 Get My following list
router.get("/myfollowing",verifyJWT,getMyAllFollowing);

export default router;

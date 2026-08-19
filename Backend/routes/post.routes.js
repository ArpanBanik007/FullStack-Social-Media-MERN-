import { Router } from "express";
import { verifyJWT } from "../middlewire/auth.middlewire.js";
import { upload } from "../middlewire/multer.middlewire.js";
import {verifyJWTOptional} from "../middlewire/optionalAuth.middleware.js";
import {
  createpost,
  updatePost,
  deletePost,
  getPostsFeed,
  getSinglePost,
  incrementShareCount ,
  togglePostLike,
  togglePostDislike,
  addPostViews,
  getOwnAllPosts,
  getClickedUserPosts,
} from "../controller/createpost.controller.js";
import { shareLimiter } from "../utils/rateLimiter.js";

const router = Router();

/**
 * Post Routes
 */

// ✅ Create a new post (image optional)
router.route("/").post(
    upload.fields([
        {
            name: "postFile",
            maxCount: 1
        },
       
    ]),
    verifyJWT,
    createpost
);


// ✅ Get posts feed (search, pagination)
router.get("/feed",verifyJWT,getPostsFeed);


router.route("/my-posts").get(verifyJWT,getOwnAllPosts)


// router.route("/my-posts/:postId").get(verifyJWT,getSinglePost)

router.get("/user/:userId", verifyJWT, getClickedUserPosts);

// ✅ Get single post by ID

router.get("/:postId", verifyJWTOptional, getSinglePost);

// ✅ Get single post by ID Link

router.post("/:postId/share", shareLimiter, incrementShareCount);

// ✅ Update post (only owner, image optional)
router.patch("/:postId", verifyJWT,  updatePost);

// ✅ Delete post (only owner)
router.delete("/:postId", verifyJWT, deletePost);

// ✅ Like toggle on a post
router.route("/:postId/like").post(verifyJWT,togglePostLike)

// ✅ Dislike toggle on a post
router.post("/:postId/dislike", verifyJWT, togglePostDislike);

// ✅ Add view to post
router.post("/:postId/view", addPostViews);




export default router;

import { Router } from "express";
import { verifyJWT } from "../middlewire/auth.middlewire.js";
import { upload } from "../middlewire/multer.middlewire.js";

import {
  createpost,
  updatePost,
  deletePost,
  getPostsFeed,
  getSinglePost,
  togglePostLike,
  togglePostDislike,
  addPostViews,
  getOwnAllPosts,
} from "../controller/createpost.controller.js";

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


router.route("/my-posts/:postId").get(verifyJWT,getSinglePost)

// ✅ Get single post by ID
router.get("/:postId", getSinglePost);

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

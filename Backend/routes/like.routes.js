import { Router} from "express";
import { getMyAllLikedPosts } from "../controller/createpost.controller.js";
import { verifyJWT } from "../middlewire/auth.middlewire.js";
import { getMyAllLikedVideos } from "../controller/video.controller.js";


const router=Router();

router.route("/my-liked-posts").get(verifyJWT,getMyAllLikedPosts);
router.route("/my-liked-videos").get(verifyJWT,getMyAllLikedVideos);

export default router
import { Router} from "express";
import { getMyAllLikedPosts } from "../controller/createpost.controller.js";
import { verifyJWT } from "../middlewire/auth.middlewire.js";


const router=Router();

router.route("/my-liked-posts").get(verifyJWT,getMyAllLikedPosts);

export default router
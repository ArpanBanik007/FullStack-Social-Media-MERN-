import {Router} from "express"
import { verifyJWT } from "../middlewire/auth.middlewire.js"
import {upload} from "../middlewire/multer.middlewire.js"
import { registerUser,
         loginUser,
         sendOTP,
         verifyOTP,
         logoutUser,
         changeCurrentPassword,
         updateAccountDetails,
         updateUserAvatar,
         updateUserCoverImage,
         getCurrentUser,
         refreshAccessToken,
         


 } from "../controller/user.controller.js"


 const router=Router();



 // Register route
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

router.route("/login").post( loginUser);


// Logout route
router.route("/logout").post(verifyJWT,logoutUser); 


router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/sendOTP").post(sendOTP)
router.route("/verifyOTP").post(verifyOTP)


router.route("/change-password").post(verifyJWT,changeCurrentPassword)
//router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails) 
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-Image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)


export default router
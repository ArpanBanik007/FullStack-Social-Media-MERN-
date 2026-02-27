import asyncHandler from "../utils/asyncHandler.js"
import {User} from "../models/user.models.js"
import UserOTP from "../models/otp.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { generateOTP, sendOTPEmail } from "../services/email.services.js"
import getLocationFromIP from "../utils/getLocationFromIP.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"





const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}




 const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, phone, password ,username } = req.body;

    if (
        [fullName, email, phone, password,username].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
      email
    });

    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    let avatarLocalPath, coverImageLocalPath;
    
    if (req.files) {
        avatarLocalPath = req.files?.avatar?.[0]?.path;
        coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    }

    const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    const user = await User.create({
        fullName,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        email,
        username,
        password,
       phone
    });

    // Generate access and refresh tokens
    
    const { accessToken, refreshToken } =await generateAccessAndRefereshTokens(user._id);

    // Save refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Remove password & refreshToken from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
        .status(201)
        .cookie("accessToken", accessToken,
             { httpOnly: true, 
                secure: false,
                  sameSite: "lax", 
            })
        .cookie("refreshToken", refreshToken, 
            { httpOnly: true,
    secure: false,
    sameSite: "lax",})
        .json(
            new ApiResponse(201, 
                { user: createdUser, accessToken, refreshToken },
                "User registered successfully"
            )
        );
});


const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (user.isVerified) throw new ApiError(400, "Email already verified");

  const otp = generateOTP(); // 6-digit string
  console.log(otp)

  // Save OTP in UserOTP collection
  await UserOTP.create({
    userId: user._id,
    email,
    otp,
  });

  await sendOTPEmail(email, otp); // nodemailer

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully to your email"));
});




const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError(400, "Email & OTP are required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const userOTPRecord = await UserOTP.findOne({ email });
  if (!userOTPRecord) throw new ApiError(400, "OTP not found or expired");

  const isMatch = await bcrypt.compare(otp, userOTPRecord.otp);
  if (!isMatch) throw new ApiError(400, "Invalid OTP");

  // Get IP and location
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "127.0.0.1";
  const location = await getLocationFromIP(ip);
  if (!location) throw new ApiError(401, "Location not found");

  // Save location and mark verified
  user.location = location;
  user.isVerified = true;
  await user.save();

  // Delete used OTP
  await UserOTP.deleteOne({ email });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully"));
});





const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body; 

    if (!identifier || !password) {
        throw new ApiError(400, "Username or Email and Password are required");
    }

    const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
    });


//console.log("Searching for:", identifier);


    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Generate Tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens (user._id);

   // console.log("Generated Tokens:", { accessToken, refreshToken });


    // Exclude password and refreshToken from response

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookie options
    const options = {
        httpOnly: true,
        secure: true, // Set to `true` in production with HTTPS
        sameSite: "Strict",
    };

    // Send response with cookies
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});




const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})




const getCurrentUser = asyncHandler(async (req, res) => {
 
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "User not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});


const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

 


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")
    )
})



export {
    registerUser,
    sendOTP,
    verifyOTP,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    refreshAccessToken,


}
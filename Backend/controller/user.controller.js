import asyncHandler from "../utils/asyncHandler.js"
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/user.models.js"
import UserOTP from "../models/otp.models.js"
import EmailVerification from "../models/emailVerification.model.js"
import bcrypt from "bcrypt"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { generateOTP, sendOTPEmail } from "../services/email.services.js"
import getLocationFromIP from "../utils/getLocationFromIP.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import mongoose from "mongoose"
import { Follow } from "../models/folllow.models.js"
import jwt from "jsonwebtoken" // ✅ CHANGE 1: jwt import add করা হয়েছে




const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}


const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const urlParts = imageUrl.split("/");
    const fileWithExt = urlParts[urlParts.length - 1];
    const publicId = fileWithExt.split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};



const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, username, otp } = req.body;

  if (
    [fullName, email, phone, password, username, otp].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields, including OTP, are required");
  }

  if (password.trim().length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const otpRecord = await EmailVerification.findOne({ email });
  if (!otpRecord) {
    throw new ApiError(403, "OTP not found or expired. Please request a new one.");
  }

  const isMatch = await bcrypt.compare(otp, otpRecord.otpHash);
  if (!isMatch) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (new Date() > otpRecord.expiresAt) {
    throw new ApiError(400, "OTP has expired");
  }

  const existedUser = await User.findOne({ email });

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
    userId: username,
    name: fullName,
    fullName,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
    email,
    username,
    password,
    phone,
    isVerified: true
  });

  await EmailVerification.deleteMany({ email });

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // ✅ CHANGE 2: register এ maxAge add — browser close হলেও cookie থাকবে
  return res
    .status(201)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ CHANGE 2
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ CHANGE 2
    })
    .json(
      new ApiResponse(201,
        { user: createdUser, accessToken, refreshToken },
        "User registered successfully"
      )
    );
});


const otpRateLimit = new Map();

const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  const now = Date.now();
  if (otpRateLimit.has(email) && now - otpRateLimit.get(email) < 60000) {
    throw new ApiError(429, "Please wait 60 seconds before requesting another OTP");
  }
  otpRateLimit.set(email, now);

  const user = await User.findOne({ email });
  if (user) throw new ApiError(409, "User with this email already exists");

  const otp = generateOTP();
  console.log("✅ OTP generated:", otp);

  await EmailVerification.deleteMany({ email });

  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

  await EmailVerification.create({ email, otpHash, expiresAt });

  // ⬇️ এই try-catch টা add করো
  try {
    await sendOTPEmail(email, otp);
    console.log("✅ Email sent successfully");
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
    console.error("❌ Full error:", err);
    throw new ApiError(500, "Failed to send OTP email: " + err.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully to your email"));
});


const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) throw new ApiError(400, "Email & OTP are required");

  const userOTPRecord = await EmailVerification.findOne({ email });
  if (!userOTPRecord) throw new ApiError(400, "OTP not found or expired");

  const isMatch = await bcrypt.compare(otp, userOTPRecord.otpHash);
  if (!isMatch) throw new ApiError(400, "Invalid OTP");

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Email verified successfully. You can now register."));
});




const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ApiError(400, "Username or Email and Password are required");
  }

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email first");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  // ✅ CHANGE 3: maxAge add করা হয়েছে — এটাই persistent login এর চাবিকাঠি
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ CHANGE 3: 7 দিন browser এ cookie থাকবে
  };

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




const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/"
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})



const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {

    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );


    const dbUser = await User.findById(decoded._id);

    if (!dbUser) {
      throw new ApiError(401, "Invalid refresh token");
    }


    if (dbUser.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token expired or used");
    }


    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefereshTokens(dbUser._id);


    const user = await User.findById(dbUser._id).select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,

          { user, accessToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })

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


const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName?.trim() && !email?.trim()) {
    throw new ApiError(400, "Provide at least one field to update (fullName or email)");
  }

  const updateFields = {};

  if (fullName?.trim()) {
    updateFields.fullName = fullName.trim();
  }

  if (email?.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new ApiError(400, "Invalid email format");
    }

    const emailExists = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: req.user._id },
    });

    if (emailExists) {
      throw new ApiError(409, "Email is already taken by another account");
    }

    updateFields.email = email.toLowerCase().trim();
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});


const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const oldAvatarUrl = req.user?.avatar;

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(500, "Failed to upload avatar. Please try again");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password -refreshToken");

  await deleteFromCloudinary(oldAvatarUrl);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});


const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is missing");
  }

  const oldCoverImageUrl = req.user?.coverImage;

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(500, "Failed to upload cover image. Please try again");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password -refreshToken");

  await deleteFromCloudinary(oldCoverImageUrl);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image updated successfully"));
});



const getClickedUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const clickedUser = await User
    .findById(userId)
    .select("-password")
    .lean();

  if (!clickedUser) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, clickedUser, "User fetched successfully")
  );
});



const getMyFollowers = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const [followers, total] = await Promise.all([
    Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("follower", "username avatar fullName")
      .lean(),
    Follow.countDocuments({ following: userId }),
  ]);

  const followerList = followers.map((f) => f.follower).filter(Boolean);

  return res.status(200).json(
    new ApiResponse(200, {
      followers: followerList,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    }, "Followers fetched successfully")
  );
});


const getMyFollowings = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  if (!userId) throw new ApiError(401, "Unauthorized");
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const [followings, total] = await Promise.all([
    Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("following", "username avatar fullName")
      .lean(),
    Follow.countDocuments({ follower: userId }),
  ]);

  const followingList = followings.map((f) => f.following).filter(Boolean);

  return res.status(200).json(
    new ApiResponse(200, {
      followings: followingList,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    }, "Followings fetched successfully")
  );
});


const getClickedUserFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  if (!userId) throw new ApiError(400, "User ID is required");
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const userExists = await User.exists({ _id: userId });
  if (!userExists) throw new ApiError(404, "User not found");

  const [followers, total] = await Promise.all([
    Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("follower", "username avatar fullName")
      .lean(),
    Follow.countDocuments({ following: userId }),
  ]);

  const followerList = followers.map((f) => f.follower).filter(Boolean);

  return res.status(200).json(
    new ApiResponse(200, {
      followers: followerList,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    }, "Followers fetched successfully")
  );
});


const getClickedUserFollowings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  if (!userId) throw new ApiError(400, "User ID is required");
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const userExists = await User.exists({ _id: userId });
  if (!userExists) throw new ApiError(404, "User not found");

  const [followings, total] = await Promise.all([
    Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("following", "username avatar fullName")
      .lean(),
    Follow.countDocuments({ follower: userId }),
  ]);

  const followingList = followings.map((f) => f.following).filter(Boolean);

  return res.status(200).json(
    new ApiResponse(200, {
      followings: followingList,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    }, "Followings fetched successfully")
  );
});


export {
  registerUser,
  sendOTP,
  verifyOTP,
  loginUser,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  getClickedUserDetails,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  refreshAccessToken,
  getMyFollowers,
  getMyFollowings,
  getClickedUserFollowers,
  getClickedUserFollowings,
}
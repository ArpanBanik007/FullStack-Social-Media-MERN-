import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js";

export const verifyJWTOptional = asyncHandler(async (req, _res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select("-password -refreshToken");
    req.user = user || null;
  } catch (err) {
    req.user = null; // token invalid/expired hole o guest hisebe treat koro, error na dio
  }
  next();
});
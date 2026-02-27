import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js"
import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js";






export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

        console.log("🔐 Token received:", token); // 🧪 Debug this!

        if (!token) {
            throw new ApiError(401, 'Unauthorized request - Token not found');
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id).select('-password -refreshToken');

        if (!user) {
            throw new ApiError(401, 'Invalid Access Token - User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT ERROR:", error.message); // Log actual error
        throw new ApiError (401, error?.message || 'Invalid access token');
    }
});


import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userOTPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes
  },
});

userOTPSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) return next();
  this.otp = await bcrypt.hash(this.otp, 10);
  next();
});

export default mongoose.model("UserOTP", userOTPSchema);
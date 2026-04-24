// models/user.model.js
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    // 🔹 Basic Identity
    userId: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    fullName: {
      type: String,
      trim: true,
      default: "",
    },

    name: {
      type: String,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
    },

    // ─────────────────────────────
    // 🔹 Profile / Media
    // ─────────────────────────────
    avatar: {
      type: String,
      default: "",
    },

    avatarPublicId: {
      type: String,
      default: null,
    },

    coverImage: {
      type: String, // Cloudinary URL
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default: "",
    },

    // ─────────────────────────────
    // 🔹 Location
    // ─────────────────────────────
    location: {
      ip: { type: String, default: null },
      city: { type: String, default: null },
      region: { type: String, default: null },
      country: { type: String, default: null },
    },

    // ─────────────────────────────
    // 🔹 Social Stats
    // ─────────────────────────────
    followersCount: {
      type: Number,
      default: 0,
    },

    followingCount: {
      type: Number,
      default: 0,
    },

    // ─────────────────────────────
    // 🔹 Plan & Points
    // ─────────────────────────────
    plan: {
      type: String,
      enum: ["free", "premium", "pro"],
      default: "free",
    },

    points: {
      type: Number,
      default: 0,
    },

    // ─────────────────────────────
    // 🔹 Downloads & Groups
    // ─────────────────────────────
    downloads: [
      {
        type: String, // video/document ID or filename
      },
    ],

    groups: [
      {
        type: String, // group IDs
      },
    ],

    // ─────────────────────────────
    // 🔹 Online Status (Chat)
    // ─────────────────────────────
    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },

    // ─────────────────────────────
    // 🔹 Blocked Users (Chat)
    // ─────────────────────────────
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ─────────────────────────────
    // 🔹 Push Notification (Future)
    // ─────────────────────────────
    fcmToken: {
      type: String,
      default: null,
    },

    // ─────────────────────────────
    // 🔹 Password Reset (Future)
    // ─────────────────────────────
    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // ─────────────────────────────
    // 🔹 Role & Status
    // ─────────────────────────────
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    loginTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// =====================
// 🔥 INDEXES
// =====================
userSchema.index({ username: "text", name: "text" });
userSchema.index({ email: 1 });
userSchema.index({ isOnline: 1 });

// =====================
// 🛠️ PRE SAVE — Password Hash
// =====================
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// =====================
// 🛠️ METHODS
// =====================


userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ✅ Chat system এর জন্য alias
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ JWT Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// ✅ JWT Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// ✅ কোনো user block করা আছে কিনা চেক (Chat)
userSchema.methods.hasBlocked = function (userId) {
  return this.blockedUsers.some(
    (id) => id.toString() === userId.toString()
  );
};

// ✅ Safe user object — sensitive fields ছাড়া (Chat response এ কাজে লাগবে)
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.fcmToken;
  return obj;
};

export const User = mongoose.model("User", userSchema);
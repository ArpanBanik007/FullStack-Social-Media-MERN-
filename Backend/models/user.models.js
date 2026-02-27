import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
 userId: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

avatar:{
type: String,
 } ,
coverImage: {
type: String, // cloudinary url
 },
       
 location: {
    ip: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    region: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
  },
   followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },

  plan: {
    type: String,
    enum: ['free', 'premium', 'pro'],
    default: 'free'
  },

  points: {
    type: Number,
    default: 0
  },

  downloads: [
    {
      type: String // video/document ID or filename
    }
  ],


  groups: [
    {
      type: String // group IDs
    }
  ],

  loginTime: {
    type: Date,
    default: Date.now
  },
 role: {
type: String,
enum: ['user', 'admin'], 
default: 'user',         
},


  isVerified: {
    type: Boolean,
    default: false
  },

}, {
  timestamps: true
});

// ✅ Password Hash Middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Password Compare Method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ✅ JWT Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

// ✅ JWT Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

export const User = mongoose.model("User", userSchema);

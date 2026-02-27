import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {

    userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: [true, "User ID is required"],
        },
    
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title must be less than 100 characters"],
    },

    videourl: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
      // match: [
      //   /^http?:\/\/.+/,
      //   "Please provide a valid video URL (https://...)",
      // ],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description too long"],
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader info is required"],
    },

    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },

    tags: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 10,
        message: "Maximum 10 tags allowed",
      },
      default: [],
    },

     category: {
   type: String,
  enum: ["education", "entertainment", "sports", "tech", "music", "others"],
  default: "others",
},
isPublished: {
  type: Boolean,
  default: false,
},

    thumbnail: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/.+/,
        "Please provide a valid thumbnail URL (https://...)",
      ],
    },
    createdBy:{
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
         required:true
       
    },
    views:{
      type:Number,
      default: 0
    },
    
    likes:{
      type:Number,
      default: 0
    },
    dislikes:{
      type:Number,
      default: 0
    },
    comments:{
      type:Number,
      default: 0
    }
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false, // removes __v
  }
);

// Optional: Add indexing for performance (searching tags or uploader-based)
videoSchema.index({ title: "text" });

const Video = mongoose.model("Video", videoSchema);

export default Video;

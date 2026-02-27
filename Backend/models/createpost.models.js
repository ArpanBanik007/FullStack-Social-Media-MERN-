import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

  title: {
  type: String,
  trim: true,
  minlength: [3, "Title must be at least 3 characters long"],
  maxlength: [100, "Title must be less than 100 characters"],
  // unique: true,  <-- remove this
},


    posturl: {
      type: String,
      required: [true, "Post URL is required"],
      trim: true,
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
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 10,
        message: "Maximum 10 tags allowed",
      },
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


likes: {
  type: Number,
  default: 0,
  min: 0
},

dislikes: {
  type: Number,
  default: 0,
  min: 0
},


        comments:{
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ✅ Text index for search (title + tags)
postSchema.index({ title: "text", tags: "text" });


const Post = mongoose.model("Post", postSchema);

export default Post;

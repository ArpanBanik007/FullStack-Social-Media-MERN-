import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      validate: {
        validator: function (value) {
          return value.trim().length > 0;
        },
        message: "Comment cannot be just whitespace",
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

   
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      default: null,
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", 
      default: null,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

// validation: must have either video OR post
commentSchema.pre("save", function (next) {
  if (!this.video && !this.post) {
    return next(new Error("Comment must belong to either a video or a post"));
  }
  next();
});

export default mongoose.model("Comment", commentSchema);

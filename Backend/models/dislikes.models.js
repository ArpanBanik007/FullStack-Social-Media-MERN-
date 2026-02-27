import mongoose from "mongoose";

const dislikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
   
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);


dislikeSchema.index(
  { user: 1, post: 1 }, 
  { unique: true});


const Dislike = mongoose.model("Dislike", dislikeSchema);

export default Dislike;

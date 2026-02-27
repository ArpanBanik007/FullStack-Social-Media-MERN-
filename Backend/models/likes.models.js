import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
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
      index: true,
    },

  },
 
{

    timestamps: true,
    versionKey: false,
  }
);



// 🔒 Unique constraints (VERY IMPORTANT)
likeSchema.index(
  { user: 1, post: 1 },
  { unique: true}
);



const Like = mongoose.model("Like", likeSchema);
export default Like;

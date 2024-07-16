import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  photo: { type: String },
});

PostSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

PostSchema.set("toJSON", {
  virtuals: true,
});
PostSchema.set("toObject", {
  virtuals: true,
});

export default mongoose.model("Post", PostSchema);

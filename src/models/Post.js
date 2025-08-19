import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  authorId: mongoose.Schema.Types.ObjectId,
  title: String,
  body: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", PostSchema);

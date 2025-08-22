import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  authorId: mongoose.Schema.Types.ObjectId,
  author: { type: String, required: true }, // 작성자 닉네임
  title: String,
  body: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", PostSchema);

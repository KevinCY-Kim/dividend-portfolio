import Post from "../models/Post.js";

export async function getBoard(req,res){
  const posts = await Post.find().sort({createdAt:-1}).lean();
  res.render("board", { posts });
}

export async function createPost(req,res){
  const { title, body } = req.body;
  await Post.create({ title, body, authorId: req.session.userId || null });
  res.redirect("/board");
}

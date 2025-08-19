// cRUD 관련 모든 함수, 게시판 컨트롤러

import Post from "../models/Post.js";

// 📌 목록 + 페이징
export async function getBoard(req,res){
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // 페이지당 게시물 개수
  const skip = (page - 1) * limit;

  const [posts, count] = await Promise.all([
    Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments()
  ]);

  res.render("board", {
    posts,
    page,
    totalPages: Math.ceil(count / limit),
    limit   // 🔥 추가
  });
}

// 📌 글 작성
export async function createPost(req,res){
  const { title, body } = req.body;
  await Post.create({ title, body, authorId: req.session.userId || null });
  res.redirect("/board");
}

// 📌 수정 폼
export async function editForm(req,res){
  const post = await Post.findById(req.params.id).lean();
  res.render("board_edit", { post });
}

// 📌 글 수정
export async function updatePost(req,res){
  const { title, body } = req.body;
  await Post.findByIdAndUpdate(req.params.id, { title, body });
  res.redirect("/board");
}

// 📌 삭제 확인 폼
export async function deleteForm(req, res) {
  const post = await Post.findById(req.params.id).lean();
  res.render("board_delete", { post });
}

// 📌 실제 삭제 처리
export async function deletePost(req, res) {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/board");
}

// 게시글 상세보기
export async function getPostDetail(req, res) {
  const post = await Post.findById(req.params.id).lean();
  if (!post) return res.redirect("/board"); // 존재하지 않으면 목록으로
  res.render("board_detail", { post });
}
// cRUD 관련 모든 함수, 게시판 컨트롤러

import Post from "../models/Post.js";
import User from "../models/User.js";

// 로그인 체크 미들웨어
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

// 📌 목록 + 페이징
export async function getBoard(req,res){
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // 페이지당 게시물 개수
    const skip = (page - 1) * limit;

    const [posts, count] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments()
    ]);

    // 기존 데이터에 author 필드가 없는 경우 처리
    const processedPosts = posts.map(post => ({
      ...post,
      author: post.author || '알 수 없음',
      authorId: post.authorId || null
    }));

    res.render("board", {
      posts: processedPosts,
      page,
      totalPages: Math.ceil(count / limit),
      limit,   // 🔥 추가
      isLoggedIn: !!req.session.userId,
      currentUserId: req.session.userId
    });
  } catch (error) {
    console.error('Board 목록 조회 에러:', error);
    res.status(500).send('게시판을 불러오는 중 오류가 발생했습니다.');
  }
}

// 📌 글 작성
export async function createPost(req,res){
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    const { title, body } = req.body;
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.redirect('/auth/login');
    }
    
    await Post.create({ 
      title, 
      body, 
      authorId: req.session.userId,
      author: user.nickname || user.email
    });
    res.redirect("/board");
  } catch (error) {
    console.error('Post 생성 에러:', error);
    res.status(500).send('게시글 작성 중 오류가 발생했습니다.');
  }
}

// 📌 수정 폼
export async function editForm(req,res){
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.redirect("/board");
    
    // 작성자만 수정 가능
    if (post.authorId && post.authorId.toString() !== req.session.userId) {
      return res.redirect("/board");
    }
    
    res.render("board_edit", { post });
  } catch (error) {
    console.error('Edit form 에러:', error);
    res.status(500).send('수정 폼을 불러오는 중 오류가 발생했습니다.');
  }
}

// 📌 글 수정
export async function updatePost(req,res){
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect("/board");
    
    // 작성자만 수정 가능
    if (post.authorId && post.authorId.toString() !== req.session.userId) {
      return res.redirect("/board");
    }
    
    const { title, body } = req.body;
    await Post.findByIdAndUpdate(req.params.id, { title, body });
    res.redirect("/board");
  } catch (error) {
    console.error('Post 수정 에러:', error);
    res.status(500).send('게시글 수정 중 오류가 발생했습니다.');
  }
}

// 📌 삭제 확인 폼
export async function deleteForm(req, res) {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.redirect("/board");
    
    // 작성자만 삭제 가능
    if (post.authorId && post.authorId.toString() !== req.session.userId) {
      return res.redirect("/board");
    }
    
    res.render("board_delete", { post });
  } catch (error) {
    console.error('Delete form 에러:', error);
    res.status(500).send('삭제 폼을 불러오는 중 오류가 발생했습니다.');
  }
}

// 📌 실제 삭제 처리
export async function deletePost(req, res) {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.redirect("/board");
    
    // 작성자만 삭제 가능
    if (post.authorId && post.authorId.toString() !== req.session.userId) {
      return res.redirect("/board");
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/board");
  } catch (error) {
    console.error('Post 삭제 에러:', error);
    res.status(500).send('게시글 삭제 중 오류가 발생했습니다.');
  }
}

// 게시글 상세보기
export async function getPostDetail(req, res) {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.redirect("/board"); // 존재하지 않으면 목록으로
    
    // 기존 데이터에 author 필드가 없는 경우 처리
    const processedPost = {
      ...post,
      author: post.author || '알 수 없음',
      authorId: post.authorId || null
    };
    
    res.render("board_detail", { 
      post: processedPost,
      isLoggedIn: !!req.session.userId,
      currentUserId: req.session.userId
    });
  } catch (error) {
    console.error('Post 상세보기 에러:', error);
    res.status(500).send('게시글을 불러오는 중 오류가 발생했습니다.');
  }
}
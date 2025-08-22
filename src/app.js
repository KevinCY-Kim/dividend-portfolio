import 'dotenv/config'; 

import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// 라우트 임포트
import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/board.js";
import stocksRoutes from "./routes/stocks.js";
import portfolioRoutes from "./routes/portfolio.js";
import chartsRoutes from "./routes/charts.js";
import chatRoutes from "./routes/chat.js";
import chatbotRoutes from "./routes/chatbot.js";

// 가격 업데이트 서비스 임포트
import priceUpdateService from "./services/priceUpdateService.js";
dotenv.config();

// ✅ MongoDB 연결
await connectDB();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 미들웨어
app.use(cors());
app.use(morgan("dev"));

// 바디 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// method-override (PUT, DELETE 같은 브라우저 form 요청 처리)
import methodOverride from "method-override";
app.use(express.urlencoded({ extended: true })); // form 데이터 파싱
app.use(methodOverride("_method")); // 반드시 body parser 뒤

// ✅ 세션 & MongoStore (로그인 세션 유지)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "changeme123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // 2시간
    },
  })
);

// 뷰 엔진 & 정적 파일
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// 로그인 상태 확인 API
app.get("/api/check-auth", (req, res) => {
  res.json({
    isLoggedIn: !!req.session.userId,
    userId: req.session.userId || null
  });
});

// 관리자 API 엔드포인트들
app.get("/admin/accounts", async (req, res) => {
  try {
    const User = (await import("./models/User.js")).default;
    const accounts = await User.find({}, { email: 1, nickname: 1, createdAt: 1, _id: 0 }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    console.error('계정 목록 조회 오류:', error);
    res.status(500).json({ success: false, error: '계정 목록을 불러오는데 실패했습니다.' });
  }
});

app.post("/admin/accounts", async (req, res) => {
  try {
    const User = (await import("./models/User.js")).default;
    const bcrypt = (await import("bcryptjs")).default;
    const validator = (await import("validator")).default;
    
    const { email, nickname, password } = req.body;
    
    // 입력값 검증
    if (!email || !nickname || !password) {
      return res.status(400).json({ success: false, error: '모든 필드를 입력해주세요.' });
    }
    
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, error: '유효한 이메일을 입력해주세요.' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' });
    }
    
    // 중복 이메일 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: '이미 존재하는 이메일입니다.' });
    }
    
    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 새 사용자 생성
    const newUser = new User({
      email,
      nickname,
      password: hashedPassword
    });
    
    await newUser.save();
    res.json({ success: true, message: '계정이 성공적으로 생성되었습니다.' });
  } catch (error) {
    console.error('계정 생성 오류:', error);
    res.status(500).json({ success: false, error: '계정 생성에 실패했습니다.' });
  }
});

app.delete("/admin/accounts/:email", async (req, res) => {
  try {
    const User = (await import("./models/User.js")).default;
    const email = decodeURIComponent(req.params.email);
    
    const deletedUser = await User.findOneAndDelete({ email });
    
    if (!deletedUser) {
      return res.status(404).json({ success: false, error: '해당 이메일의 계정을 찾을 수 없습니다.' });
    }
    
    res.json({ success: true, message: '계정이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('계정 삭제 오류:', error);
    res.status(500).json({ success: false, error: '계정 삭제에 실패했습니다.' });
  }
});

app.get("/admin/posts", async (req, res) => {
  try {
    const Post = (await import("./models/Post.js")).default;
    const posts = await Post.find({}, { title: 1, author: 1, createdAt: 1, _id: 1 }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('게시글 목록 조회 오류:', error);
    res.status(500).json({ success: false, error: '게시글 목록을 불러오는데 실패했습니다.' });
  }
});

app.delete("/admin/posts/:id", async (req, res) => {
  try {
    const Post = (await import("./models/Post.js")).default;
    const postId = req.params.id;
    
    const deletedPost = await Post.findByIdAndDelete(postId);
    
    if (!deletedPost) {
      return res.status(404).json({ success: false, error: '해당 게시글을 찾을 수 없습니다.' });
    }
    
    res.json({ success: true, message: '게시글이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    res.status(500).json({ success: false, error: '게시글 삭제에 실패했습니다.' });
  }
});

// 라우트 등록
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/board", boardRoutes);
app.use("/stocks", stocksRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/charts", chartsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chatbot", chatbotRoutes);

// 404 핸들러
app.use((req, res) => {
  res.status(404).render("inc/404", { url: req.originalUrl });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).send("Internal Server Error");
});

// 서버 실행
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  
  // 🚀 가격 업데이트 서비스 시작
  try {
    priceUpdateService.start();
    console.log("✅ 주식 가격 업데이트 서비스가 시작되었습니다.");
  } catch (error) {
    console.error("❌ 가격 업데이트 서비스 시작 실패:", error);
  }
});
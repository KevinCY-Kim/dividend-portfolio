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

// 라우트 등록
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/board", boardRoutes);
app.use("/stocks", stocksRoutes);
app.use("/portfolio", portfolioRoutes);
app.use("/charts", chartsRoutes);
app.use("/api/chat", chatRoutes);

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
app.listen(port, () =>
  console.log(`✅ Server running on http://localhost:${port}`)
);
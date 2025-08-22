import { Router } from "express";
import { addStockToPortfolio, getPortfolio, removeStockFromPortfolio } from "../controllers/portfolioController.js";
const router = Router();

// 포트폴리오에 종목 추가
router.post("/add", addStockToPortfolio);

// 포트폴리오 조회
router.get("/", getPortfolio);

// 포트폴리오에서 종목 제거
router.delete("/remove/:ticker", removeStockFromPortfolio);

export default router;

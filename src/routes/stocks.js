import { Router } from "express";
<<<<<<< HEAD
import { listStocks } from "../controllers/stockController.js";
const router = Router();
router.get("/", listStocks);
=======
import { listStocks, getIndexStats } from "../controllers/stockController.js";
import priceUpdateService from "../services/priceUpdateService.js";
const router = Router();

router.get("/", listStocks);
router.get("/stats", getIndexStats);

// 가격 업데이트 관련 엔드포인트
router.post("/update-price/:ticker", async (req, res) => {
  try {
    const { ticker } = req.params;
    const result = await priceUpdateService.manualUpdate(ticker);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/update-all-prices", async (req, res) => {
  try {
    // 비동기로 실행 (사용자는 즉시 응답 받음)
    priceUpdateService.updateAllStockPrices();
    res.json({ message: "가격 업데이트가 시작되었습니다.", status: "started" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/price-update-status", (req, res) => {
  const status = priceUpdateService.getStatus();
  res.json(status);
});

>>>>>>> update for dividend
export default router;

import { Router } from "express";
import { listStocks } from "../controllers/stockController.js";
const router = Router();
router.get("/", listStocks);
export default router;

import { Router } from "express";
import { getBoard, createPost } from "../controllers/boardController.js";
const router = Router();
router.get("/", getBoard);
router.post("/", createPost);
export default router;

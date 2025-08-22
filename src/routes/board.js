import { Router } from "express";
import {
  getBoard,
  createPost,
  getPostDetail,  // 상세 페이지 추가
  editForm,
  updatePost,
  deleteForm,
  deletePost
} from "../controllers/boardController.js";

const router = Router();

router.get("/", getBoard);             // 목록 + 페이징
router.post("/", createPost);          // 작성

router.get("/:id", getPostDetail);     // 🔹 상세 페이지
router.get("/:id/edit", editForm);     // 수정 폼
router.post("/:id", updatePost);       // 수정 처리

router.get("/:id/delete", deleteForm); // 삭제 확인 페이지
router.delete("/:id", deletePost);     // 실제 삭제 처리

export default router;
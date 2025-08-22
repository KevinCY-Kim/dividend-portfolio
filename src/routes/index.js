import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.render("home", { title: "BDJ Finance" });
});

// 배당주 선택 페이지
router.get("/select", (req, res) => {
  res.render("select", { title: "BDJ Finance - 종목 선택" });
});

// 가격 관리 페이지
router.get("/price-admin", (req, res) => {
  res.render("price-admin", { title: "BDJ Finance - 가격 관리" });
});

// Chatbot 페이지
router.get("/chatbot", (req, res) => {
  res.render("chatbot", { title: "BDJ Finance - Chatbot" });
});

export default router;

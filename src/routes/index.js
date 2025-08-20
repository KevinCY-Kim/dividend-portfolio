import { Router } from "express";
const router = Router();
<<<<<<< HEAD
router.get("/", (req,res)=> res.render("home"));
router.get("/select", (req,res)=> res.render("select"));
=======

router.get("/", (req, res) => {
  res.render("home");
});

// 배당주 선택 페이지
router.get("/select", (req, res) => {
  res.render("select");
});

// 가격 관리 페이지
router.get("/price-admin", (req, res) => {
  res.render("price-admin");
});

>>>>>>> update for dividend
export default router;

import { Router } from "express";
const router = Router();
router.get("/", (req,res)=> res.render("home"));
router.get("/select", (req,res)=> res.render("select"));
export default router;

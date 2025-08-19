import { Router } from "express";
const router = Router();
router.get("/portfolio", (req,res)=> res.render("chart_frame"));
export default router;

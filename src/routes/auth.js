import { Router } from "express";
import { getLogin, getRegister, postRegister, postLogin, logout } from "../controllers/authController.js";
const router = Router();
router.get("/login", getLogin);
router.get("/register", getRegister);
router.post("/register", postRegister);
router.post("/login", postLogin);
router.get("/logout", logout);
export default router;

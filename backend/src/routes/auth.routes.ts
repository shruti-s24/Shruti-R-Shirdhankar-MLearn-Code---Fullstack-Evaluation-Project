import { Router } from "express";
import { login, logout, getMe } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth(["admin", "agent"]), getMe);

export default router;

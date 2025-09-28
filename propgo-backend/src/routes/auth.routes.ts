import { Router } from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
} from "../controllers/auth.controller.js";

const router = Router();

// POST /api/auth/signup
router.post("/signup", signup);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout
router.post("/logout", logout);

// POST /api/auth/refresh
router.post("/refresh", refreshToken);

export default router;

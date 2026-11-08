
import express from "express";
import rateLimit from "express-rate-limit";

import {
  resendOtp,
  signup,
  login,
  verifyEmail,
} from "../controllers/auth.controller.js";

import {
  refreshSession,
  logout,
} from "../controllers/session.controller.js";

import {
  getCurrentUser,
} from "../controllers/user.controller.js";

import {
  authenticateToken,
} from "../middleware/auth.middleware.js";

const router = express.Router();

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/verify-email", verifyLimiter, verifyEmail);
router.post("/resend-otp", resendLimiter, resendOtp);

router.post("/refresh", refreshLimiter, refreshSession);
router.post("/logout", refreshLimiter, logout);

router.get("/me", authenticateToken, getCurrentUser);

export default router;

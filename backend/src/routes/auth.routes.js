import express from "express";
import rateLimit from "express-rate-limit";

import {
    resendOtp,
    signup,
    verifyEmail,
} from "../controllers/auth.controller.js";

const router = express.Router();

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
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

router.post("/signup", signupLimiter, signup);
router.post("/verify-email", verifyLimiter, verifyEmail);
router.post("/resend-otp", resendLimiter, resendOtp);

export default router;


import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  googleLogin,
  facebookLogin,
  completeOAuthSignup,
} from "../controllers/oauth.controller.js";

const router = Router();

const socialLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many signup attempts. Please try again later.",
  },
});

router.post("/google", socialLoginLimiter, googleLogin);
router.post("/facebook", socialLoginLimiter, facebookLogin);
router.post("/complete-signup", signupLimiter, completeOAuthSignup);

export default router;

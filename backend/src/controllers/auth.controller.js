
import {
  signupSchema,
  loginSchema,
  resendOtpSchema,
  verifyEmailSchema,
} from "../utils/auth.validation.js";

import {
  registerUser,
  authenticateUser,
} from "../services/auth.service.js";

import { issueAuthTokens } from "../services/token.service.js";

import {
  createAndSendOtp,
  verifyUserOtp,
  resendUserOtp,
} from "../services/otp.service.js";

export const signup = async (req, res, next) => {
  try {
    const validation = signupSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your signup information.",
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const user = await registerUser(validation.data);

    try {
      await createAndSendOtp(user);
    } catch (emailError) {
      console.error("OTP delivery failed:", emailError);

      return res.status(502).json({
        success: false,
        accountCreated: true,
        message:
          "Your account was created, but we couldn't send the verification email. Please request a new code.",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Account created. Check your email for the verification code.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      });
    }

    const user = await authenticateUser(validation.data);
    const tokens = await issueAuthTokens(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const validation = verifyEmailSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      });
    }

    const user = await verifyUserOtp(
      validation.data.email,
      validation.data.otp,
    );

    const tokens = await issueAuthTokens(user);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      user,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const validation = resendOtpSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const email = validation.data.email.toLowerCase();
    const result = await resendUserOtp(email);

    if (result.cooldown) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${result.retryAfterSeconds} seconds before requesting another code.`,
        retryAfterSeconds: result.retryAfterSeconds,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.sent
        ? "A new verification code has been sent to your email."
        : "If an unverified account exists for this email, a verification code can be requested.",
    });
  } catch (error) {
    next(error);
  }
};

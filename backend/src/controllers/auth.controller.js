import { signupSchema } from "../utils/auth.validation.js";
import { registerUser } from "../services/auth.service.js";
import {
  createAndSendOtp,
  verifyUserOtp,
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
          "Your account was created, but we couldn't send the verification email. Please try requesting a new code.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account created. Check your email for the verification code.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email and six-digit code.",
      });
    }

    const user = await verifyUserOtp(email, otp);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
};
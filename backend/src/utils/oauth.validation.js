import { z } from "zod";
import { usernameSchema } from "./auth.validation.js";

export const googleAuthSchema = z.object({
  idToken: z
    .string()
    .min(1, "Google ID token is required.")
    .max(10000, "Invalid Google ID token."),
});

export const facebookAuthSchema = z.object({
  accessToken: z
    .string()
    .min(1, "Facebook access token is required.")
    .max(10000, "Invalid Facebook access token."),
});

export const completeOAuthSchema = z.object({
  onboardingToken: z
    .string()
    .min(1, "Onboarding token is required.")
    .max(10000, "Invalid onboarding token."),

  username: usernameSchema,
});
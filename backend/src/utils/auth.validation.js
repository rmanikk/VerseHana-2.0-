
import { z } from "zod";

// Keep this list aligned with the mobile signup validation.
// The backend is always the final authority.
const BLOCKED_USERNAME_TERMS = [
  "admin",
  "moderator",
  "support",
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "slut",
  "whore",
];

function normalizeUsernameForModeration(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z]/g, "")
    .replace(/(.)\1+/g, "$1");
}

function hasBlockedUsernameTerm(value) {
  const normalized = normalizeUsernameForModeration(value);

  const parts = value
    .toLowerCase()
    .split(/[_\d]+/)
    .filter(Boolean);

  return BLOCKED_USERNAME_TERMS.some((term) => {
    const normalizedTerm =
      normalizeUsernameForModeration(term);

    return (
      normalized.includes(normalizedTerm) ||
      parts.some(
        (part) =>
          normalizeUsernameForModeration(part) ===
          normalizedTerm
      )
    );
  });
}

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must contain at least 3 characters.")
  .max(20, "Username cannot exceed 20 characters.")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "Username must start with a letter and contain only letters, numbers and underscores."
  )
  .refine(
    (value) => !value.includes("__"),
    "Avoid consecutive underscores."
  )
  .refine(
    (value) => !hasBlockedUsernameTerm(value),
    "Please choose a different username."
  );

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters.")
    .regex(
      /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u,
      "Full name contains unsupported characters."
    ),

  username: usernameSchema,

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(255, "Email is too long."),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128, "Password cannot exceed 128 characters.")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).+$/,
      "Password must include at least one letter and one number."
    ),
});

export const resendOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(255, "Email is too long."),
});
export const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(255, "Email is too long."),

  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Please enter a valid six-digit verification code."),
});
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(255, "Email is too long."),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Invalid email or password."),
});
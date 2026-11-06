
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

import {
  verifyGoogleIdentity,
  verifyFacebookIdentity,
} from "../services/oauth.service.js";

import { issueAuthTokens } from "../services/token.service.js";

import {
  googleAuthSchema,
  facebookAuthSchema,
  completeOAuthSchema,
} from "../utils/oauth.validation.js";

// ------------------------------------------
// ERROR HANDLING
// ------------------------------------------

function sendError(res, error) {
  console.error("OAuth error:", error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Authentication failed.",
  });
}

// ------------------------------------------
// ONBOARDING TOKEN
// ------------------------------------------

function createOnboardingToken(identity) {
  return jwt.sign(
    {
      purpose: "oauth-onboarding",
      provider: identity.provider,
      providerId: identity.providerId,
      email: identity.email || null,
      emailVerified: Boolean(identity.emailVerified),
      fullName: identity.fullName,
    },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );
}

// ------------------------------------------
// SHARED SOCIAL LOGIN
// ------------------------------------------

async function handleSocialLogin(identity, res) {
  const providerColumn =
    identity.provider === "google" ? "google_id" : "facebook_id";

  // Check whether this provider account already exists.
  const existingResult = await query(
    `SELECT
  id,
  full_name,
  username,
  email,
  email_verified,
  auth_provider,
  is_active
     FROM users
     WHERE ${providerColumn} = $1
     LIMIT 1`,
    [identity.providerId]
  );

  if (existingResult.rows.length > 0) {
    const user = existingResult.rows[0];

    // Google accounts must have a verified email.
    // Facebook accounts can authenticate without email.
    if (
      identity.provider === "google" &&
      (!user.email || !user.email_verified)
    ) {
      return res.status(403).json({
        success: false,
        message: "Google email verification is required.",
      });
    }

    if (!user.is_active && user.is_active !== undefined) {
      return res.status(403).json({
        success: false,
        message: "This account is currently unavailable.",
      });
    }

    const tokens = await issueAuthTokens(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      isNewUser: false,
      user,
      ...tokens,
    });
  }

  // Check for an existing email only when the provider supplies one.
  if (identity.email) {
    const emailResult = await query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [identity.email]
    );

    if (emailResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An account already exists with this email. Sign in using your existing method.",
      });
    }
  }

  // New social account: proceed to username selection.
  return res.status(200).json({
    success: true,
    isNewUser: true,
    requiresUsername: true,
    onboardingToken: createOnboardingToken(identity),
    profile: {
      fullName: identity.fullName,
      email: identity.email || null,
      provider: identity.provider,
    },
  });
}

// ------------------------------------------
// GOOGLE LOGIN
// ------------------------------------------

export async function googleLogin(req, res) {
  try {
    const validation = googleAuthSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      });
    }

    const identity = await verifyGoogleIdentity(
      validation.data.idToken
    );

    return await handleSocialLogin(identity, res);
  } catch (error) {
    return sendError(res, error);
  }
}

// ------------------------------------------
// FACEBOOK LOGIN
// ------------------------------------------

export async function facebookLogin(req, res) {
  try {
    const validation = facebookAuthSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      });
    }

    const identity = await verifyFacebookIdentity(
      validation.data.accessToken
    );

    return await handleSocialLogin(identity, res);
  } catch (error) {
    return sendError(res, error);
  }
}

// ------------------------------------------
// COMPLETE SOCIAL SIGNUP
// ------------------------------------------

export async function completeOAuthSignup(req, res) {
  try {
    const validation = completeOAuthSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      });
    }

    let onboarding;

    try {
      onboarding = jwt.verify(
        validation.data.onboardingToken,
        process.env.JWT_SECRET
      );
    } catch {
      return res.status(401).json({
        success: false,
        message: "Your signup session has expired. Please try again.",
      });
    }

    // Validate the onboarding token.
    if (
      onboarding.purpose !== "oauth-onboarding" ||
      !["google", "facebook"].includes(onboarding.provider) ||
      !onboarding.providerId
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid signup session.",
      });
    }

    // Google requires a verified email.
    // Facebook can create an account without an email.
    if (
      onboarding.provider === "google" &&
      (!onboarding.email || !onboarding.emailVerified)
    ) {
      return res.status(400).json({
        success: false,
        message: "A verified Google email address is required.",
      });
    }

    const username = validation.data.username.trim().toLowerCase();

    const providerColumn =
      onboarding.provider === "google" ? "google_id" : "facebook_id";

    // Prevent duplicate usernames, emails and provider identities.
    const duplicateResult = await query(
      `SELECT id
       FROM users
       WHERE username = $1
          OR ($2::text IS NOT NULL AND email = $2)
          OR ${providerColumn} = $3
       LIMIT 1`,
      [
        username,
        onboarding.email || null,
        onboarding.providerId,
      ]
    );

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "That email or username is already registered.",
      });
    }

    // Create the new social account.
    const insertResult = await query(
      `INSERT INTO users (
        full_name,
        username,
        email,
        password_hash,
        auth_provider,
        ${providerColumn},
        email_verified,
        is_active
      )
      VALUES ($1, $2, $3, NULL, $4, $5, $6, TRUE)
      RETURNING
        id,
        full_name,
        username,
        email,
        email_verified,
        auth_provider`,
      [
        onboarding.fullName,
        username,
        onboarding.email || null,
        onboarding.provider,
        onboarding.providerId,
        Boolean(onboarding.emailVerified),
      ]
    );

    const user = insertResult.rows[0];

    // Issue VerseHana authentication tokens.
    const tokens = await issueAuthTokens(user);

    return res.status(201).json({
      success: true,
      message: "Your account has been created.",
      isNewUser: true,
      user,
      ...tokens,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

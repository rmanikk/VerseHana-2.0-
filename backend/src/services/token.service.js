
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    const error = new Error(
      "JWT_SECRET must be configured with at least 32 characters."
    );
    error.statusCode = 500;
    throw error;
  }

  return secret;
}

export async function issueAuthTokens(user, db = { query }) {
  if (!user?.id) {
    throw new Error("A valid user is required to issue tokens.");
  }

  const secret = getJwtSecret();

  const accessExpiresIn =
    process.env.JWT_ACCESS_EXPIRES_IN || "15m";

  const refreshDays = Number(
    process.env.REFRESH_TOKEN_DAYS || 30
  );

  if (!Number.isInteger(refreshDays) || refreshDays < 1) {
    throw new Error(
      "REFRESH_TOKEN_DAYS must be a positive integer."
    );
  }

  const refreshToken = crypto
    .randomBytes(48)
    .toString("base64url");

  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + refreshDays * 24 * 60 * 60 * 1000
  );

  await db.query(
    `INSERT INTO refresh_sessions
      (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, tokenHash, expiresAt]
  );

  const accessToken = jwt.sign(
    {
      sub: user.id,
      type: "access",
    },
    secret,
    {
      expiresIn: accessExpiresIn,
    }
  );

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: accessExpiresIn,
  };
}

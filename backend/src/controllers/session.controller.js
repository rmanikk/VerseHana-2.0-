
import crypto from "node:crypto";
import pool, { query } from "../config/database.js";
import { issueAuthTokens } from "../services/token.service.js";

function hashRefreshToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

// ------------------------------------------
// REFRESH SESSION
// ------------------------------------------

export async function refreshSession(req, res, next) {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    const { refreshToken } = req.body || {};

    if (
      typeof refreshToken !== "string" ||
      !refreshToken.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    await client.query("BEGIN");
    transactionStarted = true;

    const tokenHash = hashRefreshToken(refreshToken);

    const sessionResult = await client.query(
      `UPDATE refresh_sessions
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE token_hash = $1
         AND revoked_at IS NULL
         AND expires_at > CURRENT_TIMESTAMP
       RETURNING user_id`,
      [tokenHash]
    );

    if (sessionResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please sign in again.",
      });
    }

    const userResult = await client.query(
      `SELECT
         id,
         full_name,
         username,
         email,
         email_verified,
         auth_provider,
         is_active
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [sessionResult.rows[0].user_id]
    );

    const user = userResult.rows[0];

    if (!user || !user.is_active) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(401).json({
        success: false,
        message: "This account is unavailable. Please sign in again.",
      });
    }

    const tokens = await issueAuthTokens(user, client);

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(200).json({
      success: true,
      message: "Session refreshed successfully.",
      user,
      ...tokens,
    });
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Refresh transaction rollback failed:", rollbackError);
      }
    }

    next(error);
  } finally {
    client.release();
  }
}

// ------------------------------------------
// LOGOUT
// ------------------------------------------

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body || {};

    if (
      typeof refreshToken !== "string" ||
      !refreshToken.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const tokenHash = hashRefreshToken(refreshToken);

    await query(
      `UPDATE refresh_sessions
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE token_hash = $1
         AND revoked_at IS NULL`,
      [tokenHash]
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
}

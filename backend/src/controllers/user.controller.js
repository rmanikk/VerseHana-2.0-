
import { query } from "../config/database.js";

export async function getCurrentUser(req, res, next) {
  try {
    const result = await query(
      `SELECT
         id,
         full_name,
         username,
         email,
         email_verified,
         auth_provider,
         created_at
       FROM users
       WHERE id = $1
         AND is_active = TRUE
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Your account is unavailable. Please sign in again.",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}


import { query } from "../config/database.js";

export async function requireAdmin(req, res, next) {
  try {
    const result = await query(
      `
        SELECT role
        FROM users
        WHERE id = $1
          AND is_active = TRUE
        LIMIT 1
      `,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        success: false,
        message: "Your account is unavailable.",
      });
    }

    if (result.rows[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Administrator access required.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}

import bcrypt from "bcryptjs";
import { query } from "../config/database.js";

export const registerUser = async ({ fullName, username, email, password }) => {
  // Normalize user input
  const normalizedName = fullName.trim();
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  // Check whether email or username already exists
  const existingUser = await query(
    `SELECT id, email, username
     FROM users
     WHERE email = $1 OR username = $2
     LIMIT 1`,
    [normalizedEmail, normalizedUsername],
  );

  if (existingUser.rows.length > 0) {
    const user = existingUser.rows[0];

    if (user.email === normalizedEmail) {
      const error = new Error("An account with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    if (user.username === normalizedUsername) {
      const error = new Error("This username is already taken.");
      error.statusCode = 409;
      throw error;
    }
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create an unverified account
  const result = await query(
    `INSERT INTO users (
      full_name,
      username,
      email,
      password_hash,
      auth_provider,
      email_verified
    )
    VALUES ($1, $2, $3, $4, 'local', FALSE)
    RETURNING id, full_name, username, email, email_verified, created_at`,
    [normalizedName, normalizedUsername, normalizedEmail, passwordHash],
  );

  return result.rows[0];
};

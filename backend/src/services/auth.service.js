
import bcrypt from "bcryptjs";
import { query } from "../config/database.js";

export const registerUser = async ({
  fullName,
  username,
  email,
  password,
}) => {
  const normalizedName = fullName.trim();
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

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
      const error = new Error(
        "An account with this email already exists.",
      );
      error.statusCode = 409;
      throw error;
    }

    if (user.username === normalizedUsername) {
      const error = new Error("Username already exists.");
      error.statusCode = 409;
      throw error;
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

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
    [
      normalizedName,
      normalizedUsername,
      normalizedEmail,
      passwordHash,
    ],
  );

  return result.rows[0];
};

// Email/password login
export const authenticateUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await query(
    `SELECT
       id,
       full_name,
       username,
       email,
       password_hash,
       auth_provider,
       email_verified,
       is_active
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [normalizedEmail],
  );

  const user = result.rows[0];

  // Use a generic error to avoid revealing whether an email exists.
  const invalidCredentials = new Error(
    "Invalid email or password.",
  );
  invalidCredentials.statusCode = 401;

  if (
    !user ||
    user.auth_provider !== "local" ||
    !user.password_hash
  ) {
    throw invalidCredentials;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash,
  );

  if (!passwordMatches) {
    throw invalidCredentials;
  }

  if (!user.is_active) {
    const error = new Error("This account is currently disabled.");
    error.statusCode = 403;
    throw error;
  }

  if (!user.email_verified) {
    const error = new Error(
      "Please verify your email address before logging in.",
    );
    error.statusCode = 403;
    error.code = "EMAIL_NOT_VERIFIED";
    throw error;
  }

  const {
    password_hash,
    ...safeUser
  } = user;

  return safeUser;
};

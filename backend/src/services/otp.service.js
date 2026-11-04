import pool, { query } from "../config/database.js";
import { generateOtp, hashOtp, compareOtp } from "../utils/otp.js";
import { sendVerificationEmail } from "./email.service.js";

export const createAndSendOtp = async (user) => {
  const otp = generateOtp();
  const otpHash = hashOtp(otp);

  // Invalidate previous outstanding codes
  await query(
    `UPDATE email_verifications
     SET expires_at = NOW()
     WHERE user_id = $1
       AND verified_at IS NULL
       AND expires_at > NOW()`,
    [user.id]
  );

  // Save the new code with a 10-minute expiry
  await query(
    `INSERT INTO email_verifications (
       user_id,
       otp_hash,
       expires_at
     )
     VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
    [user.id, otpHash]
  );

  // Deliver the code
  await sendVerificationEmail(user.email, otp);
};

export const verifyUserOtp = async (email, otp) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `SELECT id, email, email_verified
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      const error = new Error("Invalid email or verification code.");
      error.statusCode = 400;
      throw error;
    }

    const user = userResult.rows[0];

    if (user.email_verified) {
      const error = new Error("This email is already verified.");
      error.statusCode = 409;
      throw error;
    }

    const otpResult = await client.query(
      `SELECT id, otp_hash, expires_at, attempts
       FROM email_verifications
       WHERE user_id = $1
         AND verified_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [user.id]
    );

    if (otpResult.rows.length === 0) {
      const error = new Error("No verification code found. Request a new code.");
      error.statusCode = 400;
      throw error;
    }

    const record = otpResult.rows[0];

    if (new Date(record.expires_at) <= new Date()) {
      const error = new Error("Verification code has expired.");
      error.statusCode = 400;
      throw error;
    }

    if (record.attempts >= 5) {
      const error = new Error("Too many incorrect attempts. Request a new code.");
      error.statusCode = 429;
      throw error;
    }

    if (!compareOtp(otp, record.otp_hash)) {
      await client.query(
        `UPDATE email_verifications
         SET attempts = attempts + 1
         WHERE id = $1`,
        [record.id]
      );

      await client.query("COMMIT");

      const error = new Error("Invalid verification code.");
      error.statusCode = 400;
      throw error;
    }

    await client.query(
      `UPDATE email_verifications
       SET verified_at = NOW()
       WHERE id = $1`,
      [record.id]
    );

    await client.query(
      `UPDATE users
       SET email_verified = TRUE,
           updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    await client.query("COMMIT");

    return {
      id: user.id,
      email: user.email,
      email_verified: true,
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
};
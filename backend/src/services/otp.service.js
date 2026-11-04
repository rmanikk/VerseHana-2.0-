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

export const resendUserOtp = async (email) => {
  const client = await pool.connect();
  let transactionOpen = false;
  let verificationId = null;

  try {
    await client.query("BEGIN");
    transactionOpen = true;

    // Lock the user row so simultaneous resend requests cannot
    // create multiple OTPs at the same time.
    const userResult = await client.query(
      `SELECT id, email, email_verified
       FROM users
       WHERE email = $1
       FOR UPDATE`,
      [email]
    );

    // Use the same outward response for unknown and verified accounts.
    if (
      userResult.rows.length === 0 ||
      userResult.rows[0].email_verified
    ) {
      await client.query("COMMIT");
      transactionOpen = false;
      return { sent: false };
    }

    const user = userResult.rows[0];

    // Check when the most recent OTP was requested.
    const latestOtpResult = await client.query(
      `SELECT created_at
       FROM email_verifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    if (latestOtpResult.rows.length > 0) {
      const lastRequestedAt = new Date(
        latestOtpResult.rows[0].created_at
      ).getTime();

      const elapsedSeconds = Math.floor(
        (Date.now() - lastRequestedAt) / 1000
      );

      const remainingSeconds = 60 - elapsedSeconds;

      if (remainingSeconds > 0) {
        await client.query("COMMIT");
        transactionOpen = false;

        return {
          sent: false,
          cooldown: true,
          retryAfterSeconds: remainingSeconds,
        };
      }
    }

    // Invalidate all previous unused codes.
    await client.query(
      `UPDATE email_verifications
       SET expires_at = NOW()
       WHERE user_id = $1
         AND verified_at IS NULL
         AND expires_at > NOW()`,
      [user.id]
    );

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    const newOtpResult = await client.query(
      `INSERT INTO email_verifications (
        user_id,
        otp_hash,
        expires_at
      )
      VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
      RETURNING id`,
      [user.id, otpHash]
    );

    verificationId = newOtpResult.rows[0].id;

    await client.query("COMMIT");
    transactionOpen = false;

    // Send only after the database transaction has committed.
    try {
      await sendVerificationEmail(user.email, otp);
    } catch (emailError) {
      // Invalidate the code if delivery fails.
      await query(
        `UPDATE email_verifications
         SET expires_at = NOW()
         WHERE id = $1`,
        [verificationId]
      );

      const error = new Error(
        "We couldn't send your verification email. Please try again later."
      );
      error.statusCode = 502;
      throw error;
    }

    return { sent: true };
  } catch (error) {
    if (transactionOpen) {
      await client.query("ROLLBACK").catch(() => {});
    }

    throw error;
  } finally {
    client.release();
  }
};
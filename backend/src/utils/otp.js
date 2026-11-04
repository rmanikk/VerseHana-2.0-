import crypto from "node:crypto";

export const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const hashOtp = (otp) => {
  const secret = process.env.OTP_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("OTP_SECRET must be configured securely.");
  }

  return crypto
    .createHmac("sha256", secret)
    .update(otp)
    .digest("hex");
};

export const compareOtp = (otp, storedHash) => {
  const submittedHash = Buffer.from(hashOtp(otp), "hex");
  const savedHash = Buffer.from(storedHash, "hex");

  return (
    submittedHash.length === savedHash.length &&
    crypto.timingSafeEqual(submittedHash, savedHash)
  );
};
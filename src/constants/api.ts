const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not configured.");
}

export const API = {
  baseUrl: API_BASE_URL,

  auth: {
    signup: `${API_BASE_URL}/api/auth/signup`,
    verifyEmail: `${API_BASE_URL}/api/auth/verify-email`,
    resendOtp: `${API_BASE_URL}/api/auth/resend-otp`,
  },
};
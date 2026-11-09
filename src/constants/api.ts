
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not configured.");
}

export const API = {
  baseUrl: API_BASE_URL,

  auth: {
    signup: `${API_BASE_URL}/api/auth/signup`,
    login: `${API_BASE_URL}/api/auth/login`,
    verifyEmail: `${API_BASE_URL}/api/auth/verify-email`,
    resendOtp: `${API_BASE_URL}/api/auth/resend-otp`,

    refresh: `${API_BASE_URL}/api/auth/refresh`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    me: `${API_BASE_URL}/api/auth/me`,
  },

  oauth: {
    google: `${API_BASE_URL}/api/oauth/google`,
    facebook: `${API_BASE_URL}/api/oauth/facebook`,
    completeSignup: `${API_BASE_URL}/api/oauth/complete-signup`,
  },
  onboarding: {
  get: `${API_BASE_URL}/api/auth/onboarding`,
  save: `${API_BASE_URL}/api/auth/onboarding`,
},
};

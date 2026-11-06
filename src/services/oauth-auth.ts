import { API } from "@/constants/api";
import { authStorage } from "@/services/auth-storage";

type OAuthProvider = "google" | "facebook";

type OAuthProfile = {
  fullName: string;
  email: string | null;
  provider: OAuthProvider;
};

type OAuthResponse = {
  success: boolean;
  message?: string;
  isNewUser: boolean;
  requiresUsername?: boolean;
  onboardingToken?: string;
  profile?: OAuthProfile;
  user?: Record<string, unknown>;
  accessToken?: string;
  refreshToken?: string;
};

export async function authenticateWithOAuth(
  provider: OAuthProvider,
  token: string,
): Promise<
  | {
      type: "new-user";
      onboardingToken: string;
      profile: OAuthProfile;
    }
  | {
      type: "existing-user";
      user: Record<string, unknown>;
    }
> {
  if (!token) {
    throw new Error("The authentication provider returned no token.");
  }

  const endpoint =
    provider === "google" ? API.oauth.google : API.oauth.facebook;

  const body =
    provider === "google"
      ? { idToken: token }
      : { accessToken: token };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data: OAuthResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Social sign-in failed.");
  }

  if (data.isNewUser) {
    if (!data.onboardingToken || !data.profile) {
      throw new Error("Incomplete account setup information received.");
    }

    return {
      type: "new-user",
      onboardingToken: data.onboardingToken,
      profile: data.profile,
    };
  }

  if (!data.accessToken || !data.refreshToken) {
    throw new Error("Authentication tokens were not returned.");
  }

  await authStorage.saveTokens(
    data.accessToken,
    data.refreshToken,
  );

  return {
    type: "existing-user",
    user: data.user ?? {},
  };
}
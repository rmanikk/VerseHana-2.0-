import { API } from "@/constants/api";
import { authStorage } from "@/services/auth-storage";

export type OnboardingPreferences = {
  moodPreferences: string[];
  pulseInterests: string[];
  musicPreferences: string[];
};

export type OnboardingData = OnboardingPreferences & {
  completed: boolean;
};

async function onboardingRequest(
  method: "GET" | "PUT",
  body?: OnboardingPreferences
) {
  const accessToken = await authStorage.getAccessToken();

  if (!accessToken) {
    throw new Error("Please log in to continue.");
  }

  const response = await fetch(API.onboarding[method === "GET" ? "get" : "save"], {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export async function getOnboarding(): Promise<OnboardingData> {
  const data = await onboardingRequest("GET");

  return data.onboarding;
}

export async function saveOnboarding(
  preferences: OnboardingPreferences
) {
  return onboardingRequest("PUT", preferences);
}
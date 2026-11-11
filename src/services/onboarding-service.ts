
import { API } from "@/constants/api";
import { authStorage } from "@/services/auth-storage";

export type Mood =
  | "happy"
  | "calm"
  | "rain"
  | "night"
  | "love"
  | "focus"
  | "party"
  | "sad";

export type Artist = {
  id: string;
  name: string;
  imageUrl: string | null;
  youtubeUrl: string | null;
};

export type OnboardingPreferences = {
  selectedMood: Mood;
  favoriteArtistIds: string[];
};

export type OnboardingData = OnboardingPreferences & {
  completed: boolean;
};

async function authenticatedRequest(
  url: string,
  method: "GET" | "PUT",
  body?: unknown
) {
  const accessToken = await authStorage.getAccessToken();

  if (!accessToken) {
    throw new Error("Please log in to continue.");
  }

  const response = await fetch(url, {
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

export async function getArtistSpotlight(
  mood: Mood
): Promise<Artist[]> {
  const url = `${API.artists.spotlight}?mood=${encodeURIComponent(mood)}`;

  const data = await authenticatedRequest(url, "GET");

  return data.artists as Artist[];
}

export async function getOnboarding(): Promise<OnboardingData> {
  const data = await authenticatedRequest(API.onboarding.get, "GET");

  return data.onboarding;
}

export async function saveOnboarding(
  preferences: OnboardingPreferences
) {
  return authenticatedRequest(
    API.onboarding.save,
    "PUT",
    preferences
  );
}

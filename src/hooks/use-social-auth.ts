import { useState } from "react";
import { router } from "expo-router";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { authenticateWithOAuth } from "@/services/oauth-auth";

type OAuthProvider = "google" | "facebook";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export function useSocialAuth() {
  const [loadingProvider, setLoadingProvider] =
    useState<OAuthProvider | null>(null);

  const [error, setError] = useState("");

  const signInWithProvider = async (
    provider: OAuthProvider,
    providerToken?: string,
    profile?: {
      fullName?: string;
      email?: string | null;
    },
  ) => {
    if (loadingProvider) return;

    setError("");
    setLoadingProvider(provider);

    try {
      let token = providerToken;
      let userProfile = profile;

      if (provider === "google") {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });

        const result = await GoogleSignin.signIn();

        if (result.type === "cancelled") {
          return;
        }

        token = result.data.idToken ?? undefined;
        userProfile = {
          fullName: result.data.user.name ?? "",
          email: result.data.user.email ?? null,
        };

        if (!token) {
          throw new Error("Google did not return an ID token.");
        }
      }

      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      const result = await authenticateWithOAuth(provider, token);

      if (result.type === "existing-user") {
        router.replace("/(tabs)");
        return;
      }

      router.replace({
        pathname: "/choose-username",
        params: {
          onboardingToken: result.onboardingToken,
          fullName:
            userProfile?.fullName ||
            result.profile.fullName ||
            "",
          provider,
        },
      });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === statusCodes.SIGN_IN_CANCELLED
      ) {
        return;
      }

      console.error(`${provider} authentication error:`, err);

      setError(
        err instanceof Error
          ? err.message
          : "Social authentication failed. Please try again.",
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  return {
    signInWithProvider,
    loadingProvider,
    error,
    setError,
  };
}
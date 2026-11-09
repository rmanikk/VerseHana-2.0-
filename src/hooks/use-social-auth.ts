
import { useState } from "react";
import { Platform } from "react-native";
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
  ) => {
    if (loadingProvider) return;

    setError("");
    setLoadingProvider(provider);

    try {
      let token: string | undefined;
      let fullName = "";

      if (provider === "google") {
        if (Platform.OS === "web") {
  throw new Error(
    "Google native login is currently available in the Android and iOS apps only.",
  );
}
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });

        const googleResult = await GoogleSignin.signIn();

        if (googleResult.type === "cancelled") {
          return;
        }

        token = googleResult.data.idToken ?? undefined;
        fullName = googleResult.data.user.name ?? "";

        if (!token) {
          throw new Error("Google did not return an ID token.");
        }
      }

      if (provider === "facebook") {
        if (Platform.OS === "web") {
          throw new Error(
            "Facebook login is currently available in the Android and iOS apps only.",
          );
        }

        const { AccessToken, LoginManager } =
          await import("react-native-fbsdk-next");

        const loginResult =
          await LoginManager.logInWithPermissions([
            "public_profile",
            "email",
          ]);

        if (loginResult.isCancelled) {
          return;
        }

        const facebookToken =
          await AccessToken.getCurrentAccessToken();

        if (!facebookToken?.accessToken) {
          throw new Error(
            "Facebook did not return an access token.",
          );
        }

        token = facebookToken.accessToken;
      }

      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      const result = await authenticateWithOAuth(
        provider,
        token,
      );

      if (result.type === "existing-user") {
        router.replace("/(tabs)");
        return;
      }

      router.replace({
        pathname: "/choose-username",
        params: {
          onboardingToken: result.onboardingToken,
          fullName:
            fullName || result.profile.fullName || "",
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

      console.error(
        `${provider} authentication error:`,
        err,
      );

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

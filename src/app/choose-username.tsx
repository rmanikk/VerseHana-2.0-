
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { VerseHanaLoader } from "@/components/ui/versehana-loader";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Colors } from "@/constants/theme";
import { API } from "@/constants/api";
import { authStorage } from "@/services/auth-storage";

const colors = Colors.dark;

export default function ChooseUsernameScreen() {
  const { onboardingToken, fullName, provider } =
    useLocalSearchParams<{
      onboardingToken: string;
      fullName?: string;
      provider?: string;
    }>();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedUsername = username.trim().toLowerCase();

  const validateUsername = () => {
    if (normalizedUsername.length < 3) {
      return "Username must contain at least 3 characters.";
    }

    if (normalizedUsername.length > 20) {
      return "Username cannot exceed 20 characters.";
    }

    if (!/^[a-z][a-z0-9_]*$/.test(normalizedUsername)) {
      return "Start with a letter. Use only letters, numbers and underscores.";
    }

    if (normalizedUsername.includes("__")) {
      return "Avoid consecutive underscores.";
    }

    return "";
  };

  const handleContinue = async () => {
    if (loading) return;

    setError("");

    if (!onboardingToken) {
      setError("Your signup session has expired. Please sign in again.");
      return;
    }

    const validationError = validateUsername();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API.oauth.completeSignup, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          onboardingToken,
          username: normalizedUsername,
        }),
      });

      const data = await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.accessToken ||
        !data.refreshToken
      ) {
        setError(
          data.message || "Unable to complete your account setup.",
        );
        return;
      }

      await authStorage.saveTokens(
        data.accessToken,
        data.refreshToken,
      );

      router.replace("/onboarding");
    } catch (err) {
      console.error("OAuth signup error:", err);

      setError(
        "Unable to connect to VerseHana. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View pointerEvents="none" style={styles.topGlow} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={["#49D9D4", "#087F80"]}
              style={styles.iconGradient}
            >
              <Ionicons
                name="person-add-outline"
                size={34}
                color="#06181B"
              />
            </LinearGradient>
          </View>

          <View style={styles.headingContainer}>
            <Text style={styles.heading}>
              One Last <Text style={styles.headingAccent}>Step</Text>
            </Text>

            <Text style={styles.subtitle}>
              {fullName
                ? `Welcome, ${fullName}. Choose a username for your VerseHana profile.`
                : "Choose a unique username for your VerseHana profile."}
            </Text>
          </View>

          <View style={styles.providerInfo}>
            <Ionicons
              name={
                provider === "facebook"
                  ? "logo-facebook"
                  : "logo-google"
              }
              size={20}
              color={provider === "facebook" ? "#1877F2" : "#DB4437"}
            />

            <Text style={styles.providerText}>
              Continuing with {provider || "social sign-in"}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.fieldLabel}>USERNAME</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.atSymbol}>@</Text>

              <TextInput
                style={styles.input}
                placeholder="your_username"
                placeholderTextColor="#829393"
                value={username}
                onChangeText={(value) => {
                  setUsername(value);
                  setError("");
                }}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={20}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>

            <Text style={styles.helperText}>
              3–20 characters. Letters, numbers and underscores.
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleContinue}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && !loading && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              <LinearGradient
                colors={["#49D9D4", "#17BDBA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading ? (
  <VerseHanaLoader size="xs" />
) : (
                  <>
                    <Text style={styles.submitText}>
                      Create My Account
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color="#06181B"
                    />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            Your username will be visible on your VerseHana profile.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#030707",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 35,
  },
  topGlow: {
    position: "absolute",
    top: -150,
    right: -130,
    width: 320,
    height: 320,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: "#087B80",
    opacity: 0.3,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconGradient: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  headingContainer: {
    alignItems: "center",
    marginBottom: 26,
  },
  heading: {
    color: "#F7FAFA",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },
  headingAccent: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },
  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 30,
  },
  providerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  form: {
    gap: 12,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  inputContainer: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.4,
    borderColor: "#293C3E",
    borderRadius: 18,
    paddingHorizontal: 17,
    backgroundColor: "rgba(9, 17, 18, 0.82)",
  },
  atSymbol: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "700",
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.text,
    fontSize: 15,
    paddingLeft: 10,
  },
  helperText: {
    color: "#829393",
    fontSize: 12,
    marginTop: 1,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    flex: 1,
  },
  submitButton: {
    marginTop: 17,
    borderRadius: 40,
    overflow: "hidden",
  },
  submitGradient: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  submitText: {
    color: "#031718",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footerText: {
    color: "#829393",
    fontSize: 12,
    textAlign: "center",
    marginTop: 28,
    lineHeight: 19,
  },
});

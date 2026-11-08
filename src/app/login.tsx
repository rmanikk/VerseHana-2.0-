
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { API } from "@/constants/api";
import { authStorage } from "@/services/auth-storage";
import { useSocialAuth } from "@/hooks/use-social-auth";

const colors = Colors.dark;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [focusedField, setFocusedField] = useState<
    "email" | "password" | null
  >(null);

  const {
    signInWithProvider,
    loadingProvider,
    error: socialError,
  } = useSocialAuth();

  const isBusy = loading || loadingProvider !== null;

  const handleLogin = async () => {
    if (isBusy) return;

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API.auth.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (
        !response.ok ||
        !data.success ||
        !data.accessToken ||
        !data.refreshToken
      ) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          router.push({
            pathname: "/verify-otp",
            params: { email: normalizedEmail },
          });
          return;
        }

        setError(
          data.message || "Unable to sign in. Please try again."
        );
        return;
      }

      await authStorage.saveTokens(
        data.accessToken,
        data.refreshToken
      );

      router.replace("/(tabs)");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        "Unable to connect to VerseHana. Please check your internet or server connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View pointerEvents="none" style={styles.topGlow} />
        <View pointerEvents="none" style={styles.bottomGlow} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandContainer}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.headingContainer}>
            <Text style={styles.heading}>
              Welcome <Text style={styles.headingAccent}>Back</Text>
            </Text>

            <Text style={styles.subtitle}>
              Sign in to continue your VerseHana journey.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldWrapper}>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "email" && styles.inputFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.primary}
                  style={styles.fieldIcon}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#829393"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  editable={!isBusy}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "password" && styles.inputFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.primary}
                  style={styles.fieldIcon}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#829393"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  editable={!isBusy}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />

                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={20}
                    color="#829393"
                  />
                </Pressable>
              </View>
            </View>

            {(error || socialError) ? (
              <View style={styles.generalError}>
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color={colors.error}
                />
                <Text style={styles.generalErrorText}>
                  {error || socialError}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={handleLogin}
              disabled={isBusy}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
              style={({ pressed }) => [
                styles.submitButton,
                pressed && !isBusy && styles.buttonPressed,
                isBusy && styles.buttonDisabled,
              ]}
            >
              <LinearGradient
                colors={["#49D9D4", "#17BDBA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#06181B" />
                ) : (
                  <Text style={styles.submitText}>Sign In</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>Or continue with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialContainer}>
            <Pressable
              style={[
                styles.socialButton,
                isBusy && styles.buttonDisabled,
              ]}
              disabled={isBusy}
              onPress={() => {
                setError("");
                signInWithProvider("google");
              }}
            >
              {loadingProvider === "google" ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name="logo-google"
                    size={22}
                    color="#DB4437"
                  />
                  <Text style={styles.socialText}>Google</Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={[
                styles.socialButton,
                isBusy && styles.buttonDisabled,
              ]}
              disabled={isBusy}
              onPress={() => {
                setError("");
                signInWithProvider("facebook");
              }}
            >
              {loadingProvider === "facebook" ? (
                <ActivityIndicator color="#1877F2" />
              ) : (
                <>
                  <Ionicons
                    name="logo-facebook"
                    size={22}
                    color="#1877F2"
                  />
                  <Text style={styles.socialText}>Facebook</Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>

            <Pressable
              onPress={() => router.push("/signup")}
              disabled={isBusy}
            >
              <Text style={styles.signupLink}>Create Account</Text>
            </Pressable>
          </View>
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
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 28,
  },
  topGlow: {
    position: "absolute",
    top: -160,
    left: -130,
    width: 300,
    height: 300,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: "#087B80",
    opacity: 0.35,
  },
  bottomGlow: {
    position: "absolute",
    bottom: -180,
    right: -140,
    width: 330,
    height: 330,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: "#087B80",
    opacity: 0.3,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 116,
    height: 116,
  },
  headingContainer: {
    alignItems: "center",
    marginBottom: 30,
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
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  form: {
    gap: 14,
  },
  fieldWrapper: {
    width: "100%",
  },
  inputContainer: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.4,
    borderColor: "#293C3E",
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "rgba(9, 17, 18, 0.82)",
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  fieldIcon: {
    width: 30,
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 8,
  },
  generalError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
  },
  generalErrorText: {
    color: colors.error,
    fontSize: 13,
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 40,
    overflow: "hidden",
  },
  submitGradient: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#031718",
    fontSize: 17,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
    paddingHorizontal: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#304344",
  },
  orText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.4,
    borderColor: "#34494B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(9, 17, 18, 0.7)",
  },
  socialText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 30,
  },
  signupText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  signupLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
});

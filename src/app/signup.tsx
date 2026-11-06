
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

const colors = Colors.dark;

// Keep this list synchronized with backend validation.
const BLOCKED_USERNAME_TERMS = [
  "admin",
  "moderator",
  "support",
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "slut",
  "whore",
];

function normalizeUsernameForModeration(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4@]/g, "a")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t")
    .replace(/[^a-z]/g, "")
    .replace(/(.)\1+/g, "$1");
}

function getUsernameError(value: string): string | undefined {
  const username = value.trim().toLowerCase();

  if (username.length < 3) {
    return "Username must have at least 3 characters.";
  }

  if (username.length > 20) {
    return "Username cannot exceed 20 characters.";
  }

  if (!/^[a-z][a-z0-9_]*$/.test(username)) {
    return "Start with a letter; use only letters, numbers and underscores.";
  }

  if (username.includes("__")) {
    return "Avoid consecutive underscores.";
  }

  const normalized = normalizeUsernameForModeration(username);

  const parts = username.split(/[_\d]+/).filter(Boolean);

  const isBlocked = BLOCKED_USERNAME_TERMS.some((term) =>
    normalized.includes(normalizeUsernameForModeration(term)) ||
    parts.some(
      (part) =>
        normalizeUsernameForModeration(part) ===
        normalizeUsernameForModeration(term),
    ),
  );

  if (isBlocked) {
    return "Please choose a different username.";
  }

  return undefined;
}

type FormErrors = {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

type FieldProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words" | "sentences";
  autoComplete?:
    | "name"
    | "username"
    | "email"
    | "password"
    | "new-password";
};

function FormField({
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  showToggle = false,
  showPassword = false,
  onTogglePassword,
  keyboardType = "default",
  autoCapitalize = "none",
  autoComplete,
}: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldWrapper}>
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        <Ionicons
          name={icon}
          size={21}
          color={colors.primary}
          style={styles.fieldIcon}
        />

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.primary}
          accessibilityLabel={placeholder}
        />

        {showToggle && (
          <Pressable
            onPress={onTogglePassword}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={23}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const updateField = (
    field: keyof FormErrors,
    value: string,
  ) => {
    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
      general: undefined,
    }));

    switch (field) {
      case "fullName":
        setFullName(value);
        break;

      case "username":
        setUsername(value);
        break;

      case "email":
        setEmail(value);
        break;

      case "password":
        setPassword(value);
        break;

      case "confirmPassword":
        setConfirmPassword(value);
        break;
    }
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    const normalizedName = fullName.trim();
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    // Full name validation
    if (normalizedName.length < 2) {
      nextErrors.fullName = "Please enter your full name.";
    } else if (normalizedName.length > 100) {
      nextErrors.fullName = "Full name is too long.";
    } else if (
      !/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u.test(
        normalizedName,
      )
    ) {
      nextErrors.fullName =
        "Use letters, spaces, apostrophes or hyphens only.";
    }

    // Username validation
    const usernameError = getUsernameError(normalizedUsername);

    if (usernameError) {
      nextErrors.username = usernameError;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    } else if (normalizedEmail.length > 255) {
      nextErrors.email = "Email address is too long.";
    }

    // Password validation
    if (password.length < 8) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    } else if (password.length > 128) {
      nextErrors.password =
        "Password cannot exceed 128 characters.";
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      nextErrors.password =
        "Include at least one letter and one number.";
    }

    // Confirm password validation
    if (confirmPassword.length === 0) {
      nextErrors.confirmPassword =
        "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSignup = async () => {
    if (loading) return;

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(API.auth.signup, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      // Account may have been created even if OTP delivery failed.
      if (response.ok || data.accountCreated === true) {
        router.push({
          pathname: "/verify-otp",
          params: {
            email: email.trim().toLowerCase(),
          },
        });

        return;
      }

      // Backend validation errors
      if (Array.isArray(data.errors)) {
        const serverErrors: FormErrors = {};

        data.errors.forEach(
          (item: { field: string; message: string }) => {
            if (
              [
                "fullName",
                "username",
                "email",
                "password",
              ].includes(item.field)
            ) {
              serverErrors[item.field as keyof FormErrors] =
                item.message;
            }
          },
        );

        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors);
        } else {
          setErrors({
            general:
              data.message || "Unable to create your account.",
          });
        }
      } else {
        setErrors({
          general:
            data.message || "Unable to create your account.",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);

      setErrors({
        general:
          "Unable to connect to VerseHana. Please check your internet or server connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
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
          {/* Transparent brand logo */}
          <View style={styles.brandContainer}>
            <Image
              source={require("../../assets/images/versehana-logo-transparent.png")}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="VerseHana"
            />
          </View>

          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>
              Create{" "}
              <Text style={styles.headingAccent}>Account</Text>
            </Text>

            <Text style={styles.subtitle}>
              Join VerseHana and start your musical journey
            </Text>
          </View>

          {/* Signup form */}
          <View style={styles.form}>
            <FormField
              icon="person-outline"
              placeholder="Full Name"
              value={fullName}
              onChangeText={(value) =>
                updateField("fullName", value)
              }
              error={errors.fullName}
              autoCapitalize="words"
              autoComplete="name"
            />

            <FormField
              icon="person-outline"
              placeholder="Username"
              value={username}
              onChangeText={(value) =>
                updateField("username", value)
              }
              error={errors.username}
              autoComplete="username"
            />

            <FormField
              icon="mail-outline"
              placeholder="Email Address"
              value={email}
              onChangeText={(value) =>
                updateField("email", value)
              }
              error={errors.email}
              keyboardType="email-address"
              autoComplete="email"
            />

            <FormField
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={(value) =>
                updateField("password", value)
              }
              error={errors.password}
              secureTextEntry={!showPassword}
              showToggle
              showPassword={showPassword}
              onTogglePassword={() =>
                setShowPassword(!showPassword)
              }
              autoComplete="new-password"
            />

            <FormField
              icon="lock-closed-outline"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(value) =>
                updateField("confirmPassword", value)
              }
              error={errors.confirmPassword}
              secureTextEntry={!showConfirmPassword}
              showToggle
              showPassword={showConfirmPassword}
              onTogglePassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              autoComplete="new-password"
            />

            {errors.general ? (
              <View style={styles.generalError}>
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color={colors.error}
                />
                <Text style={styles.generalErrorText}>
                  {errors.general}
                </Text>
              </View>
            ) : null}

            {/* Create account button */}
            <Pressable
              onPress={handleSignup}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Create Account"
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
                  <ActivityIndicator color="#06181B" />
                ) : (
                  <Text style={styles.submitText}>
                    Create Account
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Social divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.orText}>
              Or continue with
            </Text>

            <View style={styles.divider} />
          </View>

          {/* Social signup buttons */}
          <View style={styles.socialContainer}>
            <Pressable
              style={styles.socialButton}
              onPress={() =>
                setErrors({
                  general:
                    "Google sign-in will be available soon.",
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
            >
              <Ionicons
                name="logo-google"
                size={22}
                color="#DB4437"
              />
              <Text style={styles.socialText}>Google</Text>
            </Pressable>

            <Pressable
              style={styles.socialButton}
              onPress={() =>
                setErrors({
                  general:
                    "Facebook sign-in will be available soon.",
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Continue with Facebook"
            >
              <Ionicons
                name="logo-facebook"
                size={22}
                color="#1877F2"
              />
              <Text style={styles.socialText}>Facebook</Text>
            </Pressable>
          </View>

          {/* Login navigation */}
          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>
              Already have an account?
            </Text>

            <Pressable onPress={() => router.push("/login")}>
              <Text style={styles.signinLink}>Sign In</Text>
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
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 24,
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
    marginTop: 4,
    marginBottom: 18,
  },

  logo: {
    width: 116,
    height: 116,
  },

  headingContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  heading: {
    color: "#F7FAFA",
    fontSize: 29,
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
    marginTop: 7,
  },

  form: {
    gap: 10,
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

  inputError: {
    borderColor: colors.error,
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

  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 20,
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
    marginTop: 6,
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
    marginVertical: 18,
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

  signinContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 26,
  },

  signinText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  signinLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});

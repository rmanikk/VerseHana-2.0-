
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
  autoComplete?: "name" | "username" | "email" | "password" | "new-password";
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
          size={25}
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

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (normalizedName.length < 2) {
      nextErrors.fullName = "Please enter your full name.";
    } else if (normalizedName.length > 100) {
      nextErrors.fullName = "Full name is too long.";
    }

    if (normalizedUsername.length < 3) {
      nextErrors.username = "Username must have at least 3 characters.";
    } else if (normalizedUsername.length > 20) {
      nextErrors.username = "Username cannot exceed 20 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      nextErrors.username =
        "Use only letters, numbers and underscores.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Please enter a valid email address.";
    } else if (normalizedEmail.length > 255) {
      nextErrors.email = "Email address is too long.";
    }

    if (password.length < 8) {
      nextErrors.password = "Password must contain at least 8 characters.";
    } else if (password.length > 128) {
      nextErrors.password = "Password cannot exceed 128 characters.";
    }

    if (confirmPassword.length === 0) {
      nextErrors.confirmPassword = "Please confirm your password.";
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

      // The backend can create the account even if email delivery fails.
      if (response.ok || data.accountCreated === true) {
        router.push({
          pathname: "/verify-otp",
          params: {
            email: email.trim().toLowerCase(),
          },
        });

        return;
      }

      // Display backend validation errors beside their fields.
      if (Array.isArray(data.errors)) {
        const serverErrors: FormErrors = {};

        data.errors.forEach(
          (item: { field: string; message: string }) => {
            if (
              ["fullName", "username", "email", "password"].includes(
                item.field,
              )
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
            general: data.message || "Unable to create your account.",
          });
        }
      } else {
        setErrors({
          general: data.message || "Unable to create your account.",
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
          {/* Brand */}
          <View style={styles.brandContainer}>
            <Image
              source={require("../../assets/images/splash-icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.brandText}>
              VERSE<Text style={styles.brandAccent}>HANA</Text>
            </Text>
          </View>

          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>
              Create <Text style={styles.headingAccent}>Account</Text>
            </Text>

            <Text style={styles.subtitle}>
              Join VerseHana and start your musical journey
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <FormField
              icon="person-outline"
              placeholder="Full Name"
              value={fullName}
              onChangeText={(value) => updateField("fullName", value)}
              error={errors.fullName}
              autoCapitalize="words"
              autoComplete="name"
            />

            <FormField
              icon="person-outline"
              placeholder="Username"
              value={username}
              onChangeText={(value) => updateField("username", value)}
              error={errors.username}
              autoComplete="username"
            />

            <FormField
              icon="mail-outline"
              placeholder="Email Address"
              value={email}
              onChangeText={(value) => updateField("email", value)}
              error={errors.email}
              keyboardType="email-address"
              autoComplete="email"
            />

            <FormField
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={(value) => updateField("password", value)}
              error={errors.password}
              secureTextEntry={!showPassword}
              showToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
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

            {/* Create Account */}
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

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Login - OAuth integration comes later */}
          <View style={styles.socialContainer}>
            <Pressable
              style={styles.socialButton}
              onPress={() =>
                setErrors({
                  general: "Google sign-in will be available soon.",
                })
              }
            >
              <Ionicons name="logo-google" size={25} color="#DB4437" />
              <Text style={styles.socialText}>
                Continue with Google
              </Text>
            </Pressable>

            <Pressable
              style={styles.socialButton}
              onPress={() =>
                setErrors({
                  general: "Facebook sign-in will be available soon.",
                })
              }
            >
              <Ionicons name="logo-facebook" size={25} color="#1877F2" />
              <Text style={styles.socialText}>
                Continue with Facebook
              </Text>
            </Pressable>
          </View>

          {/* Sign In */}
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
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 30,
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
    marginTop: 15,
    marginBottom: 48,
  },

  logo: {
    width: 170,
    height: 170,
  },

  brandText: {
    color: "#F2FAF9",
    fontSize: 24,
    fontWeight: "400",
    letterSpacing: 9,
    marginTop: -5,
  },

  brandAccent: {
    color: colors.primary,
  },

  headingContainer: {
    alignItems: "center",
    marginBottom: 27,
  },

  heading: {
    color: "#F7FAFA",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
  },

  headingAccent: {
    color: colors.primary,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    marginTop: 7,
  },

  form: {
    gap: 13,
  },

  fieldWrapper: {
    width: "100%",
  },

  inputContainer: {
    height: 66,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.4,
    borderColor: "#293C3E",
    borderRadius: 40,
    paddingHorizontal: 20,
    backgroundColor: "rgba(9, 17, 18, 0.82)",
  },

  inputFocused: {
    borderColor: colors.primary,
  },

  inputError: {
    borderColor: colors.error,
  },

  fieldIcon: {
    width: 38,
  },

  input: {
    flex: 1,
    height: "100%",
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 10,
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
    height: 66,
    alignItems: "center",
    justifyContent: "center",
  },

  submitText: {
    color: "#031718",
    fontSize: 20,
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
    gap: 17,
    marginVertical: 28,
    paddingHorizontal: 15,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#304344",
  },

  orText: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: "700",
  },

  socialContainer: {
    gap: 13,
  },

  socialButton: {
    height: 62,
    borderRadius: 40,
    borderWidth: 1.4,
    borderColor: "#34494B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 19,
    backgroundColor: "rgba(9, 17, 18, 0.7)",
  },

  socialText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },

  signinContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 38,
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

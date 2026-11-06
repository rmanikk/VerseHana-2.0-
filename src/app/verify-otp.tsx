
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState, type ElementRef } from "react";

import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
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

import { API } from "@/constants/api";
import { Colors } from "@/constants/theme";
import { authStorage } from "@/services/auth-storage";

const colors = Colors.dark;
const RESEND_COOLDOWN = 60;

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const inputRef = useRef<ElementRef<typeof TextInput>>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const normalizedEmail = (email || "").trim().toLowerCase();

  // Listen to the animated verification progress.
  useEffect(() => {
    const listener = progressAnim.addListener(({ value }) => {
      setProgress(Math.round(value));
    });

    return () => {
      progressAnim.removeListener(listener);
    };
  }, [progressAnim]);

  // Resend countdown.
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const startProgress = () => {
    progressAnim.stopAnimation();
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 92,
      duration: 4500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const completeProgress = () => {
    return new Promise<void>((resolve) => {
      progressAnim.stopAnimation();

      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => resolve());
    });
  };

  const resetProgress = () => {
    progressAnim.stopAnimation();
    progressAnim.setValue(0);
    setProgress(0);
  };

  const handleVerify = async () => {
    if (loading || resending) return;

    setError("");
    setMessage("");

    if (!normalizedEmail) {
      setError("Your email address is missing. Please return to signup.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter your six-digit verification code.");
      inputRef.current?.focus();
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    startProgress();

    let verified = false;

    try {
      const response = await fetch(API.auth.verifyEmail, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          otp,
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
          data.message || "Verification failed. Please try again.",
        );
        return;
      }

      await authStorage.saveTokens(
        data.accessToken,
        data.refreshToken,
      );

      verified = true;

      await completeProgress();

      setMessage("Your email has been verified successfully!");

      setTimeout(() => {
        router.replace("/(tabs)");
      }, 450);
    } catch (err) {
      console.error("OTP verification error:", err);

      setError(
        "Unable to connect to VerseHana. Please try again.",
      );
    } finally {
      if (!verified) {
        resetProgress();
      }

      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (loading || resending || countdown > 0) return;

    setError("");
    setMessage("");

    if (!normalizedEmail) {
      setError("Your email address is missing.");
      return;
    }

    setResending(true);

    try {
      const response = await fetch(API.auth.resendOtp, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.retryAfterSeconds) {
          setCountdown(data.retryAfterSeconds);
        }

        setError(
          data.message || "Unable to resend verification code.",
        );
        return;
      }

      setCountdown(RESEND_COOLDOWN);
      setOtp("");

      setMessage(data.message || "A new verification code has been sent.");

      inputRef.current?.focus();
    } catch (err) {
      console.error("OTP resend error:", err);

      setError(
        "Unable to connect to VerseHana. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  const renderOtpBoxes = () => {
    return (
      <Pressable
        style={styles.otpContainer}
        onPress={() => inputRef.current?.focus()}
        disabled={loading || resending}
      >
        <View style={styles.otpBoxes}>
          {Array.from({ length: 6 }).map((_, index) => {
            const digit = otp[index];
            const isActive = index === otp.length && !loading;

            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  isActive && styles.otpBoxActive,
                  digit && styles.otpBoxFilled,
                ]}
              >
                <Text style={styles.otpDigit}>
                  {digit || ""}
                </Text>

                {isActive && !digit && (
                  <View style={styles.cursor} />
                )}
              </View>
            );
          })}
        </View>

        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={(value) => {
            setOtp(value.replace(/\D/g, "").slice(0, 6));
            setError("");
            setMessage("");
          }}
          keyboardType="number-pad"
          maxLength={6}
          editable={!loading && !resending}
          autoFocus
          caretHidden
          contextMenuHidden={false}
          selectionColor="transparent"
          accessibilityLabel="Six-digit verification code"
          style={styles.hiddenInput}
          textContentType="oneTimeCode"
          onSubmitEditing={handleVerify}
          returnKeyType="done"
        />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back navigation */}
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#E8F8F6"
            />
          </Pressable>

          {/* Header illustration */}
          <View style={styles.hero}>
            <View style={styles.iconOuter}>
              <LinearGradient
                colors={["#164F50", "#092829"]}
                style={styles.iconGradient}
              >
                <Ionicons
                  name="mail-open-outline"
                  size={43}
                  color="#49D9D4"
                />
              </LinearGradient>

              <View style={styles.iconBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={19}
                  color="#031B19"
                />
              </View>
            </View>

            <Text style={styles.heading}>
              Verify your <Text style={styles.accent}>email</Text>
            </Text>

            <Text style={styles.subtitle}>
              One last step before you enter your VerseHana world.
            </Text>

            <View style={styles.emailBadge}>
              <Ionicons
                name="mail-outline"
                size={15}
                color="#49D9D4"
              />
              <Text style={styles.emailText} numberOfLines={1}>
                {normalizedEmail || "Your email address"}
              </Text>
            </View>
          </View>

          {/* OTP input */}
          <View style={styles.form}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>
                Verification code
              </Text>

              <Text style={styles.digitHint}>
                6 DIGITS
              </Text>
            </View>

            {renderOtpBoxes()}

            <Text style={styles.inputHint}>
              Enter the six-digit code sent to your email.
            </Text>

            {/* Error feedback */}
            {error ? (
              <View style={styles.feedbackRow}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#FF7777"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Success feedback */}
            {message ? (
              <View style={styles.feedbackRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#49D9D4"
                />
                <Text style={styles.successText}>{message}</Text>
              </View>
            ) : null}

            {/* Processing percentage */}
            {loading && (
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <View style={styles.progressTitleRow}>
                    <ActivityIndicator
                      size="small"
                      color="#49D9D4"
                    />
                    <Text style={styles.progressTitle}>
                      Verifying your code
                    </Text>
                  </View>

                  <Text style={styles.progressPercentage}>
                    {progress}%
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 100],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>

                <Text style={styles.progressSubtitle}>
                  Securing your VerseHana account...
                </Text>
              </View>
            )}

            {/* Verify button */}
            <Pressable
              onPress={handleVerify}
              disabled={loading || resending}
              style={({ pressed }) => [
                styles.verifyButton,
                pressed && styles.buttonPressed,
                (loading || resending) && styles.buttonDisabled,
              ]}
            >
              <LinearGradient
                colors={["#49D9D4", "#17BDBA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verifyGradient}
              >
                {loading ? (
                  <>
                    <Text style={styles.verifyText}>
                      Verifying...
                    </Text>
                    <ActivityIndicator
                      color="#031718"
                      size="small"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.verifyText}>
                      Verify email
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color="#031718"
                    />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Resend timer */}
          <View style={styles.resendSection}>
            <Text style={styles.resendQuestion}>
              Didn't receive the code?
            </Text>

            <Pressable
              onPress={handleResend}
              disabled={
                loading || resending || countdown > 0
              }
              style={styles.resendButton}
            >
              {resending ? (
                <ActivityIndicator
                  size="small"
                  color="#49D9D4"
                />
              ) : countdown > 0 ? (
                <Text style={styles.timerText}>
                  Resend code in{" "}
                  <Text style={styles.timerValue}>
                    {formatTime(countdown)}
                  </Text>
                </Text>
              ) : (
                <Text style={styles.resendLink}>
                  Resend verification code
                </Text>
              )}
            </Pressable>
          </View>

          {/* Expiry information */}
          <View style={styles.expiryContainer}>
            <Ionicons
              name="time-outline"
              size={15}
              color="#718B89"
            />
            <Text style={styles.expiryText}>
              Your verification code expires after 10 minutes.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#030909",
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: 35,
  },

  backButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#244342",
    backgroundColor: "#0B1717",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },

  hero: {
    alignItems: "center",
    marginBottom: 35,
  },

  iconOuter: {
    position: "relative",
    marginBottom: 27,
  },

  iconGradient: {
    width: 94,
    height: 94,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#28696A",
  },

  iconBadge: {
    position: "absolute",
    right: -7,
    bottom: -5,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#49D9D4",
    borderWidth: 3,
    borderColor: "#030909",
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    color: "#F4FCFB",
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: -0.8,
    textAlign: "center",
  },

  accent: {
    color: "#35C9BC",
  },

  subtitle: {
    color: "#91AAA8",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 11,
    maxWidth: 290,
  },

  emailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#102321",
    borderWidth: 1,
    borderColor: "#24504C",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 18,
    maxWidth: "100%",
  },

  emailText: {
    color: "#49D9D4",
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },

  form: {
    gap: 15,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inputLabel: {
    color: "#E2F0EE",
    fontSize: 14,
    fontWeight: "700",
  },

  digitHint: {
    color: "#66817E",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  otpContainer: {
    position: "relative",
  },

  otpBoxes: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  otpBox: {
    flex: 1,
    height: 59,
    borderRadius: 14,
    borderWidth: 1.3,
    borderColor: "#284644",
    backgroundColor: "#0A1515",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  otpBoxActive: {
    borderColor: "#49D9D4",
    backgroundColor: "#102522",
  },

  otpBoxFilled: {
    borderColor: "#347D75",
    backgroundColor: "#102321",
  },

  otpDigit: {
    color: "#F4FFFD",
    fontSize: 23,
    fontWeight: "800",
  },

  cursor: {
    width: 2,
    height: 22,
    backgroundColor: "#49D9D4",
    borderRadius: 2,
  },

  hiddenInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.02,
    color: "transparent",
    backgroundColor: "transparent",
    fontSize: 24,
  },

  inputHint: {
    color: "#718B89",
    fontSize: 12,
    marginTop: -5,
  },

  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  errorText: {
    color: "#FF8585",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  successText: {
    color: "#49D9D4",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  progressCard: {
    backgroundColor: "#0D1D1B",
    borderWidth: 1,
    borderColor: "#24504B",
    borderRadius: 17,
    padding: 16,
    gap: 13,
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  progressTitle: {
    color: "#D8EBE8",
    fontSize: 13,
    fontWeight: "600",
  },

  progressPercentage: {
    color: "#49D9D4",
    fontSize: 19,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  progressTrack: {
    height: 6,
    backgroundColor: "#233C39",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#49D9D4",
    borderRadius: 10,
  },

  progressSubtitle: {
    color: "#78918E",
    fontSize: 11,
  },

  verifyButton: {
    borderRadius: 40,
    overflow: "hidden",
    marginTop: 5,
  },

  verifyGradient: {
    height: 57,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  verifyText: {
    color: "#031718",
    fontSize: 15,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  resendSection: {
    alignItems: "center",
    marginTop: 29,
    gap: 9,
  },

  resendQuestion: {
    color: "#91AAA8",
    fontSize: 13,
  },

  resendButton: {
    minHeight: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  timerText: {
    color: "#8CA6A3",
    fontSize: 13,
  },

  timerValue: {
    color: "#49D9D4",
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  resendLink: {
    color: "#49D9D4",
    fontSize: 13,
    fontWeight: "800",
  },

  expiryContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 28,
  },

  expiryText: {
    color: "#718B89",
    fontSize: 11,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  saveOnboarding,
  type OnboardingPreferences,
} from "@/services/onboarding-service";

const COLORS = {
  background: "#030707",
  card: "#102020",
  cardSelected: "#12312F",
  primary: "#35C9BC",
  text: "#FFFFFF",
  secondary: "#A3B8B8",
  border: "#24413F",
  error: "#FF7777",
};

const STEPS = [
  {
    title: "How are you feeling lately?",
    subtitle:
      "Choose the moods that feel closest to you. You can select more than one.",
    label: "Mood Discovery",
    options: [
      { id: "calm", title: "Calm", icon: "cloud-outline" },
      { id: "happy", title: "Happy", icon: "sunny-outline" },
      { id: "motivated", title: "Motivated", icon: "flash-outline" },
      { id: "emotional", title: "Emotional", icon: "rainy-outline" },
      { id: "thoughtful", title: "Thoughtful", icon: "moon-outline" },
      { id: "lonely", title: "Lonely", icon: "water-outline" },
      { id: "adventurous", title: "Adventurous", icon: "compass-outline" },
      { id: "inspired", title: "Inspired", icon: "sparkles-outline" },
    ],
  },
  {
    title: "Find your people.",
    subtitle:
      "What would you love to explore in the VerseHana community?",
    label: "Pulse & Community",
    options: [
      { id: "poetry", title: "Poetry & Writing", icon: "book-outline" },
      { id: "thoughts", title: "Sharing Thoughts", icon: "chatbubble-outline" },
      { id: "stories", title: "Reading Stories", icon: "library-outline" },
      {
        id: "conversations",
        title: "Meaningful Conversations",
        icon: "people-outline",
      },
      {
        id: "creativity",
        title: "Creative Expression",
        icon: "color-palette-outline",
      },
      {
        id: "perspectives",
        title: "New Perspectives",
        icon: "globe-outline",
      },
    ],
  },
  {
    title: "What moves your soul?",
    subtitle:
      "Choose the music styles you enjoy or would like to discover.",
    label: "Your Music Universe",
    options: [
      { id: "pop", title: "Pop", icon: "musical-notes-outline" },
      { id: "indie", title: "Indie", icon: "headset-outline" },
      { id: "classical", title: "Classical", icon: "musical-note-outline" },
      { id: "hiphop", title: "Hip-hop", icon: "mic-outline" },
      { id: "lofi", title: "Lo-fi", icon: "moon-outline" },
      { id: "rock", title: "Rock", icon: "guitar-outline" },
      { id: "instrumental", title: "Instrumental", icon: "piano-outline" },
      { id: "devotional", title: "Devotional", icon: "heart-outline" },
    ],
  },
] as const;

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);

  const [preferences, setPreferences] =
    useState<OnboardingPreferences>({
      moodPreferences: [],
      pulseInterests: [],
      musicPreferences: [],
    });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentStep = STEPS[step];

  const preferenceKeys = [
    "moodPreferences",
    "pulseInterests",
    "musicPreferences",
  ] as const;

  const currentKey = preferenceKeys[step];

  const selectedItems = preferences[currentKey];

  const toggleOption = (id: string) => {
    setPreferences((previous) => {
      const current = previous[currentKey];

      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];

      return {
        ...previous,
        [currentKey]: updated,
      };
    });

    setError("");
  };

  const handleContinue = () => {
    if (step < STEPS.length - 1) {
      setStep((previous) => previous + 1);
      setError("");
      return;
    }

    handleComplete();
  };

  const handleComplete = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      await saveOnboarding(preferences);
      router.replace("/(tabs)");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your preferences. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((previous) => previous - 1);
      setError("");
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.topGlow} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>
            VERSE<Text style={styles.brandAccent}>HANA</Text>
          </Text>

          <Text style={styles.stepText}>
            {String(step + 1).padStart(2, "0")} / 03
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          {STEPS.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.progressSegment,
                index <= step && styles.progressActive,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>
            {currentStep.label.toUpperCase()}
          </Text>

          <Text style={styles.heading}>
            {currentStep.title}
          </Text>

          <Text style={styles.subtitle}>
            {currentStep.subtitle}
          </Text>

          <Text style={styles.selectionHint}>
            SELECT ALL THAT APPLY
          </Text>

          {/* Options */}
          <View style={styles.optionsGrid}>
            {currentStep.options.map((option) => {
              const selected = selectedItems.includes(option.id);

              return (
                <Pressable
                  key={option.id}
                  onPress={() => toggleOption(option.id)}
                  style={[
                    styles.optionCard,
                    selected && styles.optionSelected,
                  ]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  <LinearGradient
                    colors={
                      selected
                        ? ["#153B38", "#102020"]
                        : ["#102020", "#0B1716"]
                    }
                    style={styles.optionGradient}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={23}
                      color={selected ? COLORS.primary : COLORS.secondary}
                    />

                    <Text style={styles.optionTitle}>
                      {option.title}
                    </Text>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={19}
                        color={COLORS.primary}
                        style={styles.checkIcon}
                      />
                    )}
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.selectedCount}>
            {selectedItems.length} selected
          </Text>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            {step > 0 && (
              <Pressable
                onPress={handleBack}
                disabled={loading}
                style={styles.backButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={19}
                  color={COLORS.primary}
                />
              </Pressable>
            )}

            <Pressable
              onPress={handleContinue}
              disabled={loading}
              style={styles.continueButton}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.background} />
              ) : (
                <>
                  <Text style={styles.continueText}>
                    {step === 2 ? "Finish" : "Continue"}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color={COLORS.background}
                  />
                </>
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={handleComplete}
            disabled={loading}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 23,
  },

  topGlow: {
    position: "absolute",
    top: -150,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 200,
    backgroundColor: "#123B37",
    opacity: 0.35,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 22,
  },

  brand: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 2,
  },

  brandAccent: {
    color: COLORS.primary,
  },

  stepText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
  },

  progressContainer: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 35,
  },

  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },

  progressActive: {
    backgroundColor: COLORS.primary,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  sectionLabel: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 13,
  },

  heading: {
    color: COLORS.text,
    fontSize: 29,
    fontWeight: "800",
    lineHeight: 37,
    marginBottom: 10,
  },

  subtitle: {
    color: COLORS.secondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 29,
  },

  selectionHint: {
    color: "#718B88",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 13,
  },

  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 11,
  },

  optionCard: {
    width: "48%",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  optionSelected: {
    borderColor: COLORS.primary,
  },

  optionGradient: {
    minHeight: 108,
    padding: 14,
    justifyContent: "space-between",
  },

  optionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 13,
    paddingRight: 5,
  },

  checkIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },

  selectedCount: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 19,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 15,
  },

  footer: {
    paddingTop: 13,
    paddingBottom: 10,
  },

  footerButtons: {
    flexDirection: "row",
    gap: 11,
  },

  backButton: {
    width: 54,
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  continueButton: {
    flex: 1,
    height: 54,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  continueText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: "800",
  },

  skipButton: {
    alignItems: "center",
    padding: 13,
  },

  skipText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "500",
  },
});
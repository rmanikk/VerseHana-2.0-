
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { VerseHanaLoader } from "@/components/ui/versehana-loader";

import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getArtistSpotlight,
  saveOnboarding,
  type Artist,
  type Mood,
} from "@/services/onboarding-service";

const COLORS = {
  background: "#030707",
  card: "#102020",
  selected: "#153B38",
  primary: "#35C9BC",
  text: "#FFFFFF",
  secondary: "#A3B8B8",
  border: "#24413F",
  error: "#FF7777",
};

const MAX_ARTISTS = 6;

const MOODS: {
  id: Mood;
  title: string;
  emoji: string;
  description: string;
}[] = [
  { id: "happy", title: "Happy", emoji: "😊", description: "Bright and uplifting" },
  { id: "calm", title: "Calm", emoji: "😌", description: "Peaceful and relaxed" },
  { id: "rain", title: "Rain", emoji: "🌧️", description: "Reflective and dreamy" },
  { id: "night", title: "Night", emoji: "🌙", description: "For the late hours" },
  { id: "love", title: "Love", emoji: "❤️", description: "Warm and heartfelt" },
  { id: "focus", title: "Focus", emoji: "💪", description: "Clear your mind" },
  { id: "party", title: "Party", emoji: "🎉", description: "Energy and excitement" },
  { id: "sad", title: "Sad", emoji: "😢", description: "Music for reflection" },
];

const FEATURES = [
  {
    id: "downloads",
    title: "Offline Downloads",
    description: "Your favourite music, wherever you go.",
    icon: "cloud-download-outline" as const,
    accent: "#58D8E8",
    artwork: "DOWNLOAD",
  },
  {
    id: "community",
    title: "Community",
    description: "Connect through shared music and creativity.",
    icon: "people-outline" as const,
    accent: "#35C9BC",
    artwork: "CONNECT",
  },
  {
    id: "reels",
    title: "Music Reels",
    description: "Discover new sounds through music videos.",
    icon: "play-circle-outline" as const,
    accent: "#83CFF5",
    artwork: "DISCOVER",
  },
  {
    id: "space",
    title: "Your Music Space",
    description: "Keep your favourite discoveries together.",
    icon: "headset-outline" as const,
    accent: "#58D8E8",
    artwork: "YOUR SPACE",
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [selectedArtistIds, setSelectedArtistIds] = useState<string[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);

  const [artistLoading, setArtistLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Floating feature-card animations for the final onboarding screen.
  const featureAnimations = useRef(
    FEATURES.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const loops = featureAnimations.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 1900 + index * 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 1900 + index * 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== "web",
          }),
        ])
      )
    );

    loops.forEach((loop) => loop.start());

    return () => {
      loops.forEach((loop) => loop.stop());
    };
  }, [featureAnimations]);

  // Load a maximum of six artists for the selected mood.
  useEffect(() => {
    if (step !== 1 || !selectedMood) return;

    let active = true;

    async function loadArtists() {
      setArtistLoading(true);
      setError("");
      setArtists([]);
      setSelectedArtistIds([]);

      try {
        const result = await getArtistSpotlight(selectedMood!);

        if (active) {
          setArtists(result.slice(0, MAX_ARTISTS));
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load artists. Please try again."
          );
        }
      } finally {
        if (active) {
          setArtistLoading(false);
        }
      }
    }

    loadArtists();

    return () => {
      active = false;
    };
  }, [step, selectedMood]);

  const toggleArtist = (artistId: string) => {
    setSelectedArtistIds((previous) =>
      previous.includes(artistId)
        ? previous.filter((id) => id !== artistId)
        : [...previous, artistId]
    );

    setError("");
  };

  const handleContinue = () => {
    setError("");

    if (step === 0) {
      if (!selectedMood) {
        setError("Please choose a mood to continue.");
        return;
      }

      setStep(1);
      return;
    }

    if (step === 1) {
      if (selectedArtistIds.length === 0) {
        setError("Please select at least one artist.");
        return;
      }

      setStep(2);
    }
  };

  const handleBack = () => {
    setError("");

    if (step > 0) {
      setStep((previous) => previous - 1);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/login");
    }
  };

  const handleComplete = async () => {
    if (saving || !selectedMood) return;

    setSaving(true);
    setError("");

    try {
      await saveOnboarding({
        selectedMood,
        favoriteArtistIds: selectedArtistIds,
      });

      router.replace("/(tabs)");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete onboarding. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const stepLabels = [
    "Mood Discovery",
    "Artist Spotlight",
    "Meet VerseHana",
  ];

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
          {[0, 1, 2].map((item) => (
            <View
              key={item}
              style={[
                styles.progressSegment,
                item <= step && styles.progressActive,
              ]}
            />
          ))}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>
            {stepLabels[step].toUpperCase()}
          </Text>

          {/* SCREEN 1: MOOD DISCOVERY */}
          {step === 0 && (
            <>
              <Text style={styles.heading}>
                What does your world feel like today?
              </Text>

              <Text style={styles.subtitle}>
                Choose one mood. We'll use it to shape your music discovery
                experience.
              </Text>

              <Text style={styles.selectionHint}>CHOOSE YOUR MOOD</Text>

              <View style={styles.moodGrid}>
                {MOODS.map((mood) => {
                  const selected = selectedMood === mood.id;

                  return (
                    <Pressable
                      key={mood.id}
                      onPress={() => {
                        setSelectedMood(mood.id);
                        setError("");
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[
                        styles.moodCard,
                        selected && styles.cardSelected,
                      ]}
                    >
                      <LinearGradient
                        colors={
                          selected
                            ? ["#17413D", "#102020"]
                            : ["#102020", "#0B1716"]
                        }
                        style={styles.moodGradient}
                      >
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>

                        <View style={styles.moodTextContainer}>
                          <Text style={styles.moodTitle}>{mood.title}</Text>
                          <Text style={styles.moodDescription}>
                            {mood.description}
                          </Text>
                        </View>

                        {selected && (
                          <Text style={styles.selectedCheck}>✓</Text>
                        )}
                      </LinearGradient>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* SCREEN 2: ARTIST SPOTLIGHT */}
          {step === 1 && (
            <>
              <Text style={styles.heading}>
                Artists that match your mood.
              </Text>

              <Text style={styles.subtitle}>
                Discover artists picked around your{" "}
                {selectedMood ?? "selected"} mood. Choose your favourites.
              </Text>

              <View style={styles.artistHeader}>
                <Text style={styles.selectionHint}>ARTIST SPOTLIGHT</Text>

                <Text style={styles.artistCount}>
                  {selectedArtistIds.length} selected
                </Text>
              </View>

              {artistLoading ? (
                <View style={styles.loadingContainer}>
                 <VerseHanaLoader size="sm" />
                  <Text style={styles.loadingText}>
                    Finding artists for your mood...
                  </Text>
                </View>
              ) : artists.length > 0 ? (
                <View style={styles.artistGrid}>
                  {artists.slice(0, MAX_ARTISTS).map((artist) => {
                    const selected = selectedArtistIds.includes(artist.id);

                    return (
                      <Pressable
                        key={artist.id}
                        onPress={() => toggleArtist(artist.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        style={[
                          styles.artistCard,
                          selected && styles.artistCardSelected,
                        ]}
                      >
                        <View style={styles.artistImageContainer}>
                          {artist.imageUrl ? (
                            <Image
                              source={{ uri: artist.imageUrl }}
                              style={styles.artistImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.artistImageFallback}>
                              <Text style={styles.artistFallbackText}>
                                {artist.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}

                          <View
                            style={[
                              styles.artistCheck,
                              selected && styles.artistCheckSelected,
                            ]}
                          >
                            {selected && (
                              <Text style={styles.artistCheckText}>✓</Text>
                            )}
                          </View>
                        </View>

                        <Text
                          style={styles.artistName}
                          numberOfLines={2}
                        >
                          {artist.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : !error ? (
                <Text style={styles.emptyText}>
                  No artists are available for this mood right now.
                </Text>
              ) : null}

              {error && !artistLoading && (
                <Pressable
                  onPress={() => setStep(0)}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>
                    Go back and choose another mood
                  </Text>
                </Pressable>
              )}
            </>
          )}

          {/* SCREEN 3: MEET VERSEHANA */}
          {step === 2 && (
            <>
              <Text style={styles.heading}>
                A little more than just music.
              </Text>

              <Text style={styles.subtitle}>
                Discover a space made for expressing yourself,
                connecting and experiencing music differently.
              </Text>

              <View style={styles.featureGrid}>
                {FEATURES.map((feature, index) => {
                  const translateY = featureAnimations[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [7, -7],
                  });

                  const rotation = index % 2 === 0 ? "-2deg" : "2deg";

                  return (
                    <Animated.View
                      key={feature.id}
                      style={[
                        styles.featureTile,
                        {
                          transform: [
                            { translateY },
                            { rotate: rotation },
                          ],
                        },
                      ]}
                    >
                      <LinearGradient
                        colors={["#174447", "#0B2021", "#081414"]}
                        style={[
                          styles.featureGradient,
                          { borderColor: `${feature.accent}75` },
                        ]}
                      >
                        <View style={styles.featureArtwork}>
                          <View
                            style={[
                              styles.artworkGlow,
                              { backgroundColor: feature.accent },
                            ]}
                          />

                          <View
                            style={[
                              styles.artworkCircle,
                              { borderColor: `${feature.accent}85` },
                            ]}
                          >
                            <Ionicons
                              name={feature.icon}
                              size={58}
                              color={feature.accent}
                            />
                          </View>

                          <View style={styles.artworkDecoration}>
                            <Ionicons
                              name="musical-notes"
                              size={19}
                              color={feature.accent}
                            />
                          </View>

                          <Text
                            style={[
                              styles.artworkLabel,
                              { color: feature.accent },
                            ]}
                          >
                            {feature.artwork}
                          </Text>
                        </View>

                        <View style={styles.featureCardContent}>
                          <Text style={styles.featureTitle}>
                            {feature.title}
                          </Text>

                          <Text style={styles.featureDescription}>
                            {feature.description}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.featureBottomLine,
                            { backgroundColor: feature.accent },
                          ]}
                        />
                      </LinearGradient>
                    </Animated.View>
                  );
                })}
              </View>
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <Pressable
              onPress={handleBack}
              disabled={saving}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>←</Text>
            </Pressable>

            <Pressable
              onPress={step === 2 ? handleComplete : handleContinue}
              disabled={saving || (step === 1 && artistLoading)}
              style={[
                styles.continueButton,
                (saving || (step === 1 && artistLoading)) &&
                  styles.buttonDisabled,
              ]}
            >
              {saving ? (
                <VerseHanaLoader size="xs" />
              ) : (
                <>
                  <Text style={styles.continueText}>
                    {step === 2
                      ? "Let's Begin"
                      : step === 1
                        ? "Continue"
                        : "Discover Artists"}
                  </Text>

                  <Text style={styles.continueArrow}>→</Text>
                </>
              )}
            </Pressable>
          </View>

          <Text style={styles.footerHint}>
            {step === 2
              ? "Your VerseHana experience starts here."
              : "You can explore more after onboarding."}
          </Text>
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
    marginBottom: 30,
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
    paddingBottom: 22,
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
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 10,
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 27,
  },
  selectionHint: {
    color: "#718B88",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 13,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 11,
  },
  moodCard: {
    width: "48%",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  cardSelected: {
    borderColor: COLORS.primary,
  },
  moodGradient: {
    minHeight: 105,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  moodEmoji: {
    fontSize: 27,
  },
  moodTextContainer: {
    flex: 1,
  },
  moodTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  moodDescription: {
    color: COLORS.secondary,
    fontSize: 10,
    marginTop: 4,
  },
  selectedCheck: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "800",
    position: "absolute",
    top: 7,
    right: 9,
  },
  artistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  artistCount: {
    color: COLORS.primary,
    fontSize: 12,
    marginBottom: 13,
  },
  artistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 15,
  },
  artistCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 9,
    alignItems: "center",
    gap: 10,
  },
  artistCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.selected,
  },
  artistImageContainer: {
    width: "100%",
    height: 125,
    borderRadius: 11,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1B3936",
  },
  artistImage: {
    width: "100%",
    height: "100%",
  },
  artistImageFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  artistFallbackText: {
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: "800",
  },
  artistName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    minHeight: 34,
  },
  artistCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "rgba(3,7,7,0.75)",
    borderWidth: 1,
    borderColor: "#A3B8B8",
    alignItems: "center",
    justifyContent: "center",
  },
  artistCheckSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  artistCheckText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: "900",
  },
  loadingContainer: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loadingText: {
    color: COLORS.secondary,
    fontSize: 13,
  },
  emptyText: {
    color: COLORS.secondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 30,
  },
  retryButton: {
    padding: 13,
    alignItems: "center",
  },
  retryText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },

  // FINAL SCREEN: FLOATING FEATURE CARDS
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 17,
    marginTop: 5,
  },
  featureTile: {
    width: "48%",
    borderRadius: 20,
    overflow: "hidden",
  },
  featureGradient: {
    minHeight: 220,
    borderRadius: 20,
    borderWidth: 1,
    padding: 11,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  featureArtwork: {
    height: 125,
    borderRadius: 14,
    backgroundColor: "rgba(53,201,188,0.07)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  artworkGlow: {
    position: "absolute",
    width: 105,
    height: 105,
    borderRadius: 60,
    opacity: 0.12,
  },
  artworkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    backgroundColor: "rgba(53,201,188,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },
  artworkDecoration: {
    position: "absolute",
    top: 12,
    right: 13,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(53,201,188,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  artworkLabel: {
    position: "absolute",
    bottom: 10,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 2,
  },
  featureCardContent: {
    paddingTop: 12,
    paddingBottom: 5,
  },
  featureTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  featureDescription: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 16,
  },
  featureBottomLine: {
    width: 32,
    height: 2,
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 5,
    opacity: 0.85,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 15,
    lineHeight: 19,
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
  backArrow: {
    color: COLORS.primary,
    fontSize: 24,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  continueText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: "800",
  },
  continueArrow: {
    color: COLORS.background,
    fontSize: 19,
    fontWeight: "700",
  },
  footerHint: {
    color: "#718B88",
    textAlign: "center",
    fontSize: 11,
    marginTop: 12,
  },
});

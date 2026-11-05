import * as SplashScreen from "expo-splash-screen";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

import {
  Animated,
  Platform,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";

const colors = Colors.dark;

const BAR_HEIGHTS = [
  13, 22, 34, 19, 42, 27, 48, 31, 54, 35, 45,
  25, 39, 20, 47, 29, 37, 17, 30, 15, 24,
];

const FEATURES = [
  {
    id: "mood",
    title: "Mood-Based",
    subtitle: "Discovery",
    icon: "happy-outline" as const,
    accent: "#58D8E8",
    type: "mood",
  },
  {
    id: "community",
    title: "Music",
    subtitle: "Community",
    icon: "people-outline" as const,
    accent: "#35C9BC",
    type: "community",
  },
  {
    id: "reels",
    title: "Song",
    subtitle: "Reels",
    icon: "play-circle-outline" as const,
    accent: "#83CFF5",
    type: "reels",
  },
];

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();

  // Animated waveform
  const waveAnimations = useRef(
    BAR_HEIGHTS.map(() => new Animated.Value(0.3))
  ).current;

  // Floating cards
  const floatAnimations = useRef(
    FEATURES.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const waveLoops = waveAnimations.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 35),
          Animated.timing(value, {
            toValue: 1,
            duration: 350 + (index % 4) * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(value, {
            toValue: 0.25,
            duration: 400 + (index % 3) * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: Platform.OS !== "web",
          }),
        ])
      )
    );

    const floatingLoops = floatAnimations.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 1800 + index * 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 1800 + index * 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: Platform.OS !== "web",
          }),
        ])
      )
    );

    waveLoops.forEach((loop) => loop.start());
    floatingLoops.forEach((loop) => loop.start());

    return () => {
      waveLoops.forEach((loop) => loop.stop());
      floatingLoops.forEach((loop) => loop.stop());
    };
  }, [waveAnimations, floatAnimations]);

  const compact = height < 760;
  const cardWidth = Math.min((width - 64) / 3, 118);

  return (
    <SafeAreaView
  style={styles.safeArea}
  onLayout={() => {
    SplashScreen.hideAsync().catch(() => {});
  }}
>
      <LinearGradient
        colors={["#061719", "#07191B", "#031011"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Background glow */}
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          compact && styles.compactContent,
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* BRAND LOGO */}
        <View style={styles.brandSection}>
          <Image
            source={require("../../assets/images/splash-icon.png")}
            style={[
              styles.brandLogo,
              compact && styles.compactLogo,
            ]}
            resizeMode="contain"
            accessibilityLabel="VerseHana logo"
          />

          <Text style={styles.tagline}>
            M U S I C   B E Y O N D   B O R D E R S
          </Text>
        </View>

        {/* FLOATING FEATURE CARDS */}
        <View style={styles.featuresArea}>
          <View style={styles.orbitGlow} />

          <View style={styles.cardsRow}>
            {FEATURES.map((feature, index) => {
              const translateY = floatAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [8, -8],
              });

              return (
                <Animated.View
                  key={feature.id}
                  style={[
                    styles.featureCardWrapper,
                    {
                      width: cardWidth,
                      transform: [
                        { translateY },
                        {
                          rotate:
                            index === 0
                              ? "-5deg"
                              : index === 2
                                ? "5deg"
                                : "0deg",
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(19,65,68,0.95)",
                      "rgba(7,30,32,0.96)",
                    ]}
                    style={[
                      styles.featureCard,
                      { borderColor: `${feature.accent}75` },
                    ]}
                  >
                    {/* CARD ART */}
                    <View style={styles.cardArt}>
                      {feature.type === "mood" && (
                        <>
                          <View style={styles.moodChipRow}>
                            <Text style={styles.moodChip}>CHILL</Text>
                            <Text style={styles.moodChipHappy}>
                              HAPPY
                            </Text>
                          </View>

                          <View style={styles.moodIconCircle}>
                            <Ionicons
                              name="happy"
                              size={34}
                              color={feature.accent}
                            />
                          </View>

                          <Text style={styles.moodSmallText}>
                            FIND YOUR MOOD
                          </Text>
                        </>
                      )}

                      {feature.type === "community" && (
                        <>
                          <View style={styles.communityIcon}>
                            <Ionicons
                              name="people"
                              size={43}
                              color={feature.accent}
                            />
                          </View>

                          <View style={styles.avatarRow}>
                            <View style={styles.avatar}>
                              <Ionicons
                                name="person"
                                size={13}
                                color="#C4F6EF"
                              />
                            </View>
                            <View style={styles.avatar}>
                              <Ionicons
                                name="person"
                                size={13}
                                color="#A7DFF5"
                              />
                            </View>
                            <View style={styles.avatar}>
                              <Ionicons
                                name="person"
                                size={13}
                                color="#E5C6F8"
                              />
                            </View>
                          </View>
                        </>
                      )}

                      {feature.type === "reels" && (
                        <>
                          <View style={styles.reelsArt}>
                            <Ionicons
                              name="musical-notes"
                              size={32}
                              color={feature.accent}
                            />

                            <View style={styles.playCircle}>
                              <Ionicons
                                name="play"
                                size={21}
                                color={colors.background}
                              />
                            </View>
                          </View>

                          <Text style={styles.reelsSmallText}>
                            MUSIC • VIDEO
                          </Text>
                        </>
                      )}
                    </View>

                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle}>
                        {feature.title}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        {feature.subtitle}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.cardBottomLine,
                        { backgroundColor: feature.accent },
                      ]}
                    />
                  </LinearGradient>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* ANIMATED WAVEFORM */}
        <View style={styles.waveArea}>
          <View style={styles.waveLine} />

          <View style={styles.waveform}>
            {BAR_HEIGHTS.map((bar, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveBar,
                  {
                    height: bar,
                    transform: [
                      {
                        scaleY: waveAnimations[index],
                      },
                    ],
                    opacity: waveAnimations[index],
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {/* HEADLINE */}
        <View style={styles.headlineSection}>
          <Text style={styles.headline}>
            More than music.
          </Text>

          <Text style={styles.headline}>
            A place for your{" "}
            <Text style={styles.headlineAccent}>
              vibe.
            </Text>
          </Text>
        </View>

        {/* FEATURE LABELS */}
        <View style={styles.featureLabels}>
          <View style={styles.featureLabel}>
            <Ionicons
              name="compass-outline"
              size={24}
              color={colors.cyan}
            />
            <Text style={styles.labelTitle}>Discover</Text>
            <Text style={styles.labelSubtitle}>Your Vibe</Text>
          </View>

          <View style={styles.labelDivider} />

          <View style={styles.featureLabel}>
            <Ionicons
              name="people-outline"
              size={24}
              color={colors.cyan}
            />
            <Text style={styles.labelTitle}>Connect</Text>
            <Text style={styles.labelSubtitle}>With Community</Text>
          </View>

          <View style={styles.labelDivider} />

          <View style={styles.featureLabel}>
            <Ionicons
              name="play-circle-outline"
              size={24}
              color={colors.cyan}
            />
            <Text style={styles.labelTitle}>Experience</Text>
            <Text style={styles.labelSubtitle}>Music Differently</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => router.push("/signup")}
            style={({ pressed }) => [
              styles.getStartedButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={["#35C9BC", "#58D8E8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.getStartedText}>
                Get Started
              </Text>

              <Ionicons
                name="arrow-forward"
                size={22}
                color="#07191B"
              />
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => router.push("/login")}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
            </Text>

            <Text style={styles.loginAccent}>
              Log In
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 19,
    paddingTop: 3,
    paddingBottom: 20,
    justifyContent: "space-between",
  },

  compactContent: {
    paddingTop: 0,
    paddingBottom: 10,
  },

  glowTop: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#087D88",
    opacity: 0.15,
    top: -150,
    alignSelf: "center",
  },

  glowBottom: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#087D88",
    opacity: 0.12,
    bottom: -170,
    right: -150,
  },

  // BRAND
  brandSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  brandLogo: {
    width: 190,
    height: 190,
    marginTop: -12,
    marginBottom: -19,
  },

  compactLogo: {
    width: 150,
    height: 150,
    marginTop: -8,
    marginBottom: -17,
  },

  tagline: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.2,
    textAlign: "center",
  },

  // FLOATING CARDS
  featuresArea: {
    minHeight: 188,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },

  orbitGlow: {
    position: "absolute",
    width: "105%",
    height: 65,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(53,201,188,0.28)",
    backgroundColor: "rgba(53,201,188,0.035)",
    transform: [{ rotate: "-3deg" }],
  },

  cardsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  featureCardWrapper: {
    maxWidth: 118,
  },

  featureCard: {
    height: 160,
    width: "100%",
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingTop: 12,
    paddingBottom: 9,
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  cardArt: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  moodChipRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 6,
  },

  moodChip: {
    color: "#B8F4ED",
    fontSize: 7,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "#35C9BC",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  moodChipHappy: {
    color: "#F6BC57",
    fontSize: 7,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "#A88B4C",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  moodIconCircle: {
    width: 59,
    height: 59,
    borderRadius: 30,
    backgroundColor: "rgba(88,216,232,0.13)",
    borderWidth: 1,
    borderColor: "rgba(88,216,232,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  moodSmallText: {
    color: colors.textSecondary,
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 8,
  },

  communityIcon: {
    width: 65,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "rgba(53,201,188,0.10)",
  },

  avatarRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#234D50",
    borderWidth: 1,
    borderColor: "#58D8E8",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: -2,
  },

  reelsArt: {
    flex: 1,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "rgba(88,216,232,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  playCircle: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  reelsSmallText: {
    color: colors.textSecondary,
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 5,
  },

  cardText: {
    alignItems: "center",
    marginTop: 5,
  },

  cardTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  cardSubtitle: {
    color: colors.cyan,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },

  cardBottomLine: {
    width: 28,
    height: 2,
    borderRadius: 2,
    marginTop: 7,
    opacity: 0.8,
  },

  // WAVEFORM
  waveArea: {
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    marginBottom: 2,
  },

  waveLine: {
    position: "absolute",
    width: "110%",
    height: 1,
    backgroundColor: "rgba(53,201,188,0.16)",
  },

  waveform: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  waveBar: {
    width: 3,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  // HEADLINE
  headlineSection: {
    alignItems: "center",
    marginTop: 3,
    marginBottom: 16,
  },

  headline: {
    color: colors.text,
    fontSize: 27,
    lineHeight: 35,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.7,
  },

  headlineAccent: {
    color: colors.cyan,
  },

  // FEATURE LABELS
  featureLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 23,
  },

  featureLabel: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  labelTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
    textAlign: "center",
  },

  labelSubtitle: {
    color: colors.textSecondary,
    fontSize: 9,
    textAlign: "center",
  },

  labelDivider: {
    height: 47,
    width: 1,
    backgroundColor: colors.border,
  },

  // BUTTONS
  footer: {
    gap: 14,
  },

  getStartedButton: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOpacity: 0.23,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  buttonGradient: {
    height: 57,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 13,
  },

  getStartedText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  loginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },

  loginText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  loginAccent: {
    color: colors.cyan,
    fontSize: 13,
    fontWeight: "700",
  },
});
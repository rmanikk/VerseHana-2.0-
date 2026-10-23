import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Radius, Spacing } from "@/constants/theme";

const moods = [
  { name: "All", color: "#14B8A6" },
  { name: "Happy", color: "#F6BC57" },
  { name: "Calm", color: "#14B8A6" },
  { name: "Rain", color: "#83A8F0" },
  { name: "Night", color: "#A99AF5" },
  { name: "Focus", color: "#22D3EE" },
  { name: "Love", color: "#F28BAE" },
];

const tracks = [
  {
    title: "Midnight Dreams",
    artist: "Atmospheric Sounds",
    mood: "Night",
    symbol: "☾",
    color: "#31365F",
  },
  {
    title: "Ocean of Calm",
    artist: "Ambient Collective",
    mood: "Calm",
    symbol: "≈",
    color: "#126E78",
  },
  {
    title: "Golden Hour",
    artist: "Daylight",
    mood: "Happy",
    symbol: "☼",
    color: "#8B6031",
  },
];

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "light" ? "light" : "dark"];
  const [selectedMood, setSelectedMood] = useState("All");

  const visibleTracks =
    selectedMood === "All"
      ? tracks
      : tracks.filter((track) => track.mood === selectedMood);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View
              style={[styles.brandMark, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.brandMarkText}>V</Text>
            </View>

            <View>
              <Text style={[styles.brandName, { color: colors.text }]}>
                VerseHana
              </Text>
              <Text
                style={[styles.brandCaption, { color: colors.textSecondary }]}
              >
                YOUR WORLD, YOUR SOUND
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            style={[
              styles.avatar,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ color: colors.primary, fontSize: 19 }}>♙</Text>
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            YOUR DAILY SOUNDTRACK
          </Text>
          <Text style={[styles.heading, { color: colors.text }]}>
            Find your{"\n"}own rhythm.
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Whatever you feel, there’s a sound for it.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setSelectedMood("Focus")}
          style={[
            styles.featureCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.featureCopy}>
            <Text style={[styles.featureLabel, { color: colors.cyan }]}>
              YOUR MOMENT
            </Text>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              Tune into yourself.
            </Text>
            <Text
              style={[
                styles.featureDescription,
                { color: colors.textSecondary },
              ]}
            >
              Discover sounds that match your mood.
            </Text>
            <View
              style={[
                styles.featureButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.featureButtonText}>Explore sounds →</Text>
            </View>
          </View>

          <View
            style={[
              styles.featureArt,
              { backgroundColor: colors.backgroundSelected },
            ]}
          >
            <View
              style={[styles.artCircle, { backgroundColor: colors.primary }]}
            />
            <View
              style={[styles.artCircleSmall, { backgroundColor: colors.cyan }]}
            />
            <Text style={[styles.artSymbol, { color: colors.text }]}>♫</Text>
          </View>
        </Pressable>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              What’s your mood?
            </Text>
            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              EXPLORE
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodList}
          >
            {moods.map((mood) => {
              const active = selectedMood === mood.name;

              return (
                <Pressable
                  key={mood.name}
                  onPress={() => setSelectedMood(mood.name)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.moodChip,
                    {
                      backgroundColor: active
                        ? colors.primary
                        : colors.backgroundElement,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.moodDot,
                      { backgroundColor: active ? "#FFFFFF" : mood.color },
                    ]}
                  />
                  <Text
                    style={{
                      color: active ? "#FFFFFF" : colors.textSecondary,
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {mood.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Made for your mood
            </Text>
            <Text style={[styles.sectionHint, { color: colors.primary }]}>
              {visibleTracks.length} PICKS
            </Text>
          </View>

          {visibleTracks.length === 0 ? (
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={{ color: colors.textSecondary }}>
                More {selectedMood.toLowerCase()} sounds coming soon.
              </Text>
              <Pressable onPress={() => setSelectedMood("All")}>
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  Browse all picks
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.trackList}>
              {visibleTracks.map((track, index) => (
                <Pressable
                  key={track.title}
                  onPress={() => {
                    // Music playback will be connected in a later phase.
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${track.title} by ${track.artist}`}
                  style={[
                    styles.trackRow,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[styles.trackArt, { backgroundColor: track.color }]}
                  >
                    <Text style={styles.trackSymbol}>{track.symbol}</Text>
                  </View>

                  <View style={styles.trackInfo}>
                    <Text style={[styles.trackTitle, { color: colors.text }]}>
                      {track.title}
                    </Text>
                    <Text
                      style={[
                        styles.trackArtist,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {track.artist}
                    </Text>
                  </View>

                  <Text
                    style={[styles.trackNumber, { color: colors.textMuted }]}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Text style={[styles.playIcon, { color: colors.primary }]}>
                    ▶
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          FIND YOUR FREQUENCY.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: 40,
    gap: Spacing.four,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  brandName: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  brandCaption: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    gap: 9,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  heading: {
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1.8,
    lineHeight: 47,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  featureCard: {
    minHeight: 190,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  featureCopy: {
    flex: 1,
    gap: 9,
    paddingRight: 4,
  },
  featureLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  featureTitle: {
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 230,
  },
  featureButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    marginTop: 4,
  },
  featureButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  featureArt: {
    width: 105,
    height: 135,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  artCircle: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    top: 7,
    right: -28,
    opacity: 0.8,
  },
  artCircleSmall: {
    position: "absolute",
    width: 55,
    height: 55,
    borderRadius: 28,
    bottom: 8,
    left: -12,
    opacity: 0.85,
  },
  artSymbol: {
    fontSize: 55,
    fontWeight: "800",
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  sectionHint: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  moodList: {
    gap: 9,
    paddingRight: Spacing.three,
  },
  moodChip: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  moodDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  trackList: {
    gap: 10,
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  trackArt: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  trackSymbol: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "700",
  },
  trackInfo: {
    flex: 1,
    gap: 5,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  trackArtist: {
    fontSize: 12,
  },
  trackNumber: {
    fontSize: 11,
    fontWeight: "700",
  },
  playIcon: {
    fontSize: 14,
    paddingHorizontal: 5,
  },
  emptyState: {
    padding: Spacing.three,
    gap: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  footer: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    paddingTop: Spacing.two,
  },
});

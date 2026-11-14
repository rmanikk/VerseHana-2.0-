
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Radius, Spacing } from "@/constants/theme";

const colors = Colors.dark;
const INTRO_KEY = "verseflow_intro_seen";

type Category = "Global" | "Nepali" | "Hindi";

export default function VerseFlowScreen() {
  const { width } = useWindowDimensions();

  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  const [category, setCategory] = useState<Category>("Global");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(INTRO_KEY)
      .then((value) => setIntroSeen(value === "true"))
      .catch(() => setIntroSeen(false));
  }, []);

  const finishIntroduction = async () => {
    try {
      await AsyncStorage.setItem(INTRO_KEY, "true");
    } catch {
      // Continue to VerseFlow even if local storage fails.
    }

    setIntroSeen(true);
  };

  if (introSeen === null) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <Ionicons name="musical-notes" size={28} color={colors.primary} />
          <Text style={styles.loadingText}>Loading VerseFlow...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!introSeen) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.introContainer}>
          <LinearGradient
            colors={["#164E50", "#0B292D", "#07191B"]}
            style={styles.introArtwork}
          >
            <View style={[styles.orbit, styles.orbitOne]} />
<View style={[styles.orbit, styles.orbitTwo]} />
            <View style={styles.musicIcon}>
              <Ionicons
                name="musical-notes"
                size={54}
                color={colors.primary}
              />
            </View>

            <Text style={styles.artworkLabel}>VERSEHANA PRESENTS</Text>
            <Text style={styles.artworkTitle}>VerseFlow</Text>
          </LinearGradient>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              Discover music. Feel every verse.
            </Text>

            <Text style={styles.introDescription}>
              Explore music moments selected and visually created with AI,
              featuring synchronized lyrics and trending music discoveries.
            </Text>

            <View style={styles.featureRow}>
              <Ionicons
                name="sparkles-outline"
                size={21}
                color={colors.primary}
              />
              <Text style={styles.featureText}>
                AI-curated music experiences
              </Text>
            </View>

            <View style={styles.featureRow}>
              <Ionicons
                name="musical-note-outline"
                size={21}
                color={colors.primary}
              />
              <Text style={styles.featureText}>
                Discover Global, Nepali and Hindi music
              </Text>
            </View>

            <View style={styles.featureRow}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={21}
                color={colors.primary}
              />
              <Text style={styles.featureText}>
                Request your favourite music moments
              </Text>
            </View>

            <Text style={styles.disclaimer}>
              Music and visual content are AI-curated or AI-generated where
              applicable. Publication depends on content availability,
              permissions and required review.
            </Text>

            <Pressable
              style={styles.exploreButton}
              onPress={finishIntroduction}
            >
              <Text style={styles.exploreButtonText}>Explore VerseFlow</Text>
              <Ionicons name="arrow-forward" size={19} color="#07191B" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const postWidth = Math.min(width - 32, 430);
  const postHeight = Math.min(postWidth * (16 / 9), 650);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>DISCOVER MUSIC</Text>
            <Text style={styles.headerTitle}>VerseFlow</Text>
          </View>

          <Pressable
            style={styles.headerButton}
            accessibilityLabel="VerseFlow settings"
          >
            <Ionicons
              name="options-outline"
              size={22}
              color={colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.categoryRow}>
          {(["Global", "Nepali", "Hindi"] as Category[]).map((item) => {
            const selected = category === item;

            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.categoryButton,
                  selected && styles.categoryButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selected && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedContent}
        >
          <View
            style={[
              styles.musicPost,
              { width: postWidth, height: postHeight },
            ]}
          >
            <LinearGradient
              colors={["#254F59", "#17363F", "#101D2C", "#07191B"]}
              locations={[0, 0.35, 0.7, 1]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.backgroundGlow} />

            <View style={styles.postTop}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={13} color={colors.primary} />
                <Text style={styles.aiBadgeText}>VERSEHANA AI</Text>
              </View>

              <Text style={styles.previewLabel}>PREVIEW</Text>
            </View>

            <View style={styles.lyricsContainer}>
              <Text style={styles.lyricsCaption}>A MUSIC MOMENT</Text>

              <Text style={styles.lyricsTitle}>
                Your next favourite{"\n"}music moment.
              </Text>

              <Text style={styles.lyricsSubtitle}>
                Synchronized lyrics will appear here.
              </Text>
            </View>

            <View style={styles.postBottom}>
              <View style={styles.songInformation}>
                <Text style={styles.songName}>Sample music post</Text>
                <Text style={styles.artistName}>
                  Real music content coming soon
                </Text>
                <Text style={styles.categoryLabel}>{category}</Text>
              </View>

              <View style={styles.actionColumn}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => setLiked((value) => !value)}
                >
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={27}
                    color={liked ? "#F07891" : "#FFFFFF"}
                  />
                  <Text style={styles.actionLabel}>
                    {liked ? "Liked" : "Like"}
                  </Text>
                </Pressable>

                <View style={styles.actionButton}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={25}
                    color="#FFFFFF"
                  />
                  <Text style={styles.actionLabel}>Comment</Text>
                </View>

                <View style={styles.actionButton}>
                  <Ionicons
                    name="share-social-outline"
                    size={25}
                    color="#FFFFFF"
                  />
                  <Text style={styles.actionLabel}>Pulse</Text>
                </View>

                <View style={styles.actionButton}>
                  <Ionicons
                    name="mic-outline"
                    size={26}
                    color="#FFFFFF"
                  />
                  <Text style={styles.actionLabel}>Karaoke</Text>
                </View>

                <View style={styles.actionButton}>
                  <Ionicons
                    name="musical-notes-outline"
                    size={25}
                    color="#FFFFFF"
                  />
                  <Text style={styles.actionLabel}>Request</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.previewNotice}>
            This is a design preview. Music playback and interactions will be
            connected in later stages.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  introContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: "center",
  },

  introArtwork: {
    height: 225,
    borderRadius: Radius.xl,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  orbit: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(53,201,188,0.18)",
    borderRadius: 999,
  },

  orbitOne: {
    width: 230,
    height: 230,
  },

  orbitTwo: {
    width: 175,
    height: 175,
  },

  musicIcon: {
    marginBottom: 12,
  },

  artworkLabel: {
    color: "#A3B8B8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 3,
  },

  artworkTitle: {
    color: "#F2FAF9",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 5,
  },

  introContent: {
    gap: 15,
  },

  introTitle: {
    color: colors.text,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  introDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  featureText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },

  disclaimer: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

  exploreButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },

  exploreButtonText: {
    color: "#07191B",
    fontSize: 14,
    fontWeight: "800",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 13,
  },

  headerEyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.7,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "800",
    marginTop: 2,
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 13,
  },

  categoryButton: {
    paddingHorizontal: 19,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    backgroundColor: colors.backgroundElement,
  },

  categoryButtonActive: {
    backgroundColor: colors.backgroundSelected,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  categoryText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  categoryTextActive: {
    color: colors.primary,
    fontWeight: "800",
  },

  feedContent: {
    alignItems: "center",
    paddingBottom: 20,
  },

  musicPost: {
    borderRadius: Radius.xl,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: 17,
    backgroundColor: colors.backgroundElement,
  },

  backgroundGlow: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(53,201,188,0.12)",
    top: "25%",
    alignSelf: "center",
  },

  postTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(7,25,27,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.pill,
  },

  aiBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  previewLabel: {
    color: "#D4E4E3",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  lyricsContainer: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 65,
  },

  lyricsCaption: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 13,
  },

  lyricsTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  lyricsSubtitle: {
    color: "#C1D4D3",
    fontSize: 11,
    marginTop: 12,
  },

  postBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  songInformation: {
    flex: 1,
    paddingBottom: 5,
    paddingRight: 8,
  },

  songName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  artistName: {
    color: "#D0DFDE",
    fontSize: 10,
    marginTop: 5,
  },

  categoryLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 8,
  },

  actionColumn: {
    alignItems: "center",
    gap: 17,
  },

  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 48,
  },

  actionLabel: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },

  previewNotice: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 12,
  },
});

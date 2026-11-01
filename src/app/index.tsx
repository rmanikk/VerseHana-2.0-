import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Radius, Spacing } from "@/constants/theme";

const recentSongs = [
  {
    title: "Midnight Dreams",
    artist: "Atmospheric Sounds",
    symbol: "☾",
    color: "#31365F",
  },
  {
    title: "Ocean of Calm",
    artist: "Ambient Collective",
    symbol: "≈",
    color: "#126E78",
  },
  {
    title: "Golden Hour",
    artist: "Daylight",
    symbol: "☼",
    color: "#8B6031",
  },
];

const pulsePosts = [
  {
    user: "maya",
    text: "Rainy evenings always sound better with ambient music.",
  },
  {
    user: "arjun",
    text: "Just discovered a song that feels like a late-night drive.",
  },
];

export default function HomeScreen() {
  const colors = Colors.dark;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.brand, { color: colors.text }]}>
              VerseHana
            </Text>
            <Text style={[styles.caption, { color: colors.textMuted }]}>
              YOUR WORLD, YOUR SOUND
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            style={[
              styles.profileButton,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.profileIcon, { color: colors.primary }]}>
              ♙
            </Text>
          </Pressable>
        </View>

        {/* Welcome */}
        <View style={styles.intro}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            WELCOME TO VERSEHANA
          </Text>

          <Text style={[styles.heading, { color: colors.text }]}>
            Find your{"\n"}next sound.
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Explore music, discover artists, and connect with the community.
          </Text>
        </View>

        {/* Search */}
        <Pressable
          accessibilityRole="button"
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.searchIcon, { color: colors.textMuted }]}>
            ⌕
          </Text>

          <TextInput
            placeholder="Search songs, artists, albums..."
            placeholderTextColor={colors.textMuted}
            style={[styles.searchInput, { color: colors.text }]}
            editable={false}
          />
        </Pressable>

        {/* Your Library */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your library
            </Text>

            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              SIGN IN
            </Text>
          </View>

          <View style={styles.libraryGrid}>
            <Pressable
              style={[
                styles.libraryCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.libraryIcon,
                  { backgroundColor: colors.backgroundSelected },
                ]}
              >
                <Text style={[styles.libraryIconText, { color: colors.primary }]}>
                  ♡
                </Text>
              </View>

              <Text style={[styles.libraryTitle, { color: colors.text }]}>
                Liked songs
              </Text>

              <Text
                style={[
                  styles.libraryDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Save songs you love
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.libraryCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.libraryIcon,
                  { backgroundColor: colors.backgroundSelected },
                ]}
              >
                <Text style={[styles.libraryIconText, { color: colors.cyan }]}>
                  +
                </Text>
              </View>

              <Text style={[styles.libraryTitle, { color: colors.text }]}>
                Playlists
              </Text>

              <Text
                style={[
                  styles.libraryDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Create your own
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.guestNote, { color: colors.textMuted }]}>
            Sign in to save music and build your personal library.
          </Text>
        </View>

        {/* Recently Played */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recently played
            </Text>

            <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
              YOUR HISTORY
            </Text>
          </View>

          <View
            style={[
              styles.emptyHistory,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.historyIcon,
                { backgroundColor: colors.backgroundSelected },
              ]}
            >
              <Text style={[styles.historyIconText, { color: colors.primary }]}>
                ◷
              </Text>
            </View>

            <View style={styles.historyCopy}>
              <Text style={[styles.historyTitle, { color: colors.text }]}>
                Your listening history starts here
              </Text>

              <Text
                style={[
                  styles.historyDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Sign in to keep track of what you listen to.
              </Text>
            </View>
          </View>
        </View>

        {/* Music Moods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your music moods
            </Text>
          </View>

          <View
            style={[
              styles.moodCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.moodVisual}>
              <View
                style={[
                  styles.moodRingOuter,
                  { borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.moodRingInner,
                    {
                      backgroundColor: colors.backgroundSelected,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text style={[styles.moodLock, { color: colors.primary }]}>
                    ◉
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.moodCopy}>
              <Text style={[styles.moodTitle, { color: colors.text }]}>
                Discover your listening patterns
              </Text>

              <Text
                style={[
                  styles.moodDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Once you sign in and search for music, VerseHana can show the
                moods behind your recent searches.
              </Text>

              <Text style={[styles.moodHint, { color: colors.primary }]}>
                PERSONAL INSIGHT
              </Text>
            </View>
          </View>
        </View>

        {/* Pulse */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Pulse
              </Text>

              <Text
                style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
              >
                What the community is feeling
              </Text>
            </View>

            <Text style={[styles.sectionHint, { color: colors.primary }]}>
              SEE ALL
            </Text>
          </View>

          <View style={styles.pulseList}>
            {pulsePosts.map((post) => (
              <Pressable
                key={post.user}
                style={[
                  styles.pulseCard,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.pulseAvatar,
                    { backgroundColor: colors.backgroundSelected },
                  ]}
                >
                  <Text style={[styles.pulseAvatarText, { color: colors.primary }]}>
                    {post.user.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.pulseContent}>
                  <Text style={[styles.pulseUser, { color: colors.text }]}>
                    @{post.user}
                  </Text>

                  <Text
                    style={[styles.pulseText, { color: colors.textSecondary }]}
                  >
                    {post.text}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.pulseGuestNote, { color: colors.textMuted }]}>
            You can explore Pulse as a guest. Sign in to post and interact.
          </Text>
        </View>

        {/* Guest CTA */}
        <View
          style={[
            styles.accountCard,
            {
              backgroundColor: colors.backgroundSelected,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.accountTitle, { color: colors.text }]}>
            Make VerseHana yours.
          </Text>

          <Text
            style={[
              styles.accountDescription,
              { color: colors.textSecondary },
            ]}
          >
            Create an account to listen, save music, build playlists, and
            participate in Pulse.
          </Text>

          <View style={styles.accountActions}>
            <Pressable
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.primaryButtonText}>Create account</Text>
            </Pressable>

            <Pressable
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.backgroundElement,
                },
              ]}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: colors.text },
                ]}
              >
                Log in
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          EXPLORE FREELY. LISTEN AND PARTICIPATE AS A MEMBER.
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
    paddingBottom: 48,
    gap: Spacing.four,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  brand: {
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  caption: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 3,
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  profileIcon: {
    fontSize: 19,
  },

  intro: {
    paddingTop: Spacing.two,
    gap: 8,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
  },

  heading: {
    fontSize: 40,
    lineHeight: 45,
    fontWeight: "800",
    letterSpacing: -1.7,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 520,
  },

  searchContainer: {
    minHeight: 54,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },

  searchIcon: {
    fontSize: 25,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  section: {
    gap: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  sectionHint: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  libraryGrid: {
    flexDirection: "row",
    gap: 10,
  },

  libraryCard: {
    flex: 1,
    minHeight: 132,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-between",
  },

  libraryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  libraryIconText: {
    fontSize: 21,
    fontWeight: "700",
  },

  libraryTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
  },

  libraryDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  guestNote: {
    fontSize: 11,
    lineHeight: 17,
  },

  emptyHistory: {
    minHeight: 100,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  historyIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  historyIconText: {
    fontSize: 21,
  },

  historyCopy: {
    flex: 1,
    gap: 4,
  },

  historyTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  historyDescription: {
    fontSize: 11,
    lineHeight: 16,
  },

  moodCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  moodVisual: {
    width: 108,
    height: 108,
    alignItems: "center",
    justifyContent: "center",
  },

  moodRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  moodRingInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  moodLock: {
    fontSize: 22,
  },

  moodCopy: {
    flex: 1,
    gap: 7,
  },

  moodTitle: {
    fontSize: 15,
    fontWeight: "800",
  },

  moodDescription: {
    fontSize: 11,
    lineHeight: 17,
  },

  moodHint: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 2,
  },

  pulseList: {
    gap: 10,
  },

  pulseCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },

  pulseAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  pulseAvatarText: {
    fontSize: 14,
    fontWeight: "800",
  },

  pulseContent: {
    flex: 1,
    gap: 4,
  },

  pulseUser: {
    fontSize: 12,
    fontWeight: "800",
  },

  pulseText: {
    fontSize: 12,
    lineHeight: 18,
  },

  pulseGuestNote: {
    fontSize: 11,
    lineHeight: 17,
  },

  accountCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: 20,
    gap: 9,
  },

  accountTitle: {
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  accountDescription: {
    fontSize: 12,
    lineHeight: 18,
  },

  accountActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 7,
  },

  primaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  secondaryButton: {
    minWidth: 90,
    minHeight: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  secondaryButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 4,
  },
});
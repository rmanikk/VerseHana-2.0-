import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Radius } from "@/constants/theme";

const colors = Colors.dark;

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.brand}>VERSEHANA</Text>

            <Text style={styles.greeting}>Good evening.</Text>

            <Text style={styles.greetingSubtitle}>
              What would you like to hear?
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <Text style={styles.profileIcon}>♙</Text>
          </Pressable>
        </View>

        {/* Search */}
        <Pressable
          style={styles.searchBar}
          accessibilityRole="button"
          accessibilityLabel="Search music"
        >
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            editable={false}
            placeholder="Songs, artists, albums..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </Pressable>

        {/* Your Library */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your library</Text>

          <View style={styles.libraryRow}>
            <Pressable style={styles.libraryCard}>
              <View style={[styles.libraryIcon, styles.likedIcon]}>
                <Text style={styles.libraryIconText}>♡</Text>
              </View>

              <Text style={styles.libraryText}>Liked songs</Text>
            </Pressable>

            <Pressable style={styles.libraryCard}>
              <View style={[styles.libraryIcon, styles.playlistIcon]}>
                <Text style={styles.libraryIconText}>☷</Text>
              </View>

              <Text style={styles.libraryText}>Playlists</Text>
            </Pressable>
          </View>
        </View>

        {/* Recently Played */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently played</Text>

            <Pressable>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.recentRow}>
            <GuestArtwork color="#7E4B5A" symbol="◉" />
            <GuestArtwork color="#315D78" symbol="◉" />
            <GuestArtwork color="#59457E" symbol="◉" />
          </View>

          <View style={styles.recentLabels}>
            <View style={styles.recentLabel}>
              <Text style={styles.songTitle}>Recently played</Text>
              <Text style={styles.artistName}>Sign in to see your history</Text>
            </View>

            <View style={styles.recentLabel}>
              <Text style={styles.songTitle}>Your music</Text>
              <Text style={styles.artistName}>Personal history</Text>
            </View>

            <View style={styles.recentLabel}>
              <Text style={styles.songTitle}>Your history</Text>
              <Text style={styles.artistName}>Available after sign in</Text>
            </View>
          </View>
        </View>

        {/* Music Moods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Your music moods</Text>

              <Text style={styles.sectionDescription}>
                What your recent searches say about your taste
              </Text>
            </View>

            <Text style={styles.historyIcon}>◷</Text>
          </View>

          <View style={styles.moodCard}>
            <Text style={styles.moodTitle}>Search interests by mood</Text>

            <Text style={styles.moodDescription}>
              Personal insights require search history.
            </Text>

            <View style={styles.chartArea}>
              <View style={styles.donut}>
                <View style={styles.donutCenter}>
                  <Text style={styles.donutCenterText}>SIGN IN</Text>
                </View>
              </View>
            </View>

            <View style={styles.legend}>
              <MoodLegend color="#4E9AF0" label="Calm" />
              <MoodLegend color="#F08A58" label="Energy" />
              <MoodLegend color="#69C57D" label="Focus" />
              <MoodLegend color="#F6C84C" label="Sleep" />
            </View>

            <Text style={styles.chartFooter}>
              Your chart will develop as you search for music.
            </Text>
          </View>
        </View>

        {/* Pulse */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Pulse</Text>

              <Text style={styles.sectionDescription}>
                Discover what the world is listening to.
              </Text>
            </View>

            <View style={styles.communityBadge}>
              <Text style={styles.communityText}>Global community</Text>
            </View>
          </View>

          <Pressable style={styles.pulseCard}>
            <View style={styles.pulseIcon}>
              <Text style={styles.pulseIconText}>♪</Text>
            </View>

            <View style={styles.pulseContent}>
              <Text style={styles.pulseTitle}>Community activity</Text>

              <Text style={styles.pulseSubtitle}>
                Songs, thoughts and discoveries
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        {/* Mini Player */}
        <View style={styles.miniPlayer}>
          <View style={styles.miniPlayerIcon}>
            <Text style={styles.miniPlayerIconText}>♫</Text>
          </View>

          <View style={styles.miniPlayerContent}>
            <Text style={styles.miniPlayerTitle}>Nothing playing</Text>

            <Text style={styles.miniPlayerSubtitle}>
              Your mini-player will appear here
            </Text>
          </View>

          <Text style={styles.miniPlayerAction}>◉</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GuestArtwork({ color, symbol }: { color: string; symbol: string }) {
  return (
    <View style={[styles.artwork, { backgroundColor: color }]}>
      <Text style={styles.artworkSymbol}>{symbol}</Text>
    </View>
  );
}

function MoodLegend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />

      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /*
   * Mobile-first container.
   *
   * On a real phone this simply fills the screen.
   * On web it prevents the Home page from stretching
   * across the entire desktop browser.
   */
  scrollView: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: colors.background,
  },

  content: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
  },

  /* Header */

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  headerText: {
    flex: 1,
  },

  brand: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 2,
  },

  greeting: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "800",
    letterSpacing: -0.6,
  },

  greetingSubtitle: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },

  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#123B3E",
    alignItems: "center",
    justifyContent: "center",
  },

  profileIcon: {
    color: colors.primary,
    fontSize: 18,
  },

  /* Search */

  searchBar: {
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.backgroundElement,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 19,
  },

  searchIcon: {
    color: colors.textMuted,
    fontSize: 21,
    marginRight: 7,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    paddingVertical: 0,
  },

  /* Sections */

  section: {
    marginBottom: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  sectionDescription: {
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
  },

  seeAll: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 3,
  },

  /* Library */

  libraryRow: {
    flexDirection: "row",
    gap: 7,
  },

  libraryCard: {
    flex: 1,
    height: 48,
    borderRadius: 7,
    backgroundColor: colors.backgroundElement,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
  },

  libraryIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  likedIcon: {
    backgroundColor: "#1C5B57",
  },

  playlistIcon: {
    backgroundColor: "#315B70",
  },

  libraryIconText: {
    color: "#DDF9F5",
    fontSize: 17,
    fontWeight: "700",
  },

  libraryText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "600",
  },

  /* Recently played */

  recentRow: {
    flexDirection: "row",
    gap: 8,
  },

  artwork: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 110,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  artworkSymbol: {
    color: "#E8F5F4",
    fontSize: 24,
  },

  recentLabels: {
    flexDirection: "row",
    gap: 8,
    marginTop: 5,
  },

  recentLabel: {
    flex: 1,
  },

  songTitle: {
    color: colors.text,
    fontSize: 9,
    fontWeight: "700",
  },

  artistName: {
    color: colors.textMuted,
    fontSize: 7,
    marginTop: 2,
    lineHeight: 10,
  },

  /* Music moods */

  moodCard: {
    backgroundColor: colors.backgroundElement,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 9,
  },

  moodTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },

  moodDescription: {
    color: colors.textSecondary,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
  },

  historyIcon: {
    color: colors.textMuted,
    fontSize: 17,
  },

  chartArea: {
    height: 155,
    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * The ring is deliberately only visual for the guest state.
   * No percentages are presented as real user data.
   */
  donut: {
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 20,
    borderTopColor: "#4E9AF0",
    borderRightColor: "#69C57D",
    borderBottomColor: "#F08A58",
    borderLeftColor: "#F6C84C",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "25deg" }],
  },

  donutCenter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },

  donutCenterText: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    transform: [{ rotate: "-25deg" }],
  },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    columnGap: 16,
    rowGap: 5,
    marginBottom: 7,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  legendText: {
    color: colors.textMuted,
    fontSize: 8,
  },

  chartFooter: {
    color: colors.textMuted,
    fontSize: 7,
    textAlign: "center",
  },

  /* Pulse */

  communityBadge: {
    backgroundColor: "#123B35",
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  communityText: {
    color: colors.primary,
    fontSize: 7,
    fontWeight: "700",
  },

  pulseCard: {
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: colors.backgroundElement,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  pulseIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#214A4C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  pulseIconText: {
    color: colors.primary,
    fontSize: 17,
  },

  pulseContent: {
    flex: 1,
  },

  pulseTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },

  pulseSubtitle: {
    color: colors.textMuted,
    fontSize: 8,
    marginTop: 2,
  },

  arrow: {
    color: colors.textSecondary,
    fontSize: 20,
    marginLeft: 8,
  },

  /* Mini player */

  miniPlayer: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: colors.backgroundElement,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
  },

  miniPlayerIcon: {
    width: 34,
    height: 34,
    borderRadius: 7,
    backgroundColor: "#173B3E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  miniPlayerIconText: {
    color: colors.primary,
    fontSize: 17,
  },

  miniPlayerContent: {
    flex: 1,
  },

  miniPlayerTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },

  miniPlayerSubtitle: {
    color: colors.textMuted,
    fontSize: 8,
    marginTop: 2,
  },

  miniPlayerAction: {
    color: colors.primary,
    fontSize: 15,
  },
});

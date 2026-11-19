
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Radius, Spacing } from "@/constants/theme";
import { router } from "expo-router";

const colors = Colors.dark;

const librarySections = [
  {
    id: "liked",
    title: "Liked",
    description: "Your favourite songs and VerseFlows",
    icon: "heart" as const,
    color: "#35C9BC",
    background: "#174442",
  },
  {
    id: "playlists",
    title: "Playlists",
    description: "Your personal song collections",
    icon: "list" as const,
    color: "#8DC8F5",
    background: "#203B56",
  },
  {
    id: "artists",
    title: "Artists",
    description: "Artists you follow",
    icon: "mic" as const,
    color: "#D6A8ED",
    background: "#493653",
  },
  {
    id: "recently-played",
    title: "Recently Played",
    description: "Songs and VerseFlows you've played",
    icon: "time" as const,
    color: "#F3CB83",
    background: "#514125",
  },
];

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return librarySections;

    return librarySections.filter(
      (section) =>
        section.title.toLowerCase().includes(query) ||
        section.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  
const handleSectionPress = (title: string) => {
  if (title === "Liked") {
    router.push("/(tabs)/library/liked");
    return;
  }

  if (title === "Playlists") {
    router.push("/(tabs)/library/playlists");
    return;
  }

  if (title === "Artists") {
    router.push("/(tabs)/library/artists");
    return;
  }

  if (title === "Recently Played") {
    router.push("/(tabs)/library/recently-played");
    return;
  }

  Alert.alert(
    title,
    `The ${title} page will be built in the next Library steps.`
  );
};

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>VERSEHANA</Text>
          <Text style={styles.title}>Your Library</Text>
          <Text style={styles.subtitle}>
            Your music. Your collection.
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons
            name="library"
            size={25}
            color={colors.primary}
          />
        </View>
      </View>

      {/* LIBRARY SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textMuted}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search your Library..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCorrect={false}
        />

        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery("")}
            hitSlop={10}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {/* COLLECTIONS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Collection</Text>
        <Text style={styles.sectionCaption}>
          {filteredSections.length} sections
        </Text>
      </View>

      <View style={styles.collectionCard}>
        {filteredSections.map((section, index) => (
          <View key={section.id}>
            <Pressable
              style={({ pressed }) => [
                styles.collectionRow,
                pressed && styles.rowPressed,
              ]}
              onPress={() => handleSectionPress(section.title)}
            >
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: section.background },
                ]}
              >
                <Ionicons
                  name={section.icon}
                  size={23}
                  color={section.color}
                />
              </View>

              <View style={styles.sectionInfo}>
                <Text style={styles.rowTitle}>
                  {section.title}
                </Text>
                <Text style={styles.rowDescription}>
                  {section.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </Pressable>

            {index < filteredSections.length - 1 && (
              <View style={styles.divider} />
            )}
          </View>
        ))}

        {filteredSections.length === 0 && (
          <View style={styles.emptySearch}>
            <Ionicons
              name="search-outline"
              size={28}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>
              No sections found
            </Text>
            <Text style={styles.emptyDescription}>
              Try another search term.
            </Text>
          </View>
        )}
      </View>

      {/* PLAYLIST SHORTCUT */}
      <Pressable
        style={({ pressed }) => [
          styles.createPlaylistCard,
          pressed && styles.rowPressed,
        ]}
        onPress={() => router.push("/(tabs)/library/playlists")}
      >
        <View style={styles.createIcon}>
          <Ionicons
            name="add"
            size={25}
            color={colors.background}
          />
        </View>

        <View style={styles.createText}>
          <Text style={styles.createTitle}>
            Create a Playlist
          </Text>
          <Text style={styles.createDescription}>
            Bring your favourite songs together.
          </Text>
        </View>

        <Ionicons
          name="arrow-forward"
          size={19}
          color={colors.primary}
        />
      </Pressable>

      <Text style={styles.footerText}>
        A space for everything you love listening to.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginBottom: 7,
  },

  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 5,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  searchContainer: {
    height: 54,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 30,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 0,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },

  sectionCaption: {
    color: colors.textMuted,
    fontSize: 12,
  },

  collectionCard: {
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Radius.xl,
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  collectionRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 12,
  },

  rowPressed: {
    opacity: 0.72,
  },

  sectionIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionInfo: {
    flex: 1,
    gap: 5,
  },

  rowTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },

  rowDescription: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 62,
  },

  emptySearch: {
    alignItems: "center",
    paddingVertical: 35,
    gap: 9,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },

  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  createPlaylistCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 16,
    borderRadius: Radius.xl,
    backgroundColor: "#102F30",
    borderWidth: 1,
    borderColor: "#28615D",
  },

  createIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  createText: {
    flex: 1,
    gap: 4,
  },

  createTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },

  createDescription: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  footerText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 25,
  },
});

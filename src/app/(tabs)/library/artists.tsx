
import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors, Radius } from "@/constants/theme";

const colors = Colors.dark;

type Artist = {
  id: string;
  name: string;
  genre: string;
  initials: string;
  color: string;
};

const initialArtists: Artist[] = [];

export default function ArtistsScreen() {
  const [artists, setArtists] = useState<Artist[]>(initialArtists);

  const unfollowArtist = (artist: Artist) => {
    Alert.alert(
      "Unfollow artist?",
      `Remove ${artist.name} from your followed artists?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unfollow",
          style: "destructive",
          onPress: () =>
            setArtists((current) =>
              current.filter((item) => item.id !== artist.id)
            ),
        },
      ]
    );
  };

  const renderArtist = ({ item }: { item: Artist }) => (
    <View style={styles.artistRow}>
      <Pressable
        style={styles.artistMain}
        onPress={() =>
          Alert.alert(
            item.name,
            "Artist profile navigation will be connected later."
          )
        }
      >
        <View
          style={[
            styles.artistAvatar,
            { backgroundColor: item.color },
          ]}
        >
          <Text style={styles.artistInitials}>
            {item.initials}
          </Text>
        </View>

        <View style={styles.artistInfo}>
          <Text style={styles.artistName}>{item.name}</Text>
          <Text style={styles.artistGenre}>{item.genre}</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => unfollowArtist(item)}
        style={styles.followingButton}
      >
        <Text style={styles.followingText}>Following</Text>
        <Ionicons
          name="checkmark"
          size={15}
          color={colors.primary}
        />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Artists</Text>
          <Text style={styles.subtitle}>
            The artists you follow.
          </Text>
        </View>
      </View>

      {/* SUMMARY */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>
          Followed Artists
        </Text>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {artists.length}
          </Text>
        </View>
      </View>

      {/* ARTIST LIST */}
      {artists.length > 0 ? (
        <FlatList
          data={artists}
          keyExtractor={(item) => item.id}
          renderItem={renderArtist}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="mic-outline"
              size={35}
              color={colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No followed artists yet
          </Text>

          <Text style={styles.emptyDescription}>
            When you follow artists in VerseHana, they'll appear here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    gap: 14,
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    gap: 4,
  },

  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    marginBottom: 15,
  },

  summaryTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },

  countBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: colors.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },

  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 35,
  },

  artistRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  artistMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  artistAvatar: {
    width: 53,
    height: 53,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },

  artistInitials: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  artistInfo: {
    flex: 1,
    gap: 5,
  },

  artistName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },

  artistGenre: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  followingButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: "#174442",
  },

  followingText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 50,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 25,
    backgroundColor: "#174442",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 9,
  },

  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 275,
  },
});

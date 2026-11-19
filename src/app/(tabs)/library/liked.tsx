
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors, Radius } from "@/constants/theme";

const colors = Colors.dark;

type LikedType = "songs" | "verseflows";

export default function LikedScreen() {
  const [activeTab, setActiveTab] = useState<LikedType>("songs");

  const isSongs = activeTab === "songs";

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
          <Text style={styles.title}>Liked</Text>
          <Text style={styles.subtitle}>
            Everything you love, in one place.
          </Text>
        </View>
      </View>

      {/* COLLECTION SWITCHER */}
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setActiveTab("songs")}
          style={[
            styles.tab,
            isSongs && styles.activeTab,
          ]}
        >
          <Ionicons
            name="musical-notes"
            size={17}
            color={isSongs ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              isSongs && styles.activeTabText,
            ]}
          >
            Songs
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("verseflows")}
          style={[
            styles.tab,
            !isSongs && styles.activeTab,
          ]}
        >
          <Ionicons
            name="play-circle"
            size={17}
            color={!isSongs ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              !isSongs && styles.activeTabText,
            ]}
          >
            VerseFlows
          </Text>
        </Pressable>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.collectionHeader}>
          <View>
            <Text style={styles.collectionTitle}>
              {isSongs ? "Liked Songs" : "Liked VerseFlows"}
            </Text>
            <Text style={styles.collectionSubtitle}>
              {isSongs
                ? "Songs you've saved with a like"
                : "VerseFlows you've saved with a like"}
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>0</Text>
          </View>
        </View>

        {/* EMPTY STATE */}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name={isSongs ? "heart" : "play-circle"}
              size={34}
              color={colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>
            {isSongs
              ? "No liked songs yet"
              : "No liked VerseFlows yet"}
          </Text>

          <Text style={styles.emptyDescription}>
            {isSongs
              ? "When you like a song, it will appear here so you can easily find it again."
              : "When you like a VerseFlow, it will be collected here for you."}
          </Text>
        </View>
      </ScrollView>
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
    marginBottom: 27,
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

  tabs: {
    flexDirection: "row",
    marginHorizontal: 22,
    padding: 5,
    borderRadius: Radius.lg,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 26,
  },

  tab: {
    flex: 1,
    minHeight: 43,
    borderRadius: Radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  activeTab: {
    backgroundColor: "#174442",
  },

  tabText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },

  activeTabText: {
    color: colors.primary,
    fontWeight: "700",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 35,
  },

  collectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  collectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "700",
  },

  collectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
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

  emptyContainer: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 76,
    height: 76,
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
    textAlign: "center",
    marginBottom: 9,
  },

  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 280,
  },
});


import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors, Radius } from "@/constants/theme";

type Tab = "songs" | "verseflows";

export default function RecentlyPlayedScreen() {
  const colors = Colors.dark;
  const [activeTab, setActiveTab] = useState<Tab>("songs");

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: colors.backgroundElement },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>
            Recently Played
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary },
            ]}
          >
            Pick up where you left off
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.tabContainer,
          { backgroundColor: colors.backgroundElement },
        ]}
      >
        <Pressable
          onPress={() => setActiveTab("songs")}
          style={[
            styles.tab,
            activeTab === "songs" && [
              styles.activeTab,
              { backgroundColor: colors.primary },
            ],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "songs" ? "#FFFFFF" : colors.textSecondary },
            ]}
          >
            Songs
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("verseflows")}
          style={[
            styles.tab,
            activeTab === "verseflows" && [
              styles.activeTab,
              { backgroundColor: colors.primary },
            ],
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === "verseflows" ? "#FFFFFF" : colors.textSecondary },
            ]}
          >
            VerseFlows
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyState}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.backgroundElement },
            ]}
          >
            <Ionicons
              name={activeTab === "songs" ? "time-outline" : "albums-outline"}
              size={34}
              color={colors.primary}
            />
          </View>

          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {activeTab === "songs"
              ? "No recently played songs"
              : "No recently played VerseFlows"}
          </Text>

          <Text
            style={[
              styles.emptyDescription,
              { color: colors.textSecondary },
            ]}
          >
            {activeTab === "songs"
              ? "Songs you listen to will appear here."
              : "VerseFlows you explore will appear here."}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 58,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 23,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    padding: 5,
    borderRadius: Radius.lg,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  activeTab: {},
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 9,
    lineHeight: 20,
    maxWidth: 270,
  },
});
